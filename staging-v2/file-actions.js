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
