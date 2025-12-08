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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-(--panel-bg) backdrop-blur-lg border-b border-(--border)">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-(--accent) rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-xl font-bold uppercase tracking-wider text-(--charcoal)">
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
                    className={`relative px-4 py-2 rounded-lg flex items-center gap-2 font-display text-sm uppercase tracking-wide transition-colors ${
                      isActive
                        ? 'text-(--accent)'
                        : 'text-(--grey-dark) hover:text-(--charcoal)'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-(--accent)/10 rounded-lg -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}

            {/* User Dropdown */}
            {isAuthenticated && user && (
              <div className="relative ml-4" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-(--panel-bg) border border-(--border) hover:border-(--accent) transition-colors"
                >
                  <UserCircle className="w-5 h-5 text-(--accent)" style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
                  <span className="hidden md:inline font-body text-sm text-(--charcoal) max-w-[120px] truncate">
                    {user.username}
                  </span>
                  <ChevronDown 
                    className={`w-4 h-4 text-(--grey-dark) transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    style={{ width: '16px', height: '16px', color: 'var(--grey-dark)' }}
                  />
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-(--panel-bg) backdrop-blur-lg border border-(--border) rounded-lg shadow-lg overflow-hidden z-50"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-(--border)">
                        <p className="text-xs uppercase tracking-wide text-(--grey-dark) font-display mb-1">
                          Signed in as
                        </p>
                        <p className="text-sm font-medium text-(--charcoal) truncate">
                          {user.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {!showDeleteConfirm ? (
                          <>
                            {/* Sign Out */}
                            <button
                              onClick={handleLogout}
                              className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-(--grey-light) transition-colors group"
                            >
                              <LogOut className="w-4 h-4 text-(--grey-dark) group-hover:text-(--accent)" style={{ width: '16px', height: '16px', color: 'var(--grey-dark)' }} />
                              <span className="text-sm font-display uppercase tracking-wide text-(--charcoal) group-hover:text-(--accent)">
                                Sign Out
                              </span>
                            </button>

                            {/* Delete Account */}
                            <button
                              onClick={() => setShowDeleteConfirm(true)}
                              className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-red-50 transition-colors group"
                            >
                              <Trash2 className="w-4 h-4 text-(--grey-dark) group-hover:text-red-500" style={{ width: '16px', height: '16px', color: 'var(--grey-dark)' }} />
                              <span className="text-sm font-display uppercase tracking-wide text-(--charcoal) group-hover:text-red-500">
                                Delete Account
                              </span>
                            </button>
                          </>
                        ) : (
                          /* Delete Confirmation */
                          <div className="px-4 py-3">
                            <p className="text-sm text-(--charcoal) mb-3">
                              Are you sure? This action cannot be undone.
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={handleDeleteAccount}
                                className="flex-1 px-3 py-2 bg-red-500 text-white text-xs font-display uppercase tracking-wide rounded hover:bg-red-600 transition-colors"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-3 py-2 bg-(--grey-light) text-(--charcoal) text-xs font-display uppercase tracking-wide rounded hover:bg-(--grey-medium) transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
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