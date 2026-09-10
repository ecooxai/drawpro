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
 Object.assign(state,{id:record.id,name:record.name,customName:!!record.customName,createdAt:record.createdAt,updatedAt:record.updatedAt,ops:structuredClone(record.ops),index:clamp(record.index||0,0,record.ops.length),floor:record.floor||0,color:normalizeHex(record.color)||palette[0][1],tool:tools.some(t=>t.id===record.tool)?record.tool:'pen',size:clamp(record.size||50,1,50),opacity:clamp(record.opacity??100,0,100),recent:record.recent||[]});
 state.floor=clamp(state.floor,0,state.index);
 revisions.set(state.id,record.revision||0);
 configureCanvas(clamp(record.width||500,1,4096),clamp(record.height||500,1,4096));
 $('#document-name').value=state.name;
 replay();renderRecent();setZoom(1,false);
 $('#canvas-viewport').scrollTo(0,0);
}
