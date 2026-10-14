
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    IoCalendarOutline,
    IoCheckmarkCircleOutline,
    IoTimeOutline,
    IoReceiptOutline,
    IoPersonCircleOutline,
    IoSearchOutline,
    IoArrowForwardOutline,
    IoLocationOutline,
    IoLogOutOutline
} from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { toast } from "react-toastify";

const emptyStats = {
    totalBookings: 0,
    upcomingPujas: 0,
    completedBookings: 0,
    pendingBookings: 0
};

const getBookingsFromResponse = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.bookings)) return data.bookings;
    if (Array.isArray(data?.bookingData)) return data.bookingData;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.bookings)) return data.data.bookings;
    if (Array.isArray(data?.data?.bookingData)) return data.data.bookingData;
    return null;
};

const getId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return String(value._id || value.id || "");
};

const getStatusClass = (status) => {
    const styles = {
        pending: "bg-amber-100 text-amber-800",
        confirmed: "bg-green-100 text-green-800",
        completed: "bg-blue-100 text-blue-800",
        cancelled: "bg-gray-100 text-gray-700",
        rejected: "bg-red-100 text-red-800"
    };
    return styles[String(status || "").toLowerCase()] || "bg-gray-100 text-gray-700";
};

const formatDate = (date) => {
    if (!date) return "Date not selected";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Date not available";
    return parsedDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
};

const getRitualName = (booking) => {
    const ritual = booking.ritual;
    if (ritual && typeof ritual === "object") {
        return ritual.name || ritual.title || "Puja booking";
    }
    return booking.ritualName || "Puja booking";
};

const getPanditName = (booking) => {
    const pandit = booking.selectedPandit;
    if (pandit && typeof pandit === "object") {
        return pandit.name || "Assigned Pandit";
    }
    if (Array.isArray(booking.pandits) && booking.pandits.length > 0) {
        const firstPandit = booking.pandits[0];
        if (typeof firstPandit === "object") return firstPandit.name || "Pandit selection pending";
    }
    return "Not assigned yet";
};

