
import { useContext, useState } from "react";
import { IoPersonOutline, IoBriefcaseOutline, IoShieldCheckmarkOutline, IoMailOutline, IoLockClosedOutline,IoArrowForwardOutline } from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MyContextData } from "../../ContextData/MyContextData";

export default function Login() {
    const [role, setRole] = useState("user");
    const {currentUser, fetchUser}=useContext(MyContextData)
    const [rememberMe, setRememberMe] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);

    const roles = [
        { value: "user", label: "User", icon: IoPersonOutline },
        { value: "pandit", label: "Pandit", icon: IoBriefcaseOutline },
        { value: "admin", label: "Admin", icon: IoShieldCheckmarkOutline }
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    ...formData,
                    role: role,
                    rememberMe: rememberMe
                })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                await fetchUser();
                toast.success(data.success || "Login successful.");
                if (role === "user") navigate("/user/dashboard");
                else if (role === "pandit") navigate("/pandit/dashboard");
                else navigate("/admin/dashboard");
                return;
            }
            else if (data.error) {
                toast.error(data.error || "Login failed. Please try again.");
                return;
            }
            else {
                toast.warn(data.warning);
                return;
            }
        } catch (error) {
            toast.error("Unable to connect to the server.");
            console.error("Login error:", error);
        }
        finally {
            setLoading(false)
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-[80vh] bg-[#FBF6EE] px-4 py-12 sm:py-16">
                <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">
                    <div className="flex flex-col justify-center bg-[#7A1F2B] px-7 py-12 text-white sm:px-10">
                        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                            <IoPersonOutline />
                        </div>
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#E8C76A]">Welcome Back</p>
                        <h1 className="mb-5 text-3xl font-bold leading-tight sm:text-4xl">Your spiritual journey continues here.</h1>
                        <p className="leading-7 text-white/80">Sign in to book trusted Pandits, manage your puja bookings, or manage your PujaConnect account.</p>
                        <div className="mt-10 border-t border-white/20 pt-6">
                            <p className="text-sm text-white/70">New to PujaConnect?</p>
                            <Link href="/getStarted" className="mt-2 inline-flex items-center gap-2 font-semibold text-[#E8C76A] hover:text-white">
                                Create an account <IoArrowForwardOutline />
                            </Link>
                        </div>
                    </div>

                    <div className="px-6 py-10 sm:px-10 sm:py-12">
                        <h2 className="text-2xl font-bold text-[#2B1B12]">Sign In</h2>
                        <p className="mt-2 text-sm text-[#7A6A5D]">Choose your account type to continue.</p>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                            <div>
                                <label className="mb-3 block text-sm font-semibold text-[#2B1B12]">Sign in as</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {roles.map(({ value, label, icon: Icon }) => (
                                        <button key={value} type="button" onClick={() => setRole(value)} className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-sm font-medium transition ${role === value ? "border-[#7A1F2B] bg-[#7A1F2B]/5 text-[#7A1F2B] ring-1 ring-[#7A1F2B]" : "border-[#E8DCC8] text-[#7A6A5D] hover:border-[#C2572C]"}`}>
                                            <Icon className="text-xl" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#2B1B12]">Email address</label>
                                <div className="flex items-center gap-3 rounded-xl border border-[#E8DCC8] px-4 focus-within:border-[#7A1F2B]">
                                    <IoMailOutline className="shrink-0 text-xl text-[#7A6A5D]" />
                                    <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required className="w-full bg-transparent py-3.5 text-sm text-[#2B1B12] outline-none placeholder:text-[#A99A8D]" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#2B1B12]">Password</label>
                                <div className="flex items-center gap-3 rounded-xl border border-[#E8DCC8] px-4 focus-within:border-[#7A1F2B]">
                                    <IoLockClosedOutline className="shrink-0 text-xl text-[#7A6A5D]" />
                                    <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={formData.password} onChange={handleChange} required className="w-full bg-transparent py-3.5 text-sm text-[#2B1B12] outline-none placeholder:text-[#A99A8D]" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 text-sm">
                                <label className="flex cursor-pointer items-center gap-2 text-[#7A6A5D]">
                                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 accent-[#7A1F2B]" />
                                    Remember me
                                </label>
                                <a href="/forgot-password" className="font-medium text-[#7A1F2B] hover:text-[#C2572C]">Forgot password?</a>
                            </div>

                            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7A1F2B] py-3.5 font-semibold text-white transition hover:bg-[#5F1721] disabled:cursor-not-allowed disabled:opacity-60">
                                {loading ? "Signing in..." : <>Sign In <IoArrowForwardOutline className="text-lg" /></>}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-xs leading-5 text-[#7A6A5D]">By signing in, you agree to PujaConnect's Terms of Service and Privacy Policy.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

