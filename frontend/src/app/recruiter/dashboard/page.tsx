"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Briefcase, Users, BarChart2, TrendingUp } from "lucide-react";
import { jobsApi, assessmentsApi } from "@/lib/api";
import { Job, RankedCandidate } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-[#00d4aa]" />
      </div>
      <div>
        <div className="text-2xl font-bold font-sora text-white">{value}</div>
        <div className="text-sm text-gray-400">{label}</div>
        {sub && <div className="text-xs text-gray-600">{sub}</div>}
      </div>
    </Card>
  );
}

export default function RecruiterDashboard() {
  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ["recruiter-jobs"],
    queryFn: async () => {
      const { data } = await jobsApi.list(0, 100);
      return data;
    },
  });

  const totalApplicants = jobs.length; // Simplified stat

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-sora text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Overview of your job postings and assessments</p>
        </div>
        <Link href="/recruiter/jobs/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Job Posting
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Briefcase} label="Jobs Posted" value={jobs.length} />
        <StatCard icon={Users} label="Open Positions" value={jobs.filter(j => j.status === "open").length} />
        <StatCard icon={BarChart2} label="Draft Jobs" value={jobs.filter(j => j.status === "draft").length} />
        <StatCard icon={TrendingUp} label="Closed Jobs" value={jobs.filter(j => j.status === "closed").length} />
      </div>

      {/* Job cards */}
      <h2 className="font-sora text-lg font-semibold text-white mb-4">Your Job Postings</h2>
      {jobs.length === 0 ? (
        <Card className="text-center py-16">
          <Briefcase className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No job postings yet</p>
          <Link href="/recruiter/jobs/new">
            <Button>Create your first job posting</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">{job.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{job.location} · {job.job_type.replace("_", " ")}</p>
                  </div>
                  <Badge variant={job.status === "open" ? "teal" : job.status === "draft" ? "amber" : "gray"}>
                    {job.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">{job.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.required_skills.slice(0, 4).map(skill => (
                    <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                      {skill}
                    </span>
                  ))}
                  {job.required_skills.length > 4 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500">
                      +{job.required_skills.length - 4}
                    </span>
                  )}
                </div>
                <Link href={`/recruiter/jobs/${job.id}`}>
                  <Button variant="secondary" size="sm" className="w-full justify-center">
                    View Applicants
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
