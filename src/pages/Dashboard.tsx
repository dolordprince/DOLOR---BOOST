import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { ShoppingBag, CheckCircle, Clock, TrendingUp, AlertCircle, ArrowRight, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import BackButton from '../components/BackButton';

export default function Dashboard() {
  const { user, token } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!token
  });

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

  const recentOrders = stats?.orders || [];

  const statsCards = [
    { title: 'Total Orders', value: recentOrders.length, icon: ShoppingBag, color: 'text-[#00c9a7]', bg: 'bg-[#00c9a7]/10' },
    { title: 'Completed', value: recentOrders.filter((o: any) => o.status === 'completed').length, icon: CheckCircle, color: 'text-[#00c9a7]', bg: 'bg-[#00c9a7]/10' },
    { title: 'Processing', value: recentOrders.filter((o: any) => ['processing', 'pending'].includes(o.status)).length, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { title: 'Wallet Balance', value: `₦${wallet?.balance?.toLocaleString() || '0'}`, icon: TrendingUp, color: 'text-[#00c9a7]', bg: 'bg-[#00c9a7]/10' },
  ];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      return axios.patch(`/api/v1/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });

  const getStatusColor = (status: string) => {
    const colors: any = {
      completed: 'text-[#00c9a7] bg-[#00c9a7]/10',
      processing: 'text-yellow-400 bg-yellow-400/10',
      pending: 'text-gray-400 bg-gray-400/10',
      cancelled: 'text-red-400 bg-red-400/10',
      failed: 'text-red-400 bg-red-400/10',
    };
    return colors[status] || colors.pending;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 relative z-10"
    >
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111118] border border-white/5 p-8 rounded-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00c9a7]/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2 tracking-tight">
              DOLOR <span className="text-[#00c9a7]">- Boost</span>
            </h1>
            <p className="text-gray-400 mb-8 max-w-md">
              Welcome back, <span className="text-white font-bold">{user?.fullName?.split(' ')[0]}</span>. Your growth engine is ready.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/order" className="px-6 py-3 bg-[#00c9a7] hover:bg-[#00e0ba] text-black rounded-xl font-bold transition-all flex items-center space-x-2 shadow-lg shadow-[#00c9a7]/20">
                <ShoppingBag className="w-5 h-5" />
                <span>Create New Order</span>
              </Link>
              <Link to="/wallet" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl font-bold transition-all flex items-center space-x-2">
                <span>Fund Wallet</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/feedback" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl font-bold transition-all flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Feedback</span>
              </Link>
            </div>
          </div>
          <button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
              queryClient.invalidateQueries({ queryKey: ['wallet'] });
            }}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group"
            title="Refresh Dashboard"
          >
            <Clock className={`w-6 h-6 text-[#00c9a7] group-hover:rotate-180 transition-transform duration-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#111118] border border-white/5 p-6 rounded-2xl hover:border-[#00c9a7]/30 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400 font-medium">{stat.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#111118] border border-white/5 p-6 rounded-3xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold">Recent Orders</h2>
          <Link to="/orders" className="text-[#00c9a7] hover:text-[#00e0ba] text-sm font-bold">
            View All
          </Link>
        </div>
        
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-[#00c9a7] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[#00c9a7]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-[#00c9a7]" />
            </div>
            <h3 className="text-lg font-bold mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">Start boosting your social presence with our premium services.</p>
            <Link to="/order" className="px-8 py-3 bg-[#00c9a7] text-black rounded-xl font-bold hover:bg-[#00e0ba] transition-all">
              Place First Order
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-[10px] uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="pb-4 font-bold">Order ID</th>
                  <th className="pb-4 font-bold">Service</th>
                  <th className="pb-4 font-bold">Quantity</th>
                  <th className="pb-4 font-bold">Status</th>
                  <th className="pb-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentOrders.slice(0, 5).map((order: any) => (
                  <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                    <td className="py-4 font-mono text-[#00c9a7] font-bold">
                      #{order.order_number}
                    </td>
                    <td className="py-4 font-bold text-gray-200">{order.service_name}</td>
                    <td className="py-4 text-gray-400 font-medium">{order.quantity.toLocaleString()}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {order.status !== 'completed' && (
                        <button 
                          onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'completed' })}
                          disabled={updateStatusMutation.isPending}
                          className="text-[10px] font-bold uppercase tracking-widest text-[#00c9a7] hover:text-[#00e0ba] transition-colors disabled:opacity-50"
                        >
                          Mark Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
