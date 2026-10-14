
import { Link } from "react-router-dom";
import { IoShieldCheckmarkOutline, IoPersonOutline, IoArrowBackOutline, IoLockClosedOutline } from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

export default function AdminSettings() {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "";

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#FBF6EE] px-4 py-10 text-[#2B1B12]">
                <div className="mx-auto max-w-3xl">
                    <Link to="/admin/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#7A1F2B]">
                        <IoArrowBackOutline /> Back to Dashboard
                    </Link>

                    <div className="mb-8">
                        <p className="text-sm font-semibold uppercase tracking-widest text-[#C2572C]">Administration</p>
                        <h1 className="mt-2 text-3xl font-bold">Admin Settings</h1>
                        <p className="mt-2 text-[#7A6A5D]">View your administrator account information.</p>
                    </div>

                    <section className="rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="rounded-xl bg-[#FBF6EE] p-3 text-[#7A1F2B]">
                                <IoPersonOutline size={22} />
                            </div>
                            <h2 className="text-lg font-bold">Administrator Account</h2>
                        </div>

                        <div className="space-y-5">
                            <Info label="Name" value="Admin" />
                            <Info label="Email Address" value={adminEmail || "Configured on server"} />
                            <Info label="Account Role" value="Administrator" />
                        </div>
                    </section>

                    <section className="mt-6 rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl bg-[#FBF6EE] p-3 text-[#7A1F2B]">
                                <IoShieldCheckmarkOutline size={22} />
                            </div>
                            <h2 className="text-lg font-bold">Security</h2>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl border border-[#E8DCC8] p-4">
                            <IoLockClosedOutline size={22} className="mt-1 shrink-0 text-[#7A1F2B]" />
                            <div>
                                <p className="font-semibold">Administrator Access</p>
                                <p className="mt-1 text-sm text-[#7A6A5D]">
                                    Admin authentication is managed by the server. Password changes and account updates require dedicated backend endpoints.
                                </p>
                            </div>
                        </div>
                    </section>
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
            <p className="break-words font-medium">{value}</p>
        </div>
    );
}
