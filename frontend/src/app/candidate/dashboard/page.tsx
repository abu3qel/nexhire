"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Briefcase, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { applicationsApi } from "@/lib/api";
import { Application } from "@/lib/types";
import { Card } from "@/components/ui/Card";
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
    { label: "Total Applied", value: applications.length, icon: Briefcase, color: "text-slate-900" },
    { label: "Under Review", value: applications.filter(a => a.status === "under_review").length, icon: Clock, color: "text-blue-600" },
    { label: "Shortlisted", value: applications.filter(a => a.status === "shortlisted").length, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Rejected", value: applications.filter(a => a.status === "rejected").length, icon: XCircle, color: "text-red-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-900">Welcome back, {firstName}</h1>
        <p className="text-slate-500 text-sm mt-0.5">Track your applications and discover new opportunities</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="py-4">
            <div className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-900">My Applications</h2>
        <Link href="/candidate/jobs">
          <Button size="sm"><Briefcase className="w-4 h-4" /> Browse Jobs</Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {applications.length === 0 && !isLoading && (
        <Card className="text-center py-16">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm mb-4">No applications yet</p>
          <Link href="/candidate/jobs">
            <Button>Browse open positions</Button>
          </Link>
        </Card>
      )}

      {applications.length > 0 && (
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          {applications.map((app, i) => {
            const cfg = statusConfig[app.status] || { variant: "gray" as const, label: app.status };
            return (
              <div
                key={app.id}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors ${
                  i < applications.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900">Job Application</div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    Applied {new Date(app.submitted_at).toLocaleDateString()}
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
