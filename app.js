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
const state={id:'',name:'',customName:false,createdAt:0,updatedAt:0,tool:'pen',color:palette[0][1],size:10,opacity:100,zoom:1,fit:false,ops:[],index:0,floor:0,recent:[],ready:false};
let active=null,pointerId=null,frame=0,hover=null,toastTimer=0,db=null,saveError=false,saveQueue=Promise.resolve(),saveVersion=0,savedVersion=0,switchBusy=false,thumbnailDirty=true,thumbnailCache='';
const revisions=new Map(),redirects=new Map(),cursor=$('#brush-cursor');
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2700);}
function timestampName(time){const d=new Date(time),p=(n,l=2)=>String(n).padStart(l,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}.${p(d.getMinutes())}.${p(d.getSeconds())}.${p(d.getMilliseconds(),3)}`;}
function freshDocument(){const now=Date.now();return{kind:'painting',schema:2,id:crypto.randomUUID(),name:timestampName(now),customName:false,createdAt:now,updatedAt:now,revision:0,width:500,height:500,ops:[],index:0,floor:0,color:palette[0][1],tool:'pen',size:10,opacity:100,recent:[]};}
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

function updateUI() {
 document.documentElement.style.setProperty('--color', state.color);
 $('#color-value').textContent = state.color.toUpperCase();
 $('#current-chip').title = colorName(state.color) + ' · edit color';
 $$('.swatch').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===state.color)));
 $$('.tool-button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===state.tool)));
 $('#size-slider').value = state.size;
 $('#size-slider').style.setProperty('--fill', ((state.size-1)/49*100)+'%');
 $('#size-slider').setAttribute('aria-valuetext', state.size+' pixels');
 $('#size-output').value = String(state.size);
 $('#opacity-slider').value = state.opacity;
 $('#opacity-slider').style.setProperty('--fill', state.opacity+'%');
 $('#opacity-output').value = state.opacity;
 $('#opacity-slider').disabled = ['eraser','eyedropper'].includes(state.tool);
 const preview = $('#size-preview');
 preview.style.width = state.size+'px'; preview.style.height = state.size+'px';
 preview.innerHTML = tipSVG(state.tool);
 $('#preview-caption').textContent = state.size+' px';
 $('#status-tool').textContent = tools.find(t=>t.id===state.tool)?.name || 'Round brush';
 $('#dimensions').textContent = W+' × '+H;
 const widthInput=$('#canvas-width-input'),heightInput=$('#canvas-height-input');if(widthInput&&document.activeElement!==widthInput)widthInput.value=W;if(heightInput&&document.activeElement!==heightInput)heightInput.value=H;
 $('#undo-button').disabled = state.index<=state.floor;
 $('#redo-button').disabled = state.index>=state.ops.length;
 $('#document-name').title = state.name;
 updateCursor();
}

function updateCursor() {
 if (!hover || document.querySelector('dialog[open]')) {cursor.hidden=true;return;}
 const r=canvas.getBoundingClientRect(), v=$('#canvas-viewport').getBoundingClientRect();
 const inside = hover.x >= Math.max(r.left,v.left) && hover.x < Math.min(r.right,v.right) && hover.y >= Math.max(r.top,v.top) && hover.y < Math.min(r.bottom,v.bottom);
 if (hover.type === 'touch' || !inside) {cursor.hidden=true;return;}
 const utility=['fill','eyedropper'].includes(state.tool), size=utility ? 18 : state.size*r.width/W;
 cursor.hidden=false; cursor.style.width=size+'px'; cursor.style.height=size+'px';
 cursor.style.left=hover.x+'px'; cursor.style.top=hover.y+'px';
 const key=[state.tool,state.color,state.opacity].join(':');
 if (cursor.dataset.tip!==key) {cursor.innerHTML=tipSVG(state.tool,true);cursor.dataset.tip=key;}
 cursor.dataset.color=state.color; cursor.dataset.size=state.size;
}

function setZoom(value, fit=false) {
 if (active) cancelStroke();
 state.fit=fit;
 const vp=$('#canvas-viewport'), pad=innerWidth<=600?32:48;
 state.zoom=fit ? Math.max(.1,Math.min(1,(vp.clientWidth-pad)/W,(vp.clientHeight-pad)/H)) : clamp(value,.1,3);
 $('#paper-shell').style.width=W*state.zoom+'px';
 $('#paper-shell').style.height=H*state.zoom+'px';
 $('#zoom-value').value=Math.round(state.zoom*100)+'%';
 $('#fit-button').classList.toggle('active',fit);
 $('#zoom-out').disabled=state.zoom<=.1;
 $('#zoom-in').disabled=state.zoom>=3;
 updateCursor();
}
$('#zoom-in').onclick=()=>setZoom(state.zoom+.1);
$('#zoom-out').onclick=()=>setZoom(state.zoom-.1);
$('#actual-button').onclick=()=>setZoom(1);
$('#fit-button').onclick=()=>setZoom(1,true);
function normalizeCanvasDimension(value,fallback){const n=Number(value);return clamp(Number.isFinite(n)?Math.round(n):fallback,1,4096);}
function closeCanvasSizePopover(){const pop=$('#canvas-size-popover');if(!pop||pop.hidden)return;pop.hidden=true;$('#dimensions').setAttribute('aria-expanded','false');}
function openCanvasSizePopover(){const pop=$('#canvas-size-popover');if(!pop)return;$('#canvas-width-input').value=W;$('#canvas-height-input').value=H;pop.hidden=false;$('#dimensions').setAttribute('aria-expanded','true');}
new ResizeObserver(()=>{if(state.fit)setZoom(1,true);else updateCursor();}).observe($('#canvas-viewport'));
$('#canvas-viewport').addEventListener('scroll',()=>{hover=null;updateCursor();});
$('#size-slider').addEventListener('input',e=>setSize(e.target.value));
$('#size-output').addEventListener('input',e=>{const raw=e.target.value.trim();if(raw==='')return;const n=Number(raw);if(Number.isFinite(n)&&n>=1&&n<=50)setSize(n);});
$('#size-output').addEventListener('change',e=>{const n=Number(e.target.value);setSize(Number.isFinite(n)?n:state.size);});
$('#size-output').addEventListener('keydown',e=>{if(e.key==='Enter')e.currentTarget.blur();});
$('#opacity-slider').addEventListener('input',e=>{state.opacity=clamp(Math.round(Number(e.target.value)),0,100);updateUI();persist();});
$('#opacity-output').addEventListener('input',e=>{if(e.target.value==='')return;const n=Number(e.target.value);if(!Number.isFinite(n))return;state.opacity=clamp(Math.round(n),0,100);updateUI();persist();});
$('#opacity-output').addEventListener('change',e=>{const n=Number(e.target.value);state.opacity=clamp(Number.isFinite(n)?Math.round(n):100,0,100);updateUI();persist();});
$('#opacity-output').addEventListener('blur',e=>{if(e.target.value==='')updateUI();});

function smoothPath(c,points) {
 c.beginPath();const p=points[0];c.moveTo(p.x,p.y);
 if(points.length===2){c.lineTo(points[1].x,points[1].y);return;}
 for(let i=1;i<points.length-1;i++){const a=points[i],b=points[i+1];c.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2);}
 const last=points.at(-1);c.lineTo(last.x,last.y);
}
function strokePath(c,op,width=op.size) {
 const p=op.points;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';
 if(p.length===1){c.beginPath();c.arc(p[0].x,p[0].y,width/2,0,Math.PI*2);c.fill();return;}
 smoothPath(c,p);c.stroke();
}

// Sweep convex brush tips along each segment. Fill the union once for uniform opacity.
function addPolygon(c, points) {
 c.moveTo(...points[0]);
 for (let i=1;i<points.length;i++) c.lineTo(...points[i]);
 c.closePath();
}
function convexHull(points) {
 const sorted=points.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lower=[], upper=[];
 for (const p of sorted) {while(lower.length>=2&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
 for (const p of sorted.reverse()) {while(upper.length>=2&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
 lower.pop();upper.pop();return lower.concat(upper);
}
function drawShapeBrush(c, op) {
 const polygon=polygonFor(op.tool,op.size);
 const stamp=p=>polygon.map(([x,y])=>[x+p.x,y+p.y]);
 c.beginPath();addPolygon(c,stamp(op.points[0]));
 if (op.tool==='star') {
  const spacing=Math.max(2,op.size*.9);let carry=0;
  for(let i=1;i<op.points.length;i++) {
   const a=op.points[i-1],b=op.points[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
   for(let distance=spacing-carry;distance<=len;distance+=spacing) addPolygon(c,stamp({x:a.x+dx*distance/len,y:a.y+dy*distance/len}));
   carry=(carry+len)%spacing;
  }
 } else {
  for(let i=1;i<op.points.length;i++) addPolygon(c,convexHull([...stamp(op.points[i-1]),...stamp(op.points[i])]));
 }
 c.fill();
}

function floodFill(target, point, color, opacity=100) {
 if (opacity <= 0) return;
 const w=target.canvas.width, h=target.canvas.height;
 const x=clamp(Math.floor(point.x*w/W),0,w-1), y=clamp(Math.floor(point.y*h/H),0,h-1);
 const image=target.getImageData(0,0,w,h), data=image.data;
 const start=y*w+x, seed=Array.from(data.slice(start*4,start*4+4));
 const replacement=rgb(color), sourceAlpha=opacity/100;
 if(seed[3]===255 && replacement.every((n,i)=>seed[i]===n))return;
 const queue=new Int32Array(w*h), visited=new Uint8Array(w*h);
 let head=0,tail=1;queue[0]=start;visited[start]=1;
 const push=i=>{if(!visited[i]){visited[i]=1;queue[tail++]=i;}};
 while(head<tail) {
  const index=queue[head++], j=index*4;
  const match=seed[3]===0 ? data[j+3]===0 : seed.every((n,i)=>Math.abs(data[j+i]-n)<=18);
  if(!match)continue;
  const destAlpha=data[j+3]/255, resultAlpha=sourceAlpha+destAlpha*(1-sourceAlpha);
  for(let c=0;c<3;c++) data[j+c]=Math.round((replacement[c]*sourceAlpha+data[j+c]*destAlpha*(1-sourceAlpha))/resultAlpha);
  data[j+3]=Math.round(resultAlpha*255);
  const col=index%w;
  if(col>0)push(index-1);if(col<w-1)push(index+1);
  if(index>=w)push(index-w);if(index<(h-1)*w)push(index+w);
 }
 target.putImageData(image,0,0);
}

const layer=mask, layerCtx=maskCtx;
function renderOp(op,target=baseCtx) {
 if(op.tool==='group'){for(const child of op.children)renderOp(child,target);return;}
 if(op.tool==='clear'){target.clearRect(0,0,W,H);return;}
 if(op.tool==='fill'){floodFill(target,op.points[0],op.color,op.opacity);return;}
 layerCtx.clearRect(0,0,W,H);layerCtx.save();layerCtx.strokeStyle=op.color;layerCtx.fillStyle=op.color;layerCtx.lineCap='round';layerCtx.lineJoin='round';layerCtx.lineWidth=op.size;
 const points=op.points,first=points[0],last=points.at(-1);
 if(polygonFor(op.tool,op.size)){drawShapeBrush(layerCtx,op);}
 else if(['rectangle','ellipse','line'].includes(op.tool)){
  layerCtx.beginPath();
  if(op.tool==='rectangle')layerCtx.rect(first.x,first.y,last.x-first.x,last.y-first.y);
  else if(op.tool==='ellipse')layerCtx.ellipse((first.x+last.x)/2,(first.y+last.y)/2,Math.abs(last.x-first.x)/2,Math.abs(last.y-first.y)/2,0,0,Math.PI*2);
  else {layerCtx.moveTo(first.x,first.y);layerCtx.lineTo(last.x,last.y);}
  if(Math.hypot(last.x-first.x,last.y-first.y)<.1){layerCtx.arc(first.x,first.y,op.size/2,0,Math.PI*2);layerCtx.fill();}else layerCtx.stroke();
 }else if(op.tool==='brush'){
  for(const [fraction,alpha] of [[1,.08],[.86,.12],[.70,.20],[.54,.32],[.38,.5]]){layerCtx.globalAlpha=alpha;strokePath(layerCtx,op,op.size*fraction);}
 }else if(op.tool==='pencil'){
  layerCtx.globalAlpha=.3;strokePath(layerCtx,op,op.size);
  layerCtx.globalAlpha=.5;strokePath(layerCtx,op,Math.max(.5,op.size*.55));
  // Fixed fine grain, reproducible on replay and not randomized on every pointer move.
  layerCtx.globalCompositeOperation='destination-out';layerCtx.globalAlpha=.24;
  const minX=Math.max(0,Math.min(...points.slice(0,8000).map(p=>p.x))-op.size),maxX=Math.min(W,Math.max(...points.slice(0,8000).map(p=>p.x))+op.size);
  const minY=Math.max(0,Math.min(...points.slice(0,8000).map(p=>p.y))-op.size),maxY=Math.min(H,Math.max(...points.slice(0,8000).map(p=>p.y))+op.size);
  for(let y=Math.floor(minY);y<maxY;y+=3)for(let x=Math.floor(minX);x<maxX;x+=3)if((x*17+y*31)%7<3)layerCtx.clearRect(x,y,.65,.65);
 }else {strokePath(layerCtx,op);}
 layerCtx.restore();target.save();target.globalCompositeOperation=op.tool==='eraser'?'destination-out':'source-over';target.globalAlpha=op.tool==='eraser'?1:op.opacity/100*(op.tool==='marker'?.33:1);target.drawImage(layer,0,0,W,H);target.restore();
}

// Committed artwork is never cleared or replaced during a live stroke.
function configureCanvas(width,height) {
 W=width;H=height;
 for(const c of [canvas,committed,mask]) {c.width=Math.round(W*DPR);c.height=Math.round(H*DPR);c.getContext('2d').setTransform(DPR,0,0,DPR,0,0);}
 thumbnailDirty=true;
}
function present() {
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(committed,0,0);ctx.restore();
}
function replay() {
 baseCtx.clearRect(0,0,W,H);
 let start=0;for(let i=state.index-1;i>=0;i--)if(state.ops[i].tool==='clear'){start=i+1;break;}
 for(let i=start;i<state.index;i++)renderOp(state.ops[i],baseCtx);
 present();thumbnailDirty=true;updateUI();
}
function commit(op) {
 state.ops=state.ops.slice(0,state.index);state.ops.push(op);state.index++;
 state.floor=Math.max(state.floor,state.index-80);
 renderOp(op,baseCtx);present();thumbnailDirty=true;updateUI();persist();
}
function undo(){cancelStroke();if(state.index<=state.floor)return;state.index--;replay();persist();}
function redo(){cancelStroke();if(state.index>=state.ops.length)return;state.index++;replay();persist();}
$('#undo-button').onclick=undo;$('#redo-button').onclick=redo;
function liveRender(){frame=0;present();if(active)renderOp(active,ctx);}
function releasePointer(){const id=pointerId;pointerId=null;if(id!==null&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);}
function cancelStroke(){if(!active)return;cancelAnimationFrame(frame);frame=0;active=null;releasePointer();present();}
function finishStroke(){if(!active)return;cancelAnimationFrame(frame);frame=0;const op=active;active=null;releasePointer();commit(op);}

function pointFor(e){const r=canvas.getBoundingClientRect();return{x:clamp((e.clientX-r.left)*W/r.width,0,W),y:clamp((e.clientY-r.top)*H/r.height,0,H)};}
function snapPoint(first,p,shape){let dx=p.x-first.x,dy=p.y-first.y;if(shape==='line'){const a=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*(Math.PI/4),len=Math.hypot(dx,dy);return{x:first.x+Math.cos(a)*len,y:first.y+Math.sin(a)*len};}const d=Math.max(Math.abs(dx),Math.abs(dy));return{x:first.x+(dx<0?-d:d),y:first.y+(dy<0?-d:d)};}
canvas.addEventListener('pointerdown',e=>{
 if(!state.ready||switchBusy||active||e.button!==0||!e.isPrimary)return;e.preventDefault();canvas.focus({preventScroll:true});const p=pointFor(e);
 if(state.tool==='eyedropper'){const rgba=ctx.getImageData(clamp(Math.floor(p.x*DPR),0,canvas.width-1),clamp(Math.floor(p.y*DPR),0,canvas.height-1),1,1).data;setColor(hex([0,1,2].map(i=>rgba[i]*rgba[3]/255+255*(1-rgba[3]/255))),true);toast(`Picked ${state.color.toUpperCase()}`);return;}
 if(state.opacity===0&&state.tool!=='eraser')return;
 const op={tool:state.tool,color:state.color,size:state.size,opacity:state.opacity,points:[p]};
 if(state.tool==='fill'){commit(op);return;}
 active=op;pointerId=e.pointerId;canvas.setPointerCapture(pointerId);liveRender();
});
function appendPointerSamples(e) {
 if(!active||e.pointerId!==pointerId)return false;
 const p=pointFor(e);
 if(['line','rectangle','ellipse'].includes(active.tool)){active.points=[active.points[0],e.shiftKey?snapPoint(active.points[0],p,active.tool):p];return true;}
 if(e.shiftKey){active.points=[active.points[0],snapPoint(active.points[0],p,'line')];return true;}
 const events=e.getCoalescedEvents?.()||[];
 for(const event of events.length?events:[e]){const next=pointFor(event),last=active.points.at(-1);if(Math.hypot(next.x-last.x,next.y-last.y)>.18)active.points.push(next);}
 return true;
}
canvas.addEventListener('pointermove',e=>{
 hover={x:e.clientX,y:e.clientY,type:e.pointerType};updateCursor();const p=pointFor(e);$('#coordinates').textContent=`X ${Math.round(p.x)}   Y ${Math.round(p.y)}`;
 if(!appendPointerSamples(e))return;e.preventDefault();
 if(!frame)frame=requestAnimationFrame(liveRender);
});
canvas.addEventListener('pointerrawupdate',e=>{if(appendPointerSamples(e)&&!frame)frame=requestAnimationFrame(liveRender);});
canvas.addEventListener('pointerup',e=>{
 if(!active||e.pointerId!==pointerId)return;appendPointerSamples(e);finishStroke();
 if(e.pointerType==='touch'){hover=null;updateCursor();}
});
canvas.addEventListener('pointercancel',cancelStroke);canvas.addEventListener('lostpointercapture',()=>{if(active)finishStroke();});
canvas.addEventListener('pointerleave',()=>{hover=null;updateCursor();$('#coordinates').textContent='X —   Y —';});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('pointermove',e=>{if(e.target!==canvas&&!active){hover=null;updateCursor();}});
window.addEventListener('blur',()=>{cancelStroke();hover=null;updateCursor();});


// Full, keyboard-accessible HSV picker with synchronized, validated HEX and RGB fields.
function normalizeHex(value){let s=String(value).trim().replace(/^#/,'');if(/^[a-f\d]{3}$/i.test(s))s=s.split('').map(c=>c+c).join('');return /^[a-f\d]{6}$/i.test(s)?'#'+s.toLowerCase():null;}
function rgbToHSV(ch){const [r,g,b]=ch.map(x=>x/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;if(d){if(max===r)h=((g-b)/d)%6;else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;h=(h*60+360)%360;}return{h,s:max?d/max:0,v:max};}
function hsvToHex({h,s,v}){const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;const a=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return hex(a.map(q=>(q+m)*255));}
let picker={h:0,s:0,v:0},pickerHex=state.color,pickerValid=true,pickerPointer=null;
function pickerUI(sync=true){pickerHex=hsvToHex(picker);$('#sv-picker').style.background=`linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,transparent),hsl(${picker.h} 100% 50%)`;$('#sv-handle').style.left=`${picker.s*100}%`;$('#sv-handle').style.top=`${(1-picker.v)*100}%`;$('#hue-slider').value=Math.round(picker.h);$('#hue-output').textContent=`${Math.round(picker.h)}°`;$('#picker-preview').style.background=pickerHex;$('#sv-picker').setAttribute('aria-valuenow',Math.round(picker.s*100));$('#sv-picker').setAttribute('aria-valuetext',`${Math.round(picker.s*100)}% saturation, ${Math.round(picker.v*100)}% brightness. Arrow keys adjust; Shift for larger steps.`);if(sync){$('#hex-input').value=pickerHex.toUpperCase();const ch=rgb(pickerHex);['red','green','blue'].forEach((c,i)=>$('#'+c+'-input').value=ch[i]);}pickerValid=true;$('#color-error').textContent='';$('#apply-color').disabled=false;}
function pickerError(message){pickerValid=false;$('#color-error').textContent=message;$('#apply-color').disabled=true;}
function openDialog(id){cancelStroke();hover=null;updateCursor();$(id).showModal();}
$('#more-colors').onclick=()=>{picker=rgbToHSV(rgb(state.color));pickerUI();openDialog('#color-dialog');};
function moveSV(e){const r=$('#sv-picker').getBoundingClientRect();picker.s=clamp((e.clientX-r.left)/r.width,0,1);picker.v=1-clamp((e.clientY-r.top)/r.height,0,1);pickerUI();}
$('#sv-picker').addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();pickerPointer=e.pointerId;e.currentTarget.focus();e.currentTarget.setPointerCapture(e.pointerId);moveSV(e);});
$('#sv-picker').addEventListener('pointermove',e=>{if(e.pointerId===pickerPointer)moveSV(e);});
$('#sv-picker').addEventListener('pointerup',()=>{pickerPointer=null;});$('#sv-picker').addEventListener('pointercancel',()=>{pickerPointer=null;});
$('#sv-picker').addEventListener('keydown',e=>{const d=e.shiftKey?.1:.01;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')picker.s-=d;if(e.key==='ArrowRight')picker.s+=d;if(e.key==='ArrowUp')picker.v+=d;if(e.key==='ArrowDown')picker.v-=d;picker.s=clamp(picker.s,0,1);picker.v=clamp(picker.v,0,1);pickerUI();});
$('#hue-slider').addEventListener('input',e=>{picker.h=Number(e.target.value);pickerUI();});
$('#hex-input').addEventListener('input',e=>{const h=normalizeHex(e.target.value);if(!h){pickerError('Enter a valid 3- or 6-digit hex color, such as #38A99F.');return;}picker=rgbToHSV(rgb(h));pickerUI(false);const ch=rgb(h);['red','green','blue'].forEach((c,i)=>$('#'+c+'-input').value=ch[i]);});
for(const id of ['red','green','blue'])$('#'+id+'-input').addEventListener('input',()=>{const fields=['red','green','blue'].map(c=>$('#'+c+'-input').value);if(fields.some(s=>!/^\d{1,3}$/.test(s)||Number(s)>255)){pickerError('Each RGB channel must be a whole number from 0 to 255.');return;}const h=hex(fields.map(Number));picker=rgbToHSV(rgb(h));pickerUI(false);$('#hex-input').value=h.toUpperCase();});
$('#color-form').addEventListener('submit',e=>{e.preventDefault();if(!pickerValid)return;setColor(pickerHex,true);$('#color-dialog').close();toast(`${pickerHex.toUpperCase()} is on your brush`);});
$$('.dialog-close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}));

function saveStatus(text,error=false) {
 const node=$('#save-status');node.querySelector('span').textContent=text;
 node.setAttribute('aria-label',text);node.title=text;
 node.classList.toggle('error',error);node.classList.toggle('saving',text==='Saving…');
}
function openDatabase() {
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open('drawing-pro',1);
  const timer=setTimeout(()=>reject(new Error('Storage unavailable')),4000);
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('documents'))request.result.createObjectStore('documents');};
  request.onsuccess=()=>{clearTimeout(timer);resolve(request.result);};
  request.onerror=()=>{clearTimeout(timer);reject(request.error);};
  request.onblocked=()=>{clearTimeout(timer);reject(new Error('Storage blocked'));};
 });
}
function dbRead(key) {
 return new Promise((resolve,reject)=>{
  const request=db.transaction('documents').objectStore('documents').get(key);
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
 });
}
function dbWrite(entries) {
 return new Promise((resolve,reject)=>{
  const tx=db.transaction('documents','readwrite');
  for(const [key,value] of entries)tx.objectStore('documents').put(value,key);
  tx.oncomplete=()=>resolve();tx.onerror=tx.onabort=()=>reject(tx.error||new Error('Save failed'));
 });
}
function dbPaintings() {
 return new Promise((resolve,reject)=>{
  const request=db.transaction('documents').objectStore('documents').getAll();
  request.onsuccess=()=>resolve(request.result.filter(p=>p?.kind==='painting').sort((a,b)=>b.updatedAt-a.updatedAt));
  request.onerror=()=>reject(request.error);
 });
}
function thumbnail() {
 if(!thumbnailDirty)return thumbnailCache;
 const c=document.createElement('canvas');c.width=120;c.height=120;
 const t=c.getContext('2d'),scale=Math.min(120/W,120/H),w=W*scale,h=H*scale;
 t.fillStyle='#fff';t.fillRect(0,0,120,120);t.drawImage(committed,(120-w)/2,(120-h)/2,w,h);
 thumbnailCache=c.toDataURL('image/png');thumbnailDirty=false;return thumbnailCache;
}

function writePainting(payload) {
 return new Promise((resolve,reject)=>{
  const originalId=payload.id;
  payload.id=redirects.get(originalId)||originalId;
  const tx=db.transaction('documents','readwrite'),store=tx.objectStore('documents');
  const get=store.get('painting:'+payload.id);
  let forked=false;
  get.onsuccess=()=>{
   const existing=get.result,expected=revisions.get(payload.id)||0;
   if(existing && existing.revision!==expected) {
    const newId=crypto.randomUUID();redirects.set(originalId,newId);payload.id=newId;
    payload.name+=' (copy)';payload.createdAt=Date.now();payload.customName=true;forked=true;
   }
   payload.revision=(forked?0:expected)+1;
   store.put(payload,'painting:'+payload.id);
   store.put({kind:'meta',id:payload.id},'__v2_active__');
  };
  tx.oncomplete=()=>{revisions.set(payload.id,payload.revision);resolve({payload,originalId,forked});};
  tx.onerror=tx.onabort=()=>reject(tx.error||new Error('Save failed'));
 });
}

function persist() {
 if(!state.ready)return Promise.resolve(true);
 const version=++saveVersion;
 if(!db){saveError=true;saveStatus('Not saved. Export PNG to keep a copy.',true);return Promise.resolve(false);}
 state.updatedAt=Date.now();
 const payload=structuredClone({kind:'painting',schema:2,id:state.id,name:state.name.trim()||timestampName(state.createdAt),customName:state.customName,createdAt:state.createdAt,updatedAt:state.updatedAt,width:W,height:H,tool:state.tool,color:state.color,size:state.size,opacity:state.opacity,recent:state.recent,ops:state.ops,index:state.index,floor:state.floor,thumbnail:thumbnail()});
 saveStatus('Saving…');
 saveQueue=saveQueue.then(async()=>{
  try {
   const result=await writePainting(payload);
   if(state.id===result.originalId && result.forked) {
    state.id=result.payload.id;state.createdAt=result.payload.createdAt;state.name=result.payload.name;state.customName=true;
    $('#document-name').value=state.name;
    toast('Another tab changed this painting. Your version was saved as a separate copy.');
   }
   savedVersion=version;
   if(version===saveVersion){saveError=false;saveStatus('Saved in this browser');}
   return true;
  } catch(error) {
   saveError=true;saveStatus('Save failed. Export PNG to keep a copy.',true);
   toast('Browser storage could not save this painting. Export PNG before leaving.');
   return false;
  }
 });
 return saveQueue;
}

function validOp(op,depth=0) {
 if(!op||typeof op!=='object')return false;
 if(op.tool==='clear')return true;
 if(op.tool==='group')return depth<2&&Array.isArray(op.children)&&op.children.length<1000&&op.children.every(p=>validOp(p,depth+1));
 const known=tools.some(t=>t.id===op.tool)||['marker','pencil','brush'].includes(op.tool);
 return known&&!!normalizeHex(op.color)&&Number.isFinite(op.size)&&op.size>=1&&op.size<=50&&Number.isFinite(op.opacity)&&op.opacity>=0&&op.opacity<=100&&Array.isArray(op.points)&&op.points.length>0&&op.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.abs(p.x)<100000&&Math.abs(p.y)<100000);
}
function loadDocument(record) {
 if(!record||!Array.isArray(record.ops)||!record.ops.every(op=>validOp(op)))throw new Error('Painting data is not readable');
 cancelStroke();
 // Document switches happen after the write queue drains. Old fork aliases must not redirect explicit opens.
 redirects.clear();
 Object.assign(state,{id:record.id,name:record.name,customName:!!record.customName,createdAt:record.createdAt,updatedAt:record.updatedAt,ops:structuredClone(record.ops),index:clamp(record.index||0,0,record.ops.length),floor:record.floor||0,color:normalizeHex(record.color)||palette[0][1],tool:tools.some(t=>t.id===record.tool)?record.tool:'pen',size:clamp(record.size||10,1,50),opacity:clamp(record.opacity??100,0,100),recent:record.recent||[]});
 state.floor=clamp(state.floor,0,state.index);
 revisions.set(state.id,record.revision||0);
 configureCanvas(clamp(record.width||500,1,4096),clamp(record.height||500,1,4096));
 $('#document-name').value=state.name;
 replay();renderRecent();setZoom(1,false);
 $('#canvas-viewport').scrollTo(0,0);
}

async function migrateLegacy() {
 if(await dbRead('__v2_migrated__'))return;
 const old=await dbRead('current'),entries=[];
 if(old?.schema===1 && Array.isArray(old.ops) && old.ops.every(op=>validOp(op))) {
  const record=freshDocument();
  Object.assign(record,{width:1200,height:800,ops:old.ops,index:old.index??old.ops.length,floor:old.floor||0,revision:1,color:old.color,tool:old.tool,size:old.size,opacity:old.opacity,recent:old.recent||[],imported:true});
  if(old.name?.trim() && old.name!=='Untitled canvas'){record.name=old.name;record.customName=true;}
  loadDocument(record);record.thumbnail=thumbnail();
  entries.push(['painting:'+record.id,record]);
 }
 entries.push(['__v2_migrated__',{kind:'meta',at:Date.now()}]);
 await dbWrite(entries);
}
function requestedPaintingName() {
 const value=new URLSearchParams(location.search).get('name');
 if(value===null)return '';
 return value.trim().slice(0,80);
}
async function documentForStartup() {
 const requested=requestedPaintingName();
 if(requested) {
  const paintings=await dbPaintings();
  const existing=paintings.find(p=>p.name===requested);
  if(existing)return existing;
  const created=freshDocument();
  created.name=requested;created.customName=true;
  return created;
 }
 const current=await dbRead('__v2_active__');
 return current?.id?await dbRead('painting:'+current.id):null;
}
async function init() {
 try {
  db=await openDatabase();
  db.onversionchange=()=>{db.close();db=null;saveError=true;saveStatus('Storage changed. Reload to reconnect.',true);};
  await migrateLegacy();
  const startup=await documentForStartup();
  loadDocument(startup||freshDocument());
  state.ready=true;await persist();
 } catch(error) {
  db=null;saveError=true;
  const fallback=freshDocument(),requested=requestedPaintingName();
  if(requested){fallback.name=requested;fallback.customName=true;}
  loadDocument(fallback);state.ready=true;
  saveStatus('Local save unavailable. Export PNG to keep a copy.',true);
  toast('Browser storage is unavailable. Export PNG to keep your work.');
 }
 updateUI();document.body.dataset.ready='true';
}

let galleryRecords=[];
function renderGallery() {
 const list=$('#gallery-list'),query=$('#gallery-search').value.trim().toLowerCase();list.replaceChildren();
 const records=galleryRecords.filter(p=>p.name.toLowerCase().includes(query));
 $('#gallery-count').textContent=galleryRecords.length+' paintings · saved in this browser';
 $('#gallery-empty').hidden=records.length>0;
 for(const record of records) {
  const row=document.createElement('button');row.className='painting-row';row.dataset.id=record.id;
  row.setAttribute('aria-current',String(record.id===state.id));row.setAttribute('aria-label','Open '+record.name);
  const image=document.createElement('img');image.alt='Preview of '+record.name;
  if(record.thumbnail?.startsWith('data:image/png'))image.src=record.thumbnail;
  const info=document.createElement('span');info.className='painting-info';
  const name=document.createElement('span');name.className='painting-name';name.textContent=record.name;
  const date=document.createElement('span');date.className='painting-date';date.textContent=new Date(record.updatedAt).toLocaleString();
  const dimensions=document.createElement('span');dimensions.className='painting-dimensions';dimensions.textContent=record.width+' × '+record.height+' px'+(record.id===state.id?' · open':'');
  info.append(name,date,dimensions);row.append(image,info);row.insertAdjacentHTML('beforeend',icon('arrow'));
  row.onclick=()=>openPainting(record.id);list.append(row);
 }
}
$('#gallery-search').addEventListener('input',renderGallery);

function busy(value){switchBusy=value;$('#new-button').disabled=value;$('#gallery-button').disabled=value;}
$('#new-button').onclick=async()=>{
 if(switchBusy)return;finishStroke();busy(true);
 try {
  if(!await persist())return;
  loadDocument(freshDocument());await persist();
 } finally {busy(false);}
};
$('#gallery-button').onclick=async()=>{
 if(switchBusy)return;finishStroke();busy(true);
 try {
  if(!await persist())return;
  galleryRecords=await dbPaintings();$('#gallery-search').value='';renderGallery();openDialog('#gallery-dialog');
 } catch(error){toast('Could not open saved paintings. Your current painting is still here.');}
 finally{busy(false);}
};
async function openPainting(id) {
 if(switchBusy)return;busy(true);
 try {
  if(!await persist())return;
  const record=await dbRead('painting:'+id);
  if(!record)throw new Error('Painting not found');
  loadDocument(record);await persist();$('#gallery-dialog').close();
 }catch(error){toast('This painting could not be opened. The saved copy was not changed.');}
 finally{busy(false);}
}
$('#document-name').addEventListener('input',e=>{state.name=e.target.value.slice(0,80);state.customName=!!state.name.trim();persist();});
$('#document-name').addEventListener('blur',()=>{if(!state.name.trim()){state.name=timestampName(state.createdAt);state.customName=false;$('#document-name').value=state.name;persist();}});
$('#document-name').addEventListener('keydown',e=>{if(e.key==='Enter')e.target.blur();});

$('#clear-button').onclick=()=>openDialog('#clear-dialog');$('#cancel-clear').onclick=()=>$('#clear-dialog').close();$('#confirm-clear').onclick=()=>{$('#clear-dialog').close();commit({tool:'clear'});toast('Canvas cleared. Undo brings it back.');};
$('#help-button').onclick=()=>openDialog('#help-dialog');
const editable = el => el?.matches('input:not([type=range]),textarea,select,[contenteditable=true]');
document.addEventListener('keydown',e=>{
 if(e.isComposing||editable(e.target)||document.querySelector('dialog[open]'))return;
 if(e.key==='Escape'){cancelStroke();return;}
 const key=e.key.toLowerCase();if(e.metaKey||e.ctrlKey){if(key==='z'){e.preventDefault();e.shiftKey?redo():undo();}else if(key==='y'){e.preventDefault();redo();}return;}
 if(e.altKey||active)return;
 const color=palette.find(p=>p[2]===key),tool=tools.find(t=>t.key===key);
 if(color){e.preventDefault();setColor(color[1],false,true);}else if(tool){e.preventDefault();setTool(tool.id,true);}else if(key==='e'){e.preventDefault();setTool('eraser',true);}else if(key==='f'){e.preventDefault();setTool('fill',true);}else if(key==='['){e.preventDefault();setSize(state.size-(e.shiftKey?5:1));}else if(key===']'){e.preventDefault();setSize(state.size+(e.shiftKey?5:1));}else if(key==='?'){e.preventDefault();openDialog('#help-dialog');}
});

$('#current-chip').onclick=()=>$('#more-colors').click();

$('#export-button').onclick=()=>{
 if(active)cancelStroke();const output=document.createElement('canvas');output.width=W;output.height=H;const c=output.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,W,H);c.drawImage(canvas,0,0,W,H);
 output.toBlob(blob=>{if(!blob){toast('Export failed. Please try again.');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(state.name.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g,'-')||'Untitled canvas')+'.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('PNG exported · '+W+' × '+H+' px');},'image/png');
};


window.addEventListener('beforeunload',e=>{
 if(active||(saveError&&state.index>0)||savedVersion<saveVersion){e.preventDefault();e.returnValue='';}
});
Object.defineProperty(window,'drawingPro',{value:Object.freeze({
 version:'2.0.0',
 getState:()=>structuredClone({...state,dpr:DPR,width:W,height:H,active:!!active,saving:savedVersion<saveVersion})
})});
init();
function applyCanvasDimensions(width,height){
 const nextW=normalizeCanvasDimension(width,W);
 const nextH=normalizeCanvasDimension(height,H);
 if(nextW===W && nextH===H){closeCanvasSizePopover();return;}
 cancelStroke();
 configureCanvas(nextW,nextH);
 replay();
 setZoom(1,false);
 persist();
 closeCanvasSizePopover();
 toast(`Canvas resized to ${nextW} × ${nextH}`);
}
function applyCanvasSizeInputs(){applyCanvasDimensions($('#canvas-width-input').value,$('#canvas-height-input').value);}
$('#dimensions').addEventListener('click',()=>{$('#canvas-size-popover').hidden?openCanvasSizePopover():closeCanvasSizePopover();});
$('#apply-canvas-size').addEventListener('click',applyCanvasSizeInputs);
for(const button of $$('[data-canvas-size]'))button.addEventListener('click',()=>{
 const preset=button.dataset.canvasSize;
 if(preset==='max'){
  const vp=$('#canvas-viewport');
  const style=getComputedStyle($('#paper-area'));
  const horizontal=(parseFloat(style.paddingLeft)||0)+(parseFloat(style.paddingRight)||0);
  const vertical=(parseFloat(style.paddingTop)||0)+(parseFloat(style.paddingBottom)||0);
  applyCanvasDimensions(Math.max(1,vp.clientWidth-horizontal),Math.max(1,vp.clientHeight-vertical));
 }else{
  const size=Number(preset);
  applyCanvasDimensions(size,size);
 }
});
for(const input of [$('#canvas-width-input'),$('#canvas-height-input')]){
 input.addEventListener('keydown',e=>{
  if(e.key==='Enter'){e.preventDefault();applyCanvasSizeInputs();}
  if(e.key==='Escape'){e.preventDefault();closeCanvasSizePopover();$('#dimensions').focus();}
 });
 input.addEventListener('change',e=>{e.target.value=normalizeCanvasDimension(e.target.value,e.target.id==='canvas-width-input'?W:H);});
}
