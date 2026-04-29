export type UserRole = "recruiter" | "candidate";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  company_name?: string;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

export type JobType = "full_time" | "part_time" | "contract" | "internship";
export type JobStatus = "open" | "closed" | "draft";

export interface ModalityWeights {
  resume: number;
  cover_letter: number;
  github: number;
  stackoverflow: number;
  portfolio: number;
}

export interface Job {
  id: string;
  recruiter_id: string;
  title: string;
  description: string;
  required_skills: string[];
  location: string;
  job_type: JobType;
  status: JobStatus;
  modality_weights: ModalityWeights;
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus = "submitted" | "under_review" | "shortlisted" | "rejected";
export type AssessmentStatus = "pending" | "processing" | "completed" | "failed";

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  resume_path: string;
  cover_letter_path?: string;
  github_url?: string;
  stackoverflow_url?: string;
  portfolio_url?: string;
  submitted_at: string;
}

export interface ResumeDetails {
  extracted_skills: string[];
  education: Array<{ institution: string; degree: string; year?: string }>;
  experience: Array<{ company: string; role: string; duration?: string; description?: string }>;
  certifications: string[];
  semantic_similarity: number;
  llm_summary: string;
}

export interface CoverLetterDetails {
  clarity_score: number;
  motivation_score: number;
  relevance_score: number;
  llm_feedback: string;
}

export interface GitHubDetails {
  repo_count: number;
  total_commits: number;
  top_languages: Record<string, number>;
  avg_complexity?: number;
  halstead_volume?: number;
  contribution_score: number;
  quality_score: number;
  repos_analysed: string[];
}

export interface StackOverflowDetails {
  reputation: number;
  top_tags: string[];
  answer_count: number;
  acceptance_rate: number;
  badge_counts: { gold: number; silver: number; bronze: number };
}

export interface PortfolioDetails {
  projects_found: number;
  technologies: string[];
  complexity_score: number;
  relevance_score: number;
  llm_summary: string;
}

export interface Assessment {
  id: string;
  application_id: string;
  status: AssessmentStatus;
  resume_score?: number;
  cover_letter_score?: number;
  github_score?: number;
  stackoverflow_score?: number;
  portfolio_score?: number;
  composite_score?: number;
  baseline_score?: number;
  resume_details?: ResumeDetails;
  cover_letter_details?: CoverLetterDetails;
  github_details?: GitHubDetails;
  stackoverflow_details?: StackOverflowDetails;
  portfolio_details?: PortfolioDetails;
  weights_used?: ModalityWeights;
  error_log?: Record<string, string>;
  completed_at?: string;
}

export interface RankedCandidate {
  application_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  resume_score?: number;
  cover_letter_score?: number;
  github_score?: number;
  stackoverflow_score?: number;
  portfolio_score?: number;
  composite_score?: number;
  baseline_score?: number;
  assessment_status: AssessmentStatus;
  application_status: ApplicationStatus;
  rank?: number;
  baseline_rank?: number;
  rank_change?: number;
}

export interface RAGMessage {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}
