import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiAlertCircle, FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi'

const VARIANTS = {
  success: {
    icon: <FiCheckCircle className="w-5 h-5" />,
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500',
  },
  error: {
    icon: <FiXCircle className="w-5 h-5" />,
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: <FiAlertCircle className="w-5 h-5" />,
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-500',
  },
  info: {
    icon: <FiInfo className="w-5 h-5" />,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
  },
}

const Alert = ({ 
  type = 'info', 
  message, 
  title, 
  onClose, 
  autoClose = false, 
  autoCloseTime = 5000,
  showIcon = true,
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const variant = VARIANTS[type] || VARIANTS.info
  
  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          onClose && onClose()
        }, 300)
      }, autoCloseTime)
      
      return () => clearTimeout(timer)
    }
  }, [autoClose, autoCloseTime, isVisible, onClose])
  
  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose && onClose()
    }, 300)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`rounded-md border ${variant.bgColor} ${variant.borderColor} p-4 mb-4`}
        >
          <div className="flex">
            {showIcon && (
              <div className={`flex-shrink-0 ${variant.iconColor}`}>
                {variant.icon}
              </div>
            )}
            <div className="ml-3 flex-1">
              {title && (
                <h3 className={`text-sm font-medium ${variant.textColor}`}>
                  {title}
                </h3>
              )}
              <div className={`text-sm ${variant.textColor} ${title ? 'mt-1' : ''}`}>
                {message}
              </div>
            </div>
            {onClose && (
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className={`inline-flex rounded-md ${variant.bgColor} p-1.5 ${variant.textColor} hover:opacity-80 focus:outline-none`}
                  >
                    <span className="sr-only">Dismiss</span>
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Alert