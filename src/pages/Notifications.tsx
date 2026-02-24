import React from 'react';
import { motion } from 'motion/react';
import { Bell, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';

export default function Notifications() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto py-12 relative z-10"
    >
      <BackButton />
      <div className="text-center">
        <div className="w-24 h-24 bg-[#00c9a7]/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <Bell className="w-12 h-12 text-[#00c9a7]" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-4 tracking-tight">Notifications</h1>
        <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">
          You're all caught up! There are no new notifications at the moment.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 px-8 py-4 bg-[#00c9a7] text-black rounded-2xl font-bold hover:bg-[#00e0ba] transition-all shadow-lg shadow-[#00c9a7]/20"
        >
          <span>Back to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
