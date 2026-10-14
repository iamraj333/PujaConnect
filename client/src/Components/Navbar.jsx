import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoMenuOutline, IoCloseOutline, IoPersonCircleOutline, IoChevronDownOutline, IoGridOutline, IoSettingsOutline, IoLogOutOutline } from "react-icons/io5";
import { MyContextData } from "../ContextData/MyContextData";
import { toast } from "react-toastify";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { currentUser, logout, loading } = useContext(MyContextData);
    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const closeMenu = () => {
        setMenuOpen(false);
        setDropdownOpen(false);
    };

    const navClass = (path) => `text-sm font-medium transition-colors ${location.pathname === path ? "text-[#C2572C]" : "text-[#7A6A5D] hover:text-[#C2572C]"}`;

    const dashboardPath = {
        user: "/user/dashboard",
        pandit: "/pandit/dashboard",
        admin: "/admin/dashboard"
    };

    const settingsPath = {
        user: "/user/settings",
        pandit: "/pandit/settings",
        admin: "/admin/settings"
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        closeMenu();
    }, [location.pathname]);

    const handleLogout = async () => {
        const result = await logout();
        closeMenu();
        if (result.success) {
            toast.success(result.success);
            navigate("/login");
        } else {
            toast.error(result.error || "Logout failed");
        }
    };

    const ProfileDropdown = () => (
        <div className="relative" ref={dropdownRef}>
            <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)} aria-expanded={dropdownOpen} className="flex items-center gap-2 rounded-lg border border-[#E8DCC8] px-3 py-2 text-sm font-semibold text-[#7A1F2B] transition hover:bg-[#E8DCC8]/40">
                <IoPersonCircleOutline className="text-xl" />
                <span className="capitalize">{currentUser.role}</span>
                <IoChevronDownOutline className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[#E8DCC8] bg-white py-2 shadow-lg">
                    <Link to={dashboardPath[currentUser.role] || "/"} onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 text-sm text-[#2B1B12] transition hover:bg-[#FBF6EE]">
                        <IoGridOutline className="text-lg text-[#7A1F2B]" /> Dashboard
                    </Link>
                    <Link to={settingsPath[currentUser.role] || "/"} onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 text-sm text-[#2B1B12] transition hover:bg-[#FBF6EE]">
                        <IoSettingsOutline className="text-lg text-[#7A1F2B]" /> Settings
                    </Link>
                    <div className="my-1 border-t border-[#E8DCC8]" />
                    <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50">
                        <IoLogOutOutline className="text-lg" /> Logout
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <nav className="sticky top-0 z-50 border-b border-[#E8DCC8] bg-[#FBF6EE]">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                <Link to="/" onClick={closeMenu} className="text-2xl font-bold tracking-tight text-[#7A1F2B]">
                    Puja<span className="text-[#C2572C]">Connect</span>
                </Link>
                <div className="hidden items-center gap-8 md:flex">
                    <Link to="/" className={navClass("/")}>Home</Link>
                    <Link to="/pandits" className={navClass("/pandits")}>Find Pandit</Link>
                    <Link to="/pujas" className={navClass("/pujas")}>Pujas</Link>
                    <Link to="/how-it-works" className={navClass("/how-it-works")}>How It Works</Link>
                    {!loading && (currentUser.user ? <ProfileDropdown /> : (
                        <>
                            <Link to="/login" className={navClass("/login")}>Login</Link>
                            <Link to="/getStarted" className="rounded-lg bg-[#C2572C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#A94725]">Get Started</Link>
                        </>
                    ))}
                </div>
                <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl text-[#7A1F2B] transition hover:bg-[#E8DCC8]/50 md:hidden">
                    {menuOpen ? <IoCloseOutline /> : <IoMenuOutline />}
                </button>
            </div>
            {menuOpen && (
                <div className="border-t border-[#E8DCC8] bg-[#FBF6EE] px-6 py-4 md:hidden">
                    <div className="mx-auto flex max-w-7xl flex-col gap-1">
                        <Link to="/" onClick={closeMenu} className={`${navClass("/")} rounded-md px-3 py-3`}>Home</Link>
                        <Link to="/pandits" onClick={closeMenu} className={`${navClass("/pandits")} rounded-md px-3 py-3`}>Find Pandit</Link>
                        <Link to="/pujas" onClick={closeMenu} className={`${navClass("/pujas")} rounded-md px-3 py-3`}>Pujas</Link>
                        <Link to="/how-it-works" onClick={closeMenu} className={`${navClass("/how-it-works")} rounded-md px-3 py-3`}>How It Works</Link>
                        {!loading && (currentUser.user ? (
                            <>
                                <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wider text-[#7A6A5D]">My Account</p>
                                <Link to={dashboardPath[currentUser.role] || "/"} onClick={closeMenu} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-[#2B1B12] hover:bg-[#E8DCC8]/40">
                                    <IoGridOutline className="text-lg text-[#7A1F2B]" /> Dashboard
                                </Link>
                                <Link to={settingsPath[currentUser.role] || "/"} onClick={closeMenu} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-[#2B1B12] hover:bg-[#E8DCC8]/40">
                                    <IoSettingsOutline className="text-lg text-[#7A1F2B]" /> Settings
                                </Link>
                                <button type="button" onClick={handleLogout} className="flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                                    <IoLogOutOutline className="text-lg" /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={closeMenu} className={`${navClass("/login")} rounded-md px-3 py-3`}>Login</Link>
                                <Link to="/getStarted" onClick={closeMenu} className="mt-2 rounded-lg bg-[#C2572C] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#A94725]">Get Started</Link>
                            </>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}