// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'
import React from 'react'

// Suppress HTML output in error messages
configure({
  getElementError: (message, _container) => {
    const error = new Error(message ?? undefined)
    error.name = 'TestingLibraryElementError'
    return error
  },
})

// Make React available globally for JSX
global.React = React
