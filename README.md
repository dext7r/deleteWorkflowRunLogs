<h1 align="center">deleteWorkflowRunLogs</h1>
<p>
  <a href="https://www.npmjs.com/package/@dext7r/delete-workflow-run-logs" target="_blank">
    <img alt="Version" src="https://img.shields.io/badge/version-1.0.1-blue.svg?cacheSeconds=2592000">
  </a>
  <a href="https://github.com/dext7r/deleteWorkflowRunLogs/actions/workflows/delete-workflow-run-logs.yml" target="_blank">
    <img alt="GitHub Workflow Status" src="https://github.com/dext7r/deleteWorkflowRunLogs/actions/workflows/delete-workflow-run-logs.yml/badge.svg">
  </a>
  <img src="https://img.shields.io/badge/node-%3E%3D12-blue.svg" />
  <a href="https://github.com/dext7r/deleteWorkflowRunLogs#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/dext7r/deleteWorkflowRunLogs/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/dext7r/deleteWorkflowRunLogs/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

# deleteWorkflowRunLogs

deleteWorkflowRunLogs 是基于[@octokit/rest](https://github.com/octokit/rest.js ) 封装的github action版本。也可使用 [@dext7r/delete-workflow-run-logs](https://www.npmjs.com/@dext7r/delete-workflow-run-logs),在node环境下使用

## action

### 新建一个workflow文件
  ```yaml .github/workflows/delete-workflow-run-logs.yml
  name: Push Notifications

on:
  push:
    branches:
      - main

jobs:
  delete-workflow-run-logs:
    runs-on: ubuntu-latest

    steps:
    - name: Run Push Notifications action
      uses: dext7r/delete-workflow-run-logs@main
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        per_page: 100
        expire_time: 7d
        status: completed
        repo: ${{ github.repository.repo }}
        owner: ${{ github.repository.owner }}
```

## 参数

| 变量名        | 描述                 | 可选值  | 默认值 | 必填  |
|---------------|----------------------|---------|--------|--------|
| token         | GitHub token         |         |        | 是     |
| per_page      | 每页展示的数量         |         | 100    | 否     |
| expire_time   | 过期时间              | <time>d/<time>h/m/y | 7d   | 否     |
| status        | 工作流运行状态          | completed/cancelled/skipped | completed | 否  |
| repo          | 仓库名称              |         |        | 是     |
| owner         | 仓库所有者             |         |        | 是     |
