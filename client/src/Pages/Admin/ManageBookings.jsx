
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoArrowBackOutline, IoCalendarOutline, IoLocationOutline, IoRefreshOutline, IoSearchOutline } from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

const API_URL = import.meta.env.VITE_SERVER_URL;

export default function ManageBookings() {
    const [bookings, setBookings] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await fetch(`${API_URL}/admin/bookings`, {
                credentials: "include"
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to load bookings.");
            setBookings(data.bookings || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter((booking) => {
        const searchText = search.toLowerCase();
        const matchesSearch =
            booking.user?.name?.toLowerCase().includes(searchText) ||
            booking.ritual?.name?.toLowerCase().includes(searchText) ||
            booking.selectedPandit?.name?.toLowerCase().includes(searchText) ||
            booking.selectedPandit?.phone?.toLowerCase().includes(searchText) ||
            booking.address?.city?.toLowerCase().includes(searchText) ||
            booking.feedback?.comment?.toLowerCase().includes(searchText);

        return matchesSearch && (status === "all" || booking.status === status);
    });

    const statusColors = {
        pending: "bg-amber-100 text-amber-800",
        confirmed: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        cancelled: "bg-gray-100 text-gray-700",
        completed: "bg-blue-100 text-blue-800"
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#FBF6EE] px-4 py-8 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    <Link to="/admin/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-[#7A6A5D] hover:text-[#7A1F2B]">
                        <IoArrowBackOutline /> Back to Dashboard
                    </Link>

                    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-[#2B1B12]">Manage Bookings</h1>
                            <p className="mt-2 text-[#7A6A5D]">View bookings, customer reviews and assigned Pandit contact details.</p>
                        </div>
                        <button onClick={fetchBookings} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E8DCC8] bg-white px-4 py-2.5 font-medium text-[#7A1F2B] disabled:cursor-not-allowed disabled:opacity-50">
                            <IoRefreshOutline className={loading ? "animate-spin" : ""} />
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>

                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { label: "Total", value: bookings.length },
                            { label: "Pending", value: bookings.filter(b => b.status === "pending").length },
                            { label: "Confirmed", value: bookings.filter(b => b.status === "confirmed").length },
                            { label: "Completed", value: bookings.filter(b => b.status === "completed").length }
                        ].map(item => (
                            <div key={item.label} className="rounded-xl border border-[#E8DCC8] bg-white p-5">
                                <p className="text-sm text-[#7A6A5D]">{item.label} Bookings</p>
                                <p className="mt-2 text-3xl font-bold text-[#7A1F2B]">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                        <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#E8DCC8] bg-white px-3">
                            <IoSearchOutline className="text-[#7A6A5D]" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search user, puja, Pandit, phone, review or city..."
                                className="w-full bg-transparent py-3 outline-none"
                            />
                        </div>
                        <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-lg border border-[#E8DCC8] bg-white px-4 py-3 outline-none">
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {error && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                            {error}
                            <button onClick={fetchBookings} className="ml-3 font-semibold underline">Retry</button>
                        </div>
                    )}

                    {loading ? (
                        <div className="rounded-xl bg-white p-12 text-center text-[#7A6A5D]">Loading bookings...</div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="rounded-xl border border-[#E8DCC8] bg-white p-12 text-center">
                            <IoCalendarOutline className="mx-auto mb-3 text-4xl text-[#C9A227]" />
                            <h2 className="text-lg font-semibold text-[#2B1B12]">No bookings found</h2>
                            <p className="mt-1 text-sm text-[#7A6A5D]">Try changing your search or status filter.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-[#E8DCC8] bg-white">
                            <table className="w-full min-w-[1100px] text-left text-sm">
                                <thead className="bg-[#F7EFE3] text-[#2B1B12]">
                                    <tr>
                                        <th className="px-5 py-4">Puja / Ritual</th>
                                        <th className="px-5 py-4">Customer</th>
                                        <th className="px-5 py-4">Pandit Contact</th>
                                        <th className="px-5 py-4">Date & Time</th>
                                        <th className="px-5 py-4">Location</th>
                                        <th className="px-5 py-4">Price</th>
                                        <th className="px-5 py-4">Customer Review</th>
                                        <th className="px-5 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E8DCC8]">
                                    {filteredBookings.map(booking => {
                                        const rating = Number(booking.feedback?.rating) || 0;
                                        return (
                                            <tr key={booking._id} className="hover:bg-[#FBF6EE]">
                                                <td className="px-5 py-4 font-medium text-[#2B1B12]">{booking.ritual?.name || "—"}</td>
                                                <td className="px-5 py-4">
                                                    <p className="font-medium">{booking.user?.name || "—"}</p>
                                                    <p className="text-xs text-[#7A6A5D]">{booking.user?.phone || ""}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="font-medium">{booking.selectedPandit?.name || "Not selected"}</p>
                                                    {booking.selectedPandit?.phone ? (
                                                        <a href={`tel:${booking.selectedPandit.phone}`} className="text-xs text-[#7A1F2B] hover:underline">
                                                            {booking.selectedPandit.phone}
                                                        </a>
                                                    ) : booking.selectedPandit ? (
                                                        <p className="text-xs text-[#7A6A5D]">Phone unavailable</p>
                                                    ) : null}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p>{booking.bookingDate && !Number.isNaN(new Date(booking.bookingDate).getTime()) ? new Date(booking.bookingDate).toLocaleDateString("en-IN") : "—"}</p>
                                                    <p className="text-xs text-[#7A6A5D]">{booking.startTime || "Time unavailable"}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="flex items-center gap-1"><IoLocationOutline />{booking.locationType}</p>
                                                    <p className="text-xs text-[#7A6A5D]">{booking.address?.city || ""}</p>
                                                </td>
                                                <td className="px-5 py-4 font-medium">
                                                    {booking.price != null ? `₹${booking.price}` : "—"}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {booking.feedback ? (
                                                        <div className="min-w-[180px]">
                                                            <p className="font-semibold text-[#C9A227]">
                                                                {"★".repeat(Math.min(5, Math.max(0, rating)))}
                                                                {"☆".repeat(5 - Math.min(5, Math.max(0, rating)))}
                                                                <span className="ml-1 text-[#7A6A5D]">{rating}/5</span>
                                                            </p>
                                                            <p className="mt-1 max-w-xs whitespace-normal text-[#7A6A5D]">
                                                                {booking.feedback.comment || booking.feedback.review || "No written review"}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[#7A6A5D]">No review</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[booking.status] || "bg-gray-100 text-gray-700"}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}