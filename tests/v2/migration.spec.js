import {test,expect,setup,state,sample,saved} from './helpers.js';
setup();
test('v1 painting migrates once, keeps original size and pixels, and original record is untouched',async({page})=>{
 await saved(page);
 const old={schema:1,name:'Before redesign',tool:'marker',color:'#4b80d4',size:50,opacity:100,index:2,floor:0,recent:[],ops:[{tool:'pen',color:'#e74c4c',size:50,opacity:100,points:[{x:100,y:100},{x:500,y:100}]},{tool:'marker',color:'#4b80d4',size:50,opacity:100,points:[{x:100,y:200},{x:500,y:200}]}]};
 // This fixture is in Playwright's isolated browser context, never the user's Chrome profile.
 await page.evaluate(value=>new Promise((resolve,reject)=>{
  const req=indexedDB.open('drawing-pro',1);req.onsuccess=()=>{const db=req.result,tx=db.transaction('documents','readwrite'),s=tx.objectStore('documents');s.clear();s.put(value,'current');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};
 }),old);
 await page.reload();await page.waitForSelector('body[data-ready="true"]');expect((await state(page)).width).toBe(500);
 await page.locator('#gallery-button').click();await expect(page.locator('.painting-row')).toHaveCount(2);
 await page.getByRole('button',{name:'Open Before redesign',exact:true}).click();
 await expect(page.locator('#gallery-dialog')).not.toBeVisible();expect((await state(page)).width).toBe(1200);
 expect(await sample(page,300,100)).toEqual([231,76,76,255]);expect((await sample(page,300,200))[3]).toBe(84);
 await saved(page);await page.reload();await page.waitForSelector('body[data-ready="true"]');
 await page.locator('#gallery-button').click();await expect(page.locator('.painting-row')).toHaveCount(2);
 const original=await page.evaluate(()=>new Promise(resolve=>{const r=indexedDB.open('drawing-pro',1);r.onsuccess=()=>{const db=r.result,q=db.transaction('documents').objectStore('documents').get('current');q.onsuccess=()=>{resolve(q.result);db.close();};};}));
 expect(original).toEqual(old);
});
