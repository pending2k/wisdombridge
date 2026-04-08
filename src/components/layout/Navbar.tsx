import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { LogOut, User, Menu, X, Waypoints as BridgeIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white group-hover:bg-indigo-700 transition-colors">
              <BridgeIcon size={24} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              WisdomBridge
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/mentors" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              Explore Mentors
            </Link>
            {firebaseUser ? (
              <>
                <Link 
                  to={user?.role === 'mentor' ? '/dashboard/mentor' : user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/mentee'} 
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</span>
                    <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/mentors" className="block px-3 py-2 text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                Explore Mentors
              </Link>
              {firebaseUser ? (
                <>
                  <Link 
                    to={user?.role === 'mentor' ? '/dashboard/mentor' : user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/mentee'} 
                    className="block px-3 py-2 text-gray-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-red-500 font-medium flex items-center gap-2"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/signup" className="block px-3 py-2 text-indigo-600 font-bold" onClick={() => setIsMenuOpen(false)}>
                    Join Now
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
