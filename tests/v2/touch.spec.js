import {test,expect,setup,state,position,sample} from './helpers.js';
setup();
test('touch paints at native scale without page scrolling or a stuck cursor',async({page,context})=>{
 await page.setViewportSize({width:390,height:844});
 const session=await context.newCDPSession(page),a=await position(page,60,200),b=await position(page,240,200);
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x,y:a.y,id:1}]});
 for(let i=1;i<=12;i++)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(b.x-a.x)*i/12,y:a.y,id:1}]});
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 expect((await state(page)).index).toBe(1);expect((await sample(page,150,200))[3]).toBe(255);
 await expect(page.locator('#brush-cursor')).not.toBeVisible();expect(await page.evaluate(()=>scrollY)).toBe(0);
 expect((await state(page)).zoom).toBe(1);
});
