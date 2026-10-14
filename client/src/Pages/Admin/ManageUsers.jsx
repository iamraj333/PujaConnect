import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoArrowBackOutline, IoRefreshOutline, IoSearchOutline, IoPersonOutline } from "react-icons/io5";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

const API_URL = import.meta.env.VITE_SERVER_URL;

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await fetch(`${API_URL}/admin/users`, {
                credentials: "include"
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to load users.");
            setUsers(data.users || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.phone?.includes(search)
    );

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#FBF6EE] px-4 py-8 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    <Link to="/admin/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-[#7A6A5D] hover:text-[#7A1F2B]">
                        <IoArrowBackOutline /> Back to Dashboard
                    </Link>

                    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-[#2B1B12]">Manage Users</h1>
                            <p className="mt-2 text-[#7A6A5D]">View registered customers on PujaConnect.</p>
                        </div>
                        <button onClick={fetchUsers} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E8DCC8] bg-white px-4 py-2.5 font-medium text-[#7A1F2B]">
                            <IoRefreshOutline /> Refresh
                        </button>
                    </div>

                    <div className="mb-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-[#E8DCC8] bg-white p-5">
                            <p className="text-sm text-[#7A6A5D]">Total Registered Users</p>
                            <p className="mt-2 text-3xl font-bold text-[#7A1F2B]">{users.length}</p>
                        </div>
                        <div className="rounded-xl border border-[#E8DCC8] bg-white p-5">
                            <p className="text-sm text-[#7A6A5D]">Search Results</p>
                            <p className="mt-2 text-3xl font-bold text-[#7A1F2B]">{filteredUsers.length}</p>
                        </div>
                    </div>

                    <div className="mb-5 flex items-center gap-2 rounded-lg border border-[#E8DCC8] bg-white px-3">
                        <IoSearchOutline className="text-[#7A6A5D]" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, email or phone..."
                            className="w-full bg-transparent py-3 outline-none"
                        />
                    </div>

                    {error && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                            {error}
                            <button onClick={fetchUsers} className="ml-3 font-semibold underline">Retry</button>
                        </div>
                    )}

                    {loading ? (
                        <div className="rounded-xl bg-white p-12 text-center text-[#7A6A5D]">Loading users...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="rounded-xl border border-[#E8DCC8] bg-white p-12 text-center">
                            <IoPersonOutline className="mx-auto mb-3 text-4xl text-[#C9A227]" />
                            <h2 className="text-lg font-semibold text-[#2B1B12]">No users found</h2>
                            <p className="mt-1 text-sm text-[#7A6A5D]">Try another search term.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-[#E8DCC8] bg-white">
                            <table className="w-full min-w-[700px] text-left text-sm">
                                <thead className="bg-[#F7EFE3] text-[#2B1B12]">
                                    <tr>
                                        <th className="px-5 py-4">Customer</th>
                                        <th className="px-5 py-4">Email</th>
                                        <th className="px-5 py-4">Phone</th>
                                        <th className="px-5 py-4">Registered On</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E8DCC8]">
                                    {filteredUsers.map(user => (
                                        <tr key={user._id} className="hover:bg-[#FBF6EE]">
                                            <td className="px-5 py-4 font-medium text-[#2B1B12]">{user.name || "—"}</td>
                                            <td className="px-5 py-4">{user.email || "—"}</td>
                                            <td className="px-5 py-4">{user.phone || "—"}</td>
                                            <td className="px-5 py-4">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}