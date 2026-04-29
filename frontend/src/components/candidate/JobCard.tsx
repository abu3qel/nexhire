"use client";
import { motion } from "framer-motion";
import { MapPin, Calendar, Briefcase } from "lucide-react";
import { Job } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Props {
  job: Job;
  onApply: (job: Job) => void;
  index?: number;
}

const typeLabels: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  internship: "Internship",
};

export function JobCard({ job, onApply, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="h-full flex flex-col hover:border-teal-500/20 hover:shadow-lg hover:shadow-teal-500/5 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm">{job.title}</h3>
          </div>
          <Badge variant="teal">{typeLabels[job.job_type] || job.job_type}</Badge>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />{job.location}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(job.created_at).toLocaleDateString()}
          </span>
        </div>

        <p className="text-xs text-gray-500 line-clamp-3 mb-3 flex-1">{job.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.required_skills.slice(0, 5).map(skill => (
            <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
              {skill}
            </span>
          ))}
          {job.required_skills.length > 5 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500">
              +{job.required_skills.length - 5}
            </span>
          )}
        </div>

        <Button className="w-full justify-center" onClick={() => onApply(job)}>
          Apply Now
        </Button>
      </Card>
    </motion.div>
  );
}
