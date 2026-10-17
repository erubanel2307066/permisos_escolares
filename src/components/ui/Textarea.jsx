import { forwardRef, useState, useEffect } from 'react';

const Textarea = forwardRef(({
  label,
  error,
  helperText,
  maxLength = 250,
  showCounter = true,
  className = '',
  textareaClassName = '',
  id,
  ...props
}, ref) => {
  const [charCount, setCharCount] = useState(0);
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;
  const counterId = `${textareaId}-counter`;
  
  const describedBy = [
    error && errorId,
    helperText && !error && helperId,
    showCounter && counterId,
  ].filter(Boolean).join(' ') || undefined;

  useEffect(() => {
    const textarea = ref.current;
    if (textarea) {
      setCharCount(textarea.value.length);
    }
  }, [props.value]);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setCharCount(value.length);
      if (props.onChange) {
        props.onChange(e);
      }
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="label flex justify-between">
          {label}
          {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={`textarea ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${textareaClassName}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        maxLength={maxLength}
        onChange={handleChange}
        {...props}
      />
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
      {showCounter && (
        <p
          id={counterId}
          className={`mt-1.5 text-sm text-right ${charCount > maxLength * 0.9 ? 'text-yellow-600' : 'text-gray-500'} ${charCount >= maxLength ? 'text-red-600' : ''}`}
          aria-live="polite"
        >
          {charCount}/{maxLength}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;