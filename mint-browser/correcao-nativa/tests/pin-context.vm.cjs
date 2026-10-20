'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto').webcrypto,path=require('node:path');
const PIN='654321', ACCOUNT='FixtureLogin8'; // Local dummy value; never printed.
function source(version){return fs.readFileSync(`/workspace/work/${version}/assets/mint-rebuilt.js`,'utf8')}
function main(version){const s=source(version),end=s.indexOf('\n})();');assert(end>0);const code=s.slice(0,end+6);assert(!code.includes('__mintGeeTest'));return code}
class Event{constructor(type,init){this.type=type;this.isTrusted=false;Object.assign(this,init)}}
class Element{
 constructor(tag='div',classes='',text=''){this.tagName=tag.toUpperCase();this.className=classes;this.textContent=text;this.parentElement=null;this.isConnected=true;this.handlers={};this.children=[];this.name='';this.id='';this.placeholder='';this.autocomplete='';this.type='';this.maxLength=0;this.disabled=false;this.readOnly=false;this.attributes={}}
 matches(sel){return sel.split(',').some(s=>{s=s.trim();if(s==='input')return this.tagName==='INPUT';if(s==='form')return this.tagName==='FORM';if(s==='body')return this.tagName==='BODY';if(s==='[role="dialog"]')return this.attributes.role==='dialog';if(/^\.[\w-]+$/.test(s))return this.className.split(' ').includes(s.slice(1));return false})}
 closest(sel){for(let p=this;p;p=p.parentElement)if(p.matches(sel))return p;return null}
 contains(el){for(let p=el;p;p=p.parentElement)if(p===this)return true;return false}
 getClientRects(){return [{}]}getBoundingClientRect(){return {left:10,top:10,width:40,height:40}}
 getAttribute(k){return this.attributes[k]||''}setAttribute(k,v){this.attributes[k]=v}
 dispatchEvent(e){e.target=this;for(const fn of this.handlers[e.type]||[])fn(e);if(this.bubble)this.bubble(e);return true}
 querySelectorAll(sel){if(sel==='li'&&this.cells)return this.cells;if(this.keys)return this.keys;const all=[];for(const child of this.children){if(child.matches(sel))all.push(child);all.push(...child.querySelectorAll(sel))}return all}
 querySelector(sel){if(sel==='ul')return this.ul||null;if(sel==='input')return this.children.find(c=>c.tagName==='INPUT')||null;return null}
 appendChild(el){el.parentElement=this;this.children.push(el)}
 click(){if(this.onclick)this.onclick()}
}
class Input extends Element{
 constructor(value=''){super('input');this.type='password';this.name='withdraw_pin';this.id='withdraw-password';this.maxLength=6;this._value=value}
 get value(){return this._value}set value(v){this._value=v}
 blur(){this.dispatchEvent(new Event('blur'));this.dispatchEvent(new Event('focusout'))}
}
async function flush(){for(let i=0;i<35;i++)await Promise.resolve()}
async function run(version,{setup=false,kind='custom',partial='',cancel=null,keyMode='touch',globalSacar=true}={}){
 let now=0,nextTimer=0,ctx;const timers=new Map(),scheduled=[],listeners={},list=[];
 const timeout=(fn,delay=0)=>{const id=++nextTimer;scheduled.push(delay);timers.set(id,{at:now+delay,fn});return id};
 const add=(name,fn)=>(listeners[name]??=[]).push(fn);
 const dispatch=(name,e={})=>{const event=new Event(name,e);for(const fn of listeners[name]||[])fn(event)};
 const account=kind==='account', native=kind==='native'||account;
 const body=new Element('body','',globalSacar?'Sacar Depositar Perfil':'Perfil');
 const form=new Element('form','',account?'Confirmar senha de acesso':setup?'Defina sua senha de saque Confirmar Nova Senha':'Senha de saque');body.appendChild(form);body.textContent+=' '+form.textContent;
 const states=Array.from({length:setup?2:1},(_,i)=>({preview:i===0?partial:'',model:i===0?partial:'',presses:0,focuses:0,badTouches:0,blurCommits:0,fullUpdates:0}));
 const foreign=new Input();foreign.name='amount';foreign.type='text';foreign.id='other-field';foreign.maxLength=32;body.appendChild(foreign);const foreignState={preview:'',model:'',presses:0};
 let active=0,shown=false,committed;
 function focus(index){active=index;states[index].focuses++;timeout(()=>{shown=true},80)}
 const widgets=[],inputs=[];
 for(let i=0;i<states.length;i++){
  const state=states[i],field=new Element('div','pin-field',account?'Confirmar senha de acesso':setup?(i?'Confirmar Nova Senha':'Defina sua senha de saque'):'Senha de saque');form.appendChild(field);
  if(native){
   const input=new Input(i===0?partial:'');input.name=account?'account_password':setup?(i?'confirm_withdraw_password':'withdraw_password'):'withdraw_pin';if(account)input.maxLength=32;input.id='pin-'+i;field.appendChild(input);inputs.push(input);
   input.handlers.input=[()=>{state.preview=input.value;if(setup||account)state.model=input.value}];input.handlers.blur=[()=>{state.model=input.value;state.blurCommits++}];
  }else{
   const widget=new Element('div','ui-password-input');widget.id='pin-'+i;widget.attributes['aria-label']=account?'Confirmar senha de acesso':setup?(i?'Confirmar Nova Senha':'Defina sua senha de saque'):'Senha de saque';field.appendChild(widget);widgets.push(widget);
   widget.cells=Array.from({length:6},(_,cell)=>({get textContent(){return cell<state.preview.length?'•':''},querySelector(){return null}}));
   const ul=widget.ul=new Element('ul');widget.appendChild(ul);
   ul.handlers.touchstart=[event=>{if(!event.touches||!event.touches[0]){state.badTouches++;return}focus(i)}];
   widget.__vueParentComponent={type:{name:'UiPasswordInput'},vnode:{props:{'onUpdate:value':()=>{},onFocus:()=>focus(i)}},emit(event,value){if(event==='update:value'){state.fullUpdates++;state.preview=value;if(setup)state.model=value}else if(event==='focus')focus(i)}};
   widget.onclick=ul.onclick=()=>focus(i);
  }
 }
 const board=new Element('div','ui-number-keyboard');body.appendChild(board);board.getClientRects=()=>shown?[{}]:[];
 function actualPress(digit){
  const state=active==='foreign'?foreignState:states[active];if(state.preview.length>=6)return;
  state.presses++;state.preview+=digit;const next=(state.model+digit).slice(0,6);
  if(committed)timers.delete(committed);committed=timeout(()=>{state.model=next},35);
  if(states[0].presses===1&&cancel)timeout(()=>{
   if(cancel==='option'){ctx.__mintUserConfig.pinEnabled=false;dispatch('mint-config-change')}
   if(cancel==='route')ctx.history.pushState({},'','/home/');
   if(cancel==='focus'){active='foreign';document.activeElement=foreign;dispatch('focusin',{target:foreign,isTrusted:true});dispatch('pointerdown',{target:foreign,isTrusted:true})}
   if(cancel==='outside'){dispatch('pointerdown',{target:body,isTrusted:true});dispatch('touchstart',{target:body,isTrusted:true})}
  },10);
 }
 board.keys=Array.from({length:10},(_,i)=>{
  let armed=false;const key=new Element('div','ui-key',String(i));board.appendChild(key);key.onclick=null;
  key.click=()=>actualPress(String(i));
  key.dispatchEvent=event=>{if(keyMode!=='touch')return true;if(event.type==='touchstart'){armed=!!(event.touches&&event.touches[0]);if(!armed)states[0].badTouches++}if(event.type==='touchend'){if(!armed||!event.changedTouches||!event.changedTouches[0])states[0].badTouches++;else{armed=false;actualPress(String(i))}}return true};
  if(keyMode==='symbolClick')key[Symbol('_vei')]={onClick:()=>{}};
  return key;
 });
 board.__vueParentComponent={type:{name:'UiNumberKeyboard'},vnode:{props:{onInput(){}}},emit(event,digit){if(event==='input')states[active].preview+=digit}};
 const document={body,activeElement:native?inputs[0]:null,documentElement:{appendChild(el){el.isConnected=true}},createElement(){return {style:{},setAttribute(){}}},querySelectorAll(sel){if(sel==='input')return inputs.concat([foreign]);if(sel==='.ui-password-input,.van-password-input')return widgets;if(sel==='.ui-number-keyboard,.van-number-keyboard')return shown?[board]:[];return []},addEventListener:add};
 const pathname=account?'/home/verify':setup?'/home/security':'/home/withdraw';
 ctx={document,crypto,HTMLInputElement:Input,Event,InputEvent:Event,FocusEvent:Event,TouchEvent:Event,Touch:class{constructor(v){Object.assign(this,v)}},scrollX:0,scrollY:0,console,Promise,Map,Set,WeakSet,WeakMap,Uint8Array,performance:{now:()=>now},location:{hostname:'a.888pg.cc',pathname,search:setup?'?id=14':'',hash:'',href:'https://a.888pg.cc'+pathname+(setup?'?id=14':'')},history:{pushState(a,b,url){ctx.location.pathname=url;ctx.location.search='';ctx.location.href='https://a.888pg.cc'+url},replaceState(){}},MutationObserver:class{observe(){}},setTimeout:timeout,clearTimeout:id=>timers.delete(id),requestAnimationFrame:fn=>timeout(fn,16),getComputedStyle(){return {visibility:'visible',display:'block'}},addEventListener:add,__mintUserConfig:{usernameEnabled:false,passwordEnabled:account,password:ACCOUNT,pinEnabled:true,pin:PIN}};
 ctx.window=ctx;ctx.top=ctx;
 vm.runInNewContext(main(version),ctx,{filename:`${version}-main-IIFE.js`});await flush();
 const immediate=states.map(s=>({visibleDigits:s.preview.length,formDigits:s.model.length,modelMatches:s.model===(account?ACCOUNT:PIN)}));
 for(let steps=0;steps<1000;steps++){
  let chosen=null;for(const item of timers)if(!chosen||item[1].at<chosen[1].at)chosen=item;
  if(!chosen||chosen[1].at>1000)break;timers.delete(chosen[0]);now=chosen[1].at;chosen[1].fn();await flush();
 }
 return {immediate,fields:states.map(s=>({visibleDigits:s.preview.length,formDigits:s.model.length,modelMatches:s.model===(account?ACCOUNT:PIN),valid:account?s.model===ACCOUNT:/^[0-9]{6}$/.test(s.model),presses:s.presses,focuses:s.focuses,badTouches:s.badTouches,blurCommits:s.blurCommits,fullUpdates:s.fullUpdates})),foreignDigits:foreignState.preview.length,foreignPresses:foreignState.presses,scheduledDelays:scheduled,automaticSubmissions:0};
}
(async()=>{
 const cases=[];
 let r=await run('v264',{setup:true});assert(r.scheduledDelays.includes(80)&&r.scheduledDelays.includes(60));cases.push({case:'old-setup-delay-reproduced',...r});
 r=await run('v265',{setup:true});assert.equal(r.fields.length,2);for(const f of r.immediate){assert.equal(f.visibleDigits,6);assert.equal(f.formDigits,6);assert(f.modelMatches)}assert(!r.scheduledDelays.some(ms=>[40,60,80,100].includes(ms)));assert(r.fields.every(f=>f.presses===0&&f.focuses===0));cases.push({case:'setup-two-fields-instant-despite-global-sacar',...r});
 for(const keyMode of ['touch','symbolClick']){r=await run('v265',{keyMode});assert(r.fields[0].valid&&r.fields[0].modelMatches);assert.equal(r.fields[0].presses,6);assert.equal(r.fields[0].badTouches,0);assert(r.scheduledDelays.includes(40));cases.push({case:`withdrawal-${keyMode}-retains-paced-real-handler`,...r})}
 for(const cancel of ['focus','outside','option','route']){r=await run('v265',{cancel});assert.equal(r.fields[0].presses,1);assert.equal(r.fields[0].formDigits,1);assert.equal(r.foreignDigits,0);assert.equal(r.foreignPresses,0);cases.push({case:`withdrawal-${cancel}-cancels-pending-digits`,...r})}
 r=await run('v265',{kind:'native',setup:true});assert(r.immediate.every(f=>f.formDigits===6));assert(!r.scheduledDelays.some(ms=>[40,60,80,100].includes(ms)));assert(r.fields.every(f=>f.blurCommits===0));cases.push({case:'setup-native-inputs-remain-instant-no-blur-delay',...r});
 r=await run('v265',{kind:'native'});assert(r.fields[0].valid&&r.fields[0].modelMatches);assert(r.scheduledDelays.includes(80));assert.equal(r.fields[0].blurCommits,1);cases.push({case:'withdrawal-native-input-retains-80ms-blur',...r});
 r=await run('v265',{partial:'12'});assert.equal(r.fields[0].formDigits,2);assert.equal(r.fields[0].presses,0);assert.equal(r.fields[0].focuses,0);cases.push({case:'partial-user-pin-preserved',...r});
 r=await run('v265',{kind:'account'});assert(r.fields[0].modelMatches);assert.equal(r.fields[0].blurCommits,0);assert(!r.scheduledDelays.some(ms=>[40,60,80,100].includes(ms)));cases.push({case:'account-password-verification-has-no-pin-delays',...r});
 const marker=";\n(function () {\n 'use strict';\n if (window.__mintGeeTestV22)";const old=source('v263'),fresh=source('v265'),a=old.indexOf(marker),b=fresh.indexOf(marker);assert(a>0&&b>0);assert.equal(fresh.slice(b),old.slice(a),'GeeTest suffix must remain identical');
 fs.writeFileSync(path.join(__dirname,'pin-context-vm-results.json'),JSON.stringify({kind:'node-vm-simulated-dom-model',limitation:'Production main IIFE tested against isolated simulated setup/withdrawal component contracts; no browser, Android WebView or real-site claim.',realNetworkRequests:0,geeTestExecuted:false,geeTestSuffixIdentical:true,automaticSubmissions:0,cases},null,2)+'\n');
 console.log(`PASS: ${cases.length} isolated V265 PIN context cases; setup instant, withdrawal paced, trusted cancellation, native input scope, partial preservation; GeeTest suffix identical.`);
})().catch(error=>{console.error(error.stack);process.exitCode=1});
