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
