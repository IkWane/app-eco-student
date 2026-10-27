// Pose data-theme sur <html> d'après prefers-color-scheme et suit son changement (F12).
export function initTheme(): void {
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  const apply = () => {
    document.documentElement.dataset.theme = query.matches ? 'dark' : 'light'
  }
  apply()
  query.addEventListener('change', apply)
}
