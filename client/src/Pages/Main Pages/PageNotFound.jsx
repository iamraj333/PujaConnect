
import { Link } from "react-router-dom";
import { IoHomeOutline, IoArrowBackOutline } from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

export default function PageNotFound() {
    return (
        <>
            <Navbar />
            <main className="flex min-h-screen items-center justify-center bg-[#FBF6EE] px-4 py-10 text-[#2B1B12]">
                <div className="w-full max-w-lg text-center">
                    <p className="text-8xl font-extrabold tracking-tight text-[#7A1F2B]">404</p>
                    <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-[#C9A227]" />
                    <h1 className="mt-6 text-3xl font-bold">Page Not Found</h1>
                    <p className="mt-3 leading-7 text-[#7A6A5D]">
                        Sorry, the page you're looking for doesn't exist or may have been moved.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 rounded-xl border border-[#E8DCC8] bg-white px-5 py-3 font-semibold transition hover:bg-[#F3EBDD]">
                            <IoArrowBackOutline size={18} /> Go Back
                        </button>
                        <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-[#7A1F2B] px-5 py-3 font-semibold text-white transition hover:bg-[#5E1721]">
                            <IoHomeOutline size={18} /> Home
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
