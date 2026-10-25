(function(){
'use strict';
if(window.__mintInviteRoute73||!window.MintPort)return;
var bridge=window.MintPort,code;
try{code=String(bridge.inviteCode(location.href));}catch(e){return;}
if(!/^[0-9]{7,}$/.test(code))return;
window.__mintInviteRoute73=true;
var guarded=false,routers=new WeakSet(),bootURL=new URL(location.href);
function registration(url){return /^https?:$/.test(url.protocol)&&/^\/home\/register\/?$/.test(url.pathname);}
function target(value){
 try{
  var url=new URL(value,location.href);if(!registration(url))return null;
  if(url.origin!==location.origin&&bridge.trusted(url.href)!==true)return null;
  var ids=url.searchParams.getAll('id');
  if(url.pathname==='/home/register'&&ids.length===1&&ids[0]===code&&url.search.indexOf('?id='+code)===0)return url;
  var params=new URLSearchParams();params.append('id',code);
  url.searchParams.forEach(function(value,key){if(key!=='id')params.append(key,value);});
  url.pathname='/home/register';url.search=params.toString();return url;
 }catch(e){return null;}
}
function hasCode(url){return registration(url)&&url.searchParams.getAll('id').length===1&&url.searchParams.get('id')===code;}
// A real document navigation gives the app the code before its router/form is initialized.
var initial=target(location.href);
if(initial&&!hasCode(bootURL)){location.replace(initial.href);return;}
function routeValue(to){
 if(!to||!/^\/home\/register\/?$/.test(to.path||''))return null;
 if(to.path==='/home/register'&&typeof (to.query||{}).id==='string'&&to.query.id===code)return null;
 var query={id:code};Object.keys(to.query||{}).forEach(function(key){if(key!=='id')query[key]=to.query[key];});
 return {path:'/home/register',query:query,hash:to.hash||'',replace:true};
}
window.__mintInviteAttachRouter=function(app){
 var router=app&&app.config&&app.config.globalProperties&&app.config.globalProperties.$router;
 if(!router||typeof router.beforeEach!=='function'||routers.has(router))return;
 routers.add(router);
 try{
  router.beforeEach(function(to){var fixed=routeValue(to);if(fixed)return fixed;});guarded=true;
  var current=router.currentRoute&&(router.currentRoute.value||router.currentRoute),fixed=routeValue(current);
  if(fixed&&typeof router.replace==='function'){var result=router.replace(fixed);if(result&&typeof result.catch==='function')result.catch(function(){});}
 }catch(e){}
};
['pushState','replaceState'].forEach(function(name){
 var original=history[name];
 history[name]=function(state,title,url){
  var corrected=arguments.length>2&&url!=null?target(url):null;
  if(!corrected)return Reflect.apply(original,this,arguments);
  var previous=new URL(location.href);
  var args=Array.prototype.slice.call(arguments);args[2]=corrected.href;
  var result=Reflect.apply(original,this,args);
  // Without a reachable router, reload once on entry so query state is real, not only a displayed URL.
  if(!guarded&&(!registration(previous)||!hasCode(bootURL)))location.replace(corrected.href);
  return result;
 };
});
window.addEventListener('click',function(event){
 if(!event.isTrusted||event.defaultPrevented||event.button>0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 var node=event.target&&event.target.nodeType===1?event.target:event.target&&event.target.parentElement;
 var anchor=node&&node.closest&&node.closest('a[href]');
 if(!anchor||anchor.hasAttribute('download')||anchor.target&&anchor.target!=='_self')return;
 var corrected=target(anchor.href);if(!corrected)return;
 if(registration(new URL(location.href))&&corrected.href===location.href)return;
 event.preventDefault();event.stopImmediatePropagation();location.assign(corrected.href);
},true);
window.addEventListener('popstate',function(){var corrected=target(location.href);if(corrected&&!hasCode(new URL(location.href)))location.replace(corrected.href);});
})();