export default function UserDashboard() {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [bookingError, setBookingError] = useState("");
    const [logoutLoading, setLogoutLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let active = true;

        const fetchDashboard = async () => {
            try {
                const [dashboardResponse, bookingsResponse] = await Promise.all([
                    fetch(`${import.meta.env.VITE_SERVER_URL}/user/dashboard`, {
                        method: "GET",
                        credentials: "include"
                    }),
                    fetch(`${import.meta.env.VITE_SERVER_URL}/booking/my`, {
                        method: "GET",
                        credentials: "include"
                    })
                ]);

                const dashboardData = await dashboardResponse.json();
                const bookingsData = await bookingsResponse.json();

                if (!active) return;

                if (
                    !dashboardResponse.ok ||
                    dashboardData.error ||
                    !dashboardData.user
                ) {
                    toast.error(dashboardData.error || "Unable to load dashboard.");
                    navigate("/login");
                    return;
                }

                setUser(dashboardData.user);

                if (!bookingsResponse.ok || bookingsData.error) {
                    setBookingError(bookingsData.error || "Unable to load your bookings.");
                    setBookings([]);
                } else {
                    const fetchedBookings = getBookingsFromResponse(bookingsData);

                    if (fetchedBookings === null) {
                        console.error("Unexpected bookings API response:", bookingsData);
                        setBookingError("Unexpected response from the bookings API.");
                        setBookings([]);
                    } else {
                        const sortedBookings = [...fetchedBookings].sort((a, b) => {
                            const dateA = new Date(a.bookingDate || a.createdAt || 0).getTime();
                            const dateB = new Date(b.bookingDate || b.createdAt || 0).getTime();
                            return dateB - dateA;
                        });
                        setBookings(sortedBookings);
                        setBookingError("");
                    }
                }
            } catch (error) {
                console.error("Dashboard loading error:", error);
                if (active) {
                    setBookingError("Unable to connect to the server.");
                    toast.error("Unable to load dashboard. Check your server connection.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                    setBookingsLoading(false);
                }
            }
        };

        fetchDashboard();

        return () => {
            active = false;
        };
    }, [navigate]);

    const now = new Date();

    const stats = {
        totalBookings: bookings.length,
        upcomingPujas: bookings.filter((booking) => {
            const date = new Date(booking.bookingDate);
            return (
                !Number.isNaN(date.getTime()) &&
                date >= new Date(now.toDateString()) &&
                ["pending", "confirmed"].includes(String(booking.status).toLowerCase())
            );
        }).length,
        completedBookings: bookings.filter(
            (booking) => String(booking.status).toLowerCase() === "completed"
        ).length,
        pendingBookings: bookings.filter(
            (booking) => String(booking.status).toLowerCase() === "pending"
        ).length
    };

    const dashboardStats = [
        { label: "Total Bookings", value: stats.totalBookings, icon: IoReceiptOutline },
        { label: "Upcoming Pujas", value: stats.upcomingPujas, icon: IoCalendarOutline },
        { label: "Completed", value: stats.completedBookings, icon: IoCheckmarkCircleOutline },
        { label: "Pending Requests", value: stats.pendingBookings, icon: IoTimeOutline }
    ];

    const actions = [
        {
            title: "Explore Pujas",
            description: "Explore rituals and choose a puja for your occasion.",
            link: "/pujas",
            icon: IoSearchOutline
        },
        {
            title: "My Bookings",
            description: "View and manage your puja bookings.",
            link: "/my-bookings",
            icon: IoCalendarOutline
        },
        {
            title: "My Profile",
            description: "Manage your personal information.",
            link: "/user/settings",
            icon: IoPersonCircleOutline
        }
    ];

    const handleLogout = async () => {
        if (logoutLoading) return;
        setLogoutLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/logout`, {
                method: "POST",
                credentials: "include"
            });
            const data = await response.json();

            if (!response.ok || data.error) {
                toast.error(data.error || "Unable to logout.");
                return;
            }

            toast.success(data.success || "Logged out successfully.");
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Unable to connect to the server.");
        } finally {
            setLogoutLoading(false);
        }
    };

    const cardClass = "rounded-2xl border border-[#E8DCC8] bg-white p-5 shadow-sm";
    const buttonClass = "inline-flex items-center justify-center gap-2 rounded-lg bg-[#C2572C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#A94725]";

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#FBF6EE] px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {loading ? (
                        <div className="flex min-h-[60vh] items-center justify-center">
                            <p className="text-sm font-medium text-[#7A6A5D]">Loading your dashboard...</p>
                        </div>
                    ) : !user ? (
                        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                            <p className="text-[#7A6A5D]">Unable to load your account details.</p>
                            <Link to="/login" className={buttonClass}>Login Again</Link>
                        </div>
                    ) : (
                        <>
                            <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C2572C]">Customer Dashboard</p>
                                    <h1 className="mt-2 text-3xl font-bold text-[#7A1F2B] sm:text-4xl">
                                        Welcome, {user.name}
                                    </h1>
                                    <p className="mt-2 text-sm text-[#7A6A5D]">
                                        Manage your puja bookings and account details.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={logoutLoading}
                                    className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-[#E8DCC8] bg-white px-4 py-2.5 text-sm font-semibold text-[#7A1F2B] transition hover:bg-[#F5EBDD] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
                                >
                                    <IoLogOutOutline size={18} />
                                    {logoutLoading ? "Logging out..." : "Logout"}
                                </button>
                            </section>

                            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {dashboardStats.map((stat) => (
                                    <div key={stat.label} className={cardClass}>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-[#7A6A5D]">{stat.label}</p>
                                            <div className="rounded-xl bg-[#FBF0E8] p-3 text-[#C2572C]">
                                                <stat.icon size={22} />
                                            </div>
                                        </div>
                                        <p className="mt-4 text-3xl font-bold text-[#7A1F2B]">{stat.value}</p>
                                    </div>
                                ))}
                            </section>

                            <section className="mt-8 grid gap-6 lg:grid-cols-3">
                                <div className="space-y-6 lg:col-span-2">
                                    <div className={`${cardClass} flex flex-col justify-between gap-5 sm:flex-row sm:items-center`}>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-[#C2572C]">Begin Your Ceremony</p>
                                            <h2 className="mt-2 text-xl font-bold text-[#7A1F2B]">
                                                Find the right puja for your occasion
                                            </h2>
                                            <p className="mt-2 max-w-lg text-sm leading-6 text-[#7A6A5D]">
                                                Explore Hindu rituals, check puja details and pricing, and book a ceremony that suits your needs.
                                            </p>
                                            <Link to="/pujas" className={`${buttonClass} mt-5`}>
                                                Explore Pujas <IoArrowForwardOutline size={18} />
                                            </Link>
                                        </div>
                                        <div className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-full bg-[#FBF0E8] text-[#C2572C] sm:flex">
                                            <IoCalendarOutline size={52} />
                                        </div>
                                    </div>

                                    <div className={cardClass}>
                                        <div className="flex items-center justify-between gap-3">
                                            <h2 className="text-lg font-bold text-[#7A1F2B]">My Bookings</h2>
                                            <Link to="/my-bookings" className="inline-flex items-center gap-1 text-sm font-semibold text-[#C2572C] hover:text-[#7A1F2B]">
                                                View All <IoArrowForwardOutline />
                                            </Link>
                                        </div>

                                        {bookingsLoading ? (
                                            <p className="py-10 text-center text-sm text-[#7A6A5D]">
                                                Loading your bookings...
                                            </p>
                                        ) : bookingError ? (
                                            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
                                                <p className="text-sm text-red-700">{bookingError}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => window.location.reload()}
                                                    className="mt-3 text-sm font-semibold text-[#7A1F2B] underline"
                                                >
                                                    Try Again
                                                </button>
                                            </div>
                                        ) : bookings.length === 0 ? (
                                            <div className="mt-5 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E8DCC8] px-4 py-10 text-center">
                                                <IoReceiptOutline size={36} className="text-[#C9A227]" />
                                                <h3 className="mt-3 font-semibold text-[#2B1B12]">No bookings yet</h3>
                                                <p className="mt-2 max-w-sm text-sm text-[#7A6A5D]">
                                                    Your puja bookings will appear here after you book a ceremony.
                                                </p>
                                                <Link to="/pujas" className={`${buttonClass} mt-4`}>
                                                    Explore Pujas
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="mt-5 space-y-3">
                                                {bookings.slice(0, 3).map((booking) => (
                                                    <div
                                                        key={getId(booking) || `${booking.bookingDate}-${booking.startTime}`}
                                                        className="rounded-xl border border-[#E8DCC8] p-4 transition hover:border-[#C2572C]"
                                                    >
                                                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                                            <div className="min-w-0">
                                                                <h3 className="font-semibold text-[#2B1B12]">
                                                                    {getRitualName(booking)}
                                                                </h3>
                                                                <p className="mt-1 text-sm text-[#7A6A5D]">
                                                                    Pandit: {getPanditName(booking)}
                                                                </p>
                                                            </div>
                                                            <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(booking.status)}`}>
                                                                {booking.status || "Pending"}
                                                            </span>
                                                        </div>
                                                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#7A6A5D]">
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <IoCalendarOutline className="text-[#C2572C]" />
                                                                {formatDate(booking.bookingDate)}
                                                            </span>
                                                            {booking.startTime && (
                                                                <span className="inline-flex items-center gap-1.5">
                                                                    <IoTimeOutline className="text-[#C2572C]" />
                                                                    {booking.startTime}
                                                                </span>
                                                            )}
                                                            {booking.locationType && (
                                                                <span className="inline-flex items-center gap-1.5 capitalize">
                                                                    <IoLocationOutline className="text-[#C2572C]" />
                                                                    {booking.locationType}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {booking.price != null && (
                                                            <p className="mt-3 text-sm font-semibold text-[#7A1F2B]">
                                                                Price: ₹{Number(booking.price).toLocaleString("en-IN")}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                                {bookings.length > 3 && (
                                                    <Link
                                                        to="/my-bookings"
                                                        className="block pt-2 text-center text-sm font-semibold text-[#C2572C] hover:underline"
                                                    >
                                                        View all {bookings.length} bookings
                                                    </Link>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <aside className="space-y-6">
                                    <div className={cardClass}>
                                        <h2 className="text-lg font-bold text-[#7A1F2B]">Quick Actions</h2>
                                        <div className="mt-4 space-y-3">
                                            {actions.map((action) => (
                                                <Link
                                                    key={action.title}
                                                    to={action.link}
                                                    className="flex items-center gap-3 rounded-xl border border-[#E8DCC8] p-3 transition hover:border-[#C2572C] hover:bg-[#FBF6EE]"
                                                >
                                                    <div className="rounded-lg bg-[#FBF0E8] p-3 text-[#C2572C]">
                                                        <action.icon size={21} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-[#2B1B12]">{action.title}</p>
                                                        <p className="mt-1 text-xs leading-5 text-[#7A6A5D]">{action.description}</p>
                                                    </div>
                                                    <IoArrowForwardOutline className="shrink-0 text-[#C2572C]" />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={cardClass}>
                                        <div className="flex items-center gap-3">
                                            <IoPersonCircleOutline size={35} className="text-[#C2572C]" />
                                            <div>
                                                <h2 className="font-bold text-[#7A1F2B]">My Profile</h2>
                                                <p className="text-xs text-[#7A6A5D]">Your account details</p>
                                            </div>
                                        </div>
                                        <div className="mt-5 space-y-4 text-sm">
                                            <div>
                                                <p className="text-xs text-[#7A6A5D]">Full Name</p>
                                                <p className="mt-1 break-words font-medium text-[#2B1B12]">{user.name || "Not added"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-[#7A6A5D]">Email Address</p>
                                                <p className="mt-1 break-words font-medium text-[#2B1B12]">{user.email || "Not added"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-[#7A6A5D]">Phone Number</p>
                                                <p className="mt-1 font-medium text-[#2B1B12]">{user.phone || "Not added"}</p>
                                            </div>
                                            {user.address && (
                                                <div>
                                                    <p className="text-xs text-[#7A6A5D]">Address</p>
                                                    <p className="mt-1 flex items-start gap-1 font-medium leading-5 text-[#2B1B12]">
                                                        <IoLocationOutline className="mt-0.5 shrink-0 text-[#C2572C]" />
                                                        {[
                                                            user.address.house,
                                                            user.address.street,
                                                            user.address.area,
                                                            user.address.city,
                                                            user.address.state,
                                                            user.address.pincode
                                                        ].filter(Boolean).join(", ") || "Not added"}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <Link to="/user/settings" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#C2572C] hover:text-[#7A1F2B]">
                                            Edit Profile <IoArrowForwardOutline />
                                        </Link>
                                    </div>
                                </aside>
                            </section>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
