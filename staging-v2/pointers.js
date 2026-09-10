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
 finishStroke();
 if(e.pointerType==='touch'){hover=null;updateCursor();}
});
canvas.addEventListener('pointercancel',cancelStroke);canvas.addEventListener('lostpointercapture',()=>{if(active)cancelStroke();});
canvas.addEventListener('pointerleave',()=>{hover=null;updateCursor();$('#coordinates').textContent='X —   Y —';});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('pointermove',e=>{if(e.target!==canvas&&!active){hover=null;updateCursor();}});
window.addEventListener('blur',()=>{cancelStroke();hover=null;updateCursor();});

