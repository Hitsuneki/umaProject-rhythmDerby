'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut, User, Settings, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';

// Navigation routes configuration
const navRoutes = [
  { href: '/', label: 'DASHBOARD' },
  { href: '/characters', label: 'STABLE' },
  { href: '/racing', label: 'RACING' },
  { href: '/inventory', label: 'INVENTORY'},
  { href: '/gacha', label: 'MARKET' },
  { href: '/history', label: 'STATS' },
];

// Dropdown menu items
const dropdownItems = [
  { icon: User, label: 'PROFILE', action: 'profile' as const },
  { icon: Settings, label: 'SETTINGS', action: 'settings' as const },
  { icon: Activity, label: 'ACTIVITY', action: 'activity' as const },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, fetchUser } = useAuthStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [energy, setEnergy] = useState(73); // Mock energy - would come from API
  const [maxEnergy] = useState(100);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user data on mount and periodically
  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
      const interval = setInterval(fetchUser, 30000); // Update every 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push('/login');
  };

  const handleDropdownAction = (action: string) => {
    setIsDropdownOpen(false);
    // Handle different actions
    switch (action) {
      case 'profile':
        // Navigate to profile page when implemented
        break;
      case 'settings':
        // Navigate to settings page when implemented
        break;
      case 'activity':
        // Navigate to activity page when implemented
        break;
    }
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-US');
  };

  const formatNodeId = (userId: string): string => {
    return userId.substring(0, 8).toUpperCase();
  };

  const energyPercentage = Math.round((energy / maxEnergy) * 100);
  const energyBarWidth = `${energyPercentage}%`;

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      {/* Desktop & Tablet Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] border-b"
        style={{
          height: 'var(--navbar-height)',
          backgroundColor: 'var(--color-navbar-bg)',
          borderColor: 'var(--color-navbar-border)'
        }}
      >
        <div className="h-full px-6 flex items-center justify-between max-w-[1920px] mx-auto">
          {/* Left Section: Brand & System ID */}
          <div className="flex items-center gap-3">
            <span
              className="font-semibold"
              style={{
                fontSize: '16px',
                color: 'var(--color-teal-primary)'
              }}
            >
              rhythmDerby
            </span>
            <span
              className="tech-mono"
              style={{
                fontSize: '9px',
                color: 'var(--color-text-tertiary)'
              }}
            >
              SYS-v2.4.1
            </span>
            <div
              className="w-px bg-current opacity-30"
              style={{ height: '16px' }}
            />
            <span
              className="tech-mono"
              style={{
                fontSize: '10px',
                color: 'var(--color-text-tertiary)'
              }}
            >
              NODE-{formatNodeId(user.id)}
            </span>
          </div>

          {/* Center Section: Navigation Modules (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            {navRoutes.map((route) => {
              const isActive = pathname === route.href ||
                (route.href !== '/' && pathname.startsWith(route.href));

              return (
                <Link key={route.href} href={route.href}>
                  <div
                    className="nav-link nav-link-underline relative"
                    style={{
                      color: isActive ? 'var(--color-teal-primary)' : 'var(--color-text-secondary)',
                      backgroundColor: isActive ? 'var(--color-navbar-hover)' : 'transparent',
                      borderLeft: isActive ? '2px solid var(--color-teal-primary)' : '2px solid transparent',
                    }}
                  >
                    {route.label}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right Section: User Console (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Energy Indicator */}
            <div className="flex items-center gap-2">
              <span
                className="tech-mono"
                style={{
                  fontSize: '10px',
                  color: 'var(--color-text-tertiary)',
                  fontWeight: 600
                }}
              >
                [ENR]
              </span>
              <div
                className="relative bg-gray-200 rounded-sm overflow-hidden"
                style={{ width: '40px', height: '4px' }}
              >
                <div
                  className="absolute top-0 left-0 h-full transition-all"
                  style={{
                    width: energyBarWidth,
                    backgroundColor: 'var(--color-teal-primary)',
                    transitionDuration: 'var(--duration-250)',
                    transitionTimingFunction: 'ease-out'
                  }}
                />
              </div>
              <span
                className="tech-mono"
                style={{
                  fontSize: '10px',
                  color: 'var(--color-text-primary)',
                  minWidth: '32px'
                }}
              >
                {energyPercentage}%
              </span>
            </div>

            {/* Currency Display */}
            <div className="flex items-center gap-2">
              <span
                className="tech-mono"
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-tertiary)',
                  fontWeight: 600
                }}
              >
                [¥]
              </span>
              <span
                className="tech-mono"
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-primary)'
                }}
              >
                {formatCurrency(user.currency_balance)}
              </span>
            </div>

            {/* User Status Panel */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded border transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: isDropdownOpen ? 'var(--color-teal-primary)' : 'var(--border-primary)',
                  fontSize: '12px'
                }}
              >
                <span style={{ color: 'var(--color-teal-primary)' }}>◆</span>
                <span
                  className="font-semibold"
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  OPERATOR
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  {user.username}
                </span>
                <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>|</span>
                <span
                  className="text-xs"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  SYNC
                </span>
                <div
                  className="sync-pulse rounded-full"
                  style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: 'var(--color-sync-online)'
                  }}
                />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 border rounded-lg shadow-lg overflow-hidden"
                    style={{
                      width: '200px',
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-primary)'
                    }}
                  >
                    <div className="py-1">
                      {dropdownItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.action}
                            onClick={() => handleDropdownAction(item.action)}
                            className="w-full px-4 py-2 flex items-center gap-3 text-left transition-colors"
                            style={{ fontSize: '12px' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-navbar-hover)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Icon style={{ width: '16px', height: '16px', color: 'var(--color-text-tertiary)' }} />
                            <span
                              className="font-semibold"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              [{item.label.split(' ')[0]}] {item.label.split(' ').slice(1).join(' ')}
                            </span>
                          </button>
                        );
                      })}
                      <div
                        className="my-1 mx-4"
                        style={{
                          height: '1px',
                          backgroundColor: 'var(--border-subtle)'
                        }}
                      />
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 flex items-center gap-3 text-left transition-colors"
                        style={{ fontSize: '12px' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <LogOut style={{ width: '16px', height: '16px', color: 'var(--accent-danger)' }} />
                        <span
                          className="font-semibold"
                          style={{ color: 'var(--accent-danger)' }}
                        >
                          [EXIT] LOGOUT
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {isMobileMenuOpen ? (
              <X style={{ width: '24px', height: '24px' }} />
            ) : (
              <Menu style={{ width: '24px', height: '24px' }} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[90] lg:hidden"
              style={{
                backgroundColor: 'rgba(26, 29, 35, 0.4)',
                backdropFilter: 'blur(4px)'
              }}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 z-[95] w-80 border-l shadow-xl lg:hidden overflow-y-auto"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-primary)',
                marginTop: 'var(--navbar-height)'
              }}
            >
              <div className="p-6">
                {/* Navigation Links */}
                <div className="space-y-2 mb-6">
                  {navRoutes.map((route) => {
                    const isActive = pathname === route.href ||
                      (route.href !== '/' && pathname.startsWith(route.href));

                    return (
                      <Link key={route.href} href={route.href}>
                        <div
                          className="px-4 py-3 rounded font-semibold uppercase tracking-wide transition-colors"
                          style={{
                            fontSize: '12px',
                            color: isActive ? 'var(--color-teal-primary)' : 'var(--color-text-primary)',
                            backgroundColor: isActive ? 'var(--color-navbar-hover)' : 'transparent',
                            borderLeft: isActive ? '2px solid var(--color-teal-primary)' : '2px solid transparent',
                          }}
                        >
                          {route.label}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Divider */}
                <div
                  className="my-4"
                  style={{
                    height: '1px',
                    backgroundColor: 'var(--border-subtle)'
                  }}
                />

                {/* Energy & Currency */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span
                      className="tech-mono font-semibold"
                      style={{
                        fontSize: '11px',
                        color: 'var(--color-text-tertiary)'
                      }}
                    >
                      [ENR]
                    </span>
                    <span
                      className="tech-mono"
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      {energyPercentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="tech-mono font-semibold"
                      style={{
                        fontSize: '11px',
                        color: 'var(--color-text-tertiary)'
                      }}
                    >
                      [¥]
                    </span>
                    <span
                      className="tech-mono"
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      {formatCurrency(user.currency_balance)}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div
                  className="my-4"
                  style={{
                    height: '1px',
                    backgroundColor: 'var(--border-subtle)'
                  }}
                />

                {/* User Actions */}
                <div className="space-y-2">
                  {dropdownItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.action}
                        onClick={() => handleDropdownAction(item.action)}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left rounded transition-colors"
                        style={{ fontSize: '12px' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-navbar-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Icon style={{ width: '16px', height: '16px', color: 'var(--color-text-tertiary)' }} />
                        <span
                          className="font-semibold uppercase"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          [{item.label.split(' ')[0]}] {item.label.split(' ').slice(1).join(' ')}
                        </span>
                      </button>
                    );
                  })}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left rounded transition-colors"
                    style={{ fontSize: '12px' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <LogOut style={{ width: '16px', height: '16px', color: 'var(--accent-danger)' }} />
                    <span
                      className="font-semibold uppercase"
                      style={{ color: 'var(--accent-danger)' }}
                    >
                      [EXIT] LOGOUT
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}