
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { IoEyeOutline, IoCloseOutline, IoArrowBackOutline } from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

const API_URL = import.meta.env.VITE_SERVER_URL;

export default function ManageDisputes() {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [status, setStatus] = useState("under_review");
    const [resolution, setResolution] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await fetch(`${API_URL}/admin/disputes`, {
                credentials: "include"
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to fetch disputes.");
            setDisputes(data.disputes || []);
        } catch (error) {
            setError(error.message || "Failed to fetch disputes.");
            toast.error(error.message || "Failed to fetch disputes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, []);

    const openDispute = (dispute) => {
        setSelectedDispute(dispute);
        setStatus(dispute.status);
        setResolution(dispute.resolution || "");
    };

    const updateDispute = async (e) => {
        e.preventDefault();

        if (["resolved", "rejected"].includes(status) && !resolution.trim()) {
            toast.error("Please enter a resolution before closing the dispute.");
            return;
        }

        try {
            setSaving(true);
            const response = await fetch(`${API_URL}/admin/disputes/${selectedDispute._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status, resolution })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to update dispute.");

            toast.success(data.message || "Dispute updated successfully.");
            setSelectedDispute(null);
            await fetchDisputes();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const statusStyle = (value) => {
        if (value === "resolved") return "bg-green-100 text-green-700";
        if (value === "rejected") return "bg-red-100 text-red-700";
        if (value === "under_review") return "bg-amber-100 text-amber-700";
        return "bg-gray-100 text-gray-700";
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#FBF6EE] px-4 py-8 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <Link to="/admin/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-[#7A6A5D] hover:text-[#7A1F2B]">
                        <IoArrowBackOutline /> Back to Dashboard
                    </Link>
                    <div className="mb-8">
                        <p className="text-sm font-semibold uppercase tracking-widest text-[#C2572C]">Administration</p>
                        <h1 className="mt-2 text-3xl font-bold text-[#2B1B12]">Manage Disputes</h1>
                        <p className="mt-2 text-[#7A6A5D]">Review complaints and record resolution decisions.</p>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                        {[
                            { label: "Total Disputes", value: disputes.length },
                            { label: "Open", value: disputes.filter(d => d.status === "open").length },
                            { label: "Under Review", value: disputes.filter(d => d.status === "under_review").length },
                            { label: "Closed", value: disputes.filter(d => ["resolved", "rejected"].includes(d.status)).length }
                        ].map(item => (
                            <div key={item.label} className="rounded-xl border border-[#E8DCC8] bg-white p-5">
                                <p className="text-sm text-[#7A6A5D]">{item.label}</p>
                                <p className="mt-2 text-2xl font-bold text-[#7A1F2B]">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="overflow-hidden rounded-xl border border-[#E8DCC8] bg-white">
                        {loading ? (
                            <p className="p-8 text-center text-[#7A6A5D]">Loading disputes...</p>
                        ) : error ? (
                            <div className="p-8 text-center text-red-700">
                                <p>{error}</p>
                                <button onClick={fetchDisputes} className="mt-3 font-semibold underline">
                                    Retry
                                </button>
                            </div>
                        ) : disputes.length === 0 ? (
                            <p className="p-8 text-center text-[#7A6A5D]">No disputes found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[850px] text-left">
                                    <thead className="bg-[#F8EFE2] text-sm text-[#2B1B12]">
                                        <tr>
                                            <th className="p-4">Complaint</th>
                                            <th className="p-4">Raised By</th>
                                            <th className="p-4">Booking</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {disputes.map(dispute => (
                                            <tr key={dispute._id} className="border-t border-[#E8DCC8]">
                                                <td className="p-4">
                                                    <p className="font-semibold text-[#2B1B12]">{dispute.subject}</p>
                                                    <p className="mt-1 max-w-xs truncate text-sm text-[#7A6A5D]">{dispute.description}</p>
                                                </td>
                                                <td className="p-4 capitalize text-[#7A6A5D]">{dispute.raisedBy}</td>
                                                <td className="p-4 text-sm text-[#7A6A5D]">
                                                    {dispute.booking?.bookingDate ? new Date(dispute.booking.bookingDate).toLocaleDateString() : "N/A"}
                                                    <p>{dispute.booking?.startTime || ""}</p>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(dispute.status)}`}>
                                                        {dispute.status.replace("_", " ")}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-[#7A6A5D]">
                                                    {dispute.createdAt && !Number.isNaN(new Date(dispute.createdAt).getTime())
                                                        ? new Date(dispute.createdAt).toLocaleDateString("en-IN")
                                                        : "—"}
                                                </td>
                                                <td className="p-4">
                                                    <button onClick={() => openDispute(dispute)} className="inline-flex items-center gap-2 rounded-lg bg-[#7A1F2B] px-3 py-2 text-sm font-semibold text-white hover:bg-[#5E1721]">
                                                        <IoEyeOutline size={18} /> Review
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />

            {selectedDispute && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#2B1B12]">Review Dispute</h2>
                            <button onClick={() => setSelectedDispute(null)} className="rounded-lg p-2 text-[#7A6A5D] hover:bg-[#FBF6EE]">
                                <IoCloseOutline size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-[#7A6A5D]">Subject</p>
                                <p className="font-semibold text-[#2B1B12]">{selectedDispute.subject}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#7A6A5D]">Description</p>
                                <p className="whitespace-pre-wrap text-[#2B1B12]">{selectedDispute.description}</p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-[#7A6A5D]">Customer</p>
                                    <p className="font-medium text-[#2B1B12]">{selectedDispute.user?.name || "N/A"}</p>
                                    <p className="text-sm text-[#7A6A5D]">{selectedDispute.user?.email || ""}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-[#7A6A5D]">Pandit</p>
                                    <p className="font-medium text-[#2B1B12]">{selectedDispute.pandit?.name || "N/A"}</p>
                                    <p className="text-sm text-[#7A6A5D]">{selectedDispute.pandit?.email || ""}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-[#7A6A5D]">Booking Status</p>
                                <p className="font-medium capitalize text-[#2B1B12]">{selectedDispute.booking?.status || "N/A"}</p>
                            </div>
                            <form onSubmit={updateDispute} className="space-y-4 border-t border-[#E8DCC8] pt-5">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[#2B1B12]">Update Status</label>
                                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-full rounded-lg border border-[#E8DCC8] bg-white p-3 outline-none focus:border-[#7A1F2B]">
                                        <option value="open">Open</option>
                                        <option value="under_review">Under Review</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[#2B1B12]">Resolution / Admin Notes</label>
                                    <textarea value={resolution} onChange={e => setResolution(e.target.value)} rows="4" placeholder="Enter the decision or resolution..." className="w-full rounded-lg border border-[#E8DCC8] p-3 outline-none focus:border-[#7A1F2B]" />
                                </div>
                                <button disabled={saving} className="w-full rounded-lg bg-[#7A1F2B] py-3 font-semibold text-white hover:bg-[#5E1721] disabled:opacity-60">
                                    {saving ? "Saving..." : "Save Decision"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};