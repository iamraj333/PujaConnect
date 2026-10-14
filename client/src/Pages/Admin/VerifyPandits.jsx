
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoArrowBackOutline, IoPersonOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoEyeOutline } from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

const API_URL = import.meta.env.VITE_SERVER_URL;

export default function VerifyPandits() {
    const [pandits, setPandits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPandit, setSelectedPandit] = useState(null);

    useEffect(() => {
        const fetchPandits = async () => {
            try {
                const response = await fetch(`${API_URL}/admin/pandits`, {
                    credentials: "include"
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Failed to fetch Pandits.");
                setPandits(data.pandits || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchPandits();
    }, []);

    const updateVerification = async (id, verificationStatus) => {
        try {
            const response = await fetch(`${API_URL}/admin/pandits/${id}/verification`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ verificationStatus })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to update verification.");
            setPandits(prev => prev.map(pandit => pandit._id === id ? { ...pandit, verificationStatus } : pandit));
            setSelectedPandit(null);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#FBF6EE] px-4 py-10 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-7xl">
                    <Link to="/admin/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#7A1F2B] hover:text-[#C2572C]">
                        <IoArrowBackOutline size={18} /> Back to Dashboard
                    </Link>
                    <div className="mb-8">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#C2572C]">Admin Management</p>
                        <h1 className="text-3xl font-bold text-[#2B1B12] sm:text-4xl">Verify Pandits</h1>
                        <p className="mt-2 text-[#7A6A5D]">Review Pandit details and manage verification requests.</p>
                    </div>

                    <section className="rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#2B1B12]">Pandit Applications</h2>
                            <span className="rounded-full bg-[#F7EAE5] px-3 py-1 text-sm font-semibold text-[#7A1F2B]">{pandits.length} Pandits</span>
                        </div>

                        {loading ? (
                            <p className="py-12 text-center text-[#7A6A5D]">Loading Pandits...</p>
                        ) : pandits.length === 0 ? (
                            <div className="py-12 text-center">
                                <IoPersonOutline className="mx-auto mb-4 text-[#C9A227]" size={44} />
                                <h3 className="text-lg font-semibold text-[#2B1B12]">No Pandit applications</h3>
                                <p className="mt-2 text-sm text-[#7A6A5D]">Pandit registrations will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pandits.map(pandit => (
                                    <article key={pandit._id} className="flex flex-col justify-between gap-4 rounded-xl border border-[#E8DCC8] p-5 sm:flex-row sm:items-center">
                                        <div>
                                            <h3 className="text-lg font-bold text-[#2B1B12]">{pandit.name}</h3>
                                            <p className="mt-1 text-sm text-[#7A6A5D]">{pandit.email}</p>
                                            <p className="mt-1 text-sm text-[#7A6A5D]">{pandit.phone}</p>
                                            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${pandit.verificationStatus === "approved" ? "bg-green-100 text-green-700" : pandit.verificationStatus === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                                                {pandit.verificationStatus || "pending"}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => setSelectedPandit(pandit)} className="inline-flex items-center gap-2 rounded-lg border border-[#E8DCC8] px-4 py-2 text-sm font-medium text-[#7A1F2B] hover:bg-[#FBF6EE]">
                                                <IoEyeOutline size={18} /> Details
                                            </button>
                                            {pandit.verificationStatus !== "approved" && (
                                                <button onClick={() => updateVerification(pandit._id, "approved")} className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800">
                                                    <IoCheckmarkCircleOutline size={18} /> Verify
                                                </button>
                                            )}
                                            {pandit.verificationStatus !== "rejected" && (
                                                <button onClick={() => updateVerification(pandit._id, "rejected")} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                                                    <IoCloseCircleOutline size={18} /> Reject
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {selectedPandit && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" onClick={e => {
                    if (e.target === e.currentTarget) setSelectedPandit(null);
                }}>
                    <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#2B1B12]">Pandit Details</h2>
                            <button onClick={() => setSelectedPandit(null)} className="rounded-lg p-2 text-[#7A6A5D] hover:bg-[#FBF6EE]">
                                <IoCloseCircleOutline size={24} />
                            </button>
                        </div>
                        <div className="space-y-3 text-sm text-[#7A6A5D]">
                            <p><strong className="text-[#2B1B12]">Name:</strong> {selectedPandit.name}</p>
                            <p><strong className="text-[#2B1B12]">Email:</strong> {selectedPandit.email}</p>
                            <p><strong className="text-[#2B1B12]">Phone:</strong> {selectedPandit.phone || "Not provided"}</p>
                            <p><strong className="text-[#2B1B12]">Experience:</strong> {selectedPandit.experience ?? "Not provided"}</p>
                            <p><strong className="text-[#2B1B12]">Languages:</strong> {Array.isArray(selectedPandit.languages) ? selectedPandit.languages.join(", ") : selectedPandit.languages || "Not provided"}</p>
                            <p><strong className="text-[#2B1B12]">Verification Status:</strong> {selectedPandit.verificationStatus || "pending"}</p>
                            <p><strong className="text-[#2B1B12]">ID Proof:</strong> {selectedPandit.idProof || "Not provided"}</p>
                        </div>
                        <p className="mt-5 rounded-lg bg-[#FBF6EE] p-3 text-sm text-[#7A6A5D]">Verify the submitted details by phone call before approving the application.</p>
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
}
