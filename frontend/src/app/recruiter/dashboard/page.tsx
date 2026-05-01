"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Briefcase, Users, BarChart2, TrendingUp, MapPin, ArrowRight } from "lucide-react";
import { jobsApi } from "@/lib/api";
import { Job } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const jobTypeLbl: Record<string, string> = {
  full_time: "Full-time", part_time: "Part-time", contract: "Contract", internship: "Internship",
};

export default function RecruiterDashboard() {
  const router = useRouter();
  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["recruiter-jobs"],
    queryFn: async () => { const { data } = await jobsApi.myJobs(); return data; },
  });

  const stats = [
    { label: "Total posted",  value: jobs.length,                                           icon: Briefcase  },
    { label: "Open",          value: jobs.filter(j => j.status === "open").length,           icon: Users      },
    { label: "Draft",         value: jobs.filter(j => j.status === "draft").length,          icon: BarChart2  },
    { label: "Closed",        value: jobs.filter(j => j.status === "closed").length,         icon: TrendingUp },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Overview of your job postings</p>
        </div>
        <Link href="/recruiter/jobs/new">
          <Button size="md"><Plus className="w-4 h-4" /> New posting</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-3xl font-bold text-gray-900 font-mono mb-1">{s.value}</div>
            <div className="text-xs text-gray-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Your postings</h2>
        <Link href="/recruiter/jobs" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {jobs.length === 0 && !isLoading && (
        <div className="bg-white border border-gray-200 rounded-xl text-center py-16">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Briefcase className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4 text-sm">No job postings yet</p>
          <Link href="/recruiter/jobs/new">
            <Button size="sm">Create your first posting</Button>
          </Link>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {jobs.map((job, i) => (
            <div
              key={job.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors cursor-pointer group ${
                i < jobs.length - 1 ? "border-b border-gray-100" : ""
              }`}
              onClick={() => router.push(`/recruiter/jobs/${job.id}`)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900 truncate">{job.title}</span>
                  <Badge variant={job.status === "open" ? "green" : job.status === "draft" ? "amber" : "gray"}>
                    {job.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                  <span className="text-gray-300">·</span>
                  <span>{jobTypeLbl[job.job_type] || job.job_type}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 max-w-[200px] hidden md:flex">
                {job.required_skills.slice(0, 3).map(skill => (
                  <span key={skill} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 border border-gray-200">
                    {skill}
                  </span>
                ))}
                {job.required_skills.length > 3 && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-400">+{job.required_skills.length - 3}</span>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
