import React, { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import apiClient from '../api/apiClient';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discount: '',
        expiry: '',
        active: true,
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const data = await apiClient.getCoupons();
            setCoupons(Array.isArray(data) ? data : []);
        } catch (err) {
            alert('Failed to load coupons.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCoupon = async (e) => {
        e.preventDefault();
        if (formData.code.trim() && formData.discount) {
            await apiClient.addCoupon(formData);
            setFormData({ code: '', discount: '', expiry: '', active: true });
            setShowModal(false);
            fetchCoupons();
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            await apiClient.deleteCoupon(id);
            fetchCoupons();
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        await apiClient.updateCouponStatus(id, !currentStatus);
        fetchCoupons();
    };

    return (
        <div className="min-h-screen bg-[#000000] text-white p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Coupons & Discounts</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <HiOutlinePlus /> Add Coupon
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-zinc-400">Loading coupons...</div>
            ) : coupons.length === 0 ? (
                <div className="text-center py-12 bg-[#121214] border border-zinc-800 rounded-lg">
                    <p className="text-zinc-400 mb-4">No coupons found</p>
                </div>
            ) : (
                <div className="bg-[#121214] border border-zinc-800 rounded-lg overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#1a1a1e] border-b border-zinc-800">
                                <th className="px-6 py-4 text-left text-sm font-semibold">Coupon Code</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Discount</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Expiry Date</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Usage</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon, index) => (
                                <tr
                                    key={coupon.id}
                                    className={`border-b border-zinc-800 hover:bg-[#1a1a1e] transition-colors ${
                                        index % 2 === 0 ? 'bg-[#121214]' : 'bg-[#0f0f12]'
                                    }`}
                                >
                                    <td className="px-6 py-4 text-sm font-mono font-bold text-blue-400">{coupon.code}</td>
                                    <td className="px-6 py-4 text-sm font-semibold">{coupon.discount}%</td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">
                                        {new Date(coupon.expiry).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm">{coupon.usage_count || 0} times</td>
                                    <td className="px-6 py-4 text-sm">
                                        <button
                                            onClick={() => handleToggleActive(coupon.id, coupon.active)}
                                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                                coupon.active
                                                    ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                                                    : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                                            }`}
                                        >
                                            {coupon.active ? '✓ Active' : '✕ Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className="text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            <HiOutlineTrash size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Coupon Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#121214] border border-zinc-800 rounded-xl max-w-md w-full">
                        <div className="bg-[#1a1a1e] border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Add New Coupon</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-zinc-400 hover:text-white text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddCoupon} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Coupon Code *</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    required
                                    className="w-full bg-[#0f0f12] border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none uppercase"
                                    placeholder="e.g., WELCOME20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Discount % *</label>
                                <input
                                    type="number"
                                    value={formData.discount}
                                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                    required
                                    min="1"
                                    max="100"
                                    className="w-full bg-[#0f0f12] border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                                    placeholder="20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                                <input
                                    type="date"
                                    value={formData.expiry}
                                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                                    required
                                    className="w-full bg-[#0f0f12] border border-zinc-700 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="w-4 h-4 rounded border-zinc-700 cursor-pointer"
                                />
                                <label htmlFor="active" className="text-sm font-medium cursor-pointer">
                                    Activate immediately
                                </label>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Add Coupon
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Coupons;
