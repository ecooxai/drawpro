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
