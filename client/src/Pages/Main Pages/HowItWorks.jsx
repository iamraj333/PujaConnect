import { Link } from "react-router-dom";
import { IoSearchOutline, IoCalendarOutline, IoPeopleOutline, IoCheckmarkCircleOutline, IoArrowForwardOutline } from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

const steps = [
    {
        number: "01",
        icon: IoSearchOutline,
        title: "Find Your Puja",
        description: "Explore different Hindu rituals and find the puja that matches your ceremony and requirements."
    },
    {
        number: "02",
        icon: IoCalendarOutline,
        title: "Book Your Ceremony",
        description: "Choose your preferred date, time, location and budget to submit your puja booking."
    },
    {
        number: "03",
        icon: IoPeopleOutline,
        title: "Connect with a Pandit",
        description: "Your booking is shared with eligible Pandits. Once a Pandit accepts, your booking gets confirmed."
    },
    {
        number: "04",
        icon: IoCheckmarkCircleOutline,
        title: "Complete Your Puja",
        description: "Get ready for your ceremony and manage your booking through your PujaConnect account."
    }
];

export default function HowItWorks() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#FBF6EE]">
                <section className="border-b border-[#E8DCC8] px-6 py-16 text-center md:py-20">
                    <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#C2572C]">Simple. Convenient. Trusted.</p>
                    <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-tight text-[#7A1F2B] md:text-5xl">
                        How PujaConnect Works
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#7A6A5D] md:text-lg">
                        Find the right puja, book a suitable Pandit and organize your ceremony in a few simple steps.
                    </p>
                </section>

                <section className="mx-auto max-w-7xl px-6 py-14 md:px-8 md:py-20">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map(({ number, icon: Icon, title, description }) => (
                            <article data-aos="fade-up" data-aos-delay={100*number} key={number} className="rounded-2xl border border-[#E8DCC8] bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#7A1F2B]/10 text-3xl text-[#7A1F2B]">
                                    <Icon />
                                </div>
                                <p className="mb-2 text-sm font-bold tracking-widest text-[#C2572C]">STEP {number}</p>
                                <h2 className="mb-3 text-xl font-bold text-[#2B1B12]">{title}</h2>
                                <p className="text-sm leading-6 text-[#7A6A5D]">{description}</p>
                            </article>
                        ))}
                    </div>

                    <div data-aos="fade-up" className="mt-12 rounded-2xl bg-[#7A1F2B] px-6 py-10 text-center md:px-12 md:py-14">
                        <h2 className="text-2xl font-bold text-white md:text-3xl">Ready to plan your puja?</h2>
                        <p className="mx-auto mt-3 max-w-xl leading-7 text-white/80">
                            Explore available rituals and start arranging your ceremony with PujaConnect.
                        </p>
                        <div className="mt-7 flex flex-wrap justify-center gap-4">
                            <Link data-aos="zoom-in" data-aos-delay={100} to="/pujas" className="inline-flex items-center gap-2 rounded-lg bg-[#C9A227] px-6 py-3 font-semibold text-[#2B1B12] transition hover:bg-[#D9B63C]">
                                Explore Pujas <IoArrowForwardOutline />
                            </Link>
                            <Link data-aos="zoom-in" data-aos-delay={200} to="/pandits" className="rounded-lg border border-white/50 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
                                Find Pandit
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}