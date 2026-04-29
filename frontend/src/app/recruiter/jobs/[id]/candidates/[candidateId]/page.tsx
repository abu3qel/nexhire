"use client";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { useQuery } from "@tanstack/react-query";
import { applicationsApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreBreakdownCard } from "@/components/recruiter/ScoreBreakdownCard";
import { StatusSelector } from "@/components/recruiter/StatusSelector";
import { ApplicationStatus } from "@/lib/types";
import { RAGChatbot } from "@/components/recruiter/RAGChatbot";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";

function CompositeRing({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? "#059669" : pct >= 40 ? "#D97706" : "#DC2626";
  const data = [{ name: "score", value: pct, fill: color }];
  return (
    <div className="relative w-32 h-32">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" data={data} startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "#E2E8F0" }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900">{pct}</span>
        <span className="text-xs text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

export default function CandidateDetailPage() {
  const { id: jobId, candidateId } = useParams<{ id: string; candidateId: string }>();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId") || "";

  const { data: assessment, isLoading: assLoading } = useAssessment(applicationId);
  const { data: application } = useQuery({
    queryKey: ["application", applicationId],
    queryFn: async () => { const { data } = await applicationsApi.get(applicationId); return data; },
    enabled: !!applicationId,
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/recruiter/jobs/${jobId}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Candidate Profile</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-11rem)]">
        {/* Left panel */}
        <div className="flex-[6] min-w-0 lg:overflow-y-auto space-y-5">
          <Card>
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0">
                {assessment?.composite_score != null ? (
                  <CompositeRing score={assessment.composite_score} />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center">
                    <span className="text-blue-600 text-xl font-bold">{candidateId.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-lg font-bold text-slate-900">Candidate Profile</h2>
                  {assessment?.status && (
                    <Badge
                      variant={assessment.status === "completed" ? "green" : assessment.status === "failed" ? "red" : "amber"}
                      pulse={assessment.status === "processing"}
                    >
                      {assessment.status}
                    </Badge>
                  )}
                </div>
                {application && (
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Applied {new Date(application.submitted_at).toLocaleDateString()}
                    </span>
                    <StatusSelector
                      applicationId={applicationId}
                      currentStatus={application.status as ApplicationStatus}
                      jobId={jobId}
                    />
                  </div>
                )}

                {assessment?.composite_score != null && (
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-xs text-slate-400">Composite Score</span>
                      <div className="font-bold text-blue-600 text-xl">{Math.round(assessment.composite_score * 100)}</div>
                    </div>
                    {assessment.baseline_score != null && (
                      <div>
                        <span className="text-xs text-slate-400">Resume-only Baseline</span>
                        <div className="font-bold text-slate-900 text-xl">{Math.round(assessment.baseline_score * 100)}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {assessment?.weights_used && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-2">Weights used in this assessment</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(assessment.weights_used).map(([k, v]) => (
                    <span key={k} className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {k.replace("_", " ")}: {Math.round((v as number) * 100)}%
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {assessment?.resume_details?.llm_summary && (
            <Card>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Profile Summary</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{assessment.resume_details.llm_summary}</p>
            </Card>
          )}

          {assLoading && (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {assessment && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Score Breakdown</h3>
              <ScoreBreakdownCard assessment={assessment} />
            </div>
          )}

          {assessment?.error_log && Object.keys(assessment.error_log).length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <h3 className="text-sm font-semibold text-amber-800 mb-2">Assessment Warnings</h3>
              {Object.entries(assessment.error_log).map(([k, v]) => (
                <div key={k} className="text-xs text-amber-700 mb-1">
                  <span className="font-medium">{k}:</span> {String(v)}
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* Right panel — RAG chatbot */}
        <div className="lg:flex-[4] lg:min-w-[320px] lg:sticky lg:top-0 lg:h-full h-[500px]">
          {applicationId ? (
            <RAGChatbot applicationId={applicationId} />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <p className="text-slate-400 text-sm">No application ID provided</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
