import { getInput as getActionInput } from '@actions/core'
import dotenv from 'dotenv'

dotenv.config()
/**
 * 获取环境变量参数
 *
 * @param name 参数名称
 * @returns  参数值
 */
export function getInput(name: string): string {
  // eslint-disable-next-line node/prefer-global/process
  return getActionInput(name) || process.env[name] || ''
}

// 计算过期时间戳的函数
export function getExpiredTimestamp(expireTime: string): number {
  const now = new Date()
  const expiredDate = new Date(now)

  if (expireTime.endsWith('y'))
    expiredDate.setFullYear(
      expiredDate.getFullYear() - Number.parseInt(expireTime),
    )

  if (expireTime.endsWith('m'))
    expiredDate.setMonth(expiredDate.getMonth() - Number.parseInt(expireTime))

  if (expireTime.endsWith('d'))
    expiredDate.setDate(expiredDate.getDate() - Number.parseInt(expireTime))

  if (expireTime.endsWith('h'))
    expiredDate.setHours(expiredDate.getHours() - Number.parseInt(expireTime))

  return expiredDate.getTime()
}
