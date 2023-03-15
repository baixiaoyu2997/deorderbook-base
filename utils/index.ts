import { ElMessage as Message } from 'element-plus'
import { Big } from 'big.js'

Big.NE = -18

export interface NumberFormatOptions {
  [key: string]: unknown
  dp?: number
}
/**
 * @description 转换为千分符格式,内部已经使用useNumberLimit限制数字字符串格式
 * @export
 * @param {(number | string | Big)} num
 * @param {string} [locales='en-US']
 * @param {{ [key: string]: unknown; dp: number }} [option]
 */
export function numberFormat(
  num: number | string | Big,
  locales = 'en-US',
  option?: NumberFormatOptions
) {
  const options = option ?? ({} as any)
  const { dp = 8, ...numberFormatOption } = options
  const bigNum = Big(
    useNumberLimit(Big(num || '0').toFixed() as `${number}`, {
      maxDigitsWithZero: dp,
    }).value
  ).toNumber()
  return new Intl.NumberFormat(locales, {
    ...numberFormatOption,
    maximumFractionDigits: dp,
  }).format(bigNum)
}
export function div18(val: string | number | Big | `${number}`) {
  const newVal = val === '' || val === undefined ? 0 : val
  const x = Big(10).pow(18)
  const y = Big(newVal).div(x).toFixed()
  return y as `${number}`
}
/**
 * @deprecated 弃用，应使用useNotify替代
 */
export const YMessage = {
  success: function (message = 'success', duration = 3000) {
    Message({
      duration,
      customClass: 'msg-success',
      message,
      type: 'success',
    })
  },
  error: function (message = 'error', duration = 3000) {
    Message({
      duration,
      customClass: 'msg-error',
      message,
      type: 'error',
    })
  },
  warning: function (message = 'warning', duration = 3000) {
    Message({
      duration,
      customClass: 'msg-warning',
      message,
      type: 'warning',
    })
  },
  loading: function (message = 'loading', duration = 3000) {
    Message({
      duration,
      customClass: 'msg-loading',
      message,
    })
  },
}

/**
 * @description 判断对象的key和value是否相等
 * @param {Object} obj1
 * @param {Object} obj2
 * @return boolean true/false
 */
export function objectEqual(a: any, b: any): boolean {
  if (a === b) return true

  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()

  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object'))
    return a === b

  if (a.prototype !== b.prototype) return false

  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length) return false

  return keys.every((k) => objectEqual(a[k], b[k]))
}

export function trimAddr(addr: string): string {
  if (!addr) return '...'
  return `${addr.slice(0, 7)}...${addr.slice(-7)}`
}
