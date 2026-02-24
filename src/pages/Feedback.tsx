import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, CheckCircle2, Star } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function Feedback() {
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate feedback submission
    setSubmitted(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto space-y-8 relative z-10"
    >
      <BackButton />

      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-[#00c9a7]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="w-10 h-10 text-[#00c9a7]" />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Feedback</h1>
        <p className="text-gray-500 font-medium">Help us improve your growth experience</p>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111118] border border-white/5 p-12 rounded-[2.5rem] text-center"
          >
            <div className="w-16 h-16 bg-[#00c9a7]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#00c9a7]" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
            <p className="text-gray-500 mb-8 font-medium">Your feedback has been received and helps us build a better platform for everyone.</p>
            <button 
              onClick={() => setSubmitted(false)}
              className="px-8 py-3 bg-[#00c9a7] text-black rounded-xl font-bold hover:bg-[#00e0ba] transition-all"
            >
              Send Another
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111118] border border-white/5 p-8 rounded-[2.5rem]"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Rate your experience</label>
                <div className="flex items-center justify-center space-x-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 transition-all ${rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-700 hover:text-gray-500'}`}
                    >
                      <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Your Comments</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="Tell us what you like or what we can improve..."
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#00c9a7] transition-colors text-sm font-medium resize-none"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                disabled={!rating || !comment}
                className="w-full py-4 bg-[#00c9a7] hover:bg-[#00e0ba] disabled:opacity-50 text-black rounded-2xl font-bold transition-all shadow-lg shadow-[#00c9a7]/20 flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Submit Feedback</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
