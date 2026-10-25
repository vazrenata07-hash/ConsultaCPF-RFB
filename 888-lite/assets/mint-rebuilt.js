(function(){
'use strict';
if(window.top!==window||window.__mintRebuilt21)return;
var host=location.hostname.toLowerCase();
if(!window.__mintPortTrusted)return;
window.__mintRebuilt21=1;
// Native settings are injected only on the matching website origin.
function userOptions(){
 var value=window.__mintUserConfig||{},length=Number(value.usernameLength);
 return {usernameEnabled:value.usernameEnabled!==false,
  usernameLength:Number.isInteger(length)&&length>=1&&length<=64?length:15,
  usernameAlphanumeric:value.usernameAlphanumeric!==false,
  passwordEnabled:value.passwordEnabled!==false,
  password:typeof value.password==='string'?value.password:'',
  pinEnabled:value.pinEnabled!==false,
  pin:typeof value.pin==='string'&&/^[0-9]{6}$/.test(value.pin)?value.pin:''};
}
var options=userOptions();
var d=document,tag='data-mint17-ad',style=d.createElement('style');
var security='[class*="captcha" i],[id*="captcha" i],[class*="geetest" i],[class*="yidun" i],[class*="turnstile" i],[class*="hcaptcha" i],[class*="_moreInterception_1s3a2_"]';
var username='',wasRegister=false,visit=0,written=new WeakMap(),passwordWritten=new WeakSet();
// Replace the former catalogue with every explicit dismissal in the 23 October capture.
// Keep the base PIN, account, Mines and GeeTest code below this section unchanged.
var rules=[
 {
  "name": "registration-deposit-promotion",
  "selector": ".ui-dialog._registerRechargeDialog_r9snw_89",
  "child": "._registerRecharge_r9snw_89",
  "close": "._closeIcon_r9snw_102"
 },
 {
  "name": "app-install-promotion",
  "selector": ".ui-dialog._download_1yp2y_89",
  "child": "._content_1yp2y_101",
  "close": ".ui-dialog-close-box__icon"
 },
 {
  "name": "promotional-carousel",
  "selector": ".ui-dialog._modal_203gm_89",
  "child": "._main_1ju3l_89",
  "close": "img._closeBtn_1ju3l_243"
 },
 {
  "name": "slash-wheel-promotion",
  "selector": ".ui-dialog._dialogBox_mwqhm_89._slashDialogBox_mwqhm_99.slash-once-dialog-box",
  "close": ".ui-dialog-close-box__icon"
 },
 {
  "name": "task-invitation-promotion",
  "selector": ".ui-dialog._dialogBox_1r6g9_89",
  "child": "._dialog-container_1r6g9_150",
  "close": ".ui-dialog-close-box__icon",
  "renderVeto": true
 },
 {
  "name": "push-permission-promotion",
  "selector": ".notic-user-tip-warp",
  "child": ".button-warp .web-push-tip-cancel",
  "close": ".web-push-tip-cancel"
 },
 {
  "name": "find-us-install-promotion",
  "selector": ".ui-dialog._find-us_ly0vd_89",
  "child": "._content-box_ly0vd_129",
  "close": ".ui-dialog-close-box__icon"
 },
 {
  "name": "dismissible-floating-promotion",
  "selector": ".float-bar-main ._fastBtn_reqh0_97",
  "child": "img._closeIcon_reqh0_139",
  "close": "img._closeIcon_reqh0_139"
 },
 {
  "name": "captured-verification-close",
  "selector": ".ui-dialog._moreInterception_t9upy_89",
  "child": ".ui-dialog-close-box__icon",
  "close": ".ui-dialog-close-box__icon",
  "explicitCapturedClose": true
 },
 {
  "name": "prize-draw-promotion",
  "selector": ".ui-dialog._dialogBox_930qf_89",
  "child": "._main_19k37_89",
  "close": ".ui-dialog-close-box__icon",
  "renderVeto": true
 }
];
// Install precise signatures at document start; marking/closing still advances the site's popup queue.
var earlyCSS='';
var hasSelector=window.CSS&&typeof CSS.supports==='function'&&CSS.supports('selector(:has(*))');
for(var cssIndex=0;cssIndex<rules.length;cssIndex++){
 var cssRule=rules[cssIndex];
 var keepBonus='div._container_n102k_117._style2_n102k_144';
 if(cssRule.child&&!hasSelector&&!cssRule.renderVeto)continue;
 var guardedChild=cssRule.child&&!cssRule.renderVeto;
 var excludeBonus=hasSelector?':not(:has('+keepBonus+'))':'';
 var cssSelector=cssRule.selector+(guardedChild?':has('+cssRule.child+')':'')+excludeBonus;
 if(cssRule.renderVeto)cssSelector='html:not([data-mint-bonus-active]) '+cssSelector;
 earlyCSS+=cssSelector+','+cssSelector+' *{visibility:hidden!important;pointer-events:none!important}';
 if(hasSelector){
  // :has() cannot nest. Keep the component and child in a single relational selector.
  var overlay='.ui-overlay:has('+cssRule.selector+(guardedChild?' '+cssRule.child:'')+'):not(:has('+keepBonus+'))';
  if(cssRule.renderVeto)overlay='html:not([data-mint-bonus-active]) '+overlay;
  earlyCSS+=overlay+'{visibility:hidden!important;opacity:0!important;background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;pointer-events:none!important}';
 }
}
style.textContent=earlyCSS+'['+tag+'],['+tag+'] *{visibility:hidden!important;pointer-events:none!important}';
function installAdStyle(){if(d.documentElement&&!style.isConnected)d.documentElement.appendChild(style);}
installAdStyle();
if(!style.isConnected){
 var styleObserver=new MutationObserver(function(){installAdStyle();if(style.isConnected)styleObserver.disconnect();});
 styleObserver.observe(d,{childList:true});
}
function protectedDialog(el){
 return !!el.querySelector(security)||el.matches(security)||
 /\babrir\b|b[oô]nus de (?:login|aposta)/i.test(el.textContent||'')||
 !!el.querySelector('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]),textarea');
}
var rememberedAdImages=new Set(),watchedAdImages=new WeakSet();
function rememberAdResources(root){
 var bridge=window.MintAdResources;
 if(!bridge||typeof bridge.remember!=='function'||window.__mintGeeTestPriority===true)return;
 var images=root.querySelectorAll('img');
 for(var i=0;i<images.length&&i<32;i++)observeImage(images[i]);
 function observeImage(image){
  function record(){
   if(window.__mintGeeTestPriority===true||!image.isConnected||!root.hasAttribute(tag)||protectedDialog(root))return;
   if(image.naturalWidth<120||image.naturalHeight<60)return;
   var raw=image.currentSrc||image.src;
   if(!raw||rememberedAdImages.has(raw)||rememberedAdImages.size>=2048)return;
   try{
    var url=new URL(raw,location.href);url.hash='';
    if(!/^https?:$/.test(url.protocol)||!/\.(?:png|jpe?g|webp|avif|gif)$/i.test(url.pathname))return;
    if(/captcha|geetest|geevisit|recaptcha|hcaptcha|turnstile/i.test(url.href))return;
    // Shared media already visible outside promotional containers stays allowed.
    for(var j=0;j<d.images.length;j++){
     var other=d.images[j];
     if(other!==image&&(other.currentSrc||other.src)===raw&&!other.closest('['+tag+']'))return;
    }
    bridge.remember(url.href);rememberedAdImages.add(raw);
   }catch(ignored){}
  }
  if(image.complete)record();
  else if(!watchedAdImages.has(image)){watchedAdImages.add(image);image.addEventListener('load',record,{once:true,passive:true});}
 }
}
var attempts=new WeakMap(),marked=new Set();
function dismiss(root,node,rule,close){
 if(!close||typeof close.click!=='function')return;
 var state=attempts.get(root);
 if(!state||state.control!==close){state={control:close,count:0,last:0};attempts.set(root,state);}
 var now=Date.now();if(state.count>=3||now-state.last<120)return;
 if(!root.isConnected||root.style.display==='none'||!root.getClientRects().length)return;
 if(/leave-active|leave-to|leave-from/.test(root.className+' '+node.className))return;
 state.count++;state.last=now;
 close.click();
 if(state.count<3)setTimeout(schedule,state.count===1?150:500);
}
function filter(){
 if(!d.documentElement)return;
 installAdStyle();
 var current=new Map(),nodes=d.querySelectorAll(ruleSelector),protectedRoots=new WeakMap();
 for(var i=0;i<rules.length;i++){
  var rule=rules[i];
  for(var j=0;j<nodes.length;j++){
   var node=nodes[j];if(!node.matches(rule.selector)||rule.child&&!node.querySelector(rule.child))continue;
   var root=node.closest('.ui-overlay')||node;
   if(root.querySelector('div._container_n102k_117._style2_n102k_144')||typeof window.__mintKeepsBonusDialog==='function'&&window.__mintKeepsBonusDialog(root))continue;
   if(root.style.display==='none'||!root.getClientRects().length)continue;
   if(!protectedRoots.has(root))protectedRoots.set(root,protectedDialog(root));
   if(!rule.renderVeto&&!rule.explicitCapturedClose&&protectedRoots.get(root))continue;
   current.set(root,{node:node,rule:rule,close:node.querySelector(rule.close)});
  }
 }
 marked.forEach(function(root){if(!current.has(root)){root.removeAttribute(tag);attempts.delete(root);marked.delete(root);}});
 current.forEach(function(item,root){if(root.getAttribute(tag)!==item.rule.name)root.setAttribute(tag,item.rule.name);marked.add(root);});
 var controls=new Set();
 current.forEach(function(item,root){
  rememberAdResources(root);
  if(item.rule.renderVeto)return;
  if(!item.close||controls.has(item.close))return;
  controls.add(item.close);dismiss(root,item.node,item.rule,item.close);
 });
}
function register(){return /(?:^|[\/#])register(?:[\/?#]|$)/i.test(location.pathname+location.hash)}
function accountFlow(){return /(?:^|[\/#])(?:register|login|signup|signin|verify|captcha)(?:[\/?#]|$)/i.test(location.pathname+location.hash)}
function randomName(){
 var abc='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'+(options.usernameAlphanumeric?'0123456789':''),s='',a=new Uint8Array(32);
 var limit=256-256%abc.length;
 while(s.length<options.usernameLength){crypto.getRandomValues(a);for(var i=0;i<a.length&&s.length<options.usernameLength;i++)if(a[i]<limit&&(s.length||a[i]%abc.length<52))s+=abc[a[i]%abc.length]}
 return s;
}
function route(){var reg=register();if(reg&&!wasRegister){username=options.usernameEnabled?randomName():'';visit++}wasRegister=reg;return reg}
function write(el,value){
 scanVisibility=null;
 var setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(el,value);
 var input;try{input=new InputEvent('input',{bubbles:true,inputType:'insertReplacementText',data:value});}catch(e){input=new Event('input',{bubbles:true});}
 el.dispatchEvent(input);el.dispatchEvent(new Event('change',{bubbles:true}));
}
function settleRegistration(el){
 if(!el||!el.isConnected||!register())return;
 // The site's mixed phone/account field finalizes its account mode on blur.
 // Run that validation after the replacement, before the user's submit click.
 if(d.activeElement===el)el.blur();
 else{el.dispatchEvent(new FocusEvent('blur'));el.dispatchEvent(new FocusEvent('focusout',{bubbles:true}));}
}

// Withdrawal PIN is independent of the account password. Never submit a form.
var withdrawalPIN=options.pin,pinWritten=new WeakSet(),pinAttempts=new WeakMap(),pinBusy=false,pinGeneration=0,activePINRun=null,pinManualControl=false;
var pinWidgets='.ui-password-input,.van-password-input';
var pinKeys='.ui-number-keyboard,.van-number-keyboard';
var scanVisibility=null;
function visible(el){
 if(!el)return false;
 if(scanVisibility&&scanVisibility.has(el))return scanVisibility.get(el);
 var result=false;
 if(el.getClientRects().length){var computed=getComputedStyle(el);result=computed.visibility!=='hidden'&&computed.display!=='none';}
 if(scanVisibility)scanVisibility.set(el,result);
 return result;
}
function withdrawalContext(el){
 if(el.closest(security))return false;
 var meta=[el.name,el.id,el.placeholder,el.getAttribute('aria-label')].join(' ');
 if(/captcha|otp|one.time|sms|c[oó]digo/i.test(meta))return false;
 if(/(?:withdraw|saque).*(?:pass|senha|pin)|(?:pass|senha|pin).*(?:withdraw|saque)/i.test(meta))return true;
 var area=el.closest('[role="dialog"],.ui-dialog,.ui-popup,.van-dialog,.van-popup');
 var text=(area||d.body).textContent||'';
 if(!/senha\s+(?:de |para (?:o )?)?saque/i.test(text))return false;
 return !!area||/(?:^|[\/#])(?:security|withdraw)(?:[\/?#]|$)/i.test(location.pathname+location.hash);
}
function pinInput(el,isWithdrawal){
 if(!isWithdrawal)return false;
 var meta=[el.name,el.id,el.placeholder,el.autocomplete,el.getAttribute('aria-label')].join(' ');
 if(/valor|amount|quantia|balance|saldo|cpf|telefone|phone|email|pix|account|conta|username|login/i.test(meta))return false;
 return el.type==='password'||el.maxLength===6||el.maxLength===1||/senha|password|withdraw.?pin|saque.?pin/i.test(meta);
}
function pinStage(el){
 var route=location.pathname+location.hash;
 var area=el.closest('[role="dialog"],.ui-dialog,.ui-popup,.van-dialog,.van-popup')||el.closest('form');
 var local=area&&area!==d.body&&area!==d.documentElement?(area.textContent||''):'';
 var meta=[el.name,el.id,el.placeholder,el.getAttribute('aria-label')].join(' ');
 if(/(?:login|account)[ _-]*(?:password|pass)|senha[^.!?\n]{0,25}(?:acesso|login)/i.test(meta)||
    !/saque|retirada|withdraw/i.test(local)&&/senha\s+(?:de\s+)?(?:acesso|login)|(?:login|account)\s*password/i.test(local))return 'account';
 // The setup screen in the supplied capture has two fields under /home/security.
 if(/(?:^|[\/#])(?:security|set[-_]?password|set[-_]?pin)(?:[\/?#]|$)/i.test(route))return 'setup';
 var text=meta+' '+local;
 if(/\b(?:defin(?:a|ir)|configur(?:ar|e)|cri(?:ar|e)|cadastr(?:ar|e))\b[^.!?\n]{0,80}\b(?:senha|pin)\b|\bconfirm(?:ar|e)\b[^.!?\n]{0,40}\bnova\s+senha\b|\brepetir\s+(?:a\s+)?senha\b/i.test(text))return 'setup';
 if(area&&/senha\s+(?:de |para (?:o )?)?saque|withdraw[^\n]{0,30}(?:password|pin)/i.test(text)){
  var fields=area.querySelectorAll(pinWidgets),visibleFields=0;
  for(var i=0;i<fields.length;i++)if(visible(fields[i]))visibleFields++;
  if(visibleFields>=2)return 'setup';
 }
 if(/(?:^|[\/#])(?:withdraw(?:al)?|saque|sacar)(?:[\/?#]|$)/i.test(route))return 'withdrawal';
 // Only a bounded form/dialog can establish verification; nav labels never do.
 if(area&&/\b(?:verific(?:ar|a[cç][aã]o)|ins(?:ira|erir)|digite|inform(?:e|ar)|confirm(?:ar|e))\b[^.!?\n]{0,60}\b(?:senha|pin)\b/i.test(text)&&
    /saque|retirada|withdraw|fundos/i.test(text))return 'withdrawal';
 return 'unknown';
}
function pinTouch(node,type){
 // Touch handlers read touches/changedTouches; plain Event lacks that data.
 var rect=node.getBoundingClientRect(),x=rect.left+rect.width/2,y=rect.top+rect.height/2;
 var point={identifier:1,target:node,clientX:x,clientY:y,pageX:x+scrollX,pageY:y+scrollY,screenX:x,screenY:y,radiusX:1,radiusY:1,rotationAngle:0,force:1};
 try{point=new Touch(point);}catch(unsupported){}
 var active=type==='touchend'?[]:[point],event;
 try{event=new TouchEvent(type,{bubbles:true,cancelable:true,composed:true,touches:active,targetTouches:active,changedTouches:[point]});}
 catch(unsupported){
  event=new Event(type,{bubbles:true,cancelable:true});
  Object.defineProperties(event,{touches:{value:active},targetTouches:{value:active},changedTouches:{value:[point]}});
 }
 node.dispatchEvent(event);
}
function emitKeyboardDigit(keyboard,digit){
 // Use the actual key handler. A standalone Vue 'input' emit can omit the
 // keyboard's model-update/change/completion events used by the form.
 var keys=keyboard.querySelectorAll('.ui-key,.van-key,[role="button"],button');
 for(var i=0;i<keys.length;i++)if(keys[i].textContent.trim()===digit){
  var key=keys[i],vnode=key.__vnode,props=vnode&&vnode.props,caches=[key._vei,key.__vei];
  var click=typeof key.onclick==='function'||props&&(typeof props.onClick==='function'||Array.isArray(props.onClick));
  // Vue versions use either an expando or Symbol('_vei') for DOM listeners.
  if(typeof Object.getOwnPropertySymbols==='function'){
   var symbols=Object.getOwnPropertySymbols(key);
   for(var k=0;k<symbols.length;k++)if(String(symbols[k])==='Symbol(_vei)')caches.push(key[symbols[k]]);
  }
  for(var c=0;c<caches.length;c++)if(caches[c])for(var name in caches[c])if(/^onClick(?:Once|Capture|Passive)*$/.test(name))click=true;
  if(key.tagName==='BUTTON'&&!caches.some(function(events){return events&&Object.keys(events).some(function(name){return /^onTouch/i.test(name);});}))click=true;
  if(click)key.click();
  else{pinTouch(key,'touchstart');pinTouch(key,'touchend');}
  return true;
 }
 return false;
}
function emitSetupKeyboardDigit(keyboard,digit){
 // Prefer the keyboard's own Vue input event: same handler as tapping a key.
 var instance=keyboard.__vueParentComponent;
 for(var n=0;instance&&n<4;n++,instance=instance.parent){
  var name=(instance.type&&(instance.type.name||instance.type.__name))||'';
  var props=instance.vnode&&instance.vnode.props;
  if(/number.?keyboard/i.test(name)&&props&&typeof props.onInput==='function'&&typeof instance.emit==='function'){
   instance.emit('input',digit);return true;
  }
 }
 var keys=keyboard.querySelectorAll('.ui-key,.van-key,[role="button"],button');
 for(var i=0;i<keys.length;i++)if(keys[i].textContent.trim()===digit){
  // Vant-compatible keyboards use touchend, not a synthetic click.
  var key=keys[i];
  key.dispatchEvent(new Event('touchstart',{bubbles:true,cancelable:true}));
  key.dispatchEvent(new Event('touchend',{bubbles:true,cancelable:true}));
  return true;
 }
 return false;
}
function emitPINValue(node,value){
 // Prefer a component's complete-value contract. Do not mutate Vue internals.
 var instance=node.__vueParentComponent;
 for(var n=0;instance&&n<5;n++,instance=instance.parent){
  var props=instance.vnode&&instance.vnode.props,name=(instance.type&&(instance.type.name||instance.type.__name))||'';
  if(!props||typeof instance.emit!=='function')continue;
  if(!/password.?input|number.?keyboard/i.test(name))continue;
  for(var k=0;k<2;k++){
   var event=k?'update:value':'update:modelValue',handler=props['on'+event.charAt(0).toUpperCase()+event.slice(1)];
   if(typeof handler==='function'||Array.isArray(handler)){instance.emit(event,value);return true;}
  }
  // An input event is a key press, not a full-value setter. Never send it a PIN.
 }
 return false;
}
function filledCells(widget){
 var cells=widget.querySelectorAll('li');var count=0;
 for(var i=0;i<cells.length;i++){
  var dot=cells[i].querySelector('i:not([class*="cursor"])');
  if(cells[i].textContent.trim()||dot&&getComputedStyle(dot).display!=='none'&&getComputedStyle(dot).visibility!=='hidden')count++;
 }
 return count;
}
function focusPIN(target){
 var focus=target.querySelector('ul')||target;
 // Open once through the same touch interaction as the visible PIN field.
 pinTouch(focus,'touchstart');pinTouch(focus,'touchend');
}
function focusSetupPIN(target){
 var instance=target.__vueParentComponent;
 for(var n=0;instance&&n<4;n++,instance=instance.parent){
  var name=(instance.type&&(instance.type.name||instance.type.__name))||'',props=instance.vnode&&instance.vnode.props;
  if(/password.?input/i.test(name)&&props&&(typeof props.onFocus==='function'||Array.isArray(props.onFocus))&&typeof instance.emit==='function'){
   instance.emit('focus');return true;
  }
 }
 focusPIN(target);
 return false;
}
function customPIN(){
 if(!options.pinEnabled||!withdrawalPIN||pinBusy||pinManualControl)return;
 var widgets=d.querySelectorAll(pinWidgets),target=null,best=3;
 for(var i=0;i<widgets.length;i++){
  var el=widgets[i];
  if(!visible(el)){pinWritten.delete(el);pinAttempts.delete(el);continue;}
  if(pinWritten.has(el)&&filledCells(el)===0){pinWritten.delete(el);pinAttempts.delete(el);}
  var attempts=pinAttempts.get(el)||0;
  if(!pinWritten.has(el)&&attempts<2&&attempts<best&&withdrawalContext(el)&&pinStage(el)!=='account'&&!el.querySelector('input')&&filledCells(el)===0){target=el;best=attempts;}
 }
 if(!target)return;
 pinBusy=true;pinAttempts.set(target,(pinAttempts.get(target)||0)+1);
 var generation=pinGeneration,run={target:target,phase:pinStage(target),canceled:false};activePINRun=run;
 function current(){return activePINRun===run&&!run.canceled&&options.pinEnabled&&!!withdrawalPIN&&generation===pinGeneration&&target.isConnected&&visible(target)&&withdrawalContext(target);}
 function keyboard(){var boards=d.querySelectorAll(pinKeys);for(var k=0;k<boards.length;k++)if(visible(boards[k]))return boards[k];return null;}
 async function waitFor(test,timeout){
  var end=performance.now()+timeout;
  await Promise.resolve();
  while(current()){
   var result=test();if(result)return result;
   if(performance.now()>=end)return null;
   await new Promise(function(resolve){requestAnimationFrame(resolve);});
  }
  return null;
 }
 function setupTogether(){
  if(!window.__mintPortTrusted||!/^\/home\/security\/?$/.test(location.pathname)||new URLSearchParams(location.search).get('active')!=='5')return null;
  var root=target.closest('[role="dialog"],.ui-dialog,.ui-popup,.van-dialog,.van-popup')||target.closest('form')||d;
  var widgets=root.querySelectorAll(pinWidgets),fields=[],bindings=[];
  for(var i=0;i<widgets.length;i++){
   var field=widgets[i];
   if(visible(field)&&withdrawalContext(field)&&pinStage(field)==='setup'&&!field.querySelector('input'))fields.push(field);
  }
  if(fields.length!==2||fields.indexOf(target)===-1)return null;
  // Production Vue keeps the rendered VNode tree on its mount container.
  // DOM __vueParentComponent links are absent in this site's production build.
  var app=d.getElementById('app'),pending=[app&&app._vnode],seen=new Set(),instances=[],found=0;
  while(pending.length&&found<fields.length){
   var vnode=pending.pop();
   if(!vnode||typeof vnode!=='object'||seen.has(vnode))continue;
   seen.add(vnode);
   if(Array.isArray(vnode)){for(var a=0;a<vnode.length;a++)pending.push(vnode[a]);continue;}
   var component=vnode.component;
   if(component){
    var tree=component.subTree,type=component.type||{},index=tree?fields.indexOf(tree.el):-1;
    if(index!==-1&&!instances[index]&&/password.?input/i.test(type.name||type.__name||'')){instances[index]=component;found++;}
    if(tree)pending.push(tree);
   }
   if(Array.isArray(vnode.children))for(var b=0;b<vnode.children.length;b++)pending.push(vnode.children[b]);
   if(vnode.suspense&&vnode.suspense.activeBranch)pending.push(vnode.suspense.activeBranch);
  }
  if(found!==fields.length)return null;
  // Resolve both native, field-specific setters before updating either model.
  for(var j=0;j<fields.length;j++){
   var field=fields[j];
   if(filledCells(field)!==0||pinWritten.has(field)||(pinAttempts.get(field)||0)>=2)return null;
   var instance=instances[j],api=instance.exposed,binding=null;
   if(!api||typeof api.focus!=='function')api=instance.proxy;
   if(!api||typeof api.focus!=='function')return null;
   var children=instance.subTree.children;
   if(!Array.isArray(children))return null;
   for(var k=0;k<children.length;k++){
    var child=children[k],kind=child&&child.type,props=child&&child.props;
    if(kind&&/number.?keyboard/i.test(kind.name||kind.__name||'')&&props&&typeof props['onUpdate:modelValue']==='function'){
     binding={instance:instance,api:api,focus:api.focus,write:props['onUpdate:modelValue']};break;
    }
   }
   if(!binding||bindings.some(function(previous){return previous.instance===binding.instance;}))return null;
   bindings.push(binding);
  }
  // Both complete values use the original setters in this same synchronous run.
  // Native form updates/completion are preserved; there is no inter-field wait.
  for(var n=0;n<bindings.length;n++){
   if(!current())return fields;
   if(fields[n]!==target)pinAttempts.set(fields[n],(pinAttempts.get(fields[n])||0)+1);
   bindings[n].focus.call(bindings[n].api);
   if(!current())return fields;
   bindings[n].write(withdrawalPIN);
  }
  return fields;
 }
 async function fastSetup(){
  if(!current())return;
  var together=setupTogether();
  if(together){
   await Promise.resolve();
   if(current())for(var i=0;i<together.length;i++)if(filledCells(together[i])===6)pinWritten.add(together[i]);
   return;
  }
  // Activate each field BEFORE filling it. The confirmation field lazily
  // selects its model on focus, just as when the user taps the second field.
  var nativeFocus=focusSetupPIN(target);
  await Promise.resolve();
  if(!current())return;
  if(!nativeFocus)(target.querySelector('ul')||target).click();
  await Promise.resolve();
  if(!current())return;
  if(emitPINValue(target,withdrawalPIN)){
   await Promise.resolve();
   if(current()&&filledCells(target)===6){pinWritten.add(target);return;}
  }
  var board=await waitFor(keyboard,1000);if(!board||!current())return;
  if(filledCells(target)===0&&emitPINValue(board,withdrawalPIN)){
   await Promise.resolve();
   if(current()&&filledCells(target)===6){pinWritten.add(target);return;}
  }
  var count=filledCells(target);
  while(count<6&&current()){
   board=keyboard();if(!board)return;
   if(!emitSetupKeyboardDigit(board,withdrawalPIN[count]))return;
   var previous=count;
   var acknowledged=await waitFor(function(){return filledCells(target)>previous;},500);
   if(!acknowledged)return;
   var updated=filledCells(target);if(updated!==previous+1)return;count=updated;
  }
  if(current()&&count===6)pinWritten.add(target);
 }
 async function nativeKeys(){
  // Preserve per-digit native key handling; use the page-specific interval.
  if(!current())return;
  focusPIN(target);
  await Promise.resolve();
  if(!current())return;
  if(!keyboard())(target.querySelector('ul')||target).click();
  var board=await waitFor(keyboard,1000);if(!board||!current()||filledCells(target)!==0)return;
  var verificationArea=target.closest('[role="dialog"],.ui-dialog,.ui-popup,.van-dialog,.van-popup')||target.closest('form');
  var verificationDelay=run.phase==='withdrawal'&&window.__mintPortTrusted&&
   /^\/home\/withdraw\/?$/.test(location.pathname)&&/verificar\s+senha\s+de\s+saque/i.test((verificationArea||d.body).textContent||'');
  var verificationDigitDelay=new URLSearchParams(location.search).get('active')==='20'?0.1:5;
  var count=0;
  while(count<6&&current()){
   board=keyboard();if(!board||filledCells(target)!==count)return;
   if(!emitKeyboardDigit(board,withdrawalPIN[count]))return;
   var previous=count;
   await Promise.resolve();
   var acknowledged=await waitFor(function(){return filledCells(target)>previous;},500);
   if(!acknowledged)return;
   var updated=filledCells(target);if(updated!==previous+1)return;count=updated;
   if(verificationDelay&&count<6)await new Promise(function(resolve){setTimeout(resolve,verificationDigitDelay);});
  }
  await Promise.resolve();
  if(current()&&count===6&&filledCells(target)===6)pinWritten.add(target);
 }
 async function fill(){
  try{if(run.phase==='setup')await fastSetup();else await nativeKeys();}
  catch(error){/* Leave incompatible widgets to the user. Never submit here. */}
  finally{
   // A canceled run must not unlock or continue a newer run on another field.
   if(activePINRun===run){activePINRun=null;pinBusy=false;if(!pinManualControl&&(run.phase==='setup'||pinWritten.has(target)))Promise.resolve().then(customPIN);}
  }
 }
 fill();
}
function cancelPINForUser(event){
 if(!event.isTrusted||!activePINRun)return;
 var run=activePINRun;run.canceled=true;
 pinAttempts.set(run.target,2);activePINRun=null;pinBusy=false;pinManualControl=true;
 // Physical interaction takes control, including manual keypad presses.
 // Let the normal handler run; no event is swallowed or redirected.
}
['pointerdown','touchstart'].forEach(function(type){d.addEventListener(type,cancelPINForUser,true);});
function settlePINInput(el){
 if(pinStage(el)!=='withdrawal')return;
 var generation=pinGeneration,value=el.value;
 Promise.resolve().then(function(){
  if(generation!==pinGeneration||!options.pinEnabled||!el.isConnected||el.value!==value||!withdrawalContext(el)||pinStage(el)!=='withdrawal')return;
  el.dispatchEvent(new Event('change',{bubbles:true}));
  if(d.activeElement===el)el.blur();
  else{el.dispatchEvent(new FocusEvent('blur'));el.dispatchEvent(new FocusEvent('focusout',{bubbles:true}));}
 });
}
function autofill(){
 var previous=scanVisibility;scanVisibility=new WeakMap();
 try{autofillPass();}finally{scanVisibility=previous;}
}
function autofillPass(){
 var reg=route();
 // No form scan or layout reads when no active feature can fill this route.
 if(!(options.usernameEnabled&&reg)&&!(options.passwordEnabled&&options.password)&&!(options.pinEnabled&&withdrawalPIN))return;
 var all=d.querySelectorAll('input'),first=null,named=null,segments=[];
 for(var i=0;i<all.length;i++){
  var el=all[i],meta=[el.name,el.id,el.placeholder,el.autocomplete,el.getAttribute('aria-label')].join(' ').toLowerCase();
  if(!visible(el)){pinWritten.delete(el);passwordWritten.delete(el);continue;}
  if(el.disabled||el.readOnly||el.closest(security)||/captcha|otp|one.time|sms/.test(meta))continue;
  // Reuse only while classifying this input, before any DOM writes or events.
  var isWithdrawal=withdrawalContext(el);
  if(isWithdrawal&&pinStage(el)==='account')isWithdrawal=false;
  var isPIN=pinInput(el,isWithdrawal);
  if(/verifica/.test(meta)&&!isPIN)continue;
  if(isPIN){
   if(!options.pinEnabled||!withdrawalPIN)continue;
   if(el.maxLength===1){segments.push(el);continue;}
   if(!el.value){pinWritten.add(el);write(el,withdrawalPIN);settlePINInput(el);}continue;
  }
  if(isWithdrawal)continue;
  if(el.type==='password'||/senha|password/.test(meta)){
   if(options.passwordEnabled&&options.password&&!el.value){passwordWritten.add(el);write(el,options.password)}continue;
  }
  if(!reg||!/^(text|tel|email|number)$/.test(el.type)||/cpf|c[oó]digo|code|convite|invite|search|busca|confirma/.test(meta))continue;
  if(!first)first=el;
  if(!named&&/conta|account|usu[aá]rio|username|user.?name/.test(meta))named=el;
 }
 // Only complete groups of six empty single-character inputs are PINs.
 for(var j=0;options.pinEnabled&&withdrawalPIN&&j+5<segments.length;j+=6){
  var group=segments.slice(j,j+6);
  if(group.every(function(e){return !e.value;})){group.forEach(function(e,k){pinWritten.add(e);write(e,withdrawalPIN[k]);settlePINInput(e);});}
 }
 scanVisibility=null;
 customPIN();
 var target=named||first;
 if(options.usernameEnabled&&reg&&target&&written.get(target)!==visit){
  if(!username)username=randomName();
  if(target.type==='email'||target.type==='number')target.type='text';
  target.setAttribute('inputmode','text');written.set(target,visit);write(target,username);
  Promise.resolve().then(function(){settleRegistration(target);});
 }
}

// Animation styles and SVG/Lottie updates do not change the ad rules.
// Only structural changes involving known dialogs or inputs trigger searches.
var ruleSelector=rules.map(function(rule){return rule.selector;}).join(',');
var queued=false,busy=false,filterDirty=true,formDirty=true;
function run(){
 if(busy||window.__mintGeeTestPriority===true)return;busy=true;
 var f=filterDirty,a=formDirty;filterDirty=false;formDirty=false;
 try{if(f)filter();if(a)autofill();}finally{busy=false;}
}
function queue(){if(!queued){queued=true;Promise.resolve().then(function(){queued=false;run();});}}
function schedule(){filterDirty=true;queue();}
function inspectNode(node){
 if(!node||node.nodeType!==1)return;
 if(node.namespaceURI==='http://www.w3.org/2000/svg')return;
 if(!filterDirty&&(node.matches(ruleSelector)||node.querySelector(ruleSelector)))filterDirty=true;
 if(!formDirty&&(node.matches('input,'+pinWidgets+','+pinKeys)||node.querySelector('input,'+pinWidgets+','+pinKeys)))formDirty=true;
}
new MutationObserver(function(ms){
 if(window.__mintGeeTestPriority===true){filterDirty=true;formDirty=true;return;}
 // Inspection only turns dirty flags on; once both are set, scans are queued.
 if(filterDirty&&formDirty){queue();return;}
 var addedRoots=new Set();
 for(var i=0;i<ms.length;i++){
  var m=ms[i],target=m.target.nodeType===1?m.target:m.target.parentElement;
  if(!target||target===style||target.namespaceURI==='http://www.w3.org/2000/svg')continue;
  if(m.type==='attributes'){
   if(!formDirty&&target.matches('input'))formDirty=true;
   if(!formDirty&&!pinBusy&&target.closest(pinWidgets))formDirty=true;
   if(!formDirty&&(m.attributeName==='style'||m.attributeName==='class')&&
      (target.matches(pinWidgets+','+pinKeys)||target.matches('.ui-popup,.ui-dialog,.van-popup,.van-dialog')&&target.querySelector('input,'+pinWidgets)))formDirty=true;
   if(!filterDirty&&m.attributeName==='style'&&(target.matches(ruleSelector)||target.hasAttribute(tag)))filterDirty=true;
   if(!filterDirty&&m.attributeName==='class'&&(target.matches(ruleSelector)||target.hasAttribute(tag)||target.closest(ruleSelector)||target.closest('['+tag+']')))filterDirty=true;
  }else{
   if(!formDirty&&!pinBusy&&target.closest(pinWidgets))formDirty=true;
   if(!filterDirty&&(target.closest(ruleSelector)||target.closest('['+tag+']')))filterDirty=true;
   if(m.type==='childList'){
    for(var j=0;j<m.addedNodes.length;j++){
     var added=m.addedNodes[j];
     if(added.nodeType===1&&added.isConnected&&added.namespaceURI!=='http://www.w3.org/2000/svg')addedRoots.add(added);
    }
    for(var k=0;!filterDirty&&k<m.removedNodes.length;k++){
     var removed=m.removedNodes[k];
     if(removed.nodeType===1&&(removed.hasAttribute(tag)||removed.matches(ruleSelector)||removed.querySelector(ruleSelector)))filterDirty=true;
    }
   }
  }
  if(filterDirty&&formDirty)break;
 }
 // Inspect the final connected subtree once when a batch includes parent and child.
 if(!filterDirty||!formDirty)addedRoots.forEach(function(node){
  if(filterDirty&&formDirty)return;
  for(var parent=node.parentElement;parent;parent=parent.parentElement)if(addedRoots.has(parent))return;
  inspectNode(node);
 });
 if(filterDirty||formDirty)queue();
}).observe(d,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style','type','name','placeholder','disabled','readonly']});
var lastFormRoute=location.href;
function navigation(){
 route();if(lastFormRoute!==location.href){lastFormRoute=location.href;pinGeneration++;pinBusy=false;activePINRun=null;pinManualControl=false;pinWritten=new WeakSet();pinAttempts=new WeakMap();passwordWritten=new WeakSet();}
 filterDirty=true;formDirty=true;queue();
 // SPA route views may reset their models after pushState has returned.
 requestAnimationFrame(function(){formDirty=true;queue();});
 setTimeout(function(){formDirty=true;queue();},180);
}
['pushState','replaceState'].forEach(function(name){var original=history[name];history[name]=function(){var result=original.apply(this,arguments);navigation();return result;};});
d.addEventListener('focusin',function(e){if(e.target.matches('input')){formDirty=true;queue();}});
d.addEventListener('click',function(e){if(e.target.closest&&e.target.closest(pinWidgets)){
 var widget=e.target.closest(pinWidgets);if(e.isTrusted&&filledCells(widget)===0){pinManualControl=false;pinAttempts.delete(widget);pinWritten.delete(widget);}
 Promise.resolve().then(function(){formDirty=true;queue();});
}},true);
function prepareRegistration(e){
 if(window.__mintGeeTestPriority===true)return;
 if(!options.usernameEnabled||!register()||!e.target.closest)return;
 var button=e.target.closest('button,[role="button"],input[type="submit"],.ui-button,.van-button');
 if(!button||!/^\s*(?:registro|registrar|registre-se|criar conta|register|sign up)\s*$/i.test(button.textContent||button.value||''))return;
 var inputs=d.querySelectorAll('input');for(var i=0;i<inputs.length;i++)if(written.get(inputs[i])===visit&&visible(inputs[i]))settleRegistration(inputs[i]);
}
['pointerdown','touchstart','mousedown','click'].forEach(function(type){d.addEventListener(type,prepareRegistration,true);});
window.addEventListener('mint-config-change',function(){
 var previous=options;options=userOptions();withdrawalPIN=options.pin;
 pinGeneration++;pinBusy=false;activePINRun=null;pinManualControl=false;pinWritten=new WeakSet();pinAttempts=new WeakMap();
 if(previous.usernameEnabled!==options.usernameEnabled||previous.usernameLength!==options.usernameLength||previous.usernameAlphanumeric!==options.usernameAlphanumeric){
  username='';visit++;written=new WeakMap();
 }
 formDirty=true;queue();
});
window.addEventListener('mint-geetest-priority',function(event){
 if(!event.detail||event.detail.active!==true){filterDirty=true;formDirty=true;queue();}
});
window.addEventListener('hashchange',navigation);window.addEventListener('popstate',navigation);window.addEventListener('load',navigation);
d.addEventListener('DOMContentLoaded',function(){navigation();});
run();
})();

(function(){
'use strict';
// Adapter derived from the captured JDB Mines 9014 protocol and Cocos modules.
// Runs inside the game frame, independently of the main page's ad/autofill code.
if(!/^\/h5\/games\/9\/9014\//.test(location.pathname)||window.__mintMinesCounter20)return;
if(!/(^|\.)brteachcor\.com$/i.test(location.hostname))return;
window.__mintMinesCounter20=true;
function gameOptions(){
 var value=window.__mintGameConfig||{},rounds=Number(value.historyRounds);
 return {historyEnabled:value.historyEnabled!==false,wagerEnabled:value.wagerEnabled!==false,
  historyRounds:Number.isInteger(rounds)&&rounds>=1&&rounds<=100?rounds:10};
}
var options=gameOptions();
var cc=null,loadingCC=false,proxy=null,panel=null,label=null,total=null,saveFailed=false,stopped=false;
var start=Date.now(),timer=null,store=window.MintWagerCounter;
var pending=new Map(),seen=new Set(),lastRead=0;
function visualPaused(){return document.hidden||window.__mintGeeTestPriority===true;}
// Passive history adapter for JDB Mines 9014. Called by the existing game adapter.
// Never selects cards, sends a game request, changes autoplay, or ranks positions.
function createMinesHistory(getEngine){
 'use strict';
 var key='mint.mines9014.revealed.v21',rows=[],counts=new Array(25).fill(0);
 var visible=false,button=null,view=null,nodes=[],labels=[],currentRound=null,saveTimer=null;
 var storageFailed=false;
 function validId(id){return /^\d{1,24}$/.test(String(id));}
 function validRow(row){
  return row&&validId(row.id)&&Array.isArray(row.mines)&&row.mines.length===25&&
   row.mines.every(function(n){return n===0||n===1;});
 }
 try{
  var saved=JSON.parse(localStorage.getItem(key)||'[]');
  if(Array.isArray(saved))rows=saved.filter(validRow).slice(-100);
 }catch(e){storageFailed=true;}
 function recount(){
  counts.fill(0);
  // Keep up to 100 completed boards, count only the requested latest window.
  for(var row=Math.max(0,rows.length-options.historyRounds);row<rows.length;row++)for(var i=0;i<25;i++)counts[i]+=rows[row].mines[i];
 }
 recount();
 function save(){
  if(saveTimer!==null)clearTimeout(saveTimer);
  saveTimer=setTimeout(function(){
   saveTimer=null;
   try{localStorage.setItem(key,JSON.stringify(rows));storageFailed=false;}catch(e){storageFailed=true;}
   caption();
  },0);
 }
 function caption(){
  if(!button||visualPaused())return;
  var available=Math.min(rows.length,options.historyRounds);
  var text=(visible?'Ocultar':'Histórico')+' · '+available+'/'+options.historyRounds+(storageFailed?' *':'');
  if(button.textContent!==text)button.textContent=text;
  button.setAttribute('aria-pressed',String(visible));
  button.setAttribute('aria-label','Mostrar ou ocultar contagem de bombas das últimas '+options.historyRounds+' rodadas');
  button.title='Bombas reveladas nas últimas '+available+' rodadas'+
   (storageFailed?' · Histórico somente nesta sessão':'');
 }
 function redraw(){
  if(!visible||visualPaused())return;
  for(var i=0;i<labels.length;i++){
   var value=rows.length?String(counts[i]):'—';
   if(labels[i].string!==value)labels[i].string=value;
  }
 }
 function destroyNumbers(){
  nodes.forEach(function(n){if(n&&n.isValid!==false)n.destroy();});nodes=[];labels=[];
 }
 function ensureNumbers(){
  var cc=getEngine();
  if(!cc||!view||!view.cards||view.cards.length!==25)return false;
  if(nodes.length===25&&nodes.every(function(n){return n.isValid!==false;}))return true;
  destroyNumbers();
  try{
   for(var i=0;i<25;i++){
    var card=view.cards[i].node,transform=card.getComponent(cc.UITransform);
    var node=new cc.Node('MintHistoryCount'+i);node.layer=card.layer;node.active=false;
    card.addChild(node);nodes.push(node);
    var box=node.addComponent(cc.UITransform);
    box.setContentSize(transform?transform.width:100,transform?transform.height:100);
    // A child at the card's visual center preserves the game's own index/layout.
    node.setPosition(transform?(0.5-transform.anchorX)*transform.width:0,
     transform?(0.5-transform.anchorY)*transform.height:0,0);
    var label=node.addComponent(cc.Label);label.useSystemFont=true;label.fontFamily='Arial';
    label.fontSize=Math.max(28,Math.min(52,(transform?transform.width:100)*0.48));
    label.lineHeight=label.fontSize+8;label.isBold=true;label.color=new cc.Color(255,255,255,255);
    label.horizontalAlign=1;label.verticalAlign=1;label.overflow=2;label.enableWrapText=false;
    // Share glyphs instead of giving every cell an independent font texture.
    label.cacheMode=2;
    if(cc.LabelOutline){var outline=node.addComponent(cc.LabelOutline);outline.color=new cc.Color(10,24,43,255);outline.width=5;}
    labels.push(label);
   }
  }catch(e){destroyNumbers();return false;}
  return true;
 }
 function toggle(){
  if(!options.historyEnabled)return;
  if(!visible&&!ensureNumbers())return;
  visible=!visible;
  nodes.forEach(function(n){if(n.isValid!==false)n.active=visible;});
  redraw();caption();
 }
 function mount(next){
  if(!options.historyEnabled)return;
  if(!next||!next.gameView||!next.gameView.cards||next.gameView.cards.length!==25)return;
  if(view!==next.gameView){destroyNumbers();view=next.gameView;if(visible){ensureNumbers();nodes.forEach(function(n){n.active=true;});redraw();}}
  if(!button&&document.body){
   button=document.createElement('button');button.type='button';button.id='mint-mines-history';
   button.style.cssText='position:fixed;right:8px;top:8px;z-index:2147483647;padding:9px 12px;border:1px solid #9bb5d0;border-radius:18px;background:#102a43;color:#fff;font:bold 13px Arial;line-height:18px;touch-action:manipulation;pointer-events:auto;';
   button.onclick=function(event){event.stopPropagation();toggle();};
   document.body.appendChild(button);caption();
  }
 }
 function observeBet(data){
  if(!options.historyEnabled)return;
  if(data&&data.spinResult&&data.betResult&&validId(data.betResult.gameSeq))currentRound=String(data.betResult.gameSeq);
 }
 function completed(data,id){
  if(!options.historyEnabled)return;
  // cashoutResponse includes the public final board after wins AND losses.
  // Card.State.OpenMine=4 and Card.State.CoveredMine=7 in the captured version.
  var result=data&&data.gameResult,map=result&&result.map;
  if(!validId(id)||!result||result.bpsGame!=='Mines'||!Array.isArray(map)||map.length!==25)return;
  if(!map.every(function(n){return Number.isInteger(n)&&n>=3&&n<=7;}))return;
  id=String(id);if(rows.some(function(row){return row.id===id;}))return;
  rows.push({id:id,mines:map.map(function(n){return n===4||n===7?1:0;})});
  if(rows.length>100)rows.shift();recount();redraw();caption();save();
 }
 function watch(next){
  if(!options.historyEnabled)return;
  if(!next||typeof next.cashoutRequest!=='function'||next.cashoutRequest.__mintHistory21)return;
  var original=next.cashoutRequest;
  var wrapped=function(){
   var id=currentRound;
   try{var round=this.appData&&this.appData.roundData;if(round&&validId(round.id))id=String(round.id);}catch(e){}
   var result=original.apply(this,arguments);
   // Observe only the existing request; preserve its exact returned promise.
   if(options.historyEnabled&&result&&typeof result.then==='function')result.then(function(data){try{completed(data,id);}catch(e){}},function(){});
   return result;
  };
  wrapped.__mintHistory21=true;try{next.cashoutRequest=wrapped;}catch(e){}
 }
 function configure(){
  recount();
  if(!options.historyEnabled){visible=false;nodes.forEach(function(n){if(n.isValid!==false)n.active=false;});}
  if(button)button.style.display=options.historyEnabled?'':'none';
  redraw();caption();
 }
 return {watch:watch,mount:mount,observeBet:observeBet,configure:configure};
}

var history=createMinesHistory(function(){return cc;});
function amount(milli){return (milli/1000).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
function readTotal(){
 if(!options.wagerEnabled||!store)return;
 try{var data=JSON.parse(store.total());if(!data.error&&Number.isSafeInteger(data.milli)&&data.milli>=0){total=data.milli;lastRead=Date.now();refreshLabel();}}catch(e){}
}
function persist(round,milli){
 if(!options.wagerEnabled)return;
 if(seen.has(round)||!store)return;
 pending.set(round,milli);
 try{
  var data=JSON.parse(store.record('jdb-mines-9014',round,milli));
  if(data.error||!Number.isSafeInteger(data.milli))throw new Error('counter storage');
  pending.delete(round);seen.add(round);total=data.milli;saveFailed=pending.size>0;refreshLabel();
 }catch(e){saveFailed=true;refreshLabel();}
}
function confirmed(data,bet){
 history.observeBet(data);
 if(!options.wagerEnabled)return;
 // Only the first accepted spin includes betResult/gameSeq. Reveals and
 // cashouts are not additional wagers. Creating a board does not charge it.
 if(!data||!data.betResult||!data.spinResult)return;
 var result=data.betResult,round=result.gameSeq;
 if(typeof round==='number'&&!Number.isSafeInteger(round))return;
 round=String(round);
 var milli=Math.round(Number(bet)*1000);
 if(!/^\d{1,24}$/.test(round)||!Number.isSafeInteger(milli)||milli<=0||milli>1000000000)return;
 persist(round,milli);
}
function watchProxy(next){
 history.watch(next);
 if(!next||typeof next.checkRequest!=='function')return;
 if(next.checkRequest.__mintWager20){proxy=next;return;}
 var original=next.checkRequest;
 var wrapped=function(indices,bet){
  var result=original.apply(this,arguments),stake=Number(bet);
  // Return the exact original promise; never change requests, resolutions,
  // error handling, click controls, balance, or autoplay behavior.
  if(result&&typeof result.then==='function')result.then(function(data){try{confirmed(data,stake);}catch(e){}},function(){});
  return result;
 };
 wrapped.__mintWager20=true;
 try{next.checkRequest=wrapped;if(next.checkRequest===wrapped)proxy=next;}catch(e){}
}
function alive(node){return node&&node.isValid!==false;}
function refreshLabel(){
 if(visualPaused()||!label||!alive(label.node))return;
 var value=total===null?'—':'R$ '+amount(total);
 var next='Apostado: '+value+(saveFailed?' *':'');
 if(label.string!==next)label.string=next;
 positionLabel();
}
function positionLabel(){
 if(visualPaused())return;
 try{
  if(!panel||!panel.balance||!label)return;
  var base=panel.balance.node,bt=base.getComponent(cc.UITransform),p=base.position;
  var sx=base.scale.x,sy=base.scale.y;
  var x=p.x+(1-bt.anchorX)*bt.width*sx+12;
  var parent=base.parent,pt=parent.getComponent(cc.UITransform);
  var right=pt?(1-pt.anchorX)*pt.width:340;
  // Reserve space for the existing round ID on the same line, if present.
  var seq=panel.gameSeq&&panel.gameSeq.node;
  if(seq&&seq.parent===parent&&Math.abs(seq.position.y-p.y)<40){var st=seq.getComponent(cc.UITransform);if(st)right=Math.min(right,seq.position.x-st.anchorX*st.width*seq.scale.x-12);}
  var width=Math.max(80,Math.min(330,right-x-8));
  label.node.setPosition(x,p.y,base.position.z);
  var transform=label.node.getComponent(cc.UITransform);transform.setContentSize(width,Math.max(32,(panel.balance.lineHeight||30)*sy));
 }catch(e){}
}
function mount(next){
 if(!options.wagerEnabled)return;
 if(!cc||!next||!next.balance||!alive(next.balance.node))return;
 if(panel===next&&label&&alive(label.node)){positionLabel();return;}
 if(label&&alive(label.node))label.node.destroy();
 panel=next;
 var base=next.balance,node=new cc.Node('MintWagerTotal');node.layer=base.node.layer;
 base.node.parent.addChild(node);
 var transform=node.addComponent(cc.UITransform);transform.setAnchorPoint(0,base.node.getComponent(cc.UITransform).anchorY);
 label=node.addComponent(cc.Label);label.useSystemFont=true;label.fontFamily='Arial';
 label.fontSize=Math.max(14,Math.min(24,base.fontSize*base.node.scale.y));label.lineHeight=label.fontSize+4;
 label.color=base.color.clone();label.horizontalAlign=0;label.verticalAlign=1;
 label.overflow=2;label.enableWrapText=false;
 // Reposition only when balance text/layout changes, never on every frame.
 if(!next.setBalance.__mintWager20){
  var original=next.setBalance;
  var update=function(){var result=original.apply(this,arguments);try{positionLabel();}catch(e){}return result;};
  update.__mintWager20=true;next.setBalance=update;
 }
 refreshLabel();
}
function loadEngine(){
 if(cc||loadingCC||!window.System||typeof System.import!=='function')return;
 loadingCC=true;
 System.import('cc').then(function(module){cc=module;loadingCC=false;tick();},function(){loadingCC=false;});
}
function tick(){
 if(timer){clearTimeout(timer);timer=null;}
 if(stopped||!options.historyEnabled&&!options.wagerEnabled)return;
 var visual=!visualPaused();
 try{
  if(!store)store=window.MintWagerCounter;
  if(visual){if(total===null||Date.now()-lastRead>15000)readTotal();loadEngine();}
  // Initial hook discovery is cheap and remains active even while hidden, so
  // recording does not depend on drawing the labels or loading Cocos helpers.
  if(window.puremvc&&puremvc.Facade){
   var facade=puremvc.Facade.getInstance();
   watchProxy(facade.retrieveProxy('MinesServerProxy'));
   if(visual){var mediator=facade.retrieveMediator('AppMediator');if(mediator){mount(mediator.infoPanel);history.mount(mediator);}}
  }
  pending.forEach(function(value,key){persist(key,value);});
 }catch(e){}
 // Existing request hooks keep recording without a background UI timer.
 if(!visual&&proxy&&pending.size===0)return;
 if((proxy&&(!options.wagerEnabled||label))||Date.now()-start<300000)timer=setTimeout(tick,proxy&&(!options.wagerEnabled||label)?2500:300);
}
function resumeVisuals(){
 if(stopped||visualPaused())return;
 history.configure();refreshLabel();tick();
}
window.addEventListener('pagehide',function(){stopped=true;if(timer){clearTimeout(timer);timer=null;}});
window.addEventListener('pageshow',function(){stopped=false;start=Date.now();resumeVisuals();});
document.addEventListener('visibilitychange',function(){if(document.hidden)tick();else resumeVisuals();});
window.addEventListener('mint-geetest-priority',function(event){if(event.detail&&event.detail.active===true)tick();else resumeVisuals();});
function configureGame(){
 options=gameOptions();history.configure();start=Date.now();
 if(label&&alive(label.node))label.node.active=options.wagerEnabled;
 tick();
}
window.addEventListener('mint-config-change',configureGame);
window.addEventListener('message',function(event){
 var message=event.data;
 if(event.source!==window.parent||!window.__mintPortOriginAllowed(event.origin)||
    !message||message.mintCustomConfig26!==true||!message.gameConfig)return;
 window.__mintGameConfig={historyEnabled:message.gameConfig.historyEnabled!==false,wagerEnabled:message.gameConfig.wagerEnabled!==false,historyRounds:message.gameConfig.historyRounds};
 configureGame();
});
window.addEventListener('resize',positionLabel);
tick();
})();

;
