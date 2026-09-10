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
