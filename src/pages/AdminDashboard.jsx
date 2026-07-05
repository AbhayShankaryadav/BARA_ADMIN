import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SalesChart from '../components/SalesChart';
import apiClient from '../api/apiClient';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, lowStock: 0, totalProducts: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white p-8">
      {/* Top Header Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.revenue?.toLocaleString() || 0}`} 
          icon="💰" 
          color="bg-[#10b981]"
          loading={loading}
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders || 0} 
          icon="📦" 
          color="bg-[#3b82f6]"
          loading={loading}
        />
        <StatCard 
          title="Low Stock Items" 
          value={stats.lowStock || 0} 
          icon="⚠️" 
          color="bg-[#f59e0b]"
          loading={loading}
        />
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts || 0} 
          icon="🛍️" 
          color="bg-[#06b6d4]"
          loading={loading}
        />
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <ActionButton 
          title="Add Product" 
          color="bg-[#3b82f6]" 
          onClick={() => navigate('/inventory')}
        />
        <ActionButton 
          title="View Orders" 
          color="bg-[#06b6d4]"
          onClick={() => navigate('/orders')}
        />
        <ActionButton 
          title="Manage Categories" 
          color="bg-[#f59e0b]"
          onClick={() => navigate('/categories')}
        />
        <ActionButton 
          title="View Coupons" 
          color="bg-[#10b981]"
          onClick={() => navigate('/coupons')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#121214] p-6 rounded-xl border border-zinc-800">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-zinc-400">Sales Overview (Last 7 Days)</h3>
              <button 
                onClick={fetchStats}
                className="text-[10px] bg-purple-600 px-3 py-1 rounded text-white hover:bg-purple-700"
              >
                Refresh
              </button>
           </div>
           <SalesChart darkTheme={true} />
        </div>
        
        <div className="bg-[#121214] p-6 rounded-xl border border-zinc-800">
          <h3 className="font-semibold text-zinc-400 mb-6">Order Summary</h3>
          <div className="h-48 w-48 mx-auto rounded-full border-[15px] border-purple-600 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.totalOrders || 0}</p>
              <p className="text-[10px] text-zinc-500 uppercase mt-2">Total Orders</p>
              <p className="text-xs text-green-400 mt-4">Revenue: ₹{stats.revenue?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color, loading }) => (
  <div className={`${color} p-4 rounded-xl flex justify-between items-center text-white shadow-lg transition-opacity ${loading ? 'opacity-60' : ''}`}>
    <div>
      <p className="text-xs font-medium opacity-80">{title}</p>
      <p className="text-xl font-bold">{loading ? '...' : value}</p>
    </div>
    <div className="bg-white/20 p-2 rounded-lg text-2xl">📊</div>
  </div>
);

const ActionButton = ({ title, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`${color} p-4 rounded-xl flex justify-between items-center hover:opacity-90 transition-opacity text-white`}
  >
    <span className="text-sm font-semibold">{title}</span>
    <span className="bg-white/20 p-1 rounded-md text-xs">→</span>
  </button>
);

export default AdminDashboard;