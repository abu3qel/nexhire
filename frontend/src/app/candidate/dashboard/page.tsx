"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, Clock, CheckCircle2, XCircle } from "lucide-react";
import { applicationsApi } from "@/lib/api";
import { Application } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

const statusConfig: Record<string, { variant: "teal" | "amber" | "green" | "red" | "gray"; icon: React.ElementType }> = {
  submitted: { variant: "amber", icon: Clock },
  under_review: { variant: "teal", icon: Clock },
  shortlisted: { variant: "green", icon: CheckCircle2 },
  rejected: { variant: "red", icon: XCircle },
};

export default function CandidateDashboard() {
  const { user } = useAuth();
  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const { data } = await applicationsApi.myApplications();
      return data;
    },
  });

  const firstName = user?.full_name.split(" ")[0] || "there";

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-sora text-2xl font-bold text-white">Welcome back, {firstName} 👋</h1>
        <p className="text-gray-400 text-sm mt-1">Track your applications and discover new opportunities</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total Applied", value: applications.length, color: "text-white" },
          { label: "Under Review", value: applications.filter(a => a.status === "under_review").length, color: "text-[#00d4aa]" },
          { label: "Shortlisted", value: applications.filter(a => a.status === "shortlisted").length, color: "text-green-400" },
          { label: "Rejected", value: applications.filter(a => a.status === "rejected").length, color: "text-red-400" },
        ].map((s) => (
          <Card key={s.label} className="text-center py-4">
            <div className={`text-2xl font-bold font-sora ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-sora text-lg font-semibold text-white">My Applications</h2>
        <Link href="/candidate/jobs">
          <Button size="sm"><Briefcase className="w-4 h-4" /> Browse Jobs</Button>
        </Link>
      </div>

      {isLoading && <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>}

      {applications.length === 0 && !isLoading && (
        <Card className="text-center py-16">
          <Briefcase className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No applications yet</p>
          <Link href="/candidate/jobs">
            <Button>Browse open positions</Button>
          </Link>
        </Card>
      )}

      <div className="space-y-3">
        {applications.map((app, i) => {
          const cfg = statusConfig[app.status] || { variant: "gray" as const, icon: Clock };
          return (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                  <cfg.icon className="w-5 h-5 text-[#00d4aa]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">Job Application</div>
                  <div className="text-xs text-gray-500">
                    Applied {new Date(app.submitted_at).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant={cfg.variant}>{app.status.replace("_", " ")}</Badge>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
