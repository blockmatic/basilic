import { Type } from '@sinclair/typebox'

const AuthenticatorTransportSchema = Type.Union([
  Type.Literal('ble'),
  Type.Literal('cable'),
  Type.Literal('hybrid'),
  Type.Literal('internal'),
  Type.Literal('nfc'),
  Type.Literal('smart-card'),
  Type.Literal('usb'),
])

const AuthenticatorAssertionResponseJSONSchema = Type.Object({
  clientDataJSON: Type.String(),
  authenticatorData: Type.String(),
  signature: Type.String(),
  userHandle: Type.Optional(Type.String()),
})

export const AuthenticationResponseJSONSchema = Type.Object({
  id: Type.String(),
  rawId: Type.String(),
  response: AuthenticatorAssertionResponseJSONSchema,
  authenticatorAttachment: Type.Optional(
    Type.Union([Type.Literal('platform'), Type.Literal('cross-platform')]),
  ),
  clientExtensionResults: Type.Optional(Type.Any()),
  type: Type.Literal('public-key'),
})

const AuthenticatorAttestationResponseJSONSchema = Type.Object({
  clientDataJSON: Type.String(),
  attestationObject: Type.String(),
  authenticatorData: Type.Optional(Type.String()),
  transports: Type.Optional(Type.Array(AuthenticatorTransportSchema)),
  publicKeyAlgorithm: Type.Optional(Type.Number()),
  publicKey: Type.Optional(Type.String()),
})

export const RegistrationResponseJSONSchema = Type.Object({
  id: Type.String(),
  rawId: Type.String(),
  response: AuthenticatorAttestationResponseJSONSchema,
  authenticatorAttachment: Type.Optional(
    Type.Union([Type.Literal('platform'), Type.Literal('cross-platform')]),
  ),
  clientExtensionResults: Type.Optional(Type.Any()),
  type: Type.Literal('public-key'),
})

const PublicKeyCredentialDescriptorJSONSchema = Type.Object({
  id: Type.String(),
  type: Type.Literal('public-key'),
  transports: Type.Optional(Type.Array(AuthenticatorTransportSchema)),
})

export const PublicKeyCredentialRequestOptionsJSONSchema = Type.Object({
  challenge: Type.String(),
  timeout: Type.Optional(Type.Number()),
  rpId: Type.Optional(Type.String()),
  allowCredentials: Type.Optional(Type.Array(PublicKeyCredentialDescriptorJSONSchema)),
  userVerification: Type.Optional(
    Type.Union([Type.Literal('discouraged'), Type.Literal('preferred'), Type.Literal('required')]),
  ),
  extensions: Type.Optional(Type.Any()),
})

const PublicKeyCredentialUserEntityJSONSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  displayName: Type.String(),
})

const PublicKeyCredentialRpEntitySchema = Type.Object({
  name: Type.String(),
  id: Type.Optional(Type.String()),
})

const PublicKeyCredentialParametersSchema = Type.Object({
  alg: Type.Number(),
  type: Type.Literal('public-key'),
})

const AuthenticatorSelectionCriteriaSchema = Type.Object({
  authenticatorAttachment: Type.Optional(
    Type.Union([Type.Literal('platform'), Type.Literal('cross-platform')]),
  ),
  requireResidentKey: Type.Optional(Type.Boolean()),
  residentKey: Type.Optional(
    Type.Union([Type.Literal('discouraged'), Type.Literal('preferred'), Type.Literal('required')]),
  ),
  userVerification: Type.Optional(
    Type.Union([Type.Literal('discouraged'), Type.Literal('preferred'), Type.Literal('required')]),
  ),
})

export const PublicKeyCredentialCreationOptionsJSONSchema = Type.Object({
  rp: PublicKeyCredentialRpEntitySchema,
  user: PublicKeyCredentialUserEntityJSONSchema,
  challenge: Type.String(),
  pubKeyCredParams: Type.Array(PublicKeyCredentialParametersSchema),
  timeout: Type.Optional(Type.Number()),
  excludeCredentials: Type.Optional(Type.Array(PublicKeyCredentialDescriptorJSONSchema)),
  authenticatorSelection: Type.Optional(AuthenticatorSelectionCriteriaSchema),
  attestation: Type.Optional(
    Type.Union([
      Type.Literal('direct'),
      Type.Literal('enterprise'),
      Type.Literal('indirect'),
      Type.Literal('none'),
    ]),
  ),
  extensions: Type.Optional(Type.Any()),
})
