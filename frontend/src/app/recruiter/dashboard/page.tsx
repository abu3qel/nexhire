"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Briefcase, Users, BarChart2, TrendingUp, MapPin, Calendar } from "lucide-react";
import { jobsApi } from "@/lib/api";
import { Job } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <Card className="flex items-center gap-4 py-4">
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </Card>
  );
}

const jobTypeLbl: Record<string, string> = {
  full_time: "Full-time", part_time: "Part-time", contract: "Contract", internship: "Internship",
};

export default function RecruiterDashboard() {
  const router = useRouter();
  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ["recruiter-jobs"],
    queryFn: async () => { const { data } = await jobsApi.myJobs(); return data; },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Overview of your job postings</p>
        </div>
        <Link href="/recruiter/jobs/new">
          <Button size="md"><Plus className="w-4 h-4" /> New Job Posting</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Briefcase} label="Total Posted" value={jobs.length} />
        <StatCard icon={Users} label="Open" value={jobs.filter(j => j.status === "open").length} />
        <StatCard icon={BarChart2} label="Draft" value={jobs.filter(j => j.status === "draft").length} />
        <StatCard icon={TrendingUp} label="Closed" value={jobs.filter(j => j.status === "closed").length} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-900">Your Job Postings</h2>
      </div>

      {jobs.length === 0 ? (
        <Card className="text-center py-16">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4 text-sm">No job postings yet</p>
          <Link href="/recruiter/jobs/new">
            <Button>Create your first job posting</Button>
          </Link>
        </Card>
      ) : (
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          {jobs.map((job, i) => (
            <div
              key={job.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                i < jobs.length - 1 ? "border-b border-slate-100" : ""
              }`}
              onClick={() => router.push(`/recruiter/jobs/${job.id}`)}
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-slate-900 truncate">{job.title}</span>
                  <Badge variant={job.status === "open" ? "green" : job.status === "draft" ? "amber" : "gray"}>
                    {job.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                  <span>{jobTypeLbl[job.job_type] || job.job_type}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 max-w-[200px] hidden md:flex">
                {job.required_skills.slice(0, 3).map(skill => (
                  <span key={skill} className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                    {skill}
                  </span>
                ))}
                {job.required_skills.length > 3 && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-400">+{job.required_skills.length - 3}</span>
                )}
              </div>
              <Link href={`/recruiter/jobs/${job.id}`} onClick={e => e.stopPropagation()}>
                <Button variant="secondary" size="sm">View Applicants</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
