'use client';

import React, { useState } from 'react';

export function AashoraLogo({ variant = 'horizontal', className = '', size = 'md' }) {
  const [imgError, setImgError] = useState(false);

  const heightClasses = {
    sm: 'max-h-8 h-8',
    md: 'max-h-12 h-12',
    lg: 'max-h-16 h-16',
    xl: 'max-h-20 h-20',
    xxl: 'max-h-24 h-24',
  };

  const hClass = heightClasses[size] || 'max-h-12 h-12';

  // Primary path: AASHORA Clinic Management official horizontal logo
  const primarySrc = '/images/aashora-logo-horizontal.png';
  const fallbackSrc = '/images/logo.png';

  return (
    <div className={`inline-flex items-center max-w-full ${className}`}>
      <img
        src={imgError ? fallbackSrc : primarySrc}
        alt="AASHORA Clinic Management Logo"
        className={`${hClass} w-auto max-w-full object-contain filter drop-shadow-sm`}
        onError={() => setImgError(true)}
      />
    </div>
  );
}

// Re-export alias for backward compatibility
export const SoftycareLogo = AashoraLogo;
