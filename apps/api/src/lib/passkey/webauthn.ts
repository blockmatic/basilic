import { Type } from "@sinclair/typebox";

const AuthenticatorTransportSchema = Type.Union([
  Type.Literal("ble"),
  Type.Literal("cable"),
  Type.Literal("hybrid"),
  Type.Literal("internal"),
  Type.Literal("nfc"),
  Type.Literal("smart-card"),
  Type.Literal("usb"),
]);

const AuthenticatorAssertionResponseJSONSchema = Type.Object({
  authenticatorData: Type.String(),
  clientDataJSON: Type.String(),
  signature: Type.String(),
  userHandle: Type.Optional(Type.String()),
});

const WebAuthnExtensionsSchema = Type.Optional(
  Type.Record(Type.String(), Type.Unknown())
);

export const AuthenticationResponseJSONSchema = Type.Object({
  authenticatorAttachment: Type.Optional(
    Type.Union([Type.Literal("platform"), Type.Literal("cross-platform")])
  ),
  clientExtensionResults: WebAuthnExtensionsSchema,
  id: Type.String(),
  rawId: Type.String(),
  response: AuthenticatorAssertionResponseJSONSchema,
  type: Type.Literal("public-key"),
});

const AuthenticatorAttestationResponseJSONSchema = Type.Object({
  attestationObject: Type.String(),
  authenticatorData: Type.Optional(Type.String()),
  clientDataJSON: Type.String(),
  publicKey: Type.Optional(Type.String()),
  publicKeyAlgorithm: Type.Optional(Type.Number()),
  transports: Type.Optional(
    Type.Array(AuthenticatorTransportSchema, { maxItems: 7 })
  ),
});

export const RegistrationResponseJSONSchema = Type.Object({
  authenticatorAttachment: Type.Optional(
    Type.Union([Type.Literal("platform"), Type.Literal("cross-platform")])
  ),
  clientExtensionResults: WebAuthnExtensionsSchema,
  id: Type.String(),
  rawId: Type.String(),
  response: AuthenticatorAttestationResponseJSONSchema,
  type: Type.Literal("public-key"),
});

const PublicKeyCredentialDescriptorJSONSchema = Type.Object({
  id: Type.String(),
  transports: Type.Optional(
    Type.Array(AuthenticatorTransportSchema, { maxItems: 7 })
  ),
  type: Type.Literal("public-key"),
});

export const PublicKeyCredentialRequestOptionsJSONSchema = Type.Object({
  allowCredentials: Type.Optional(
    Type.Array(PublicKeyCredentialDescriptorJSONSchema)
  ),
  challenge: Type.String(),
  extensions: WebAuthnExtensionsSchema,
  rpId: Type.Optional(Type.String()),
  timeout: Type.Optional(Type.Number()),
  userVerification: Type.Optional(
    Type.Union([
      Type.Literal("discouraged"),
      Type.Literal("preferred"),
      Type.Literal("required"),
    ])
  ),
});

const PublicKeyCredentialUserEntityJSONSchema = Type.Object({
  displayName: Type.String(),
  id: Type.String(),
  name: Type.String(),
});

const PublicKeyCredentialRpEntitySchema = Type.Object({
  id: Type.Optional(Type.String()),
  name: Type.String(),
});

const PublicKeyCredentialParametersSchema = Type.Object({
  alg: Type.Number(),
  type: Type.Literal("public-key"),
});

const AuthenticatorSelectionCriteriaSchema = Type.Object({
  authenticatorAttachment: Type.Optional(
    Type.Union([Type.Literal("platform"), Type.Literal("cross-platform")])
  ),
  requireResidentKey: Type.Optional(Type.Boolean()),
  residentKey: Type.Optional(
    Type.Union([
      Type.Literal("discouraged"),
      Type.Literal("preferred"),
      Type.Literal("required"),
    ])
  ),
  userVerification: Type.Optional(
    Type.Union([
      Type.Literal("discouraged"),
      Type.Literal("preferred"),
      Type.Literal("required"),
    ])
  ),
});

export const PublicKeyCredentialCreationOptionsJSONSchema = Type.Object({
  attestation: Type.Optional(
    Type.Union([
      Type.Literal("direct"),
      Type.Literal("enterprise"),
      Type.Literal("indirect"),
      Type.Literal("none"),
    ])
  ),
  authenticatorSelection: Type.Optional(AuthenticatorSelectionCriteriaSchema),
  challenge: Type.String(),
  excludeCredentials: Type.Optional(
    Type.Array(PublicKeyCredentialDescriptorJSONSchema)
  ),
  extensions: WebAuthnExtensionsSchema,
  pubKeyCredParams: Type.Array(PublicKeyCredentialParametersSchema),
  rp: PublicKeyCredentialRpEntitySchema,
  timeout: Type.Optional(Type.Number()),
  user: PublicKeyCredentialUserEntityJSONSchema,
});
