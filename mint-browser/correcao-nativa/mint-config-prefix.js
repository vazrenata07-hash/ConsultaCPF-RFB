(function(){
'use strict';
var host=location.hostname.toLowerCase();
if(host!=='888pg.cc'&&host.slice(-9)!=='.888pg.cc'&&host!=='brteachcor.com'&&host.slice(-15)!=='.brteachcor.com')return;
var config=__MINT_CONFIG__;
var rounds=Number(config.historyRounds);
var game={historyEnabled:config.historyEnabled!==false,wagerEnabled:config.wagerEnabled!==false,historyRounds:Number.isInteger(rounds)&&rounds>=1&&rounds<=100?rounds:10};
if(host==='888pg.cc'||host.slice(-9)==='.888pg.cc'){
 window.__mintUserConfig=config;
 if(window.__mintRebuilt21)window.dispatchEvent(new Event('mint-config-change'));
 var frames=document.querySelectorAll('iframe,frame');
 for(var i=0;i<frames.length;i++)try{frames[i].contentWindow.postMessage({mintCustomConfig26:true,gameConfig:game},'*');}catch(error){}
}else{
 window.__mintGameConfig=game;
 if(window.__mintMinesCounter20)window.dispatchEvent(new Event('mint-config-change'));
}
})();
;
