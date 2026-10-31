import React from 'react';
import { cn } from '../utils/cn';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      description,
      onCheckedChange,
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const switchId = id || `switch-${Math.random().toString(36).slice(2, 9)}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(e.target.checked);
      }
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <div className={cn('flex items-start gap-3', className)}>
        <div className="relative inline-flex items-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            disabled={disabled}
            role="switch"
            onChange={handleChange}
            className={cn(
              'peer h-6 w-6 cursor-pointer appearance-none rounded-full border-2 transition-all duration-200',
              'bg-white border-neutral-300',
              'checked:bg-primary-main checked:border-primary-main',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:duration-200',
              'peer-checked:after:translate-x-full',
            )}
            {...props}
          />
        </div>
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={switchId}
              className="block text-sm font-medium text-neutral-900 cursor-pointer select-none"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="mt-0.5 text-sm text-neutral-500">{description}</p>
          )}
        </div>
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;