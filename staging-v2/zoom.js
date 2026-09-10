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
new ResizeObserver(()=>{if(state.fit)setZoom(1,true);else updateCursor();}).observe($('#canvas-viewport'));
$('#canvas-viewport').addEventListener('scroll',()=>{hover=null;updateCursor();});
$('#size-slider').addEventListener('input',e=>setSize(e.target.value));
$('#opacity-slider').addEventListener('input',e=>{state.opacity=clamp(Math.round(Number(e.target.value)),0,100);updateUI();persist();});
