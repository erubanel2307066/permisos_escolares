import { forwardRef } from 'react';

const Checkbox = forwardRef(({
  label,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${checkboxId}-error`;
  
  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className="checkbox"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={checkboxId} className="text-gray-text cursor-pointer select-none">
          {label}
        </label>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;