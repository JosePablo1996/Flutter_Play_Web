// src/components/UI/FeatureFlag.tsx
import React from 'react';
import { useFeatureFlag, type FeatureFlagsConfig } from '../../hooks/useFeatureFlags';

interface FeatureFlagProps {
  name: keyof FeatureFlagsConfig;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureFlag: React.FC<FeatureFlagProps> = ({ 
  name, 
  children, 
  fallback = null 
}) => {
  const isEnabled = useFeatureFlag(name);
  
  if (!isEnabled) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default FeatureFlag;