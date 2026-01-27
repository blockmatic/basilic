import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/react'

// Suppress HTML output in error messages
configure({
  getElementError: (message, _container) => {
    const error = new Error(message ?? undefined)
    error.name = 'TestingLibraryElementError'
    return error
  },
})
