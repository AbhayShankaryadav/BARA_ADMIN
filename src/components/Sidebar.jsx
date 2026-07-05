import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HiOutlineViewGrid, HiOutlineTag, HiOutlineCube, 
  HiOutlineTicket, HiOutlineShoppingCart, HiOutlineUsers, 
  HiOutlineStar, HiOutlinePhotograph, HiOutlineLogout
} from "react-icons/hi";
import apiClient from '../api/apiClient';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { name: 'Dashboard', icon: <HiOutlineViewGrid />, path: '/' },
    { name: 'Categories', icon: <HiOutlineTag />, path: '/categories' },
    { name: 'Products', icon: <HiOutlineCube />, path: '/inventory' },
    { name: 'Coupons', icon: <HiOutlineTicket />, path: '/coupons' },
    { name: 'Orders', icon: <HiOutlineShoppingCart />, path: '/orders' },
    { name: 'Customers', icon: <HiOutlineUsers />, path: '/customers' },
    { name: 'Reviews', icon: <HiOutlineStar />, path: '/reviews' },
    { name: 'Media', icon: <HiOutlinePhotograph />, path: '/media' },
  ];

  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await apiClient.getPendingOrdersCount();
        setPendingOrders(data.count);
      } catch (error) {
        console.error("Failed to fetch pending orders count:", error);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    alert('Logout functionality - integrate with your auth system');
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className={`w-64 bg-[#0f0f12] min-h-screen text-[#9ca3af] p-4 flex flex-col fixed left-0 top-0 border-r border-zinc-800 z-50 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-4 py-6 mb-8 border-b border-zinc-800 pb-6">
          <div className="bg-linear-to-br from-purple-600 to-blue-600 p-2 rounded-lg">
            <HiOutlineShoppingCart className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-white text-lg font-bold tracking-tight">BARA</h1>
            <p className="text-[10px] text-zinc-500 uppercase">Admin</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose} // Close sidebar on navigation
              className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm transition-all ${
                isActive(item.path) 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                  : 'hover:bg-zinc-800 hover:text-white text-zinc-400'
              }`}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              <span className="truncate">{item.name}</span>
              {item.name === 'Orders' && pendingOrders > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                  {pendingOrders}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer Section */}
        <div className="border-t border-zinc-800 pt-4 space-y-2">
          <div className="px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Admin User</p>
            <p className="text-sm font-medium text-white mt-1">Admin Panel</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm transition-all hover:bg-red-600/20 hover:text-red-400 text-zinc-400"
          >
            <HiOutlineLogout className="text-lg shrink-0" />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;