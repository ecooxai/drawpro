import {test,expect} from '@playwright/test';
const getState=page=>page.evaluate(()=>window.drawingPro.getState());
async function coords(page,x,y){const r=await page.locator('#drawing-canvas').boundingBox();return{x:r.x+x*r.width/1200,y:r.y+y*r.height/800};}
async function move(page,x,y){const p=await coords(page,x,y);await page.mouse.move(p.x,p.y);}
async function dot(page,x,y){const p=await coords(page,x,y);await page.mouse.click(p.x,p.y);}
async function stroke(page,x1=150,y1=220,x2=500,y2=220){await move(page,x1,y1);await page.mouse.down();const p=await coords(page,x2,y2);await page.mouse.move(p.x,p.y,{steps:20});await page.mouse.up();}
async function sample(page,x,y){return page.evaluate(({x,y})=>{const c=document.querySelector('#drawing-canvas'),d=window.drawingPro.getState().dpr;return [...c.getContext('2d').getImageData(Math.floor(x*d),Math.floor(y*d),1,1).data];},{x,y});}
async function inkCount(page){return page.evaluate(()=>{const c=document.querySelector('#drawing-canvas'),a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<a.length;i+=4)if(a[i])n++;return n;});}
test.beforeEach(async({page})=>{page.on('dialog',d=>d.dismiss());await page.goto('/');await page.waitForSelector('body[data-ready="true"]');});

test('1px cursor stays proportional at narrow mobile fit zoom',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);await page.locator('#size-slider').fill('1');await move(page,600,400);const s=await getState(page);expect(s.zoom).toBeLessThan(.3);expect((await page.locator('#brush-cursor').boundingBox()).width).toBeCloseTo(s.zoom,1);expect((await page.locator('#size-preview').boundingBox()).width).toBe(1);
});
test('Shift ink pen release stays snapped with no final off-angle kink',async({page})=>{
 await page.keyboard.down('Shift');await stroke(page,200,300,650,355);await page.keyboard.up('Shift');const op=(await getState(page)).ops[0];expect(op.points).toHaveLength(2);expect(Math.abs(op.points[1].y-op.points[0].y)).toBeLessThan(.01);expect((await sample(page,400,300))[3]).toBe(255);expect((await sample(page,650,355))[3]).toBe(0);
});
test('cancelled touch restores prior drawing and adds no undo action',async({page,context})=>{
 await stroke(page);const initial=await inkCount(page);const session=await context.newCDPSession(page);const a=await coords(page,200,450),b=await coords(page,700,450);
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x,y:a.y,id:1}]});await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x,y:b.y,id:1}]});await page.waitForTimeout(50);expect(await inkCount(page)).toBeGreaterThan(initial);await session.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});expect(await inkCount(page)).toBe(initial);expect((await getState(page)).index).toBe(1);expect((await getState(page)).active).toBe(false);
});
test('history limits undo to 80 actions while retaining older artwork',async({page})=>{
 test.setTimeout(60000);await page.locator('#size-slider').fill('6');for(let i=0;i<83;i++)await dot(page,100+(i%20)*45,120+Math.floor(i/20)*90);expect((await getState(page)).floor).toBe(3);for(let i=0;i<80;i++)await page.keyboard.press('Control+z');expect((await getState(page)).index).toBe(3);await expect(page.locator('#undo-button')).toBeDisabled();expect((await sample(page,100,120))[3]).toBe(255);expect((await sample(page,145,120))[3]).toBe(255);expect((await sample(page,190,120))[3]).toBe(255);expect((await sample(page,235,120))[3]).toBe(0);
});
