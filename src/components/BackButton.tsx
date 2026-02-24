import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate(-1)}
      className="flex items-center space-x-2 text-gray-500 hover:text-[#00c9a7] transition-colors mb-6 group"
    >
      <div className="p-2 bg-white/5 rounded-xl group-hover:bg-[#00c9a7]/10 transition-colors">
        <ArrowLeft className="w-4 h-4" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest">Back</span>
    </motion.button>
  );
}
