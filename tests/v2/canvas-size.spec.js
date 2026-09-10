import {test,expect,setup,state,stroke,sample} from './helpers.js';
setup();

test('bottom canvas size opens an upward floating editor with requested presets',async({page})=>{
 await page.locator('#dimensions').click();
 await expect(page.locator('#canvas-size-popover')).toBeVisible();
 await expect(page.locator('#canvas-width-input')).toHaveValue('500');
 await expect(page.locator('#canvas-height-input')).toHaveValue('500');
 for(const preset of ['max','128','256','512','1000','1024'])await expect(page.locator(`[data-canvas-size="${preset}"]`)).toHaveCount(1);
 const trigger=await page.locator('#dimensions').boundingBox(),pop=await page.locator('#canvas-size-popover').boundingBox();
 expect(pop.y+pop.height).toBeLessThanOrEqual(trigger.y+1);
});

test('custom canvas dimensions preserve artwork and persist after reload',async({page})=>{
 await page.keyboard.press('r');
 await stroke(page,80,90,220,90,10);
 expect((await sample(page,150,90))[3]).toBe(255);
 await page.locator('#dimensions').click();
 await page.locator('#canvas-width-input').fill('640');
 await page.locator('#canvas-height-input').fill('360');
 await page.locator('#apply-canvas-size').click();
 let s=await state(page);expect([s.width,s.height,s.zoom]).toEqual([640,360,1]);
 expect((await sample(page,150,90))[3]).toBe(255);
 await expect(page.locator('#dimensions')).toHaveText('640 × 360');
 await page.reload();await page.waitForSelector('body[data-ready="true"]');
 s=await state(page);expect([s.width,s.height]).toEqual([640,360]);
 expect((await sample(page,150,90))[3]).toBe(255);
});

test('square presets resize at 100% and max available fits the workspace',async({page})=>{
 await page.locator('#dimensions').click();await page.locator('[data-canvas-size="512"]').click();
 let s=await state(page);expect([s.width,s.height,s.zoom]).toEqual([512,512,1]);
 await page.locator('#dimensions').click();
 const expected=await page.evaluate(()=>{const vp=document.querySelector('#canvas-viewport'),style=getComputedStyle(document.querySelector('#paper-area'));return [Math.round(vp.clientWidth-(parseFloat(style.paddingLeft)||0)-(parseFloat(style.paddingRight)||0)),Math.round(vp.clientHeight-(parseFloat(style.paddingTop)||0)-(parseFloat(style.paddingBottom)||0))];});
 await page.locator('[data-canvas-size="max"]').click();
 s=await state(page);expect([s.width,s.height]).toEqual(expected);expect(s.zoom).toBe(1);
 const box=await page.locator('#drawing-canvas').boundingBox(),vp=await page.locator('#canvas-viewport').boundingBox();
 expect(box.width).toBe(expected[0]);expect(box.height).toBe(expected[1]);expect(box.width).toBeLessThanOrEqual(vp.width);expect(box.height).toBeLessThanOrEqual(vp.height);
});

test('shrinking only crops the view; expanding restores recorded strokes',async({page})=>{
 await page.keyboard.press('b');await stroke(page,390,430,470,430,8);
 expect((await sample(page,430,430))[3]).toBe(255);
 await page.locator('#dimensions').click();await page.locator('[data-canvas-size="256"]').click();
 expect((await state(page)).width).toBe(256);
 await page.locator('#dimensions').click();await page.locator('[data-canvas-size="512"]').click();
 expect((await sample(page,430,430))[3]).toBe(255);
});
