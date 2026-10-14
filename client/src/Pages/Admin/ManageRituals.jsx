
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { IoArrowBackOutline, IoAddOutline, IoCloseOutline, IoCreateOutline, IoTrashOutline, IoBookOutline } from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

const API_URL = import.meta.env.VITE_SERVER_URL;

const initialFormData = {
    name: "",
    description: "",
    duration: "",
    requiredMaterials: "",
    minPrice: "",
    maxPrice: "",
    locationType: ["home", "temple"],
    isActive: true
};

export default function ManageRituals() {
    const [showForm, setShowForm] = useState(false);
    const [editingRitual, setEditingRitual] = useState(null);
    const [rituals, setRituals] = useState([]);
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [ritualToDelete, setRitualToDelete] = useState(null);

    const fetchRituals = async () => {
        try {
            const response = await fetch(`${API_URL}/ritual/all`, {
                credentials: "include"
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to load rituals.");
            setRituals(data.rituals || []);
        } catch (error) {
            toast.error(error.message || "Failed to load rituals.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRituals();
    }, []);

    const resetForm = () => {
        setFormData({ ...initialFormData });
        setEditingRitual(null);
        setShowForm(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleLocationChange = (location) => {
        setFormData(prev => ({
            ...prev,
            locationType: prev.locationType.includes(location)
                ? prev.locationType.filter(item => item !== location)
                : [...prev.locationType, location]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.description.trim()) {
            toast.error("Please enter the ritual name and description.");
            return;
        }

        if (Number(formData.minPrice) > Number(formData.maxPrice)) {
            toast.error("Minimum price cannot exceed maximum price.");
            return;
        }

        if (formData.locationType.length === 0) {
            toast.error("Select at least one location.");
            return;
        }

        const ritualData = {
            name: formData.name.trim(),
            description: formData.description.trim(),
            duration: Number(formData.duration),
            requiredMaterials: formData.requiredMaterials.split(",").map(item => item.trim()).filter(Boolean),
            priceRange: {
                min: Number(formData.minPrice),
                max: Number(formData.maxPrice)
            },
            locationType: formData.locationType,
            isActive: formData.isActive
        };

        try {
            setSaving(true);

            const url = editingRitual
                ? `${API_URL}/ritual/update/${editingRitual._id}`
                : `${API_URL}/ritual/create`;

            const response = await fetch(url, {
                method: editingRitual ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(ritualData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to save ritual.");

            await fetchRituals();
            resetForm();
            toast.success(data.success || "Ritual saved successfully.");
        } catch (error) {
            toast.error(error.message || "Failed to save ritual.");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (ritual) => {
        setEditingRitual(ritual);
        setFormData({
            name: ritual.name,
            description: ritual.description,
            duration: String(ritual.duration),
            requiredMaterials: (ritual.requiredMaterials || []).join(", "),
            minPrice: String(ritual.priceRange.min),
            maxPrice: String(ritual.priceRange.max),
            locationType: ritual.locationType || [],
            isActive: ritual.isActive
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async () => {
        if (!ritualToDelete) return;

        try {
            setDeletingId(ritualToDelete._id);

            const response = await fetch(`${API_URL}/ritual/delete/${ritualToDelete._id}`, {
                method: "DELETE",
                credentials: "include"
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to delete ritual.");

            setRituals(prev => prev.filter(ritual => ritual._id !== ritualToDelete._id));
            setRitualToDelete(null);
            toast.success(data.success || "Ritual deleted successfully.");
        } catch (error) {
            toast.error(error.message || "Failed to delete ritual.");
        } finally {
            setDeletingId(null);
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

                    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#C2572C]">Admin Management</p>
                            <h1 className="text-3xl font-bold text-[#2B1B12] sm:text-4xl">Manage Rituals</h1>
                            <p className="mt-2 text-[#7A6A5D]">Create and manage pujas available on PujaConnect.</p>
                        </div>
                        <button onClick={() => { resetForm(); setShowForm(true); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7A1F2B] px-5 py-3 font-semibold text-white transition hover:bg-[#5E1721]">
                            <IoAddOutline size={20} /> Add Ritual
                        </button>
                    </div>

                    {showForm && (
                        <section className="mb-8 rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-[#2B1B12]">{editingRitual ? "Edit Ritual" : "Add New Ritual"}</h2>
                                <button type="button" onClick={resetForm} disabled={saving} className="rounded-lg p-2 text-[#7A6A5D] hover:bg-[#FBF6EE] disabled:opacity-50" aria-label="Close form">
                                    <IoCloseOutline size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-[#2B1B12]">Ritual Name *</label>
                                        <input name="name" value={formData.name} onChange={handleChange} required className="w-full rounded-lg border border-[#E8DCC8] px-4 py-3 outline-none focus:border-[#7A1F2B]" placeholder="e.g. Satyanarayan Katha" />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-[#2B1B12]">Duration (minutes) *</label>
                                        <input type="number" name="duration" min="1" value={formData.duration} onChange={handleChange} required className="w-full rounded-lg border border-[#E8DCC8] px-4 py-3 outline-none focus:border-[#7A1F2B]" placeholder="e.g. 120" />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#2B1B12]">Description *</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" className="w-full rounded-lg border border-[#E8DCC8] px-4 py-3 outline-none focus:border-[#7A1F2B]" placeholder="Describe this puja or ritual..." />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#2B1B12]">Required Materials</label>
                                    <input name="requiredMaterials" value={formData.requiredMaterials} onChange={handleChange} className="w-full rounded-lg border border-[#E8DCC8] px-4 py-3 outline-none focus:border-[#7A1F2B]" placeholder="Flowers, coconut, incense (comma separated)" />
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-[#2B1B12]">Minimum Price (₹) *</label>
                                        <input type="number" name="minPrice" min="0" value={formData.minPrice} onChange={handleChange} required className="w-full rounded-lg border border-[#E8DCC8] px-4 py-3 outline-none focus:border-[#7A1F2B]" placeholder="e.g. 2100" />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-[#2B1B12]">Maximum Price (₹) *</label>
                                        <input type="number" name="maxPrice" min="0" value={formData.maxPrice} onChange={handleChange} required className="w-full rounded-lg border border-[#E8DCC8] px-4 py-3 outline-none focus:border-[#7A1F2B]" placeholder="e.g. 5100" />
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-3 text-sm font-medium text-[#2B1B12]">Available Location *</p>
                                    <div className="flex flex-wrap gap-5">
                                        {["home", "temple"].map(location => (
                                            <label key={location} className="flex items-center gap-2 text-sm capitalize text-[#7A6A5D]">
                                                <input type="checkbox" checked={formData.locationType.includes(location)} onChange={() => handleLocationChange(location)} className="h-4 w-4 accent-[#7A1F2B]" />
                                                {location}
                                            </label>
                                        ))}
                                    </div>
                                    {formData.locationType.length === 0 && <p className="mt-2 text-sm text-red-600">Select at least one location.</p>}
                                </div>

                                <label className="flex items-center gap-3 text-sm font-medium text-[#2B1B12]">
                                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 accent-[#7A1F2B]" />
                                    Make this ritual active
                                </label>

                                <div className="flex flex-wrap gap-3">
                                    <button type="submit" disabled={saving || formData.locationType.length === 0} className="rounded-lg bg-[#7A1F2B] px-6 py-3 font-semibold text-white hover:bg-[#5E1721] disabled:cursor-not-allowed disabled:opacity-50">
                                        {saving ? "Saving..." : editingRitual ? "Save Changes" : "Add Ritual"}
                                    </button>
                                    <button type="button" onClick={resetForm} disabled={saving} className="rounded-lg border border-[#E8DCC8] px-6 py-3 font-semibold text-[#7A1F2B] hover:bg-[#FBF6EE] disabled:opacity-50">Cancel</button>
                                </div>
                            </form>
                        </section>
                    )}

                    <section className="rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#2B1B12]">All Rituals</h2>
                            <span className="rounded-full bg-[#F7EAE5] px-3 py-1 text-sm font-semibold text-[#7A1F2B]">{rituals.length} rituals</span>
                        </div>

                        {loading ? (
                            <p className="py-12 text-center text-[#7A6A5D]">Loading rituals...</p>
                        ) : rituals.length === 0 ? (
                            <div className="py-12 text-center">
                                <IoBookOutline className="mx-auto mb-4 text-[#C9A227]" size={44} />
                                <h3 className="text-lg font-semibold text-[#2B1B12]">No rituals yet</h3>
                                <p className="mt-2 text-sm text-[#7A6A5D]">Add your first ritual to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {rituals.map(ritual => (
                                    <article key={ritual._id} className="rounded-xl border border-[#E8DCC8] p-5">
                                        <div className="flex flex-col justify-between gap-4 sm:flex-row">
                                            <div className="min-w-0">
                                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                                    <h3 className="text-lg font-bold text-[#2B1B12]">{ritual.name}</h3>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ritual.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                                        {ritual.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </div>
                                                <p className="text-sm leading-6 text-[#7A6A5D]">{ritual.description}</p>
                                                <p className="mt-3 text-sm text-[#2B1B12]">Duration: {ritual.duration} minutes</p>
                                                <p className="mt-1 text-sm text-[#2B1B12]">Price: ₹{ritual.priceRange.min} – ₹{ritual.priceRange.max}</p>
                                                <p className="mt-1 text-sm capitalize text-[#7A6A5D]">Location: {(ritual.locationType || []).join(", ")}</p>
                                                {(ritual.requiredMaterials || []).length > 0 && (
                                                    <p className="mt-2 text-sm text-[#7A6A5D]">Materials: {ritual.requiredMaterials.join(", ")}</p>
                                                )}
                                            </div>
                                            <div className="flex shrink-0 gap-2">
                                                <button onClick={() => handleEdit(ritual)} className="flex h-10 items-center gap-2 rounded-lg border border-[#E8DCC8] px-3 text-sm font-medium text-[#7A1F2B] hover:bg-[#FBF6EE]">
                                                    <IoCreateOutline size={18} /> Edit
                                                </button>
                                                <button onClick={() => setRitualToDelete(ritual)} disabled={deletingId === ritual._id} className="flex h-10 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
                                                    <IoTrashOutline size={18} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {ritualToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" onClick={(e) => {
                    if (e.target === e.currentTarget && deletingId !== ritualToDelete._id) setRitualToDelete(null);
                }}>
                    <div role="dialog" aria-modal="true" aria-labelledby="delete-ritual-title" className="w-full max-w-md rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <IoTrashOutline size={24} />
                        </div>
                        <h2 id="delete-ritual-title" className="text-xl font-bold text-[#2B1B12]">Delete Ritual?</h2>
                        <p className="mt-2 text-sm leading-6 text-[#7A6A5D]">
                            Are you sure you want to delete <span className="font-semibold text-[#2B1B12]">{ritualToDelete.name}</span>? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setRitualToDelete(null)} disabled={deletingId === ritualToDelete._id} className="rounded-lg border border-[#E8DCC8] px-5 py-2.5 font-medium text-[#7A1F2B] hover:bg-[#FBF6EE] disabled:opacity-50">
                                Cancel
                            </button>
                            <button onClick={handleDelete} disabled={deletingId === ritualToDelete._id} className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                                {deletingId === ritualToDelete._id ? "Deleting..." : "Delete Ritual"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}
