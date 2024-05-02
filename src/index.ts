import { setFailed, setOutput } from '@actions/core'
import { config } from './config'
import { deleteWorkflowRunLogs } from './action'

async function run() {
  try {
    await deleteWorkflowRunLogs(config)
    setOutput('status', 'success')
  } catch (error: any) {
    setFailed(error.message)
    setOutput('error', error.message)
    setOutput('status', 'failed')
  }
}
run()
