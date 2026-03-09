export type Background = 'traditional' | 'bootcamp' | 'self-taught'
export type Status = 'assessed' | 'pending'

export interface ModalityScores {
  resume: number
  github: number
  linkedin: number
  portfolio: number
}

export interface Candidate {
  id: string
  name: string
  initials: string
  color: string
  role: string
  background: Background
  status: Status
  scores: ModalityScores
  overall: number
  email: string
  githubUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string
}

export interface JobRole {
  id: string
  title: string
  department: string
  description: string
  candidateCount: number
  avgScore: number
  status: 'active' | 'closed'
  createdAt: string
  candidates: Candidate[]
}