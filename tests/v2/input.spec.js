import {test,expect,setup,state,stroke,move,position,sample,hash} from './helpers.js';
setup();
test('typing and dialogs do not trigger color or brush shortcuts',async({page})=>{
 await page.locator('#document-name').fill('RGB 123');await page.keyboard.press('r');
 expect((await state(page)).color).toBe('#252629');expect((await state(page)).tool).toBe('pen');
 await page.locator('#document-name').press('Enter');await page.locator('#more-colors').click();await page.locator('#hex-input').fill('#123abc');await page.keyboard.press('Escape');
 expect((await state(page)).color).toBe('#252629');await page.locator('#help-button').click();await page.keyboard.press('g');expect((await state(page)).color).toBe('#252629');
});
test('mouse slider endpoints, bracket limits, pointer capture and cursor leave',async({page})=>{
 const r=await page.locator('#size-slider').boundingBox();await page.mouse.click(r.x+1,r.y+r.height/2);expect((await state(page)).size).toBe(1);
 await page.keyboard.press('[');expect((await state(page)).size).toBe(1);await page.mouse.click(r.x+r.width-1,r.y+r.height/2);expect((await state(page)).size).toBe(50);
 await page.keyboard.press(']');expect((await state(page)).size).toBe(50);
 await move(page,100,100);await page.mouse.down();const c=await page.locator('#drawing-canvas').boundingBox();await page.mouse.move(c.x+c.width+30,c.y+100);await page.mouse.up();
 expect((await state(page)).active).toBe(false);await expect(page.locator('#brush-cursor')).not.toBeVisible();
 const before=await hash(page);await move(page,300,300);expect(await hash(page)).toBe(before);
});
test('very fast repeated drags never disappear',async({page})=>{
 await page.locator('#size-slider').fill('12');await page.keyboard.press('r');
 for(let i=0;i<24;i++){
  const y=30+i*18;const a=await position(page,25,y),b=await position(page,475,y);
  await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y);await page.mouse.up();
 }
 expect((await state(page)).index).toBe(24);
 for(let i=0;i<24;i++) expect((await sample(page,250,30+i*18))[3]).toBe(255);
 await page.reload();await page.waitForSelector('body[data-ready="true"]');
 expect((await state(page)).index).toBe(24);
 for(let i=0;i<24;i++) expect((await sample(page,250,30+i*18))[3]).toBe(255);
});
