(function(){
'use strict';
if(window.top!==window||window.__mintRebuilt21)return;
var host=location.hostname.toLowerCase();
if(host!=='888pg.cc'&&host.slice(-9)!=='.888pg.cc')return;
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
var security='[class*="captcha" i],[id*="captcha" i],[class*="geetest" i],[class*="yidun" i],[class*="turnstile" i],[class*="hcaptcha" i]';
var username='',wasRegister=false,visit=0,written=new WeakMap(),passwordWritten=new WeakSet();
// Cosmetic signatures from the 23 October capture replace the prior catalog.
// Only captured native close/cancel controls are used; open/claim controls are untouched.
var rules=[
 {"name":"registration-deposit-promotion","selector":".ui-dialog._registerRechargeDialog_r9snw_89","child":"._registerRecharge_r9snw_89","close":"._closeIcon_r9snw_102"},
 {"name":"app-install-promotion","selector":".ui-dialog._download_1yp2y_89","child":"._content_1yp2y_101","close":".ui-dialog-close-box__icon"},
 {"name":"promotional-carousel","selector":".ui-dialog._modal_203gm_89","child":"._main_1ju3l_89","close":"img._closeBtn_1ju3l_243"},
 {"name":"slash-wheel-promotion","selector":".ui-dialog._dialogBox_mwqhm_89._slashDialogBox_mwqhm_99.slash-once-dialog-box","close":".ui-dialog-close-box__icon"},
 {"name":"task-invitation-promotion","selector":".ui-dialog._dialogBox_1r6g9_89","child":"._dialog-container_1r6g9_150","close":".ui-dialog-close-box__icon"},
 {"name":"push-permission-promotion","selector":".notic-user-tip-warp","child":".button-warp .web-push-tip-cancel","close":".web-push-tip-cancel"},
 {"name":"find-us-install-promotion","selector":".ui-dialog._find-us_ly0vd_89","child":"._content-box_ly0vd_129","close":".ui-dialog-close-box__icon"},
 {"name":"captured-verification-close","selector":".ui-dialog._moreInterception_t9upy_89","child":".ui-dialog-close-box__icon","close":".ui-dialog-close-box__icon","explicitCapturedClose":true},
 {"name":"dismissible-floating-promotion","selector":".float-bar-main ._fastBtn_reqh0_97","child":"img._closeIcon_reqh0_139","close":"img._closeIcon_reqh0_139"}
];
style.textContent='['+tag+'],['+tag+'] *{visibility:hidden!important;pointer-events:none!important}';
function protectedDialog(el){
 return !!el.querySelector(security)||el.matches(security)||
 /\babrir\b|b[oô]nus de (?:login|aposta)/i.test(el.textContent||'')||
 !!el.querySelector('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]),textarea');
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
 // The captured native close control advances the site's popup queue.
 // Never click claim/activate buttons or remove a component's DOM ourselves.
 close.click();
 if(state.count<3)setTimeout(schedule,state.count===1?150:500);
}
function filter(){
 if(!d.documentElement)return;
 if(!style.isConnected)d.documentElement.appendChild(style);
 var current=new Map();
 for(var i=0;i<rules.length;i++){
  var rule=rules[i],nodes=d.querySelectorAll(rule.selector);
  for(var j=0;j<nodes.length;j++){
   var node=nodes[j];if(rule.child&&!node.querySelector(rule.child))continue;
   var root=node.closest('.ui-overlay')||node;
   // Hidden cached dialogs leave the active set so reopening resets close attempts.
   // This exact captured dialog was explicitly dismissed by its native X; never answer its contents.
   if(root.style.display==='none'||!root.getClientRects().length||(!rule.explicitCapturedClose&&protectedDialog(root)))continue;
   current.set(root,{node:node,rule:rule,close:node.querySelector(rule.close)});
  }
 }
 marked.forEach(function(root){if(!current.has(root)){root.removeAttribute(tag);attempts.delete(root);marked.delete(root);}});
 current.forEach(function(item,root){if(root.getAttribute(tag)!==item.rule.name)root.setAttribute(tag,item.rule.name);marked.add(root);});
 // Keep the whitelist of controls separate from all user click handling.
 var controls=new Set();
 current.forEach(function(item,root){if(!item.close||controls.has(item.close))return;controls.add(item.close);dismiss(root,item.node,item.rule,item.close);});
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
function visible(el){
 if(!el||!el.getClientRects().length)return false;
 var computed=getComputedStyle(el);
 return computed.visibility!=='hidden'&&computed.display!=='none';
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
 async function fastSetup(){
  if(!current())return;
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
  // Keep normal keypad handlers, without any fixed typing delay.
  if(!current())return;
  focusPIN(target);
  await Promise.resolve();
  if(!current())return;
  if(!keyboard())(target.querySelector('ul')||target).click();
  var board=await waitFor(keyboard,1000);if(!board||!current()||filledCells(target)!==0)return;
  var count=0;
  while(count<6&&current()){
   board=keyboard();if(!board||filledCells(target)!==count)return;
   if(!emitKeyboardDigit(board,withdrawalPIN[count]))return;
   var previous=count;
   await Promise.resolve();
   var acknowledged=await waitFor(function(){return filledCells(target)>previous;},500);
   if(!acknowledged)return;
   var updated=filledCells(target);if(updated!==previous+1)return;count=updated;
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
 if(busy)return;busy=true;
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
  if(!button)return;
  var available=Math.min(rows.length,options.historyRounds);
  var text=(visible?'Ocultar':'Histórico')+' · '+available+'/'+options.historyRounds+(storageFailed?' *':'');
  if(button.textContent!==text)button.textContent=text;
  button.setAttribute('aria-pressed',String(visible));
  button.setAttribute('aria-label','Mostrar ou ocultar contagem de bombas das últimas '+options.historyRounds+' rodadas');
  button.title='Bombas reveladas nas últimas '+available+' rodadas'+
   (storageFailed?' · Histórico somente nesta sessão':'');
 }
 function redraw(){
  if(!visible)return;
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
 if(!label||!alive(label.node))return;
 var value=total===null?'—':'R$ '+amount(total);
 var next='Apostado: '+value+(saveFailed?' *':'');
 if(label.string!==next)label.string=next;
 positionLabel();
}
function positionLabel(){
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
 if(stopped)return;
 if(timer){clearTimeout(timer);timer=null;}
 try{
  if(!store)store=window.MintWagerCounter;
  if(total===null||Date.now()-lastRead>15000)readTotal();
  loadEngine();
  if(window.puremvc&&puremvc.Facade){
   var facade=puremvc.Facade.getInstance();
   watchProxy(facade.retrieveProxy('MinesServerProxy'));
   var mediator=facade.retrieveMediator('AppMediator');if(mediator){mount(mediator.infoPanel);history.mount(mediator);}
  }
  pending.forEach(function(value,key){persist(key,value);});
 }catch(e){}
 // Constant-size lookups only. Stop startup polling if this version is unsupported.
 if((proxy&&(!options.wagerEnabled||label))||Date.now()-start<300000)timer=setTimeout(tick,proxy&&(!options.wagerEnabled||label)?2500:300);
}
window.addEventListener('pagehide',function(){stopped=true;if(timer)clearTimeout(timer);});
window.addEventListener('pageshow',function(){stopped=false;start=Date.now();tick();});
function configureGame(){
 options=gameOptions();history.configure();
 if(label&&alive(label.node))label.node.active=options.wagerEnabled;
 tick();
}
window.addEventListener('mint-config-change',configureGame);
window.addEventListener('message',function(event){
 var message=event.data;
 if(event.source!==window.parent||!/^https?:\/\/([a-z0-9-]+\.)*(?:888pg\.cc|brteachcor\.com)(?::[0-9]+)?$/i.test(event.origin)||
    !message||message.mintCustomConfig26!==true||!message.gameConfig)return;
 window.__mintGameConfig={historyEnabled:message.gameConfig.historyEnabled!==false,wagerEnabled:message.gameConfig.wagerEnabled!==false,historyRounds:message.gameConfig.historyRounds};
 configureGame();
});
window.addEventListener('resize',positionLabel);
tick();
})();

;
(function () {
 'use strict';
 if (window.__mintGeeTestV22) return;
 Object.defineProperty(window, '__mintGeeTestV22', {value: true});
 const bridge = window.MintGeeTestAndroid;
 if (!bridge || typeof bridge.begin !== 'function') return;
 let busy = false, stopped = false, suppressed = false, hiddenSince = 0, epoch = 0;
 const pending = new Set();
 function alive() { if (stopped || document.hidden) throw Error('paused'); }
 async function sleep(ms) { await new Promise(r => setTimeout(r, ms)); alive(); }
 function visible(el) {
  if (!el || !el.isConnected) return false;
  const r=el.getBoundingClientRect(),s=getComputedStyle(el);
  return r.width>2 && r.height>2 && s.display!=='none' && s.visibility!=='hidden' && Number(s.opacity)!==0;
 }
 function lastVisible(selector) { return Array.from(document.querySelectorAll(selector)).reverse().find(visible); }
 async function native(request) {
  alive(); const id=bridge.begin(JSON.stringify(request));
  if (!id) throw Error('native-busy');
  pending.add(id); const until=Date.now()+90000, generation=epoch;
  try {
   while(Date.now()<until) {
    if(generation!==epoch) throw Error('navigation');
    alive(); const value=bridge.poll(id);
    if(value) { const result=JSON.parse(value); if(!result.ok) throw Error(result.error||'native-operation'); return result; }
    await sleep(16);
   }
   throw Error('native-timeout');
  } finally { pending.delete(id); bridge.cancel(id); }
 }
 const images=new Map(); let imageBytes=0;
 async function imageData(url) {
  alive(); if(!url) throw Error('missing-image');
  if(url.startsWith('data:image/')) return url;
  if(images.has(url)) return images.get(url);
  // Native downloads support GeeTest CDNs, including those without CORS headers.
  // Other image hosts are read only through the page's normal CORS permissions.
  let data;
  try {data=(await native({op:'image',url:new URL(url,location.href).href})).data;}
  catch(error) {
   alive(); const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),8000);
   try {
    const response=await fetch(url,{signal:controller.signal,credentials:'omit'});
    if(!response.ok) throw Error('image-http');
    const blob=await response.blob(); if(blob.size>4*1024*1024||!blob.type.startsWith('image/')) throw Error('image-size-type');
    data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
   } finally {clearTimeout(timer);}
  }
  if(images.size>=40||imageBytes+data.length>8*1024*1024){images.clear();imageBytes=0;}
  images.set(url,data);imageBytes+=data.length;return data;
 }
 let relaySeq=0; const relays=new Map();
 function clearRelays() {for(const waiter of relays.values()){clearTimeout(waiter.timer);waiter.reject(Error('navigation'));}relays.clear();}
 async function gesture(x,y,dx=0,drag=false) {
  alive(); if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(dx))throw Error('coordinates');
  const target=document.elementFromPoint(x,y);
  if(!target || (!target.closest('[class*=geetest_]') && !/^(IFRAME|FRAME)$/.test(target.tagName)))throw Error('covered-challenge');
  if(window===window.top) {
   bridge.gesture(JSON.stringify({x,y,dx,drag})); await sleep(drag?900:100); return;
  }
  const id=String(++relaySeq)+'-'+Math.random().toString(36).slice(2);
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{relays.delete(id);reject(Error('frame-relay-timeout'));},4000);
   relays.set(id,{resolve,reject,timer});
   parent.postMessage({mintGeeTest:22,kind:'gesture',id,x,y,dx,drag},'*');
  });
  alive();
 }
 window.addEventListener('message',async event=>{
  const m=event.data;if(!m||m.mintGeeTest!==22||typeof m.id!=='string'||m.id.length>100)return;
  if(m.kind==='ack') {
   if(event.source!==parent)return;
   const waiter=relays.get(m.id);if(!waiter)return;relays.delete(m.id);clearTimeout(waiter.timer);m.ok?waiter.resolve():waiter.reject(Error('frame-gesture'));return;
  }
  if(m.kind!=='gesture'||![m.x,m.y,m.dx].every(Number.isFinite))return;
  const frame=Array.from(document.querySelectorAll('iframe,frame')).find(f=>f.contentWindow===event.source);
  if(!frame||!visible(frame))return;
  const r=frame.getBoundingClientRect(),sx=r.width/frame.offsetWidth,sy=r.height/frame.offsetHeight;
  if(m.x<0||m.y<0||m.x>=frame.clientWidth||m.y>=frame.clientHeight)return;
  const x=r.left+(frame.clientLeft+m.x)*sx,y=r.top+(frame.clientTop+m.y)*sy;
  if(document.elementFromPoint(x,y)!==frame)return;
  let ok=false;try{await gesture(x,y,m.dx*sx,!!m.drag);ok=true;}catch(error){}
  event.source.postMessage({mintGeeTest:22,kind:'ack',id:m.id,ok},'*');
 });
 function refresh() {const el=lastVisible('[class*=geetest_refresh]');if(!el)return false;el.click();return true;}
 function confirm() {const el=lastVisible('[class*=geetest_submit]');if(!el)return false;el.click();return true;}
 function opened() {return anyPresent()||ninePresent()||clickPresent()||sliderPresent();}
 function ready(selector) {
  return Array.from(document.querySelectorAll(selector)).some(el=>{
   if(!visible(el))return false;
   for(let node=el;node&&node.nodeType===1;node=node.parentElement){
    const s=getComputedStyle(node);
    if(s.visibility==='hidden'||s.display==='none'||Number(s.opacity)===0||s.pointerEvents==='none')return false;
   }
   return true;
  });
 }
 function sliderReady() {
  const bg=lastVisible('[class*=geetest_bg]'),slice=lastVisible('[class*=geetest_slice_bg]');
  return bg&&slice&&ready('[class*=geetest_btn]')&&/url\(/.test(getComputedStyle(bg).backgroundImage)&&/url\(/.test(getComputedStyle(slice).backgroundImage);
 }
 async function infoWhenReady(read) {
  const until=Date.now()+6000;let info=read();
  while(!info.ok&&Date.now()<until){await new Promise(requestAnimationFrame);alive();info=read();}
  return info;
 }
 async function accepted(ms=6000) {
  const until=Date.now()+ms;let closed=0;
  while(Date.now()<until){if(opened())closed=0;else if(!closed)closed=Date.now();else if(Date.now()-closed>=2000)return true;await sleep(250);}
  return false;
 }
 async function solveSlider() {
  for(let attempt=0;attempt<3;attempt++) {
   alive();if(!sliderPresent())return false;
   const result=await runSlider();
   if(String(result).startsWith('ok:')&&await accepted())return true;
   if(attempt<2){if(!refresh())return false;await sleep(1500);}
  }return false;
 }
 function sameNine(info) {if(!ninePresent())return false;const now=nineInfo();return now.ok&&now.sprite===info.sprite&&now.icone===info.icone;}
 async function markNine(targets,info) {
  const desired=new Set(targets);
  for(let pass=0;pass<4;pass++) {
   alive();if(!sameNine(info))return false;
   const marked=nineMarked();if(!marked||marked.length!==9)return false;
   const changes=[];for(let i=0;i<9;i++)if(!!marked[i]!==desired.has(i))changes.push(i);
   if(!changes.length)return true;
   for(const i of changes){if(!sameNine(info))return false;const cell=nineInfo().cels[i];await gesture(cell.x,cell.y);await sleep(280);}
   await sleep(350);
  }return false;
 }
 async function solveNine() {
  let previous='',discarded=0;
  for(let answer=0;answer<5;answer++) {
   alive();let info=await infoWhenReady(nineInfo);
   if(!info.ok||!info.cels||info.cels.length!==9)return false;
   const icon=await imageData(info.icone),sprite=await imageData(info.sprite);
   let result;
   try{result=await native({op:'emotion',icon,sprite,cells:info.cels});}
   catch(error){if(discarded++<3&&sameNine(info)&&refresh()){await sleep(2500);answer--;continue;}throw error;}
   if(!result.emotion)result=await nineScores(icon,sprite,info.cels);
   if(!result.ok||!Array.isArray(result.alvos)||result.alvos.length!==3)return false;
   if(!sameNine(info))return await accepted();
   if(previous===info.sprite&&discarded++<3){if(!refresh())return false;await sleep(2500);answer--;continue;}
   previous=info.sprite;
   if(await markNine(result.alvos,info)){if(sameNine(info))confirm();if(await accepted())return true;}
   else if(!ninePresent())return await accepted();
   await sleep(1200);
  }return false;
 }
 function sameClick(info) {if(!clickPresent())return false;const now=clickInfo();return now.ok&&now.foto===info.foto&&JSON.stringify(now.icones)===JSON.stringify(info.icones);}
 async function solveClick() {
  for(let answer=0;answer<5;answer++) {
   alive();let info=await infoWhenReady(clickInfo);
   if(!info.ok)return false;
   for(let wait=0;clickMarks()>0&&wait<12;wait++)await sleep(500);
   if(clickMarks()>0){if(!refresh())return false;await sleep(2000);continue;}
   const photo=await imageData(info.foto),icons=[];for(const url of info.icones)icons.push(await imageData(url));
   const result=await native({op:'click',photo,icons});
   if(!sameClick(info))return await accepted();
   if(!Array.isArray(result.points)||result.points.length!==icons.length)return false;
   for(let i=0;i<result.points.length;i++) {
    if(!sameClick(info))return await accepted();
    const box=clickInfo().caixa,point=result.points[i];const x=box.x+point.x*box.w/result.width,y=box.y+point.y*box.h/result.height;
    await gesture(x,y);await sleep(800);
    if(clickMarks()>=0&&clickMarks()<i+1&&sameClick(info)){await gesture(x,y);await sleep(800);}
   }
   if(!sameClick(info))return await accepted();
   if(clickMarks()!==result.points.length){if(!refresh())return false;await sleep(2000);continue;}
   confirm();if(await accepted())return true;await sleep(1500);
  }return false;
 }
 async function inspect() {
  if(busy||stopped||document.hidden)return;
  try {
   if(!document.querySelector('[class*=geetest_]')||!opened()) {
    if(!hiddenSince)hiddenSince=Date.now();
    if(Date.now()-hiddenSince>2000)suppressed=false;
    return;
   }
   hiddenSince=0;if(suppressed)return;
   // Start on the first ready DOM state; no fixed opening delay.
   busy=true;
   let result;
   if(ninePresent()&&ready('[class*=geetest_item_img]'))result=await solveNine();
   else if(clickPresent()&&ready('[class*=geetest_bg]'))result=await solveClick();
   else if(sliderPresent()&&sliderReady())result=await solveSlider();
   else return;
   suppressed=true;
   console.info('[Mint GeeTest]',result?'painel fechado':'tentativas encerradas');
  }catch(error){if(!document.hidden&&!stopped){suppressed=true;console.info('[Mint GeeTest] integração indisponível:',error.message);}}
  finally{busy=false;}
 }
 let scheduled=false,appearanceFrame=0,appearanceDeadline=0;
 function followAppearance(){
  if(appearanceFrame||busy||stopped||suppressed||document.hidden)return;
  if(!appearanceDeadline)appearanceDeadline=performance.now()+5000;
  if(performance.now()>=appearanceDeadline)return;
  const pending=Array.from(document.querySelectorAll('[class*=geetest_panel],[class*=geetest_box],[class*=geetest_window],[class*=geetest_slice_bg],[class*=geetest_item_img]')).some(el=>{
   const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>2&&r.height>2&&s.display!=='none';
  });
  if(!pending)return;
  appearanceFrame=requestAnimationFrame(()=>{appearanceFrame=0;inspect();followAppearance();});
 }
 function schedule(){
  if(scheduled||busy||stopped)return;
  scheduled=true;Promise.resolve().then(()=>{scheduled=false;inspect();followAppearance();});
 }
 const observer=new MutationObserver(()=>{appearanceDeadline=0;schedule();});
 function watch(){if(document.documentElement){observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','src']});schedule();}}
 if(document.documentElement)watch();else document.addEventListener('DOMContentLoaded',watch,{once:true});
 // CSS-only transitions need not create a DOM mutation. Follow their frames
 // while a challenge is opening, then leave only a low-frequency fallback.
 const heartbeat=setInterval(schedule,1500);
 ['transitionrun','transitionstart','transitionend','animationstart','animationend','load'].forEach(type=>document.addEventListener(type,()=>{appearanceDeadline=0;schedule();},true));
 document.addEventListener('visibilitychange',()=>{if(document.hidden){epoch++;for(const id of pending)bridge.cancel(id);clearRelays();}else schedule();});
 window.addEventListener('pagehide',()=>{stopped=true;epoch++;observer.disconnect();if(appearanceFrame){cancelAnimationFrame(appearanceFrame);appearanceFrame=0;}for(const id of pending)bridge.cancel(id);clearRelays();});
 window.addEventListener('pageshow',()=>{if(stopped){stopped=false;suppressed=false;watch();}});
 function ninePresent(){

function _nineVisiveis() {
    var todos = document.querySelectorAll('[class*=geetest_item_img]');
    var vivos = [];
    for (var i = 0; i < todos.length; i++) {
        var r = todos[i].getBoundingClientRect();
        if (r.width < 3 || r.height < 3) { continue; }
        var cs = window.getComputedStyle(todos[i]);
        if (cs.display === 'none' || cs.visibility === 'hidden') { continue; }
        if (parseFloat(cs.opacity) === 0) { continue; }
        vivos.push(todos[i]);
    }
    if (vivos.length < 9) { return null; }
    return vivos.slice(vivos.length - 9);
}
return _nineVisiveis() !== null;
}
function nineInfo(){

function _nineVisiveis() {
    var todos = document.querySelectorAll('[class*=geetest_item_img]');
    var vivos = [];
    for (var i = 0; i < todos.length; i++) {
        var r = todos[i].getBoundingClientRect();
        if (r.width < 3 || r.height < 3) { continue; }
        var cs = window.getComputedStyle(todos[i]);
        if (cs.display === 'none' || cs.visibility === 'hidden') { continue; }
        if (parseFloat(cs.opacity) === 0) { continue; }
        vivos.push(todos[i]);
    }
    if (vivos.length < 9) { return null; }
    return vivos.slice(vivos.length - 9);
}

return (function () {
    function urlDoFundo(el) {
        var bi = String(window.getComputedStyle(el).backgroundImage || '');
        var m = bi.match(/url\(['"]?(.*?)['"]?\)/);
        if (!m) { return ''; }
        return m[1];
    }
    var qi = document.querySelectorAll('[class*=geetest_ques_tips] img, [class*=geetest_ques_back] img');
    if (!qi.length) { return { ok: false, erro: 'sem-pergunta' }; }
    var itens = _nineVisiveis();
    if (!itens) { return { ok: false, erro: 'sem-grade' }; }
    var sprite = urlDoFundo(itens[0]);
    if (!sprite) { return { ok: false, erro: 'sem-sprite' }; }
    var cels = [];
    for (var k = 0; k < 9; k++) {
        var bp = String(window.getComputedStyle(itens[k]).backgroundPosition || '0% 0%').split(/\s+/);
        var col = Math.round(-parseFloat(bp[0]) / 100);
        var lin = Math.round(-parseFloat(bp[1] || '0') / 100);
        if (isNaN(col) || col < 0 || col > 2) { col = k % 3; }
        if (isNaN(lin) || lin < 0 || lin > 2) { lin = Math.floor(k / 3); }
        // o toque vai no .geetest_item (a celula), nao no .geetest_item_wrap
        var el = itens[k].parentElement || itens[k], d = 0;
        while (el && d < 4) {
            var cc = String(el.className || '');
            if (cc.indexOf('geetest_item') >= 0 &&
                cc.indexOf('geetest_item_wrap') < 0 &&
                cc.indexOf('geetest_item_img') < 0) { break; }
            el = el.parentElement; d++;
        }
        if (!el) { el = itens[k].parentElement || itens[k]; }
        var r = el.getBoundingClientRect();
        cels.push({ col: col, lin: lin,
                    x: Math.round(r.left + r.width / 2),
                    y: Math.round(r.top + r.height / 2),
                    classe: String(el.className || '') });
    }
    return { ok: true, icone: qi[qi.length - 1].src, sprite: sprite, cels: cels };
})();

}
function nineScores(){

var dataIcone = arguments[0], dataSprite = arguments[1], cels = arguments[2];
return (async () => {
    var N = 140;

    function carregar(url) {
        return new Promise(function (ok, falhou) {
            var img = new Image();
            img.onload = function () { ok(img); };
            img.onerror = function () { falhou('carga'); };
            img.src = url;
        });
    }
    // recorta (sx,sy,sw,sh) da imagem num quadro N x N e devolve cinza
    // (mesmos pesos do BGR2GRAY do OpenCV). Pinta de BRANCO antes de
    // desenhar, o que resolve o alpha do icone de graca.
    function cinza(img, sx, sy, sw, sh) {
        var c = document.createElement('canvas');
        c.width = N; c.height = N;
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, N, N);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, N, N);
        var d = ctx.getImageData(0, 0, N, N).data;
        var g = new Float32Array(N * N);
        for (var i = 0; i < N * N; i++) {
            g[i] = 0.299 * d[i*4] + 0.587 * d[i*4+1] + 0.114 * d[i*4+2];
        }
        return g;
    }
    // limiar automatico de Otsu (maximiza a variancia entre classes)
    function otsu(g) {
        var hist = new Float64Array(256), i, t;
        for (i = 0; i < g.length; i++) {
            var v = g[i] | 0;
            if (v < 0) { v = 0; } if (v > 255) { v = 255; }
            hist[v]++;
        }
        var total = g.length, soma = 0;
        for (t = 0; t < 256; t++) { soma += t * hist[t]; }
        var somaB = 0, wB = 0, melhor = -1, limiar = 0;
        for (t = 0; t < 256; t++) {
            wB += hist[t];
            if (wB === 0) { continue; }
            var wF = total - wB;
            if (wF === 0) { break; }
            somaB += t * hist[t];
            var mB = somaB / wB, mF = (soma - somaB) / wF;
            var val = wB * wF * (mB - mF) * (mB - mF);
            if (val > melhor) { melhor = val; limiar = t; }
        }
        return limiar;
    }
    function binarioInvertido(g) {
        var lim = otsu(g), out = new Float32Array(g.length);
        for (var i = 0; i < g.length; i++) { out[i] = (g[i] > lim) ? 0 : 255; }
        return out;
    }
    // GaussianBlur 3x3 sigma=0 do OpenBLAS: kernel [0.2261, 0.5477, 0.2261]
    function borrar(g) {
        var k0 = 0.2261, k1 = 0.5477, t = new Float32Array(N * N), o = new Float32Array(N * N), x, y;
        for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
            var a = g[y*N + (x > 0 ? x-1 : 0)];
            var b = g[y*N + x];
            var c = g[y*N + (x < N-1 ? x+1 : N-1)];
            t[y*N + x] = k0*a + k1*b + k0*c;
        }
        for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
            var a2 = t[(y > 0 ? y-1 : 0)*N + x];
            var b2 = t[y*N + x];
            var c2 = t[(y < N-1 ? y+1 : N-1)*N + x];
            o[y*N + x] = k0*a2 + k1*b2 + k0*c2;
        }
        return o;
    }
    // Sobel 3x3 + magnitude no estilo addWeighted(convertScaleAbs(gx),0.5,...)
    // -- o convertScaleAbs SATURA em 255 antes da soma, entao a ordem importa.
    function gradiente(g) {
        var b = borrar(g), o = new Float32Array(N * N), x, y;
        for (y = 1; y < N-1; y++) for (x = 1; x < N-1; x++) {
            var i = y*N + x;
            var gx = (b[i-N+1] + 2*b[i+1] + b[i+N+1]) - (b[i-N-1] + 2*b[i-1] + b[i+N-1]);
            var gy = (b[i+N-1] + 2*b[i+N] + b[i+N+1]) - (b[i-N-1] + 2*b[i-N] + b[i-N+1]);
            var ax = Math.abs(gx); if (ax > 255) { ax = 255; }
            var ay = Math.abs(gy); if (ay > 255) { ay = 255; }
            o[i] = 0.5*ax + 0.5*ay;
        }
        return o;
    }
    // TM_CCOEFF_NORMED com template do MESMO tamanho = correlacao de Pearson
    function correlacao(a, b) {
        var i, ma = 0, mb = 0, n = a.length;
        for (i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
        ma /= n; mb /= n;
        var num = 0, da = 0, db = 0;
        for (i = 0; i < n; i++) {
            var xa = a[i] - ma, xb = b[i] - mb;
            num += xa*xb; da += xa*xa; db += xb*xb;
        }
        var den = Math.sqrt(da * db);
        if (den <= 0) { return 0; }
        return num / den;
    }

    // as imagens ja' vieram do Python em data: URL -- mesma origem, canvas limpo
    var imgIcone, imgSprite;
    try {
        imgIcone = await carregar(dataIcone);
        imgSprite = await carregar(dataSprite);
    } catch (e) { return { ok: false, erro: 'carga' }; }

    var gi = gradiente(binarioInvertido(cinza(imgIcone, 0, 0, imgIcone.naturalWidth, imgIcone.naturalHeight)));
    var sw = imgSprite.naturalWidth / 3, sh = imgSprite.naturalHeight / 3;

    var notas = [];
    for (var k = 0; k < 9; k++) {
        var gc = gradiente(cinza(imgSprite, cels[k].col*sw, cels[k].lin*sh, sw, sh));
        notas.push({ i: k, v: correlacao(gc, gi) });
    }
    notas.sort(function (a, b) { return b.v - a.v; });
    return {
        ok: true,
        alvos: [notas[0].i, notas[1].i, notas[2].i],
        margem: notas[2].v - notas[3].v,
        notas: notas.map(function (x) { return Math.round(x.v * 1000) / 1000; })
    };
})();

}
function nineMarked(){

function _nineVisiveis() {
    var todos = document.querySelectorAll('[class*=geetest_item_img]');
    var vivos = [];
    for (var i = 0; i < todos.length; i++) {
        var r = todos[i].getBoundingClientRect();
        if (r.width < 3 || r.height < 3) { continue; }
        var cs = window.getComputedStyle(todos[i]);
        if (cs.display === 'none' || cs.visibility === 'hidden') { continue; }
        if (parseFloat(cs.opacity) === 0) { continue; }
        vivos.push(todos[i]);
    }
    if (vivos.length < 9) { return null; }
    return vivos.slice(vivos.length - 9);
}

var imgs = _nineVisiveis();
if (!imgs) { return null; }
// so conta se a grade ainda esta VISIVEL: quando a casa aceita, o painel some
// mas os elementos ficam no DOM, e sem esta guarda o laco seguia "corrigindo"
// e tocando em coordenadas que ja apontam para o lobby.

function itemDe(img) {
    var el = img.parentElement, d = 0;
    while (el && d < 4) {
        var c = String(el.className || '');
        if (c.indexOf('geetest_item') >= 0 &&
            c.indexOf('geetest_item_wrap') < 0 &&
            c.indexOf('geetest_item_img') < 0) { return el; }
        el = el.parentElement; d++;
    }
    return img.parentElement || img;
}
// A assinatura NAO pode usar a classe do item: ela carrega o indice
// (geetest_0, geetest_1, ...), entao toda celula seria unica e a comparacao
// por maioria marcaria as nove. Vale so o ESTILO COMPUTADO do overlay -- e' o
// que muda ao selecionar, inclusive quando a mudanca vem de uma classe nova
// (a classe altera o estilo, e o estilo e' o que a gente le).
function assinatura(item) {
    var s = '';
    var fantasmas = item.querySelectorAll('[class*=geetest_item_ghost],[class*=geetest_item_icon]');
    for (var j = 0; j < fantasmas.length; j++) {
        var cs = window.getComputedStyle(fantasmas[j]);
        s = s + '|' + cs.opacity + ',' + cs.display + ',' + cs.visibility +
            ',' + cs.transform + ',' + cs.backgroundColor;
    }
    return s;
}
var assin = [], k;
for (k = 0; k < imgs.length; k++) { assin.push(assinatura(itemDe(imgs[k]))); }
var conta = {};
for (k = 0; k < assin.length; k++) { conta[assin[k]] = (conta[assin[k]] || 0) + 1; }
var base = assin[0], melhor = 0;
for (var c2 in conta) {
    if (conta[c2] > melhor) { melhor = conta[c2]; base = c2; }
}
var out = [];
for (k = 0; k < assin.length; k++) { out.push(assin[k] !== base); }
return out;

}
function confirmOriginal(){
var b = document.querySelectorAll('[class*=geetest_submit]');if (!b.length) { return false; }b[b.length-1].click();return true;
}
function sliderPresent(){
var todos = document.querySelectorAll('[class*=geetest_slice_bg]');for (var i = todos.length - 1; i >= 0; i--) {  var r = todos[i].getBoundingClientRect();  if (r.width > 2 && r.height > 2) { return true; }}return false;
}
function anyPresent(){

var p = document.querySelectorAll(
    '[class*=geetest_slice_bg],[class*=geetest_item_img],[class*=geetest_window],' +
    '[class*=geetest_popup_ghost],[class*=geetest_box],[class*=geetest_panel]');
for (var k = 0; k < p.length; k++) {
    var el = p[k];
    var r = el.getBoundingClientRect();
    if (r.width < 3 || r.height < 3) { continue; }
    var cs = window.getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') { continue; }
    if (parseFloat(cs.opacity) === 0) { continue; }
    return true;
}
return false;

}
function clickPresent(){

function _iconesVisiveis() {
    var todos = document.querySelectorAll(
        '[class*=geetest_ques_tips] img, [class*=geetest_ques_back] img');
    var vivos = [];
    for (var i = 0; i < todos.length; i++) {
        var r = todos[i].getBoundingClientRect();
        if (r.width < 3 || r.height < 3) { continue; }
        var cs = window.getComputedStyle(todos[i]);
        if (cs.display === 'none' || cs.visibility === 'hidden') { continue; }
        if (parseFloat(cs.opacity) === 0) { continue; }
        vivos.push(todos[i]);
    }
    return vivos;
}

// clique-em-ordem: tem foto de fundo com imagem E varios icones de pergunta,
// e NAO tem a grade do 3x3. Nao depende de nome de classe da sessao.
var itens = document.querySelectorAll('[class*=geetest_item_img]');
for (var k = 0; k < itens.length; k++) {
    var ri = itens[k].getBoundingClientRect();
    if (ri.width > 3 && ri.height > 3) { return false; }   // e' 3x3
}
var qs = _iconesVisiveis();
if (qs.length < 2) { return false; }
var bgs = document.querySelectorAll('[class*=geetest_bg]');
for (var j = bgs.length - 1; j >= 0; j--) {
    var r = bgs[j].getBoundingClientRect();
    if (r.width < 40 || r.height < 40) { continue; }
    var bi = String(window.getComputedStyle(bgs[j]).backgroundImage || '');
    if (bi.indexOf('url(') >= 0) { return true; }
}
return false;

}
function clickInfo(){

function _iconesVisiveis() {
    var todos = document.querySelectorAll(
        '[class*=geetest_ques_tips] img, [class*=geetest_ques_back] img');
    var vivos = [];
    for (var i = 0; i < todos.length; i++) {
        var r = todos[i].getBoundingClientRect();
        if (r.width < 3 || r.height < 3) { continue; }
        var cs = window.getComputedStyle(todos[i]);
        if (cs.display === 'none' || cs.visibility === 'hidden') { continue; }
        if (parseFloat(cs.opacity) === 0) { continue; }
        vivos.push(todos[i]);
    }
    return vivos;
}

return (function () {
    function urlDoFundo(el) {
        var bi = String(window.getComputedStyle(el).backgroundImage || '');
        var m = bi.match(/url\(['"]?(.*?)['"]?\)/);
        return m ? m[1] : '';
    }
    var qs = _iconesVisiveis();
    if (qs.length < 2) { return { ok: false, erro: 'sem-pergunta' }; }
    var alvo = null, cx = null;
    var bgs = document.querySelectorAll('[class*=geetest_bg]');
    for (var j = bgs.length - 1; j >= 0; j--) {
        var r = bgs[j].getBoundingClientRect();
        if (r.width < 40 || r.height < 40) { continue; }
        if (urlDoFundo(bgs[j])) { alvo = bgs[j]; cx = r; break; }
    }
    if (!alvo) { return { ok: false, erro: 'sem-foto' }; }
    var icones = [];
    for (var k = 0; k < qs.length; k++) { icones.push(qs[k].src); }
    return {
        ok: true,
        foto: urlDoFundo(alvo),
        icones: icones,
        // retangulo da foto NA TELA: e' o que converte coordenada de imagem
        // em coordenada de toque
        caixa: { x: cx.left, y: cx.top, w: cx.width, h: cx.height }
    };
})();

}
function clickMarks(){

// So as marcas DENTRO da foto atual. O DOM guarda paineis antigos, cujas
// marcas ficam em 0,0 (mesma armadilha do 3x3) -- contar todas dava 3 antes
// mesmo do primeiro toque.
var bgs = document.querySelectorAll('[class*=geetest_bg]');
var foto = null;
for (var j = bgs.length - 1; j >= 0; j--) {
    var r = bgs[j].getBoundingClientRect();
    if (r.width >= 40 && r.height >= 40) { foto = r; break; }
}
if (!foto) { return -1; }
var m = document.querySelectorAll('[class*=geetest_square_mark]');
var n = 0;
for (var i = 0; i < m.length; i++) {
    var rr = m[i].getBoundingClientRect();
    var mx = rr.left + rr.width / 2;
    var my = rr.top + rr.height / 2;
    if (mx >= foto.left && mx <= foto.left + foto.width &&
        my >= foto.top && my <= foto.top + foto.height) { n = n + 1; }
}
return n;

}
function runSlider(){

return (async () => {
    // Sempre o ULTIMO no do DOM: um refresh do captcha deixa os anteriores
    // para tras como lixo, e o de cima e' o que vale.
    function ultimo(sel) {
        return lastVisible(sel)||null;
    }
    function dormir(ms) {
        return new Promise(function (r) { setTimeout(r, ms); });
    }
    // As imagens vem no background-image do CSS, nao em <img>.
    function urlDoFundo(el) {
        var bi = String(window.getComputedStyle(el).backgroundImage || '');
        var m = bi.match(/url\(['"]?(.*?)['"]?\)/);
        if (!m) { return ''; }
        return m[1];
    }
    function carregar(url) {
        return new Promise(function (ok, falhou) {
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () { ok(img); };
            img.onerror = function () { falhou('carga'); };
            img.src = url;
        });
    }
    // Desvio de quando o CDN do GeeTest nao manda o header de CORS: o canvas
    // fica tainted e o getImageData explode. Baixando por fetch a imagem vira
    // data: URL e nasce mesma-origem, entao o canvas fica limpo.
    async function carregarViaFetch(url) {
        var resp = await fetch(url);
        var blob = await resp.blob();
        var dataUrl = await new Promise(function (ok, falhou) {
            var fr = new FileReader();
            fr.onload = function () { ok(fr.result); };
            fr.onerror = function () { falhou('fr'); };
            fr.readAsDataURL(blob);
        });
        return await carregar(dataUrl);
    }
    function pixels(img, w, h) {
        var c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        var ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        return ctx.getImageData(0, 0, w, h).data;
    }

    var fundoDiv = ultimo('[class*=geetest_bg]');
    var pecaDiv = ultimo('[class*=geetest_slice_bg]');
    var pecaWrap = ultimo('[class*=geetest_slice]:not([class*=geetest_slice_bg]):not([class*=geetest_slice_animate])');
    if (!fundoDiv || !pecaDiv) { return 'sem-captcha'; }

    var w = fundoDiv.clientWidth;
    var h = fundoDiv.clientHeight;
    if (w < 10 || h < 10) { return 'sem-captcha'; }

    var pw = 80;
    var ph = 80;
    var topoPeca = 0;
    if (pecaWrap) {
        pw = pecaWrap.clientWidth;
        ph = pecaWrap.clientHeight;
        var topoCss = parseFloat(window.getComputedStyle(pecaWrap).top);
        if (isNaN(topoCss)) { topoCss = pecaWrap.offsetTop; }
        topoPeca = topoCss;
    }

    var urlFundo = urlDoFundo(fundoDiv);
    var urlPeca = urlDoFundo(pecaDiv);
    if (!urlFundo || !urlPeca) { return 'sem-imagem'; }

    var dadosPeca = null;
    var dadosFundo = null;
    try {
        dadosPeca = pixels(await carregar(await imageData(urlPeca)), pw, ph);
        dadosFundo = pixels(await carregar(await imageData(urlFundo)), w, h);
    } catch (e) {
        try {
            dadosPeca = pixels(await carregarViaFetch(urlPeca), pw, ph);
            dadosFundo = pixels(await carregarViaFetch(urlFundo), w, h);
        } catch (e2) {
            return 'cors';
        }
    }

    // A silhueta da peca e' todo pixel opaco dela.
    var pontos = [];
    for (var y = 0; y < ph; y++) {
        for (var x = 0; x < pw; x++) {
            if (dadosPeca[(y * pw + x) * 4 + 3] > 80) { pontos.push([x, y]); }
        }
    }
    if (!pontos.length) { return 'sem-silhueta'; }

    // O encaixe e' a regiao ESCURA do fundo: para cada X, soma o brilho nos
    // pontos da silhueta e fica com o X de menor soma. De 3 em 3 pontos --
    // basta para acertar e mantem a varredura rapida.
    var melhorX = 0;
    var menorErro = Infinity;
    for (var bx = 5; bx < w - pw; bx++) {
        var erro = 0;
        for (var p = 0; p < pontos.length; p = p + 3) {
            var px = Math.round(bx + pontos[p][0]);
            var py = Math.round(topoPeca + pontos[p][1]);
            if (px < 0 || py < 0 || px >= w || py >= h) { continue; }
            var i = (py * w + px) * 4;
            erro = erro + dadosFundo[i] + dadosFundo[i + 1] + dadosFundo[i + 2];
        }
        if (erro < menorErro) {
            menorErro = erro;
            melhorX = bx;
        }
    }

    var botao = ultimo('[class*=geetest_btn]');
    var trilha = ultimo('[class*=geetest_track]');
    if (!botao) { return 'sem-botao'; }

    var rb = botao.getBoundingClientRect();
    var rt = rb;
    if (trilha) { rt = trilha.getBoundingClientRect(); }
    var xBase = rb.left + rb.width / 2;
    var yBase = rb.top + rb.height / 2;

    // O botao nao nasce no zero da trilha: sem descontar o offset dele o
    // arrasto passa do buraco.
    var offset = rb.left - rt.left + rb.width / 2;
    var distancia = (melhorX + pw / 2) - offset;

    if (!pecaDiv.isConnected || !visible(pecaDiv) || urlDoFundo(fundoDiv) !== urlFundo || urlDoFundo(pecaDiv) !== urlPeca) return 'changed';
    await gesture(xBase, yBase, distancia, true);
    return 'ok:' + Math.round(distancia);
})();

}
})();
