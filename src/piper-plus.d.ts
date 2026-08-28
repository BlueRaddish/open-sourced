declare module 'piper-plus/wasm/multilingual' {
  const initialize: () => Promise<unknown>
  export default initialize
  export class WasmPhonemizer {
    constructor(config: string)
  }
}
