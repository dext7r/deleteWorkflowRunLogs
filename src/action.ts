import { Octokit } from '@octokit/rest'
// import { context } from '@actions/github'
import type { WorkflowRunLogsProps, WorkflowRunsResponse } from './type'
import { getExpiredTimestamp } from './utils'

/**
 * Scheduler
 */
export class Scheduler {
  max: number // 最大并发数，默认为2
  count: number // 当前并发数
  queue: Array<() => void> // 任务队列
  running: Task[] // 正在运行的任务
  completedCount: number // 已完成的任务数

  /**
   * 构造函数，用于初始化一个限流器实例
   *
   * @param max 最大并发数，默认为2
   */
  constructor(max: number = 2) {
    this.max = max
    this.count = 0
    this.queue = []
    this.running = []
    this.completedCount = 0
  }

  /**
   * 异步添加任务到任务队列中
   *
   * @param task 任务对象
   * @returns Promise<void> 异步操作结果
   */
  async add(task: Task): Promise<void> {
    if (this.count >= this.max)
      await new Promise<void>((resolve) => this.queue.push(resolve)) // 添加任务到队列中

    this.count++
    this.running.push(task) // 添加任务到正在运行的任务列表
    const res = await task.run() // 运行任务
    this.count--
    this.running.splice(this.running.indexOf(task), 1) // 从正在运行的任务列表中移除任务
    this.completedCount++ // 完成任务数加1

    const progress = Math.round(
      (this.completedCount / (this.completedCount + this.queue.length)) * 100,
    ) //  计算进度
    console.log(
      `Progress: ${progress}%: ${this.completedCount} / ${this.completedCount + this.queue.length}`,
    )
    if (this.queue.length) this.queue.shift()?.() // 从队列中取出任务并执行
    return res
  }

  /**
   * 删除工作流日志
   *
   * @param octokit Octokit 实例
   * @param owner 存储库的所有者
   * @param repo 存储库的名称
   * @param workflow_runs 要删除的工作流运行列表
   * @returns Promise<void>
   */
  async deleteWorkflowRuns(
    octokit: Octokit,
    owner: string,
    repo: string,
    workflow_runs: any[],
  ) {
    workflow_runs.forEach(async (run: any) => {
      await this.add(new DeleteTask(octokit, owner, repo, run.id))
    })
  }
}

/**
 * Task 类，用于封装一个异步任务
 */
class Task {
  retry: number // 重试次数 默认为3
  index: number // 任务索引 默认为1

  constructor(index: number) {
    this.retry = 3
    this.index = index + 1
  }

  /**
   * 运行函数，异步执行
   *
   * @returns Promise<void>，表示异步操作完成
   */
  async run(): Promise<void> {
    // const data = await this.handler()
  }

  /**
   * 处理函数
   *
   * @returns 返回一个Promise对象，表示异步操作的结果
   */
  private async handler(): Promise<any> {
    if (this.retry < 1) return Promise.resolve({ data: 'retry limit exceeded' })
    this.retry--
    return Promise.resolve({ data: 'mocked data' })
  }
}

/**
 * DeleteTask 类，用于封装一个删除工作流运行的任务
 */
class DeleteTask extends Task {
  /**
   * 构造函数
   *
   * @param octokit Octokit 实例
   * @param owner 仓库拥有者
   * @param repo 仓库名称
   * @param runId 运行 ID
   */
  constructor(
    private octokit: Octokit,
    private owner: string,
    private repo: string,
    private runId: number,
  ) {
    super(0)
  }

  /**
   * 运行函数，异步删除指定工作流程运行记录
   *
   * @returns Promise<void>，返回Promise对象，表示异步操作的结果
   */
  async run(): Promise<void> {
    try {
      await this.octokit.actions.deleteWorkflowRun({
        owner: this.owner,
        repo: this.repo,
        run_id: this.runId,
      })
    } catch (error) {
      console.error(`Error deleting workflow run ${this.runId}:`, error)
    }
  }
}

/**
 * 获取工作流运行日志
 *
 * @param props 工作流运行日志参数
 * @returns 返回工作流运行响应
 */
export async function getWorkflowRuns(
  props: WorkflowRunLogsProps,
): Promise<WorkflowRunsResponse> {
  const { owner, repo, event, status, per_page, branch, octokit } = props
  let page = 1
  let total_count = 0
  let allWorkflowRuns: any[] = []

  try {
    if (octokit) {
      while (true) {
        const response = await octokit.actions.listWorkflowRunsForRepo({
          owner,
          repo,
          event,
          status,
          per_page,
          branch,
          page,
        })

        const {
          data: { workflow_runs = [] },
        } = response
        allWorkflowRuns = allWorkflowRuns.concat(workflow_runs)
        total_count += workflow_runs.length

        if (workflow_runs.length < per_page) break

        page++
      }

      // 根据过期时间计算过期时间戳
      const expiredTimestamp = getExpiredTimestamp(props.expire_time)

      // 过滤出超过expiredTimestamp的工作流
      const filteredWorkflowRuns = allWorkflowRuns.filter((run) => {
        const runTimestamp = new Date(run.created_at).getTime()
        return runTimestamp > expiredTimestamp
      })

      return { total_count, workflow_runs: filteredWorkflowRuns }
    } else {
      return { total_count: 0, workflow_runs: [] }
    }
  } catch (error) {
    console.error('Error fetching workflow runs:', error)
    throw error
  }
}

/**
 * 删除工作流运行日志
 *
 * @param props 参数对象
 * @returns Promise<void>
 */
export async function deleteWorkflowRunLogs(props: any) {
  const { token, repo, owner, event, status, per_page, branch, expire_time } =
    props
  const octokit = new Octokit({ auth: `token ${token}` })
  try {
    const { total_count, workflow_runs } = await getWorkflowRuns({
      token,
      owner,
      repo,
      event,
      status,
      per_page,
      branch,
      octokit,
      expire_time,
    })
    const scheduler = new Scheduler()
    if (total_count === 0) return
    console.log(`Total workflow runs: ${total_count}`)
    console.log(`workflow_runs length: ${workflow_runs.length}`)
    await scheduler.deleteWorkflowRuns(octokit, owner, repo, workflow_runs)
  } catch (error) {
    console.log(error)
  }
}
