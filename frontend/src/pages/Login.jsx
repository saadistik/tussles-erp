import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, Zap, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up as employee
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }

        const { data, error } = await signUp(email, password, fullName, 'employee');
        
        if (error) {
          setError(error.message || 'Failed to create account');
          setLoading(false);
          return;
        }

        // Account created and user is now signed in - redirect to dashboard
        navigate('/dashboard');
      } else {
        // Sign in
        console.log('Attempting to sign in...');
        const { data, error } = await signIn(email, password);
        
        if (error) {
          console.error('Sign in error:', error);
          setError(error.message || 'Invalid email or password');
          setLoading(false);
          return;
        }

        console.log('Sign in successful, navigating to dashboard');
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Nature Glass Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-nature-emerald via-nature-teal to-nature-ocean" />
        
        {/* Animated Floating Blobs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 w-96 h-96 bg-nature-gold/30 rounded-full blur-3xl"
        />
        
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-20 w-[30rem] h-[30rem] bg-nature-leaf/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20, scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-4"
          >
            <div className="relative">
              <Zap className="text-nature-gold" size={64} strokeWidth={2} />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-nature-teal/30 rounded-full"
              />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">
            TradeFlow
          </h1>
          <p className="text-white/70">Manufacturing Resource Planning</p>
        </div>

        {/* Glass-morphism card */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/30 rounded-3xl p-8 shadow-glass-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center text-white">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-6"
            >
              {success}
            </motion.div>
          )}

          {/* Login/Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Input (Sign Up Only) */}
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={isSignUp}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="John Doe"
                  />
                </div>
              </motion.div>
            )}

            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="you@example.com"
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>
              {isSignUp && (
                <p className="text-xs text-zinc-500 mt-2">Minimum 6 characters</p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isSignUp ? 'Creating Account...' : 'Signing in...'}</span>
                </>
              ) : (
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              )}
            </motion.button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center"
          >
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
              }}
              className="text-blue-400 hover:text-blue-300 text-sm transition"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up as Employee"}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center text-zinc-500 text-sm"
          >
            <p>Secure login powered by Supabase</p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute -top-4 -left-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"
        />
      </motion.div>
    </div>
  );
};

export default Login;
