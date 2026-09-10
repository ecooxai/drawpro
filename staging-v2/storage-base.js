function saveStatus(text,error=false) {
 const node=$('#save-status');node.querySelector('span').textContent=text;
 node.setAttribute('aria-label',text);node.title=text;
 node.classList.toggle('error',error);node.classList.toggle('saving',text==='Saving…');
}
function openDatabase() {
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open('drawing-pro',1);
  const timer=setTimeout(()=>reject(new Error('Storage unavailable')),4000);
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('documents'))request.result.createObjectStore('documents');};
  request.onsuccess=()=>{clearTimeout(timer);resolve(request.result);};
  request.onerror=()=>{clearTimeout(timer);reject(request.error);};
  request.onblocked=()=>{clearTimeout(timer);reject(new Error('Storage blocked'));};
 });
}
function dbRead(key) {
 return new Promise((resolve,reject)=>{
  const request=db.transaction('documents').objectStore('documents').get(key);
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
 });
}
function dbWrite(entries) {
 return new Promise((resolve,reject)=>{
  const tx=db.transaction('documents','readwrite');
  for(const [key,value] of entries)tx.objectStore('documents').put(value,key);
  tx.oncomplete=()=>resolve();tx.onerror=tx.onabort=()=>reject(tx.error||new Error('Save failed'));
 });
}
function dbPaintings() {
 return new Promise((resolve,reject)=>{
  const request=db.transaction('documents').objectStore('documents').getAll();
  request.onsuccess=()=>resolve(request.result.filter(p=>p?.kind==='painting').sort((a,b)=>b.updatedAt-a.updatedAt));
  request.onerror=()=>reject(request.error);
 });
}
function thumbnail() {
 if(!thumbnailDirty)return thumbnailCache;
 const c=document.createElement('canvas');c.width=120;c.height=120;
 const t=c.getContext('2d'),scale=Math.min(120/W,120/H),w=W*scale,h=H*scale;
 t.fillStyle='#fff';t.fillRect(0,0,120,120);t.drawImage(committed,(120-w)/2,(120-h)/2,w,h);
 thumbnailCache=c.toDataURL('image/png');thumbnailDirty=false;return thumbnailCache;
}
