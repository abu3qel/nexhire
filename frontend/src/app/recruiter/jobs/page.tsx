"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Briefcase, MapPin, Calendar, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { jobsApi } from "@/lib/api";
import { Job } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EditJobModal } from "@/components/recruiter/EditJobModal";

const jobTypeLbl: Record<string, string> = {
  full_time: "Full-time", part_time: "Part-time", contract: "Contract", internship: "Internship",
};

export default function RecruiterJobsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["recruiter-jobs"],
    queryFn: async () => { const { data } = await jobsApi.myJobs(); return data; },
  });

  const handleDelete = async (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Close "${job.title}"? This will hide it from candidates.`)) return;
    setDeletingId(job.id);
    try {
      await jobsApi.delete(job.id);
      toast.success("Job closed");
      qc.invalidateQueries({ queryKey: ["recruiter-jobs"] });
    } catch {
      toast.error("Failed to close job");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {editJob && <EditJobModal job={editJob} onClose={() => setEditJob(null)} />}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-500 text-sm mt-0.5">{jobs.length} job{jobs.length !== 1 ? "s" : ""} posted</p>
        </div>
        <Link href="/recruiter/jobs/new">
          <Button><Plus className="w-4 h-4" /> New Job Posting</Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && jobs.length === 0 && (
        <div className="rounded-xl bg-white border border-gray-200 text-center py-16">
          <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-4">No job postings yet</p>
          <Link href="/recruiter/jobs/new">
            <Button>Create your first job posting</Button>
          </Link>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_1fr_auto] bg-gray-50 border-b border-gray-200 px-5 py-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Position</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:block">Details</span>
            <span />
          </div>
          {jobs.map((job, i) => (
            <div
              key={job.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                i < jobs.length - 1 ? "border-b border-gray-100" : ""
              }`}
              onClick={() => router.push(`/recruiter/jobs/${job.id}`)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{job.title}</span>
                  <Badge variant={job.status === "open" ? "green" : job.status === "draft" ? "amber" : "gray"}>
                    {job.status}
                  </Badge>
                  <span className="text-xs text-gray-400">{jobTypeLbl[job.job_type] || job.job_type}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 max-w-[180px] hidden md:flex">
                {job.required_skills.slice(0, 3).map(skill => (
                  <span key={skill} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 border border-gray-200">
                    {skill}
                  </span>
                ))}
                {job.required_skills.length > 3 && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-400">+{job.required_skills.length - 3}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <Link href={`/recruiter/jobs/${job.id}`}>
                  <Button variant="secondary" size="sm">View</Button>
                </Link>
                <button
                  onClick={e => { e.stopPropagation(); setEditJob(job); }}
                  className="p-1.5 rounded-lg border border-gray-200 hover:border-brand-200 hover:text-brand-600 text-gray-400 transition-colors"
                  title="Edit job"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={e => handleDelete(job, e)}
                  disabled={deletingId === job.id}
                  className="p-1.5 rounded-lg border border-gray-200 hover:border-red-300 hover:text-red-500 text-gray-400 transition-colors disabled:opacity-40"
                  title="Close job"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
