import {test,expect,setup,state,stroke,move,sample,pixels} from './helpers.js';
setup();
test('compact icon-only controls and a genuinely blank 500px canvas',async({page})=>{
 const s=await state(page);expect([s.width,s.height,s.zoom,s.size,s.opacity]).toEqual([500,500,1,10,100]);
 expect((await page.locator('.app-header').boundingBox()).height).toBe(28);
 expect((await page.locator('.tool-bar').boundingBox()).height).toBe(30);
 expect(await page.locator('.tool-button,.app-header button').evaluateAll(a=>a.every(b=>b.textContent.trim()===''))).toBe(true);
 await expect(page.locator('.swatch')).toHaveCount(16);
 expect(await pixels(page)).toBe(0);expect(await page.locator('#paper-shell').innerText()).toBe('');
});
test('window resizing never changes 50px sliders, 10px default brush, or 100% canvas size',async({page})=>{
 for(const width of [1920,1280,800,390]){
  await page.setViewportSize({width,height:844});
  expect((await page.locator('#drawing-canvas').boundingBox()).width).toBe(500);
  expect((await page.locator('#size-slider').boundingBox()).width).toBe(50);
  expect((await page.locator('#opacity-slider').boundingBox()).width).toBe(50);
  expect((await page.locator('#size-preview').boundingBox()).width).toBe(10);
  await move(page,100,100);expect((await page.locator('#brush-cursor').boundingBox()).width).toBe(10);
  expect((await state(page)).zoom).toBe(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});

test('numeric thickness input sets brush size and keeps slider synchronized',async({page})=>{
 await expect(page.locator('#size-output')).toHaveValue('10');
 await page.locator('#size-output').fill('27');
 await page.locator('#size-output').blur();
 expect((await state(page)).size).toBe(27);
 await expect(page.locator('#size-slider')).toHaveValue('27');
 await move(page,100,100);expect((await page.locator('#brush-cursor').boundingBox()).width).toBe(27);
 await page.locator('#size-output').fill('99');await page.locator('#size-output').blur();
 expect((await state(page)).size).toBe(50);await expect(page.locator('#size-slider')).toHaveValue('50');await expect(page.locator('#size-output')).toHaveValue('50');
 await page.locator('#size-output').fill('0');await page.locator('#size-output').blur();
 expect((await state(page)).size).toBe(1);await expect(page.locator('#size-slider')).toHaveValue('1');await expect(page.locator('#size-output')).toHaveValue('1');
});

for(const size of [1,12,25,50])test('raster width matches '+size+'px',async({page})=>{
 await page.locator('#size-slider').fill(String(size));await stroke(page,60,170.5,430,170.5);
 const measured=await page.evaluate(()=>{const c=document.querySelector('canvas'),d=window.drawingPro.getState().dpr,a=c.getContext('2d').getImageData(250*d,0,1,c.height).data;let n=0;for(let i=3;i<a.length;i+=4)if(a[i]>127)n++;return n/d;});
 expect(Math.abs(measured-size)).toBeLessThanOrEqual(1);
});
