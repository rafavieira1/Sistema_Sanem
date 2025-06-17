import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FormFieldProps } from '@/types';

interface ExtendedFormFieldProps extends FormFieldProps {
  id?: string;
  className?: string;
}

export const FormField: React.FC<ExtendedFormFieldProps> = ({
  label,
  error,
  required = false,
  children,
  id,
  className
}) => {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('space-y-2', className)}>
      <Label
        htmlFor={fieldId}
        className={cn(
          'text-sm font-medium text-foreground',
          required && "after:content-['*'] after:ml-0.5 after:text-destructive"
        )}
      >
        {label}
      </Label>
      
      {/* Clone children to add id and error state */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            id: fieldId,
            'aria-invalid': !!error,
            'aria-describedby': error ? `${fieldId}-error` : undefined,
            ...child.props
          });
        }
        return child;
      })}
      
      {error && (
        <p
          id={`${fieldId}-error`}
          className="text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}; 