"use client"

import React from "react"
import { useState } from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"

interface signUpError {
    name?: string,
    email?: string,
    password?: string,
    confirmpassword?: string,
    general?: string;
}
export default function signup() {

    const router = useRouter();
    const [form, setform] = useState({
        name: "",
        email: "",
        password: "",
        confirmpassword: "",

    })
    const [error, seterror] = useState<signUpError>({});
    const [loading, setloading] = useState(false);

    const vaild = () => {
        if (!form.name) {
            seterror({ name: "name is req" });
        }
        else if (form.name.length < 2) seterror({ name: "name is too short" })
        else if (form.name.length > 50) seterror({ name: "too large name" });

        if (!form.email) {
            seterror({ email: "email is required" });
        }
        else if (!/\S+@\S+\.\S+/.test(form.email)) {
            seterror({ email: "not a valid email " })
        }

        if (!form.password) {
            seterror({ password: "password is req" })
        }
        else if (form.password.length < 6) seterror({ password: "too short" });
        else if (form.password.length > 100) seterror({ password: "too large pasword" });

        if (!form.confirmpassword) seterror({ confirmpassword: "this is req" })
        else if (form.confirmpassword !== form.password) seterror({ confirmpassword: "wrong" })

        return Object.keys(error).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!vaild()) return;
        seterror({});
        setloading(true);

        try {
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: form.name.toString(),
                    email: form.email,
                    password: form.password
                })

            })

            const data = await res.json();
            if (!res.ok) {
                if (res.status === 409) {
                    seterror({ email: "email already exists" })
                }
                else if (res.status === 400) {
                    seterror({ general: data.error || "inavild data" })
                }
                else {
                    seterror({ general: data.error || "Registration failed. Please try again." });
                }
                return;
            }
            if (!data.success) {
                seterror({ general: data.error || "Registration failed. Please try again." });
                return;
            }
            alert("reg done");
            router.push("/login");



        } catch (error) {
            console.error("Registration error:", error);
            seterror({ general: "Something went wrong. Please try again." });
        } finally {
            setloading(false);
        }

    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
                        <span className="text-3xl">🚀</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900">Create Account</h1>
                    <p className="mt-2 text-gray-600">Join us and get started</p>
                </div>

                /// form starts here
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {error.general && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error.general}
                            </div>
                        )}


                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                placeholder="John Doe"
                                value={form.name}
                                onChange={(e) => setform({ ...form, name: e.target.value })}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${error.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                disabled={loading}
                            />
                            {error.name && (
                                <p className="mt-1 text-sm text-red-500">{error.name}</p>
                            )}
                        </div>


                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(e) => setform({ ...form, email: e.target.value })}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${error.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                disabled={loading}
                            />
                            {error.email && (
                                <p className="mt-1 text-sm text-red-500">{error.email}</p>
                            )}
                        </div>


                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setform({ ...form, password: e.target.value })}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${error.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                disabled={loading}
                            />
                            {error.password && (
                                <p className="mt-1 text-sm text-red-500">{error.password}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Must be at least 6 characters
                            </p>
                        </div>


                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                required
                                placeholder="••••••••"
                                value={form.confirmpassword}
                                onChange={(e) => setform({ ...form, confirmpassword: e.target.value })}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${error.confirmpassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                disabled={loading}
                            />
                            {error.confirmpassword && (
                                <p className="mt-1 text-sm text-red-500">{error.confirmpassword}</p>
                            )}
                        </div>


                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>


                        <p className="text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="text-blue-500 hover:text-blue-700 font-medium transition">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )

}