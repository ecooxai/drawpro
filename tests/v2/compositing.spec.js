import {test,expect,setup,state,stroke,move,dot,sample,tool,hash,pixels} from './helpers.js';
setup();
test('overlapping translucent strokes accumulate while each stroke stays uniform',async({page})=>{
 await page.locator('#opacity-slider').fill('50');await page.keyboard.press('r');await stroke(page,70,180,430,180,50);
 expect((await sample(page,150,180))[3]).toBe(128);expect((await sample(page,350,180))[3]).toBe(128);
 await page.keyboard.press('b');await stroke(page,250,70,250,400);
 expect((await sample(page,250,180))[3]).toBeGreaterThanOrEqual(191);expect((await sample(page,250,180))[3]).toBeLessThanOrEqual(192);
 expect((await sample(page,100,180))[3]).toBe(128);
});
test('eraser alone removes pixels; switching back to paint cannot keep erasing',async({page})=>{
 await page.keyboard.press('r');await stroke(page);await tool(page,'eraser');await stroke(page,200,80,200,350);
 expect((await sample(page,200,170))[3]).toBe(0);await tool(page,'pen');await page.keyboard.press('b');await stroke(page,300,80,300,350);
 expect(await sample(page,300,170)).toEqual([75,128,212,255]);expect(await sample(page,90,170)).toEqual([231,76,76,255]);
});
test('cancelled overlapping preview restores exact previous painting',async({page})=>{
 await stroke(page);const before=await hash(page);await move(page,250,100);await page.mouse.down();await move(page,250,350);
 await page.keyboard.press('Escape');await page.mouse.up();expect(await hash(page)).toBe(before);expect((await state(page)).index).toBe(1);
});
test('zero opacity produces no mark or history',async({page})=>{
 await page.locator('#opacity-slider').fill('0');await stroke(page);expect(await pixels(page)).toBe(0);expect((await state(page)).index).toBe(0);
});
