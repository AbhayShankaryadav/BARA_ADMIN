import React, { useState } from 'react';
import { HiOutlineTrash, HiOutlinePhotograph } from "react-icons/hi";

const Media = () => {
    const [mediaItems, setMediaItems] = useState([
        { id: 1, name: 'rolex-sub-hero.jpg', type: 'image/jpeg', size: '2.4 MB', uploadDate: '2024-05-15', url: '🖼️' },
        { id: 2, name: 'watch-collection.png', type: 'image/png', size: '1.8 MB', uploadDate: '2024-05-14', url: '🖼️' },
        { id: 3, name: 'product-showcase.jpg', type: 'image/jpeg', size: '3.1 MB', uploadDate: '2024-05-13', url: '🖼️' },
        { id: 4, name: 'banner-summer.jpg', type: 'image/jpeg', size: '2.7 MB', uploadDate: '2024-05-10', url: '🖼️' },
        { id: 5, name: 'testimonial-section.png', type: 'image/png', size: '1.5 MB', uploadDate: '2024-05-08', url: '🖼️' },
    ]);
    const [showUpload, setShowUpload] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this media?')) {
            setMediaItems(mediaItems.filter(m => m.id !== id));
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        alert('File upload feature - connect to your backend storage service');
    };

    const handleFileSelect = (e) => {
        alert('File upload feature - connect to your backend storage service');
    };

    return (
        <div className="min-h-screen bg-[#000000] text-white p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Media Library</h1>
                <button
                    onClick={() => setShowUpload(!showUpload)}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <HiOutlinePhotograph /> Upload Media
                </button>
            </div>

            {showUpload && (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors ${
                        dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-700 bg-[#0f0f12]'
                    }`}
                >
                    <HiOutlinePhotograph className="mx-auto text-4xl mb-4 text-zinc-400" />
                    <p className="text-lg font-medium mb-2">Drag and drop files here</p>
                    <p className="text-sm text-zinc-400 mb-4">or</p>
                    <label className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg inline-block cursor-pointer transition-colors">
                        Browse Files
                        <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </label>
                    <p className="text-xs text-zinc-500 mt-4">Supported formats: JPG, PNG, GIF, MP4, WebM</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaItems.map((item) => (
                    <div
                        key={item.id}
                        className="bg-[#121214] border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors group"
                    >
                        <div className="aspect-square bg-linear-to-br from-zinc-900 to-black flex items-center justify-center relative overflow-hidden">
                            <span className="text-6xl opacity-50">{item.url}</span>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-2 bg-black/50 rounded-full"
                                    title="Delete media"
                                >
                                    <HiOutlineTrash size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="font-medium text-sm line-clamp-1 mb-2">{item.name}</h3>
                            <div className="space-y-1 text-xs text-zinc-400">
                                <p>{item.type}</p>
                                <p>{item.size}</p>
                                <p>{new Date(item.uploadDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {mediaItems.length === 0 && !showUpload && (
                <div className="text-center py-12 bg-[#121214] border border-zinc-800 rounded-lg">
                    <HiOutlinePhotograph className="mx-auto text-4xl mb-4 text-zinc-400" />
                    <p className="text-zinc-400 mb-4">No media files uploaded yet</p>
                    <button
                        onClick={() => setShowUpload(true)}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                    >
                        Upload First Media
                    </button>
                </div>
            )}

            <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                    💡 <strong>Tip:</strong> Connect your media library to a cloud storage service like AWS S3, Cloudinary, or Firebase for production use.
                </p>
            </div>
        </div>
    );
};

export default Media;
