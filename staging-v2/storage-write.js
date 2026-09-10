function writePainting(payload) {
 return new Promise((resolve,reject)=>{
  const originalId=payload.id;
  payload.id=redirects.get(originalId)||originalId;
  const tx=db.transaction('documents','readwrite'),store=tx.objectStore('documents');
  const get=store.get('painting:'+payload.id);
  let forked=false;
  get.onsuccess=()=>{
   const existing=get.result,expected=revisions.get(payload.id)||0;
   if(existing && existing.revision!==expected) {
    const newId=crypto.randomUUID();redirects.set(originalId,newId);payload.id=newId;
    payload.name+=' (copy)';payload.createdAt=Date.now();payload.customName=true;forked=true;
   }
   payload.revision=(forked?0:expected)+1;
   store.put(payload,'painting:'+payload.id);
   store.put({kind:'meta',id:payload.id},'__v2_active__');
  };
  tx.oncomplete=()=>{revisions.set(payload.id,payload.revision);resolve({payload,originalId,forked});};
  tx.onerror=tx.onabort=()=>reject(tx.error||new Error('Save failed'));
 });
}
