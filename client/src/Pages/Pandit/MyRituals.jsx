
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaCheck, FaSearch } from "react-icons/fa";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

const API_URL = import.meta.env.VITE_SERVER_URL;

export default function MyRituals() {
    const [rituals, setRituals] = useState([]);
    const [selectedRituals, setSelectedRituals] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [ritualResponse, profileResponse] = await Promise.all([
                fetch(`${API_URL}/ritual/all`),
                fetch(`${API_URL}/pandit/profile`, { credentials: "include" })
            ]);

            const ritualData = await ritualResponse.json();
            const profileData = await profileResponse.json();

            if (!ritualResponse.ok || !profileResponse.ok) {
                throw new Error(ritualData.error || profileData.error || "Failed to load rituals.");
            }

            setRituals((ritualData.rituals || []).filter(ritual => ritual.isActive));
            setSelectedRituals(
                (profileData.pandit?.rituals || []).map(ritual =>
                    typeof ritual === "string" ? ritual : ritual._id
                )
            );
        } catch (error) {
            toast.error(error.message || "Failed to load rituals.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleRitual = id => {
        setSelectedRituals(previous =>
            previous.includes(id)
                ? previous.filter(ritualId => ritualId !== id)
                : [...previous, id]
        );
    };

    const saveRituals = async () => {
        try {
            setSaving(true);
            const response = await fetch(`${API_URL}/pandit/rituals`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ rituals: selectedRituals })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to save rituals.");
            }

            toast.success(data.message || "My rituals updated successfully.");
        } catch (error) {
            toast.error(error.message || "Failed to save rituals.");
        } finally {
            setSaving(false);
        }
    };

    const filteredRituals = rituals.filter(ritual =>
        ritual.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#FBF6EE] px-4 py-10 text-[#2B1B12] sm:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-8">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#C2572C]">Pandit Dashboard</p>
                        <h1 className="text-3xl font-bold sm:text-4xl">My Rituals</h1>
                        <p className="mt-2 text-[#7A6A5D]">Select the pujas you perform so suitable booking requests can reach you.</p>
                    </div>

                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#E8DCC8] bg-white px-4">
                        <FaSearch className="text-[#7A6A5D]" />
                        <input
                            type="text"
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                            placeholder="Search pujas..."
                            className="w-full bg-transparent py-3 outline-none"
                        />
                    </div>

                    {loading ? (
                        <p className="py-12 text-center text-[#7A6A5D]">Loading rituals...</p>
                    ) : filteredRituals.length === 0 ? (
                        <div className="rounded-xl border border-[#E8DCC8] bg-white p-8 text-center">
                            No rituals found.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredRituals.map(ritual => {
                                const selected = selectedRituals.includes(ritual._id);
                                return (
                                    <button
                                        key={ritual._id}
                                        type="button"
                                        onClick={() => toggleRitual(ritual._id)}
                                        className={`rounded-xl border p-5 text-left transition ${selected ? "border-[#7A1F2B] bg-[#7A1F2B]/5 ring-1 ring-[#7A1F2B]" : "border-[#E8DCC8] bg-white hover:border-[#C2572C]"}`}
                                    >
                                        <div className="mb-3 flex items-start justify-between gap-3">
                                            <h2 className="font-bold">{ritual.name}</h2>
                                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${selected ? "border-[#7A1F2B] bg-[#7A1F2B] text-white" : "border-[#E8DCC8] text-transparent"}`}>
                                                <FaCheck size={11} />
                                            </span>
                                        </div>
                                        <p className="mb-4 line-clamp-3 text-sm text-[#7A6A5D]">{ritual.description}</p>
                                        <p className="text-sm font-semibold text-[#C2572C]">
                                            ₹{ritual.priceRange.min.toLocaleString("en-IN")} – ₹{ritual.priceRange.max.toLocaleString("en-IN")}
                                        </p>
                                        <p className="mt-1 text-xs text-[#7A6A5D]">{ritual.duration} minutes</p>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E8DCC8] bg-white p-5">
                        <p className="text-sm text-[#7A6A5D]">
                            <span className="font-bold text-[#2B1B12]">{selectedRituals.length}</span> puja(s) selected
                        </p>
                        <button
                            type="button"
                            onClick={saveRituals}
                            disabled={loading || saving}
                            className="rounded-lg bg-[#7A1F2B] px-6 py-3 font-semibold text-white transition hover:bg-[#5D1720] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save My Rituals"}
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
