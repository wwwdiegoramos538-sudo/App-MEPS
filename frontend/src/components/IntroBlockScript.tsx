export function IntroBlockScript() {
  const script = `(function(){try{document.documentElement.classList.add('meps-intro-active');}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
