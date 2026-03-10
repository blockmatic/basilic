'use client'

import { Button } from '@repo/ui/components/button'
import { Field, FieldError, FieldGroup } from '@repo/ui/components/field'
import { InputGroup, InputGroupInput } from '@repo/ui/components/input-group'
import { Label } from '@repo/ui/components/label'
import { cn } from '@repo/ui/lib/utils'

type LoginCodeViewProps = {
  className?: string
  code: string
  codeError: string | null
  isVerifyPending: boolean
  onCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: React.FormEventHandler<HTMLFormElement>
  onBackToEmail: () => void
} & Omit<React.ComponentProps<'form'>, 'onSubmit'>

export function LoginCodeView({
  className,
  code,
  codeError,
  isVerifyPending,
  onCodeChange,
  onSubmit,
  onBackToEmail,
  ...props
}: LoginCodeViewProps): React.JSX.Element {
  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={onSubmit}
      noValidate
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-xl font-heading font-bold md:text-3xl">Check your email</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter the login code we sent you
          </p>
        </div>
        <Field>
          <Label htmlFor="login-code">Login code</Label>
          <InputGroup data-disabled={isVerifyPending}>
            <InputGroupInput
              id="login-code"
              data-testid="login-code-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              pattern="\\d*"
              autoComplete="one-time-code"
              placeholder="000000"
              aria-label="Login code"
              value={code}
              disabled={isVerifyPending}
              aria-invalid={!!codeError}
              onChange={onCodeChange}
            />
          </InputGroup>
          {codeError && <FieldError className="text-center">{codeError}</FieldError>}
        </Field>
        <Button
          type="submit"
          data-testid="submit-login-code"
          disabled={isVerifyPending}
          aria-busy={isVerifyPending}
        >
          {isVerifyPending ? 'Verifying…' : 'Submit'}
        </Button>
        <button
          type="button"
          onClick={onBackToEmail}
          className="text-muted-foreground text-sm underline hover:text-foreground"
        >
          Use a different email
        </button>
      </FieldGroup>
    </form>
  )
}
