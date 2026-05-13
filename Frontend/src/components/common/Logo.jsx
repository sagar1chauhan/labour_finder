import React, { forwardRef } from 'react';

/**
 * Centralized Logo Component
 * Usage: <Logo className="h-8 w-auto" />
 * Supports ref for animations
 */
const Logo = forwardRef(({ className = "text-2xl font-bold text-[#9634f7]", iconOnly = false, ...props }, ref) => {
  return (
    <div ref={ref} className={`${className} font-bold tracking-tighter flex items-center justify-center`} {...props}>
      {iconOnly ? 'CC' : 'CivilConnect'}
    </div>
  );
});

Logo.displayName = 'Logo';

export default Logo;
