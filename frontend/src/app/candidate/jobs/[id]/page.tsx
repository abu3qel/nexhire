"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Calendar, Briefcase, CheckCircle2 } from "lucide-react";
import { jobsApi, applicationsApi } from "@/lib/api";
import { Job, Application } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ApplicationForm } from "@/components/candidate/ApplicationForm";
import { useState, useMemo } from "react";

const jobTypeLbl: Record<string, string> = {
  full_time: "Full-time", part_time: "Part-time", contract: "Contract", internship: "Internship",
};

export default function CandidateJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [applying, setApplying] = useState(false);

  const { data: job, isLoading } = useQuery<Job>({
    queryKey: ["job-detail", id],
    queryFn: async () => { const { data } = await jobsApi.get(id); return data; },
  });

  const { data: myApplications = [] } = useQuery<Application[]>({
    queryKey: ["my-applications"],
    queryFn: async () => { const { data } = await applicationsApi.myApplications(); return data; },
  });

  const hasApplied = useMemo(
    () => myApplications.some(a => a.job_id === id),
    [myApplications, id]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 text-sm mb-4">Job not found</p>
        <Link href="/candidate/jobs"><Button variant="secondary">Back to jobs</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/candidate/jobs">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <span className="text-sm text-slate-500">Back to jobs</span>
      </div>

      {/* Header card */}
      <Card className="mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="text-xl font-bold text-slate-900">{job.title}</h1>
              <Badge variant="blue">{jobTypeLbl[job.job_type] || job.job_type}</Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Posted {new Date(job.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{jobTypeLbl[job.job_type]}</span>
            </div>
          </div>

          {hasApplied ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              Applied
            </div>
          ) : (
            <Button className="flex-shrink-0" onClick={() => setApplying(true)}>
              Apply Now
            </Button>
          )}
        </div>
      </Card>

      {/* Description */}
      <Card className="mb-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Job Description</h2>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
      </Card>

      {/* Skills */}
      {job.required_skills.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.required_skills.map(skill => (
              <span key={skill} className="text-sm px-3 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {skill}
              </span>
            ))}
          </div>
        </Card>
      )}

      {applying && <ApplicationForm job={job} onClose={() => setApplying(false)} />}
    </div>
  );
}
