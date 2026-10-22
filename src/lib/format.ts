export function formatNumber(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}
