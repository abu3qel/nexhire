"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { jobsApi, applicationsApi } from "@/lib/api";
import { Job, Application } from "@/lib/types";
import { JobCard } from "@/components/candidate/JobCard";
import { ApplicationForm } from "@/components/candidate/ApplicationForm";

const JOB_TYPES = [
  { value: "", label: "All Types" },
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

export default function CandidateJobsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["open-jobs"],
    queryFn: async () => { const { data } = await jobsApi.list(0, 100); return data; },
  });

  const { data: myApplications = [] } = useQuery<Application[]>({
    queryKey: ["my-applications"],
    queryFn: async () => { const { data } = await applicationsApi.myApplications(); return data; },
  });

  const appliedJobIds = useMemo(
    () => new Set(myApplications.map(a => a.job_id)),
    [myApplications]
  );

  const filtered = jobs.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.description.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || j.job_type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-500 text-sm mt-0.5">{jobs.length} open position{jobs.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {JOB_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === t.value
                  ? "bg-brand-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">
          {search || typeFilter ? "No jobs match your filters" : "No open positions at the moment"}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((job, i) => (
          <JobCard key={job.id} job={job} onApply={setSelectedJob} index={i} hasApplied={appliedJobIds.has(job.id)} />
        ))}
      </div>

      {selectedJob && (
        <ApplicationForm job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
