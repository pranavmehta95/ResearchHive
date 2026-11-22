import { Outlet } from 'react-router-dom'
import { cn } from '../utils/cn'
import Sidebar from './Sidebar'
import Header from './Header'
import { motion } from 'framer-motion'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-premium">
      <Sidebar />
      <div className="transition-all duration-300 ml-64">
        <Header />
        <main className="pt-20 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 md:p-8 lg:p-10"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}