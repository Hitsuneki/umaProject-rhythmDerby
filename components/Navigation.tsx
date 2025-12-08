'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, Zap, Trophy, BarChart3, Package, Sparkles, UserCircle, ChevronDown, LogOut, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/characters', label: 'Characters', icon: Users },
  { href: '/training', label: 'Training', icon: Zap },
  { href: '/racing', label: 'Racing', icon: Trophy },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/gacha', label: 'Gacha', icon: Sparkles },
  { href: '/history', label: 'History', icon: BarChart3 },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, deleteAccount } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    const success = await deleteAccount();
    if (success) {
      setIsDropdownOpen(false);
      setShowDeleteConfirm(false);
      router.push('/login');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b shadow-sm" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
              <Trophy className="w-6 h-6 text-white" style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <span className="font-display text-xl font-bold uppercase tracking-wider" style={{ color: 'var(--charcoal)' }}>
              Uma Racing
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative px-4 py-2 rounded-lg flex items-center gap-2 font-display text-sm uppercase tracking-wide transition-colors"
                    style={{ color: isActive ? 'var(--accent)' : 'var(--grey-dark)' }}
                  >
                    <Icon className="w-4 h-4" style={{ width: '16px', height: '16px' }} />
                    <span className="hidden md:inline">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 rounded-lg -z-10"
                        style={{ backgroundColor: 'rgba(255, 79, 0, 0.1)' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}

            {/* User Profile Dropdown */}
            {isAuthenticated && user && (
              <div className="relative ml-6" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg border-2 transition-all shadow-sm"
                  style={{ 
                    backgroundColor: 'var(--panel-bg)', 
                    borderColor: isDropdownOpen ? 'var(--accent)' : 'var(--border)' 
                  }}
                >
                  {/* Profile Picture */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-display font-bold text-lg shadow-md" style={{ backgroundImage: 'linear-gradient(to bottom right, var(--accent), var(--accent-dark))' }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* User Info */}
                  <div className="hidden md:flex flex-col items-start">
                    <span className="font-display text-sm font-semibold leading-tight" style={{ color: 'var(--charcoal)' }}>
                      {user.username}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--grey-dark)' }}>
                      Trainer
                    </span>
                  </div>

                  {/* Dropdown Arrow */}
                  <ChevronDown 
                    className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    style={{ width: '20px', height: '20px', color: 'var(--grey-dark)' }}
                  />
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 backdrop-blur-lg border-2 rounded-xl shadow-2xl overflow-hidden z-50"
                      style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border)' }}
                    >
                      {!showDeleteConfirm ? (
                        <div className="py-2">
                          <button
                            onClick={handleLogout}
                            className="w-full px-5 py-3.5 flex items-center gap-3 text-left transition-colors group"
                            style={{ 
                              backgroundColor: 'transparent',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 79, 0, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(255, 79, 0, 0.1)' }}>
                              <LogOut style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
                            </div>
                            <span className="text-sm font-display font-semibold uppercase tracking-wide" style={{ color: 'var(--charcoal)' }}>
                              Logout
                            </span>
                          </button>

                          {/* Delete Account Button */}
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full px-5 py-3.5 flex items-center gap-3 text-left transition-colors group"
                            style={{ backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                              <Trash2 style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                            </div>
                            <span className="text-sm font-display font-semibold uppercase tracking-wide" style={{ color: '#ef4444' }}>
                              Delete Account
                            </span>
                          </button>
                        </div>
                      ) : (
                        /* Delete Confirmation */
                        <div className="px-5 py-4">
                          <p className="text-sm font-medium mb-4 leading-relaxed" style={{ color: 'var(--charcoal)' }}>
                            Are you sure you want to delete your account? This action cannot be undone.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={handleDeleteAccount}
                              className="flex-1 px-4 py-2.5 bg-red-500 text-white text-xs font-display font-bold uppercase tracking-wide rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="flex-1 px-4 py-2.5 text-xs font-display font-bold uppercase tracking-wide rounded-lg transition-colors"
                              style={{ backgroundColor: 'var(--grey-light)', color: 'var(--charcoal)' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--grey-medium)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--grey-light)'}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
