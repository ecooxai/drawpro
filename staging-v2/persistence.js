function persist() {
 if(!state.ready)return Promise.resolve(true);
 const version=++saveVersion;
 if(!db){saveError=true;saveStatus('Not saved. Export PNG to keep a copy.',true);return Promise.resolve(false);}
 state.updatedAt=Date.now();
 const payload=structuredClone({kind:'painting',schema:2,id:state.id,name:state.name.trim()||timestampName(state.createdAt),customName:state.customName,createdAt:state.createdAt,updatedAt:state.updatedAt,width:W,height:H,tool:state.tool,color:state.color,size:state.size,opacity:state.opacity,recent:state.recent,ops:state.ops,index:state.index,floor:state.floor,thumbnail:thumbnail()});
 saveStatus('Saving…');
 saveQueue=saveQueue.then(async()=>{
  try {
   const result=await writePainting(payload);
   if(state.id===result.originalId && result.forked) {
    state.id=result.payload.id;state.createdAt=result.payload.createdAt;state.name=result.payload.name;state.customName=true;
    $('#document-name').value=state.name;
    toast('Another tab changed this painting. Your version was saved as a separate copy.');
   }
   savedVersion=version;
   if(version===saveVersion){saveError=false;saveStatus('Saved in this browser');}
   return true;
  } catch(error) {
   saveError=true;saveStatus('Save failed. Export PNG to keep a copy.',true);
   toast('Browser storage could not save this painting. Export PNG before leaving.');
   return false;
  }
 });
 return saveQueue;
}
