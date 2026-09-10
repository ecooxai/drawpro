let galleryRecords=[];
function renderGallery() {
 const list=$('#gallery-list'),query=$('#gallery-search').value.trim().toLowerCase();list.replaceChildren();
 const records=galleryRecords.filter(p=>p.name.toLowerCase().includes(query));
 $('#gallery-count').textContent=galleryRecords.length+' paintings · saved in this browser';
 $('#gallery-empty').hidden=records.length>0;
 for(const record of records) {
  const row=document.createElement('button');row.className='painting-row';row.dataset.id=record.id;
  row.setAttribute('aria-current',String(record.id===state.id));row.setAttribute('aria-label','Open '+record.name);
  const image=document.createElement('img');image.alt='Preview of '+record.name;
  if(record.thumbnail?.startsWith('data:image/png'))image.src=record.thumbnail;
  const info=document.createElement('span');info.className='painting-info';
  const name=document.createElement('span');name.className='painting-name';name.textContent=record.name;
  const date=document.createElement('span');date.className='painting-date';date.textContent=new Date(record.updatedAt).toLocaleString();
  const dimensions=document.createElement('span');dimensions.className='painting-dimensions';dimensions.textContent=record.width+' × '+record.height+' px'+(record.id===state.id?' · open':'');
  info.append(name,date,dimensions);row.append(image,info);row.insertAdjacentHTML('beforeend',icon('arrow'));
  row.onclick=()=>openPainting(record.id);list.append(row);
 }
}
$('#gallery-search').addEventListener('input',renderGallery);
