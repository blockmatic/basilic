import { describe, expect, it } from 'vitest'
import {
  applySpeechOptions,
  getSpeechRecognitionCtor,
  mergeSpeechResults,
  transcriptsFromResults,
} from './recognition'

describe('getSpeechRecognitionCtor', () => {
  it('prefers SpeechRecognition over webkit', () => {
    const recognition = class {} as never
    const webkitRecognition = class {} as never
    expect(getSpeechRecognitionCtor({ recognition, webkitRecognition })).toBe(recognition)
  })

  it('falls back to webkitSpeechRecognition', () => {
    const webkitRecognition = class {} as never
    expect(getSpeechRecognitionCtor({ webkitRecognition })).toBe(webkitRecognition)
  })

  it('returns undefined when both are missing', () => {
    expect(getSpeechRecognitionCtor({})).toBeUndefined()
  })
})

describe('mergeSpeechResults', () => {
  it('keeps typed text when nothing was spoken', () => {
    expect(mergeSpeechResults({ typed: 'hello', sessionFinals: '', interim: '' })).toBe('hello')
  })

  it('uses speech when the box was empty', () => {
    expect(mergeSpeechResults({ typed: '', sessionFinals: 'what moved', interim: '?' })).toBe(
      'what moved?',
    )
  })

  it('inserts a space before dictation after typed text', () => {
    expect(
      mergeSpeechResults({ typed: 'please show', sessionFinals: 'what moved', interim: '' }),
    ).toBe('please show what moved')
  })

  it('does not double the space when typed already ends with one', () => {
    expect(
      mergeSpeechResults({ typed: 'please show ', sessionFinals: 'losers', interim: '' }),
    ).toBe('please show losers')
  })
})

describe('applySpeechOptions', () => {
  it('sets processLocally only when already available', () => {
    const recognition = {}
    applySpeechOptions({ recognition, available: 'available' })
    expect(recognition).toEqual({ processLocally: true })
    const skipped = {}
    applySpeechOptions({ recognition: skipped, available: 'unavailable' })
    expect(skipped).toEqual({})
  })
})

describe('transcriptsFromResults', () => {
  it('splits finals from the interim tail', () => {
    expect(
      transcriptsFromResults({
        results: [
          { isFinal: true, 0: { transcript: 'what ' } },
          { isFinal: false, 0: { transcript: 'moved' } },
        ],
      }),
    ).toEqual({ instanceFinals: 'what ', interim: 'moved' })
  })
})
