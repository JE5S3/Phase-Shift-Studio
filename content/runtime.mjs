import {WebsiteContent} from './core.mjs';
const config=window.PSS_CONTENT_CONFIG || {};
const manifest=window.PSS_CONTENT_MANIFEST;
window.PSSContent=new WebsiteContent(manifest);
export async function readContent() {
  if(!config.url||!config.key)throw new Error('Supabase is not configured');
  const response=await fetch(config.url+'/rest/v1/rpc/read_website_content',{
    method:'GET', headers:{apikey:config.key}, cache:'no-store', signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error('Website content is unavailable');
  return response.json();
}
window.PSSReadContent=readContent;
if(!window.PSS_ADMIN){
  let pending=false;
  async function refresh() {
    if(pending||document.hidden||!config.url||!config.key)return;
    pending=true;
    try {window.PSSContent.accept(await readContent());}
    catch { /* Original HTML and last successfully loaded content remain visible. */ }
    finally {pending=false;}
  }
  refresh();
  addEventListener('focus',refresh);
  addEventListener('storage',e=>{if(e.key==='pss-content-saved')refresh();});
  document.addEventListener('visibilitychange',refresh);
  setInterval(refresh,15000);
}
