import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Wallet as WalletIcon, ArrowUpRight, History, CreditCard, Landmark, Coins } from 'lucide-react';
import { motion } from 'motion/react';
import BackButton from '../components/BackButton';

export default function Wallet() {
  const { token } = useAuthStore();

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/wallet', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!token
  });

  const queryClient = useQueryClient();
  const fundMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await axios.post('/api/v1/wallet/fund', { amount }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });

  const handleFund = () => {
    const amount = prompt('Enter amount to fund (₦):');
    if (amount && !isNaN(parseFloat(amount))) {
      fundMutation.mutate(parseFloat(amount));
    }
  };

  const { data: transactions, isLoading: isTxLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!token
  });

  const paymentMethods = [
    { name: 'Bank Transfer', icon: Landmark, desc: 'Manual verification (1-2 hours)' },
    { name: 'Credit Card', icon: CreditCard, desc: 'Instant funding via Flutterwave' },
    { name: 'Crypto', icon: Coins, desc: 'BTC, ETH, USDT (Instant)' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto space-y-8 relative z-10"
    >
      <BackButton />
      {/* Balance Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#00c9a7] p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-[#00c9a7]/20"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4 text-black/60">
            <WalletIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Available Balance</span>
          </div>
          <div className="text-6xl font-bold mb-8 tracking-tighter text-black">
            ₦{wallet?.balance?.toLocaleString() || '0'}
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={handleFund}
              disabled={fundMutation.isPending}
              className="px-6 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-black/80 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{fundMutation.isPending ? 'Processing...' : 'Add Funds'}</span>
            </button>
            <div className="px-6 py-3 bg-black/10 backdrop-blur-md rounded-xl font-bold text-sm flex items-center space-x-2 text-black">
              <span className="opacity-60">Currency:</span>
              <span>NGN</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Payment Methods */}
        <div className="space-y-6">
          <h2 className="font-display text-xl font-bold">Funding Methods</h2>
          <div className="space-y-3">
            {paymentMethods.map((method, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-[#111118] border border-white/5 rounded-2xl flex items-center justify-between hover:border-[#00c9a7]/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/5 rounded-xl group-hover:bg-[#00c9a7]/10 group-hover:text-[#00c9a7] transition-colors">
                    <method.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{method.name}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{method.desc}</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-700 group-hover:text-[#00c9a7] transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Recent Activity</h2>
            <button className="text-xs text-[#00c9a7] hover:text-[#00e0ba] font-bold uppercase tracking-widest">View All</button>
          </div>
          <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
            {isTxLoading ? (
              <div className="p-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-[#00c9a7] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !transactions || transactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-[#00c9a7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-[#00c9a7]" />
                </div>
                <h3 className="text-sm font-bold mb-1">No activity</h3>
                <p className="text-xs text-gray-600 mb-6">Your transaction history will appear here.</p>
                <button 
                  onClick={handleFund}
                  className="px-4 py-2 bg-[#00c9a7]/10 text-[#00c9a7] rounded-lg text-xs font-bold hover:bg-[#00c9a7]/20 transition-all"
                >
                  Fund Now
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {transactions.slice(0, 5).map((tx: any) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${tx.type === 'deposit' ? 'bg-[#00c9a7]/10 text-[#00c9a7]' : 'bg-red-400/10 text-red-400'}`}>
                        {tx.type === 'deposit' ? <ArrowUpRight className="w-4 h-4 rotate-180" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold">{tx.description}</div>
                        <div className="text-[10px] text-gray-500 font-medium">{new Date(tx.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${tx.type === 'deposit' ? 'text-[#00c9a7]' : 'text-white'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
