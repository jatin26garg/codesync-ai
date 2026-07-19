"use client"
import { useState } from "react"

export function InviteButton({ projectID }: { projectID: string }) {
    const [isopen, setisopen] = useState(false);
    const [email, setemail] = useState("");
    const [isloading, setisloading] = useState(false);
    const [message, setmessage] = useState("");
    const [error, seterror] = useState("");

    const handleSubmit = async () => {
        if (!email) {
            seterror("email is req");
        }
        try {
            setisloading(true);
            seterror("");
            setmessage("");

            const res = await fetch(`/api/projects/${projectID}/invite`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email
                    })

                }
            )

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || data.error)
            }
            setmessage("Invitation sent successfully");
            setemail("")

        } catch (error) {
            seterror(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setisloading(false);
        }
    }
   return (
    <>
        {/* Invite Button */}
        <button
            onClick={() => setisopen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 
                text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 
                transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 
                border border-emerald-400/20"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 4v16m8-8H4" 
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
            </svg>
            <span>Invite</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">+</span>
        </button>

        {/* Invite Modal */}
        {isopen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                <div className="w-full max-w-md rounded-2xl border border-gray-700/50 bg-[#1e1e1e] p-6 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 
                                rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                                    />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Invite Collaborator
                                </h2>
                                <p className="text-xs text-gray-400">
                                    Invite someone to collaborate on this project
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setisopen(false)}
                            className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700/50"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Input Section */}
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" 
                                    />
                                </svg>
                            </div>
                            <input
                                type="email"
                                placeholder="Enter email address"
                                value={email}
                                onChange={(e) => setemail(e.target.value)}
                                className="w-full rounded-xl border border-gray-600 bg-[#252526] 
                                    pl-10 pr-4 py-3 text-white text-sm outline-none 
                                    focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                                    transition-all placeholder-gray-400"
                            />
                        </div>

                        {/* Messages */}
                        {error && (
                            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
                                <span>⚠️</span>
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-2.5 text-sm text-green-400">
                                <span>✅</span>
                                {message}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isloading}
                            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 
                                px-4 py-3 font-semibold text-white transition-all duration-200 
                                hover:from-emerald-600 hover:to-teal-700 
                                disabled:cursor-not-allowed disabled:opacity-50 
                                shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                        >
                            {isloading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Sending...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <span>🚀</span>
                                    Send Invitation
                                </span>
                            )}
                        </button>

                        {/* Footer */}
                        <p className="text-center text-[11px] text-gray-500">
                            The invited user will receive an email with a link to join
                        </p>
                    </div>
                </div>
            </div>
        )}
    </>
);
}