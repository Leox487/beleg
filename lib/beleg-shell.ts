const APP_PREFIXES = [
  "/dashboard",
  "/v/",
  "/p/",
  "/attest/",
  "/sign-in",
  "/sign-up",
];

export function isBelegShellPath(pathname: string) {
  const path = pathname || "/";
  return !APP_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix));
}

export const BELEG_SHELL_SCRIPT = `(function(){
  var p=location.pathname||"/";
  var app=["/dashboard","/v/","/p/","/attest/","/sign-in","/sign-up"];
  var dark=false;
  for(var i=0;i<app.length;i++){
    if(p===app[i]||p.indexOf(app[i])===0){dark=true;break;}
  }
  if(!dark) document.documentElement.classList.add("beleg");
})();`;
