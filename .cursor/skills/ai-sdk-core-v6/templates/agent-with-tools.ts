// Agent class with multiple tools
// AI SDK Core - Agent class for multi-step execution

import { anthropic } from '@ai-sdk/anthropic'
import { logger } from '@repo/utils/logger'
import { Agent, tool } from 'ai'
import { z } from 'zod'

// Create agent with tools
const weatherAgent = new Agent({
  model: anthropic('claude-sonnet-4-5'),
  system: "You are a weather assistant. Always provide temperature in the user's preferred unit.",
  tools: {
    getWeather: tool({
      description: 'Get current weather for a location',
      inputSchema: z.object({
        location: z.string(),
      }),
      execute: async ({ location }) => {
        logger.debug({ location }, '[Tool] Getting weather')
        // Simulate API call
        return {
          location,
          temperature: 72,
          condition: 'sunny',
          humidity: 65,
          unit: 'fahrenheit',
        }
      },
    }),

    convertTemp: tool({
      description: 'Convert temperature between Fahrenheit and Celsius',
      inputSchema: z.object({
        fahrenheit: z.number(),
      }),
      execute: async ({ fahrenheit }) => {
        logger.debug({ fahrenheit }, '[Tool] Converting temperature')
        const celsius = Math.round((((fahrenheit - 32) * 5) / 9) * 10) / 10
        return { celsius }
      },
    }),

    getAirQuality: tool({
      description: 'Get air quality index for a location',
      inputSchema: z.object({
        location: z.string(),
      }),
      execute: async ({ location }) => {
        logger.debug({ location }, '[Tool] Getting air quality')
        // Simulate API call
        return {
          location,
          aqi: 42,
          level: 'good',
          pollutants: {
            pm25: 8,
            pm10: 15,
            o3: 35,
          },
        }
      },
    }),
  },
})

async function main() {
  logger.info('Starting agent conversation')

  const result = await weatherAgent.run({
    messages: [
      {
        role: 'user',
        content:
          'What is the weather in San Francisco? Tell me in Celsius and include air quality.',
      },
    ],
  })

  logger.info({ text: result.text }, 'Agent Response')
  logger.info(
    {
      steps: result.steps,
      toolsUsed: result.toolCalls?.map(tc => tc.toolName).join(', ') || 'none',
    },
    'Execution Summary',
  )
}

main().catch(error => {
  logger.error({ error }, 'Failed to run agent')
  process.exit(1)
})
