import React from 'react';
import { cn } from '../../utils/cn';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export const Surface: React.FC<Props> = ({ className, padded = true, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-3xl border border-app-border bg-app-surface shadow-sm',
        padded && 'p-5',
        className
      )}
      {...props}
    />
  );
};
