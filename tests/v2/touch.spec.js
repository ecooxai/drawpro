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

test('six simultaneous touch pointers draw independent strokes',async({page,context})=>{
 const session=await context.newCDPSession(page),ys=[55,130,205,280,355,430];
 const starts=await Promise.all(ys.map(y=>position(page,70,y))),ends=await Promise.all(ys.map(y=>position(page,430,y)));
 const points=t=>starts.map((a,i)=>({x:a.x+(ends[i].x-a.x)*t,y:a.y,id:i+1}));
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(0)});
 await expect.poll(async()=>(await state(page)).activePointers).toBe(6);
 for(let step=1;step<=10;step++)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(step/10)});
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect.poll(async()=>(await state(page)).activePointers).toBe(0);
 expect((await state(page)).index).toBe(6);
 for(const y of ys)expect((await sample(page,250,y))[3]).toBe(255);
});

test('six distinct mouse-like pointer IDs can draw concurrently when exposed by the platform',async({page})=>{
 const counts=await page.locator('#drawing-canvas').evaluate(canvas=>{
  const r=canvas.getBoundingClientRect(),ys=[55,130,205,280,355,430];
  const fire=(type,id,x,y)=>canvas.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:id,pointerType:'mouse',isPrimary:id===101,button:0,buttons:type==='pointerup'?0:1,clientX:r.left+x*r.width/500,clientY:r.top+y*r.height/500}));
  ys.forEach((y,i)=>fire('pointerdown',101+i,70,y));
  const during=window.drawingPro.getState().activePointers;
  for(let step=1;step<=8;step++)ys.forEach((y,i)=>fire('pointermove',101+i,70+(360*step/8),y));
  ys.forEach((y,i)=>fire('pointerup',101+i,430,y));
  return {during,after:window.drawingPro.getState().activePointers,index:window.drawingPro.getState().index};
 });
 expect(counts).toEqual({during:6,after:0,index:6});
 for(const y of [55,130,205,280,355,430])expect((await sample(page,250,y))[3]).toBe(255);
});
