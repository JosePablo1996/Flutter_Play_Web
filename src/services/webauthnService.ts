// src/services/webauthnService.ts

// ============================================
// CONFIGURACIÓN DE API
// ============================================

// ✅ URL de la API (selecciona automáticamente según entorno)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://flutter-play-api.onrender.com';

// ============================================
// TIPOS PARA WEBAUTHN
// ============================================

export interface PasskeyCredential {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string;
}

export interface PasskeyStatusResponse {
  enabled: boolean;
  count: number;
  credentials: PasskeyCredential[];
}

export interface WebAuthnRegistrationBeginResponse {
  publicKey: {
    challenge: string;
    rp: { name: string; id?: string };
    user: { id: string; name: string; displayName: string };
    pubKeyCredParams: { type: string; alg: number }[];
    authenticatorSelection?: {
      authenticatorAttachment?: string;
      residentKey?: string;
      userVerification?: string;
    };
    timeout?: number;
    attestation?: string;
    excludeCredentials?: { type: string; id: string }[];
  };
}

export interface WebAuthnLoginBeginResponse {
  publicKey: {
    challenge: string;
    rpId?: string;
    allowCredentials?: { type: string; id: string; transports?: string[] }[];
    timeout?: number;
    userVerification?: string;
  };
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Convertir Base64URL a ArrayBuffer
 */
function base64URLToArrayBuffer(base64URL: string): ArrayBuffer {
  const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binaryString = atob(base64 + padding);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Convertir ArrayBuffer a Base64URL
 */
function arrayBufferToBase64URL(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Decodificar el challenge desde Base64URL
 */
function decodeChallenge(challenge: string): ArrayBuffer {
  return base64URLToArrayBuffer(challenge);
}


// ============================================
// SERVICIO DE WEBAUTHN (PASSKEYS)
// ============================================

export const webauthnService = {
  /**
   * Verificar si el navegador soporta WebAuthn
   */
  isSupported: (): boolean => {
    return typeof window !== 'undefined' && 
           typeof window.PublicKeyCredential !== 'undefined';
  },

  /**
   * Obtener el nombre de la plataforma biométrica disponible
   */
  getPlatformName: (): string => {
    if (typeof window === 'undefined') return 'Dispositivo';
    
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('windows')) return 'Windows Hello';
    if (ua.includes('mac')) return 'Touch ID';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'Face ID';
    if (ua.includes('android')) return 'Huella digital';
    return 'Dispositivo';
  },

  /**
   * Iniciar registro de una nueva passkey
   */
  registerPasskey: async (): Promise<{ success: boolean; credentialId?: string; error?: string }> => {
    try {
      if (!webauthnService.isSupported()) {
        throw new Error('WebAuthn no está soportado en este navegador');
      }

      const token = webauthnService.getToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      console.log('🔐 Iniciando registro passkey...');
      console.log(`📡 API_BASE_URL: ${API_BASE_URL}`);

      // Solicitar opciones de registro al backend
      const response = await fetch(`${API_BASE_URL}/api/v1/webauthn/register/begin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al iniciar registro de passkey');
      }

      const options: WebAuthnRegistrationBeginResponse = await response.json();
      
      // Convertir challenge y userId de Base64URL a ArrayBuffer
      const publicKey = {
        ...options.publicKey,
        challenge: decodeChallenge(options.publicKey.challenge),
        user: {
          ...options.publicKey.user,
          id: base64URLToArrayBuffer(options.publicKey.user.id),
        },
        excludeCredentials: options.publicKey.excludeCredentials?.map(cred => ({
          ...cred,
          id: base64URLToArrayBuffer(cred.id),
        })),
      };

      // Crear credencial con la API de WebAuthn
      const credential = await navigator.credentials.create({
        publicKey: publicKey as PublicKeyCredentialCreationOptions,
      });

      if (!credential) {
        throw new Error('No se pudo crear la credencial');
      }

      const publicKeyCredential = credential as PublicKeyCredential;
      const responseData = publicKeyCredential.response as AuthenticatorAttestationResponse;

      // Preparar datos para completar el registro
      const registrationData = {
        id: publicKeyCredential.id,
        type: publicKeyCredential.type,
        response: {
          clientDataJSON: arrayBufferToBase64URL(responseData.clientDataJSON),
          attestationObject: arrayBufferToBase64URL(responseData.attestationObject),
        },
      };

      // Completar registro en el backend
      const completeResponse = await fetch(`${API_BASE_URL}/api/v1/webauthn/register/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!completeResponse.ok) {
        const error = await completeResponse.json();
        throw new Error(error.detail || 'Error al completar registro de passkey');
      }

      const result = await completeResponse.json();
      
      // Disparar evento de cambio de estado
      window.dispatchEvent(new CustomEvent('passkey-status-changed'));
      
      console.log('✅ Passkey registrada exitosamente');
      return { success: true, credentialId: result.credential_id };
    } catch (error) {
      console.error('Error registering passkey:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar passkey';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Autenticar con passkey (requiere email)
   */
  authenticatePasskey: async (email: string): Promise<{ success: boolean; token?: string; error?: string }> => {
    try {
      if (!webauthnService.isSupported()) {
        throw new Error('WebAuthn no está soportado en este navegador');
      }

      console.log('🔐 Iniciando autenticación passkey con email:', email);
      console.log(`📡 API_BASE_URL: ${API_BASE_URL}`);

      // Solicitar opciones de autenticación al backend
      const response = await fetch(`${API_BASE_URL}/api/v1/webauthn/login/begin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al iniciar autenticación con passkey');
      }

      const options: WebAuthnLoginBeginResponse = await response.json();
      
      // Convertir challenge a ArrayBuffer
      const publicKey = {
        ...options.publicKey,
        challenge: decodeChallenge(options.publicKey.challenge),
        allowCredentials: options.publicKey.allowCredentials?.map(cred => ({
          ...cred,
          id: base64URLToArrayBuffer(cred.id),
        })),
      };

      // Autenticar con la API de WebAuthn
      const assertion = await navigator.credentials.get({
        publicKey: publicKey as PublicKeyCredentialRequestOptions,
      });

      if (!assertion) {
        throw new Error('No se pudo autenticar con passkey');
      }

      const publicKeyAssertion = assertion as PublicKeyCredential;
      const responseData = publicKeyAssertion.response as AuthenticatorAssertionResponse;

      // Preparar datos para completar la autenticación
      const authData = {
        id: publicKeyAssertion.id,
        type: publicKeyAssertion.type,
        response: {
          clientDataJSON: arrayBufferToBase64URL(responseData.clientDataJSON),
          authenticatorData: arrayBufferToBase64URL(responseData.authenticatorData),
          signature: arrayBufferToBase64URL(responseData.signature),
          userHandle: responseData.userHandle ? arrayBufferToBase64URL(responseData.userHandle) : null,
        },
      };

      // Completar autenticación en el backend
      const completeResponse = await fetch(`${API_BASE_URL}/api/v1/webauthn/login/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
      });

      if (!completeResponse.ok) {
        const error = await completeResponse.json();
        throw new Error(error.detail || 'Error al completar autenticación con passkey');
      }

      const result = await completeResponse.json();
      
      console.log('✅ Autenticación passkey exitosa');
      return { success: true, token: result.access_token };
    } catch (error) {
      console.error('Error authenticating with passkey:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al autenticar con passkey';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Autenticar con passkey sin email - Funciona en desarrollo con backend local
   */
  authenticatePasskeyWithoutEmail: async (): Promise<{ success: boolean; token?: string; error?: string }> => {
    try {
      if (!webauthnService.isSupported()) {
        throw new Error('WebAuthn no está soportado en este navegador');
      }

      console.log('🔐 Iniciando autenticación passkey sin email...');
      console.log(`📡 API_BASE_URL: ${API_BASE_URL}`);

      // Solicitar opciones de autenticación al backend
      const response = await fetch(`${API_BASE_URL}/api/v1/webauthn/login/begin-without-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al iniciar autenticación con passkey');
      }

      const options: WebAuthnLoginBeginResponse = await response.json();
      
      // Convertir challenge a ArrayBuffer
      const publicKey = {
        ...options.publicKey,
        challenge: decodeChallenge(options.publicKey.challenge),
        allowCredentials: options.publicKey.allowCredentials?.map(cred => ({
          ...cred,
          id: base64URLToArrayBuffer(cred.id),
        })),
      };

      // Autenticar con la API de WebAuthn
      const assertion = await navigator.credentials.get({
        publicKey: publicKey as PublicKeyCredentialRequestOptions,
      });

      if (!assertion) {
        throw new Error('No se pudo autenticar con passkey');
      }

      const publicKeyAssertion = assertion as PublicKeyCredential;
      const responseData = publicKeyAssertion.response as AuthenticatorAssertionResponse;

      // Preparar datos para completar la autenticación
      const authData = {
        id: publicKeyAssertion.id,
        type: publicKeyAssertion.type,
        response: {
          clientDataJSON: arrayBufferToBase64URL(responseData.clientDataJSON),
          authenticatorData: arrayBufferToBase64URL(responseData.authenticatorData),
          signature: arrayBufferToBase64URL(responseData.signature),
          userHandle: responseData.userHandle ? arrayBufferToBase64URL(responseData.userHandle) : null,
        },
      };

      // Completar autenticación en el backend
      const completeResponse = await fetch(`${API_BASE_URL}/api/v1/webauthn/login/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
      });

      if (!completeResponse.ok) {
        const error = await completeResponse.json();
        throw new Error(error.detail || 'Error al completar autenticación con passkey');
      }

      const result = await completeResponse.json();
      
      console.log('✅ Autenticación passkey sin email exitosa');
      return { success: true, token: result.access_token };
    } catch (error) {
      console.error('Error authenticating with passkey without email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al autenticar con passkey';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Obtener el estado de las passkeys del usuario
   */
  getPasskeyStatus: async (): Promise<PasskeyStatusResponse> => {
    try {
      const token = webauthnService.getToken();
      if (!token) {
        return { enabled: false, count: 0, credentials: [] };
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/webauthn/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener estado de passkeys');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting passkey status:', error);
      return { enabled: false, count: 0, credentials: [] };
    }
  },

  /**
   * Eliminar una passkey
   */
  deletePasskey: async (credentialId: string): Promise<boolean> => {
    try {
      const token = webauthnService.getToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/webauthn/credentials/${credentialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar passkey');
      }

      // Disparar evento de cambio de estado
      window.dispatchEvent(new CustomEvent('passkey-status-changed'));
      
      return true;
    } catch (error) {
      console.error('Error deleting passkey:', error);
      return false;
    }
  },

  /**
   * Obtener el token de autenticación
   */
  getToken: (): string | null => {
    return localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('auth_token');
  },
};

export default webauthnService;