import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoPersonOutline, IoMailOutline, IoCallOutline, IoLockClosedOutline, IoDocumentTextOutline, IoArrowForwardOutline, IoLocationOutline } from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { toast } from "react-toastify";
import { MyContextData } from "../../ContextData/MyContextData";

export default function PanditRegister() {
        const {currentUser, fetchUser}=useContext(MyContextData)

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        bio: "",
        experience: "",
        languages: "",
        idProof: "",
        location: { city: "", state: "", pincode: "" }
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("location.")) {
            const field = name.split(".")[1];
            setFormData(prev => ({ ...prev, location: { ...prev.location, [field]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/pandit/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    password: formData.password,
                    bio: formData.bio.trim(),
                    experience: Number(formData.experience),
                    languages: formData.languages.split(",").map(language => language.trim()).filter(Boolean),
                    idProof: formData.idProof.trim(),
                    location: formData.location
                })
            });
            const data = await response.json();
            if (!response.ok || data.error) {
                toast.error(data.error || "Registration failed.");
                return;
            }
            if (data.success) {
                await fetchUser();
                toast.success(data.success);
                navigate("/pandit/dashboard")
            }
        } catch (error) {
            console.error("Pandit registration error:", error);
            toast.error("Unable to register. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full rounded-lg border border-[#E8DCC8] bg-white px-4 py-3 text-sm text-[#2B1B12] outline-none transition placeholder:text-[#A89A8D] focus:border-[#C2572C] focus:ring-2 focus:ring-[#C2572C]/10";
    const labelClass = "mb-1.5 block text-sm font-medium text-[#2B1B12]";

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#FBF6EE] px-4 py-10 sm:px-6">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-8 text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C2572C]">Join PujaConnect</p>
                        <h1 className="mt-3 text-3xl font-bold text-[#7A1F2B] sm:text-4xl">Pandit Registration</h1>
                        <p className="mt-3 text-sm text-[#7A6A5D]">Create your profile to receive puja booking requests.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E8DCC8] bg-white p-5 shadow-sm sm:p-8">
                        <h2 className="mb-5 text-lg font-bold text-[#7A1F2B]">Personal Information</h2>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Full Name</label>
                                <div className="relative"><IoPersonOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A5D]" /><input className={`${inputClass} pl-10`} name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} autoComplete="name" required /></div>
                            </div>
                            <div>
                                <label className={labelClass}>Email Address</label>
                                <div className="relative"><IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A5D]" /><input className={`${inputClass} pl-10`} type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} autoComplete="email" required /></div>
                            </div>
                            <div>
                                <label className={labelClass}>Phone Number</label>
                                <div className="relative"><IoCallOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A5D]" /><input className={`${inputClass} pl-10`} type="tel" name="phone" placeholder="10-digit phone number" value={formData.phone} onChange={handleChange} pattern="[0-9]{10}" title="Enter a 10-digit phone number" required /></div>
                            </div>
                            <div>
                                <label className={labelClass}>Experience (Years)</label>
                                <input className={inputClass} type="number" name="experience" min="0" max="80" placeholder="Years of experience" value={formData.experience} onChange={handleChange} required />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Languages</label>
                                <input className={inputClass} name="languages" placeholder="Hindi, Marathi, Sanskrit" value={formData.languages} onChange={handleChange} required />
                                <p className="mt-1 text-xs text-[#7A6A5D]">Separate languages with commas.</p>
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>About You</label>
                                <textarea className={inputClass} name="bio" rows="3" placeholder="Describe your experience and the pujas you perform" value={formData.bio} onChange={handleChange} />
                            </div>
                        </div>

                        <h2 className="mb-5 mt-8 text-lg font-bold text-[#7A1F2B]">Location</h2>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>City</label>
                                <div className="relative"><IoLocationOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A5D]" /><input className={`${inputClass} pl-10`} name="location.city" placeholder="Enter city" value={formData.location.city} onChange={handleChange} required /></div>
                            </div>
                            <div>
                                <label className={labelClass}>State</label>
                                <input className={inputClass} name="location.state" placeholder="Enter state" value={formData.location.state} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className={labelClass}>PIN Code</label>
                                <input className={inputClass} name="location.pincode" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="6-digit PIN code" value={formData.location.pincode} onChange={handleChange} required />
                            </div>
                        </div>

                        <h2 className="mb-5 mt-8 text-lg font-bold text-[#7A1F2B]">Account Security</h2>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Password</label>
                                <div className="relative"><IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A5D]" /><input className={`${inputClass} pl-10`} type="password" name="password" placeholder="Minimum 8 characters" value={formData.password} onChange={handleChange} minLength={8} autoComplete="new-password" required /></div>
                            </div>
                            <div>
                                <label className={labelClass}>Confirm Password</label>
                                <div className="relative"><IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A5D]" /><input className={`${inputClass} pl-10`} type="password" name="confirmPassword" placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} minLength={8} autoComplete="new-password" required /></div>
                            </div>
                        </div>

                        <h2 className="mb-2 mt-8 text-lg font-bold text-[#7A1F2B]">Identity Verification</h2>
                        <p className="mb-5 text-sm text-[#7A6A5D]">Enter your ID proof details for verification by our team.</p>
                        <div>
                            <label className={labelClass}>ID Proof Details</label>
                            <div className="relative"><IoDocumentTextOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A5D]" /><input className={`${inputClass} pl-10`} name="idProof" placeholder="Enter ID proof details" value={formData.idProof} onChange={handleChange} required /></div>
                        </div>

                        <button type="submit" disabled={loading} className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-[#C2572C] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#A94725] disabled:cursor-not-allowed disabled:opacity-60">
                            {loading ? "Registering..." : "Register as Pandit"} {!loading && <IoArrowForwardOutline />}
                        </button>
                        <p className="mt-5 text-center text-sm text-[#7A6A5D]">Already registered? <Link to="/login" className="font-semibold text-[#C2572C] hover:text-[#7A1F2B]">Login</Link></p>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    );
}
