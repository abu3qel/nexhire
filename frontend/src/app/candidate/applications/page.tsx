"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { Briefcase, Calendar, Clock } from "lucide-react";
import { applicationsApi } from "@/lib/api";
import { Application } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const statusConfig: Record<string, "teal" | "amber" | "green" | "red" | "gray"> = {
  submitted: "amber",
  under_review: "teal",
  shortlisted: "green",
  rejected: "red",
};

export default function MyApplicationsPage() {
  const { data: apps = [], isLoading } = useQuery<Application[]>({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const { data } = await applicationsApi.myApplications();
      return data;
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-sora text-2xl font-bold text-white">My Applications</h1>
        <p className="text-gray-400 text-sm mt-1">{apps.length} application{apps.length !== 1 ? "s" : ""} submitted</p>
      </div>

      {isLoading && <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>}

      {apps.length === 0 && !isLoading && (
        <Card className="text-center py-16">
          <Briefcase className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No applications yet</p>
          <Link href="/candidate/jobs">
            <Button>Browse Jobs</Button>
          </Link>
        </Card>
      )}

      <div className="space-y-3">
        {apps.map((app, i) => (
          <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-[#00d4aa]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">Job ID: {app.job_id.slice(0, 8)}…</div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(app.submitted_at).toLocaleDateString()}</span>
                  {app.github_url && <span className="text-[#00d4aa]">GitHub ✓</span>}
                  {app.stackoverflow_url && <span className="text-[#00d4aa]">SO ✓</span>}
                  {app.portfolio_url && <span className="text-[#00d4aa]">Portfolio ✓</span>}
                </div>
              </div>
              <Badge variant={statusConfig[app.status] || "gray"}>{app.status.replace("_", " ")}</Badge>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
