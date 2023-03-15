import Big from 'big.js'
import { Fraction } from '@uniswap/sdk'
import { numberFormat } from '~/utils/index'

export function number(number: number | string | Big): string {
  if (Big(number).gte(10000)) {
    return new Fraction(
      Big(number).mul(1e18).toFixed(0),
      (1e18).toString()
    ).toFixed(2)
  } else if (Big(number).gte(1000)) {
    return new Fraction(
      Big(number).mul(1e18).toFixed(0),
      (1e18).toString()
    ).toSignificant(6)
  } else if (Big(number).gte(100)) {
    return new Fraction(
      Big(number).mul(1e18).toFixed(0),
      (1e18).toString()
    ).toSignificant(7)
  } else if (Big(number).gte(10)) {
    return new Fraction(
      Big(number).mul(1e18).toFixed(0),
      (1e18).toString()
    ).toSignificant(7)
  } else {
    return new Fraction(
      Big(number).mul(1e18).toFixed(0),
      (1e18).toString()
    ).toSignificant(8)
  }
}

export const formatPercentage = (target: string, prefix?: string): string => {
  if (target === '') {
    return '0%'
  }
  const originalValue = Big(target)
  if (originalValue.gt(10000)) {
    return '> 10,000%'
  } else if (originalValue.lt(0.01)) {
    return '< 0.01%'
  } else {
    return `${numberFormat(originalValue.toFixed(2))}%`
  }
}
