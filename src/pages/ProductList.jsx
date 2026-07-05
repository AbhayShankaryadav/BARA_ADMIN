import React, { useEffect, useState } from 'react';
import { HiOutlineTrash, HiOutlinePlus, HiOutlinePencil } from "react-icons/hi";
import { useLocation } from 'react-router-dom';
import apiClient from '../api/apiClient';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const location = useLocation();
    const [filterCategory, setFilterCategory] = useState('');
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        cat: '',
        desc: '',
        price: '',
        mrp: '',
        qty: '',
        material: '',
        is_featured: false,
        image: '',
        views: [],
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const category = params.get('category');
        setFilterCategory(category || '');
        fetchProducts(category);
    }, [location.search]);

    const fetchProducts = async (category) => {
        try {
            setLoading(true);
            const data = await apiClient.getProducts(category);
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching products:", err);
            alert('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingId(product.product_id);
            setFormData({
                name: product.product_name || '',
                cat: product.product_cat || '',
                desc: product.product_desc || '',
                price: product.product_price || '',
                mrp: product.product_mrp || '',
                qty: product.quantity || '',
                material: product.material || '',
                is_featured: product.is_featured ? true : false,
                image: product.image || '',
                views: product.views || [],
            });
            setImagePreview(product.image ? `http://localhost:5000${product.image}` : null);
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                cat: '',
                desc: '',
                price: '',
                mrp: '',
                qty: '',
                material: '',
                is_featured: false,
                image: '',
                views: [],
            });
            setImagePreview(null);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
            alert('Only JPG, PNG, GIF, and WebP images are allowed');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload image
        try {
            setUploading(true);
            const result = await apiClient.uploadProductImage(file);
            setFormData(prev => ({
                ...prev,
                image: result.imageUrl
            }));
            setImagePreview(`http://localhost:5000${result.imageUrl}`);
            alert('Image uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image: ' + error.message);
            setImagePreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleSubImageUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (files.length > 5) {
            alert('You can upload a maximum of 5 sub-images.');
            return;
        }

        try {
            setUploading(true);
            const result = await apiClient.uploadMultipleProductImages(files);
            setFormData(prev => ({
                ...prev,
                views: [...(prev.views || []), ...result.imageUrls]
            }));
            alert('Sub-images uploaded successfully!');
        } catch (error) {
            alert('Failed to upload sub-images: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.name || !formData.cat || !formData.desc || !formData.price || !formData.mrp || !formData.qty || !formData.material) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const submitData = { 
                ...formData,
                desc: formData.desc 
            };
            
            // If editing and no new image uploaded, keep the old one
            if (editingId && !formData.image) {
                const existingProduct = products.find(p => p.product_id === editingId);
                if (existingProduct) {
                    submitData.image = existingProduct.image;
                }
            }

            // If editing and no new sub-images uploaded, keep the old ones
            if (editingId && (!formData.views || formData.views.length === 0)) {
                const existingProduct = products.find(p => p.product_id === editingId);
                if (existingProduct) {
                    submitData.views = existingProduct.views || [];
                }
            }

            if (editingId) {
                // Update existing product
                await apiClient.updateProduct(editingId, submitData);
                alert('Product updated successfully!');
            } else {
                // Add new product
                await apiClient.addProduct(submitData);
                alert('Product added successfully!');
            }
            handleCloseModal();
            fetchProducts();
        } catch (err) {
            console.error("Error saving product:", err);
            // Extract error message from API response if available
            const errorMsg = err.message || 'Failed to save product';
            alert('Failed to save product: ' + errorMsg);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await apiClient.deleteProduct(id);
                alert('Product deleted successfully!');
                fetchProducts();
            } catch (err) {
                console.error("Error deleting product:", err);
                alert('Failed to delete product');
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#000000] text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">
                    {filterCategory ? `${filterCategory} Products` : 'Products Inventory'}
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <HiOutlinePlus /> Add Product
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-zinc-400">Loading products...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-zinc-400 mb-4">No products found</p>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg inline-flex items-center gap-2"
                    >
                        <HiOutlinePlus /> Add First Product
                    </button>
                </div>
            ) : (
                <>
                    <div className="hidden md:block bg-[#121214] border border-zinc-800 rounded-lg overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#1a1a1e] border-b border-zinc-800">
                                <th className="px-6 py-4 text-left text-sm font-semibold">Image</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Product Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Price</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">MRP</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Quantity</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Material</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Featured</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => (
                                <tr 
                                    key={product.product_id} 
                                    className={`border-b border-zinc-800 hover:bg-[#1a1a1e] transition-colors ${
                                        index % 2 === 0 ? 'bg-[#121214]' : 'bg-[#0f0f12]'
                                    }`}
                                >
                                    <td className="px-6 py-4 text-sm">
                                        <div className="w-12 h-12 bg-[#0f0f12] border border-zinc-700 rounded overflow-hidden">
                                            {product.image ? (
                                                <img 
                                                    src={`http://localhost:5000${product.image}`} 
                                                    alt={product.product_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-500">📷</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="font-medium line-clamp-1">{product.product_name}</div>
                                        <div className="text-xs text-zinc-500 line-clamp-1">{product.product_desc}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{product.product_cat}</td>
                                    <td className="px-6 py-4 text-sm">₹{product.product_price}</td>
                                    <td className="px-6 py-4 text-sm">₹{product.product_mrp}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            product.quantity < 5 ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                                        }`}>
                                            {product.quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{product.material}</td>
                                    <td className="px-6 py-4 text-sm">
                                        {product.is_featured ? (
                                            <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs">✓ Yes</span>
                                        ) : (
                                            <span className="text-zinc-500">No</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenModal(product)}
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                                title="Edit product"
                                            >
                                                <HiOutlinePencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.product_id)}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                                title="Delete product"
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
                {/* Mobile Card View */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {products.map(product => (
                        <div key={product.product_id} className="bg-[#121214] border border-zinc-800 rounded-lg p-4 space-y-3">
                            <div className="flex gap-4">
                                <img src={`http://localhost:5000${product.image}`} alt={product.product_name} className="w-16 h-16 object-cover rounded-md border border-zinc-700" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-white">{product.product_name}</h3>
                                    <p className="text-xs text-zinc-400">{product.product_cat}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs border-t border-zinc-800 pt-3">
                                <div className="text-zinc-400">Price: <span className="font-semibold text-white">₹{product.product_price}</span></div>
                                <div className="text-zinc-400">MRP: <span className="font-semibold text-white">₹{product.product_mrp}</span></div>
                                <div className="text-zinc-400">Stock: 
                                    <span className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${
                                        product.quantity < 5 ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                                    }`}>
                                        {product.quantity}
                                    </span>
                                </div>
                                <div className="text-zinc-400">Featured: 
                                    {product.is_featured ? (
                                        <span className="ml-1 bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded text-xs">✓ Yes</span>
                                    ) : (
                                        <span className="text-zinc-500 ml-1">No</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 border-t border-zinc-800 pt-3">
                                <button
                                    onClick={() => handleOpenModal(product)}
                                    className="text-blue-400 hover:text-blue-300 transition-colors p-2 bg-blue-500/10 rounded-md"
                                    title="Edit product"
                                >
                                    <HiOutlinePencil size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(product.product_id)}
                                    className="text-red-400 hover:text-red-300 transition-colors p-2 bg-red-500/10 rounded-md"
                                    title="Delete product"
                                >
                                    <HiOutlineTrash size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                </>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#121214] border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-[#1a1a1e] border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-zinc-400 hover:text-white text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Image Upload Section */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Product Image</label>
                                <div className="flex gap-4">
                                    {/* Image Preview */}
                                    <div className="w-24 h-24 bg-[#0f0f12] border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center overflow-hidden">
                                        {imagePreview ? (
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-2xl">📷</span>
                                        )}
                                    </div>

                                    {/* Upload Input */}
                                    <div className="flex-1">
                                        <label className="block">
                                            <div className="w-full bg-[#0f0f12] border-2 border-dashed border-zinc-700 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    disabled={uploading}
                                                    className="hidden"
                                                />
                                                <p className="text-xs text-zinc-400">
                                                    {uploading ? 'Uploading...' : 'Click to upload image'}
                                                </p>
                                                <p className="text-[10px] text-zinc-500 mt-1">Max 5MB • JPG, PNG, GIF, WebP</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Sub-Images Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Sub-Images (Views)</label>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
                                    {(formData.views || []).map((viewUrl, index) => (
                                        <div key={index} className="relative aspect-square border border-zinc-700 rounded-lg overflow-hidden">
                                            <img src={`http://localhost:5000${viewUrl}`} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, views: prev.views.filter((_, i) => i !== index) }))}
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <label className="block">
                                    <div className="w-full bg-[#0f0f12] border-2 border-dashed border-zinc-700 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleSubImageUpload}
                                            disabled={uploading}
                                            className="hidden"
                                        />
                                        <p className="text-xs text-zinc-400">
                                            {uploading ? 'Uploading...' : 'Click to add sub-images'}
                                        </p>
                                        <p className="text-[10px] text-zinc-500 mt-1">Up to 5 images</p>
                                    </div>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Product Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-[#0f0f12] border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., Rolex Submariner"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Category *</label>
                                    <select
                                        name="cat"
                                        value={formData.cat}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-[#0f0f12] border border-zinc-700 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Wood">Wood</option>
                                        <option value="Plastic">Plastic</option>
                                        <option value="Acrylic">Acrylic</option>
                                        <option value="Marble">Marble</option>
                                        <option value="Table Clock">Table Clock</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        step="0.01"
                                        className="w-full bg-[#0f0f12] border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                                        placeholder="9999"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">MRP (₹) *</label>
                                    <input
                                        type="number"
                                        name="mrp"
                                        value={formData.mrp}
                                        onChange={handleInputChange}
                                        required
                                        step="0.01"
                                        className="w-full bg-[#0f0f12] border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                                        placeholder="12999"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Quantity *</label>
                                    <input
                                        type="number"
                                        name="qty"
                                        value={formData.qty}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-[#0f0f12] border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                                        placeholder="50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Material *</label>
                                    <input
                                        type="text"
                                        name="material"
                                        value={formData.material}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-[#0f0f12] border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., Stainless Steel"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description *</label>
                                <textarea
                                    name="desc"
                                    value={formData.desc}
                                    onChange={handleInputChange} // This correctly updates `formData.desc`
                                    required
                                    rows="4"
                                    className="w-full bg-[#0f0f12] border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                                    placeholder="Product description..."
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="is_featured"
                                    id="is_featured"
                                    checked={formData.is_featured}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 rounded border-zinc-700 cursor-pointer"
                                />
                                <label htmlFor="is_featured" className="text-sm font-medium cursor-pointer">
                                    Mark as Featured Product
                                </label>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-zinc-800">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    {editingId ? 'Update Product' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;