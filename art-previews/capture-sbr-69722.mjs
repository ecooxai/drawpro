// Screenshot capture only; no page mutation or drawing.
import fs from 'node:fs';
const port=fs.readFileSync('/Users/ecoo/.local/share/lessagent/browsers/profile-73305FD8-525D-4DE1-9CDA-A0E363E336C8/DevToolsActivePort','utf8').split('\n')[0];
const pages=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page=pages.find(p=>p.url.includes('Astra-GPT-6-Astra-Pro-Moonlit-Cat-2100-SBR'));
if(!page) throw new Error('Requested drawing window not found');
const ws=new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
const shot=new Promise((resolve,reject)=>ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id===1){m.error?reject(m.error):resolve(m.result.data)}}));
ws.send(JSON.stringify({id:1,method:'Page.captureScreenshot',params:{format:'png',captureBeyondViewport:false}}));
const out=process.argv[2]||'art-previews/full-preview.png';
fs.writeFileSync(out,Buffer.from(await shot,'base64'));ws.close();console.log('Screenshot saved: '+out);
