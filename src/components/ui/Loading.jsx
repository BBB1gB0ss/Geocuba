import { motion } from 'framer-motion'

const LoadingDot = ({ delay }) => (
  <motion.div
    className="w-3 h-3 rounded-full bg-primary-500"
    initial={{ scale: 0.5, opacity: 0.3 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.5, opacity: 0.3 }}
    transition={{
      duration: 0.6,
      repeat: Infinity,
      repeatType: 'reverse',
      delay
    }}
  />
)

const Loading = ({ message = 'Cargando...' }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-50">
      <div className="flex space-x-2 mb-4">
        <LoadingDot delay={0} />
        <LoadingDot delay={0.2} />
        <LoadingDot delay={0.4} />
      </div>
      <p className="text-gray-700">{message}</p>
    </div>
  )
}

export default Loading