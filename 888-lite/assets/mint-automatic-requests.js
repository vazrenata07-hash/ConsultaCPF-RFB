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
var bridge=window.MintAutomaticRequests,intent=null;
window.addEventListener('click',function(event){
 if(event.isTrusted)intent={expires:Date.now()+5000};
},true);
function requestURL(value){
 try{
  if(typeof value!=='string'){
   if(typeof URL==='function'&&value instanceof URL)value=value.href;
   else if(typeof Request==='function'&&value instanceof Request)value=value.url;
   else return null;
  }
  var url=new URL(value,document.baseURI);
  return /^https?:$/.test(url.protocol)&&paths.has(url.pathname)?url:null;
 }catch(e){return null;}
}
function permitted(url,method){
 if(!url||method==='OPTIONS')return true;
 if(!intent||Date.now()>intent.expires)return false;
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
// Any trusted click temporarily permits the four known filtered API paths.
// Time correlation is approximate; simultaneous automatic requests may also pass.
// No scripts/timers are cancelled and no account, finance, PIN or game endpoint is modified.
})();
