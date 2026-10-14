import { Link } from "react-router-dom";
import { IoLocationOutline, IoMailOutline, IoCallOutline, IoLogoFacebook, IoLogoInstagram, IoLogoLinkedin, IoArrowForwardOutline } from "react-icons/io5";

export default function Footer() {
    const linkClass = "text-sm text-[#7A6A5D] transition-colors hover:text-[#C2572C]";
    const socialClass = "flex h-9 w-9 items-center justify-center rounded-lg border border-[#E8DCC8] text-[#7A1F2B] transition-colors hover:border-[#C2572C] hover:bg-[#C2572C] hover:text-white";

    return (
        <footer className="border-t border-[#E8DCC8] bg-[#FBF6EE] text-[#2B1B12]">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:px-8">
                <div data-aos="fade-up" data-aos-delay={100}>
                    <Link to="/" className="inline-flex text-2xl font-bold tracking-tight text-[#7A1F2B]">
                        Puja<span className="text-[#C2572C]">Connect</span>
                    </Link>
                    <p className="mt-4 max-w-xs text-sm leading-7 text-[#7A6A5D]">Discover Pandits, explore traditional rituals and plan your sacred occasions with confidence and convenience.</p>
                    <div className="mt-5 flex gap-3">
                        <a href="#" aria-label="Facebook" className={socialClass}><IoLogoFacebook size={18} /></a>
                        <a href="#" aria-label="Instagram" className={socialClass}><IoLogoInstagram size={18} /></a>
                        <a href="#" aria-label="LinkedIn" className={socialClass}><IoLogoLinkedin size={18} /></a>
                    </div>
                </div>

                <div data-aos="fade-up" data-aos-delay={200}>
                    <h3 className="mb-5 text-sm font-bold text-[#2B1B12]">Quick Links</h3>
                    <ul className="space-y-3">
                        <li><Link to="/" className={linkClass}>Home</Link></li>
                        <li><Link to="/pandits" className={linkClass}>Find a Pandit</Link></li>
                        <li><Link to="/pujas" className={linkClass}>Explore Pujas</Link></li>
                        <li><Link to="/how-it-works" className={linkClass}>How It works</Link></li>
                    </ul>
                </div>

                <div data-aos="fade-up" data-aos-delay={300}>
                    <h3 className="mb-5 text-sm font-bold text-[#2B1B12]">Popular Pujas</h3>
                    <ul className="space-y-3">
                        <li><Link to="/pujas" className={linkClass}>Satyanarayan Katha</Link></li>
                        <li><Link to="/pujas" className={linkClass}>Griha Pravesh</Link></li>
                        <li><Link to="/pujas" className={linkClass}>Havan & Homam</Link></li>
                        <li><Link to="/pujas" className={linkClass}>Naamkaran</Link></li>
                    </ul>
                </div>

                <div data-aos="fade-up" data-aos-delay={400}>
                    <h3 className="mb-5 text-sm font-bold text-[#2B1B12]">Get in Touch</h3>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3 text-sm leading-6 text-[#7A6A5D]"><IoLocationOutline size={18} className="mt-0.5 shrink-0 text-[#C2572C]" /><span>Connecting families with Pandits for sacred occasions.</span></li>
                        <li className="flex items-start gap-3 text-sm"><IoMailOutline size={18} className="mt-0.5 shrink-0 text-[#C2572C]" /><a href="mailto:support@pujaconnect.com" className={linkClass}>support@pujaconnect.com</a></li>
                        <li className="flex items-start gap-3 text-sm leading-6 text-[#7A6A5D]"><IoCallOutline size={18} className="mt-0.5 shrink-0 text-[#C2572C]" /><span>Need assistance? Contact our support team.</span></li>
                    </ul>
                    <Link to="/getStarted" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#C2572C] transition hover:text-[#7A1F2B]">Get Started <IoArrowForwardOutline /></Link>
                </div>
            </div>

            <div className="border-t border-[#E8DCC8]">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-center sm:flex-row sm:text-left lg:px-8">
                    <p className="text-xs text-[#7A6A5D]">© {new Date().getFullYear()} PujaConnect. All rights reserved.</p>
                    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
                        <Link to="/privacy-policy" className="text-xs text-[#7A6A5D] transition hover:text-[#C2572C]">Privacy Policy</Link>
                        <Link to="/terms" className="text-xs text-[#7A6A5D] transition hover:text-[#C2572C]">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}