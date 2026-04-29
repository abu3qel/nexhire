"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { jobsApi } from "@/lib/api";
import { Job } from "@/lib/types";
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
    queryFn: async () => {
      const { data } = await jobsApi.list(0, 100);
      return data;
    },
  });

  const filtered = jobs.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.description.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || j.job_type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-sora text-2xl font-bold text-white">Browse Jobs</h1>
        <p className="text-gray-400 text-sm mt-1">{jobs.length} open position{jobs.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="w-full bg-[#111827] border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500/60"
          />
        </div>
        <div className="flex gap-2">
          {JOB_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`px-3 py-2 rounded-xl text-sm transition-all ${
                typeFilter === t.value
                  ? "bg-teal-500/20 text-[#00d4aa] border border-teal-500/30"
                  : "bg-[#111827] text-gray-400 border border-gray-700 hover:border-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          {search || typeFilter ? "No jobs match your filters" : "No open positions at the moment"}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((job, i) => (
          <JobCard key={job.id} job={job} onApply={setSelectedJob} index={i} />
        ))}
      </div>

      {selectedJob && (
        <ApplicationForm job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
