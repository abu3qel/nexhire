"use client";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { Job } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Props {
  job: Job;
  onApply: (job: Job) => void;
  index?: number;
  hasApplied?: boolean;
}

const typeLabels: Record<string, string> = {
  full_time: "Full-time", part_time: "Part-time", contract: "Contract", internship: "Internship",
};

export function JobCard({ job, onApply, hasApplied = false }: Props) {
  const router = useRouter();

  return (
    <div
      className="rounded-xl bg-white border border-slate-200 shadow-sm p-5 flex flex-col hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
      onClick={() => router.push(`/candidate/jobs/${job.id}`)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-slate-900 text-sm leading-snug flex-1">{job.title}</h3>
        <Badge variant="blue" className="flex-shrink-0">{typeLabels[job.job_type] || job.job_type}</Badge>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-3">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(job.created_at).toLocaleDateString()}
        </span>
      </div>

      <p className="text-xs text-slate-500 line-clamp-3 mb-3 flex-1 leading-relaxed">{job.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.required_skills.slice(0, 5).map(skill => (
          <span key={skill} className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            {skill}
          </span>
        ))}
        {job.required_skills.length > 5 && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-400">
            +{job.required_skills.length - 5}
          </span>
        )}
      </div>

      {hasApplied ? (
        <div className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Applied
        </div>
      ) : (
        <Button
          className="w-full justify-center"
          onClick={e => { e.stopPropagation(); onApply(job); }}
        >
          Apply Now
        </Button>
      )}
    </div>
  );
}
