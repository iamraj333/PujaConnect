import { Link } from "react-router-dom";
import { IoPersonOutline, IoFlowerOutline, IoArrowForwardOutline, IoShieldCheckmarkOutline } from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

export default function GetStarted() {
    return (
        <>
            <Navbar />
            <main className="flex min-h-[65vh] items-center bg-[#FBF6EE] px-6 py-10 text-[#2B1B12]">
                <div className="mx-auto w-full max-w-4xl">
                    <div data-aos="fade-up" className="mx-auto max-w-2xl text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C2572C]">Welcome to PujaConnect</p>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#7A1F2B] sm:text-4xl">How would you like to join us?</h1>
                        <p className="mt-3 text-sm leading-6 text-[#7A6A5D]">Choose how you want to use PujaConnect and get started in just a few steps.</p>
                    </div>
                    <div className="mt-8 grid gap-5 md:grid-cols-2">
                        <article data-aos="fade-up" data-aos-delay={100} className="group flex flex-col border border-[#E8DCC8] bg-white p-5 transition hover:border-[#C9A227] hover:shadow-lg sm:p-6">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EAE2] text-2xl text-[#C2572C]"><IoPersonOutline /></div>
                            <h2 className="mt-4 text-xl font-bold text-[#7A1F2B]">I'm a Customer</h2>
                            <p className="mt-2 flex-1 text-sm leading-6 text-[#7A6A5D]">Looking for a Pandit for your puja or religious ceremony? Explore rituals, compare Pandit profiles and book a suitable service for your occasion.</p>
                            <ul className="mt-4 space-y-2 text-sm text-[#7A6A5D]">
                                <li className="flex items-center gap-2"><IoShieldCheckmarkOutline className="shrink-0 text-[#4B7447]" /> Explore Pandit profiles</li>
                                <li className="flex items-center gap-2"><IoShieldCheckmarkOutline className="shrink-0 text-[#4B7447]" /> Request puja bookings</li>
                                <li className="flex items-center gap-2"><IoShieldCheckmarkOutline className="shrink-0 text-[#4B7447]" /> Manage your bookings</li>
                            </ul>
                            <Link to="/register" className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-[#C2572C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#A94725]">Register as Customer <IoArrowForwardOutline /></Link>
                            <p className="mt-3 text-center text-sm text-[#7A6A5D]">Already registered? <Link to="/login" className="font-semibold text-[#C2572C] hover:text-[#7A1F2B]">Login</Link></p>
                        </article>
                        <article data-aos="fade-up" data-aos-delay={200} className="group flex flex-col border border-[#E8DCC8] bg-white p-5 transition hover:border-[#C9A227] hover:shadow-lg sm:p-6">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EAE2] text-2xl text-[#C2572C]"><IoFlowerOutline /></div>
                            <h2 className="mt-4 text-xl font-bold text-[#7A1F2B]">I'm a Pandit</h2>
                            <p className="mt-2 flex-1 text-sm leading-6 text-[#7A6A5D]">Are you a Hindu Pandit who performs traditional rituals? Create your profile, share your expertise and receive booking requests from families.</p>
                            <ul className="mt-4 space-y-2 text-sm text-[#7A6A5D]">
                                <li className="flex items-center gap-2"><IoShieldCheckmarkOutline className="shrink-0 text-[#4B7447]" /> Create your Pandit profile</li>
                                <li className="flex items-center gap-2"><IoShieldCheckmarkOutline className="shrink-0 text-[#4B7447]" /> List your ritual expertise</li>
                                <li className="flex items-center gap-2"><IoShieldCheckmarkOutline className="shrink-0 text-[#4B7447]" /> Manage booking requests</li>
                            </ul>
                            <Link to="/pandit/register" className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-[#7A1F2B] px-4 py-3 text-sm font-semibold text-[#7A1F2B] transition hover:bg-[#7A1F2B] hover:text-white">Register as Pandit <IoArrowForwardOutline /></Link>
                            <p className="mt-3 text-center text-sm text-[#7A6A5D]">Already registered? <Link to="/login" className="font-semibold text-[#C2572C] hover:text-[#7A1F2B]">Login</Link></p>
                        </article>
                    </div>
                    <p className="mt-5 text-center text-xs leading-5 text-[#7A6A5D]">Pandit accounts are subject to verification and approval before their profiles become available to customers.</p>
                </div>
            </main>
            <Footer />
        </>
    );
}