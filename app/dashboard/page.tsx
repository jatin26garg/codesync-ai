"use client"

import { useState } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"


interface User {
    id: string;
    name: string;
    email: string;
    createdAt?: string;
}


interface DashboardData {
    success: boolean;
    user: User;
}



export default function dashboard() {
    const router = useRouter();
    const [user, setuser] = useState<User | null>(null)
    const [loading, setloading] = useState(false)
    const [error, seterror] = useState("");

    useEffect(() => {
        fetchUserData();
    }, [])
    const fetchUserData = async () => {
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
            const data: DashboardData = await res.json();

            if (data.success && data.user) {
                setuser(data.user)
            }
            else throw new Error("data not found")


        } catch (error) {
            seterror("Failed to load dashboard data. Please try again.");
        } finally {
            setloading(false);
        }

    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }


    if (error) {
        return (
            <div>

                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={fetchUserData}
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Here's what's happening with your account today.
                    </p>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="text-xl font-semibold text-gray-900">{user?.name}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <span className="text-2xl">👤</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-xl font-semibold text-gray-900">{user?.email}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-xl">
                                <span className="text-2xl">📧</span>
                            </div>
                        </div>
                    </div>


                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                {/* Header with Add Project Button */}
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm text-gray-500 font-medium">Projects</p>
                                    <button
                                        onClick={router.push("/myProjects")}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition shadow-md hover:shadow-lg"
                                    >
                                        Projects
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Teams:</span>
                                        <span className="text-sm font-semibold text-gray-900">0</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Collaborators:</span>
                                        <span className="text-sm font-semibold text-gray-900">0</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Email:</span>
                                        <span className="text-sm font-semibold text-gray-900 truncate">
                                            {user?.email}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>




                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Details</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">User ID</span>
                                <span className="text-gray-900 font-mono text-sm">{user?.id}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">Email</span>
                                <span className="text-gray-900">{user?.email}</span>
                            </div>

                            {user?.createdAt && (
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-500">Member Since</span>
                                    <span className="text-gray-900">
                                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}