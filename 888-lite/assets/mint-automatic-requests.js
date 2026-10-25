(function(){
'use strict';
if(window.top!==window||window.__mintAutomaticRequests2613)return;
var host=location.hostname.toLowerCase();
if(!window.__mintPortTrusted)return;
window.__mintAutomaticRequests2613=true;
var endpointHost='cdnapiif.ppa888pg.vip';
var paths=new Set([
 '/hall/api/active/tasks/newcomer_benefit_pop',
 '/hall/api/active/coupon/popList',
 '/hall/api/active/popRegressActive',
 '/hall/api/active/cutADeal/cut_a_deal_announcement'
]);
var bridge=window.MintAutomaticRequests,intent=null,lastPointer=null;
var controlSelector='button,a,[role="button"],.ui-button,.van-button';
var floatingSelector='.fast-entry-item,.float-bar-main [class*="_fastBtn_"],.float-bar-main [class*="floatBtn"]';
var promotion=/\b(?:cupom|cupons|coupon|coupons|bonus|beneficio|beneficios|benefit|benefits|promocao|promocoes|promotion|promotions|oferta|ofertas|offer|offers|convite|convites|convidar|invite|invitation|roleta|roulette|recompensa|recompensas|reward|rewards|presente|presentes|gift|gifts|evento|eventos|event|events|newcomer)\b/;
var dismissal=/\b(?:fechar|feche|close|closed|cancel|cancelar|cancelamento|voltar|back|dismiss|sair|retornar)\b|^(?:x|\u00d7|\u2715|\u2716)$/;
function normalized(value){
 value=String(value||'').slice(0,400).toLowerCase();
 try{return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(e){return value;}
}
function targetElement(event){
 var node=event.target;return node&&node.nodeType===1?node:node&&node.parentElement;
}
function classText(node){return typeof node.className==='string'?node.className:node.className&&node.className.baseVal||'';}
function attributes(node){return [node.getAttribute('aria-label'),node.getAttribute('title'),node.getAttribute('alt')].join(' ');}
function selectedControl(event){
 var target=targetElement(event);if(!target||!target.closest)return null;
 // This exact chest section uses div/image click handlers, without button roles or labels.
 var chest=target.closest('div._inner_14o7p_95');
 if(chest&&!target.closest('[class*="close" i],[class*="cancel" i],[aria-label="Fechar" i]'))return chest;
 var control=target.closest(floatingSelector)||target.closest(controlSelector);
 if(!control)return null;
 if(target.closest('div._container_n102k_117._style2_n102k_144')&&/\babrir\b|\bopen\b/i.test(control.textContent||target.textContent||''))return control;
 // Inspect only the touched control and its own ancestry, never page/body text.
 var node=target;
 for(var depth=0;node&&depth<8;depth++,node=node.parentElement){
  var identity=normalized(classText(node)+' '+attributes(node));
  if(dismissal.test(identity)||/(?:^|[\s_-])(?:close|cancel|back)(?:[\s_-]|[a-z]*icon|btn|button|$)/.test(identity))return null;
  if(node===control)break;
 }
 var label=normalized(attributes(control)+' '+(control.textContent||''));
 if(dismissal.test(label.trim()))return null;
 if(control.matches(floatingSelector))return control;
 if(!promotion.test(label)){
  var image=control.querySelector('img[alt],img[title]');
  if(image)label+=' '+normalized(attributes(image));
 }
 return promotion.test(label)?control:null;
}
function activate(control){intent=control?{expires:Date.now()+5000,used:new Set()}:null;}
function pointer(event){
 if(!event.isTrusted)return;
 var control=selectedControl(event);
 lastPointer={time:Date.now(),control:control,x:event.clientX,y:event.clientY};
 activate(control);
}
function click(event){
 if(!event.isTrusted)return;
 var control=selectedControl(event),elapsed=lastPointer?Date.now()-lastPointer.time:Infinity;
 // A pointerdown/click pair is one physical intention, including long presses.
 if(lastPointer&&event.detail!==0&&elapsed>=0&&elapsed<5000){
  var samePoint=Math.abs(event.clientX-lastPointer.x)<24&&Math.abs(event.clientY-lastPointer.y)<24;
  if(control===lastPointer.control||samePoint)return;
 }
 activate(control);
}
window.addEventListener('pointerdown',pointer,true);
window.addEventListener('click',click,true);
function requestURL(value){
 try{
  if(typeof value!=='string'){
   if(typeof URL==='function'&&value instanceof URL)value=value.href;
   else if(typeof Request==='function'&&value instanceof Request)value=value.url;
   else return null;
  }
  var url=new URL(value,document.baseURI);
  return window.__mintPortApiHost(url.hostname)&&paths.has(url.pathname)?url:null;
 }catch(e){return null;}
}
function permitted(url,method){
 if(!url||method==='OPTIONS')return true;
 var key=url.pathname+'|'+method;
 if(!intent||Date.now()>intent.expires||intent.used.has(key))return false;
 intent.used.add(key);
 try{return !!(bridge&&typeof bridge.permit==='function'&&bridge.permit(url.href,method)===true);}catch(e){return false;}
}
function methodOf(input,options){
 try{
  // Do not evaluate RequestInit getters an extra time or clone a request body.
  var descriptor=options&&Object.getOwnPropertyDescriptor(options,'method');
  if(descriptor&&typeof descriptor.value==='string')return descriptor.value.toUpperCase();
  if(typeof Request==='function'&&input instanceof Request)return input.method.toUpperCase();
 }catch(e){}
 return 'GET';
}
if(typeof window.fetch==='function'){
 var originalFetch=window.fetch;
 window.fetch=function(input,options){
  var url=requestURL(input);
  if(url&&!permitted(url,methodOf(input,options)))return Promise.reject(new DOMException('Automatic promotion request blocked','AbortError'));
  return Reflect.apply(originalFetch,this,arguments);
 };
}
if(typeof XMLHttpRequest==='function'){
 var originalOpen=XMLHttpRequest.prototype.open,originalSend=XMLHttpRequest.prototype.send,requests=new WeakMap();
 XMLHttpRequest.prototype.open=function(method,url){
  var previous=requests.get(this),target=requestURL(url);
  if(target)requests.set(this,{url:target,method:typeof method==='string'?method.toUpperCase():'GET'});
  else requests.delete(this);
  // open may synchronously dispatch readystatechange; metadata must already exist.
  try{return Reflect.apply(originalOpen,this,arguments);}
  catch(error){if(previous)requests.set(this,previous);else requests.delete(this);throw error;}
 };
 XMLHttpRequest.prototype.send=function(){
  var request=requests.get(this);
  if(request&&!permitted(request.url,request.method))throw new DOMException('Automatic promotion request blocked','NetworkError');
  return Reflect.apply(originalSend,this,arguments);
 };
}
// Intent recognition is approximate and limited to the four named endpoints.
// Unknown asynchronous promotion flows may require another explicit user gesture.
// No scripts/timers are cancelled and no account, finance, PIN or game endpoint is modified.
})();
