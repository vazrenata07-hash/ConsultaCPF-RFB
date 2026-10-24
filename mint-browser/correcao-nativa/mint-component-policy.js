(function(){
'use strict';
if(window.top!==window||window.__mintComponentPolicy2614)return;
var host=location.hostname.toLowerCase();
if(host!=='888pg.cc'&&host.slice(-9)!=='.888pg.cc')return;
window.__mintComponentPolicy2614=true;
var targets=new Set(['_dialogBox_1r6g9_89','_dialogBox_930qf_89']);
var apps=new WeakSet(),states=new WeakMap();
function hasClass(value,depth){
 if(depth>8||!value)return false;
 if(typeof value==='string')return value.split(/\s+/).some(function(token){return targets.has(token);});
 if(Array.isArray(value)){for(var i=0;i<value.length&&i<100;i++)if(hasClass(value[i],depth+1))return true;}
 else if(typeof value==='object'){var keys=Object.keys(value);for(var j=0;j<keys.length&&j<100;j++)if(value[keys[j]]&&hasClass(keys[j],depth+1))return true;}
 return false;
}
function matches(instance){
 var vnode=instance&&instance.vnode;
 return !!(vnode&&(hasClass(vnode.props&&vnode.props.class,0)||hasClass(instance.attrs&&instance.attrs.class,0)));
}
function hasHandler(props,key){
 var value=props&&props[key];
 return typeof value==='function'||Array.isArray(value)&&value.some(function(item){return typeof item==='function';});
}
function emitRegistered(instance,props,event,value,hasValue){
 var key='on'+event.charAt(0).toUpperCase()+event.slice(1);
 if(!hasHandler(props,key)&&!hasHandler(props,key+'Once'))return;
 if(typeof instance.emit!=='function')return;
 try{if(hasValue)instance.emit(event,value);else instance.emit(event);}catch(ignored){}
}
function closed(instance){
 var vnodeProps=instance.vnode&&instance.vnode.props||{},props=instance.props||{},known=false;
 var names=['modelValue','show','visible'];
 for(var i=0;i<names.length;i++){
  var key=names[i],value=Object.prototype.hasOwnProperty.call(vnodeProps,key)?vnodeProps[key]:props[key];
  if(value===true)return false;
  if(value===false)known=true;
 }
 return known;
}
function reset(state){state.notified=false;state.queued=false;state.version++;state.pending=null;}
function veto(instance,state){
 if(closed(instance)){reset(state);return;}
 if(state.notified)return;
 var vnode=instance.vnode;
 if(state.queued&&state.pending===vnode)return;
 state.queued=true;state.pending=vnode;
 var version=++state.version;
 Promise.resolve().then(function(){
  if(version!==state.version)return;
  state.queued=false;
  if(instance.isUnmounted||instance.isUnmounting||instance.vnode!==vnode||!matches(instance)||closed(instance))return;
  state.notified=true;
  var props=vnode.props||{};
  // Registered component events cancel its model/queue without rendering or DOM clicks.
  emitRegistered(instance,props,'update:modelValue',false,true);
  emitRegistered(instance,props,'update:show',false,true);
  emitRegistered(instance,props,'update:visible',false,true);
  emitRegistered(instance,props,'close',undefined,false);
  emitRegistered(instance,props,'closed',undefined,false);
 });
}
function arm(instance){
 if(!instance||!matches(instance)||typeof instance.render!=='function')return;
 var existing=states.get(instance);
 if(existing&&instance.render===existing.wrapper)return;
 var original=instance.render,state={notified:false,queued:false,version:0,pending:null,wrapper:null};
 state.wrapper=function(){
  if(matches(instance)){veto(instance,state);return null;}
  reset(state);return Reflect.apply(original,this,arguments);
 };
 states.set(instance,state);instance.render=state.wrapper;
}
function refreshExisting(instance){
 var state=instance&&states.get(instance),snapshot=instance&&instance.vnode;
 if(!state||!instance.isMounted||instance.isUnmounted||typeof instance.update!=='function')return;
 Promise.resolve().then(function(){
  if(instance.isUnmounted||instance.vnode!==snapshot||instance.render!==state.wrapper||!matches(instance))return;
  veto(instance,state);
  instance.update();
 });
}
function visit(root){
 if(!root)return;
 var stack=[root],seen=new WeakSet(),count=0;
 function add(node){if(node&&typeof node==='object'&&stack.length<500)stack.push(node);}
 while(stack.length&&count<500){
  var vnode=stack.pop();if(!vnode||typeof vnode!=='object'||seen.has(vnode))continue;
  seen.add(vnode);count++;
  var instance=vnode.component;
  if(instance){arm(instance);refreshExisting(instance);add(instance.subTree);}
  if(Array.isArray(vnode.children))for(var i=0;i<vnode.children.length&&i<500;i++)add(vnode.children[i]);
  add(vnode.ssContent);add(vnode.ssFallback);
  if(vnode.suspense){add(vnode.suspense.activeBranch);add(vnode.suspense.pendingBranch);}
 }
}
function hookApp(app,vnode){
 if(!app||typeof app!=='object'||typeof app.mixin!=='function')return;
 if(!apps.has(app)){
  apps.add(app);
  app.mixin({beforeMount:function(){arm(this&&this.$);},beforeUpdate:function(){arm(this&&this.$);}});
  // Previously resolved component options otherwise omit newly registered global hooks.
  if(app._context)app._context.optionsCache=new WeakMap();
  visit(vnode||app._container&&app._container._vnode||app._instance&&app._instance.vnode);
 }
}
function vnodeApp(vnode){
 if(!vnode||typeof vnode!=='object')return null;
 return vnode.appContext&&vnode.appContext.app||vnode.component&&vnode.component.appContext&&vnode.component.appContext.app;
}
function intercept(property,callback){
 var proto=Element.prototype,check=proto;
 while(check){if(Object.getOwnPropertyDescriptor(check,property))return;check=Object.getPrototypeOf(check);}
 try{Object.defineProperty(proto,property,{
  configurable:true,enumerable:false,
  get:function(){return undefined;},
  set:function(value){
   // Preserve the framework's ordinary writable, enumerable own-property assignment.
   Object.defineProperty(this,property,{value:value,writable:true,enumerable:true,configurable:true});
   try{callback(value);}catch(ignored){}
  }
 });}catch(ignored){}
}
intercept('__vue_app__',function(app){hookApp(app);});
intercept('_vnode',function(vnode){var app=vnodeApp(vnode);if(app)hookApp(app,vnode);});
function discover(){
 var roots=document.querySelectorAll('[data-v-app],#app');
 for(var i=0;i<roots.length&&i<20;i++){
  var root=roots[i],vnode=root._vnode,app=root.__vue_app__||vnodeApp(vnode);
  if(app)hookApp(app,vnode);
 }
}
discover();
document.addEventListener('DOMContentLoaded',discover,{once:true});
// Vue private fields vary by build. Initial root mounting can precede app discovery;
// future matching component renders are vetoed without a DOM/CSS/close fallback.
// Component setup may already have requested data; the separate network policy remains.
})();
