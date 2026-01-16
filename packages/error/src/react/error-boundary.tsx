'use client'

import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import type { CaptureErrorOptions, CatalogError } from '../types.js'

export interface AppErrorBoundaryProps {
  children: ReactNode
  /** Application name for tagging (required) */
  app: string
  /** Error capture function - import from @repo/error/node, @repo/error/nextjs, or @repo/error/browser */
  captureError: (options: CaptureErrorOptions) => CatalogError
  /** Optional fallback component */
  fallback?: (props: { error: Error; resetErrorBoundary: () => void }) => ReactNode
  /** Optional onReset callback */
  onReset?: () => void
}

interface AppErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary component that captures errors via provided captureError function
 * Platform-agnostic - works with Node.js, Next.js, and Browser Sentry implementations
 */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.captureError({
      code: 'UNEXPECTED_ERROR',
      error,
      label: 'React Error Boundary',
      tags: {
        app: this.props.app,
        component: 'ErrorBoundary',
      },
      data: {
        componentStack: errorInfo.componentStack,
      },
    })
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetErrorBoundary: this.handleReset,
        })
      }

      // Default fallback UI
      return (
        <div role="alert" style={{ padding: '1rem' }}>
          <h2>Something went wrong</h2>
          <p>Something went wrong. Please try again.</p>
          <button onClick={this.handleReset}>Try again</button>
        </div>
      )
    }

    return this.props.children
  }
}
