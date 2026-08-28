import type { SpeechSegment } from './speech'
import type { PiperPlus } from 'piper-plus'
import type { Tensor as OrtTensor } from 'onnxruntime-web'

const MODEL_URL = 'https://huggingface.co/ayousanz/piper-plus-tsukuyomi-chan/resolve/main/tsukuyomi-chan-6lang-fp16.onnx'

export type NeuralSpeechPhase = 'loading' | 'generating' | 'playing'
export type NeuralSpeechUpdate = { phase: NeuralSpeechPhase; progress?: number; message: string }

type NeuralLanguage = 'ja' | 'en' | 'zh' | 'es' | 'fr' | 'pt'
type NeuralEngine = PiperPlus
type AudioWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }

let enginePromise: Promise<NeuralEngine> | undefined
let engineUpdate: ((status: NeuralSpeechUpdate) => void) | undefined
let audioContext: AudioContext | undefined
let currentSource: AudioBufferSourceNode | undefined
let speechRun = 0

function audioContextConstructor() {
  return window.AudioContext || (window as AudioWindow).webkitAudioContext
}

async function loadPhonemizer() {
  const wasm = await import('piper-plus/wasm/multilingual')
  await wasm.default()
  return wasm
}

export function neuralLanguage(locale = 'en-US'): NeuralLanguage | undefined {
  const language = locale.toLowerCase().split('-')[0]
  return language === 'ja' || language === 'en' || language === 'zh' || language === 'es' || language === 'fr' || language === 'pt'
    ? language
    : undefined
}

export function neuralLengthScale(rate = .95) {
  return Math.min(1.6, Math.max(.7, 1 / rate))
}

export function neuralSpeechSupported() {
  return typeof window !== 'undefined' && Boolean(audioContextConstructor())
}

export function primeNeuralSpeech() {
  if (!neuralSpeechSupported()) return
  const AudioContextConstructor = audioContextConstructor()
  if (!AudioContextConstructor) return
  audioContext ??= new AudioContextConstructor()
  if (audioContext.state === 'suspended') void audioContext.resume()
}

export function cancelNeuralSpeech() {
  speechRun += 1
  if (currentSource) {
    try { currentSource.stop() } catch { /* already stopped */ }
    currentSource = undefined
  }
}

async function loadEngine(update: (status: NeuralSpeechUpdate) => void) {
  engineUpdate = update
  const report = (status: NeuralSpeechUpdate) => engineUpdate?.(status)
  if (enginePromise) {
    report({ phase: 'loading', message: 'Loading cached neural voice…' })
    return enginePromise
  }

  enginePromise = (async () => {
    report({ phase: 'loading', progress: 0, message: 'Loading speech engine…' })
    const [piper, ort] = await Promise.all([import('piper-plus'), import('onnxruntime-web')])
    const modelManager = new piper.ModelManager({ cachePrefix: 'open-sourced-neural-voice-v1' })
    const { modelData } = await modelManager.loadModel(MODEL_URL, {
      onProgress: ({ percentage }) => report({
        phase: 'loading',
        progress: percentage,
        message: percentage ? `Downloading neural voice… ${percentage}%` : 'Downloading neural voice…',
      }),
    })

    let cachedModelData: ArrayBuffer | undefined = modelData
    const inferenceRuntime = {
      ...ort,
      InferenceSession: {
        create: async (_model: unknown, options?: Parameters<typeof ort.InferenceSession.create>[1]) => {
          if (!cachedModelData) throw new Error('The cached neural voice model is unavailable')
          const session = await ort.InferenceSession.create(cachedModelData, options)
          cachedModelData = undefined
          if (session.inputNames.includes('speaker_embedding')) {
            const originalRun = session.run.bind(session)
            session.run = ((feeds: Record<string, OrtTensor>) => originalRun({
              ...feeds,
              speaker_embedding: feeds.speaker_embedding || new ort.Tensor('float32', new Float32Array(256), [1, 256]),
              speaker_embedding_mask: feeds.speaker_embedding_mask || new ort.Tensor('int64', new BigInt64Array([0n]), [1, 1]),
            })) as typeof session.run
          }
          return session
        },
      },
    }
    return piper.PiperPlus.initialize({
      model: MODEL_URL,
      ort: inferenceRuntime,
      wasmLoader: loadPhonemizer,
      onProgress: ({ progress, message }) => report({
        phase: 'loading',
        progress: Math.round(progress * 100),
        message,
      }),
    } as Parameters<typeof piper.PiperPlus.initialize>[0] & { wasmLoader: () => Promise<unknown> })
  })().catch((error) => {
    enginePromise = undefined
    throw error
  })

  return enginePromise
}

async function playSamples(samples: Float32Array, sampleRate: number, run: number) {
  primeNeuralSpeech()
  if (!audioContext) throw new Error('Web Audio is unavailable')
  if (audioContext.state === 'suspended') await audioContext.resume()
  if (run !== speechRun) return

  const buffer = audioContext.createBuffer(1, samples.length, sampleRate)
  buffer.copyToChannel(new Float32Array(samples), 0)
  const source = audioContext.createBufferSource()
  source.buffer = buffer
  source.connect(audioContext.destination)
  currentSource = source

  await new Promise<void>((resolve) => {
    source.onended = () => {
      if (currentSource === source) currentSource = undefined
      source.disconnect()
      resolve()
    }
    source.start()
  })
}

export async function speakWithNeuralVoice(parts: SpeechSegment[], update: (status: NeuralSpeechUpdate) => void) {
  if (parts.some((part) => !neuralLanguage(part.lang))) throw new Error('This language is not supported by the neural voice')

  cancelNeuralSpeech()
  const run = speechRun
  const engine = await loadEngine(update)
  if (run !== speechRun) return

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index]
    const language = neuralLanguage(part.lang)
    if (!language) throw new Error('This language is not supported by the neural voice')
    update({ phase: 'generating', message: `Preparing audio ${index + 1} of ${parts.length}…` })
    const result = await engine.synthesize(part.text, {
      language,
      lengthScale: neuralLengthScale(part.rate),
    })
    if (run !== speechRun) return
    update({ phase: 'playing', message: `Playing ${index + 1} of ${parts.length}` })
    await playSamples(result.samples, result.sampleRate, run)
    if (run !== speechRun) return
  }
}
