export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-brand hover:bg-brand-deep',
  secondary: 'border border-line-strong bg-surface-raised text-ink hover:bg-mint',
  ghost: 'text-brand hover:bg-mint',
}

export function buttonCls(variant: ButtonVariant = 'primary', extra = '') {
  return `inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-body font-semibold transition-colors ${BUTTON_STYLES[variant]} ${extra}`
}
