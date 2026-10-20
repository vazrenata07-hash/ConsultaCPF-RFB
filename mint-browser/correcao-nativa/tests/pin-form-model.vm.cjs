'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto').webcrypto,path=require('node:path');
const PIN='654321'; // Dummy data only; values never printed.
function main(version){const s=fs.readFileSync(`/workspace/work/${version}/assets/mint-rebuilt.js`,'utf8'),end=s.indexOf('\n})();');assert(end>0);const code=s.slice(0,end+6);assert(!code.includes('__mintGeeTest'));return code}
class Event{constructor(type,init){this.type=type;Object.assign(this,init)}}
class Input{
 constructor(value=''){this.type='password';this.name='withdraw_pin';this.id='withdraw-password';this.placeholder='';this.autocomplete='';this.maxLength=6;this._value=value;this.disabled=false;this.readOnly=false;this.isConnected=true;this.handlers={}}
 get value(){return this._value}set value(v){this._value=v}
 getClientRects(){return [{}]}getBoundingClientRect(){return {left:10,top:10,width:40,height:40}}
 getAttribute(){return ''}setAttribute(k,v){this[k]=v}closest(){return null}matches(s){return s==='input'}
 dispatchEvent(e){for(const fn of this.handlers[e.type]||[])fn(e);return true}
 blur(){this.dispatchEvent(new Event('blur'));this.dispatchEvent(new Event('focusout'))}
}
async function flush(){for(let i=0;i<20;i++)await Promise.resolve()}
async function run(version,{kind='custom',partial='',cancel=false,routeCancel=false,keyMode='touch'}={}){
 let now=0,nextTimer=0;const timers=new Map(),listeners={},state={preview:partial,model:partial,presses:0,focuses:0,badTouches:0,submits:0,completions:0,blurCommits:0,fullUpdates:0};
 const timeout=(fn,delay=0)=>{const id=++nextTimer;timers.set(id,{at:now+delay,fn});return id};
 const dispatch=(name,e={})=>{for(const fn of listeners[name]||[])fn(new Event(name,e))};
 const add=(name,fn)=>(listeners[name]??=[]).push(fn);
 const native=kind==='native'?new Input():null;
 let shown=false,commitTimer;
 const cells=Array.from({length:6},(_,i)=>({get textContent(){return i<state.preview.length?'•':''},querySelector(){return null}}));
 const widget=new Input();
 widget.querySelectorAll=()=>cells;
 widget.querySelector=s=>s==='ul'?ul:null;
 const ul={dispatchEvent(e){if(e.type==='touchstart'){if(!e.touches||!e.touches[0]){state.badTouches++;return false}focus()}return true},getBoundingClientRect(){return {left:10,top:10,width:200,height:40}}};
 function focus(){state.focuses++;timeout(()=>{shown=true},80)}
 widget.__vueParentComponent={type:{name:'UiPasswordInput'},vnode:{props:{'onUpdate:value':()=>{},onFocus:focus}},emit(event,value){if(event==='update:value'){state.fullUpdates++;state.preview=value}else if(event==='focus')focus()}};
 widget.click=()=>focus();ul.click=()=>focus();
 const keys=Array.from({length:10},(_,i)=>{
  let armed=false;const key=new Input();key.textContent=String(i);key.onclick=null;key.__vnode=null;
  function press(){
   if(state.preview.length>=6)return;
   state.presses++;state.preview+=String(i);const next=(state.model+i).slice(0,6);
   if(commitTimer)timers.delete(commitTimer);
   commitTimer=timeout(()=>{state.model=next;if(next.length===6)state.completions++},35);
   if(state.presses===1&&cancel)timeout(()=>{ctx.__mintUserConfig.pinEnabled=false;dispatch('mint-config-change')},10);
   if(state.presses===1&&routeCancel)timeout(()=>ctx.history.pushState({},'','/home/'),10);
  }
  key.click=()=>press();
  key.dispatchEvent=e=>{if(keyMode!=='touch')return true;if(e.type==='touchstart'){armed=!!(e.touches&&e.touches[0]);if(!armed)state.badTouches++}if(e.type==='touchend'){if(!armed||!e.changedTouches||!e.changedTouches[0])state.badTouches++;else{armed=false;press()}}return true};
  if(keyMode==='symbolClick')key[Symbol('_vei')]={onClick:press};
  if(keyMode==='veiClick')key._vei={onClick:press};
  return key;
 });
 const board={querySelectorAll(){return keys},getClientRects(){return shown?[{}]:[]},__vueParentComponent:{type:{name:'UiNumberKeyboard'},vnode:{props:{onInput(){}}},emit(event,digit){if(event==='input')state.preview+=digit}}};
 const document={body:{textContent:'Senha de saque',appendChild(){}},activeElement:native,documentElement:{appendChild(e){e.isConnected=true}},createElement(){return {style:{},setAttribute(){}}},querySelectorAll(s){if(s==='input')return native?[native]:[];if(s==='.ui-password-input,.van-password-input')return native?[]:[widget];if(s==='.ui-number-keyboard,.van-number-keyboard')return shown?[board]:[];return []},addEventListener:add};
 if(native){native.handlers.input=[()=>{state.preview=native.value}];native.handlers.blur=[()=>{state.model=native.value;state.blurCommits++}]}
 const ctx={document,crypto,HTMLInputElement:Input,Event,InputEvent:Event,FocusEvent:Event,TouchEvent:Event,Touch:class{constructor(v){Object.assign(this,v)}},scrollX:0,scrollY:0,console,Promise,Map,Set,WeakSet,WeakMap,Uint8Array,performance:{now:()=>now},location:{hostname:'a.888pg.cc',pathname:'/home/withdraw',hash:'',href:'https://a.888pg.cc/home/withdraw'},history:{pushState(a,b,url){ctx.location.pathname=url;ctx.location.href='https://a.888pg.cc'+url},replaceState(){}},MutationObserver:class{observe(){}},setTimeout:timeout,clearTimeout:id=>timers.delete(id),requestAnimationFrame:fn=>timeout(fn,16),getComputedStyle(){return {visibility:'visible',display:'block'}},addEventListener:add,__mintUserConfig:{usernameEnabled:false,passwordEnabled:false,pinEnabled:true,pin:PIN}};
 ctx.window=ctx;ctx.top=ctx;
 vm.runInNewContext(main(version),ctx,{filename:`${version}-main-IIFE.js`});
 await flush();
 for(let steps=0;steps<1000;steps++){
  let chosen=null;for(const [id,t]of timers)if(!chosen||t.at<chosen[1].at)chosen=[id,t];
  if(!chosen||chosen[1].at>1000)break;
  timers.delete(chosen[0]);now=chosen[1].at;chosen[1].fn();await flush();
 }
 const result={visibleDigits:state.preview.length,formDigits:state.model.length,modelMatches:state.model===PIN,valid:/^[0-9]{6}$/.test(state.model),presses:state.presses,focuses:state.focuses,badTouches:state.badTouches,submits:state.submits,completions:state.completions,blurCommits:state.blurCommits,fullUpdates:state.fullUpdates};
 assert.equal(result.submits,0);return result;
}
(async()=>{
 const cases=[];
 let r=await run('v263');assert.equal(r.visibleDigits,6);assert.equal(r.formDigits,0);assert(!r.valid);assert.equal(r.fullUpdates,1);cases.push({case:'old-preview-only-failure-reproduced',...r});
 for(const keyMode of ['touch','symbolClick','veiClick']){r=await run('v264',{keyMode});assert.equal(r.visibleDigits,6);assert.equal(r.formDigits,6);assert(r.modelMatches);assert(r.valid);assert.equal(r.presses,6);assert.equal(r.badTouches,0);assert.equal(r.completions,1);cases.push({case:`new-${keyMode}-commits-form-model`,...r})}
 r=await run('v264',{partial:'12'});assert.equal(r.visibleDigits,2);assert.equal(r.formDigits,2);assert.equal(r.presses,0);assert.equal(r.focuses,0);cases.push({case:'partial-user-pin-preserved',...r});
 for(const option of ['cancel','routeCancel']){r=await run('v264',{[option]:true});assert.equal(r.presses,1);assert.equal(r.visibleDigits,1);assert.equal(r.formDigits,1);cases.push({case:`${option}-stops-further-digits`,...r})}
 r=await run('v263',{kind:'native'});assert.equal(r.visibleDigits,6);assert.equal(r.formDigits,0);assert.equal(r.blurCommits,0);cases.push({case:'old-native-missing-blur-reproduced',...r});
 r=await run('v264',{kind:'native'});assert.equal(r.formDigits,6);assert(r.valid);assert(r.modelMatches);assert.equal(r.blurCommits,1);cases.push({case:'new-native-blur-commits-model',...r});
 fs.writeFileSync(path.join(__dirname,'pin-form-model-vm-results.json'),JSON.stringify({kind:'node-vm-simulated-dom-model',limitation:'Validates production first-IIFE logic and event payloads against a simulated component contract; not a browser, Android WebView or real-site validation.',realNetworkRequests:0,geeTestExecuted:false,automaticSubmissions:0,cases},null,2)+'\n');
 console.log(`PASS: ${cases.length} Node VM PIN model cases; old failure reproduced; new form-model commits, event modes and cancellation passed; no real website, GeeTest or submission.`);
})().catch(error=>{console.error(error.stack);process.exitCode=1});
