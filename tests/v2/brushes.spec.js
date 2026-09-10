import {test,expect,setup,state,stroke,move,dot,sample,tool,hash,pixels} from './helpers.js';
setup();
const brushes=['pen','square','triangle','diamond','chisel','star'];
for(const id of brushes){
 test(id+': crossing a previous stroke never removes unrelated artwork',async({page})=>{
  await page.keyboard.press('r');await stroke(page);const before=await sample(page,90,170);
  await tool(page,id);await page.keyboard.press('b');await move(page,250,80);await page.mouse.down();await move(page,250,330);
  expect(await sample(page,90,170)).toEqual(before);await page.mouse.up();
  expect(await sample(page,90,170)).toEqual(before);expect(await sample(page,250,170)).toEqual([75,128,212,255]);
  expect((await sample(page,470,450))[3]).toBe(0);
  const result=await hash(page);await page.keyboard.press('Control+z');expect(await sample(page,250,170)).toEqual(before);
  await page.keyboard.press('Control+Shift+z');expect(await hash(page)).toBe(result);
 });
 test(id+': exact opacity at 50% and fully opaque at 100%',async({page})=>{
  await tool(page,id);await page.locator('#opacity-slider').fill('50');await dot(page,180,180);
  expect((await sample(page,180,180))[3]).toBeGreaterThanOrEqual(127);expect((await sample(page,180,180))[3]).toBeLessThanOrEqual(128);
  await page.locator('#opacity-slider').fill('100');await dot(page,350,350);
  expect((await sample(page,350,350))[3]).toBe(255);
 });
}
test('round pen clicks make circular dots, not square starts',async({page})=>{
 await page.locator('#size-slider').fill('50');await dot(page,200,200);expect((await sample(page,200,200))[3]).toBe(255);
 expect((await sample(page,223,200))[3]).toBe(255);expect((await sample(page,223,223))[3]).toBe(0);
});
