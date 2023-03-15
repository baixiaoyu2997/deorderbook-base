import dayjs, { Dayjs } from 'dayjs'

export const formatUnixTimestamp = (target: string): Dayjs | undefined => {
  if (target.length === dayjs().unix().toString().length) {
    return dayjs.unix(Number(target))
  } else if (target.length - 3 === dayjs().unix().toString().length) {
    return dayjs(Number(this) / 1000)
  } else {
    return undefined
  }
}

export function formatTimestamp(timestamp: string, prefix = ''): string {
  const now = dayjs().valueOf()
  let duration = Number(timestamp) - now
  if (now.toString().length > timestamp.length) {
    duration = Number(timestamp) * 1000 - now
  }
  if (duration > 0) {
    if (duration < 60000) {
      return `${prefix}${Math.floor(duration / 1000)} s`
    } else if (duration < 3600000) {
      return `${prefix}${Math.floor(duration / 3600000)} m`
    } else if (duration < 86400000) {
      return `${prefix}${Math.floor(duration / 3600000)} hours`
    } else {
      return `${prefix}${Math.floor(duration / 86400000)} days`
    }
  } else {
    return 'Expired'
  }
}
