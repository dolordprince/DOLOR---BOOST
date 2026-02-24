import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { ShoppingBag, Search, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BackButton from '../components/BackButton';

export default function Order() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/services/categories');
      return res.data;
    }
  });

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/services');
      return res.data;
    }
  });

  const orderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await axios.post('/api/v1/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    onSuccess: (data) => {
      setSuccess(`Order #${data.orderNumber} placed successfully!`);
      setSelectedService(null);
      setLink('');
      setQuantity(0);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setTimeout(() => setSuccess(null), 5000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to place order');
      setTimeout(() => setError(null), 5000);
    }
  });

  const filteredServices = services?.filter((s: any) => {
    const matchesCategory = selectedCategory ? s.category_id === selectedCategory : true;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !link || quantity < selectedService.min_quantity) return;
    orderMutation.mutate({
      serviceId: selectedService.id,
      link,
      quantity
    });
  };

  const totalPrice = selectedService ? (selectedService.price_per_1000 / 1000) * quantity : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 relative z-10"
    >
      <BackButton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search services..." 
              className="w-full bg-[#111118] border border-white/5 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#00c9a7] transition-colors font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button 
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${!selectedCategory ? 'bg-[#00c9a7] text-black' : 'bg-[#111118] text-gray-400 hover:bg-white/5 border border-white/5'}`}
            >
              All
            </button>
            {categories?.map((cat: any) => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-[#00c9a7] text-black' : 'bg-[#111118] text-gray-400 hover:bg-white/5 border border-white/5'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices?.map((service: any) => (
            <motion.div 
              layout
              key={service.id}
              onClick={() => setSelectedService(service)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedService?.id === service.id ? 'bg-[#00c9a7]/10 border-[#00c9a7] ring-1 ring-[#00c9a7]' : 'bg-[#111118] border-white/5 hover:border-[#00c9a7]/30'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00c9a7]">{service.platform}</span>
                <span className="text-sm font-bold text-white">₦{service.price_per_1000.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal">/ 1k</span></span>
              </div>
              <h3 className="font-bold text-sm mb-2 line-clamp-1">{service.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 mb-4 font-medium">{service.description}</p>
              <div className="flex items-center space-x-4 text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                <span>Min: {service.min_quantity}</span>
                <span>Max: {service.max_quantity.toLocaleString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Order Form */}
      <div className="lg:col-span-1">
        <div className="bg-[#111118] border border-white/5 p-6 rounded-3xl sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#00c9a7]" />
              <span>Place Order</span>
            </h2>
            <button 
              onClick={() => {
                setSelectedService(null);
                setLink('');
                setQuantity(0);
              }}
              className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest font-bold transition-colors"
            >
              Clear
            </button>
          </div>

          <AnimatePresence mode="wait">
            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-[#00c9a7]/10 border border-[#00c9a7]/20 rounded-xl text-[#00c9a7] text-sm flex items-start space-x-3"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="font-medium">{success}</span>
              </motion.div>
            )}
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start space-x-3"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Selected Service</label>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-sm font-bold text-gray-300">
                {selectedService ? selectedService.name : 'Please select a service'}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Target Link</label>
              <input 
                type="url" 
                required
                placeholder="https://instagram.com/p/..."
                className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-[#00c9a7] transition-colors text-sm font-medium"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Quantity</label>
              <input 
                type="number" 
                required
                min={selectedService?.min_quantity || 0}
                max={selectedService?.max_quantity || 1000000}
                className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-[#00c9a7] transition-colors text-sm font-medium"
                value={quantity || ''}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
              {selectedService && (
                <p className="mt-2 text-[10px] text-gray-600 font-bold">
                  Min: {selectedService.min_quantity} - Max: {selectedService.max_quantity.toLocaleString()}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-gray-500 font-bold uppercase tracking-widest">Total Price</span>
                <span className="text-2xl font-bold text-white">₦{totalPrice.toLocaleString()}</span>
              </div>

              <button 
                type="submit"
                disabled={!selectedService || !link || !quantity || orderMutation.isPending}
                className="w-full py-4 bg-[#00c9a7] hover:bg-[#00e0ba] disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-2xl font-bold transition-all shadow-lg shadow-[#00c9a7]/20"
              >
                {orderMutation.isPending ? 'Processing...' : 'Place Order Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </motion.div>
  );
}
