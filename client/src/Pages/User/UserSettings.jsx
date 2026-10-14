
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoPersonOutline, IoLocationOutline, IoArrowBackOutline } from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export default function UserSettings() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`${SERVER_URL}/auth/me`, { credentials: "include" });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Failed to load profile.");
                setUser(data.user || data.currentUser || data);
            } catch (error) {
                setError(error.message || "Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const address = user?.address || {};

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#FBF6EE] px-4 py-10 text-[#2B1B12]">
                <div className="mx-auto max-w-3xl">
                    <Link to="/user/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#7A1F2B]">
                        <IoArrowBackOutline /> Back to Dashboard
                    </Link>
                    <div className="mb-8">
                        <p className="text-sm font-semibold uppercase tracking-widest text-[#C2572C]">Account</p>
                        <h1 className="mt-2 text-3xl font-bold">Account Settings</h1>
                        <p className="mt-2 text-[#7A6A5D]">View your profile and registered address.</p>
                    </div>

                    {loading ? (
                        <p className="rounded-2xl bg-white p-6">Loading profile...</p>
                    ) : error ? (
                        <p className="rounded-2xl bg-white p-6 text-red-600">{error}</p>
                    ) : (
                        <div className="space-y-6">
                            <section className="rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-sm">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="rounded-xl bg-[#FBF6EE] p-3 text-[#7A1F2B]"><IoPersonOutline size={22} /></div>
                                    <h2 className="text-lg font-bold">Personal Information</h2>
                                </div>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Info label="Full Name" value={user?.name} />
                                    <Info label="Email Address" value={user?.email} />
                                    <Info label="Phone Number" value={user?.phone} />
                                    <Info label="Account Status" value={user?.isActive === false ? "Inactive" : "Active"} />
                                </div>
                            </section>

                            <section className="rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-sm">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="rounded-xl bg-[#FBF6EE] p-3 text-[#7A1F2B]"><IoLocationOutline size={22} /></div>
                                    <h2 className="text-lg font-bold">Registered Address</h2>
                                </div>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Info label="House / Building" value={address.house} />
                                    <Info label="Street" value={address.street} />
                                    <Info label="Area" value={address.area} />
                                    <Info label="City" value={address.city} />
                                    <Info label="State" value={address.state} />
                                    <Info label="Pincode" value={address.pincode} />
                                </div>
                            </section>

                            <p className="rounded-xl border border-[#E8DCC8] bg-white p-4 text-sm text-[#7A6A5D]">
                                Profile editing is not available yet. A backend profile-update endpoint is required to save changes securely.
                            </p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <p className="mb-1 text-sm text-[#7A6A5D]">{label}</p>
            <p className="break-words font-medium">{value || "Not provided"}</p>
        </div>
    );
}
