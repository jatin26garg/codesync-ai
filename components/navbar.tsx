"use client"

import { useRef, useState } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface User {
    id: string;
    name: string;
    email: string;
    createdAt?: string;
}
interface NavbarData {
    success: boolean;
    user: User;
}
interface Users {
    id: string,
    name: string,
    email: string,
}


export default function Navbar() {
    const router = useRouter();
    const [user, setuser] = useState<User | null>(null)
    const [isDropdown, setisDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [loading, setloading] = useState(true)
    const [error, seterror] = useState('')
    useEffect(() => {
        async function checkAuth() {
            try {
                setloading(true);
                seterror("");
                const res = await fetch("/api/profile", {
                    method: "GET",
                    credentials: "include",
                })
                if (!res.ok) {
                    if (res.status === 401) {
                        router.push("/login");
                        return;
                    }
                    throw new Error("failed to find user");
                }
                const data: NavbarData = await res.json();
                if (data.success && data.user) {
                    setuser(data.user)
                    console.log("$$$$$", data);
                }
                else throw new Error("data not found")
            }
            catch (error) {
                console.error("Auth check error:", error);
                seterror("Failed to load user data");
            }
            finally {
                setloading(false);
            }
        }
        checkAuth(); 
    }, [router])

    const handleLogout = async () => {

        const res = await fetch("/api/logout",
            {
                method: "POST",
                credentials: "include"
            }
        )
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to logout");

        }
        router.push("/login");
        router.refresh();
    }

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
                                <span className="text-white text-xl font-bold">💻</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                CodeSync AI
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        {user ? (
                            <>

                                <Link
                                    href="/dashboard"
                                    className="text-gray-700 hover:text-blue-500 transition font-medium"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/projects"
                                    className="text-gray-700 hover:text-blue-500 transition font-medium"
                                >
                                    Projects
                                </Link>
                                <Link
                                    href="/settings"
                                    className="text-gray-700 hover:text-blue-500 transition font-medium"
                                >
                                    Settings
                                </Link>


                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setisDropdown(!isDropdown)}
                                        className="flex items-center gap-2 hover:bg-gray-50 rounded-full pl-2 pr-3 py-1.5 transition"
                                    >

                                        <span className="text-sm font-medium text-gray-700 hidden lg:block">
                                            {user?.name?.split(" ")[0] || "User"}
                                        </span>
                                        <svg
                                            className={`w-4 h-4 text-gray-500 transition-transform ${isDropdown ? "rotate-180" : ""
                                                }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>


                                    {isDropdown && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">

                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {user?.name}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {user?.email}
                                                </p>

                                            </div>


                                            <div className="py-1">
                                                <Link
                                                    href="/profile"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                                    onClick={() => setisDropdown(false)}
                                                >
                                                    <span className="text-lg">👤</span>
                                                    Profile
                                                </Link>
                                                <Link
                                                    href="/dashboard"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                                    onClick={() => setisDropdown(false)}
                                                >
                                                    <span className="text-lg">📊</span>
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    href="/settings"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                                    onClick={() => setisDropdown(false)}
                                                >
                                                    <span className="text-lg">⚙️</span>
                                                    Settings
                                                </Link>
                                                <hr className="my-1" />
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition w-full"
                                                >
                                                    <span className="text-lg">🚪</span>
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-gray-700 hover:text-blue-500 transition font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition font-medium"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>


                </div>

            </div>
        </nav>
    );


}