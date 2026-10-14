import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { toast } from "react-toastify";
import { IoCalendarOutline, IoBookOutline, IoTimeOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoLocationOutline, IoPersonOutline, IoCallOutline, IoWarningOutline, IoCloseOutline } from "react-icons/io5";

const API_URL = import.meta.env.VITE_SERVER_URL;

export default function PanditDashboard() {
    const [pandit, setPandit] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [confirmBooking, setConfirmBooking] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [totalReviews, setTotalReviews] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [disputeTarget, setDisputeTarget] = useState(null);
    const [disputeSubject, setDisputeSubject] = useState("");
    const [disputeDescription, setDisputeDescription] = useState("");
    const [submittingDispute, setSubmittingDispute] = useState(false);
    const [myDisputes, setMyDisputes] = useState([]);

    const fetchMyDisputes = async () => {
        try {
            const response = await fetch(`${API_URL}/dispute/my`, {
                credentials: "include"
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to load disputes.");
            }
            setMyDisputes(data.disputes || []);
        } catch (error) {
            toast.error(error.message || "Failed to load disputes.");
        }
    };

    const fetchDashboard = async () => {
        try {
            const profileResponse = await fetch(`${API_URL}/pandit/profile`, {
                credentials: "include"
            });
            const profileData = await profileResponse.json();
            if (!profileResponse.ok) {
                throw new Error(profileData.error || "Failed to load profile.");
            }
            setPandit(profileData.pandit);

            const bookingResponse = await fetch(`${API_URL}/booking/pandit`, {
                credentials: "include"
            });
            const bookingData = await bookingResponse.json();
            if (!bookingResponse.ok) {
                throw new Error(bookingData.error || "Failed to load bookings.");
            }
            setBookings(bookingData.bookings || []);

            try {
                const reviewResponse = await fetch(`${API_URL}/feedback/pandit/my`, {
                    credentials: "include"
                });
                const reviewData = await reviewResponse.json();
                if (!reviewResponse.ok) {
                    throw new Error(reviewData.error || "Failed to load reviews.");
                }
                setReviews(reviewData.feedback || []);
                setTotalReviews(reviewData.totalReviews || 0);
                setAverageRating(reviewData.averageRating || 0);
            } catch (reviewError) {
                toast.error(reviewError.message || "Failed to load reviews.");
            }

            await fetchMyDisputes();
        } catch (error) {
            toast.error(error.message || "Failed to load dashboard.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const updateAvailability = async () => {
        try {
            const response = await fetch(`${API_URL}/pandit/availability`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ availability: !pandit.availability })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to update availability.");
            }
            setPandit(data.pandit);
            toast.success(data.message || "Availability updated.");
        } catch (error) {
            toast.error(error.message || "Failed to update availability.");
        }
    };

    const respondToBooking = async (bookingId, action) => {
        setProcessing(true);
        try {
            const response = await fetch(`${API_URL}/booking/pandit/${bookingId}/respond`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ action })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to update booking.");
            }
            toast.success(data.message || `Booking ${action === "accept" ? "accepted" : "rejected"}.`);
            await fetchDashboard();
        } catch (error) {
            toast.error(error.message || "Failed to update booking.");
        } finally {
            setProcessing(false);
        }
    };

    const completeBooking = async () => {
        if (!confirmBooking) return;
        setProcessing(true);
        try {
            const response = await fetch(`${API_URL}/booking/pandit/${confirmBooking._id}/complete`, {
                method: "PATCH",
                credentials: "include"
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to complete booking.");
            }
            toast.success(data.message || "Puja marked as completed.");
            setConfirmBooking(null);
            await fetchDashboard();
        } catch (error) {
            toast.error(error.message || "Failed to complete booking.");
        } finally {
            setProcessing(false);
        }
    };

    const getBookingId = (dispute) => {
        return typeof dispute.booking === "object"
            ? dispute.booking?._id
            : dispute.booking;
    };

    const getMyDispute = (bookingId) => {
        return myDisputes.find((dispute) =>
            getBookingId(dispute) === bookingId && dispute.raisedBy === "pandit"
        );
    };

    const handleDisputeSubmit = async (e) => {
        e.preventDefault();
        if (!disputeTarget || submittingDispute) return;

        if (!disputeSubject.trim() || !disputeDescription.trim()) {
            toast.error("Please enter the subject and description.");
            return;
        }

        setSubmittingDispute(true);
        try {
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
        } catch (error) {
            toast.error(error.message || "Failed to raise dispute.");
        } finally {
            setSubmittingDispute(false);
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        if (activeTab === "pending") return booking.status === "pending";
        if (activeTab === "upcoming") return booking.status === "confirmed";
        if (activeTab === "completed") return booking.status === "completed";
        if (activeTab === "history") {
            return ["completed", "rejected", "cancelled"].includes(booking.status);
        }
        return true;
    });

    const pendingCount = bookings.filter((b) => b.status === "pending").length;
    const upcomingCount = bookings.filter((b) => b.status === "confirmed").length;
    const completedCount = bookings.filter((b) => b.status === "completed").length;

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex min-h-[60vh] items-center justify-center bg-[#FBF6EE]">
                    <p className="text-[#7A6A5D]">Loading dashboard...</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#FBF6EE] px-4 py-8 text-[#2B1B12] sm:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-3xl font-bold">
                                Namaste, {pandit?.name || "Pandit Ji"}
                            </h1>
                            <p className="mt-2 text-[#7A6A5D]">
                                Manage your rituals and puja bookings.
                            </p>
                        </div>
                        <Link
                            to="/pandit/rituals"
                            className="flex items-center justify-center gap-2 rounded-xl bg-[#7A1F2B] px-5 py-3 font-semibold text-white hover:bg-[#601722]"
                        >
                            <IoBookOutline size={20} />
                            Manage My Rituals
                        </Link>
                    </div>

                    {pandit?.verificationStatus !== "approved" && (
                        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <p className="font-semibold">
                                Verification: {pandit?.verificationStatus || "pending"}
                            </p>
                            <p className="mt-1 text-sm">
                                You must be approved by the admin before accepting bookings.
                            </p>
                        </div>
                    )}

                    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-[#E8DCC8] bg-white p-5">
                            <IoCalendarOutline className="text-2xl text-[#7A1F2B]" />
                            <p className="mt-3 text-sm text-[#7A6A5D]">Total Bookings</p>
                            <h2 className="mt-1 text-3xl font-bold">{bookings.length}</h2>
                        </div>
                        <div className="rounded-xl border border-[#E8DCC8] bg-white p-5">
                            <IoTimeOutline className="text-2xl text-amber-600" />
                            <p className="mt-3 text-sm text-[#7A6A5D]">Pending Requests</p>
                            <h2 className="mt-1 text-3xl font-bold">{pendingCount}</h2>
                        </div>
                        <div className="rounded-xl border border-[#E8DCC8] bg-white p-5">
                            <IoCalendarOutline className="text-2xl text-blue-700" />
                            <p className="mt-3 text-sm text-[#7A6A5D]">Upcoming Pujas</p>
                            <h2 className="mt-1 text-3xl font-bold">{upcomingCount}</h2>
                        </div>
                        <div className="rounded-xl border border-[#E8DCC8] bg-white p-5">
                            <IoCheckmarkCircleOutline className="text-2xl text-green-700" />
                            <p className="mt-3 text-sm text-[#7A6A5D]">Completed Pujas</p>
                            <h2 className="mt-1 text-3xl font-bold">{completedCount}</h2>
                        </div>
                    </div>

                    <section className="mb-8 rounded-xl border border-[#E8DCC8] bg-white p-5">
                        <h2 className="text-xl font-bold">My Profile</h2>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <p><span className="text-[#7A6A5D]">Name:</span> {pandit?.name}</p>
                            <p><span className="text-[#7A6A5D]">Email:</span> {pandit?.email}</p>
                            <p><span className="text-[#7A6A5D]">Phone:</span> {pandit?.phone}</p>
                            <p><span className="text-[#7A6A5D]">Experience:</span> {pandit?.experience} years</p>
                            <p><span className="text-[#7A6A5D]">Location:</span> {pandit?.location?.city}, {pandit?.location?.state}</p>
                            <p><span className="text-[#7A6A5D]">Verification:</span> {pandit?.verificationStatus}</p>
                        </div>
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#E8DCC8] pt-5">
                            <div>
                                <p className="font-semibold">Booking Availability</p>
                                <p className="mt-1 text-sm text-[#7A6A5D]">
                                    {pandit?.availability ? "You are available for bookings." : "You are currently unavailable."}
                                </p>
                            </div>
                            <button
                                onClick={updateAvailability}
                                disabled={processing || pandit?.verificationStatus !== "approved" || !pandit?.isActive}
                                className={`rounded-xl px-5 py-3 font-semibold text-white disabled:opacity-50 ${pandit?.availability ? "bg-green-700 hover:bg-green-800" : "bg-gray-600 hover:bg-gray-700"}`}
                            >
                                {pandit?.availability ? "Set Unavailable" : "Set Available"}
                            </button>
                        </div>
                    </section>

                    <section className="mb-8 rounded-xl border border-[#E8DCC8] bg-white p-5">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Customer Reviews</h2>
                                <p className="mt-1 text-sm text-[#7A6A5D]">
                                    Reviews shared by customers after completing their pujas.
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#FBF6EE] p-4">
                                <p className="text-2xl font-bold text-[#7A1F2B]">
                                    {averageRating.toFixed(1)} / 5
                                </p>
                                <p className="text-lg text-amber-500">
                                    {"★".repeat(Math.round(averageRating))}{"☆".repeat(5 - Math.round(averageRating))}
                                </p>
                                <p className="mt-1 text-sm text-[#7A6A5D]">
                                    {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                                </p>
                            </div>
                        </div>

                        {reviews.length === 0 ? (
                            <p className="py-10 text-center text-[#7A6A5D]">
                                You haven't received any reviews yet.
                            </p>
                        ) : (
                            <div className="mt-5 grid gap-4 lg:grid-cols-2">
                                {reviews.map((review) => (
                                    <div key={review._id} className="rounded-xl border border-[#E8DCC8] p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-bold">
                                                    {review.user?.name || "Customer"}
                                                </h3>
                                                <p className="mt-1 text-sm text-[#7A6A5D]">
                                                    {review.booking?.ritual?.name || "Puja"}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-lg text-amber-500">
                                                {"★".repeat(review.rating || 0)}{"☆".repeat(5 - (review.rating || 0))}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-xs text-[#7A6A5D]">
                                            {new Date(review.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric"
                                            })}
                                        </p>
                                        <p className="mt-3 whitespace-pre-wrap break-words text-sm text-[#2B1B12]">
                                            {review.comment || "No written comment provided."}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="rounded-xl border border-[#E8DCC8] bg-white p-5">
                        <h2 className="text-2xl font-bold">My Bookings</h2>
                        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
                            {[
                                { id: "all", label: "All Bookings" },
                                { id: "pending", label: "Pending" },
                                { id: "upcoming", label: "Upcoming" },
                                { id: "completed", label: "Completed" },
                                { id: "history", label: "History" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`shrink-0 rounded-lg px-4 py-2 font-semibold ${activeTab === tab.id ? "bg-[#7A1F2B] text-white" : "bg-[#FBF6EE] text-[#7A6A5D] hover:bg-[#F4EBDD]"}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {filteredBookings.length === 0 ? (
                            <p className="py-12 text-center text-[#7A6A5D]">
                                No bookings found in this section.
                            </p>
                        ) : (
                            <div className="mt-5 grid gap-5 lg:grid-cols-2">
                                {filteredBookings.map((booking) => {
                                    const dispute = getMyDispute(booking._id);
                                    return (
                                        <div key={booking._id} className="rounded-xl border border-[#E8DCC8] p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="text-lg font-bold">
                                                        {booking.ritual?.name || "Puja"}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-[#7A6A5D]">
                                                        Booking ID: {booking._id.slice(-8).toUpperCase()}
                                                    </p>
                                                </div>
                                                <span className="rounded-full bg-[#FBF0E2] px-3 py-1 text-xs font-semibold capitalize">
                                                    {booking.status}
                                                </span>
                                            </div>

                                            <div className="mt-5 space-y-3 text-sm">
                                                <p className="flex items-start gap-2">
                                                    <IoCalendarOutline className="mt-0.5 shrink-0 text-lg text-[#C2572C]" />
                                                    <span>
                                                        {new Date(booking.bookingDate).toLocaleDateString("en-IN")} at {booking.startTime}
                                                    </span>
                                                </p>
                                                <p className="flex items-start gap-2">
                                                    <IoPersonOutline className="mt-0.5 shrink-0 text-lg text-[#C2572C]" />
                                                    <span>
                                                        {booking.user?.name || "Customer"}
                                                        {booking.user?.phone && ` · ${booking.user.phone}`}
                                                    </span>
                                                </p>
                                                <p className="flex items-start gap-2">
                                                    <IoLocationOutline className="mt-0.5 shrink-0 text-lg text-[#C2572C]" />
                                                    <span>
                                                        {[
                                                            booking.address?.house,
                                                            booking.address?.street,
                                                            booking.address?.area,
                                                            booking.address?.city,
                                                            booking.address?.state,
                                                            booking.address?.pincode
                                                        ].filter(Boolean).join(", ") || booking.locationType}
                                                    </span>
                                                </p>
                                                {booking.user?.phone && (
                                                    <a
                                                        href={`tel:${booking.user.phone}`}
                                                        className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-green-700 hover:bg-green-200"
                                                    >
                                                        <IoCallOutline />
                                                        Call Customer
                                                    </a>
                                                )}
                                                <p className="font-bold text-[#7A1F2B]">
                                                    Amount: ₹{Number(booking.price || 0).toLocaleString("en-IN")}
                                                </p>
                                                {booking.notes && (
                                                    <p className="rounded-lg bg-[#FBF6EE] p-3">
                                                        <strong>Notes:</strong> {booking.notes}
                                                    </p>
                                                )}
                                            </div>

                                            {booking.status === "pending" && (
                                                <div className="mt-5 flex gap-3">
                                                    <button
                                                        onClick={() => respondToBooking(booking._id, "accept")}
                                                        disabled={processing || pandit?.verificationStatus !== "approved" || !pandit?.isActive || !pandit?.availability}
                                                        className="flex-1 rounded-lg bg-[#7A1F2B] px-3 py-3 font-semibold text-white disabled:opacity-50"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => respondToBooking(booking._id, "reject")}
                                                        disabled={processing}
                                                        className="flex-1 rounded-lg border border-red-200 px-3 py-3 font-semibold text-red-700 disabled:opacity-50"
                                                    >
                                                        <IoCloseCircleOutline className="mr-1 inline" />
                                                        Reject
                                                    </button>
                                                </div>
                                            )}

                                            {booking.status === "confirmed" && (
                                                <button
                                                    onClick={() => setConfirmBooking(booking)}
                                                    disabled={processing}
                                                    className="mt-5 w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white disabled:opacity-50"
                                                >
                                                    Mark as Completed
                                                </button>
                                            )}

                                            {booking.status === "completed" && (
                                                <p className="mt-4 font-semibold text-green-700">
                                                    <IoCheckmarkCircleOutline className="mr-1 inline text-lg" />
                                                    Puja completed
                                                </p>
                                            )}

                                            {["confirmed", "completed"].includes(booking.status) && !dispute && (
                                                <button
                                                    onClick={() => {
                                                        setDisputeTarget(booking);
                                                        setDisputeSubject("");
                                                        setDisputeDescription("");
                                                    }}
                                                    className="mt-4 w-full rounded-lg border border-[#7A1F2B] px-4 py-3 font-semibold text-[#7A1F2B] transition hover:bg-[#F8E8E5]"
                                                >
                                                    <IoWarningOutline className="mr-2 inline" />
                                                    Raise Dispute
                                                </button>
                                            )}

                                            {dispute && (
                                                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                                    <p className="font-semibold capitalize text-amber-800">
                                                        Dispute: {dispute.status.replace(/_/g, " ")}
                                                    </p>
                                                    <p className="mt-1 text-sm text-amber-900">
                                                        {dispute.subject}
                                                    </p>
                                                    {dispute.resolution && (
                                                        <p className="mt-2 text-sm text-amber-900">
                                                            <strong>Resolution:</strong> {dispute.resolution}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {confirmBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6">
                        <h2 className="text-xl font-bold">Complete this puja?</h2>
                        <p className="mt-3 text-[#7A6A5D]">
                            Have you completed {confirmBooking.ritual?.name || "this puja"}?
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setConfirmBooking(null)}
                                disabled={processing}
                                className="flex-1 rounded-lg border border-[#E8DCC8] px-4 py-3 font-semibold disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={completeBooking}
                                disabled={processing}
                                className="flex-1 rounded-lg bg-green-700 px-4 py-3 font-semibold text-white disabled:opacity-50"
                            >
                                {processing ? "Please wait..." : "Confirm"}
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
                                className="rounded-lg p-2 text-[#7A6A5D] hover:bg-[#FBF6EE]"
                            >
                                <IoCloseOutline size={24} />
                            </button>
                        </div>
                        <p className="mb-5 text-sm text-[#7A6A5D]">
                            Booking: <strong className="text-[#2B1B12]">{disputeTarget.ritual?.name || "Puja"}</strong>
                            <span className="ml-2">#{disputeTarget._id.slice(-8).toUpperCase()}</span>
                        </p>
                        <label className="mb-2 block text-sm font-semibold">Subject</label>
                        <input
                            type="text"
                            value={disputeSubject}
                            onChange={(e) => setDisputeSubject(e.target.value)}
                            maxLength={150}
                            required
                            placeholder="Briefly describe the issue"
                            className="mb-4 w-full rounded-xl border border-[#E8DCC8] px-4 py-3 outline-none focus:border-[#7A1F2B]"
                        />
                        <label className="mb-2 block text-sm font-semibold">Description</label>
                        <textarea
                            value={disputeDescription}
                            onChange={(e) => setDisputeDescription(e.target.value)}
                            rows={5}
                            maxLength={2000}
                            required
                            placeholder="Explain what happened..."
                            className="w-full resize-none rounded-xl border border-[#E8DCC8] p-3 outline-none focus:border-[#7A1F2B]"
                        />
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDisputeTarget(null)}
                                disabled={submittingDispute}
                                className="rounded-xl border border-[#E8DCC8] px-4 py-2.5 font-semibold disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submittingDispute}
                                className="rounded-xl bg-[#7A1F2B] px-5 py-2.5 font-semibold text-white hover:bg-[#5E1721] disabled:opacity-50"
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