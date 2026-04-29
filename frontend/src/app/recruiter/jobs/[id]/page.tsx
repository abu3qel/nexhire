"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Settings, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { jobsApi } from "@/lib/api";
import { useRankedCandidates } from "@/hooks/useAssessment";
import { Job } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CandidateRankingTable } from "@/components/recruiter/CandidateRankingTable";
import { ModalityWeightsForm } from "@/components/recruiter/ModalityWeightsForm";
import { BaselineComparison } from "@/components/recruiter/BaselineComparison";

const TABS = ["Ranked List", "Resume-Only Baseline", "Comparison"];

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState(0);
  const [showWeights, setShowWeights] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const { data: job, isLoading: jobLoading } = useQuery<Job>({
    queryKey: ["job", id],
    queryFn: async () => { const { data } = await jobsApi.get(id); return data; },
  });

  const { data: ranked = [], isLoading: rankLoading } = useRankedCandidates(id);

  if (jobLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) return <div className="text-slate-500 text-sm">Job not found</div>;

  const hasActive = ranked.some(c => c.assessment_status === "pending" || c.assessment_status === "processing");

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <Link href="/recruiter/jobs">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900">{job.title}</h1>
            <Badge variant={job.status === "open" ? "green" : job.status === "draft" ? "amber" : "gray"}>
              {job.status}
            </Badge>
            {hasActive && <Badge variant="amber" pulse>Assessment running</Badge>}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {job.location} · {job.job_type.replace("_", " ")} · {ranked.length} applicant{ranked.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowWeights(!showWeights)}>
          <Settings className="w-4 h-4" /> Edit Weights
        </Button>
      </div>

      {/* Job details card */}
      <Card className="mb-5">
        <button
          className="w-full flex items-center justify-between text-left"
          onClick={() => setShowDetails(v => !v)}
        >
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-900">Job Details</span>
            <span className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
              <span className="capitalize">{job.job_type.replace("_", " ")}</span>
            </span>
          </div>
          {showDetails
            ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
            : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        </button>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</p>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
            {job.required_skills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.required_skills.map(skill => (
                    <span key={skill} className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Weights panel */}
      {showWeights && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-5">
          <Card>
            <ModalityWeightsForm jobId={id} currentWeights={job.modality_weights} onClose={() => setShowWeights(false)} />
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-0.5 mb-5 bg-white rounded-lg p-1 w-fit border border-slate-200 shadow-sm">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === i ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        {rankLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 0 && <CandidateRankingTable candidates={ranked} jobId={id} mode="composite" />}
            {activeTab === 1 && <CandidateRankingTable candidates={ranked} jobId={id} mode="baseline" />}
            {activeTab === 2 && (
              <div className="p-5">
                <BaselineComparison candidates={ranked} />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
