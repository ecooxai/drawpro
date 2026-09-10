import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('tests/artifacts',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('http://127.0.0.1:4173');await page.waitForSelector('body[data-ready="true"]');
await page.screenshot({path:'tests/artifacts/01-desktop-blank.png'});
await page.locator('#demo-button').click();await page.waitForTimeout(2700);await page.screenshot({path:'tests/artifacts/02-desktop-demo.png'});
await page.locator('#more-colors').click();await page.screenshot({path:'tests/artifacts/03-color-picker.png'});await page.keyboard.press('Escape');
await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);await page.screenshot({path:'tests/artifacts/04-mobile.png'});
await page.locator('#more-colors').click();await page.screenshot({path:'tests/artifacts/05-mobile-picker.png'});await page.keyboard.press('Escape');
await page.setViewportSize({width:1680,height:1300});await page.locator('#undo-button').click();await page.locator('#actual-button').click();
async function stroke(key,size,y){await page.keyboard.press(key);await page.locator('#size-slider').fill(String(size));const r=await page.locator('#drawing-canvas').boundingBox();const points=Array.from({length:70},(_,i)=>({x:r.x+180+i*10,y:r.y+y+35*Math.sin(i/12)}));await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();for(const p of points.slice(1))await page.mouse.move(p.x,p.y);await page.mouse.up();}
await stroke('r',50,230);await stroke('g',25,390);await stroke('b',12,550);
await page.keyboard.press('r');await page.locator('#size-slider').fill('50');const r=await page.locator('#drawing-canvas').boundingBox();await page.mouse.move(r.x+950,r.y+260);await page.waitForTimeout(2700);await page.screenshot({path:'tests/artifacts/06-true-size-50px.png'});
console.log(JSON.stringify({chrome:browser.version(),screenshots:6,errors,previewSize:await page.locator('#size-preview').boundingBox(),cursorSize:await page.locator('#brush-cursor').boundingBox()},null,2));
await writeFile('tests/artifacts/preview-verification.json',JSON.stringify({chrome:browser.version(),errors,previewSize:await page.locator('#size-preview').boundingBox(),cursorSize:await page.locator('#brush-cursor').boundingBox()},null,2));
await browser.close();
