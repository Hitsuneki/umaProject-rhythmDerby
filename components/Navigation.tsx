'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Zap, Trophy, BarChart3, Package, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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
          </div>
        </div>
      </div>
    </nav>
  );
}