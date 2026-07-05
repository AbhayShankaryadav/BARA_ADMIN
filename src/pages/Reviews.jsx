import React, { useState, useEffect } from 'react';
import { HiOutlineTrash, HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";
import apiClient from '../api/apiClient';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getReviews();
            setReviews(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            alert('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const getStarDisplay = (rating) => {
        return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    const handleApprove = async (id) => {
        await apiClient.updateReviewStatus(id, true);
        fetchReviews();
    };

    const handleReject = async (id) => {
        await apiClient.updateReviewStatus(id, false);
        fetchReviews();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            await apiClient.deleteReview(id);
            fetchReviews();
        }
    };

    return (
        <div className="min-h-screen bg-[#000000] text-white p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Customer Reviews</h1>
                <div className="flex gap-4 text-sm">
                    <div className="text-zinc-400">
                        Total: <span className="font-bold text-white">{reviews.length}</span>
                    </div>
                    <div className="text-zinc-400">
                        Approved: <span className="font-bold text-green-400">{reviews.filter(r => r.approved).length}</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-zinc-400">Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-[#121214] border border-zinc-800 rounded-lg">
                    <p className="text-zinc-400">No reviews found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                    <div
                        key={review.id}
                        className="bg-[#121214] border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-blue-400">{review.productName}</h3>
                                <p className="text-sm text-zinc-400">by {review.customerName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl mb-1">{getStarDisplay(review.rating)}</p>
                                <p className="text-xs text-zinc-500">{new Date(review.date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <p className="text-sm text-zinc-300 mb-4 leading-relaxed">{review.comment}</p>

                        <div className="flex justify-between items-center">
                            <span className={`px-3 py-1 rounded text-xs font-medium ${
                                review.approved
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-yellow-500/20 text-yellow-300'
                            }`}>
                                {review.approved ? '✓ Approved' : '⏱ Pending'}
                            </span>

                            <div className="flex gap-2">
                                {!review.approved && (
                                    <button
                                        onClick={() => handleApprove(review.id)}
                                        className="text-green-400 hover:text-green-300 transition-colors"
                                        title="Approve review"
                                    >
                                        <HiOutlineCheckCircle size={18} />
                                    </button>
                                )}
                                {review.approved && (
                                    <button
                                        onClick={() => handleReject(review.id)}
                                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                        title="Mark as pending"
                                    >
                                        <HiOutlineXCircle size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(review.id)}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                    title="Delete review"
                                >
                                    <HiOutlineTrash size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            )}
        </div>
    );
};

export default Reviews;
