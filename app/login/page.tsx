"use client"

import React, { useState } from "react"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"


export default function login() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl =searchParams.get("redirect");

    const [formData, setformData] = useState({
        email: "",
        
        password: "",
        
    })
    const [error, seterror] = useState('')
    const [loading, setloading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        seterror('');
        setloading(true);

        try {
            console.log("😂😂😂`",redirectUrl);
            const res = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email : formData.email,
                    password:  formData.password
                })
            })
            const data = await res.json();
            if (!data.success) {
                seterror(data.error)
                return;
            }
            console.log("login page is working");
            alert("logein")
            if(redirectUrl){
                console.log("😂😂😂`");
                router.push(redirectUrl)
                return;
            }
            router.push("/dashboard");
           

        } catch (error) {
            seterror("login page is wrong")
        } finally {
            setloading(false);
        }

    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="mt-2 text-gray-600">Sign in to your account</p>
                </div>


                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}


                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setformData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                disabled={loading}
                            />
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
                                value={formData.password}
                                onChange={(e) => setformData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                disabled={loading}
                            />
                        </div>


                        <div className="flex items-center justify-between">
                            
                            <Link
                                href="/forgot-password"
                                className="text-sm text-blue-500 hover:text-blue-700 transition"
                            >
                                Forgot password?
                            </Link>
                        </div>


                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>


                        <p className="text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-blue-500 hover:text-blue-700 font-medium transition">
                                Sign up
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}