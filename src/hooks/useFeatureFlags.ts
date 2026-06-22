// src/hooks/useFeatureFlags.ts

/**
 * Tipos de entornos disponibles
 */
export type Environment = 'development' | 'production' | 'test' | 'preview';

/**
 * Configuración de feature flags por entorno
 */
export interface FeatureFlagsConfig {
  passkeyEnabled: boolean;
  debugMode: boolean;
  devTools: boolean;
  experimentalFeatures: boolean;
  earlyAccess: boolean;
  animationsEnabled: boolean;
  glassEffect: boolean;
  dataExport: boolean;
  dataImport: boolean;
  backupCloud: boolean;
  realTimeNotifications: boolean;
  emailAlerts: boolean;
  pushNotifications: boolean;
}

/**
 * Configuración para desarrollo
 */
const developmentConfig: FeatureFlagsConfig = {
  passkeyEnabled: true,
  debugMode: true,
  devTools: true,
  experimentalFeatures: true,
  earlyAccess: true,
  animationsEnabled: true,
  glassEffect: true,
  dataExport: true,
  dataImport: true,
  backupCloud: true,
  realTimeNotifications: true,
  emailAlerts: true,
  pushNotifications: true,
};

/**
 * Configuración para producción
 */
const productionConfig: FeatureFlagsConfig = {
  passkeyEnabled: false,
  debugMode: false,
  devTools: false,
  experimentalFeatures: false,
  earlyAccess: false,
  animationsEnabled: true,
  glassEffect: true,
  dataExport: true,
  dataImport: false,
  backupCloud: true,
  realTimeNotifications: true,
  emailAlerts: true,
  pushNotifications: true,
};

/**
 * Configuración para pruebas
 */
const testConfig: FeatureFlagsConfig = {
  passkeyEnabled: false,
  debugMode: true,
  devTools: true,
  experimentalFeatures: true,
  earlyAccess: false,
  animationsEnabled: false,
  glassEffect: true,
  dataExport: true,
  dataImport: true,
  backupCloud: true,
  realTimeNotifications: false,
  emailAlerts: false,
  pushNotifications: false,
};

/**
 * Configuración para preview
 */
const previewConfig: FeatureFlagsConfig = {
  passkeyEnabled: true,
  debugMode: true,
  devTools: true,
  experimentalFeatures: true,
  earlyAccess: true,
  animationsEnabled: true,
  glassEffect: true,
  dataExport: true,
  dataImport: true,
  backupCloud: true,
  realTimeNotifications: true,
  emailAlerts: true,
  pushNotifications: true,
};

/**
 * Obtener el entorno actual
 */
const getEnvironment = (): Environment => {
  try {
    const mode = (import.meta.env as Record<string, string>).MODE;
    if (mode === 'development') return 'development';
    if (mode === 'production') return 'production';
    if (mode === 'test') return 'test';
    if (mode === 'preview') return 'preview';
    return 'production';
  } catch {
    return 'production';
  }
};

/**
 * Obtener variable de entorno
 */
const getEnvVar = (key: string): string | undefined => {
  try {
    return (import.meta.env as Record<string, string | undefined>)[key];
  } catch {
    return undefined;
  }
};

/**
 * Hook para obtener todas las feature flags
 */
export const useFeatureFlags = (): FeatureFlagsConfig => {
  const environment = getEnvironment();
  const forcePasskey = getEnvVar('VITE_FORCE_PASSKEY') === 'true';
  const forceDebug = getEnvVar('VITE_FORCE_DEBUG') === 'true';
  
  let config: FeatureFlagsConfig;
  
  switch (environment) {
    case 'development':
      config = { ...developmentConfig };
      break;
    case 'production':
      config = { ...productionConfig };
      break;
    case 'test':
      config = { ...testConfig };
      break;
    case 'preview':
      config = { ...previewConfig };
      break;
    default:
      config = { ...productionConfig };
  }
  
  if (forcePasskey) config.passkeyEnabled = true;
  if (forceDebug) config.debugMode = true;
  
  return config;
};

/**
 * Hook para verificar si Passkey está habilitado
 */
export const usePasskeyEnabled = (): boolean => {
  const flags = useFeatureFlags();
  return flags.passkeyEnabled;
};

/**
 * Hook para verificar si el modo debug está activo
 */
export const useDebugMode = (): boolean => {
  const flags = useFeatureFlags();
  return flags.debugMode;
};

/**
 * Hook para verificar una feature flag específica
 */
export const useFeatureFlag = (flag: keyof FeatureFlagsConfig): boolean => {
  const flags = useFeatureFlags();
  return flags[flag];
};

export default useFeatureFlags;