'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const TIPS = [
  "Tip: Hit the beat to charge, off-beat to switch lanes.",
  "Tip: Train your Uma regularly to improve their stats.",
  "Tip: Different racing styles excel at different distances.",
  "Tip: Energy regenerates over time - plan your training sessions wisely.",
  "Tip: Gacha pulls can reward you with rare Uma and valuable items.",
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 login-bg">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-[#FF4F00]/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[#3B00DB]/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Logo/Branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 left-8"
      >
        <h2 className="font-display text-xl font-bold text-white tracking-wider">
          Uma Project: <span className="text-[#FF4F00]">Rhythm Derby</span>
        </h2>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Decorative corner accents */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-[#FF4F00]" />
        <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-[#FF4F00]" />
        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-[#FF4F00]" />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-[#FF4F00]" />

        <div className="login-card backdrop-blur-xl bg-[#1A1A1A]/95 border border-[#FF4F00]/30 rounded-2xl p-8 shadow-2xl shadow-[#FF4F00]/10">
          {/* Title */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-4xl font-bold text-white mb-2 tracking-wider"
            >
              RHYTHM DERBY
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[#D0D0D0] text-sm tracking-wide"
            >
              Mini Uma Stable Login
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D0D0D0]">
                <Mail size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email / Username"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-[#0A0A0A]/50 border border-[#404040] rounded-lg text-white placeholder:text-[#808080] focus:outline-none focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20 transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D0D0D0]">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full pl-12 pr-12 py-3.5 bg-[#0A0A0A]/50 border border-[#404040] rounded-lg text-white placeholder:text-[#808080] focus:outline-none focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D0D0D0] hover:text-[#FF4F00] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#404040] bg-[#0A0A0A]/50 text-[#FF4F00] focus:ring-[#FF4F00] focus:ring-offset-0"
                />
                <span className="text-[#D0D0D0] group-hover:text-white transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-[#FF4F00] hover:text-[#FF6E2A] transition-colors font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#FF4F00] to-[#ED1B24] hover:from-[#FF6E2A] hover:to-[#FF4F00] text-white font-display font-bold text-base py-4 rounded-full shadow-lg shadow-[#FF4F00]/30 hover:shadow-[#FF4F00]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  LOG IN
                  <ArrowRight size={20} />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#404040]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#1A1A1A] text-[#808080]">OR</span>
            </div>
          </div>

          {/* Create Account */}
          <div className="text-center">
            <p className="text-[#D0D0D0] text-sm mb-3">
              New Trainer?
            </p>
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="w-full py-3 border-2 border-[#FF4F00] text-[#FF4F00] hover:bg-[#FF4F00] hover:text-white font-display font-semibold rounded-full transition-all duration-300"
            >
              CREATE ACCOUNT
            </button>
          </div>

          {/* Tip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 p-4 bg-[#0A0A0A]/30 border border-[#404040]/50 rounded-lg"
          >
            <p className="text-[#D0D0D0] text-xs text-center italic">
              {currentTip}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}