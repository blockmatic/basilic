export { type VerifyPasskeyAuthResult, verifyPasskeyAuth } from './auth.js'
export {
  getWebAuthnOriginFromRequest,
  getWebAuthnRpName,
  isAllowedCallbackOriginScheme,
} from './origin.js'
export {
  AuthenticationResponseJSONSchema,
  PublicKeyCredentialCreationOptionsJSONSchema,
  PublicKeyCredentialRequestOptionsJSONSchema,
  RegistrationResponseJSONSchema,
} from './webauthn.js'
