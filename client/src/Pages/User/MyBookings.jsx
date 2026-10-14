import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IoCalendarOutline, IoTimeOutline, IoLocationOutline, IoSearchOutline, IoReceiptOutline, IoRefreshOutline, IoStar, IoStarOutline, IoCloseOutline } from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

const API_URL = import.meta.env.VITE_SERVER_URL;

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);
    const [feedbackTarget, setFeedbackTarget] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedbackBookings, setFeedbackBookings] = useState([]);
    const [disputeTarget, setDisputeTarget] = useState(null);
    const [disputeSubject, setDisputeSubject] = useState("");
    const [disputeDescription, setDisputeDescription] = useState("");
    const [submittingDispute, setSubmittingDispute] = useState(false);
    const [disputeBookings, setDisputeBookings] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await fetch(`${API_URL}/booking/my`, {
                credentials: "include"
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to fetch bookings.");
            setBookings(data.bookings || []);
        } catch (err) {
            setError(err.message || "Unable to load your bookings.");
        } finally {
            setLoading(false);
        }
    };

    const fetchFeedbackBookings = async () => {
        try {
            const response = await fetch(`${API_URL}/feedback/my`, {
                credentials: "include"
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to load reviews.");

            const feedback = data.feedbackBookings || data.feedback || data.reviews || [];
            setFeedbackBookings(Array.isArray(feedback) ? feedback : []);
        } catch (err) {
            console.error("Fetch feedback error:", err);
        }
    };

    const fetchMyDisputes = async () => {
        try {
            const response = await fetch(`${API_URL}/dispute/my`, {
                credentials: "include"
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to fetch disputes.");

            setDisputeBookings(Array.isArray(data.disputes) ? data.disputes : []);
        } catch (err) {
            console.error("Fetch disputes error:", err);
            toast.error(err.message || "Failed to load disputes.");
        }
    };

    const refreshBookingDetails = async () => {
        await Promise.all([
            fetchBookings(),
            fetchFeedbackBookings(),
            fetchMyDisputes()
        ]);
    };

    useEffect(() => {
        if (location.state?.message) {
            toast.success(location.state.message);
            navigate(location.pathname, { replace: true, state: null });
        }
    }, [location.state, location.pathname, navigate]);

    useEffect(() => {
        refreshBookingDetails();
    }, []);

    const filteredBookings = useMemo(() => {
        return bookings.filter((booking) => {
            const ritualName = booking.ritual?.name || "";
            const matchesSearch = ritualName.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [bookings, search, statusFilter]);

    const upcomingBookings = bookings.filter((booking) =>
        ["pending", "confirmed"].includes(booking.status) &&
        new Date(booking.bookingDate) >= new Date(new Date().setHours(0, 0, 0, 0))
    ).length;

    const formatDate = (date) => {
        if (!date) return "Date not available";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const formatStatus = (status) => {
        const labels = {
            pending: "Pending",
            confirmed: "Confirmed",
            rejected: "Rejected",
            cancelled: "Cancelled",
            completed: "Completed"
        };
        return labels[status] || status || "Unknown";
    };

    const statusClasses = (status) => {
        const classes = {
            pending: "bg-amber-100 text-amber-800",
            confirmed: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-700",
            cancelled: "bg-gray-100 text-gray-600",
            completed: "bg-blue-100 text-blue-800"
        };
        return classes[status] || "bg-gray-100 text-gray-600";
    };

    const getAddress = (address) => {
        if (!address) return "Address not available";
        return [
            address.house,
            address.street,
            address.area,
            address.city,
            address.state,
            address.pincode
        ].filter(Boolean).join(", ") || "Address not available";
    };

    const getReferenceId = (value) => {
        if (!value) return "";
        return String(typeof value === "object" ? value._id || value.id || "" : value);
    };

    const getMyFeedback = (bookingId) => {
        return feedbackBookings.find((item) =>
            getReferenceId(item.booking) === String(bookingId) ||
            getReferenceId(item.booking?._id) === String(bookingId)
        );
    };

    const hasFeedback = (bookingId) => Boolean(getMyFeedback(bookingId));

    const getMyDispute = (bookingId) => {
        return disputeBookings.find((dispute) =>
            getReferenceId(dispute.booking) === String(bookingId) &&
            dispute.raisedBy === "user"
        );
    };

    const handleCancelBooking = async () => {
        if (!cancelTarget || cancellingId) return;
        const bookingId = cancelTarget._id;

        try {
            setCancellingId(bookingId);
            const response = await fetch(`${API_URL}/booking/cancel/${bookingId}`, {
                method: "PATCH",
                credentials: "include"
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to cancel booking.");

            setBookings((prev) => prev.map((booking) =>
                booking._id === bookingId ? { ...booking, status: "cancelled" } : booking
            ));
            setCancelTarget(null);
            toast.success(data.message || "Booking cancelled successfully.");
        } catch (err) {
            toast.error(err.message || "Failed to cancel booking.");
        } finally {
            setCancellingId(null);
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!feedbackTarget || submittingFeedback) return;

        try {
            setSubmittingFeedback(true);
            const response = await fetch(`${API_URL}/feedback/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    bookingId: feedbackTarget._id,
                    rating,
                    comment: comment.trim()
                })
            });
            const data = await response.json();
            if (!response.ok || data.error) {
                throw new Error(data.error || "Failed to submit feedback.");
            }

            setFeedbackTarget(null);
            setRating(5);
            setComment("");
            toast.success(data.message || "Feedback submitted successfully.");
            await fetchFeedbackBookings();
        } catch (err) {
            toast.error(err.message || "Failed to submit feedback.");
        } finally {
            setSubmittingFeedback(false);
        }
    };

    const handleDisputeSubmit = async (e) => {
        e.preventDefault();
        if (!disputeTarget || submittingDispute) return;

        if (!disputeSubject.trim() || !disputeDescription.trim()) {
            toast.error("Please enter the subject and description.");
            return;
        }

        try {
            setSubmittingDispute(true);
            const response = await fetch(`${API_URL}/dispute/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    booking: disputeTarget._id,
                    subject: disputeSubject.trim(),
                    description: disputeDescription.trim()
                })
            });
            const data = await response.json();
            if (!response.ok || data.error) {
                throw new Error(data.error || "Failed to raise dispute.");
            }

            toast.success(data.message || "Dispute raised successfully.");
            setDisputeTarget(null);
            setDisputeSubject("");
            setDisputeDescription("");
            await fetchMyDisputes();
        } catch (err) {
            toast.error(err.message || "Failed to raise dispute.");
        } finally {
            setSubmittingDispute(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#FBF6EE] px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#C2572C]">Your Puja Journey</p>
                        <h1 className="text-3xl font-bold text-[#2B1B12] sm:text-4xl">My Bookings</h1>
                        <p className="mt-2 text-[#7A6A5D]">View and manage your puja bookings in one place.</p>
                    </div>

                    <div className="mb-8 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[#E8DCC8] bg-white p-5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-[#F8E8E5] p-3 text-[#7A1F2B]">
                                    <IoReceiptOutline size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-[#7A6A5D]">Total Bookings</p>
                                    <p className="text-2xl font-bold text-[#2B1B12]">{bookings.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-[#E8DCC8] bg-white p-5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-[#FFF2D6] p-3 text-[#9A6500]">
                                    <IoCalendarOutline size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-[#7A6A5D]">Upcoming Bookings</p>
                                    <p className="text-2xl font-bold text-[#2B1B12]">{upcomingBookings}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A6A5D]" size={20} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by puja name..."
                                className="w-full rounded-xl border border-[#E8DCC8] bg-white py-3 pl-12 pr-4 outline-none focus:border-[#7A1F2B]"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-xl border border-[#E8DCC8] bg-white px-4 py-3 text-[#2B1B12] outline-none focus:border-[#7A1F2B]"
                        >
                            <option value="all">All Bookings</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="rounded-2xl border border-[#E8DCC8] bg-white py-16 text-center">
                            <IoRefreshOutline className="mx-auto mb-3 animate-spin text-[#7A1F2B]" size={32} />
                            <p className="text-[#7A6A5D]">Loading your bookings...</p>
                        </div>
                    ) : error ? (
                        <div className="rounded-2xl border border-red-200 bg-white px-5 py-12 text-center">
                            <p className="mb-4 text-red-600">{error}</p>
                            <button onClick={fetchBookings} className="rounded-lg bg-[#7A1F2B] px-5 py-2.5 font-semibold text-white">
                                Try Again
                            </button>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="rounded-2xl border border-[#E8DCC8] bg-white px-5 py-16 text-center">
                            <IoCalendarOutline className="mx-auto mb-4 text-[#C9A227]" size={44} />
                            <h2 className="text-xl font-bold text-[#2B1B12]">
                                {bookings.length === 0 ? "No bookings yet" : "No matching bookings"}
                            </h2>
                            <p className="mx-auto mt-2 max-w-md text-[#7A6A5D]">
                                {bookings.length === 0
                                    ? "Explore our available pujas and make your first booking."
                                    : "Try changing your search or status filter."}
                            </p>
                            {bookings.length === 0 && (
                                <button onClick={() => navigate("/pujas")} className="mt-6 rounded-xl bg-[#7A1F2B] px-6 py-3 font-semibold text-white transition hover:bg-[#5E1721]">
                                    Explore Pujas
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {filteredBookings.map((booking) => {
                                const existingDispute = getMyDispute(booking._id);
                                const existingFeedback = getMyFeedback(booking._id);

                                return (
                                    <article key={booking._id} className="overflow-hidden rounded-2xl border border-[#E8DCC8] bg-white">
                                        <div className="flex flex-col gap-4 border-b border-[#E8DCC8] p-5 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <h2 className="text-xl font-bold text-[#2B1B12]">{booking.ritual?.name || "Puja"}</h2>
                                                <p className="mt-1 text-sm text-[#7A6A5D]">Booking ID: {booking._id}</p>
                                            </div>
                                            <span className={`w-fit rounded-full px-4 py-1.5 text-sm font-semibold ${statusClasses(booking.status)}`}>
                                                {formatStatus(booking.status)}
                                            </span>
                                        </div>

                                        <div className="grid gap-5 p-5 md:grid-cols-2">
                                            <div className="flex items-start gap-3">
                                                <IoCalendarOutline className="mt-1 shrink-0 text-[#C2572C]" size={20} />
                                                <div>
                                                    <p className="text-sm text-[#7A6A5D]">Booking Date</p>
                                                    <p className="mt-1 font-semibold text-[#2B1B12]">{formatDate(booking.bookingDate)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <IoTimeOutline className="mt-1 shrink-0 text-[#C2572C]" size={20} />
                                                <div>
                                                    <p className="text-sm text-[#7A6A5D]">Start Time</p>
                                                    <p className="mt-1 font-semibold text-[#2B1B12]">{booking.startTime || "Not specified"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <IoLocationOutline className="mt-1 shrink-0 text-[#C2572C]" size={20} />
                                                <div>
                                                    <p className="text-sm text-[#7A6A5D]">Ceremony Location</p>
                                                    <p className="mt-1 font-semibold capitalize text-[#2B1B12]">{booking.locationType || "Not specified"}</p>
                                                    <p className="mt-1 text-sm leading-6 text-[#7A6A5D]">{getAddress(booking.address)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <IoReceiptOutline className="mt-1 shrink-0 text-[#C2572C]" size={20} />
                                                <div>
                                                    <p className="text-sm text-[#7A6A5D]">Your Budget</p>
                                                    <p className="mt-1 font-semibold text-[#2B1B12]">₹{Number(booking.price || 0).toLocaleString("en-IN")}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {booking.notes && (
                                            <div className="mx-5 mb-5 rounded-xl bg-[#FBF6EE] p-4">
                                                <p className="text-sm font-semibold text-[#2B1B12]">Additional Notes</p>
                                                <p className="mt-1 whitespace-pre-wrap text-sm text-[#7A6A5D]">{booking.notes}</p>
                                            </div>
                                        )}

                                        {existingFeedback && (
                                            <div className="mx-5 mb-5 rounded-xl border border-[#E8DCC8] bg-[#FBF6EE] p-4">
                                                <h3 className="font-bold text-[#2B1B12]">Your Review</h3>
                                                <p className="mt-2 text-lg text-amber-500">
                                                    {"★".repeat(Math.min(5, Math.max(0, Number(existingFeedback.rating) || 0)))}
                                                    {"☆".repeat(5 - Math.min(5, Math.max(0, Number(existingFeedback.rating) || 0)))}
                                                </p>
                                                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-[#7A6A5D]">
                                                    {existingFeedback.comment || "No written comment provided."}
                                                </p>
                                            </div>
                                        )}

                                        {existingDispute && (
                                            <div className="mx-5 mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <h3 className="font-bold text-amber-900">Your Dispute</h3>
                                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold capitalize text-amber-900">
                                                        {existingDispute.status?.replace(/_/g, " ") || "Open"}
                                                    </span>
                                                </div>
                                                <p className="mt-3 text-sm font-semibold text-amber-900">
                                                    Subject: {existingDispute.subject || "No subject provided"}
                                                </p>
                                                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-amber-900">
                                                    {existingDispute.description || "No description provided"}
                                                </p>
                                                {existingDispute.resolution && (
                                                    <div className="mt-4 rounded-lg border border-amber-200 bg-white p-3">
                                                        <p className="text-sm font-bold text-[#2B1B12]">Admin Resolution</p>
                                                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[#7A6A5D]">
                                                            {existingDispute.resolution}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex flex-wrap justify-end gap-3 border-t border-[#E8DCC8] p-5">
                                            {booking.status === "completed" && !existingFeedback && (
                                                <button
                                                    onClick={() => {
                                                        setFeedbackTarget(booking);
                                                        setRating(5);
                                                        setComment("");
                                                    }}
                                                    className="flex items-center gap-2 rounded-xl bg-[#C9A227] px-5 py-2.5 font-semibold text-white transition hover:bg-[#A78316]"
                                                >
                                                    <IoStar size={18} /> Rate Pandit
                                                </button>
                                            )}

                                            {booking.status === "completed" && existingFeedback && (
                                                <span className="rounded-xl bg-green-100 px-5 py-2.5 font-semibold text-green-700">
                                                    Review Submitted
                                                </span>
                                            )}

                                            {["pending", "confirmed"].includes(booking.status) && (
                                                <button
                                                    onClick={() => setCancelTarget(booking)}
                                                    disabled={cancellingId !== null}
                                                    className="rounded-xl border border-red-200 px-5 py-2.5 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    Cancel Booking
                                                </button>
                                            )}

                                            {["confirmed", "completed"].includes(booking.status) && !existingDispute && (
                                                <button
                                                    onClick={() => {
                                                        setDisputeTarget(booking);
                                                        setDisputeSubject("");
                                                        setDisputeDescription("");
                                                    }}
                                                    className="rounded-xl border border-[#7A1F2B] px-5 py-2.5 font-semibold text-[#7A1F2B] transition hover:bg-[#F8E8E5]"
                                                >
                                                    Raise Dispute
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {feedbackTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <form onSubmit={handleFeedbackSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#2B1B12]">Rate Your Pandit</h2>
                            <button type="button" onClick={() => setFeedbackTarget(null)} className="rounded-lg p-2 text-[#7A6A5D] hover:bg-[#FBF6EE]">
                                <IoCloseOutline size={24} />
                            </button>
                        </div>
                        <p className="mb-4 text-sm text-[#7A6A5D]">How was your {feedbackTarget.ritual?.name || "puja"} experience?</p>
                        <div className="mb-6 flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} type="button" onClick={() => setRating(star)} className="text-[#C9A227]" aria-label={`${star} star${star > 1 ? "s" : ""}`}>
                                    {star <= rating ? <IoStar size={32} /> : <IoStarOutline size={32} />}
                                </button>
                            ))}
                        </div>
                        <label className="mb-2 block text-sm font-semibold text-[#2B1B12]">Your Review (optional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            maxLength={1000}
                            placeholder="Share your experience..."
                            className="w-full resize-none rounded-xl border border-[#E8DCC8] p-3 outline-none focus:border-[#7A1F2B]"
                        />
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={() => setFeedbackTarget(null)} disabled={submittingFeedback} className="rounded-xl border border-[#E8DCC8] px-4 py-2.5 font-semibold text-[#2B1B12] disabled:opacity-50">
                                Cancel
                            </button>
                            <button type="submit" disabled={submittingFeedback} className="rounded-xl bg-[#7A1F2B] px-5 py-2.5 font-semibold text-white hover:bg-[#5E1721] disabled:opacity-50">
                                {submittingFeedback ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {cancelTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-[#2B1B12]">Cancel this booking?</h2>
                        <p className="mt-3 text-sm leading-6 text-[#7A6A5D]">
                            Are you sure you want to cancel your booking for <strong>{cancelTarget.ritual?.name || "this puja"}</strong>?
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={() => setCancelTarget(null)} disabled={cancellingId !== null} className="rounded-xl border border-[#E8DCC8] px-4 py-2.5 font-semibold text-[#2B1B12] disabled:opacity-50">
                                Keep Booking
                            </button>
                            <button type="button" onClick={handleCancelBooking} disabled={cancellingId !== null} className="rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                                {cancellingId === cancelTarget._id ? "Cancelling..." : "Confirm Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {disputeTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <form onSubmit={handleDisputeSubmit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#2B1B12]">Raise a Dispute</h2>
                            <button
                                type="button"
                                onClick={() => setDisputeTarget(null)}
                                disabled={submittingDispute}
                                className="rounded-lg p-2 text-[#7A6A5D] hover:bg-[#FBF6EE] disabled:opacity-50"
                            >
                                <IoCloseOutline size={24} />
                            </button>
                        </div>
                        <p className="mb-5 text-sm text-[#7A6A5D]">
                            Booking: <span className="font-semibold text-[#2B1B12]">{disputeTarget.ritual?.name || "Puja"}</span>
                        </p>
                        <label className="mb-2 block text-sm font-semibold text-[#2B1B12]">Subject</label>
                        <input
                            type="text"
                            value={disputeSubject}
                            onChange={(e) => setDisputeSubject(e.target.value)}
                            maxLength={150}
                            required
                            placeholder="Briefly describe the issue"
                            className="mb-4 w-full rounded-xl border border-[#E8DCC8] px-4 py-3 outline-none focus:border-[#7A1F2B]"
                        />
                        <label className="mb-2 block text-sm font-semibold text-[#2B1B12]">Description</label>
                        <textarea
                            value={disputeDescription}
                            onChange={(e) => setDisputeDescription(e.target.value)}
                            rows={5}
                            maxLength={2000}
                            required
                            placeholder="Explain what happened and how we can help..."
                            className="w-full resize-none rounded-xl border border-[#E8DCC8] p-3 outline-none focus:border-[#7A1F2B]"
                        />
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDisputeTarget(null)}
                                disabled={submittingDispute}
                                className="rounded-xl border border-[#E8DCC8] px-4 py-2.5 font-semibold text-[#2B1B12] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submittingDispute}
                                className="rounded-xl bg-[#7A1F2B] px-5 py-2.5 font-semibold text-white transition hover:bg-[#5E1721] disabled:opacity-50"
                            >
                                {submittingDispute ? "Submitting..." : "Submit Dispute"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <Footer />
        </>
    );
}