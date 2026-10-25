(function(){
'use strict';
var bridge=window.MintPort;if(!bridge)return;
var scope;
try{scope=new Set(JSON.parse(bridge.scope()));}catch(e){return;}
function originOf(value){try{var u=new URL(value,location.href);return /^https?:$/.test(u.protocol)?u.origin.toLowerCase():'';}catch(e){return '';}}
function trusted(value){return scope.has(originOf(value));}
function game(value){try{var u=new URL(value);return /^https?:$/.test(u.protocol)&&/^\/h5\/games\/9\/9014\//.test(u.pathname);}catch(e){return false;}}
var gameMode=game(location.href),allowed=trusted(location.href)&&!gameMode;
window.__mintPortTrusted=allowed;
window.__mintPortOriginAllowed=function(origin){return trusted(origin)||game(origin);};
window.__mintPortApiHost=function(host){host=String(host).toLowerCase();return host==='cdnapiif.ppa888pg.vip'||host.indexOf('cdnapiif.')===0&&trusted('https://'+host);};
if(!allowed&&!game(location.href))return;
var config,raw;try{raw=bridge.config(location.href);config=JSON.parse(raw);}catch(e){return;}
if(window.__mintPortConfigOrigin===location.origin&&window.__mintPortConfigJSON===raw)return;
window.__mintPortConfigOrigin=location.origin;window.__mintPortConfigJSON=raw;
if(allowed){window.__mintUserConfig=config;if(window.__mintRebuilt21)window.dispatchEvent(new Event('mint-config-change'));}
else{window.__mintGameConfig=config;if(window.__mintMinesCounter20)window.dispatchEvent(new Event('mint-config-change'));}
if(allowed){var gameConfig={historyEnabled:config.historyEnabled!==false,historyRounds:config.historyRounds,wagerEnabled:config.wagerEnabled!==false};for(var i=0;i<window.frames.length;i++)try{window.frames[i].postMessage({mintCustomConfig26:true,gameConfig:gameConfig},'*');}catch(e){}}
})();
