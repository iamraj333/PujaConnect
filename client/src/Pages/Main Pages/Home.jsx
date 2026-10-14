import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoSearchOutline, IoLocationOutline, IoArrowForwardOutline, IoCheckmarkCircleOutline, IoShieldCheckmarkOutline, IoCalendarOutline, IoSparklesOutline, IoPeopleOutline, } from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

const pujas = [
    { name: "Satyanarayan Katha", desc: "Seek blessings for prosperity, peace and family well-being.", symbol: "ॐ" },
    { name: "Griha Pravesh", desc: "Begin your new journey with traditional housewarming rituals.", symbol: "शुभ" },
    { name: "Havan & Homam", desc: "Arrange sacred fire ceremonies with a suitable Pandit.", symbol: "अग्नि" },
    { name: "Naamkaran", desc: "Celebrate your child's naming ceremony with traditional rituals.", symbol: "श्री" },
];

const benefits = [
    { icon: IoShieldCheckmarkOutline, title: "Trusted Profiles", desc: "Explore Pandit profiles, experience and supported rituals before making your choice." },
    { icon: IoCalendarOutline, title: "Simple Booking", desc: "Share your ceremony requirements and submit a booking request with ease." },
    { icon: IoPeopleOutline, title: "The Right Match", desc: "Compare available Pandits based on location, languages and ritual expertise." },
];

