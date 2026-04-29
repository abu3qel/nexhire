"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-60 flex-shrink-0 bg-[#1E293B] flex flex-col">
        <div className="px-6 py-5 border-b border-slate-700/50">
          <div className="text-white font-bold text-lg tracking-tight">NexHire</div>
          <div className="text-xs text-slate-400 mt-0.5 font-medium">Recruiter Portal</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-blue-600 text-white font-medium"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700/50">
          <div className="px-3 py-2 mb-1">
            <div className="text-sm font-medium text-slate-200 truncate">{user.full_name}</div>
            <div className="text-xs text-slate-500 truncate">{user.company_name || user.email}</div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
