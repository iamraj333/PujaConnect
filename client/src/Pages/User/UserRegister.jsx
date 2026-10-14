import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoPersonOutline, IoMailOutline, IoCallOutline, IoLockClosedOutline, IoLocationOutline, IoEyeOutline, IoEyeOffOutline, IoArrowForwardOutline } from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { toast } from "react-toastify";
import { MyContextData } from "../../ContextData/MyContextData";

export default function UserRegister() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        address: { house: "", street: "", area: "", city: "", state: "", pincode: "" }
    });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const {currentUser, fetchUser}=useContext(MyContextData)
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("address.")) {
            const field = name.split(".")[1];
            setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
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
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/user/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    address: formData.address
                }),
                credentials:"include",
            });
            const data = await response.json();
            if (data.success) {
                await fetchUser();
                toast.success("Account created successfully. Redirecting to login...");
                navigate("/user/dashboard")
            } else {
                toast.error(data.error)
            }
        } catch (error) {
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
                        <h1 className="mt-3 text-3xl font-bold text-[#7A1F2B] sm:text-4xl">Create Your Account</h1>
                        <p className="mt-3 text-sm text-[#7A6A5D]">Book trusted Pandits for your special occasions.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E8DCC8] bg-white p-5 shadow-sm sm:p-8">
                        <h2 className="mb-5 text-lg font-bold text-[#7A1F2B]">Personal Information</h2>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Full Name</label>
                                <div className="relative"><IoPersonOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A5D]" /><input className={`${inputClass} pl-10`} type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} autoComplete="name" required /></div>
                            </div>
                            <div>
                                <label className={labelClass}>Email Address</label>
                                <div className="relative"><IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A5D]" /><input className={`${inputClass} pl-10`} type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} autoComplete="email" required /></div>
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Phone Number</label>
                                <div className="relative"><IoCallOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A5D]" /><input className={`${inputClass} pl-10`} type="tel" name="phone" placeholder="Enter your phone number" value={formData.phone} onChange={handleChange} autoComplete="tel" pattern="[0-9]{10}" title="Enter a 10-digit phone number" required /></div>
                            </div>
                        </div>
                        <h2 className="mb-5 mt-8 text-lg font-bold text-[#7A1F2B]">Address Details</h2>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div><label className={labelClass}>House / Flat</label><input className={inputClass} name="address.house" placeholder="House or flat number" value={formData.address.house} onChange={handleChange} required /></div>
                            <div><label className={labelClass}>Street</label><input className={inputClass} name="address.street" placeholder="Street name" value={formData.address.street} onChange={handleChange} required /></div>
                            <div><label className={labelClass}>Area / Locality</label><input className={inputClass} name="address.area" placeholder="Area or locality" value={formData.address.area} onChange={handleChange} required /></div>
                            <div><label className={labelClass}>City</label><input className={inputClass} name="address.city" placeholder="City" value={formData.address.city} onChange={handleChange} required /></div>
                            <div><label className={labelClass}>State</label><input className={inputClass} name="address.state" placeholder="State" value={formData.address.state} onChange={handleChange} required /></div>
                            <div><label className={labelClass}>PIN Code</label><input className={inputClass} type="text" name="address.pincode" placeholder="6-digit PIN code" value={formData.address.pincode} onChange={handleChange} pattern="[0-9]{6}" title="Enter a 6-digit PIN code" maxLength={6} required /></div>
                        </div>
                        <h2 className="mb-5 mt-8 text-lg font-bold text-[#7A1F2B]">Security</h2>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Password</label>
                                <div className="relative">
                                    <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A5D]" />
                                    <input className={`${inputClass} pl-10`} type="password" name="password" placeholder="Minimum 8 characters" value={formData.password} onChange={handleChange} autoComplete="new-password" minLength={8} required/>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Confirm Password</label>
                                <div className="relative">
                                    <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A5D]" />
                                    <input className={`${inputClass} pl-10`} type="password" name="confirmPassword" placeholder="Re-enter your password" value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" minLength={8} required/>
                                </div>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-[#C2572C] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#A94725] disabled:cursor-not-allowed disabled:opacity-60">
                            {loading ? "Creating Account..." : "Create Account"} {!loading && <IoArrowForwardOutline />}
                        </button>
                        <p className="mt-5 text-center text-sm text-[#7A6A5D]">Already have an account? <Link to="/login" className="font-semibold text-[#C2572C] hover:text-[#7A1F2B]">Login</Link></p>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    );
}