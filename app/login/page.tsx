'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Zap, Wifi, Server, Activity, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useResponsive } from '@/hooks/useResponsive';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuthStore();
  const { isMobile } = useResponsive();
  /* Form State */
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  /* Validation State */
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });

  const validateForm = () => {
    const errors = { email: '', password: '' };
    let isValid = true;

    // Email Validation
    if (!formData.email) {
      errors.email = 'EMAIL IS REQUIRED';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'INVALID EMAIL FORMAT';
      isValid = false;
    }

    // Password Validation
    if (!formData.password) {
      errors.password = 'PASSWORD IS REQUIRED';
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = 'PASSWORD TOO SHORT (MIN 8 CHARS)';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (email: string, password: string) => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      // Wait a brief moment to show "VERIFIED" state if successful
      if (success) {
        setTimeout(() => router.push('/'), 800);
      } else {
        // Handle generic failure if not caught by specific error mapping
        setError('AUTHENTICATION FAILED - INVALID CREDENTIALS');
        // Map generic failure to fields if possible guess
        setFieldErrors(prev => ({
          ...prev,
          password: 'ACCESS CODE IS INCORRECT', // Common fallback
        }));
      }
    } catch (err: any) {
      console.error(err);
      // Try to map server errors if they follow a known structure, otherwise generic
      if (err?.message === 'USER_NOT_FOUND') {
        setFieldErrors(prev => ({ ...prev, email: 'NO OPERATOR ACCOUNT FOUND' }));
      } else if (err?.message === 'INVALID_PASSWORD') {
        setFieldErrors(prev => ({ ...prev, password: 'ACCESS CODE IS INCORRECT' }));
      } else {
        setError('SYSTEM ERROR - CONNECTION TIMEOUT');
      }
    } finally {
      if (!user) { // Only stop loading if not successful (to show Verified state)
        setIsLoading(false);
      }
    }
  };

  const handleDesktopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(formData.email, formData.password);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear specific field error on change
    if (field === 'email' || field === 'password') {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (error) setError('');
  };

  // Show mobile version on small screens
  if (isMobile) {
    return (
      <MobileLogin
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  // Desktop version (existing code from above)
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute inset-0 grid-pattern"
          animate={{
            backgroundPosition: ['0px 0px', '32px 32px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>

      {/* Scanline Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ y: '-100vh' }}
        animate={{ y: '100vh' }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear'
        }}
      >
        <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      </motion.div>

      {/* Ambient Data Streams */}
      <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      <div className="absolute bottom-0 right-0 w-full h-1 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-l from-transparent via-orange-500/40 to-transparent"
          animate={{
            x: ['100%', '-200%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Panel - System Status */}
        <motion.div
          className="hidden lg:flex lg:w-1/2 bg-white/90 backdrop-blur-sm border-r border-gray-200 flex-col justify-center p-12 relative"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Vertical Data Stream */}
          <div className="absolute right-0 top-0 w-1 h-full overflow-hidden">
            <motion.div
              className="w-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent h-32"
              animate={{
                y: ['-100%', '400%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </div>

          <div className="space-y-8">
            {/* System Header */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-cyan-700 flex items-center justify-center shadow-lg border border-cyan-500/20">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="font-mono text-3xl text-gray-900 font-black uppercase tracking-wider">
                    RHYTHMDERBY
                  </h1>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-mono font-semibold">
                    NEURAL RHYTHM INTERFACE v2.4.1
                  </p>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-cyan-500/50 via-cyan-500/20 to-transparent" />
            </motion.div>

            {/* System Status Grid */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-mono font-bold mb-4 border-b border-gray-200 pb-2">
                  [SYS-STATUS] CORE MODULES
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-2 h-2 bg-green-500 rounded-full"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-xs font-mono text-gray-700 uppercase">AUTH</span>
                      </div>
                      <span className="text-xs font-mono text-green-600 font-bold">ONLINE</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="w-3 h-3 text-gray-500" />
                        <span className="text-xs font-mono text-gray-700 uppercase">DB</span>
                      </div>
                      <span className="text-xs font-mono text-green-600 font-bold">SYNC</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wifi className="w-3 h-3 text-gray-500" />
                        <span className="text-xs font-mono text-gray-700 uppercase">NET</span>
                      </div>
                      <span className="text-xs font-mono text-cyan-600 font-bold">18MS</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-gray-500" />
                        <span className="text-xs font-mono text-gray-700 uppercase">CPU</span>
                      </div>
                      <span className="text-xs font-mono text-yellow-600 font-bold">23%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-gray-500" />
                        <span className="text-xs font-mono text-gray-700 uppercase">SEC</span>
                      </div>
                      <span className="text-xs font-mono text-green-600 font-bold">TLS</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-gray-400 bg-gray-100" />
                        <span className="text-xs font-mono text-gray-700 uppercase">MEM</span>
                      </div>
                      <span className="text-xs font-mono text-cyan-600 font-bold">2.1GB</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-mono font-bold mb-4 border-b border-gray-200 pb-2">
                  [NODE-INFO] DEPLOYMENT
                </p>
                <div className="space-y-2 text-xs font-mono text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-500">REGION:</span>
                    <span className="text-gray-900 font-bold">GLOBAL-EAST-01</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">BUILD:</span>
                    <span className="text-gray-900 font-bold">RD-2024.03.15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">UPTIME:</span>
                    <span className="text-green-600 font-bold">99.97%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">LOAD:</span>
                    <span className="text-cyan-600 font-bold">OPTIMAL</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Neural Activity Visualization */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 overflow-hidden relative">
                <div className="absolute inset-0 flex items-end justify-center gap-1 p-2">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-cyan-500/40 min-h-1"
                      animate={{
                        height: [4, Math.random() * 60 + 8, 4],
                        opacity: [0.4, 0.8, 0.4]
                      }}
                      transition={{
                        duration: 1.5 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: 'easeInOut'
                      }}
                    />
                  ))}
                </div>
                <div className="absolute top-2 left-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">
                    NEURAL SYNC
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-mono mt-2 text-center">
                [BIOMETRIC] PATTERN ANALYSIS
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
          {/* Vertical Accent Line */}
          <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-500/20 to-transparent lg:hidden" />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
            className="w-full max-w-md relative"
          >
            {/* Login Card */}
            <div className={`bg-white border shadow-lg overflow-hidden relative transition-colors duration-300 ${error ? 'border-red-300' : 'border-gray-200'}`}>
              {/* Ambient Side Accent */}
              <div className="absolute right-0 top-0 w-1 h-full overflow-hidden">
                <motion.div
                  className={`w-full h-full bg-gradient-to-b ${error ? 'from-red-500/30 via-orange-500/30 to-transparent' : 'from-cyan-500/30 via-transparent to-orange-500/30'}`}
                  animate={{
                    backgroundPosition: ['0% 0%', '0% 100%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              </div>

              {/* Card Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-mono font-bold">
                      MODULE: AUTH / CHANNEL: OPERATOR
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className={`text-xs font-mono font-bold uppercase ${error ? 'text-red-600' : 'text-gray-600'}`}>
                      {error ? 'AUTH_FAIL' : 'SECURE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-6 relative">
                {/* Title Section */}
                <motion.div
                  className="text-center space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="font-mono text-2xl text-gray-900 font-black uppercase tracking-wider">
                    WELCOME BACK, TRAINER
                  </h2>
                  <p className="text-sm text-gray-600 font-medium">
                    Enter your credentials to access the neural
                    rhythm interface.
                  </p>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </motion.div>

                {/* Error Display */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="bg-red-50 border-l-4 border-red-500 p-4 relative"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 border-2 border-red-500 bg-red-100 flex items-center justify-center mt-0.5">
                          <div className="w-1 h-1 bg-red-500 rounded-full" />
                        </div>
                        <div>
                          <p className="text-xs text-red-700 font-mono font-bold uppercase tracking-wide">
                            AUTHENTICATION ERROR
                          </p>
                          <p className="text-xs text-red-600 font-mono mt-1">
                            {error}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Login Form */}
                <motion.form
                  onSubmit={handleDesktopSubmit}
                  className="space-y-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {/* Email Field */}
                  <div className="space-y-2 group">
                    <label className={`block text-xs uppercase tracking-wide font-mono font-bold transition-colors ${fieldErrors.email ? 'text-red-600' : 'text-gray-600 group-focus-within:text-cyan-600'}`}>
                      OPERATOR EMAIL
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full px-4 py-3 bg-gray-50 border text-gray-900 placeholder-gray-500 font-mono text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-sm ${fieldErrors.email
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-gray-200 focus:border-cyan-600'
                          }`}
                        placeholder="trainer@rhythmderby.com"
                      />
                      {focusedField === 'email' && !fieldErrors.email && (
                        <motion.div
                          className="absolute bottom-0 left-0 h-0.5 bg-cyan-600"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 0.3 }}
                        />
                      )}

                      {/* Technical marker */}
                      <div className="absolute top-0 right-0 w-8 h-full flex items-center justify-center pointer-events-none">
                        <div className={`w-1 h-4 transition-colors ${fieldErrors.email ? 'bg-red-300' : 'bg-gray-300'}`} />
                      </div>
                    </div>
                    {/* Field Error Message */}
                    <AnimatePresence>
                      {fieldErrors.email && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-red-500 font-mono mt-1 font-medium"
                        >
                          {fieldErrors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2 group">
                    <label className={`block text-xs uppercase tracking-wide font-mono font-bold transition-colors ${fieldErrors.password ? 'text-red-600' : 'text-gray-600 group-focus-within:text-cyan-600'}`}>
                      ACCESS CODE
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full px-4 py-3 pr-12 bg-gray-50 border text-gray-900 placeholder-gray-500 font-mono text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-sm ${fieldErrors.password
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-gray-200 focus:border-cyan-600'
                          }`}
                        placeholder="••••••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {focusedField === 'password' && !fieldErrors.password && (
                        <motion.div
                          className="absolute bottom-0 left-0 h-0.5 bg-cyan-600"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      <div className="absolute top-0 right-12 w-1 h-full flex items-center pointer-events-none">
                        <div className={`w-full h-4 transition-colors ${fieldErrors.password ? 'bg-red-300' : 'bg-gray-300'}`} />
                      </div>
                    </div>
                    {/* Field Error Message */}
                    <AnimatePresence>
                      {fieldErrors.password && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-red-500 font-mono mt-1 font-medium"
                        >
                          {fieldErrors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full font-mono font-bold py-4 px-6 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 text-sm uppercase tracking-wide relative overflow-hidden group ${user // Success state (kind of a hack since we redirect, but good for transition)
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Button shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    />

                    {/* Button content */}
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>{user ? 'VERIFIED - REDIRECTING...' : 'VERIFYING CREDENTIALS...'}</span>
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1 h-1 bg-white rounded-full"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3 relative z-10">
                        <span>INITIATE LOGIN SEQUENCE</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </motion.button>
                </motion.form>

                {/* Secondary Actions */}
                <motion.div
                  className="space-y-4 pt-4 border-t border-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex flex-col sm:flex-row gap-3 text-center">
                    <Link
                      href="/register"
                      className="flex-1 text-xs text-gray-600 hover:text-cyan-600 transition-colors font-mono font-medium uppercase tracking-wide py-2 px-4 border border-gray-200 hover:border-cyan-600 bg-gray-50 hover:bg-cyan-50"
                    >
                      [REG] CREATE NEW OPERATOR
                    </Link>
                    <Link
                      href="/forgot-password"
                      className="flex-1 text-xs text-gray-600 hover:text-orange-600 transition-colors font-mono font-medium uppercase tracking-wide py-2 px-4 border border-gray-200 hover:border-orange-600 bg-gray-50 hover:bg-orange-50"
                    >
                      [RESET] RECOVER ACCESS
                    </Link>
                  </div>
                </motion.div>
              </div>

              {/* Card Footer */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 relative">
                <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="uppercase">BUILD: RD-2024.03.15</span>
                    <span className="uppercase">NODE: CN-01</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-1 h-1 bg-green-500 rounded-full"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="uppercase">SECURE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Footer */}
            <motion.div
              className="mt-6 text-center space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <p className="text-xs text-gray-400 uppercase tracking-wide font-mono font-bold">
                SECURE NEURAL CONNECTION ESTABLISHED
              </p>
              <div className="flex items-center justify-center gap-4 text-xs font-mono text-gray-500">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-1 h-1 bg-green-500 rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="uppercase">SSL ENCRYPTED</span>
                </div>
                <div className="w-px h-3 bg-gray-300" />
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  <span className="uppercase">TLS 1.3</span>
                </div>
                <div className="w-px h-3 bg-gray-300" />
                <span className="uppercase">256-BIT</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Additional CSS for grid pattern */}
      <style jsx>{`
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>
    </div>
  );
}