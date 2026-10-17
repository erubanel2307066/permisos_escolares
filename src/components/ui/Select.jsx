import { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  error,
  helperText,
  options = [],
  placeholder = 'Seleccionar...',
  className = '',
  selectClassName = '',
  id,
  ...props
}, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;
  
  const describedBy = [
    error && errorId,
    helperText && !error && helperId,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="label">
          {label}
          {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`select ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${selectClassName}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="mt-1.5 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;