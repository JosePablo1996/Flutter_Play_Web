// src/types/webauthn.d.ts
// Declaración de tipos para WebAuthn API

interface PublicKeyCredentialCreationOptions {
  challenge: BufferSource;
  rp: PublicKeyCredentialRpEntity;
  user: PublicKeyCredentialUserEntity;
  pubKeyCredParams: PublicKeyCredentialParameters[];
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  timeout?: number;
  attestation?: AttestationConveyancePreference;
  excludeCredentials?: PublicKeyCredentialDescriptor[];
}

interface PublicKeyCredentialRequestOptions {
  challenge: BufferSource;
  rpId?: string;
  allowCredentials?: PublicKeyCredentialDescriptor[];
  timeout?: number;
  userVerification?: UserVerificationRequirement;
}

interface PublicKeyCredentialDescriptor {
  type: PublicKeyCredentialType;
  id: BufferSource;
  transports?: AuthenticatorTransport[];
}

type PublicKeyCredentialType = 'public-key';
type AuthenticatorTransport = 'usb' | 'nfc' | 'ble' | 'internal' | 'hybrid';
type UserVerificationRequirement = 'required' | 'preferred' | 'discouraged';
type AttestationConveyancePreference = 'none' | 'indirect' | 'direct';
type ResidentKeyRequirement = 'discouraged' | 'preferred' | 'required';