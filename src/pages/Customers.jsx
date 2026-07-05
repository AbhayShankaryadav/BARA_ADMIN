import React, { useState, useEffect } from 'react';
import { HiOutlineEye, HiOutlineTrash } from "react-icons/hi";
import apiClient from '../api/apiClient';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getCustomers();
            setCustomers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching customers:", err);
            alert('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (customer) => {
        setSelectedCustomer(customer);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await apiClient.deleteCustomer(id);
                fetchCustomers(); // Refresh the list
            } catch (err) {
                alert('Failed to delete customer.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#000000] text-white p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Customers</h1>
                <div className="text-sm text-zinc-400">
                    Total Customers: <span className="font-bold text-white">{customers.length}</span>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-zinc-400">Loading customers...</div>
            ) : customers.length === 0 ? (
                <div className="text-center py-12 bg-[#121214] border border-zinc-800 rounded-lg">
                    <p className="text-zinc-400">No customers found</p>
                </div>
            ) : (
                <div className="bg-[#121214] border border-zinc-800 rounded-lg overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#1a1a1e] border-b border-zinc-800">
                                <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Phone</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Orders</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Total Spent</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Join Date</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer, index) => (
                                <tr
                                    key={customer.id}
                                    className={`border-b border-zinc-800 hover:bg-[#1a1a1e] transition-colors ${
                                        index % 2 === 0 ? 'bg-[#121214]' : 'bg-[#0f0f12]'
                                    }`}
                                >
                                    <td className="px-6 py-4 text-sm font-medium">{customer.name}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">{customer.email}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">{customer.phone}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                                            {customer.totalOrders}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold">₹{customer.totalSpent?.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">
                                        {new Date(customer.joinDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewDetails(customer)}
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                <HiOutlineEye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(customer.id)}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <HiOutlineTrash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Customer Details Modal */}
            {showModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#121214] border border-zinc-800 rounded-xl max-w-md w-full">
                        <div className="bg-[#1a1a1e] border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Customer Details</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-zinc-400 hover:text-white text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-[#0f0f12] rounded-lg p-4">
                                <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Name</p>
                                <p className="text-lg font-semibold">{selectedCustomer.name}</p>
                            </div>

                            <div className="bg-[#0f0f12] rounded-lg p-4">
                                <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Email</p>
                                <p className="text-sm break-all">{selectedCustomer.email}</p>
                            </div>

                            <div className="bg-[#0f0f12] rounded-lg p-4">
                                <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Phone</p>
                                <p className="text-sm">{selectedCustomer.phone}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#0f0f12] rounded-lg p-4">
                                    <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Orders</p>
                                    <p className="text-2xl font-bold text-blue-400">{selectedCustomer.totalOrders}</p>
                                </div>

                                <div className="bg-[#0f0f12] rounded-lg p-4">
                                    <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Total Spent</p>
                                    <p className="text-2xl font-bold text-green-400">₹{selectedCustomer.totalSpent}</p>
                                </div>
                            </div>

                            <div className="bg-[#0f0f12] rounded-lg p-4">
                                <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Join Date</p>
                                <p className="text-sm">{new Date(selectedCustomer.joinDate).toLocaleString()}</p>
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

export default Customers;
