import React, { forwardRef } from 'react';
import logoImg from '../../assets/images/civilconnectLogo.png';

/**
 * Centralized Logo Component
 * Usage: <Logo className="h-8 w-auto" />
 * Supports ref for animations
 */
const Logo = forwardRef(({ className = "h-10 w-auto", iconOnly = false, ...props }, ref) => {
  if (iconOnly) {
    return (
      <div ref={ref} className={`${className} font-bold tracking-tighter flex items-center justify-center`} {...props}>
        CC
      </div>
    );
  }

  return (
    <img
      ref={ref}
      src={logoImg}
      alt="CivilConnect Logo"
      className={className}
      style={{ objectFit: 'contain' }}
      {...props}
    />
  );
});

Logo.displayName = 'Logo';

export default Logo;
