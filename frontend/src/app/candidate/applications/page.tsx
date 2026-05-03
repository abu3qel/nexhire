"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Briefcase, Calendar, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { applicationsApi } from "@/lib/api";
import { Application } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const statusConfig: Record<string, "blue" | "amber" | "green" | "red" | "gray"> = {
  submitted:    "amber",
  under_review: "blue",
  shortlisted:  "green",
  rejected:     "red",
};

const statusLabel: Record<string, string> = {
  submitted: "Submitted", under_review: "Under Review",
  shortlisted: "Shortlisted", rejected: "Rejected",
};

export default function MyApplicationsPage() {
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: apps = [], isLoading } = useQuery<Application[]>({
    queryKey: ["my-applications"],
    queryFn: async () => { const { data } = await applicationsApi.myApplications(); return data; },
  });

  const handleDelete = async (app: Application) => {
    if (!confirm("Withdraw this application? This cannot be undone.")) return;
    setDeletingId(app.id);
    try {
      await applicationsApi.delete(app.id);
      toast.success("Application withdrawn");
      qc.invalidateQueries({ queryKey: ["my-applications"] });
    } catch {
      toast.error("Failed to withdraw application");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 text-sm mt-0.5">{apps.length} application{apps.length !== 1 ? "s" : ""} submitted</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {apps.length === 0 && !isLoading && (
        <Card className="text-center py-16">
          <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-4">No applications yet</p>
          <Link href="/candidate/jobs">
            <Button>Browse Jobs</Button>
          </Link>
        </Card>
      )}

      {apps.length > 0 && (
        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-[1fr_auto] bg-gray-50 border-b border-gray-200 px-5 py-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Application</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
          </div>
          {apps.map((app, i) => (
            <div
              key={app.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${
                i < apps.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-4 h-4 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">Job ID: {app.job_id.slice(0, 8)}...</div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(app.submitted_at).toLocaleDateString()}
                  </span>
                  {app.github_url && <span className="text-emerald-600 font-medium">GitHub ✓</span>}
                  {app.stackoverflow_url && <span className="text-emerald-600 font-medium">SO ✓</span>}
                  {app.portfolio_url && <span className="text-emerald-600 font-medium">Portfolio ✓</span>}
                </div>
              </div>
              <Badge variant={statusConfig[app.status] || "gray"}>
                {statusLabel[app.status] || app.status}
              </Badge>
              <button
                onClick={() => handleDelete(app)}
                disabled={deletingId === app.id}
                className="p-1.5 rounded-lg border border-gray-200 hover:border-red-300 hover:text-red-500 text-gray-400 transition-colors disabled:opacity-40 flex-shrink-0"
                title="Withdraw application"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
