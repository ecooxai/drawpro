async function migrateLegacy() {
 if(await dbRead('__v2_migrated__'))return;
 const old=await dbRead('current'),entries=[];
 if(old?.schema===1 && Array.isArray(old.ops) && old.ops.every(op=>validOp(op))) {
  const record=freshDocument();
  Object.assign(record,{width:1200,height:800,ops:old.ops,index:old.index??old.ops.length,floor:old.floor||0,revision:1,color:old.color,tool:old.tool,size:old.size,opacity:old.opacity,recent:old.recent||[],imported:true});
  if(old.name?.trim() && old.name!=='Untitled canvas'){record.name=old.name;record.customName=true;}
  loadDocument(record);record.thumbnail=thumbnail();
  entries.push(['painting:'+record.id,record]);
 }
 entries.push(['__v2_migrated__',{kind:'meta',at:Date.now()}]);
 await dbWrite(entries);
}
async function init() {
 try {
  db=await openDatabase();
  db.onversionchange=()=>{db.close();db=null;saveError=true;saveStatus('Storage changed. Reload to reconnect.',true);};
  await migrateLegacy();
  const current=await dbRead('__v2_active__');
  const saved=current?.id?await dbRead('painting:'+current.id):null;
  loadDocument(saved||freshDocument());
  state.ready=true;await persist();
 } catch(error) {
  db=null;saveError=true;loadDocument(freshDocument());state.ready=true;
  saveStatus('Local save unavailable. Export PNG to keep a copy.',true);
  toast('Browser storage is unavailable. Export PNG to keep your work.');
 }
 updateUI();document.body.dataset.ready='true';
}
