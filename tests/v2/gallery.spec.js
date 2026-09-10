import {test,expect,setup,state,stroke,hash,pixels,saved} from './helpers.js';
setup();
test('new is confirmation-free, archives work, and gallery thumbnails reopen exact art',async({page})=>{
 let dialogs=0;page.on('dialog',async d=>{dialogs++;await d.dismiss();});
 await page.locator('#document-name').fill('First sketch');await page.locator('#document-name').press('Enter');
 await page.keyboard.press('r');await stroke(page);const original=await hash(page),first=(await state(page)).id;
 await page.locator('#new-button').click();await expect.poll(async()=>(await state(page)).id).not.toBe(first);
 await saved(page);expect(await pixels(page)).toBe(0);expect((await state(page)).name).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}\.\d{2}\.\d{2}\.\d{3}$/);
 expect(dialogs).toBe(0);await expect(page.locator('dialog[open]')).toHaveCount(0);
 await page.locator('#gallery-button').click();await expect(page.locator('.painting-row')).toHaveCount(2);
 const row=page.locator('.painting-row[data-id="'+first+'"]');const img=row.locator('img');
 await expect(img).toHaveJSProperty('naturalWidth',120);
 expect((await img.boundingBox()).x).toBeLessThan((await row.locator('.painting-info').boundingBox()).x);
 await row.click();await expect(page.locator('#gallery-dialog')).not.toBeVisible();expect(await hash(page)).toBe(original);
 expect((await state(page)).name).toBe('First sketch');
});
test('clearing a name restores its creation timestamp and reload keeps painting',async({page})=>{
 const name=(await state(page)).name;await stroke(page);const art=await hash(page);
 await page.locator('#document-name').fill('Renamed');await page.locator('#document-name').press('Enter');
 await page.locator('#document-name').fill('');await page.locator('#document-name').press('Enter');await saved(page);
 expect((await state(page)).name).toBe(name);await page.reload();await page.waitForSelector('body[data-ready="true"]');
 expect((await state(page)).name).toBe(name);expect(await hash(page)).toBe(art);
});
