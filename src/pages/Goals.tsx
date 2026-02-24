import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Plus, ArrowRight, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import BackButton from '../components/BackButton';

export default function Goals() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', platform: 'instagram', targetValue: 1000 });

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/goals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!token
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goal: any) => {
      return axios.post('/api/v1/goals', goal, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setIsModalOpen(false);
      setNewGoal({ name: '', platform: 'instagram', targetValue: 1000 });
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`/api/v1/goals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });

  const platforms = [
    { id: 'instagram', name: 'Instagram' },
    { id: 'facebook', name: 'Facebook' },
    { id: 'youtube', name: 'YouTube' },
    { id: 'tiktok', name: 'TikTok' },
    { id: 'twitter', name: 'Twitter (X)' },
    { id: 'telegram', name: 'Telegram' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#00c9a7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto space-y-8 relative z-10"
    >
      <BackButton />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Growth Goals</h1>
          <p className="text-gray-500 font-medium">Track your social media milestones</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-[#00c9a7] text-black rounded-xl font-bold flex items-center space-x-2 hover:bg-[#00e0ba] transition-all shadow-lg shadow-[#00c9a7]/20"
        >
          <Plus className="w-5 h-5" />
          <span>New Goal</span>
        </button>
      </div>

      {!goals || goals.length === 0 ? (
        <div className="text-center py-20 bg-[#111118] border border-white/5 rounded-[2.5rem]">
          <div className="w-24 h-24 bg-[#00c9a7]/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Target className="w-12 h-12 text-[#00c9a7]" />
          </div>
          <h2 className="text-2xl font-bold mb-4">No goals set yet</h2>
          <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">
            Set targets for your social media growth and track your progress in real-time.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-[#00c9a7] text-black rounded-2xl font-bold hover:bg-[#00e0ba] transition-all"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal: any) => {
            const progress = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
            return (
              <motion.div 
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111118] border border-white/5 p-6 rounded-3xl hover:border-[#00c9a7]/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#00c9a7] mb-1 block">{goal.platform}</span>
                    <h3 className="font-bold text-lg">{goal.name}</h3>
                  </div>
                  <button 
                    onClick={() => deleteGoalMutation.mutate(goal.id)}
                    className="p-2 text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-400">Progress</span>
                    <span className={progress === 100 ? 'text-[#00c9a7]' : 'text-white'}>{progress}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`h-full ${progress === 100 ? 'bg-[#00c9a7]' : 'bg-gradient-to-r from-[#00c9a7] to-[#00e0ba]'}`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <span>{goal.current_value.toLocaleString()} current</span>
                    <span>{goal.target_value.toLocaleString()} target</span>
                  </div>
                </div>

                {progress === 100 && (
                  <div className="mt-6 flex items-center space-x-2 text-[#00c9a7] bg-[#00c9a7]/10 p-3 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Goal Achieved!</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#111118] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">New Goal</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  createGoalMutation.mutate(newGoal);
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Goal Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 10k Instagram Followers"
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3.5 px-4 focus:outline-none focus:border-[#00c9a7] transition-colors text-sm font-medium"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Platform</label>
                  <select 
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3.5 px-4 focus:outline-none focus:border-[#00c9a7] transition-colors text-sm font-bold appearance-none"
                    value={newGoal.platform}
                    onChange={(e) => setNewGoal({ ...newGoal, platform: e.target.value })}
                  >
                    {platforms.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#111118]">{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Target Value</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3.5 px-4 focus:outline-none focus:border-[#00c9a7] transition-colors text-sm font-medium"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) })}
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={createGoalMutation.isPending}
                    className="w-full py-4 bg-[#00c9a7] hover:bg-[#00e0ba] text-black rounded-2xl font-bold transition-all shadow-lg shadow-[#00c9a7]/20 disabled:opacity-50"
                  >
                    {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
