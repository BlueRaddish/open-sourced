import type { StudyCard, StudySet } from '../types'

type CardRow = readonly [term: string, definition: string, note: string]

const createdAt = '2026-08-27T00:00:00.000Z'

function cards(prefix: string, rows: CardRow[]): StudyCard[] {
  return rows.map(([term, definition, note], index) => ({ id: `${prefix}-${String(index + 1).padStart(2, '0')}`, term, definition, note }))
}

function studySet(id: string, title: string, description: string, color: string, rows: CardRow[]): StudySet {
  return {
    id,
    title,
    subject: 'Japanese',
    description,
    color,
    cards: cards(id, rows),
    sources: ['Open SourceED original beginner Japanese examples'],
    createdAt,
    updatedAt: createdAt,
  }
}

export const japaneseSets: StudySet[] = [
  studySet('builtin-ja-hiragana-1', 'Japanese Hiragana: First 15', 'Learn the vowel, K, and S rows of hiragana through simple example words.', '#b95772', [
    ['あ', 'a', 'あさ (asa) — morning'],
    ['い', 'i', 'いぬ (inu) — dog'],
    ['う', 'u', 'うみ (umi) — sea'],
    ['え', 'e', 'えき (eki) — station'],
    ['お', 'o', 'おにぎり (onigiri) — rice ball'],
    ['か', 'ka', 'かさ (kasa) — umbrella'],
    ['き', 'ki', 'き (ki) — tree'],
    ['く', 'ku', 'くるま (kuruma) — car'],
    ['け', 'ke', 'けしゴム (keshigomu) — eraser'],
    ['こ', 'ko', 'こども (kodomo) — child'],
    ['さ', 'sa', 'さかな (sakana) — fish'],
    ['し', 'shi', 'しろ (shiro) — white'],
    ['す', 'su', 'すし (sushi) — sushi'],
    ['せ', 'se', 'せんせい (sensei) — teacher'],
    ['そ', 'so', 'そら (sora) — sky'],
  ]),
  studySet('builtin-ja-katakana-1', 'Japanese Katakana: First 15', 'Practice the vowel, K, and S rows of katakana with common loanwords.', '#6555a3', [
    ['ア', 'a', 'アイス (aisu) — ice cream'],
    ['イ', 'i', 'イギリス (igirisu) — United Kingdom'],
    ['ウ', 'u', 'ウール (ūru) — wool'],
    ['エ', 'e', 'エレベーター (erebētā) — elevator'],
    ['オ', 'o', 'オレンジ (orenji) — orange'],
    ['カ', 'ka', 'カメラ (kamera) — camera'],
    ['キ', 'ki', 'キロ (kiro) — kilogram/kilometer'],
    ['ク', 'ku', 'クラス (kurasu) — class'],
    ['ケ', 'ke', 'ケーキ (kēki) — cake'],
    ['コ', 'ko', 'コーヒー (kōhī) — coffee'],
    ['サ', 'sa', 'サラダ (sarada) — salad'],
    ['シ', 'shi', 'シャツ (shatsu) — shirt'],
    ['ス', 'su', 'スポーツ (supōtsu) — sports'],
    ['セ', 'se', 'セーター (sētā) — sweater'],
    ['ソ', 'so', 'ソファ (sofa) — sofa'],
  ]),
  studySet('builtin-ja-greetings', 'Japanese Greetings & Polite Phrases', 'Useful expressions for meeting people, thanking them, and coming or going.', '#e7a43b', [
    ['おはようございます', 'Good morning', 'Polite; おはよう is the casual form.'],
    ['こんにちは', 'Hello / good afternoon', 'A standard daytime greeting.'],
    ['こんばんは', 'Good evening', 'Used when greeting someone in the evening.'],
    ['おやすみなさい', 'Good night', 'Polite; おやすみ is casual.'],
    ['ありがとうございます', 'Thank you very much', 'Polite present-tense expression of thanks.'],
    ['すみません', 'Excuse me / I am sorry', 'Also useful for politely getting attention.'],
    ['ごめんなさい', 'I am sorry', 'A direct apology; ごめん is more casual.'],
    ['はじめまして', 'Nice to meet you', 'Used when meeting someone for the first time.'],
    ['よろしくお願いします', 'Please treat me favorably', 'Often follows a self-introduction; contextually similar to “pleased to meet you.”'],
    ['いってきます', 'I am leaving and will return', 'Said by the person leaving home or another familiar place.'],
    ['いってらっしゃい', 'Go and come back safely', 'Response to いってきます.'],
    ['ただいま / おかえりなさい', 'I’m home / welcome back', 'A common call-and-response when someone returns home.'],
  ]),
  studySet('builtin-ja-n5-vocabulary', 'Japanese N5 Core Vocabulary', 'A compact mix of beginner nouns, verbs, and adjectives for everyday comprehension.', '#166b68', [
    ['人（ひと）', 'person', '人 can also be read じん or にん in compounds.'],
    ['水（みず）', 'water', 'Example: 水を飲みます — I drink water.'],
    ['食べ物（たべもの）', 'food', 'Literally “eating thing.”'],
    ['本（ほん）', 'book', 'Also used as a counter for long cylindrical objects.'],
    ['学校（がっこう）', 'school', 'The small っ marks a doubled consonant.'],
    ['学生（がくせい）', 'student', '大学生 means university student.'],
    ['先生（せんせい）', 'teacher', 'Also a respectful title for doctors and other experts.'],
    ['友達（ともだち）', 'friend', 'Often written 友だち as well.'],
    ['行く（いく）', 'to go', 'Polite form: 行きます.'],
    ['来る（くる）', 'to come', 'Irregular verb; polite form: 来ます（きます）.'],
    ['食べる（たべる）', 'to eat', 'Polite form: 食べます.'],
    ['飲む（のむ）', 'to drink', 'Polite form: 飲みます.'],
    ['見る（みる）', 'to see / watch', 'Polite form: 見ます.'],
    ['大きい（おおきい）', 'big', 'An い-adjective.'],
    ['小さい（ちいさい）', 'small', 'An い-adjective.'],
  ]),
  studySet('builtin-ja-grammar', 'Japanese Beginner Grammar Patterns', 'Build simple sentences with core particles, polite forms, existence, and tense.', '#3478a6', [
    ['A は B です', 'A is B', 'は marks the topic and is pronounced “wa” here: 私は学生です.'],
    ['〜ですか', 'Turns a polite statement into a question', '学生ですか。— Are you a student?'],
    ['A の B', 'B belonging to or associated with A', '私の本 — my book.'],
    ['〜も', 'also / too', '私も学生です。— I am also a student.'],
    ['〜を', 'Marks the direct object of an action', '水を飲みます。— I drink water.'],
    ['〜に', 'Marks a destination or a specific time', '学校に行きます。— I go to school.'],
    ['〜で', 'Marks where an action takes place', '図書館で勉強します。— I study at the library.'],
    ['A と B', 'A and B / together with', '友達と話します。— I talk with a friend.'],
    ['〜があります', 'There is / I have, for inanimate things', '机の上に本があります。— There is a book on the desk.'],
    ['〜がいます', 'There is, for people and animals', '公園に犬がいます。— There is a dog in the park.'],
    ['〜じゃありません', 'Polite negative: is not', '先生じゃありません。— I am not a teacher.'],
    ['〜でした', 'Polite past: was', '昨日は休みでした。— Yesterday was a day off.'],
  ]),
]
