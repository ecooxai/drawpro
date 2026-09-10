import {test,expect,setup,state,dot,sample,saved} from './helpers.js';
setup();
test('two editing tabs preserve both versions instead of overwriting artwork',async({page,context})=>{
 const original=(await state(page)).id;
 const other=await context.newPage();await other.goto(page.url());await other.waitForSelector('body[data-ready="true"]');
 await page.bringToFront();await page.keyboard.press('r');await dot(page,120,120);await saved(page);
 const fork=(await state(page)).id;expect(fork).not.toBe(original);
 await other.bringToFront();await other.keyboard.press('b');await dot(other,320,320);await saved(other);
 await page.bringToFront();await page.locator('#gallery-button').click();await expect(page.locator('.painting-row')).toHaveCount(2);
 await page.locator('.painting-row[data-id="'+original+'"]').click();await expect(page.locator('#gallery-dialog')).not.toBeVisible();
 expect(await sample(page,320,320)).toEqual([75,128,212,255]);expect((await sample(page,120,120))[3]).toBe(0);
 await page.bringToFront();await page.locator('#gallery-button').click();await page.locator('.painting-row[data-id="'+fork+'"]').click();
 await expect(page.locator('#gallery-dialog')).not.toBeVisible();expect(await sample(page,120,120)).toEqual([231,76,76,255]);
 await other.close();
});
