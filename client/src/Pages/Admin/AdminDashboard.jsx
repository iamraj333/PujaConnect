import { useContext } from "react";
import { Link } from "react-router-dom";
import { IoGridOutline, IoBookOutline, IoShieldCheckmarkOutline, IoCalendarOutline, IoPeopleOutline, IoLogOutOutline, IoAlertCircleOutline } from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { MyContextData } from "../../ContextData/MyContextData";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AdminDashboard() {
    const { currentUser, logout } = useContext(MyContextData);
    const [stats, setStats] = useState({
        totalRituals: 0,
        pendingVerifications: 0,
        totalBookings: 0,
        totalUsers: 0
    });
    const [loading, setLoading] = useState(true);

    const dashboardStats = [
        { label: "Total Rituals", value: stats.totalRituals, icon: IoBookOutline },
        { label: "Pending Pandit Verifications", value: stats.pendingVerifications, icon: IoShieldCheckmarkOutline },
        { label: "Total Bookings", value: stats.totalBookings, icon: IoCalendarOutline },
        { label: "Registered Users", value: stats.totalUsers, icon: IoPeopleOutline },
    ];

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/admin/dashboard`, {
                    credentials: "include"
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to load dashboard.");
                }

                if (data.stats && typeof data.stats === "object") {
                    setStats(prev => ({ ...prev, ...data.stats }));
                } else {
                    throw new Error("Invalid dashboard statistics received.");
                }
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const managementCards = [
        { title: "Manage Rituals", description: "Add, edit and manage pujas offered on PujaConnect.", icon: IoBookOutline, path: "/admin/rituals" },
        { title: "Verify Pandits", description: "Review Pandit applications and approve or reject verification.", icon: IoShieldCheckmarkOutline, path: "/admin/pandits" },
        { title: "Manage Bookings", description: "View and manage customer puja bookings.", icon: IoCalendarOutline, path: "/admin/bookings" },
        { title: "Manage Users", description: "View registered users and their account details.", icon: IoPeopleOutline, path: "/admin/users" },
        { title: "Manage Disputes", description: "Review customer and Pandit disputes and manage their resolution.", icon: IoAlertCircleOutline, path: "/admin/disputes" }
    ];

    const handleLogout = async () => {
        await logout();
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#FBF6EE] px-4 py-10 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#C2572C]">Administration</p>
                            <h1 className="text-3xl font-bold text-[#2B1B12] sm:text-4xl">Admin Dashboard</h1>
                            <p className="mt-2 text-[#7A6A5D]">Welcome back, {currentUser?.name || "Admin"}.</p>
                        </div>
                        <button onClick={handleLogout} className="flex items-center justify-center gap-2 self-start rounded-lg border border-[#E8DCC8] bg-white px-4 py-3 font-medium text-[#7A1F2B] transition hover:bg-[#F7EAE5]">
                            <IoLogOutOutline size={20} /> Logout
                        </button>
                    </div>

                    <section className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {dashboardStats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-sm">
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F7EAE5] text-[#7A1F2B]">
                                        <Icon size={25} />
                                    </div>
                                    <p className="text-sm text-[#7A6A5D]">{stat.label}</p>
                                    <p className="mt-2 text-3xl font-bold text-[#2B1B12]">{stat.value}</p>
                                </div>
                            );
                        })}
                    </section>

                    <section>
                        <div className="mb-5 flex items-center gap-3">
                            <IoGridOutline className="text-[#7A1F2B]" size={24} />
                            <h2 className="text-2xl font-bold text-[#2B1B12]">Management</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
                            {managementCards.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <Link key={card.title} to={card.path} className="group rounded-2xl border border-[#E8DCC8] bg-white p-6 transition hover:-translate-y-1 hover:border-[#C9A227] hover:shadow-md">
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F7EAE5] text-[#7A1F2B] transition group-hover:bg-[#7A1F2B] group-hover:text-white">
                                            <Icon size={25} />
                                        </div>
                                        <h3 className="text-lg font-bold text-[#2B1B12]">{card.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-[#7A6A5D]">{card.description}</p>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
};