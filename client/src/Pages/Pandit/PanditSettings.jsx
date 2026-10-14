
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoPersonOutline, IoArrowBackOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export default function PanditSettings() {
    const [pandit, setPandit] = useState(null);
    const [rituals, setRituals] = useState([]);
    const [selectedRituals, setSelectedRituals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingAvailability, setSavingAvailability] = useState(false);
    const [savingRituals, setSavingRituals] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const [profileResponse, ritualsResponse] = await Promise.all([
                    fetch(`${SERVER_URL}/pandit/profile`, { credentials: "include" }),
                    fetch(`${SERVER_URL}/ritual/all`, { credentials: "include" })
                ]);
                const profileData = await profileResponse.json();
                const ritualsData = await ritualsResponse.json();

                if (!profileResponse.ok) throw new Error(profileData.error || "Failed to load Pandit profile.");
                if (!ritualsResponse.ok) throw new Error(ritualsData.error || "Failed to load rituals.");

                const profile = profileData.pandit || profileData.profile || profileData;
                const availableRituals = (ritualsData.rituals || []).filter(ritual => ritual.isActive);
                setPandit(profile);
                setRituals(availableRituals);
                setSelectedRituals((profile.rituals || []).map(ritual => String(ritual._id || ritual)));
            } catch (error) {
                toast.error(error.message || "Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const updateAvailability = async () => {
        setSavingAvailability(true);
        try {
            const response = await fetch(`${SERVER_URL}/pandit/availability`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ availability: !pandit.availability })
            });
            const data = await response.json();
            if (!response.ok || data.error) throw new Error(data.error || "Failed to update availability.");
            setPandit(previous => ({ ...previous, availability: !previous.availability }));
            toast.success("Availability updated successfully.");
        } catch (error) {
            toast.error(error.message || "Failed to update availability.");
        } finally {
            setSavingAvailability(false);
        }
    };

    const toggleRitual = (ritualId) => {
        setSelectedRituals(previous =>
            previous.includes(ritualId)
                ? previous.filter(id => id !== ritualId)
                : [...previous, ritualId]
        );
    };

    const saveRituals = async () => {
        setSavingRituals(true);
        try {
            const response = await fetch(`${SERVER_URL}/pandit/rituals`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ rituals: selectedRituals })
            });
            const data = await response.json();
            if (!response.ok || data.error) throw new Error(data.error || "Failed to update rituals.");
            toast.success("Rituals updated successfully.");
        } catch (error) {
            toast.error(error.message || "Failed to update rituals.");
        } finally {
            setSavingRituals(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#FBF6EE] px-4 py-10 text-[#2B1B12]">
                <div className="mx-auto max-w-3xl">
                    <Link to="/pandit/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#7A1F2B]">
                        <IoArrowBackOutline /> Back to Dashboard
                    </Link>
                    <div className="mb-8">
                        <p className="text-sm font-semibold uppercase tracking-widest text-[#C2572C]">Pandit Account</p>
                        <h1 className="mt-2 text-3xl font-bold">Pandit Settings</h1>
                        <p className="mt-2 text-[#7A6A5D]">Manage your availability and puja services.</p>
                    </div>

                    {loading ? (
                        <p className="rounded-2xl bg-white p-6">Loading settings...</p>
                    ) : !pandit ? (
                        <p className="rounded-2xl bg-white p-6">Unable to load your profile.</p>
                    ) : (
                        <div className="space-y-6">
                            <section className="rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-sm">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="rounded-xl bg-[#FBF6EE] p-3 text-[#7A1F2B]"><IoPersonOutline size={22} /></div>
                                    <h2 className="text-lg font-bold">Profile Information</h2>
                                </div>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Info label="Full Name" value={pandit.name} />
                                    <Info label="Email Address" value={pandit.email} />
                                    <Info label="Phone Number" value={pandit.phone} />
                                    <Info label="Experience" value={pandit.experience != null ? `${pandit.experience} years` : ""} />
                                    <Info label="City" value={pandit.location?.city} />
                                    <Info label="State" value={pandit.location?.state} />
                                    <Info label="Verification" value={pandit.verificationStatus} />
                                </div>
                                <p className="mt-5 text-sm text-[#7A6A5D]">Profile details are read-only until a profile-update API is added.</p>
                            </section>

                            <section className="rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-bold">Availability</h2>
                                <p className="mt-1 text-sm text-[#7A6A5D]">Control whether you can receive new booking requests.</p>
                                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold">{pandit.availability ? "Available for bookings" : "Not available"}</p>
                                        <p className="mt-1 text-sm text-[#7A6A5D]">Current availability status</p>
                                    </div>
                                    <button onClick={updateAvailability} disabled={savingAvailability} className="rounded-xl bg-[#7A1F2B] px-5 py-3 font-semibold text-white transition hover:bg-[#5E1721] disabled:opacity-50">
                                        {savingAvailability ? "Updating..." : pandit.availability ? "Set Unavailable" : "Set Available"}
                                    </button>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-bold">My Puja Services</h2>
                                <p className="mt-1 text-sm text-[#7A6A5D]">Select the rituals you offer.</p>
                                {rituals.length === 0 ? (
                                    <p className="mt-5 text-sm text-[#7A6A5D]">No active rituals are available.</p>
                                ) : (
                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        {rituals.map(ritual => {
                                            const id = String(ritual._id);
                                            const selected = selectedRituals.includes(id);
                                            return (
                                                <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${selected ? "border-[#7A1F2B] bg-[#FBF6EE]" : "border-[#E8DCC8]"}`}>
                                                    <input type="checkbox" checked={selected} onChange={() => toggleRitual(id)} className="h-4 w-4 accent-[#7A1F2B]" />
                                                    <span className="flex-1 font-medium">{ritual.name}</span>
                                                    {selected && <IoCheckmarkCircleOutline className="text-[#7A1F2B]" size={20} />}
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                                <button onClick={saveRituals} disabled={savingRituals || rituals.length === 0} className="mt-6 rounded-xl bg-[#7A1F2B] px-5 py-3 font-semibold text-white transition hover:bg-[#5E1721] disabled:opacity-50">
                                    {savingRituals ? "Saving..." : "Save Puja Services"}
                                </button>
                            </section>
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
