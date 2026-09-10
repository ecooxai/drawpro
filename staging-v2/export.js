$('#export-button').onclick=()=>{
 if(active)cancelStroke();const output=document.createElement('canvas');output.width=W;output.height=H;const c=output.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,W,H);c.drawImage(canvas,0,0,W,H);
 output.toBlob(blob=>{if(!blob){toast('Export failed. Please try again.');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(state.name.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g,'-')||'Untitled canvas')+'.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('PNG exported · '+W+' × '+H+' px');},'image/png');
};

