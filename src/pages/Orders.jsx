import React, { useEffect, useState } from 'react';
import { HiOutlineEye } from "react-icons/hi";
import apiClient from '../api/apiClient';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getOrders();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching orders:", err);
            alert('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await apiClient.updateOrderStatus(orderId, newStatus);
            alert('Order status updated successfully!');
            fetchOrders();
            if (selectedOrder && selectedOrder.order_id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
            }
        } catch (err) {
            console.error("Error updating status:", err);
            alert('Failed to update order status');
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return 'bg-green-500/20 text-green-300';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-300 animate-pulse';
            case 'processing':
                return 'bg-blue-500/20 text-blue-300';
            case 'shipped':
                return 'bg-purple-500/20 text-purple-300';
            case 'completed':
                return 'bg-emerald-500/20 text-emerald-300';
            case 'cancelled':
                return 'bg-red-500/20 text-red-300';
            default:
                return 'bg-zinc-500/20 text-zinc-300';
        }
    };

    const getStatusText = (status) => {
        if (status?.toLowerCase() === 'completed') {
            return 'DELIVERED';
        }
        return status?.toUpperCase() || 'UNKNOWN';
    };

    const getStatusOptions = (currentStatus) => {
        const statusFlow = ['pending', 'paid', 'progress', 'shipped', 'completed', 'cancelled'];
        return statusFlow;
    };

    return (
        <div className="min-h-screen bg-[#000000] text-white p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Orders Management</h1>
                <button
                    onClick={fetchOrders}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-zinc-400">Loading orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-[#121214] border border-zinc-800 rounded-lg">
                    <p className="text-zinc-400">No orders found</p>
                </div>
            ) : (
                <div className="bg-[#121214] border border-zinc-800 rounded-lg overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#1a1a1e] border-b border-zinc-800">
                                <th className="px-6 py-4 text-left text-sm font-semibold">Order ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => (
                                <tr
                                    key={order.order_id}
                                    className={`border-b border-zinc-800 hover:bg-[#1a1a1e] transition-colors ${
                                        index % 2 === 0 ? 'bg-[#121214]' : 'bg-[#0f0f12]'
                                    }`}
                                >
                                    <td className="px-6 py-4 text-sm font-mono">#{order.order_id}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="font-medium">{order.name}</div>
                                        <div className="text-xs text-zinc-500">{order.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold">₹{order.total_amount?.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <button
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setShowModal(true);
                                            }}
                                            className="text-blue-400 hover:text-blue-300 transition-colors"
                                            title="View & manage order"
                                        >
                                            <HiOutlineEye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Details Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#121214] border border-zinc-800 rounded-xl max-w-2xl w-full">
                        <div className="sticky top-0 bg-[#1a1a1e] border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Order #{selectedOrder.order_id}</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-zinc-400 hover:text-white text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-zinc-300">Customer Information</h3>
                                <div className="bg-[#0f0f12] rounded-lg p-4 space-y-2">
                                    <p className="text-sm"><span className="text-zinc-400">Name:</span> {selectedOrder.name}</p>
                                    <p className="text-sm"><span className="text-zinc-400">Email:</span> {selectedOrder.email}</p>
                                </div>
                            </div>

                            {/* Order Info */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-zinc-300">Order Details</h3>
                                <div className="bg-[#0f0f12] rounded-lg p-4 space-y-2">
                                    <p className="text-sm"><span className="text-zinc-400">Amount:</span> ₹{selectedOrder.total_amount?.toLocaleString()}</p>
                                    <p className="text-sm"><span className="text-zinc-400">Date:</span> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                                    <p className="text-sm">
                                        <span className="text-zinc-400">Current Status:</span>{' '}
                                        <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                                            {getStatusText(selectedOrder.status)}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Status Update */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-zinc-300">Update Status</h3>
                                <div className="bg-[#0f0f12] rounded-lg p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {getStatusOptions(selectedOrder.status).map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusChange(selectedOrder.order_id, status)}
                                                className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                                                    selectedOrder.status?.toLowerCase() === status
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                                }`}
                                            >
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-zinc-800">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;