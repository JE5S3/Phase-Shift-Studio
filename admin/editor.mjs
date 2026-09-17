import {createClient} from '@supabase/supabase-js';
import {validateValue} from '../content/core.mjs';
const config=window.PSS_CONTENT_CONFIG || {};
const store=window.PSSContent;
const gate=document.getElementById('admin-gate');
const login=document.getElementById('admin-login');
const message=document.getElementById('admin-message');
let client,editing=false,busy=false,dialog=null,toolbar=null,userId=null,checking=false;
function lockEditor(){
  if(!editing)return;
  editing=false;
  // Clear private controls immediately; a fresh page avoids re-running the
  // site's original global interaction scripts in the same document.
  dialog?.close();document.body.replaceChildren(gate);
  document.body.classList.remove('admin-edit-mode');location.reload();
}
function friendlyKey(key){
  return key.replace(/\.text_\d+$/,'').replace(/[._]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
}
function showGate(text){
  if(editing){location.reload();return;}
  message.textContent=text;login.querySelector('button').disabled=!client;
}
async function authorised(){
  const {data,error}=await client.auth.getUser();
  if(error||!data.user){lockEditor();throw new Error('Please log in again.');}
  const result=await client.from('website_admins').select('user_id').eq('user_id',data.user.id).maybeSingle();
  if(result.error)throw new Error('Admin permissions could not be checked. Check Supabase setup.');
  if(!result.data){lockEditor();throw new Error('This account is not authorised to edit this website.');}
  userId=data.user.id;
}
async function loadSnapshot(){
  const {data,error}=await client.rpc('read_website_content');
  if(error)throw new Error('Content could not be loaded. Check your connection and Supabase setup.');
  return data;
}
function updateStatus(text){
  if(!toolbar)return;
  const dirty=Object.keys(store.changed()).length>0;
  toolbar.querySelector('.admin-status').textContent=text || (dirty?'Unsaved changes':'Saved ✓ · Click text or a price to edit');
  toolbar.querySelector('.save').disabled=busy||!dirty;
  toolbar.querySelector('.revert').disabled=busy||!dirty;
  toolbar.querySelector('.logout').disabled=busy;
}
// The target's existing typography and markup stay intact. Input is always plain text.
export class EditableText {
  constructor(target,fields){
    this.target=target;this.fields=fields;
  }
  open(){
    if(busy||!editing)return;
    if(dialog?.open)return;
    const old=Object.fromEntries(this.fields.map(f=>[f.key,store.get(f.key)]));
    dialog=document.createElement('dialog');dialog.className='inline-editor';
    const title=document.createElement('h2');title.id='inline-editor-title';title.textContent=friendlyKey(this.fields[0].key);
    dialog.setAttribute('aria-labelledby',title.id);dialog.append(title);
    const error=document.createElement('p');error.className='editor-error';error.setAttribute('role','status');
    const inputs=[];
    this.fields.forEach((field,index)=>{
      const label=document.createElement('label');
      label.textContent=this.fields.length===1?(field.type==='price'?'Price (AUD)':'Text'):'Text '+(index+1);
      const input=document.createElement(field.type==='price'?'input':'textarea');
      if(field.type==='price'){input.type='number';input.min='0';input.max='10000000';input.step='0.01';}
      else{input.rows=store.get(field.key).length>100?4:2;input.maxLength=field.maxLength;}
      input.value=String(store.get(field.key));
      input.addEventListener('input',()=>{
        const value=field.type==='price'?(input.value===''?NaN:Number(input.value)):input.value;
        if(!validateValue(field,value)){error.textContent='Please enter '+(field.type==='price'?'a non-negative price with at most two decimal places.':'non-empty text within '+field.maxLength+' characters.');return;}
        error.textContent='';store.set(field.key,value);
      });
      label.append(input);dialog.append(label);inputs.push([input,field]);
    });
    dialog.append(error);
    const actions=document.createElement('div');actions.className='editor-actions';
    const undo=document.createElement('button');undo.type='button';undo.textContent='Undo this edit';
    const done=document.createElement('button');done.type='button';done.className='done';done.textContent='Done';
    const close=(revert)=>{
      if(revert){Object.assign(store.values,old);store.apply();store.onChange();}
      dialog.close();dialog.remove();dialog=null;this.target.focus({preventScroll:true});
    };
    undo.addEventListener('click',()=>close(true));
    done.addEventListener('click',()=>{
      if(inputs.some(([i,f])=>!validateValue(f,f.type==='price'?(i.value===''?NaN:Number(i.value)):i.value))){error.textContent='Correct the highlighted value before continuing.';return;}
      close(false);
    });
    dialog.addEventListener('cancel',e=>{e.preventDefault();close(true);});
    actions.append(undo,done);dialog.append(actions);document.body.append(dialog);
    dialog.showModal();
    const rect=this.target.getBoundingClientRect();
    const width=dialog.offsetWidth,height=dialog.offsetHeight;
    dialog.style.left=Math.max(12,Math.min(rect.left,innerWidth-width-12))+'px';
    dialog.style.top=Math.max(12,Math.min(rect.bottom+8,innerHeight-height-12))+'px';
    inputs[0][0].focus();
  }
}
export class EditablePrice extends EditableText {}
function fieldsFor(el){
  if(el.dataset.editKeys)return el.dataset.editKeys.split(',').map(key=>store.fields.get(key));
  if(el.dataset.editKey)return [store.fields.get(el.dataset.editKey)];
  return store.manifest.targets.find(t=>t.id===el.dataset.contentTarget)?.bindings.map(b=>store.fields.get(b.key));
}
function bindFields(){
  for(const el of document.querySelectorAll('[data-content-target],[data-edit-key],[data-edit-keys]')){
    if(el.closest('.highlight-copy')||el.dataset.editable)continue;
    const fields=fieldsFor(el);
    if(!fields?.length||fields.some(f=>!f))continue;
    el.dataset.editable='true';el.title='Click to edit';el.setAttribute('aria-description','Editable website content. Press Enter to edit.');
    if(!el.matches('a,button,summary,input,textarea,select'))el.tabIndex=0;
    // Read keys at click time: descriptions/badges reuse their element when
    // switching modes, so they must edit the currently visible payment option.
    const open=()=>{
      const current=fieldsFor(el);
      const Editor=current[0].type==='price'?EditablePrice:EditableText;
      new Editor(el,current).open();
    };
    if(el.matches('summary')){
      // Keep the normal FAQ expand/collapse action; edit its wording via a
      // separate small handle, rather than trapping the whole summary click.
      el.dataset.editHandle='true';
      const handle=document.createElement('button');handle.type='button';
      handle.className='admin-field-handle';handle.textContent='✎';
      handle.setAttribute('aria-label','Edit question wording');
      handle.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open();});
      el.append(handle);continue;
    }
    el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open();});
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();open();}});
  }
}
async function startEditing(){
  if(editing||checking)return;
  checking=true;
  try{
    await authorised();
    const snapshot=await loadSnapshot();store.accept(snapshot,true);
    const response=await fetch('/admin/site-template.html',{cache:'no-store',signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw new Error('Website preview could not be loaded.');
    const template=new DOMParser().parseFromString(await response.text(),'text/html');
    const scripts=[...template.querySelectorAll('script[src]')].map(s=>s.getAttribute('src'));
    template.querySelectorAll('script,noscript').forEach(s=>s.remove());
    // Only same-origin project scripts may run in the authenticated preview.
    if(scripts.some(src=>!/^([a-z-]+\.js)(\?[^]*)?$/.test(src)))throw new Error('Unexpected preview script.');
    gate.remove();
    document.body.replaceChildren(...template.body.childNodes);
    document.body.classList.add('admin-edit-mode');
    toolbar=document.createElement('div');toolbar.className='admin-toolbar';toolbar.setAttribute('role','region');toolbar.setAttribute('aria-label','Website editing controls');
    toolbar.innerHTML='<span class="admin-status" role="status"></span><button type="button" class="save">Save Changes</button><button type="button" class="revert">Cancel / Revert</button><button type="button" class="reload">Load latest</button><button type="button" class="logout">Log out</button>';
    document.body.append(toolbar);
    // Set source base URL so relative legal/asset links resolve exactly as on /.
    const base=document.createElement('base');base.href='/';document.head.prepend(base);
    for(const src of scripts){
      await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='/'+src;s.onload=resolve;s.onerror=()=>reject(new Error('Website interaction script failed to load.'));document.body.append(s);});
    }
    editing=true;
    document.getElementById('contact-form').addEventListener('submit',e=>{
      e.preventDefault();e.stopImmediatePropagation();
      document.getElementById('form-status').textContent='Editing preview: no enquiry has been sent.';
    },true);
    store.onChange=()=>updateStatus();
    document.addEventListener('website-content:rendered',bindFields);
    store.apply();bindFields();updateStatus();
    toolbar.querySelector('.save').addEventListener('click',save);
    toolbar.querySelector('.revert').addEventListener('click',()=>{
      if(confirm('Discard your unsaved changes?')){store.revert();updateStatus('Changes reverted');}
    });
    toolbar.querySelector('.reload').addEventListener('click',async()=>{
      if(busy)return;
      if(Object.keys(store.changed()).length&&!confirm('Discard unsaved changes and load the latest saved content?'))return;
      busy=true;updateStatus('Loading latest…');
      try{await authorised();store.accept(await loadSnapshot(),true);updateStatus('Loaded latest ✓');}
      catch(e){updateStatus(e.message);}
      finally{busy=false;updateStatus(toolbar.querySelector('.admin-status').textContent);}
    });
    toolbar.querySelector('.logout').addEventListener('click',async()=>{
      if(Object.keys(store.changed()).length&&!confirm('Log out and discard unsaved changes?'))return;
      const {error}=await client.auth.signOut({scope:'local'});
      if(error){updateStatus('Logout failed. Please try again.');return;}
      location.reload();
    });
  }catch(e){
    if(!document.getElementById('admin-gate')){editing=false;location.reload();return;}
    showGate(e.message);
  }finally{checking=false;}
}
async function save(){
  if(busy)return;
  const changes=store.changed();
  if(!Object.keys(changes).length)return;
  if(Object.entries(changes).some(([key,val])=>!validateValue(store.fields.get(key),val))){updateStatus('Correct invalid content before saving.');return;}
  busy=true;updateStatus('Saving…');
  try{
    await authorised();
    const {data,error}=await client.rpc('save_website_content',{expected_revision:store.revision,changes});
    if(error){
      if(error.message?.includes('CONTENT_CONFLICT'))throw new Error('Another session saved changes. Use Load latest before saving again.');
      if(error.message?.includes('NOT_AUTHORISED')){lockEditor();throw new Error('Your admin access has been removed.');}
      throw new Error('Save could not be confirmed. Keep this page open; use Load latest before retrying.');
    }
    store.accept(data,true);
    try{localStorage.setItem('pss-content-saved',String(Date.now()));}catch{}
    updateStatus('Saved ✓');
  }catch(e){updateStatus(e.message);}
  finally{busy=false;updateStatus(toolbar.querySelector('.admin-status').textContent);}
}
addEventListener('beforeunload',e=>{if(editing&&Object.keys(store.changed()).length){e.preventDefault();e.returnValue='';}});
if(!config.url||!config.key){
  showGate('Editor not configured yet. Add the Supabase environment variables and deploy the build.');
}else{
  client=createClient(config.url,config.key,{auth:{storageKey:'pss-admin-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false},
    global:{fetch:(input,options={})=>fetch(input,{...options,signal:options.signal||AbortSignal.timeout(10000)})}});
  login.querySelector('button').disabled=false;message.textContent='';
  login.addEventListener('submit',async e=>{
    e.preventDefault();const b=login.querySelector('button');b.disabled=true;message.textContent='Logging in…';
    try{
      const {error}=await client.auth.signInWithPassword({email:login.elements.email.value.trim(),password:login.elements.password.value});
      login.elements.password.value='';
      if(error)throw new Error('Login failed. Check your email and password.');
      await startEditing();
    }catch(e){showGate(e.message);}
    finally{if(document.contains(b))b.disabled=false;}
  });
  client.auth.onAuthStateChange(event=>{
    if(event==='SIGNED_OUT'&&editing)location.reload();
    if(event==='TOKEN_REFRESHED'&&editing)queueMicrotask(async()=>{
      try{await authorised();}catch{location.reload();}
    });
  });
  client.auth.getSession().then(({data,error})=>{
    if(error)showGate('Session could not be restored. Please log in.');
    else if(data.session)startEditing();
  }).catch(()=>showGate('Please log in.'));
}
