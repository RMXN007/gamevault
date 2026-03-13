import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center font-medium transition-all rounded-[var(--radius-button)] focus:outline-none";
  
  const variants = {
    primary: "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-md hover:shadow-lg",
    secondary: "bg-[var(--color-bg-secondary)] text-[var(--color-text-main)] hover:bg-[var(--color-border-color)]",
    outline: "border-2 border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[props.size || 'md']} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
