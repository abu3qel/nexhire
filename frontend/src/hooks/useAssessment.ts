"use client";
import { useQuery } from "@tanstack/react-query";
import { assessmentsApi } from "@/lib/api";
import { Assessment, RankedCandidate } from "@/lib/types";

export function useAssessment(applicationId: string) {
  return useQuery<Assessment>({
    queryKey: ["assessment", applicationId],
    queryFn: async () => {
      const { data } = await assessmentsApi.get(applicationId);
      return data;
    },
    enabled: !!applicationId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "pending" || status === "processing") return 5000;
      return false;
    },
  });
}

export function useRankedCandidates(jobId: string) {
  return useQuery<RankedCandidate[]>({
    queryKey: ["ranked", jobId],
    queryFn: async () => {
      const { data } = await assessmentsApi.getRanked(jobId);
      return data;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasActiveAssessments = data.some(
        (c) => c.assessment_status === "pending" || c.assessment_status === "processing"
      );
      return hasActiveAssessments ? 5000 : false;
    },
  });
}
