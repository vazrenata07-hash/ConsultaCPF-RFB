'use strict';
const {chromium}=require('playwright');
const fs=require('fs');
const assert=require('assert');
const path=require('path');
const ROOT='/workspace/work';
const ORIGIN='https://a.888pg.cc/home/withdraw';
// Dummy fixture value only. Never print it or use a real account/website.
const PIN='654321';
function mainIIFE(version){
 const source=fs.readFileSync(`${ROOT}/${version}/assets/mint-rebuilt.js`,'utf8');
 const end=source.indexOf('\n})();');
 assert(end>0,'Main script boundary missing');
 const first=source.slice(0,end+6);
 assert(first.includes('function customPIN()'),'PIN main IIFE missing');
 assert(!first.includes('__mintGeeTest'),'GeeTest must never execute in this fixture');
 return first;
}
const oldSource=mainIIFE('v263'),newSource=mainIIFE('v264');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-background-networking','--disable-component-update','--disable-crash-reporter','--disable-crashpad','--no-zygote','--single-process']});
 const results=[];
 try{
  async function fixture(source,{kind='custom',partial='',cancel=false,routeCancel=false}={}){
   const context=await browser.newContext({viewport:{width:420,height:800},serviceWorkers:'block'});
   const page=await context.newPage();
   const errors=[],external=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.route('**/*',async route=>{
    if(route.request().url()!==ORIGIN){external.push(route.request().url());await route.abort();return}
    await route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><html><head><meta charset="utf-8"><title>Offline PIN fixture</title></head><body></body></html>'});
   });
   await page.goto(ORIGIN,{waitUntil:'load'});
   await page.evaluate(({kind,partial,cancel,routeCancel,pin})=>{
    window.__mintUserConfig={usernameEnabled:false,usernameLength:15,usernameAlphanumeric:true,passwordEnabled:false,password:'',pinEnabled:true,pin};
    const state=window.fixture={preview:partial,model:partial,presses:0,focuses:0,badTouches:0,submits:0,completions:0,blurCommits:0,inputEmits:0};
    document.head.insertAdjacentHTML('beforeend','<style>body{font:16px sans-serif}ul{list-style:none;display:flex;padding:0}li{width:36px;height:38px;border:1px solid #aaa;text-align:center;margin:2px}.ui-number-keyboard{display:none;width:260px}.ui-key{display:inline-block;width:72px;height:50px;border:1px solid #aaa;margin:4px}#model-value{display:none}</style>');
    if(kind==='native'){
     document.body.innerHTML='<form id="form"><section role="dialog"><h2>Senha de saque</h2><input id="withdraw-password" type="password" name="withdraw-password" maxlength="6" pattern="[0-9]{6}" required><button type="submit">Confirmar</button></section></form>';
     const input=document.getElementById('withdraw-password');
     input.setCustomValidity('Aguardando confirmação do componente');
     input.addEventListener('input',()=>{state.preview=input.value});
     input.addEventListener('blur',()=>{state.model=input.value;state.blurCommits++;input.setCustomValidity(/^[0-9]{6}$/.test(state.model)?'':'PIN incompleto')});
    }else{
     document.body.innerHTML='<form id="form"><section role="dialog"><h2>Senha de saque</h2><div id="withdraw-password" aria-label="Senha de saque" class="ui-password-input"><ul>'+Array(6).fill('<li></li>').join('')+'</ul></div><div class="ui-number-keyboard">'+Array.from({length:10},(_,i)=>'<div class="ui-key" role="button">'+i+'</div>').join('')+'</div><input id="model-value" type="password" name="form-pin" required pattern="[0-9]{6}"><button type="submit">Confirmar</button></section></form>';
     const widget=document.getElementById('withdraw-password'),board=document.querySelector('.ui-number-keyboard'),modelInput=document.getElementById('model-value');
     modelInput.value=partial;
     function paint(){widget.querySelectorAll('li').forEach((cell,index)=>{cell.textContent=index<state.preview.length?'●':''})}
     paint();
     function focus(){state.focuses++;setTimeout(()=>{board.style.display='block'},80)}
     // Realistic wrapper trap: a complete-value update changes the display only.
     // The real keyboard press route also commits the surrounding form model.
     widget.__vueParentComponent={type:{name:'UiPasswordInput'},vnode:{props:{'onUpdate:value':value=>{state.preview=value;paint()},onFocus:focus}},emit(event,value){if(event==='update:value'){this.vnode.props['onUpdate:value'](value)}else if(event==='focus')focus()}};
     board.__vueParentComponent={type:{name:'UiNumberKeyboard'},vnode:{props:{onInput:digit=>{state.inputEmits++;state.preview+=digit;paint()}}},emit(event,digit){if(event==='input')this.vnode.props.onInput(digit)}};
     widget.querySelector('ul').addEventListener('touchstart',event=>{
      if(!event.touches||!event.touches[0]){state.badTouches++;return}
      focus();
     });
     let committed;
     function actualPress(digit){
      if(state.preview.length>=6)return;
      state.presses++;state.preview+=digit;paint();
      const next=(state.model+digit).slice(0,6);
      // A realistic delayed parent/form update: unpaced bursts lose earlier
      // model updates, while independent key interactions 60ms apart commit.
      clearTimeout(committed);committed=setTimeout(()=>{state.model=next;modelInput.value=next;if(next.length===6)state.completions++},35);
      if(state.presses===1&&cancel)setTimeout(()=>{window.__mintUserConfig.pinEnabled=false;window.dispatchEvent(new Event('mint-config-change'))},10);
      if(state.presses===1&&routeCancel)setTimeout(()=>{history.pushState({},'', '/home/')},10);
     }
     board.querySelectorAll('.ui-key').forEach(key=>{
      let armed=false;
      key.addEventListener('touchstart',event=>{armed=!!(event.touches&&event.touches[0]);if(!armed)state.badTouches++});
      key.addEventListener('touchend',event=>{if(!armed||!event.changedTouches||!event.changedTouches[0]){state.badTouches++;return}armed=false;actualPress(key.textContent.trim())});
     });
    }
    document.getElementById('form').addEventListener('submit',event=>{event.preventDefault();state.submits++});
    window.snapshot=()=>({visibleDigits:state.preview.length,formDigits:state.model.length,modelMatches:state.model===pin,valid:document.getElementById('form').checkValidity(),presses:state.presses,focuses:state.focuses,badTouches:state.badTouches,submits:state.submits,completions:state.completions,blurCommits:state.blurCommits,inputEmits:state.inputEmits});
   },{kind,partial,cancel,routeCancel,pin:PIN});
   await page.addScriptTag({content:source});
   return {page,context,errors,external};
  }
  async function finish(run,name,check,wait=850){
   await run.page.waitForTimeout(wait);
   const snapshot=await run.page.evaluate(()=>window.snapshot());
   assert.deepStrictEqual(run.errors,[],name+': browser errors');
   assert.deepStrictEqual(run.external,[],name+': unexpected network request');
   assert.equal(snapshot.submits,0,name+': automatic submission forbidden');
   check(snapshot);results.push({case:name,...snapshot});await run.context.close();
  }
  await finish(await fixture(oldSource),'old-custom-reproduces-blank-model',s=>{assert.equal(s.visibleDigits,6);assert.equal(s.formDigits,0);assert(!s.valid);assert.equal(s.presses,0)});
  await finish(await fixture(newSource),'new-custom-updates-form-model',s=>{assert.equal(s.visibleDigits,6);assert.equal(s.formDigits,6);assert(s.modelMatches);assert(s.valid);assert.equal(s.presses,6);assert.equal(s.badTouches,0);assert.equal(s.completions,1)});
  await finish(await fixture(newSource,{partial:'12'}),'new-preserves-partial-user-pin',s=>{assert.equal(s.visibleDigits,2);assert.equal(s.formDigits,2);assert.equal(s.presses,0);assert.equal(s.focuses,0)});
  await finish(await fixture(newSource,{cancel:true}),'new-stops-after-option-cancellation',s=>{assert.equal(s.presses,1);assert.equal(s.visibleDigits,1);assert.equal(s.formDigits,1)});
  await finish(await fixture(newSource,{routeCancel:true}),'new-stops-after-route-generation-change',s=>{assert.equal(s.presses,1);assert.equal(s.visibleDigits,1);assert.equal(s.formDigits,1)});
  await finish(await fixture(oldSource,{kind:'native'}),'old-native-misses-form-blur',s=>{assert.equal(s.visibleDigits,6);assert.equal(s.formDigits,0);assert(!s.valid);assert.equal(s.blurCommits,0)},250);
  await finish(await fixture(newSource,{kind:'native'}),'new-native-commits-model-on-blur',s=>{assert.equal(s.visibleDigits,6);assert.equal(s.formDigits,6);assert(s.modelMatches);assert(s.valid);assert.equal(s.blurCommits,1)},250);
  const report={kind:'isolated-offline-model-regression',fixtureOrigin:ORIGIN,geeTestExecuted:false,realNetworkRequests:0,automaticSubmissions:0,cases:results};
  fs.writeFileSync(path.join(__dirname,'pin-form-model-results.json'),JSON.stringify(report,null,2)+'\n');
  console.log(`PASS: ${results.length} isolated PIN form-model cases; old failure reproduced; new form validation passed; no network, GeeTest or submission.`);
 }finally{await browser.close()}
})().catch(error=>{console.error(error.stack);process.exitCode=1});
