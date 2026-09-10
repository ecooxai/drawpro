import {test,expect} from '@playwright/test';
export {test,expect};
export function setup(){
 test.beforeEach(async({page})=>{page.errors=[];page.on('pageerror',e=>page.errors.push(e.message));await page.goto('/');await page.waitForSelector('body[data-ready="true"]');});
 test.afterEach(async({page})=>expect(page.errors).toEqual([]));
}
export const state=p=>p.evaluate(()=>window.drawingPro.getState());
export async function position(p,x,y){const r=await p.locator('#drawing-canvas').boundingBox(),s=await state(p);return{x:r.x+x*r.width/s.width,y:r.y+y*r.height/s.height};}
export async function move(p,x,y){const q=await position(p,x,y);await p.mouse.move(q.x,q.y);}
export async function dot(p,x,y){const q=await position(p,x,y);await p.mouse.click(q.x,q.y);}
export async function stroke(p,x1=70,y1=170,x2=430,y2=170,steps=16){await move(p,x1,y1);await p.mouse.down();const q=await position(p,x2,y2);await p.mouse.move(q.x,q.y,{steps});await p.mouse.up();}
export const sample=(p,x,y)=>p.evaluate(({x,y})=>{const c=document.querySelector('#drawing-canvas'),d=window.drawingPro.getState().dpr;return [...c.getContext('2d').getImageData(Math.floor(x*d),Math.floor(y*d),1,1).data];},{x,y});
export const pixels=p=>p.evaluate(()=>{const c=document.querySelector('#drawing-canvas'),a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let count=0;for(let i=3;i<a.length;i+=4)if(a[i])count++;return count;});
export const hash=p=>p.locator('#drawing-canvas').evaluate(c=>c.toDataURL());
export const saved=p=>expect(p.locator('#save-status')).toHaveAttribute('aria-label','Saved in this browser');
export const tool=(p,id)=>p.locator('[data-tool="'+id+'"]').click();
