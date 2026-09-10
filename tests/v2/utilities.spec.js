import {test,expect,setup,state,stroke,dot,sample,tool,hash,pixels} from './helpers.js';
setup();
test('bounded fill and eyedropper respect previous strokes and opacity',async({page})=>{
 await tool(page,'rectangle');await page.locator('#size-slider').fill('8');await stroke(page,100,100,400,400);
 await page.keyboard.press('r');await tool(page,'fill');await page.locator('#opacity-slider').fill('50');await dot(page,250,250);
 expect((await sample(page,250,250))[3]).toBe(128);expect((await sample(page,50,50))[3]).toBe(0);
 await page.locator('#opacity-slider').fill('100');await dot(page,250,250);expect(await sample(page,250,250)).toEqual([231,76,76,255]);
 await tool(page,'eyedropper');await dot(page,250,250);expect((await state(page)).color).toBe('#e74c4c');await dot(page,50,50);expect((await state(page)).color).toBe('#ffffff');
});
test('clear can be cancelled and undone without losing the saved stroke',async({page})=>{
 await stroke(page);const original=await hash(page);
 await page.locator('#clear-button').click();await page.locator('#cancel-clear').click();expect(await hash(page)).toBe(original);
 await page.locator('#clear-button').click();await page.locator('#confirm-clear').click();expect(await pixels(page)).toBe(0);
 await page.locator('#undo-button').click();expect(await hash(page)).toBe(original);
});
test('shape tools constrain with Shift and preserve undo/redo',async({page})=>{
 for(const id of ['line','rectangle','ellipse']){
  await tool(page,id);await page.keyboard.down('Shift');await stroke(page,100,100,350,220);await page.keyboard.up('Shift');
  const result=await hash(page);await page.keyboard.press('Meta+z');await page.keyboard.press('Meta+Shift+z');expect(await hash(page)).toBe(result);
 }
 const points=(await state(page)).ops[2].points;expect(Math.abs(points[1].x-points[0].x)).toBe(Math.abs(points[1].y-points[0].y));
});
