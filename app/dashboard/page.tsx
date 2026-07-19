"use client"

import { useState } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ProjectResponse } from "../api/projects/route"

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
interface Project {
    success: boolean;
    projects: ProjectResponse[]
}




export default function dashboard() {
    const router = useRouter();
    const [user, setuser] = useState<User | null>(null)
    const [loading, setloading] = useState(false)
    const [error, seterror] = useState("");
    const [projects, setprojects] = useState<ProjectResponse[]>([])
    const [total, settotal] = useState(0)

    useEffect(() => {
        fetchUserData();
        fetchProjects();
    }, [])
    const fetchProjects = async () => {
        try {
            setloading(true);
            setprojects([]);
            seterror("");
            console.log("!11")
            const res = await fetch("/api/projects",
                {
                    method: "GET",
                    credentials: "include",
                }
            )
            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login");
                    return;
                }
                throw new Error("failed to get details");
            }
            const data: Project = await res.json();
            if (data.success && data.projects) {
                setprojects(data.projects);
                console.log("&&&", projects)
                settotal(data.projects.length);
            } else throw new Error("Invalid response data");

        } catch (error) {
            console.log("error ", error);
            seterror(error instanceof Error ? error.message : "failed to load projects");
        } finally {
            setloading(false)
        }
    }


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
    
    const handledelete = async (id: string) => {
        
        if (!id) {
            seterror("Invalid project ID");
            return;
        }
        if (!confirm("are you sure to delete the project")) {
            return;
        }
        try {

            setloading(true);
            seterror("");
            const res = await fetch(`/api/projects/${id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            )

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login");
                    router.refresh();
                }
                else if (res.status === 400) {
                    throw new Error("invalid id")
                }
                else if (res.status === 500) {
                    alert("try again later");
                    return;
                }
                else throw new Error("error in delete ")
            }
            
            if (res.status === 200) {
                alert("folder deleted successfully");
            }
            await fetchProjects();
        } catch (error) {
            console.log("delete error");
            seterror("Failed to delete. Please try again.");
        } finally {
            setloading(false)
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
                            onClick={() => { fetchProjects(); fetchUserData(); }}
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
    <div className="min-h-screen bg-[#0d1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="bg-[#161b22] rounded-2xl border border-[#30363d] p-6 mb-6">
                <h1 className="text-3xl font-bold text-white">
                    Welcome back, {user?.name}! 👋
                </h1>
                <p className="mt-2 text-[#8b949e]">
                    Here's what's happening with your account today.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* User Info Card */}
                <div className="bg-[#161b22] rounded-2xl border border-[#30363d] p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[#8b949e]">Name</p>
                            <p className="text-xl font-semibold text-white">{user?.name}</p>
                        </div>
                        <div className="bg-[#1f6feb]/10 p-3 rounded-xl">
                            <span className="text-2xl">👤</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#30363d]">
                        <div>
                            <p className="text-sm text-[#8b949e]">Email</p>
                            <p className="text-xl font-semibold text-white truncate">{user?.email}</p>
                        </div>
                        <div className="bg-[#2ea043]/10 p-3 rounded-xl">
                            <span className="text-2xl">📧</span>
                        </div>
                    </div>
                </div>

                {/* Projects Stats Card */}
                <div className="bg-[#161b22] rounded-2xl border border-[#30363d] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-[#8b949e] font-medium">Projects: {total}</p>
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-[#1f6feb] text-white font-semibold rounded-lg hover:bg-[#1f6feb]/80 transition shadow-lg shadow-[#1f6feb]/20"
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-[#30363d]">
                            <span className="text-sm text-[#8b949e]">Teams</span>
                            <span className="text-sm font-semibold text-white">0</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#30363d]">
                            <span className="text-sm text-[#8b949e]">Collaborators</span>
                            <span className="text-sm font-semibold text-white">0</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-[#8b949e]">Email</span>
                            <span className="text-sm font-semibold text-white truncate max-w-[150px]">
                                {user?.email}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Account Details Card */}
                <div className="bg-[#161b22] rounded-2xl border border-[#30363d] p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Account Details</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-[#30363d]">
                            <span className="text-sm text-[#8b949e]">User ID</span>
                            <span className="text-sm font-mono text-[#8b949e] truncate max-w-[150px]">{user?.id}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#30363d]">
                            <span className="text-sm text-[#8b949e]">Email</span>
                            <span className="text-sm text-white truncate max-w-[150px]">{user?.email}</span>
                        </div>
                        {user?.createdAt && (
                            <div className="flex justify-between py-2">
                                <span className="text-sm text-[#8b949e]">Member Since</span>
                                <span className="text-sm text-white">
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

            {/* Projects Section */}
            <div className="bg-[#161b22] rounded-2xl border border-[#30363d] p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-white">Projects</h2>
                        <span className="bg-[#1f6feb] text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {total}
                        </span>
                    </div>
                    <Link
                        href="/projects/new"
                        className="flex items-center gap-2 px-4 py-2 bg-[#1f6feb] text-white rounded-lg hover:bg-[#1f6feb]/80 transition shadow-lg shadow-[#1f6feb]/20"
                    >
                        <span className="text-lg">➕</span>
                        New Project
                    </Link>
                </div>

                {error && (
                    <div className="bg-[#da3633]/10 border border-[#da3633] text-[#da3633] px-4 py-3 rounded-lg text-sm mb-4 flex items-center justify-between">
                        <span>{error}</span>
                        <button
                            onClick={fetchProjects}
                            className="text-[#58a6ff] hover:text-[#58a6ff]/80 font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {projects.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🚀</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
                        <p className="text-[#8b949e] mb-6">Create your first project to get started</p>
                        <Link
                            href="/projects/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1f6feb] text-white rounded-lg hover:bg-[#1f6feb]/80 transition shadow-lg shadow-[#1f6feb]/20"
                        >
                            <span className="text-lg">➕</span>
                            Create Project
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map((project) => (
                            <div key={project.id} className="group relative">
                                <Link
                                    href={`/projects/${project.id}`}
                                    className="block bg-[#0d1117] rounded-xl p-4 hover:border-[#1f6feb] transition border border-[#30363d]"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-white group-hover:text-[#58a6ff] transition truncate flex-1">
                                            {project.name}
                                        </h3>
                                    </div>

                                    <p className="text-sm text-[#8b949e] line-clamp-2 mb-3">
                                        {project.description || "No description"}
                                        <br/>
                                        
                                    </p>
                                    <div className="font-bold ">👑{project.owner.name}</div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                {project.collaborators.slice(0, 3).map((collab) => (
                                                    <div
                                                        key={collab.id}
                                                        className="w-6 h-6 bg-gradient-to-r from-[#1f6feb] to-[#58a6ff] rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-[#0d1117]"
                                                        title={collab.name}
                                                    >
                                                        {collab.name.charAt(0).toUpperCase()}
                                                    </div>
                                                ))}
                                                {project.collaborators.length > 3 && (
                                                    <div className="w-6 h-6 bg-[#30363d] rounded-full flex items-center justify-center text-xs font-semibold border-2 border-[#0d1117] text-[#8b949e]">
                                                        +{project.collaborators.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-[#8b949e]">
                                                {project.collaborators.length + 1} members
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                                {/* Delete Button - Positioned absolutely */}
                                <button
                                    onClick={() => handledelete(project.id)}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-[#da3633] hover:bg-[#da3633]/80 rounded-lg text-white text-xs"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
);
}