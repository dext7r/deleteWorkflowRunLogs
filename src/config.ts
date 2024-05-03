import { context } from '@actions/github'
import type { WorkflowRunLogsProps } from './type'
import { getInput } from './utils'

export const config: WorkflowRunLogsProps = {
  token: getInput('token'),
  per_page: Number.parseInt(getInput('per_page') || '100', 10),
  expire_time: getInput('expire_time') || '7d',
  status: (getInput('status') as WorkflowRunLogsProps['status']) || 'completed',
  repo: getInput('repo') || context?.repo?.repo,
  owner: getInput('owner') || context?.repo?.owner,
}
