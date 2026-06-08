export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem('meps_theme');document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
