import type { MagiclinkRequestData, MagiclinkRequestResponse } from '@repo/core'
import { createClient } from '@repo/core'
import type { UseMutationResult } from '@tanstack/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as useMagicLinkModule from '../hooks/use-magic-link'
import { ApiProvider } from '../provider'
import { LoginForm } from './login-form'

// Mock the useMagicLink hook
vi.mock('../hooks/use-magic-link', () => ({
  useMagicLink: vi.fn(),
}))

describe('LoginForm', () => {
  let queryClient: QueryClient
  let mockMutate: ReturnType<typeof vi.fn>
  let mockClient: ReturnType<typeof createClient>
  let capturedOnSuccess:
    | ((
        data: { ok: boolean },
        variables: MagiclinkRequestData['body'],
        onMutateResult: unknown,
        context: unknown,
      ) => void)
    | undefined
  let capturedOnError:
    | ((
        error: Error,
        variables: MagiclinkRequestData['body'],
        onMutateResult: unknown,
        context: unknown,
      ) => void)
    | undefined

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    })
    mockMutate = vi.fn()
    mockClient = createClient({ baseUrl: 'http://localhost:3000' })
    capturedOnSuccess = undefined
    capturedOnError = undefined

    // Setup default mock return value
    // Capture onSuccess and onError callbacks from hook options
    vi.mocked(useMagicLinkModule.useMagicLink).mockImplementation(options => {
      if (options?.onSuccess) capturedOnSuccess = options.onSuccess

      if (options?.onError) capturedOnError = options.onError

      return {
        mutate: mockMutate,
        isPending: false,
        error: null,
        data: undefined,
        isError: false,
        isSuccess: false,
        reset: vi.fn(),
        mutateAsync: vi.fn(),
        status: 'idle',
        failureCount: 0,
        failureReason: null,
        submittedAt: 0,
        variables: undefined,
        context: undefined,
        isPaused: false,
        isIdle: true,
      } as UseMutationResult<MagiclinkRequestResponse, Error, MagiclinkRequestData['body']>
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  function renderLoginForm(initialError?: string, callbackUrl?: string) {
    return render(
      <QueryClientProvider client={queryClient}>
        <ApiProvider client={mockClient}>
          <LoginForm initialError={initialError} callbackUrl={callbackUrl} />
        </ApiProvider>
      </QueryClientProvider>,
    )
  }

  it('should call mutate with email and callbackUrl on form submit', async () => {
    renderLoginForm()

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send magic link/i })

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'test@example.com',
        callbackUrl: expect.any(String),
      })
    })
  })

  it('should use provided callbackUrl prop', async () => {
    renderLoginForm(undefined, 'https://example.com/custom-callback')

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send magic link/i })

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'test@example.com',
        callbackUrl: 'https://example.com/custom-callback',
      })
    })
  })

  it('should display email validation errors below input field using FieldError', async () => {
    renderLoginForm()

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const form = emailInput.closest('form') as HTMLFormElement

    // Remove required attribute to allow any submission
    emailInput.removeAttribute('required')

    // Type invalid email
    await userEvent.type(emailInput, 'invalid-email')
    form.requestSubmit()

    // Wait for validation error to appear
    await waitFor(() => {
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toBeInTheDocument()
      expect(errorElement).toHaveTextContent(/valid email/i)
      expect(errorElement).toHaveAttribute('data-slot', 'field-error')
    })

    // Verify error is below the input (within the same Field component)
    const fieldElement = emailInput.closest('[data-slot="field"]')
    expect(fieldElement).toBeInTheDocument()
    const errorInField = fieldElement?.querySelector('[data-slot="field-error"]')
    expect(errorInField).toBeInTheDocument()
  })

  it('should display API validation errors below input field when error has VALIDATION_ERROR code', async () => {
    const validationError = new Error('Email is required') as Error & { code?: string }
    validationError.code = 'VALIDATION_ERROR'

    renderLoginForm()

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /send magic link/i })

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.click(submitButton)

    // Simulate mutation error by calling captured onError callback
    await act(async () => {
      if (capturedOnError)
        capturedOnError(
          validationError,
          { email: 'test@example.com', callbackUrl: '/' },
          undefined,
          undefined,
        )
    })

    // Wait for error to appear
    await waitFor(() => {
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toBeInTheDocument()
      expect(errorElement).toHaveTextContent(/email is required/i)
    })
  })

  it('should display initialError prop below input field', () => {
    renderLoginForm('Invalid or expired magic link')

    const errorElement = screen.getByRole('alert')
    expect(errorElement).toBeInTheDocument()
    expect(errorElement).toHaveTextContent(/invalid or expired magic link/i)

    // Verify error is below the input field
    const emailInput = screen.getByLabelText(/email/i)
    const fieldElement = emailInput.closest('[data-slot="field"]')
    expect(fieldElement).toBeInTheDocument()
    const errorInField = fieldElement?.querySelector('[data-slot="field-error"]')
    expect(errorInField).toBeInTheDocument()
  })

  it('should display success message below input field when magic link is sent', async () => {
    renderLoginForm()

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /send magic link/i })

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.click(submitButton)

    await act(async () => {
      if (capturedOnSuccess)
        capturedOnSuccess(
          { ok: true },
          { email: 'test@example.com', callbackUrl: '/' },
          undefined,
          undefined,
        )
    })

    // Wait for success message to appear
    const successMessage = await screen.findByText(
      /check your email for the magic link/i,
      {},
      { timeout: 10000 },
    )
    expect(successMessage).toBeInTheDocument()

    // Verify success message is below the input (within the same Field component)
    const currentEmailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const fieldElement = currentEmailInput.closest('[data-slot="field"]')
    expect(fieldElement).toBeInTheDocument()
    expect(fieldElement).toHaveTextContent(/check your email for the magic link/i)

    // Verify email input is cleared
    expect(currentEmailInput.value).toBe('')
  })

  it('should show pending state when mutation is in progress', async () => {
    vi.mocked(useMagicLinkModule.useMagicLink).mockImplementation(options => {
      if (options?.onSuccess) capturedOnSuccess = options.onSuccess

      if (options?.onError) capturedOnError = options.onError

      return {
        mutate: mockMutate,
        isPending: true,
        error: null,
        data: undefined,
        isError: false,
        isSuccess: false,
        reset: vi.fn(),
        mutateAsync: vi.fn(),
        status: 'pending',
        failureCount: 0,
        failureReason: null,
        submittedAt: Date.now(),
        variables: { email: 'test@example.com', callbackUrl: '/' },
        context: undefined,
        isPaused: false,
        isIdle: false,
      } as UseMutationResult<MagiclinkRequestResponse, Error, MagiclinkRequestData['body']>
    })

    renderLoginForm()

    const submitButton = screen.getByRole('button', { name: /sending/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
})
