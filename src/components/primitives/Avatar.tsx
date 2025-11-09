import React from 'react';
import clsx from 'clsx';
import { getInitials } from '../../utils/common.utils';

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar = React.memo<AvatarProps>(({
  name,
  src,
  size = 'md',
  className,
}) => {
  const sizeStyles = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };
  
  const baseStyles = 'rounded-full flex items-center justify-center bg-primary-500 text-white font-medium overflow-hidden';
  
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={clsx(baseStyles, sizeStyles[size], className)}
      />
    );
  }
  
  return (
    <div
      className={clsx(baseStyles, sizeStyles[size], className)}
      aria-label={name || 'Avatar'}
    >
      {getInitials(name)}
    </div>
  );
});

Avatar.displayName = 'Avatar';

