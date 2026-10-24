(function(){
'use strict';
if(window.top!==window||window.__mintRequestDebugger2611)return;
var hostname=location.hostname.toLowerCase();
if(hostname!=='888pg.cc'&&hostname.slice(-9)!=='.888pg.cc')return;
window.__mintRequestDebugger2611=true;
var nativeBridge=window.MintRequestDebugger,requestRules=[],timerRules=[],capture=false;
var sequence=0,metadata=[],recentRequests=[],timerSeen=new Set(),resourceSeen=new Set();
var popupSeen=new WeakSet(),popupCount=0,popupObserver=null,resourceObserver=null,framePending=false;
var pendingNodes=[],nativeRAF=window.requestAnimationFrame;
var popupSelector='.ui-dialog,.ui-popup,.van-popup,.van-dialog,[role="dialog"],.notic-user-tip-warp,.float-bar-main,.float-bar-main .fast-entry-item';
var nativeSetTimeout=window.setTimeout,nativeSetInterval=window.setInterval;
function parsedURL(value){
 try{var url=new URL(value,document.baseURI);return /^(?:https?|wss?):$/.test(url.protocol)?url:null;}catch(e){return null;}
}
function safeURL(value){
 var url=parsedURL(value);if(!url)return '';
 url.username='';url.password='';url.search='';url.hash='';return url.href;
}
function pageURL(){return safeURL(location.href);}
function safeStack(skip){
 var stack='';try{var error=new Error();if(Error.captureStackTrace)Error.captureStackTrace(error,skip||safeStack);stack=String(error.stack||'');}catch(e){}
 return stack.split('\n').filter(function(line){return line!=='Error'&&!/mint-debugger\.js|safeStack|timerSignature|wrapTimer|requestRecord/.test(line);}).slice(0,9).map(function(line){
  return line.replace(/(?:https?|wss?):\/\/[^\s)]+/g,function(value){
   var suffix=value.match(/(:\d+(?::\d+)?)$/),tail=suffix?suffix[1]:'';
   return safeURL(tail?value.slice(0,-tail.length):value)+tail;
  });
 }).join('\n').slice(0,2200);
}
function record(value){
 if(!capture||!nativeBridge||typeof nativeBridge.record!=='function')return null;
 value.id='mdbg-'+(++sequence);value.page=pageURL();value.time=Date.now();
 metadata.push({id:value.id,kind:value.kind,url:value.url||'',signature:value.signature||''});
 if(metadata.length>150)metadata.shift();
 try{nativeBridge.record(JSON.stringify(value));}catch(e){}
 return value.id;
}
function requestMatch(url,method){
 if(!url)return false;
 for(var i=0;i<requestRules.length;i++){
  var rule=requestRules[i];
  if(rule.host===url.hostname.toLowerCase()&&rule.path===url.pathname&&(rule.method==='*'||rule.method===method))return true;
 }
 return false;
}
function requestRecord(api,url,method,blocked){
 if(!capture||!url)return;
 var clean=safeURL(url.href),id=record({kind:'request',api:api,url:clean,method:method,blocked:!!blocked,stack:safeStack()});
 if(id){recentRequests.push({id:id,url:clean});if(recentRequests.length>12)recentRequests.shift();}
}
function inspectRequest(api,value,method){
 var url=parsedURL(value),blocked=requestMatch(url,method);
 requestRecord(api,url,method,blocked);return blocked;
}
function inputURL(input){
 try{
  if(typeof input==='string')return input;
  if(typeof URL==='function'&&input instanceof URL)return input.href;
  if(typeof Request==='function'&&input instanceof Request)return input.url;
 }catch(e){}
 return null;
}
function fetchMethod(input,options){
 try{var descriptor=options&&Object.getOwnPropertyDescriptor(options,'method');
  if(descriptor&&typeof descriptor.value==='string')return descriptor.value.toUpperCase();
  if(typeof Request==='function'&&input instanceof Request)return input.method.toUpperCase();}catch(e){}
 return 'GET';
}
if(typeof window.fetch==='function'){
 var originalFetch=window.fetch;
 window.fetch=function(input,options){
  if(capture||requestRules.length){var url=inputURL(input);
   if(url!==null&&inspectRequest('fetch',url,fetchMethod(input,options)))return Promise.reject(new DOMException('Blocked by Mint request rule','AbortError'));
  }
  return Reflect.apply(originalFetch,this,arguments);
 };
}
if(typeof XMLHttpRequest==='function'){
 var xhrOpen=XMLHttpRequest.prototype.open,xhrSend=XMLHttpRequest.prototype.send,xhrInfo=new WeakMap();
 XMLHttpRequest.prototype.open=function(method,url){
  var result=Reflect.apply(xhrOpen,this,arguments),value=inputURL(url);
  xhrInfo.set(this,{url:value===null?null:parsedURL(value),method:typeof method==='string'?method.toUpperCase():'GET'});
  return result;
 };
 XMLHttpRequest.prototype.send=function(){
  if(capture||requestRules.length){var info=xhrInfo.get(this);
   if(info&&info.url&&inspectRequest('xhr',info.url.href,info.method))throw new DOMException('Blocked by Mint request rule','NetworkError');
  }
  return Reflect.apply(xhrSend,this,arguments);
 };
}
if(navigator&&typeof navigator.sendBeacon==='function'){
 var originalBeacon=navigator.sendBeacon;
 try{navigator.sendBeacon=function(url){
  if(capture||requestRules.length){var value=inputURL(url);if(value!==null&&inspectRequest('beacon',value,'POST'))return false;}
  return Reflect.apply(originalBeacon,this,arguments);
 };}catch(e){}
}
function wrapConstructor(name){
 var Original=window[name];if(typeof Original!=='function')return;
 function Wrapped(url){
  if(!new.target)return Reflect.apply(Original,this,arguments);
  if(capture||requestRules.length){var value=inputURL(url);
   if(value!==null&&inspectRequest(name,value,'GET'))throw new DOMException('Blocked by Mint request rule','SecurityError');
  }
  return Reflect.construct(Original,Array.prototype.slice.call(arguments),new.target===Wrapped?Original:new.target);
 }
 try{Object.setPrototypeOf(Wrapped,Original);Wrapped.prototype=Original.prototype;window[name]=Wrapped;}catch(e){}
}
wrapConstructor('WebSocket');wrapConstructor('EventSource');
if(typeof window.open==='function'){
 var originalOpen=window.open;
 window.open=function(url){
  if(capture||requestRules.length){var value=inputURL(url);if(value!==null&&inspectRequest('window.open',value,'GET'))return null;}
  return Reflect.apply(originalOpen,this,arguments);
 };
}
function hash(value){
 var result=2166136261;
 for(var i=0;i<value.length;i++){result^=value.charCodeAt(i);result=Math.imul(result,16777619);}
 return ('00000000'+(result>>>0).toString(16)).slice(-8);
}
function timerSignature(callback,stack){
 var source='';try{source=Function.prototype.toString.call(callback);}catch(e){}
 return 'timer-'+hash(source+'\n'+stack.split('\n')[0]);
}
function timerMatch(signature){
 if(!signature)return false;
 var host=location.hostname.toLowerCase(),path=location.pathname;
 for(var i=0;i<timerRules.length;i++){
  var rule=timerRules[i];if(rule.host&&rule.host!==host||rule.path&&rule.path!==path)continue;
  if(rule.signatures.indexOf(signature)!==-1)return true;
 }
 return false;
}
function wrapTimer(original,repeat){
 return function scheduledTimer(callback,delay){
  if(!capture&&!timerRules.length)return Reflect.apply(original,this,arguments);
  if(typeof callback!=='function'){
   if(capture){var unsupported='string-'+hash(typeof callback==='string'?callback:typeof callback);
    if(!timerSeen.has(unsupported)&&timerSeen.size<150){timerSeen.add(unsupported);record({kind:'timer',api:repeat?'setInterval':'setTimeout',signature:unsupported,repeat:repeat,delay:typeof delay==='number'?delay:null,unsupported:'string-callback',stack:safeStack(scheduledTimer)});}
   }
   return Reflect.apply(original,this,arguments);
  }
  var signature='',stack='';
  if(capture||timerRules.length){stack=safeStack(scheduledTimer);signature=timerSignature(callback,stack);
   if(capture&&!timerSeen.has(signature)&&timerSeen.size<150){timerSeen.add(signature);record({kind:'timer',api:repeat?'setInterval':'setTimeout',signature:signature,delay:typeof delay==='number'?delay:null,repeat:repeat,stack:stack});}
  }
  var args=Array.prototype.slice.call(arguments);
  args[0]=function(){if(!timerMatch(signature))return Reflect.apply(callback,this,arguments);};
  return Reflect.apply(original,this,args);
 };
}
window.setTimeout=wrapTimer(nativeSetTimeout,false);window.setInterval=wrapTimer(nativeSetInterval,true);
function resource(entry){
 if(!capture||!entry||!entry.name)return;
 var url=parsedURL(entry.name);if(!url)return;
 var key=safeURL(url.href)+'|'+entry.startTime;
 if(resourceSeen.has(key))return;
 if(resourceSeen.size>=150)resourceSeen.delete(resourceSeen.values().next().value);
 resourceSeen.add(key);
 var clean=safeURL(url.href),id=record({kind:'request',api:'performance',url:clean,method:'*',initiatorType:String(entry.initiatorType||'resource'),stack:'',correlationOnly:true});
 if(id){recentRequests.push({id:id,url:clean});if(recentRequests.length>12)recentRequests.shift();}
}
function popup(node){
 if(!capture||popupCount>=150||!node||node.nodeType!==1||popupSeen.has(node))return;
 popupSeen.add(node);popupCount++;
 var names=typeof node.className==='string'?node.className.split(/\s+/).filter(function(name){return /^[a-zA-Z0-9_-]{1,90}$/.test(name);}).slice(0,8):[];
 var selector=node.tagName.toLowerCase()+(names.length?'.'+names.join('.'):'');
 var images=[],nodes=node.querySelectorAll('img');
 for(var i=0;i<nodes.length&&images.length<12;i++){var url=safeURL(nodes[i].currentSrc||nodes[i].getAttribute('src')||'');if(url&&images.indexOf(url)===-1)images.push(url);}
 record({kind:'popup',selector:selector,assets:images,recentRequests:recentRequests.slice(-8),correlationOnly:true,appearance:'dom-attached'});
}
function scanNode(node){
 if(!node||node.nodeType!==1)return;
 if(node.matches(popupSelector))popup(node);
 var matches=node.querySelectorAll(popupSelector);
 for(var i=0;i<matches.length&&i<40&&popupCount<150;i++)popup(matches[i]);
}
function queueNode(node){
 if(pendingNodes.length<40&&pendingNodes.indexOf(node)===-1)pendingNodes.push(node);
 if(framePending)return;framePending=true;
 Reflect.apply(nativeRAF,window,[function(){framePending=false;var nodes=pendingNodes;pendingNodes=[];if(!capture)return;for(var i=0;i<nodes.length;i++)scanNode(nodes[i]);}]);
}
function startObservers(){
 popupSeen=new WeakSet();popupCount=0;timerSeen.clear();resourceSeen.clear();recentRequests=[];
 if(typeof MutationObserver==='function'){
  popupObserver=new MutationObserver(function(changes){
   if(!capture||popupCount>=150)return;
   var budget=40;
   for(var i=0;i<changes.length&&i<80;i++){
    var change=changes[i];if(change.type==='childList'){for(var j=0;j<change.addedNodes.length&&budget>0;j++,budget--)scanNode(change.addedNodes[j]);}
    else if(change.target.matches&&change.target.matches(popupSelector))queueNode(change.target);
   }
  });
  popupObserver.observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','hidden']});
 }
 if(document.documentElement)queueNode(document.documentElement);
 try{performance.getEntriesByType('resource').slice(-150).forEach(resource);}catch(e){}
 if(typeof PerformanceObserver==='function')try{resourceObserver=new PerformanceObserver(function(list){list.getEntries().forEach(resource);});resourceObserver.observe({entryTypes:['resource']});}catch(e){resourceObserver=null;}
}
function stopObservers(){
 if(popupObserver){popupObserver.disconnect();popupObserver=null;}
 if(resourceObserver){resourceObserver.disconnect();resourceObserver=null;}
 pendingNodes=[];recentRequests=[];
}
function configure(value){
 try{if(typeof value==='string')value=JSON.parse(value);}catch(e){return;}
 if(!value||typeof value!=='object')return;
 var nextCapture=value.capture===true,nextRequests=[],nextTimers=[],rules=Array.isArray(value.rules)?value.rules:[];
 for(var i=0;i<rules.length&&i<500;i++){
  var rule=rules[i];if(!rule||rule.enabled!==true)continue;
  var host=typeof rule.host==='string'?rule.host.toLowerCase():'',path=typeof rule.path==='string'?rule.path:'';
  if(rule.kind==='request'&&host&&path.charAt(0)==='/')nextRequests.push({host:host,path:path,method:typeof rule.method==='string'?rule.method.toUpperCase():'*'});
  else if(rule.kind==='timer'){
   var signatures=Array.isArray(rule.signature)?rule.signature:typeof rule.signature==='string'?[rule.signature]:[];
   signatures=signatures.filter(function(item){return typeof item==='string'&&item.length>0&&item.length<=150;});
   if(signatures.length)nextTimers.push({host:host,path:path,signatures:signatures});
  }
 }
 requestRules=nextRequests;timerRules=nextTimers;
 if(nextCapture===capture)return;
 capture=nextCapture;if(capture)startObservers();else stopObservers();
}
window.addEventListener('mint-debugger-config',function(event){configure(event.detail);});
function refreshConfiguration(){try{if(nativeBridge&&typeof nativeBridge.config==='function')configure(nativeBridge.config());}catch(e){}}
document.addEventListener('DOMContentLoaded',refreshConfiguration);
window.addEventListener('load',refreshConfiguration);
window.addEventListener('pageshow',refreshConfiguration);
refreshConfiguration();
})();
