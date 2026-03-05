'use client'

import { Button } from '@repo/ui/components/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSeparator,
} from '@repo/ui/components/field'
import { Input } from '@repo/ui/components/input'
import { cn } from '@repo/ui/lib/utils'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useMagicLink } from '../hooks/use-magic-link'

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

type LoginFormProps = React.ComponentProps<'form'> & {
  initialError?: string
  callbackUrl?: string
  onSuccess?: () => void
  /** Optional content for "Or continue with" section (e.g. SIWE/SIWS wallet buttons) */
  extraActions?: React.ReactNode
}

export function LoginForm({
  className,
  initialError,
  callbackUrl,
  onSuccess,
  extraActions,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [emailValidationError, setEmailValidationError] = useState<string | null>(
    initialError || null,
  )
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Update error when initialError prop changes - syncing prop to state
  // Only update if initialError is actually provided (not undefined)
  useEffect(() => {
    if (initialError !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing prop to state
      setEmailValidationError(initialError || null)
    }
  }, [initialError])

  const defaultCallbackUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback/magiclink?callbackURL=/`
      : '/auth/callback/magiclink?callbackURL=/'

  const { mutate, isPending } = useMagicLink({
    onSuccess: data => {
      if (data?.ok) {
        setIsSuccess(true)
        setEmail('')
        setEmailValidationError(null)
        setCatalogError(null)
        onSuccess?.()
      }
    },
    onError: error => {
      const errorMessage = error.message || 'Failed to send magic link'
      // Check if error has code property indicating validation error
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
        // General error - don't report to Sentry here, let consuming app handle it
        setCatalogError('Failed to send magic link. Please try again.')
        setEmailValidationError(null)
      }
    },
  })

  const validateEmail = (emailValue: string): string | null => {
    const result = emailSchema.safeParse(emailValue)
    if (!result.success) {
      return result.error.issues[0]?.message || 'Please enter a valid email address'
    }
    return null
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value)
    // Clear validation error and success state when user starts typing
    if (emailValidationError) {
      setEmailValidationError(null)
    }
    if (isSuccess) {
      setIsSuccess(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validationError = validateEmail(email)
    if (validationError) {
      setEmailValidationError(validationError)
      setCatalogError(null)
      return
    }
    setEmailValidationError(null)
    setCatalogError(null)
    mutate({ email, callbackUrl: callbackUrl || defaultCallbackUrl })
  }

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit}
      noValidate
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Welcome to Acme</h1>
          <p className="text-muted-foreground text-sm text-balance">Enter your email to continue</p>
        </div>
        <Field>
          {/* <FieldLabel htmlFor="email">Email</FieldLabel> */}
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={handleEmailChange}
            disabled={isPending || isSuccess}
          />
          {emailValidationError && (
            <FieldError className="text-center">{emailValidationError}</FieldError>
          )}
          {isSuccess && (
            <FieldDescription className="text-center !text-green-600 dark:!text-green-400">
              Check your email for the magic link
            </FieldDescription>
          )}
        </Field>
        {catalogError && (
          <FieldDescription className="text-destructive text-center">
            {catalogError}
          </FieldDescription>
        )}
        <Field>
          <Button
            type="submit"
            disabled={isPending || isSuccess}
            data-testid="send-magic-link"
            className="cursor-pointer disabled:cursor-not-allowed"
          >
            {isPending ? 'Sending...' : 'Continue'}
          </Button>
        </Field>
        <FieldSeparator>Or sign in with</FieldSeparator>
        {extraActions ?? (
          <Field>
            <Button variant="outline" type="button" disabled={isPending || isSuccess}>
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
