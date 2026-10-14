import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoSearchOutline, IoTimeOutline, IoLocationOutline } from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

const API_URL = import.meta.env.VITE_SERVER_URL;

export default function ExplorePujas() {
    const [rituals, setRituals] = useState([]);
    const [search, setSearch] = useState("");
    const [locationType, setLocationType] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRituals = async () => {
            try {
                const response = await fetch(`${API_URL}/ritual/all`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Failed to load pujas.");
                setRituals((data.rituals || []).filter(ritual => ritual.isActive));
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRituals();
    }, []);

    const filteredRituals = rituals.filter(ritual => {
        const matchesSearch =
            ritual.name?.toLowerCase().includes(search.toLowerCase()) ||
            ritual.description?.toLowerCase().includes(search.toLowerCase());
        const matchesLocation =
            locationType === "all" || ritual.locationType?.includes(locationType);
        return matchesSearch && matchesLocation;
    });

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#FBF6EE] px-4 py-10 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 text-center">
                        <p className="mb-2 font-semibold uppercase tracking-[0.2em] text-[#C2572C]">PujaConnect</p>
                        <h1 className="text-3xl font-bold text-[#2B1B12] sm:text-4xl">Explore Pujas</h1>
                        <p className="mx-auto mt-3 max-w-2xl text-[#7A6A5D]">
                            Find the right puja for your special occasion and book a verified Pandit.
                        </p>
                    </div>

                    <div data-aos="fade-up" className="mx-auto mb-8 flex max-w-3xl flex-col gap-3 sm:flex-row">
                        <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#E8DCC8] bg-white px-4">
                            <IoSearchOutline className="text-[#7A6A5D]" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search puja by name..."
                                className="w-full bg-transparent py-3 outline-none"
                            />
                        </div>
                        <select
                            value={locationType}
                            onChange={e => setLocationType(e.target.value)}
                            className="rounded-xl border border-[#E8DCC8] bg-white px-4 py-3 text-[#2B1B12] outline-none"
                        >
                            <option value="all">All Locations</option>
                            <option value="home">At Home</option>
                            <option value="temple">At Temple</option>
                        </select>
                    </div>

                    {error && <p className="rounded-xl bg-red-50 p-4 text-center text-red-700">{error}</p>}

                    {loading ? (
                        <p className="py-16 text-center text-[#7A6A5D]">Loading pujas...</p>
                    ) : filteredRituals.length === 0 ? (
                        <div data-aos="fade-up" className="rounded-xl border border-[#E8DCC8] bg-white px-5 py-16 text-center">
                            <h2 className="text-xl font-semibold text-[#2B1B12]">No pujas found</h2>
                            <p className="mt-2 text-[#7A6A5D]">Try another search or location filter.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredRituals.map((ritual, index) => (
                                <article data-aos="fade-up" data-aos-delay={100 * index} key={ritual._id} className="flex flex-col rounded-2xl border border-[#E8DCC8] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <h2 className="text-xl font-bold text-[#7A1F2B]">{ritual.name}</h2>
                                        <span className="shrink-0 rounded-full bg-[#F7EFE3] px-3 py-1 text-xs font-medium text-[#7A1F2B]">
                                            {ritual.duration} min
                                        </span>
                                    </div>
                                    <p className="mb-5 flex-1 text-sm leading-6 text-[#7A6A5D]">
                                        {ritual.description}
                                    </p>
                                    <div className="mb-3 flex items-center gap-2 text-sm text-[#7A6A5D]">
                                        <IoTimeOutline className="text-[#C2572C]" />
                                        Duration: {ritual.duration} minutes
                                    </div>
                                    <div className="mb-4 flex items-center gap-2 text-sm text-[#7A6A5D]">
                                        <IoLocationOutline className="text-[#C2572C]" />
                                        {ritual.locationType?.map(type => type === "home" ? "Home" : "Temple").join(" / ") || "Location not specified"}
                                    </div>
                                    <div className="mb-5 rounded-lg bg-[#FBF6EE] p-3">
                                        <p className="text-xs text-[#7A6A5D]">Estimated price range</p>
                                        <p className="mt-1 text-lg font-bold text-[#2B1B12]">
                                            ₹{ritual.priceRange?.min?.toLocaleString("en-IN")} – ₹{ritual.priceRange?.max?.toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                    <Link
                                        to={`/book-puja/${ritual._id}`}
                                        className="rounded-lg bg-[#7A1F2B] px-4 py-3 text-center font-semibold text-white transition hover:bg-[#5F1721]"
                                    >
                                        Book This Puja
                                    </Link>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}