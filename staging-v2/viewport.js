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
