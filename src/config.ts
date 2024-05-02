import { context } from '@actions/github'
import type { WorkflowRunLogsProps } from './type'
import { getInput } from './utils'

export const config: WorkflowRunLogsProps = {
  token: getInput('GITHUB_TOKEN'),
  repository: getInput('GITHUB_REPOSITORY'),
  per_page: Number.parseInt(getInput('PER_PAGE') || '100', 10),
  expire_time: getInput('EXPIRE_TIME') || '7d',
  status: (getInput('STATUS') as WorkflowRunLogsProps['status']) || 'completed',
  repo: getInput('REPO') || context?.repo?.repo,
  owner: getInput('OWNER') || context?.repo?.owner,
}
