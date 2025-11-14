// Placeholder components for screens that are referenced but not fully implemented yet

export const Button = ({ children, onClick, variant = 'text', disabled = false, ...props }: any) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 16px',
        borderRadius: '4px',
        border: variant === 'contained' ? 'none' : '1px solid #ccc',
        backgroundColor: variant === 'contained' ? '#1976d2' : 'transparent',
        color: variant === 'contained' ? 'white' : '#1976d2',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...props.style
      }}
    >
      {children}
    </button>
  );
};

export default Button;