"use client";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { Job } from "@/lib/types";
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
      className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col hover:border-gray-300 transition-all cursor-pointer group"
      onClick={() => router.push(`/candidate/jobs/${job.id}`)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug flex-1 group-hover:text-brand-600 transition-colors">
          {job.title}
        </h3>
        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100/80 flex-shrink-0">
          {typeLabels[job.job_type] || job.job_type}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(job.created_at).toLocaleDateString()}
        </span>
      </div>

      <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed">{job.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.required_skills.slice(0, 4).map(skill => (
          <span key={skill} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
            {skill}
          </span>
        ))}
        {job.required_skills.length > 4 && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-400">
            +{job.required_skills.length - 4}
          </span>
        )}
      </div>

      {hasApplied ? (
        <div className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Applied
        </div>
      ) : (
        <Button
          className="w-full justify-center"
          onClick={e => { e.stopPropagation(); onApply(job); }}
        >
          Apply now
        </Button>
      )}
    </div>
  );
}
