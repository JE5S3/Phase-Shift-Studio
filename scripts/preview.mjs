import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.xml':'application/xml','.txt':'text/plain'};
export function previewServer(port=4173,directory='dist'){
  const root=path.resolve(directory);
  return http.createServer(async(req,res)=>{
    try{
      const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      const relative=pathname==='/admin'||pathname==='/admin/'?'/admin/index.html':pathname==='/'?'/index.html':pathname;
      let file=path.resolve(root,'.'+relative);
      if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
      if((await stat(file)).isDirectory())file=path.join(file,'index.html');
      res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
      res.end(await readFile(file));
    }catch{res.writeHead(404);res.end('Not found');}
  }).listen(port,'127.0.0.1');
}
if(process.argv[1]?.endsWith('preview.mjs')) {
  previewServer(Number(process.env.PORT)||4173);
  console.log('Preview: http://127.0.0.1:4173 and /admin');
}
