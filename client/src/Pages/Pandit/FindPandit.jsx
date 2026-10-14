import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { IoSearchOutline, IoLocationOutline, IoFilterOutline, IoStar, IoShieldCheckmarkOutline, IoLanguageOutline, IoBriefcaseOutline, IoCloseOutline } from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

const API_URL = import.meta.env.VITE_SERVER_URL?.trim().replace(/\/+$/, "");

export default function FindPandit() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [pandits, setPandits] = useState([]);
    const [search, setSearch] = useState("");
    const [city, setCity] = useState(searchParams.get("location") || "");
    const [ritual, setRitual] = useState(searchParams.get("puja") || "");
    const [language, setLanguage] = useState("");
    const [minExperience, setMinExperience] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedPandit, setSelectedPandit] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewSummary, setReviewSummary] = useState({ totalReviews: 0, averageRating: 0 });
    const [reviewsLoading, setReviewsLoading] = useState(false);

    useEffect(() => {
        const fetchPandits = async () => {
            try {
                const response = await fetch(`${API_URL}/pandit/all`);
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to load Pandits.");
                }
                setPandits(data.pandits || []);
            } catch (error) {
                toast.error(error.message || "Failed to load Pandits.");
            } finally {
                setLoading(false);
            }
        };
        fetchPandits();
    }, []);

    useEffect(() => {
        setCity(searchParams.get("location") || "");
        setRitual(searchParams.get("puja") || "");
    }, [searchParams]);

    const fetchReviews = async pandit => {
        setSelectedPandit(pandit);
        setReviews([]);
        setReviewSummary({ totalReviews: pandit.reviews || 0, averageRating: pandit.rating || 0 });
        setReviewsLoading(true);
        try {
            const response = await fetch(`${API_URL}/feedback/pandit/${pandit._id}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to load reviews.");
            }
            setReviews(data.feedback || []);
            setReviewSummary({
                totalReviews: data.totalReviews || 0,
                averageRating: data.averageRating || 0
            });
        } catch (error) {
            toast.error(error.message || "Failed to load reviews.");
        } finally {
            setReviewsLoading(false);
        }
    };

    const clearFilters = () => {
        setSearch("");
        setCity("");
        setRitual("");
        setLanguage("");
        setMinExperience("");
        setSearchParams({});
    };

    const filteredPandits = pandits.filter(p => {
        const matchesName = (p.name || "").toLowerCase().includes(search.trim().toLowerCase());
        const matchesCity = (p.location?.city || "").toLowerCase().includes(city.trim().toLowerCase());
        const matchesRitual = !ritual || (p.rituals || []).some(r => {
            const name = typeof r === "string" ? r : r?.name;
            return name?.toLowerCase() === ritual.trim().toLowerCase();
        });
        const matchesLanguage = !language || (p.languages || []).some(l => l.toLowerCase() === language.toLowerCase());
        const matchesExperience = !minExperience || Number(p.experience || 0) >= Number(minExperience);
        return matchesName && matchesCity && matchesRitual && matchesLanguage && matchesExperience;
    });

    const ritualOptions = [...new Set(pandits.flatMap(p => (p.rituals || []).map(r => typeof r === "string" ? r : r?.name).filter(Boolean)))].sort();
    const languageOptions = [...new Set(pandits.flatMap(p => p.languages || []).filter(Boolean))].sort();

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#FBF6EE] text-[#2B1B12]">
                <section className="border-b border-[#E8DCC8] bg-white">
                    <div data-aos="fade-right" className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C2572C]">Find Your Pandit</p>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#7A1F2B] sm:text-4xl">The Right Pandit for Your Sacred Occasion</h1>
                        <p className="mt-4 max-w-2xl leading-7 text-[#7A6A5D]">Explore verified Pandits by location, ritual expertise, experience and language, and read feedback from customers.</p>
                        <div className="mt-8 flex max-w-3xl items-center gap-3 border border-[#E8DCC8] bg-[#FBF6EE] px-4 py-3">
                            <IoSearchOutline className="shrink-0 text-xl text-[#C2572C]" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Pandit name..." aria-label="Search by Pandit name" className="w-full bg-transparent text-sm outline-none placeholder:text-[#9A8B7F]" />
                        </div>
                    </div>
                </section>

                <section className="mx-auto grid max-w-7xl items-start gap-8 px-6 py-10 lg:grid-cols-[260px_1fr] lg:px-8">
                    <aside data-aos="fade-right" className="border border-[#E8DCC8] bg-white p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-2 font-bold text-[#7A1F2B]"><IoFilterOutline /> Filters</h2>
                            <button type="button" onClick={clearFilters} className="text-xs font-semibold text-[#C2572C] hover:text-[#7A1F2B]">Clear all</button>
                        </div>
                        <div className="mt-6">
                            <label htmlFor="city" className="text-sm font-semibold">City</label>
                            <div className="mt-2 flex items-center gap-2 border border-[#E8DCC8] px-3 py-2.5">
                                <IoLocationOutline className="text-[#C2572C]" />
                                <input id="city" value={city} onChange={e => setCity(e.target.value)} placeholder="Enter city" className="w-full min-w-0 text-sm outline-none" />
                            </div>
                        </div>
                        <div className="mt-5">
                            <label htmlFor="ritual" className="text-sm font-semibold">Puja / Ritual</label>
                            <select id="ritual" value={ritual} onChange={e => setRitual(e.target.value)} className="mt-2 w-full border border-[#E8DCC8] bg-white px-3 py-3 text-sm outline-none focus:border-[#C2572C]">
                                <option value="">All rituals</option>
                                {ritualOptions.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>
                        <div className="mt-5">
                            <label htmlFor="language" className="text-sm font-semibold">Language</label>
                            <select id="language" value={language} onChange={e => setLanguage(e.target.value)} className="mt-2 w-full border border-[#E8DCC8] bg-white px-3 py-3 text-sm outline-none focus:border-[#C2572C]">
                                <option value="">All languages</option>
                                {languageOptions.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>
                        <div className="mt-5">
                            <label htmlFor="experience" className="text-sm font-semibold">Experience</label>
                            <select id="experience" value={minExperience} onChange={e => setMinExperience(e.target.value)} className="mt-2 w-full border border-[#E8DCC8] bg-white px-3 py-3 text-sm outline-none focus:border-[#C2572C]">
                                <option value="">Any experience</option>
                                <option value="5">5+ years</option>
                                <option value="10">10+ years</option>
                                <option value="15">15+ years</option>
                            </select>
                        </div>
                    </aside>

                    <div>
                        <div className="mb-5">
                            <h2 className="text-xl font-bold text-[#7A1F2B]">Available Pandits</h2>
                            <p className="mt-1 text-sm text-[#7A6A5D]">{loading ? "Loading Pandits..." : `${filteredPandits.length} profiles found`}</p>
                        </div>

                        {loading ? (
                            <p className="border border-[#E8DCC8] bg-white py-16 text-center text-[#7A6A5D]">Loading Pandits...</p>
                        ) : filteredPandits.length === 0 ? (
                            <div className="border border-[#E8DCC8] bg-white px-6 py-16 text-center">
                                <IoSearchOutline className="mx-auto text-3xl text-[#C9A227]" />
                                <h3 className="mt-4 font-bold text-[#7A1F2B]">No Pandits found</h3>
                                <p className="mt-2 text-sm text-[#7A6A5D]">Try changing your filters to see more results.</p>
                                <button type="button" onClick={clearFilters} className="mt-4 text-sm font-semibold text-[#C2572C]">Clear filters</button>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {filteredPandits.map((p, index) => (
                                    <article data-aos="fade-up" data-aos-delay={index * 100} key={p._id} className="border border-[#E8DCC8] bg-white p-5 transition hover:border-[#C9A227] sm:p-6">
                                        <div className="flex flex-col gap-5 sm:flex-row">
                                            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden bg-[#F3E7D5] text-3xl font-bold text-[#7A1F2B]">
                                                {p.profileImage ? <img src={p.profileImage} alt={p.name} className="h-full w-full object-cover" /> : (p.name || "P").split(" ").slice(-1)[0][0]}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-[#7A1F2B]">{p.name}</h3>
                                                        <p className="mt-1 flex items-center gap-1.5 text-sm text-[#7A6A5D]"><IoLocationOutline className="text-[#C2572C]" />{p.location?.city || "Location not specified"}{p.location?.state ? `, ${p.location.state}` : ""}</p>
                                                    </div>
                                                    <button type="button" onClick={() => fetchReviews(p)} className="inline-flex items-center gap-1 rounded-md bg-[#F8F0D9] px-2.5 py-1.5 text-sm font-semibold text-[#8A6814] hover:bg-[#F3E7C1]">
                                                        <IoStar /> {Number(p.rating || 0).toFixed(1)} <span className="font-normal">({p.reviews || 0})</span>
                                                    </button>
                                                </div>
                                                <p className="mt-3 text-sm leading-6 text-[#7A6A5D]">{p.bio || "No profile description added yet."}</p>
                                                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#7A6A5D]">
                                                    <span className="flex items-center gap-1.5"><IoBriefcaseOutline className="text-[#C2572C]" />{p.experience ?? 0} years experience</span>
                                                    <span className="flex items-center gap-1.5"><IoLanguageOutline className="text-[#C2572C]" />{(p.languages || []).join(", ") || "Languages not specified"}</span>
                                                </div>
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {(p.rituals || []).map((r, i) => {
                                                        const name = typeof r === "string" ? r : r?.name;
                                                        if (!name) return null;
                                                        return <span key={typeof r === "string" ? r : r._id || i} className="border border-[#E8DCC8] bg-[#FBF6EE] px-2.5 py-1 text-xs text-[#7A1F2B]">{name}</span>;
                                                    })}
                                                </div>
                                                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#F0E7DB] pt-4">
                                                    <span className="flex items-center gap-1.5 text-xs text-[#7A6A5D]"><IoShieldCheckmarkOutline className="text-[#4B7447]" /> Verified Pandit</span>
                                                    <button type="button" onClick={() => fetchReviews(p)} className="bg-[#C2572C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#A94725]">View Reviews</button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {selectedPandit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedPandit(null)}>
                    <section role="dialog" aria-modal="true" aria-label={`${selectedPandit.name} customer reviews`} onClick={e => e.stopPropagation()} className="max-h-[85vh] w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-xl sm:p-7">
                        <div className="flex items-start justify-between gap-4 border-b border-[#E8DCC8] pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-[#7A1F2B]">{selectedPandit.name}</h2>
                                <p className="mt-1 text-sm text-[#7A6A5D]">Customer Reviews</p>
                                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#8A6814]"><IoStar /> {Number(reviewSummary.averageRating).toFixed(1)} average · {reviewSummary.totalReviews} reviews</p>
                            </div>
                            <button type="button" onClick={() => setSelectedPandit(null)} aria-label="Close reviews" className="p-2 text-[#7A6A5D] hover:text-[#7A1F2B]"><IoCloseOutline size={24} /></button>
                        </div>
                        {reviewsLoading ? (
                            <p className="py-12 text-center text-[#7A6A5D]">Loading reviews...</p>
                        ) : reviews.length === 0 ? (
                            <p className="py-12 text-center text-[#7A6A5D]">No customer reviews yet.</p>
                        ) : (
                            <div className="divide-y divide-[#F0E7DB]">
                                {reviews.map((review, index) => (
                                    <article key={review._id || index} className="py-5">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <h3 className="font-semibold text-[#2B1B12]">{review.user?.name || "Customer"}</h3>
                                            <span className="text-xs text-[#7A6A5D]">{review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN") : ""}</span>
                                        </div>
                                        <p className="mt-1 flex items-center gap-1 text-sm text-[#8A6814]">
                                            {Array.from({ length: 5 }, (_, i) => <IoStar key={i} className={i < (review.rating || 0) ? "text-[#C9A227]" : "text-[#D8D0C4]"} />)}
                                            <span className="ml-1 text-[#7A6A5D]">{review.rating || 0}/5</span>
                                        </p>
                                        {review.comment && <p className="mt-3 text-sm leading-6 text-[#7A6A5D]">{review.comment}</p>}
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}
            <Footer />
        </>
    );
}