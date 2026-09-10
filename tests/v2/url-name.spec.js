import {test,expect,state,dot,sample,saved} from './helpers.js';

async function openNamed(page,name){
 await page.goto('/?name='+encodeURIComponent(name));
 await page.waitForSelector('body[data-ready="true"]');
}

test('unknown ?name creates a new blank painting with that exact name',async({page})=>{
 await openNamed(page,'testpaint');
 const s=await state(page);
 expect(s.name).toBe('testpaint');
 expect(s.customName).toBe(true);
 expect(s.index).toBe(0);
 await expect(page.locator('#document-name')).toHaveValue('testpaint');
 await saved(page);
});

test('existing ?name opens that saved painting instead of creating another',async({page})=>{
 await openNamed(page,'testpaint');
 await page.keyboard.press('r');
 await dot(page,120,120);
 await saved(page);
 const first=await state(page);
 expect(await sample(page,120,120)).toEqual([231,76,76,255]);

 await openNamed(page,'otherpaint');
 const other=await state(page);
 expect(other.id).not.toBe(first.id);
 expect(other.name).toBe('otherpaint');
 expect((await sample(page,120,120))[3]).toBe(0);
 await page.keyboard.press('b');
 await dot(page,320,320);
 await saved(page);

 await openNamed(page,'testpaint');
 const reopened=await state(page);
 expect(reopened.id).toBe(first.id);
 expect(reopened.name).toBe('testpaint');
 expect(await sample(page,120,120)).toEqual([231,76,76,255]);
 expect((await sample(page,320,320))[3]).toBe(0);
});

test('URL encoded names are decoded and reused on reload',async({page})=>{
 const name='My paint 01';
 await openNamed(page,name);
 expect((await state(page)).name).toBe(name);
 await page.keyboard.press('g');
 await dot(page,250,250);
 await saved(page);
 const id=(await state(page)).id;
 await page.reload();
 await page.waitForSelector('body[data-ready="true"]');
 expect((await state(page)).id).toBe(id);
 expect((await state(page)).name).toBe(name);
 expect(await sample(page,250,250)).toEqual([71,168,107,255]);
});

test('without ?name the app still opens the active painting',async({page})=>{
 await openNamed(page,'activepaint');
 await page.keyboard.press('o');
 await dot(page,200,200);
 await saved(page);
 const id=(await state(page)).id;
 await page.goto('/');
 await page.waitForSelector('body[data-ready="true"]');
 expect((await state(page)).id).toBe(id);
 expect((await state(page)).name).toBe('activepaint');
 expect(await sample(page,200,200)).toEqual([243,151,67,255]);
});
