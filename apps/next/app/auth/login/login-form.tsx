'use client'

import { useMagicLink, useMagicLinkVerify } from '@repo/react'
import { Button } from '@repo/ui/components/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSeparator,
} from '@repo/ui/components/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@repo/ui/components/input-group'
import { cn } from '@repo/ui/lib/utils'
import { useState } from 'react'
import { z } from 'zod'
import { LoginCodeView } from './login-code-view'

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

const codeSchema = z
  .string()
  .length(6, 'Enter the 6-digit code')
  .regex(/^\d{6}$/, 'Code must be 6 digits')

type LoginFormProps = React.ComponentProps<'form'> & {
  initialError?: string
  callbackUrl?: string
  onSuccess?: () => void
  /** Called when magic link request succeeds, with the email used */
  onMagicLinkSent?: (email: string) => void
  /** Called when code verify succeeds; caller updates tokens and redirects */
  onVerifySuccess?: (tokens: { token: string; refreshToken: string }) => Promise<void>
  /** Optional content for "Or continue with" section (e.g. SIWE/SIWS wallet buttons) */
  extraActions?: React.ReactNode
}

export function LoginForm({
  className,
  initialError,
  callbackUrl,
  onSuccess,
  onMagicLinkSent,
  onVerifySuccess,
  extraActions,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [emailValidationError, setEmailValidationError] = useState<string | null>(
    initialError || null,
  )
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [showCodeEntry, setShowCodeEntry] = useState(false)

  const defaultCallbackUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback/magiclink?callbackURL=/`
      : '/auth/callback/magiclink?callbackURL=/'

  const { mutate: sendMagicLink, isPending: isRequestPending } = useMagicLink({
    onSuccess: (data, variables) => {
      if (data?.ok) {
        setShowCodeEntry(true)
        setCode('')
        setEmailValidationError(null)
        setCatalogError(null)
        setCodeError(null)
        onMagicLinkSent?.(variables.email)
        onSuccess?.()
      }
    },
    onError: error => {
      const errorMessage = error.message || 'Failed to send magic link'
      const errorWithCode = error as Error & { code?: string }
      const isValidationError =
        errorWithCode.code === 'VALIDATION_ERROR' ||
        errorMessage.toLowerCase().includes('validation') ||
        errorMessage.toLowerCase().includes('invalid email') ||
        errorMessage.toLowerCase().includes('email')

      if (isValidationError) {
        setEmailValidationError(errorMessage)
        setCatalogError(null)
      } else {
        setCatalogError('Failed to send magic link. Please try again.')
        setEmailValidationError(null)
      }
    },
  })

  const { mutate: verifyCode, isPending: isVerifyPending } = useMagicLinkVerify({
    onSuccess: async data => {
      setCodeError(null)
      await onVerifySuccess?.({ token: data.token, refreshToken: data.refreshToken })
    },
    onError: error => {
      const body =
        error && typeof error === 'object' && 'body' in error
          ? (error as { body?: { code?: string } }).body
          : undefined
      const code = body?.code
      if (code === 'INVALID_TOKEN' || code === 'EXPIRED_TOKEN')
        setCodeError('Invalid or expired code. Please try again or request a new one.')
      else setCodeError(error.message || 'Verification failed. Please try again.')
    },
  })

  const validateEmail = (emailValue: string): string | null => {
    const result = emailSchema.safeParse(emailValue)
    if (!result.success)
      return result.error.issues[0]?.message || 'Please enter a valid email address'
    return null
  }

  const validateCode = (codeValue: string): string | null => {
    const result = codeSchema.safeParse(codeValue)
    if (!result.success) return result.error.issues[0]?.message || 'Enter the 6-digit code'
    return null
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value)
    if (emailValidationError) setEmailValidationError(null)
    if (catalogError) setCatalogError(null)
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.currentTarget.value.replace(/\D/g, '').slice(0, 6))
    if (codeError) setCodeError(null)
  }

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validationError = validateEmail(email)
    if (validationError) {
      setEmailValidationError(validationError)
      setCatalogError(null)
      return
    }
    setEmailValidationError(null)
    setCatalogError(null)
    sendMagicLink({ email, callbackUrl: callbackUrl || defaultCallbackUrl })
  }

  const handleCodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validationError = validateCode(code)
    if (validationError) {
      setCodeError(validationError)
      return
    }
    setCodeError(null)
    verifyCode({ email, token: code })
  }

  const handleBackToEmail = () => {
    setShowCodeEntry(false)
    setCodeError(null)
    setCode('')
  }

  if (showCodeEntry)
    return (
      <LoginCodeView
        className={className}
        code={code}
        codeError={codeError}
        isVerifyPending={isVerifyPending}
        onCodeChange={handleCodeChange}
        onSubmit={handleCodeSubmit}
        onBackToEmail={handleBackToEmail}
        {...props}
      />
    )

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleEmailSubmit}
      noValidate
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-xl font-heading font-bold md:text-3xl">Welcome to Acme</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to continue
          </p>
        </div>
        <Field>
          <InputGroup data-disabled={isRequestPending}>
            <InputGroupInput
              id="email"
              type="email"
              placeholder="m@example.com"
              aria-label="Email"
              required
              value={email}
              onChange={handleEmailChange}
              disabled={isRequestPending}
              aria-invalid={!!emailValidationError}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="submit"
                size="icon-sm"
                className="cursor-pointer [&_svg]:pointer-events-auto [&_svg]:cursor-pointer [&_span]:cursor-pointer hover:bg-transparent dark:hover:bg-transparent"
                disabled={isRequestPending}
                aria-label={isRequestPending ? 'Sending magic link' : 'Send magic link'}
                aria-busy={isRequestPending}
                data-testid="send-magic-link"
              >
                {isRequestPending ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                    style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                )}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {emailValidationError && (
            <FieldError className="text-center">{emailValidationError}</FieldError>
          )}
        </Field>
        {catalogError && (
          <FieldDescription className="text-center text-destructive">
            {catalogError}
          </FieldDescription>
        )}
        <FieldSeparator>Or continue with</FieldSeparator>
        {extraActions ?? (
          <Field>
            <Button variant="outline" type="button" disabled={isRequestPending}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Login with Google
            </Button>
          </Field>
        )}
      </FieldGroup>
    </form>
  )
}
