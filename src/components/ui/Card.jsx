import { forwardRef } from 'react';

const Card = forwardRef(({
  children,
  className = '',
  padded = true,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl shadow-card ${padded ? 'p-5 md:p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;