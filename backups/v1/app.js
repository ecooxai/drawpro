/** Drawing Pro: dependency-free, local-first canvas editor. Artwork coordinates are always 1200×800. */
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const W = 1200, H = 800, DPR = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const palette = [
  ['Ink black','#252629','k'],['Slate gray','#8c939b','a'],['White','#ffffff','w'],['Brown','#946443','n'],
  ['Red','#e74c4c','r'],['Orange','#f39743','o'],['Yellow','#f2cb4c','y'],['Lime','#accb51','l'],
  ['Green','#47a86b','g'],['Teal','#38a99f','t'],['Cyan','#56bfd5','c'],['Blue','#4b80d4','b'],
  ['Indigo','#6664bb','i'],['Purple','#9563c7','p'],['Magenta','#d665a5','m'],['Pink','#f0a7b9','s']
];
const tools = [
  {id:'pen',name:'Ink pen',label:'Pen',key:'1'}, {id:'pencil',name:'Pencil',label:'Pencil',key:'2'},
  {id:'marker',name:'Marker',label:'Marker',key:'3'}, {id:'brush',name:'Soft brush',label:'Brush',key:'4'},
  {id:'eraser',name:'Eraser',label:'Eraser',key:'5'}, {id:'line',name:'Line',label:'Line',key:'6'},
  {id:'rectangle',name:'Rectangle',label:'Square',key:'7'}, {id:'ellipse',name:'Ellipse',label:'Circle',key:'8'},
  {id:'fill',name:'Fill bucket',label:'Fill',key:'9'}, {id:'eyedropper',name:'Eyedropper',label:'Pick',key:'0'}
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
const icon = name => `<svg viewBox="0 0 ${name==='scribble'?'58 32':'24 24'}" aria-hidden="true">${paths[name] || paths.pen}</svg>`;
$$('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
const canvas = $('#drawing-canvas');
canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
const ctx = canvas.getContext('2d', {willReadFrequently:true});
const makeSurface = () => { const c=document.createElement('canvas'); c.width=canvas.width;c.height=canvas.height;return c; };
const scratch=makeSurface(), scratchCtx=scratch.getContext('2d');
const layer=makeSurface(), layerCtx=layer.getContext('2d');
ctx.setTransform(DPR,0,0,DPR,0,0);layerCtx.setTransform(DPR,0,0,DPR,0,0);
const state = {tool:'pen',color:palette[0][1],size:12,opacity:100,zoom:1,fit:true,ops:[],index:0,floor:0,recent:[],name:'Untitled canvas',ready:false};
let active=null, pointerId=null, frame=0, hover=null, toastTimer=0, db=null, saveVersion=0, savedVersion=0, saveError=false;
const cursor=$('#brush-cursor');
function toast(message) { $('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2400); }
const colorName = hex => palette.find(p=>p[1]===hex)?.[0] || 'Custom color';
const rgb = hex => [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const hex = channels => '#'+channels.map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
function setColor(value, recent=false, announce=false) {
 const normalized=normalizeHex(value);if(!normalized)return;state.color=normalized;
 if(recent && !palette.some(p=>p[1]===normalized)) {state.recent=[normalized,...state.recent.filter(c=>c!==normalized)].slice(0,6);renderRecent();}
 updateUI();persist();if(announce)toast(`${colorName(normalized)} selected`);
}
function setTool(id, announce=false) { if(!tools.some(t=>t.id===id))return;state.tool=id;updateUI();persist();if(announce)toast(`${tools.find(t=>t.id===id).name} selected`); }
function setSize(value) {state.size=clamp(Math.round(Number(value)||1),1,50);updateUI();persist();}
function renderRecent() {
 $('#recent-colors').replaceChildren();$('#recent-empty').hidden=state.recent.length>0;
 for(const color of state.recent) {const b=document.createElement('button');b.className='recent-swatch';b.style.setProperty('--swatch',color);b.title=color.toUpperCase();b.setAttribute('aria-label',`Recent color ${color.toUpperCase()}`);b.onclick=()=>setColor(color);$('#recent-colors').append(b);}
}
for(const [name,color,key] of palette) {
 const b=document.createElement('button');b.className=`swatch${color==='#ffffff'?' white':''}`;b.dataset.color=color;b.dataset.key=key;
 b.style.setProperty('--swatch',color);const [r,g,bl]=rgb(color);b.style.setProperty('--key-color',(r*.299+g*.587+bl*.114)>170?'#454838':'#fff');
 b.title=`${name} (${key.toUpperCase()})`;b.setAttribute('aria-label',`${name} (${key.toUpperCase()})`);b.setAttribute('aria-keyshortcuts',key.toUpperCase());b.innerHTML=`<kbd>${key.toUpperCase()}</kbd>`;b.onclick=()=>setColor(color);$('#palette').append(b);
 const h=document.createElement('div');h.innerHTML=`<kbd>${key.toUpperCase()}</kbd><i style="--swatch:${color}"></i><span>${name.replace('Ink ','').replace('Slate ','')}</span>`;$('#color-shortcuts').append(h);
}
tools.forEach((tool,i)=>{
 const b=document.createElement('button');b.className='tool-button';b.dataset.tool=tool.id;b.title=`${tool.name} (${tool.key})`;b.setAttribute('aria-label',`${tool.name} (${tool.key})`);b.setAttribute('aria-keyshortcuts',tool.key);b.innerHTML=`${icon(tool.id)}<span>${tool.label}</span><span class="tool-key">${tool.key}</span>`;b.onclick=()=>setTool(tool.id);$(i<5?'#pen-tools':'#shape-tools').append(b);
 const h=document.createElement('div');h.innerHTML=`<kbd>${tool.key}</kbd>${tool.name}`;$('#tool-shortcuts').append(h);
});
for(let n=0;n<=W;n+=100){const s=document.createElement('span');s.style.left=`${n/W*100}%`;s.textContent=n;$('.horizontal-ruler').append(s);}
for(let n=0;n<=H;n+=100){const s=document.createElement('span');s.style.top=`${n/H*100}%`;s.textContent=n;$('.vertical-ruler').append(s);}
function updateUI() {
 document.documentElement.style.setProperty('--color',state.color);const name=colorName(state.color);const tool=tools.find(t=>t.id===state.tool);
 $('#color-name').textContent=name;$('#color-value').textContent=state.color.toUpperCase();$('#current-chip').title=`${name} ${state.color.toUpperCase()}`;
 $$('.swatch').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===state.color)));
 $$('.tool-button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===state.tool)));
 $('#size-slider').value=state.size;$('#size-output').value=state.size;$('#size-preview').style.width=`${state.size}px`;$('#size-preview').style.height=`${state.size}px`;
 $('#size-slider').setAttribute('aria-valuetext',`${state.size} pixels`);$('#size-preview').title=`${state.size} × ${state.size} CSS pixels at 100% canvas zoom`;
 $('#opacity-slider').value=state.opacity;$('#opacity-output').textContent=`${state.opacity}%`;
 $('#opacity-slider').disabled=['eraser','fill','eyedropper'].includes(state.tool);
 $('#sidebar-size').textContent=`${state.size} px`;$('#sidebar-opacity').textContent=`${state.opacity}% opacity`;$('#brush-tool-label').textContent=tool.name.toUpperCase();
 const path=$('#stroke-preview path');path.setAttribute('stroke',state.tool==='eraser'?'#c4c9ba':state.color);path.setAttribute('stroke-width',state.size);path.setAttribute('opacity',state.opacity/100*(state.tool==='marker'?.33:state.tool==='pencil'?.65:1));
 $('#status-tool').textContent=tool.name;$('#status-color').textContent=name;$('#status-size').textContent=`${state.size} px`;
 $('#undo-button').disabled=state.index<=state.floor;$('#redo-button').disabled=state.index>=state.ops.length;
 $('#history-count').textContent=`${state.index} ${state.index===1?'mark':'marks'}`;
 $('#empty-hint').hidden=state.index>0 && state.ops[state.index-1]?.tool!=='clear';
 $('#demo-button').disabled=state.index>0 && state.ops[state.index-1]?.tool!=='clear';
 $('#demo-button').title=$('#demo-button').disabled?'Use on a blank canvas. Your existing artwork is never replaced.':'Add an undoable sample illustration';
 updateCursor();
}
function updateCursor() {
 if(!hover || document.querySelector('dialog[open]')) {cursor.hidden=true;return;}
 const rect=canvas.getBoundingClientRect();const inside=hover.x>=rect.left&&hover.x<=rect.right&&hover.y>=rect.top&&hover.y<=rect.bottom;
 const vp=$('#canvas-viewport').getBoundingClientRect();const visible=hover.x>=vp.left&&hover.x<vp.right&&hover.y>=vp.top&&hover.y<vp.bottom;
 if(!inside||!visible||hover.type==='touch'){cursor.hidden=true;return;}
 cursor.hidden=false;const utility=['fill','eyedropper'].includes(state.tool);const diameter=utility?18:state.size*rect.width/W;
 cursor.style.width=`${diameter}px`;cursor.style.height=`${diameter}px`;cursor.style.left=`${hover.x}px`;cursor.style.top=`${hover.y}px`;
 cursor.className=utility?'utility':state.tool==='eraser'?'eraser':'';cursor.dataset.color=state.color;cursor.dataset.size=String(state.size);
}
function setZoom(value,fit=false) {
 if(active)cancelStroke();state.fit=fit;const vp=$('#canvas-viewport');const mobile=innerWidth<=740;
 state.zoom=fit?Math.max(.1,Math.min(1,(vp.clientWidth-(mobile?58:90))/W,(vp.clientHeight-62)/H)):clamp(value,.1,2);
 $('#paper-shell').style.width=`${W*state.zoom}px`;$('#paper-shell').style.height=`${H*state.zoom}px`;
 $('#zoom-value').value=`${Math.round(state.zoom*100)}%`;$('#fit-button').classList.toggle('active',fit);$('#actual-button').classList.toggle('active',!fit&&state.zoom===1);
 $('#zoom-out').disabled=state.zoom<=.1;$('#zoom-in').disabled=state.zoom>=2;updateCursor();
}
$('#zoom-in').onclick=()=>setZoom(state.zoom+.1);$('#zoom-out').onclick=()=>setZoom(state.zoom-.1);$('#fit-button').onclick=()=>setZoom(1,true);$('#actual-button').onclick=()=>setZoom(1);
new ResizeObserver(()=>{if(state.fit)setZoom(1,true);else updateCursor();}).observe($('#canvas-viewport'));
$('#canvas-viewport').addEventListener('scroll',()=>{hover=null;updateCursor();});
$('#size-slider').addEventListener('input',e=>setSize(e.target.value));$('#opacity-slider').addEventListener('input',e=>{state.opacity=clamp(Number(e.target.value),5,100);updateUI();persist();});

// Geometry is recorded, rather than a bitmap snapshot per history step. One scratch bitmap serves the live stroke.
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
function renderOp(op,target=ctx) {
 if(op.tool==='group'){for(const child of op.children)renderOp(child,target);return;}
 if(op.tool==='clear'){target.clearRect(0,0,W,H);return;}
 if(op.tool==='fill'){floodFill(target,op.points[0],op.color);return;}
 layerCtx.clearRect(0,0,W,H);layerCtx.save();layerCtx.strokeStyle=op.color;layerCtx.fillStyle=op.color;layerCtx.lineCap='round';layerCtx.lineJoin='round';layerCtx.lineWidth=op.size;
 const points=op.points,first=points[0],last=points.at(-1);
 if(['rectangle','ellipse','line'].includes(op.tool)){
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
function floodFill(target,point,color) {
 const c=target.canvas,w=c.width,h=c.height,sx=clamp(Math.floor(point.x*w/W),0,w-1),sy=clamp(Math.floor(point.y*h/H),0,h-1);
 const image=target.getImageData(0,0,w,h),data=image.data,start=(sy*w+sx)*4;
 const seed=[data[start],data[start+1],data[start+2],data[start+3]],replacement=[...rgb(color),255];
 if(seed.every((v,i)=>v===replacement[i]))return;
 const visited=new Uint8Array(w*h),stack=[sy*w+sx];
 const matches=i=>{if(visited[i])return false;const j=i*4;if(seed[3]===0)return data[j+3]===0;return Math.abs(data[j]-seed[0])<=18&&Math.abs(data[j+1]-seed[1])<=18&&Math.abs(data[j+2]-seed[2])<=18&&Math.abs(data[j+3]-seed[3])<=18;};
 while(stack.length){const index=stack.pop();if(!matches(index))continue;const y=Math.floor(index/w);let left=index%w;while(left>0&&matches(y*w+left-1))left--;
  let above=false,below=false;
  for(let x=left;x<w&&matches(y*w+x);x++){const i=y*w+x,j=i*4;visited[i]=1;data[j]=replacement[0];data[j+1]=replacement[1];data[j+2]=replacement[2];data[j+3]=255;
   if(y>0){const hit=matches(i-w);if(hit&&!above)stack.push(i-w);above=hit;}
   if(y<h-1){const hit=matches(i+w);if(hit&&!below)stack.push(i+w);below=hit;}
  }
 }
 target.putImageData(image,0,0);
}
function replay(){ctx.clearRect(0,0,W,H);let start=0;for(let i=state.index-1;i>=0;i--)if(state.ops[i].tool==='clear'){start=i+1;break;}for(let i=start;i<state.index;i++)renderOp(state.ops[i]);updateUI();}
function commit(op,render=true){state.ops=state.ops.slice(0,state.index);state.ops.push(op);state.index++;state.floor=Math.max(state.floor,state.index-80);if(render)renderOp(op);updateUI();persist();}
function undo(){if(active)cancelStroke();if(state.index<=state.floor)return;state.index--;replay();persist();}
function redo(){if(active)cancelStroke();if(state.index>=state.ops.length)return;state.index++;replay();persist();}
$('#undo-button').onclick=undo;$('#redo-button').onclick=redo;
function pointFor(e){const r=canvas.getBoundingClientRect();return{x:clamp((e.clientX-r.left)*W/r.width,0,W),y:clamp((e.clientY-r.top)*H/r.height,0,H)};}
function snapPoint(first,p,shape){let dx=p.x-first.x,dy=p.y-first.y;if(shape==='line'){const a=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*(Math.PI/4),len=Math.hypot(dx,dy);return{x:first.x+Math.cos(a)*len,y:first.y+Math.sin(a)*len};}const d=Math.max(Math.abs(dx),Math.abs(dy));return{x:first.x+(dx<0?-d:d),y:first.y+(dy<0?-d:d)};}
function liveRender(){frame=0;if(!active)return;ctx.clearRect(0,0,W,H);ctx.drawImage(scratch,0,0,W,H);renderOp(active);}
function cancelStroke(){if(!active)return;cancelAnimationFrame(frame);frame=0;active=null;const id=pointerId;pointerId=null;if(id!==null&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);ctx.clearRect(0,0,W,H);ctx.drawImage(scratch,0,0,W,H);updateUI();}
canvas.addEventListener('pointerdown',e=>{
 if(!state.ready||active||e.button!==0||!e.isPrimary)return;e.preventDefault();canvas.focus({preventScroll:true});const p=pointFor(e);
 if(state.tool==='eyedropper'){const rgba=ctx.getImageData(clamp(Math.floor(p.x*DPR),0,canvas.width-1),clamp(Math.floor(p.y*DPR),0,canvas.height-1),1,1).data;setColor(hex([0,1,2].map(i=>rgba[i]*rgba[3]/255+255*(1-rgba[3]/255))),true);toast(`Picked ${state.color.toUpperCase()}`);return;}
 const op={tool:state.tool,color:state.color,size:state.size,opacity:state.opacity,points:[p]};
 if(state.tool==='fill'){commit(op);return;}
 scratchCtx.clearRect(0,0,scratch.width,scratch.height);scratchCtx.drawImage(canvas,0,0);active=op;pointerId=e.pointerId;canvas.setPointerCapture(pointerId);$('#empty-hint').hidden=true;liveRender();
});
canvas.addEventListener('pointermove',e=>{
 hover={x:e.clientX,y:e.clientY,type:e.pointerType};updateCursor();const p=pointFor(e);$('#coordinates').textContent=`X ${Math.round(p.x)}   Y ${Math.round(p.y)}`;
 if(!active||e.pointerId!==pointerId)return;e.preventDefault();
 if(['line','rectangle','ellipse'].includes(active.tool))active.points=[active.points[0],e.shiftKey?snapPoint(active.points[0],p,active.tool):p];
 else if(e.shiftKey)active.points=[active.points[0],snapPoint(active.points[0],p,'line')];
 else{const events=e.getCoalescedEvents?.()||[];for(const event of events.length?events:[e]){const next=pointFor(event),last=active.points.at(-1);if(Math.hypot(next.x-last.x,next.y-last.y)>.18)active.points.push(next);}}
 if(!frame)frame=requestAnimationFrame(liveRender);
});
canvas.addEventListener('pointerup',e=>{
 if(!active||e.pointerId!==pointerId)return;const p=pointFor(e),last=active.points.at(-1);
 if(['line','rectangle','ellipse'].includes(active.tool))active.points=[active.points[0],e.shiftKey?snapPoint(active.points[0],p,active.tool):p];else if(e.shiftKey)active.points=[active.points[0],snapPoint(active.points[0],p,'line')];else if(Math.hypot(p.x-last.x,p.y-last.y)>.18)active.points.push(p);
 cancelAnimationFrame(frame);liveRender();const op=active;active=null;pointerId=null;commit(op,false);if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
 if(e.pointerType==='touch'){hover=null;updateCursor();}
});
canvas.addEventListener('pointercancel',cancelStroke);canvas.addEventListener('lostpointercapture',()=>{if(active)cancelStroke();});
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
$('#document-name').addEventListener('input',e=>{state.name=e.target.value.slice(0,80);persist();});$('#document-name').addEventListener('blur',()=>{if(!state.name.trim()){state.name='Untitled canvas';$('#document-name').value=state.name;persist();}});$('#document-name').addEventListener('keydown',e=>{if(e.key==='Enter')e.target.blur();});
$('#export-button').onclick=()=>{
 if(active)cancelStroke();const output=document.createElement('canvas');output.width=W;output.height=H;const c=output.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,W,H);c.drawImage(canvas,0,0,W,H);
 output.toBlob(blob=>{if(!blob){toast('Export failed. Please try again.');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(state.name.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g,'-')||'Untitled canvas')+'.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('PNG exported · 1200 × 800 px');},'image/png');
};

// The optional illustration is ordinary undoable brush geometry, never baked into the blank canvas.
$('#demo-button').onclick=()=>{
 if($('#demo-button').disabled)return;const children=[];
 const stroke=(color,size,points,tool='pen',opacity=100)=>children.push({tool,color,size,opacity,points:points.map(([x,y])=>({x,y}))});
 const curve=(color,size,fn,steps=80,tool='pen')=>stroke(color,size,Array.from({length:steps+1},(_,i)=>fn(i/steps)),tool);
 // Sun, undulating landscape and hand-drawn botanical study.
 curve('#f2cb4c',50,t=>[370+Math.cos(t*Math.PI*2)*69,292+Math.sin(t*Math.PI*2)*69],100);
 for(let r=45;r>=0;r-=20)curve('#f2cb4c',50,t=>[370+Math.cos(t*Math.PI*2)*r,292+Math.sin(t*Math.PI*2)*r],80);
 curve('#f1cfb7',42,t=>[188+t*805,491+Math.sin(t*Math.PI*2.5)*28],100);
 curve('#e6b798',36,t=>[197+t*804,529+Math.sin(t*Math.PI*2.7+.5)*25],100);
 curve('#cc8566',32,t=>[205+t*792,566+Math.sin(t*Math.PI*2.5+1)*24],100);
 curve('#899e7d',13,t=>[771-39*Math.sin(t*2),579-t*298],100);
 for(const [x,y,dir] of [[745,466,-1],[735,402,1],[740,352,-1],[757,500,1],[745,300,1]]){
  curve('#899e7d',17,t=>[x+dir*Math.sin(t*Math.PI)*65,y-t*60],60);
  curve('#899e7d',20,t=>[x+dir*Math.sin(t*Math.PI)*43,y-t*60],60);
 }
 curve('#435343',3,t=>[771-39*Math.sin(t*2),579-t*298],100);
 curve('#526047',4,t=>[243+150*t,615+12*Math.sin(t*8)],60);
 for(const [x,y] of [[546,272],[580,305],[879,327]]){stroke('#d69574',3,[[x-8,y],[x+8,y]]);stroke('#d69574',3,[[x,y-8],[x,y+8]]);}
 commit({tool:'group',children});setColor('#899e7d',true);toast('A little inspiration. One Undo removes the whole illustration.');
};

// IndexedDB transactions save immediately after each committed mark (not during pointer movement).
function saveStatus(text,error=false){$('#save-status span').textContent=text;$('#save-status').classList.toggle('error',error);$('#save-status').title=error?'Local save failed. Export PNG now to keep a copy.':'Artwork is saved only in this browser, on this origin.';}
function persist(){
 if(!state.ready)return;const version=++saveVersion;if(!db){saveError=true;saveStatus('Not saved · export a copy',true);return;}
 saveStatus('Saving…');
 try {const transaction=db.transaction('documents','readwrite');const payload={schema:1,name:state.name,ops:state.ops,index:state.index,floor:state.floor,color:state.color,tool:state.tool,size:state.size,opacity:state.opacity,recent:state.recent};transaction.objectStore('documents').put(payload,'current');transaction.oncomplete=()=>{savedVersion=Math.max(savedVersion,version);if(savedVersion===saveVersion){saveError=false;saveStatus('Saved on this device');}};transaction.onerror=transaction.onabort=()=>{saveError=true;saveStatus('Not saved · export a copy',true);};}catch{saveError=true;saveStatus('Not saved · export a copy',true);}
}
function openDatabase(){return new Promise((resolve,reject)=>{const request=indexedDB.open('drawing-pro',1);const timer=setTimeout(()=>reject(new Error('Storage unavailable')),4000);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('documents'))request.result.createObjectStore('documents');};request.onsuccess=()=>{clearTimeout(timer);resolve(request.result);};request.onerror=()=>{clearTimeout(timer);reject(request.error);};request.onblocked=()=>{clearTimeout(timer);reject(new Error('Storage blocked'));};});}
function readDocument(){return new Promise((resolve,reject)=>{const request=db.transaction('documents','readonly').objectStore('documents').get('current');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
function validOp(op){if(!op||typeof op!=='object')return false;if(op.tool==='clear')return true;if(op.tool==='group')return Array.isArray(op.children)&&op.children.length<1000&&op.children.every(child=>child.tool!=='group'&&validOp(child));return tools.some(t=>t.id===op.tool)&&normalizeHex(op.color)&&Number.isFinite(op.size)&&op.size>=1&&op.size<=50&&Number.isFinite(op.opacity)&&op.opacity>=5&&op.opacity<=100&&Array.isArray(op.points)&&op.points.length>0&&op.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.abs(p.x)<1e5&&Math.abs(p.y)<1e5);}
async function init(){
 try{db=await openDatabase();db.onversionchange=()=>{db.close();db=null;saveStatus('Storage changed · reload',true);};const saved=await readDocument();if(saved){if(saved.schema!==1||!Array.isArray(saved.ops)||!saved.ops.every(validOp))throw new Error('Saved drawing is not readable');state.ops=saved.ops;state.index=clamp(Number.isInteger(saved.index)?saved.index:saved.ops.length,0,saved.ops.length);state.floor=clamp(Number.isInteger(saved.floor)?saved.floor:0,0,state.index);state.name=String(saved.name||'Untitled canvas').slice(0,80);state.color=normalizeHex(saved.color)||palette[0][1];state.tool=tools.some(t=>t.id===saved.tool)?saved.tool:'pen';state.size=clamp(Number(saved.size)||12,1,50);state.opacity=clamp(Number(saved.opacity)||100,5,100);state.recent=Array.isArray(saved.recent)?saved.recent.filter(c=>normalizeHex(c)).slice(0,6):[];$('#document-name').value=state.name;replay();}saveStatus('Saved on this device');}
 catch(error){db=null;saveError=true;saveStatus('Local save unavailable',true);toast('Local storage is unavailable. Export PNG to keep your work.');}
 state.ready=true;renderRecent();updateUI();setZoom(1,true);document.body.dataset.ready='true';
}
window.addEventListener('beforeunload',e=>{if(active||saveError&&state.index>0||savedVersion<saveVersion){e.preventDefault();e.returnValue='';}});
// Read-only diagnostics for browser tests and transparent QA. No mutation hooks are exposed.
Object.defineProperty(window,'drawingPro',{value:Object.freeze({getState:()=>structuredClone({...state,dpr:DPR,width:W,height:H,active:!!active}),version:'1.0.0'})});
init();
