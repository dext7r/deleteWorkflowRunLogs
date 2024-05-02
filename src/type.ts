import type { Octokit } from '@octokit/rest'

export interface WorkflowRunLogsProps {
  token: string
  repository?: string
  repo: string
  owner: string
  event?: string
  status?:
    | 'completed'
    | 'action_required'
    | 'cancelled'
    | 'failure'
    | 'neutral'
    | 'skipped'
    | 'stale'
    | 'success'
    | 'timed_out'
    | 'in_progress'
    | 'queued'
    | 'requested'
    | 'waiting'
    | 'pending'
    | undefined
  expire_time: string
  per_page: number
  branch?: string
  octokit?: Octokit
}

export interface WorkflowRunsResponse {
  total_count: number
  workflow_runs: any[]
}
