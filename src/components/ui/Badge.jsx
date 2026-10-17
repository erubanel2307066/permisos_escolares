const Badge = ({ status, children, className = '' }) => {
  const statusStyles = {
    pendiente: 'badge-pending',
    aprobado: 'badge-approved',
    rechazado: 'badge-rejected',
    'pendiente de autorización': 'badge-pending',
  };

  const statusClass = status ? statusStyles[status.toLowerCase()] : '';
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClass} ${className}`}>
      {children || status}
    </span>
  );
};

export default Badge;