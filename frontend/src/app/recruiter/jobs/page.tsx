"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, MapPin, Calendar } from "lucide-react";
import { jobsApi } from "@/lib/api";
import { Job } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function RecruiterJobsPage() {
  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["recruiter-jobs"],
    queryFn: async () => {
      const { data } = await jobsApi.list(0, 100);
      return data;
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-sora text-2xl font-bold text-white">Job Postings</h1>
          <p className="text-gray-400 text-sm mt-1">{jobs.length} job{jobs.length !== 1 ? "s" : ""} posted</p>
        </div>
        <Link href="/recruiter/jobs/new">
          <Button><Plus className="w-4 h-4" /> New Job Posting</Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="space-y-3">
        {jobs.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="hover:border-teal-500/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-white">{job.title}</h3>
                    <Badge variant={job.status === "open" ? "teal" : job.status === "draft" ? "amber" : "gray"}>
                      {job.status}
                    </Badge>
                    <span className="text-xs text-gray-600 capitalize">{job.job_type.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/recruiter/jobs/${job.id}`}>
                    <Button variant="secondary" size="sm">View Applicants</Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
