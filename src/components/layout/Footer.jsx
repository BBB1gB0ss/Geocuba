import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-600">
      <div className="container mx-auto">
        <p>© {currentYear} GEODESA. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default Footer