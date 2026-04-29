"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutDashboard, Briefcase, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/recruiter/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/recruiter/jobs", icon: Briefcase, label: "Jobs" },
];

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== "recruiter")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-[#111827] border-r border-gray-800 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-800">
          <div className="text-[#00d4aa] font-sora text-xl font-bold">NexHire</div>
          <div className="text-xs text-gray-500 mt-0.5">Recruiter Portal</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    active
                      ? "bg-teal-500/10 text-[#00d4aa] border border-teal-500/20"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800">
          <div className="px-3 py-2 mb-2">
            <div className="text-sm font-medium text-gray-200 truncate">{user.full_name}</div>
            <div className="text-xs text-gray-500 truncate">{user.company_name || user.email}</div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
