import React from 'react';
import { cn } from '../../utils/cn';

type InputProps = {
  label?: string;
  error?: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = ({
  className,
  label,
  error,
  hint,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-4 py-2.5 rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors",
          {
            "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20": !error,
            "border-red-300 focus:border-red-500 focus:ring-red-500/20 text-red-900": error,
          },
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};