"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { applicationsApi } from "@/lib/api";
import { Application } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

const statusConfig: Record<string, { variant: "blue" | "amber" | "green" | "red" | "gray"; label: string }> = {
  submitted:    { variant: "amber", label: "Submitted" },
  under_review: { variant: "blue",  label: "Under Review" },
  shortlisted:  { variant: "green", label: "Shortlisted" },
  rejected:     { variant: "red",   label: "Rejected" },
};

export default function CandidateDashboard() {
  const { user } = useAuth();
  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["my-applications"],
    queryFn: async () => { const { data } = await applicationsApi.myApplications(); return data; },
  });

  const firstName = user?.full_name.split(" ")[0] || "there";

  const stats = [
    { label: "Applied",        value: applications.length },
    { label: "Under review",   value: applications.filter(a => a.status === "under_review").length },
    { label: "Shortlisted",    value: applications.filter(a => a.status === "shortlisted").length },
    { label: "Rejected",       value: applications.filter(a => a.status === "rejected").length },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Track your applications and find new roles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-3xl font-bold text-gray-900 font-mono mb-1">{s.value}</div>
            <div className="text-xs text-gray-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Recent applications</h2>
        <Link href="/candidate/jobs">
          <Button size="sm">Browse jobs <ArrowRight className="w-3.5 h-3.5" /></Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {applications.length === 0 && !isLoading && (
        <div className="bg-white border border-gray-200 rounded-xl text-center py-16">
          <p className="text-gray-500 text-sm mb-4">No applications yet</p>
          <Link href="/candidate/jobs">
            <Button>Browse open roles</Button>
          </Link>
        </div>
      )}

      {applications.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {applications.map((app, i) => {
            const cfg = statusConfig[app.status] || { variant: "gray" as const, label: app.status };
            return (
              <div
                key={app.id}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors ${
                  i < applications.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 mb-0.5">Job Application</div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    Applied {new Date(app.submitted_at).toLocaleDateString()}
                    {app.github_url && <span className="ml-2 text-emerald-600 font-medium">GitHub</span>}
                    {app.portfolio_url && <span className="text-emerald-600 font-medium">Portfolio</span>}
                  </div>
                </div>
                <Badge variant={cfg.variant}>{cfg.label}</Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
