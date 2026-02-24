import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { ShoppingBag, CheckCircle, Clock, AlertCircle, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import BackButton from '../components/BackButton';

export default function Orders() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['all-user-orders'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.orders;
    },
    enabled: !!token
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      return axios.patch(`/api/v1/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-user-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });

  const getStatusColor = (status: string) => {
    const colors: any = {
      completed: 'text-[#00c9a7] bg-[#00c9a7]/10',
      processing: 'text-yellow-400 bg-yellow-400/10',
      pending: 'text-gray-400 bg-gray-400/10',
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
      <BackButton />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">My Orders</h1>
          <p className="text-gray-500 font-medium">Track and manage your growth progress</p>
        </div>
      </div>

      <div className="bg-[#111118] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#00c9a7] transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-[10px] uppercase tracking-[0.2em] bg-white/5">
                <th className="p-6 font-bold">Order Info</th>
                <th className="p-6 font-bold">Service</th>
                <th className="p-6 font-bold">Quantity</th>
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="w-8 h-8 border-2 border-[#00c9a7] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : !orders || orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="w-16 h-16 bg-[#00c9a7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8 text-[#00c9a7]" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">No orders found</h3>
                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                  </td>
                </tr>
              ) : orders.map((order: any) => (
                <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                  <td className="p-6">
                    <div className="font-mono text-[#00c9a7] font-bold mb-1">#{order.order_number}</div>
                    <div className="text-[10px] text-gray-500 font-medium truncate max-w-[200px]">{order.link}</div>
                  </td>
                  <td className="p-6 font-bold text-gray-200">{order.service_name}</td>
                  <td className="p-6 text-gray-400 font-medium">{order.quantity.toLocaleString()}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    {order.status !== 'completed' && (
                      <button 
                        onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'completed' })}
                        className="text-[10px] font-bold uppercase tracking-widest text-[#00c9a7] hover:text-[#00e0ba] transition-colors"
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
      </div>
    </motion.div>
  );
}
