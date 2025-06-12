import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  
  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])
  
  // Close sidebar on outside click (mobile)
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (window.innerWidth < 768 && sidebarOpen) {
        if (!e.target.closest('.sidebar') && !e.target.closest('.menu-button')) {
          setSidebarOpen(false)
        }
      }
    }
    
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [sidebarOpen])

  return (
    <div className="grid-pattern min-h-screen flex flex-col">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex flex-1 pt-16">
        {/* Sidebar for desktop */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        {/* Mobile Sidebar with Animation */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              className="fixed top-0 left-0 z-30 h-full w-64 md:hidden"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black bg-opacity-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto container mx-auto">
          <Outlet />
        </main>
      </div>
      
      <Footer />
    </div>
  )
}

export default MainLayout