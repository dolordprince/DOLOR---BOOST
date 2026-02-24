import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { motion } from 'motion/react';
import { Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const setAuth = useAuthStore(state => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const payload = isLogin ? { email, password } : { email, password, fullName };
      
      const res = await axios.post(endpoint, payload);
      setAuth(res.data.user, res.data.token);
      
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00c9a7] rounded-2xl mb-4 shadow-xl shadow-[#00c9a7]/20 font-bold text-2xl text-black">DB</div>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">
            DOLOR <span className="text-[#00c9a7]">- Boost</span>
          </h1>
          <p className="text-gray-500 font-medium">
            {isLogin ? 'Enter your credentials to access your dashboard' : 'Join DOLOR - Boost and start growing today'}
          </p>
        </div>

        <div className="bg-[#111118] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    required
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#00c9a7] transition-colors text-sm font-medium"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="email" 
                  required
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#00c9a7] transition-colors text-sm font-medium"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  required
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#00c9a7] transition-colors text-sm font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#00c9a7] hover:bg-[#00e0ba] disabled:opacity-50 text-black rounded-2xl font-bold transition-all shadow-lg shadow-[#00c9a7]/20 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-500 font-medium mb-4 uppercase tracking-widest">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-[#00c9a7] rounded-xl font-bold transition-all uppercase tracking-widest text-[10px]"
            >
              {isLogin ? "Create New Account" : "Sign In to Account"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
