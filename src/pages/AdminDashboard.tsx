import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { ShoppingBag, Users, TrendingUp, Shield, Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import BackButton from '../components/BackButton';

export default function AdminDashboard() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: allOrders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
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
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
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
          <h1 className="font-display text-4xl font-bold tracking-tight flex items-center space-x-3">
            <Shield className="w-8 h-8 text-[#00c9a7]" />
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-gray-500 font-medium">Manage all platform activities and orders</p>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111118] border border-white/5 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#00c9a7]/10 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-[#00c9a7]" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{allOrders?.length || 0}</div>
          <div className="text-sm text-gray-500 font-bold uppercase tracking-widest">Total Orders</div>
        </div>
        <div className="bg-[#111118] border border-white/5 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-400/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">
            {allOrders?.filter((o: any) => o.status === 'pending').length || 0}
          </div>
          <div className="text-sm text-gray-500 font-bold uppercase tracking-widest">Pending Orders</div>
        </div>
        <div className="bg-[#111118] border border-white/5 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-400/10 rounded-xl">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">Active</div>
          <div className="text-sm text-gray-500 font-bold uppercase tracking-widest">System Status</div>
        </div>
      </div>

      {/* Orders Management */}
      <div className="bg-[#111118] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Order Management</h2>
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
                <th className="p-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="w-8 h-8 border-2 border-[#00c9a7] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : allOrders?.map((order: any) => (
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
                    <div className="flex items-center justify-end space-x-2">
                      {order.status !== 'completed' && (
                        <button 
                          onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'completed' })}
                          className="p-2 bg-[#00c9a7]/10 text-[#00c9a7] rounded-lg hover:bg-[#00c9a7] hover:text-black transition-all"
                          title="Complete Order"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {order.status !== 'failed' && (
                        <button 
                          onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'failed' })}
                          className="p-2 bg-red-400/10 text-red-400 rounded-lg hover:bg-red-400 hover:text-white transition-all"
                          title="Mark Failed"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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
