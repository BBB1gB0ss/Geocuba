import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  href = '',
  to = '',
  onClick,
  className = '',
  ...props
}) => {
  // Base classes
  const baseClasses = 'rounded-md inline-flex items-center justify-center transition-all focus:outline-none'
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-500 text-dark hover:bg-primary-600 focus:ring-2 focus:ring-primary-200',
    secondary: 'bg-secondary-700 text-white hover:bg-secondary-800 focus:ring-2 focus:ring-secondary-200',
    outline: 'border border-primary-500 text-dark hover:bg-primary-50 focus:ring-2 focus:ring-primary-200',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-200',
  }
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
    xl: 'text-lg px-6 py-3',
  }
  
  // Icon size classes
  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6',
  }
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : ''
  
  // Disabled classes
  const disabledClasses = disabled || loading ? 'opacity-60 cursor-not-allowed' : ''
  
  // Combined classes
  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${widthClasses}
    ${disabledClasses}
    ${className}
  `
  
  // Loading spinner
  const loadingSpinner = (
    <svg 
      className={`animate-spin -ml-1 mr-2 ${iconSizeClasses[size]}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
  
  // Icon with appropriate position
  const iconElement = icon && (
    <span className={`${iconPosition === 'left' ? 'mr-2' : 'ml-2'} ${iconSizeClasses[size]}`}>
      {icon}
    </span>
  )
  
  // Content
  const content = (
    <>
      {loading && loadingSpinner}
      {!loading && icon && iconPosition === 'left' && iconElement}
      {children}
      {!loading && icon && iconPosition === 'right' && iconElement}
    </>
  )

  // Render as link if href is provided
  if (href) {
    return (
      <motion.a
        href={href}
        className={combinedClasses}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {content}
      </motion.a>
    )
  }
  
  // Render as React Router link if to is provided
  if (to) {
    return (
      <motion.div whileTap={{ scale: 0.98 }}>
        <Link
          to={to}
          className={combinedClasses}
          {...props}
        >
          {content}
        </Link>
      </motion.div>
    )
  }
  
  // Render as button
  return (
    <motion.button
      type={type}
      className={combinedClasses}
      disabled={disabled || loading}
      onClick={onClick}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...props}
    >
      {content}
    </motion.button>
  )
}

export default Button