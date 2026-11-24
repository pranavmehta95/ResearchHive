// Theme-aware colors for Recharts (which don't understand CSS variables).
export function chartColors(theme) {
  const dark = theme !== 'light'
  return {
    grid: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    gridFaint: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    axis: dark ? '#94a3b8' : '#475569',
    tooltip: dark
      ? {
          background: '#141416',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '0.75rem',
          color: '#fff',
        }
      : {
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '0.75rem',
          color: '#18181b',
        },
    // Ordered from strongest to weakest series color
    radar: dark
      ? ['#fafafa', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b']
      : ['#18181b', '#3f3f46', '#52525b', '#71717a', '#a1a1aa'],
  }
}
