export const speechPhrases = [
  'bitcoin',
  'ethereum',
  'solana',
  'dogecoin',
  'watchlist',
  'majors',
  'what moved',
  'biggest losers',
] as const

const speechBoost = 3

export type SpeechResult = { isFinal: boolean; 0: { transcript: string } }

export type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

export type SpeechRecognitionInstance = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  processLocally?: boolean
  phrases?: unknown
  start: () => void
  stop: () => void
  onresult: ((event: { results: ArrayLike<SpeechResult> }) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error: string }) => void) | null
}

export function getSpeechRecognitionCtor({
  recognition,
  webkitRecognition,
}: {
  recognition?: SpeechRecognitionCtor
  webkitRecognition?: SpeechRecognitionCtor
}): SpeechRecognitionCtor | undefined {
  return recognition ?? webkitRecognition
}

export function mergeSpeechResults({
  typed,
  sessionFinals,
  interim,
}: {
  typed: string
  sessionFinals: string
  interim: string
}): string {
  const spoken = `${sessionFinals}${interim}`
  if (!spoken) return typed
  if (!typed) return spoken
  if (typed.endsWith(' ') || spoken.startsWith(' ')) return `${typed}${spoken}`
  return `${typed} ${spoken}`
}

export function applySpeechOptions({
  recognition,
  available,
  phraseCtor,
}: {
  recognition: Pick<SpeechRecognitionInstance, 'processLocally' | 'phrases'>
  available?: string
  phraseCtor?: new (phrase: string, boost: number) => unknown
}): void {
  if (available === 'available') recognition.processLocally = true
  if (!phraseCtor) return
  recognition.phrases = speechPhrases.map(phrase => new phraseCtor(phrase, speechBoost))
}

export function transcriptsFromResults({ results }: { results: ArrayLike<SpeechResult> }): {
  instanceFinals: string
  interim: string
} {
  let instanceFinals = ''
  let interim = ''
  for (let index = 0; index < results.length; index++) {
    const result = results[index]
    if (!result) continue
    if (result.isFinal) instanceFinals += result[0]?.transcript ?? ''
    else interim += result[0]?.transcript ?? ''
  }
  return { instanceFinals, interim }
}
