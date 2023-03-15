export const useI18n = () => {
  const locale = ref('en')
  return {
    locale,
  }
}
export const useLocalePath = () => {
  return (v) => {
    return v
  }
}
export const useSwitchLocalePath = () => {
  return () => {}
}
