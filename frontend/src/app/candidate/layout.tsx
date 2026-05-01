"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Briefcase, FileText, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/candidate/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/candidate/jobs",      icon: Briefcase,       label: "Browse Jobs" },
  { href: "/candidate/applications", icon: FileText,     label: "My Applications" },
];

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "candidate")) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-black">N</span>
          </div>
          <span className="text-white font-bold text-sm tracking-tight">NexHire</span>
        </Link>
        <button className="lg:hidden text-white/40 hover:text-white transition-colors" onClick={() => setSidebarOpen(false)}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Role label */}
      <div className="px-5 pt-4 pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Candidate</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-white/[0.10] text-white font-medium"
                  : "text-white/45 hover:text-white/80 hover:bg-white/[0.05]"
              }`}>
                {active && (
                  <span className="absolute left-3 w-0.5 h-5 rounded-full bg-brand-400" />
                )}
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 mt-4 border-t border-white/[0.06] pt-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white/90 truncate leading-tight">{user.full_name}</div>
            <div className="text-xs text-white/35 truncate leading-tight">{user.email}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/35 hover:text-white/70 hover:bg-white/[0.05] transition-colors w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F6FA] lg:flex relative">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#0D1117] z-30 flex items-center gap-3 px-4 border-b border-white/[0.06]">
        <button onClick={() => setSidebarOpen(true)} className="text-white/40 hover:text-white transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-black">N</span>
          </div>
          <span className="font-bold text-white text-sm tracking-tight">NexHire</span>
        </Link>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-56 bg-[#0D1117] flex flex-col relative
        transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0 lg:z-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-14 lg:pt-0 min-w-0">
        <div className="p-5 sm:p-7 lg:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
