"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewPage() {
    const router = useRouter();
    const [form, setform] = useState({
        name: "",
        description: ""
    })
    const [loading, setloading] = useState(false);
    const [error, seterror] = useState("");

    const handleSubmit = async (e :React.FormEvent)=>{
        e.preventDefault();
        seterror("");
        setloading(true);
        try {
            if(form.name.length < 3 || form.description.length < 3){
                seterror("too short")
                return;
            }
            const res= await fetch("/api/projects",
                {
                    method : "POST",
                    headers : {"Content-Type": "application/json", },
                    body: JSON.stringify({
                        name : form.name,
                        description : form.description
                    })

                },
            )
            
            const data =  await res.json();
            if(!res.ok){
                throw new Error(data.error);
            }

            alert("new projected created successfully");
            router.push("/dashboard");
            router.refresh()
        } catch (error) {
            console.log("create page error", error);
            seterror(error instanceof Error ? error.message : "failed to craete new project");
        }finally{
            setloading(false)
        }
    }
    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
                    <Link
                        href="/dashboard"
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        Cancel
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Name *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Enter project name"
                            value={form.name}
                            onChange={(e) => setform({ ...form, name: e.target.value })}
                            className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                        </label>
                        <textarea
                            required
                            placeholder="Describe your project"
                            rows={4}
                            value={form.description}
                            onChange={(e) => setform({ ...form, description: e.target.value })}
                            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                            disabled={loading}
                        />
                    </div>


                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition font-medium disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Project"}
                        </button>
                        <Link
                            href="/dashboard"
                            className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition font-medium text-center"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );

}