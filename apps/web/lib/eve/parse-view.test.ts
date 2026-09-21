import { describe, expect, it } from 'vitest'
import { whoamiViewConfig } from '@/lib/genui'
import { viewConfigFromEvents } from './parse-view'

describe('viewConfigFromEvents', () => {
  it('reads set_view output from action.result', () => {
    const viewConfig = whoamiViewConfig()
    expect(
      viewConfigFromEvents({
        events: [
          {
            type: 'action.result',
            data: {
              result: { kind: 'tool-result', toolName: 'set_view', output: { viewConfig } },
            },
          },
        ],
      }),
    ).toEqual({ viewConfig, honesty: undefined })
  })

  it('ignores other tools', () => {
    expect(
      viewConfigFromEvents({
        events: [
          {
            type: 'action.result',
            data: { result: { kind: 'tool-result', toolName: 'get_markets', output: [] } },
          },
        ],
      }),
    ).toBeNull()
  })
})
