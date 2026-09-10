/** Drawing Pro 2: fixed-size art and a local painting gallery. */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const DPR = Math.min(2, Math.max(1, devicePixelRatio || 1));
let W = 500, H = 500;
const palette = [
  ['Ink black','#252629','k'],['Slate gray','#8c939b','a'],['White','#ffffff','w'],['Brown','#946443','n'],
  ['Red','#e74c4c','r'],['Orange','#f39743','o'],['Yellow','#f2cb4c','y'],['Lime','#accb51','l'],
  ['Green','#47a86b','g'],['Teal','#38a99f','t'],['Cyan','#56bfd5','c'],['Blue','#4b80d4','b'],
  ['Indigo','#6664bb','i'],['Purple','#9563c7','p'],['Magenta','#d665a5','m'],['Pink','#f0a7b9','s']
];
const paths = {
 pen:'<path d="m5 19 2-6L17 3l4 4-10 10-6 2Zm3-7 4 4M15 5l4 4M4 21h16"/>',
 pencil:'<path d="m5 19 1-5L17 3a2 2 0 0 1 3 3L9 17l-4 2Zm2-6 4 4M15 5l4 4M5 19l-1 1"/>',
 marker:'<path d="m7 13 6-9a2 2 0 0 1 3-.5l3 2a2 2 0 0 1 .5 3L13 17 7 13Zm0 0-2 4 5 3 3-3M5 17l-2 4 7-1"/>',
 brush:'<path d="M14 12 20 3c1-2 3 0 2 1l-7 9M14 12c-4-3-7 1-7 4s-3 4-3 4c7 2 12-1 10-8Z"/>',
 eraser:'<path d="m3 14 9-10a2 2 0 0 1 3 0l6 6a2 2 0 0 1 0 3l-7 8H9l-6-5a1 1 0 0 1 0-2Zm4-4 10 8M14 21h8"/>',
 line:'<path d="M5 19 19 5"/><circle cx="5" cy="19" r="1.5"/><circle cx="19" cy="5" r="1.5"/>',
 rectangle:'<rect x="4" y="4" width="16" height="16" rx="1.5"/>',
 ellipse:'<circle cx="12" cy="12" r="8"/>',
 fill:'<path d="m5 8 6-6 9 9-10 10L1 12l4-4Zm0 0 8 8M8 3l6 6M18 19c0-2 3-5 3-5s3 3 3 5a3 3 0 0 1-6 0Z"/>',
 eyedropper:'<path d="m14 5 5 5M13 6l4-4 5 5-4 4M14 7 4 17v3h3L17 10M4 20l-2 2"/>',
 undo:'<path d="M9 5 4 10l5 5M4 10h11a5 5 0 0 1 0 10h-3"/>',
 redo:'<path d="m15 5 5 5-5 5m5-5H9a5 5 0 0 0 0 10h3"/>',
 trash:'<path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
 keyboard:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.1M10 9h.1M14 9h.1M18 9h.1M6 12h.1M10 12h.1M14 12h.1M18 12h.1M7 16h10"/>',
 download:'<path d="M12 3v12m-4-4 4 4 4-4M4 15v5h16v-5"/>',
 document:'<path d="M5 2h9l5 5v15H5V2Zm9 0v6h5M9 13h6m-6 4h6"/>',
 sparkles:'<path d="m12 3 2 6 6 3-6 2-2 7-2-7-6-2 6-3 2-6Zm7-2 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>',
 mouse:'<rect x="6" y="2" width="12" height="20" rx="6"/><path d="M12 2v7"/>',
 close:'<path d="m6 6 12 12M18 6 6 18"/>',
 arrow:'<path d="M4 12h16m-5-5 5 5-5 5"/>',
 scribble:'<path d="M2 16c6-11 11-9 8-3S1 25 4 25c5 0 17-21 18-20 3 1-9 21-6 21s20-23 21-21-14 20-10 20 18-16 17-11-7 13-2 12 9-9 13-8"/>'
};
const tools=[{id:'pen',name:'Round brush',key:'1'},{id:'square',name:'Square brush',key:'2'},{id:'triangle',name:'Triangle brush',key:'3'},{id:'diamond',name:'Diamond brush',key:'4'},{id:'chisel',name:'Flat brush',key:'v'},{id:'star',name:'Star stamp',key:'u'},{id:'eraser',name:'Eraser',key:'5'},{id:'line',name:'Line',key:'6'},{id:'rectangle',name:'Rectangle outline',key:'7'},{id:'ellipse',name:'Ellipse outline',key:'8'},{id:'fill',name:'Fill bucket',key:'9'},{id:'eyedropper',name:'Eyedropper',key:'0'}];
Object.assign(paths,{
pen:'<circle cx="12" cy="12" r="7" fill="currentColor" stroke="none"/>',
square:'<rect x="5" y="5" width="14" height="14" fill="currentColor" stroke="none"/>',
triangle:'<path d="m12 4 9 16H3Z" fill="currentColor" stroke="none"/>',
diamond:'<path d="m12 3 9 9-9 9-9-9Z" fill="currentColor" stroke="none"/>',
chisel:'<path d="M3 10 20 6l1 7-17 4Z" fill="currentColor" stroke="none"/>',
star:'<path d="m12 2 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1Z" fill="currentColor" stroke="none"/>',
new:'<path d="M13 2H5v20h14V8l-6-6v6h6M8 14h8m-4-4v8"/>',folder:'<path d="M2 7V4h7l3 3h10v13H2V7Zm0 4h20"/>',
size:'<path d="M4 8v8m16-8v8M4 12h16m-3-3 3 3-3 3M7 9l-3 3 3 3"/>',opacity:'<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" stroke="none"/>',
plus:'<path d="M5 12h14M12 5v14"/>',minus:'<path d="M5 12h14"/>',fit:'<path d="M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6"/>'});
const icon=id=>`<svg viewBox="0 0 24 24" aria-hidden="true">${paths[id]||paths.pen}</svg>`;
$$('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const hex=ch=>'#'+ch.map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
const colorName=c=>palette.find(p=>p[1]===c)?.[0]||'Custom color';
const canvas=$('#drawing-canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
const committed=document.createElement('canvas'),baseCtx=committed.getContext('2d',{willReadFrequently:true});
const mask=document.createElement('canvas'),maskCtx=mask.getContext('2d');
const state={id:'',name:'',customName:false,createdAt:0,updatedAt:0,tool:'pen',color:palette[0][1],size:50,opacity:100,zoom:1,fit:false,ops:[],index:0,floor:0,recent:[],ready:false};
let active=null,pointerId=null,frame=0,hover=null,toastTimer=0,db=null,saveError=false,saveQueue=Promise.resolve(),saveVersion=0,savedVersion=0,switchBusy=false,thumbnailDirty=true,thumbnailCache='';
const revisions=new Map(),redirects=new Map(),cursor=$('#brush-cursor');
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2700);}
function timestampName(time){const d=new Date(time),p=(n,l=2)=>String(n).padStart(l,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}.${p(d.getMinutes())}.${p(d.getSeconds())}.${p(d.getMilliseconds(),3)}`;}
function freshDocument(){const now=Date.now();return{kind:'painting',schema:2,id:crypto.randomUUID(),name:timestampName(now),customName:false,createdAt:now,updatedAt:now,revision:0,width:500,height:500,ops:[],index:0,floor:0,color:palette[0][1],tool:'pen',size:50,opacity:100,recent:[]};}
function renderRecent(){const root=$('#recent-colors');root.replaceChildren();for(const color of state.recent){const b=document.createElement('button');b.className='recent-swatch';b.style.setProperty('--swatch',color);b.title=`Recent ${color.toUpperCase()}`;b.setAttribute('aria-label',b.title);b.onclick=()=>setColor(color);root.append(b);}}
function setColor(value,recent=false,announce=false){const c=normalizeHex(value);if(!c)return;state.color=c;if(recent&&!palette.some(p=>p[1]===c)){state.recent=[c,...state.recent.filter(x=>x!==c)].slice(0,6);renderRecent();}updateUI();persist();if(announce)toast(`${colorName(c)} selected`);}
function setTool(id,announce=false){if(!tools.some(t=>t.id===id))return;state.tool=id;updateUI();persist();if(announce)toast(tools.find(t=>t.id===id).name);}
function setSize(value){state.size=clamp(Math.round(Number(value)||1),1,50);updateUI();persist();}
for(const [name,color,key] of palette){const b=document.createElement('button');b.className=`swatch${color==='#ffffff'?' white':''}`;b.dataset.color=color;b.dataset.key=key;b.style.setProperty('--swatch',color);const [r,g,bl]=rgb(color);b.style.setProperty('--key-color',r*.299+g*.587+bl*.114>170?'#4d553f':'#fff');b.title=`${name} (${key.toUpperCase()})`;b.setAttribute('aria-label',b.title);b.setAttribute('aria-keyshortcuts',key.toUpperCase());b.innerHTML=`<kbd>${key.toUpperCase()}</kbd>`;b.onclick=()=>setColor(color);$('#palette').append(b);const h=document.createElement('div');h.innerHTML=`<kbd>${key.toUpperCase()}</kbd><i style="--swatch:${color}"></i><span>${name.replace('Ink ','').replace('Slate ','')}</span>`;$('#color-shortcuts').append(h);}
tools.forEach((tool,i)=>{const b=document.createElement('button');b.className='tool-button';b.dataset.tool=tool.id;b.title=`${tool.name} (${tool.key.toUpperCase()})`;b.setAttribute('aria-label',b.title);b.setAttribute('aria-keyshortcuts',tool.key);b.innerHTML=icon(tool.id);b.onclick=()=>setTool(tool.id);$(i<6?'#pen-tools':'#shape-tools').append(b);const h=document.createElement('div');h.innerHTML=`<kbd>${tool.key.toUpperCase()}</kbd>${tool.name}`;$('#tool-shortcuts').append(h);});
function polygonFor(tool, size) {
 const h = size / 2;
 if (tool === 'square') return [[-h,-h],[h,-h],[h,h],[-h,h]];
 if (tool === 'triangle') return [[0,-h],[h,h],[-h,h]];
 if (tool === 'diamond') return [[0,-h],[h,0],[0,h],[-h,0]];
 if (tool === 'chisel') return [[-h,-h*.25],[h,-h*.65],[h,h*.25],[-h,h*.65]];
 if (tool !== 'star') return null;
 const points = Array.from({length:10}, (_,i) => {
  const a = -Math.PI/2+i*Math.PI/5, r = i%2 ? h*.43 : h;
  return [Math.cos(a)*r, Math.sin(a)*r];
 });
 const xs = points.map(p=>p[0]), ys = points.map(p=>p[1]);
 const x0 = Math.min(...xs), x1 = Math.max(...xs);
 const y0 = Math.min(...ys), y1 = Math.max(...ys);
 return points.map(([x,y]) => [(x-x0)/(x1-x0)*size-h, (y-y0)/(y1-y0)*size-h]);
}
function tipSVG(tool, outline=false) {
 const poly = polygonFor(tool,50);
 const shape = poly ? `<path d="M${poly.map(p=>p.join(',')).join('L')}Z"` : '<circle cx="0" cy="0" r="25"';
 if (['fill','eyedropper'].includes(tool)) return `<svg viewBox="-12 -12 24 24"><path d="M-10 0H10M0-10V10" fill="none" stroke="${state.color}" stroke-width="1.2"/></svg>`;
 const fill = tool === 'eraser' ? '#ffffff' : state.color;
 const alpha = tool === 'eraser' ? 0.35 : state.opacity/100;
 const border = outline ? '#ffffff' : 'none';
 return `<svg viewBox="-25 -25 50 50">${shape} fill="${fill}" fill-opacity="${alpha}" stroke="${border}" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>`;
}
