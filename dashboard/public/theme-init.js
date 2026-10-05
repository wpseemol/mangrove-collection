// Applies the saved theme before first paint. A file (not inline) so the CSP can forbid inline scripts.
try {
  if (localStorage.getItem('mc-dashboard-theme') === 'light') document.documentElement.classList.remove('dark')
} catch {
  // Storage blocked: keep the default dark theme.
}
