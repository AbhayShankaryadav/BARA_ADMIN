import React, { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

const Categories = () => {
    const [categories, setCategories] = useState([
        { id: 1, name: 'Wood', icon: '🕰️', count: 0 },
        { id: 2, name: 'Plastic', icon: '🕰️', count: 0 },
        { id: 3, name: 'Acrylic', icon: '🕰️', count: 0 },
        { id: 4, name: 'Marble', icon: '🕰️', count: 0 },
        { id: 5, name: 'Table Clock', icon: '🕰️', count: 0 },
    ]);
    const [showModal, setShowModal] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', icon: '📦' });

    useEffect(() => {
        // Fetch counts for the static categories
        apiClient.getCategories().then(data => {
            setCategories(prev => prev.map(cat => {
                const match = data.find(d => d.name.toLowerCase() === cat.name.toLowerCase());
                return match ? { ...cat, count: match.count } : cat;
            }));
        }).catch(err => console.error("Failed to fetch category counts:", err));
    }, []);

    const handleAddCategory = (e) => {
        e.preventDefault();
        // This is now a mock function. In a real app, this would be a POST request.
        alert("This is a demo. Adding categories requires a backend implementation.");
        setShowModal(false);
    };

    const handleDelete = (id) => {
        // This is now a mock function. In a real app, this would be a DELETE request.
        alert("This is a demo. Deleting categories requires a backend implementation.");
    };

    return (
        <div className="min-h-screen bg-[#000000] text-white p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Categories</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <HiOutlinePlus /> Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => (
                    <Link
                        key={cat.id}
                        to={`/inventory?category=${encodeURIComponent(cat.name)}`}
                        className="block bg-[#121214] border border-zinc-800 rounded-lg p-6 hover:border-blue-500/50 transition-colors group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="text-4xl">{cat.icon}</div>
                            <button
                                onClick={(e) => { e.preventDefault(); handleDelete(cat.id); }}
                                className="text-red-400 hover:text-red-300 transition-colors z-10 relative"
                                title="Delete Category (Demo)"
                            >
                                <HiOutlineTrash size={18} />
                            </button>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 uppercase group-hover:text-blue-400 transition-colors">{cat.name}</h3>
                        <p className="text-sm text-zinc-400">{cat.count} products</p>
                    </Link>
                ))}
            </div>

            {/* Add Category Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#121214] border border-zinc-800 rounded-xl max-w-md w-full">
                        <div className="bg-[#1a1a1e] border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Add New Category</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-zinc-400 hover:text-white text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddCategory} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Category Name *</label>
                                <input
                                    type="text"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    required
                                    className="w-full bg-[#0f0f12] border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., Premium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Icon Emoji</label>
                                <input
                                    type="text"
                                    value={newCategory.icon}
                                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                                    maxLength="2"
                                    className="w-full bg-[#0f0f12] border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none text-2xl text-center"
                                />
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
                                    Add Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
