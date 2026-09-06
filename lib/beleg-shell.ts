export const BELEG_SHELL_SCRIPT = `(function(){
  var p=location.pathname;
  if(p==="/"||p==="") document.documentElement.classList.add("beleg");
})();`;

export function isBelegShellPath(pathname: string) {
  return pathname === "/";
}