export default function Home() {

    const navigate = useNavigate();
    const [rituals, setRituals] = useState([]);
    const [ritualLoading, setRitualLoading] = useState(true);
    const [ritualError, setRitualError] = useState("");

    useEffect(() => {
        const fetchRituals = async () => {
            try {
                setRitualLoading(true);
                setRitualError("");
                const apiUrl = `${import.meta.env.VITE_SERVER_URL?.trim().replace(/\/+$/, "")}/ritual/all`;
                const response = await fetch(apiUrl, {
                    method: "GET",
                    credentials: "include"
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to load rituals.");
                }
                setRituals((data.rituals || []).filter(ritual => ritual.isActive));
            } catch (error) {
                setRitualError(error.message || "Unable to load rituals.");
            } finally {
                setRitualLoading(false);
            }
        };
        fetchRituals();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const puja = formData.get("puja")?.toString().trim() || "";
        const location = formData.get("location")?.toString().trim() || "";
        const params = new URLSearchParams();
        if (puja) params.set("puja", puja);
        if (location) params.set("location", location);
        navigate(`/pandits${params.toString() ? `?${params.toString()}` : ""}`);
    };


    return (
        <>
            <Navbar />
            <main className="overflow-hidden bg-[#FBF6EE] text-[#2B1B12]">

                {/*======================================== Hero ====================================================*/}
                <section className="relative">
                    <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
                        <div data-aos="fade-right">
                            <div className="mb-6 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-[#C2572C]">
                                <span className="h-px w-8 bg-[#C9A227]" />
                                YOUR TRADITIONS, OUR PRIORITY
                            </div>
                            <h1 className="max-w-2xl text-4xl font-bold leading-[1.15] tracking-tight text-[#7A1F2B] sm:text-5xl lg:text-6xl">
                                Find the Right Pandit for Your <span className="text-[#C2572C]">Sacred Moments.</span>
                            </h1>
                            <p className="mt-6 max-w-xl text-base leading-8 text-[#7A6A5D] sm:text-lg">
                                Discover puja services, explore Pandit profiles and plan your important ceremonies with greater confidence and convenience.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link to="/pandits" className="inline-flex items-center gap-2 rounded-lg bg-[#C2572C] px-6 py-3.5 font-semibold text-white transition hover:bg-[#A94725]">
                                    Find a Pandit <IoArrowForwardOutline />
                                </Link>
                                <Link to="/pujas" className="inline-flex items-center gap-2 rounded-lg border border-[#E8DCC8] bg-white px-6 py-3.5 font-semibold text-[#7A1F2B] transition hover:border-[#C9A227]">
                                    Explore Pujas
                                </Link>
                            </div>
                            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#7A6A5D]">
                                <span className="flex items-center gap-2"><IoCheckmarkCircleOutline className="text-lg text-[#4B7447]" /> Easy discovery</span>
                                <span className="flex items-center gap-2"><IoCheckmarkCircleOutline className="text-lg text-[#4B7447]" /> Convenient booking</span>
                            </div>
                        </div>

                        <div data-aos="fade-left" className="relative mx-auto w-full max-w-lg">
                            <div className="absolute inset-8 rounded-full bg-[#C9A227]/15 blur-3xl" />
                            <div className="relative overflow-hidden rounded-[2rem] border border-[#E8DCC8] bg-white p-5 shadow-[0_20px_60px_rgba(43,27,18,0.08)] sm:p-8">
                                <div className="flex items-center justify-between border-b border-[#E8DCC8] pb-5">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A6A5D]">A sacred beginning</p>
                                        <h2 className="mt-2 text-xl font-bold text-[#7A1F2B]">Celebrate Every Occasion</h2>
                                    </div>
                                </div>
                                <div className="flex min-h-[230px] flex-col items-center justify-center bg-[#FBF6EE]">
                                    <div className="flex h-32 w-32 items-center justify-center rounded-full border border-[#C9A227]/60 bg-white shadow-sm">
                                        <span className="text-7xl text-[#C2572C]">ॐ</span>
                                    </div>
                                    <p className="mt-5 text-center text-lg font-semibold text-[#7A1F2B]">Faith. Family. Tradition.</p>
                                    <p className="mt-1 text-sm text-[#7A6A5D]">For life's meaningful milestones</p>
                                </div>
                                <div className="grid grid-cols-3 divide-x divide-[#E8DCC8] pt-5 text-center">
                                    <div className="px-2"><IoSparklesOutline className="mx-auto text-xl text-[#C2572C]" /><p className="mt-2 text-xs font-medium text-[#7A6A5D]">Sacred rituals</p></div>
                                    <div className="px-2"><IoShieldCheckmarkOutline className="mx-auto text-xl text-[#C2572C]" /><p className="mt-2 text-xs font-medium text-[#7A6A5D]">Profile details</p></div>
                                    <div className="px-2"><IoCalendarOutline className="mx-auto text-xl text-[#C2572C]" /><p className="mt-2 text-xs font-medium text-[#7A6A5D]">Easy requests</p></div>
                                </div>
                            </div>
                            <div data-aos="zoom-in" className="absolute -right-2 top-20 hidden rounded-lg bg-[#7A1F2B] px-4 py-3 text-sm font-medium text-white shadow-lg sm:block">
                                Tradition, made simpler
                            </div>
                        </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-[#FBF6EE] via-[#C9A227] to-[#FBF6EE]" />
                </section>


                {/*====================================== Search ==============================================*/}
                <section data-aos="fade-up" className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
                    <form onSubmit={handleSearch} className="grid gap-3 rounded-2xl border border-[#E8DCC8] bg-white p-5 shadow-sm sm:p-6 md:grid-cols-[1fr_1fr_auto] md:items-center">
                        <div className="flex items-center gap-3 rounded-lg border border-[#E8DCC8] px-4 py-3">
                            <IoSearchOutline className="shrink-0 text-xl text-[#C2572C]" />
                            <div className="min-w-0 flex-1">
                                <label htmlFor="puja" className="block text-xs text-[#7A6A5D]">Puja Type</label>
                                <select id="puja" name="puja" defaultValue="" disabled={ritualLoading || rituals.length === 0} className="mt-1 w-full bg-transparent text-sm font-medium outline-none disabled:cursor-not-allowed disabled:opacity-60">
                                    <option value="">{ritualLoading ? "Loading rituals..." : rituals.length ? "All rituals" : "No rituals available"}</option>
                                    {rituals.map(ritual => (
                                        <option key={ritual._id} value={ritual.name}>{ritual.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-[#E8DCC8] px-4 py-3">
                            <IoLocationOutline className="shrink-0 text-xl text-[#C2572C]" />
                            <div className="min-w-0 flex-1">
                                <label htmlFor="location" className="block text-xs text-[#7A6A5D]">City</label>
                                <input id="location" name="location" type="text" placeholder="Enter your city" autoComplete="address-level2" className="mt-1 w-full bg-transparent text-sm font-medium outline-none placeholder:font-normal" />
                            </div>
                        </div>
                        <button type="submit" disabled={ritualLoading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7A1F2B] px-6 py-4 font-semibold text-white transition hover:bg-[#601722] disabled:cursor-not-allowed disabled:opacity-60">
                            Search Pandits <IoArrowForwardOutline />
                        </button>
                    </form>
                    {ritualError && <p role="alert" className="mt-3 text-sm text-red-600">{ritualError}</p>}
                </section>


                {/*===================================== Popular Pujas ===============================================*/}
                <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
                    <div className="mb-8 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C2572C]">Explore Our Services</p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#7A1F2B] sm:text-4xl">Pujas for Every Occasion</h2>
                            <p className="mt-3 max-w-xl leading-7 text-[#7A6A5D]">Find the right ritual for life's most meaningful moments.</p>
                        </div>
                        <Link to="/pujas" className="hidden items-center gap-2 text-sm font-semibold text-[#7A1F2B] hover:text-[#C2572C] sm:inline-flex">View All <IoArrowForwardOutline /></Link>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {pujas.map((puja, index) => (
                            <article data-aos="fade-up" data-aos-delay={index * 100} key={puja.name} className="group border border-[#E8DCC8] bg-white p-6 transition hover:border-[#C9A227] hover:shadow-md">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FBF6EE] text-2xl text-[#C2572C]">{puja.symbol}</div>
                                <h3 className="mt-5 text-lg font-bold text-[#2B1B12]">{puja.name}</h3>
                                <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#7A6A5D]">{puja.desc}</p>
                                <Link to="/pandits" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F2B] group-hover:text-[#C2572C]">Find a Pandit <IoArrowForwardOutline /></Link>
                            </article>
                        ))}
                    </div>
                    <Link to="/pujas" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F2B] sm:hidden">View All Pujas <IoArrowForwardOutline /></Link>
                </section>

                {/*============================= About Us ==================================================*/}
                <section className="border-y border-[#E8DCC8] bg-white">
                    <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
                        <div data-aos="fade-right" className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-[#7A1F2B] p-8 sm:min-h-[380px]">
                            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-[#C9A227]/30" />
                            <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full border border-[#C9A227]/30" />
                            <div className="relative text-center">
                                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-[#C9A227]/60 text-7xl text-[#E6BD61]">ॐ</div>
                                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.25em] text-[#E6BD61]">Our Purpose</p>
                                <h3 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Rooted in Tradition</h3>
                                <p className="mt-3 text-sm text-white/75">Faith that brings families together.</p>
                            </div>
                        </div>
                        <div data-aos="fade-left">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C2572C]">About PujaConnect</p>
                            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-[#7A1F2B] sm:text-4xl">Bringing Tradition Closer to Every Home</h2>
                            <p className="mt-5 text-base leading-8 text-[#7A6A5D]">
                                PujaConnect helps families discover suitable Pandits for their religious ceremonies. Our aim is to bring traditional practices and a convenient digital experience together, making it easier to plan meaningful occasions.
                            </p>
                            <p className="mt-4 text-base leading-8 text-[#7A6A5D]">
                                From Griha Pravesh and Satyanarayan Katha to Havan and family ceremonies, explore ritual services and compare available Pandit profiles in one place.
                            </p>
                            <div className="mt-6 border-l-2 border-[#C9A227] pl-4">
                                <p className="font-semibold leading-7 text-[#7A1F2B]">Preserving traditions. Simplifying celebrations.</p>
                            </div>
                            <Link to="/pandits" className="mt-7 inline-flex items-center gap-2 font-semibold text-[#C2572C] hover:text-[#7A1F2B]">Discover Our Pandits <IoArrowForwardOutline /></Link>
                        </div>
                    </div>
                </section>

                {/*============================= Why Choose Us ==========================================*/}
                <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
                    <div data-aos="fade-up" className="mx-auto max-w-2xl text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C2572C]">Why Choose Us</p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#7A1F2B] sm:text-4xl">A Better Way to Plan Your Puja</h2>
                        <p className="mt-4 leading-7 text-[#7A6A5D]">A simpler way to discover ritual services and make informed choices for your family's important occasions.</p>
                    </div>
                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {benefits.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <article data-aos="fade-up" data-aos-delay={index * 100} key={item.title} className="border border-[#E8DCC8] bg-white p-7 transition hover:border-[#C9A227]">
                                    <div className="flex h-12 w-12 items-center justify-center bg-[#FBF6EE] text-2xl text-[#C2572C]"><Icon /></div>
                                    <p className="mt-5 text-xs font-bold tracking-widest text-[#C9A227]">0{index + 1}</p>
                                    <h3 className="mt-2 text-lg font-bold text-[#2B1B12]">{item.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-[#7A6A5D]">{item.desc}</p>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section className="px-6 pb-16 lg:px-8 lg:pb-20">
                    <div data-aos="fade-up" className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 bg-[#7A1F2B] px-7 py-10 sm:px-12 sm:py-12 md:flex-row md:items-center">
                        <div className="max-w-2xl">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#E6BD61]">Your Sacred Occasion Starts Here</p>
                            <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">Make Every Sacred Moment Meaningful.</h2>
                            <p className="mt-3 leading-7 text-white/75">Find a suitable Pandit for your family's traditions and special occasions.</p>
                        </div>
                        <Link data-aos="zoom-in" to="/pandits" className="inline-flex shrink-0 items-center gap-2 bg-[#C2572C] px-6 py-3.5 font-semibold text-white transition hover:bg-[#A94725]">Find Your Pandit <IoArrowForwardOutline /></Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}