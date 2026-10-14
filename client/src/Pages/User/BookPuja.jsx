import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MyContextData } from "../../ContextData/MyContextData";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { IoCalendarOutline, IoTimeOutline, IoHomeOutline, IoLocationOutline } from "react-icons/io5";

const API_URL = import.meta.env.VITE_SERVER_URL;
const emptyAddress = { house: "", street: "", area: "", city: "", state: "", pincode: "" };

const BookPuja = () => {
    const { ritualId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(MyContextData);
    const [ritual, setRitual] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        bookingDate: "",
        startTime: "",
        locationType: "home",
        address: { ...emptyAddress },
        price: "",
        notes: ""
    });

    useEffect(() => {
        const fetchRitual = async () => {
            try {
                const response = await fetch(`${API_URL}/ritual/all`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Failed to load puja details.");
                const selectedRitual = (data.rituals || []).find(item => item._id === ritualId && item.isActive);
                if (!selectedRitual) throw new Error("Puja not found or unavailable.");
                setRitual(selectedRitual);
                setFormData(prev => ({
                    ...prev,
                    locationType: selectedRitual.locationType?.[0] || "home",
                    price: String(selectedRitual.priceRange.min)
                }));
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRitual();
    }, [ritualId]);

    useEffect(() => {
        if (currentUser?.role === "user" && currentUser?.user?.address) {
            setFormData(prev => ({
                ...prev,
                address: {
                    house: currentUser.user.address.house || "",
                    street: currentUser.user.address.street || "",
                    area: currentUser.user.address.area || "",
                    city: currentUser.user.address.city || "",
                    state: currentUser.user.address.state || "",
                    pincode: currentUser.user.address.pincode || ""
                }
            }));
        }
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("address.")) {
            const field = name.split(".")[1];
            setFormData(prev => ({
                ...prev,
                address: { ...prev.address, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (currentUser?.role !== "user") {
            navigate("/login");
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/booking/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    ritual: ritual._id,
                    bookingDate: formData.bookingDate,
                    startTime: formData.startTime,
                    locationType: formData.locationType,
                    address: formData.address,
                    price: Number(formData.price),
                    notes: formData.notes.trim()
                })
            });

            const data = await response.json();
            if (!response.ok || data.error) {
                throw new Error(data.error || "Failed to create booking.");
            }
            navigate("/my-bookings", { state: { message: data.message } });
        } catch (error) {
            setError(error.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const today = new Date();
    const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const addressFields = [
        ["house", formData.locationType === "temple" ? "Temple Name" : "House / Flat No."],
        ["street", "Street"],
        ["area", "Area / Locality"],
        ["city", "City"],
        ["state", "State"],
        ["pincode", "PIN Code"]
    ];

    const inputClass = "w-full rounded-lg border border-[#E8DCC8] bg-white px-3 py-3 text-[#2B1B12] outline-none transition focus:border-[#7A1F2B] focus:ring-1 focus:ring-[#7A1F2B]";

    if (loading) {
        return <><Navbar /><div className="flex min-h-[60vh] items-center justify-center text-[#7A6A5D]">Loading puja details...</div><Footer /></>;
    }

    if (error && !ritual) {
        return <><Navbar /><div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4"><p className="text-center text-red-600">{error}</p><button onClick={() => navigate("/pujas")} className="rounded-lg bg-[#7A1F2B] px-5 py-2.5 text-white">Explore Pujas</button></div><Footer /></>;
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#FBF6EE] px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <button type="button" onClick={() => navigate("/pujas")} className="mb-6 text-sm font-medium text-[#7A1F2B] hover:underline">← Back to Explore Pujas</button>
                    <div className="grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                        <section className="rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-sm">
                            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#C2572C]">Puja Details</p>
                            <h1 className="mb-3 text-2xl font-bold text-[#2B1B12]">{ritual.name}</h1>
                            <p className="mb-5 text-sm leading-6 text-[#7A6A5D]">{ritual.description}</p>
                            <div className="space-y-4 border-t border-[#E8DCC8] pt-4 text-sm text-[#2B1B12]">
                                <p className="flex items-center gap-3"><IoTimeOutline size={20} className="text-[#C2572C]" />Duration: {ritual.duration} minutes</p>
                                <p className="flex items-center gap-3"><IoLocationOutline size={20} className="text-[#C2572C]" />Available at: {ritual.locationType?.join(", ") || "Not specified"}</p>
                            </div>
                            <div className="mt-6 rounded-xl bg-[#FBF6EE] p-4">
                                <p className="text-sm text-[#7A6A5D]">Price Range</p>
                                <p className="mt-1 text-2xl font-bold text-[#7A1F2B]">₹{ritual.priceRange.min.toLocaleString("en-IN")} – ₹{ritual.priceRange.max.toLocaleString("en-IN")}</p>
                            </div>
                            {ritual.requiredMaterials?.length > 0 && <div className="mt-5"><h2 className="mb-2 font-semibold text-[#2B1B12]">Required Materials</h2><ul className="list-inside list-disc space-y-1 text-sm text-[#7A6A5D]">{ritual.requiredMaterials.map((material, index) => <li key={index}>{material}</li>)}</ul></div>}
                        </section>

                        <section className="rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="mb-2 text-2xl font-bold text-[#2B1B12]">Book Your Puja</h2>
                            <p className="mb-6 text-sm text-[#7A6A5D]">Enter your ceremony schedule and location details.</p>
                            {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-[#2B1B12]"><IoCalendarOutline className="mr-2 inline" />Booking Date</label>
                                        <input type="date" name="bookingDate" min={minDate} value={formData.bookingDate} onChange={handleChange} required className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-[#2B1B12]"><IoTimeOutline className="mr-2 inline" />Start Time</label>
                                        <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className={inputClass} />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#2B1B12]">Ceremony Location</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {["home", "temple"].filter(type => ritual.locationType?.includes(type)).map(type => (
                                            <button type="button" key={type} onClick={() => setFormData(prev => ({ ...prev, locationType: type }))} className={`rounded-lg border px-4 py-3 font-medium capitalize transition ${formData.locationType === type ? "border-[#7A1F2B] bg-[#7A1F2B] text-white" : "border-[#E8DCC8] text-[#2B1B12] hover:border-[#C2572C]"}`}>
                                                {type === "home" ? <IoHomeOutline className="mr-2 inline" /> : <IoLocationOutline className="mr-2 inline" />}{type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-1 font-semibold text-[#2B1B12]">{formData.locationType === "home" ? "Home Address" : "Temple Address"}</h3>
                                    <p className="mb-3 text-xs text-[#7A6A5D]">{formData.locationType === "home" ? "Your saved address is filled in automatically when available." : "Enter the temple name or details and its complete address."}</p>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {addressFields.map(([field, label]) => (
                                            <div key={field}>
                                                <label className="mb-1.5 block text-sm text-[#7A6A5D]">{label}</label>
                                                <input name={`address.${field}`} value={formData.address[field]} onChange={handleChange} required placeholder={field === "house" && formData.locationType === "temple" ? "Temple name / building" : label} inputMode={field === "pincode" ? "numeric" : "text"} maxLength={field === "pincode" ? 6 : undefined} pattern={field === "pincode" ? "[0-9]{6}" : undefined} className={inputClass} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#2B1B12]">Your Budget (₹)</label>
                                    <input type="number" name="price" min={ritual.priceRange.min} max={ritual.priceRange.max} value={formData.price} onChange={handleChange} required className={inputClass} />
                                    <p className="mt-1 text-xs text-[#7A6A5D]">Choose an amount between ₹{ritual.priceRange.min} and ₹{ritual.priceRange.max}.</p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#2B1B12]">Additional Notes (Optional)</label>
                                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" maxLength="500" placeholder="Any specific requirements for your puja..." className={`${inputClass} resize-y`} />
                                </div>

                                <button type="submit" disabled={submitting} className="w-full rounded-lg bg-[#7A1F2B] px-5 py-3.5 font-semibold text-white transition hover:bg-[#5D1721] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Submitting Booking..." : "Confirm Booking"}</button>
                                <p className="text-center text-xs text-[#7A6A5D]">Your booking will be processed and shared with eligible verified Pandits.</p>
                            </form>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default BookPuja;