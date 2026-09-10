import {test,expect} from '@playwright/test';
import {PNG} from 'pngjs';
import fs from 'node:fs/promises';
const colors=[['k','#252629'],['a','#8c939b'],['w','#ffffff'],['n','#946443'],['r','#e74c4c'],['o','#f39743'],['y','#f2cb4c'],['l','#accb51'],['g','#47a86b'],['t','#38a99f'],['c','#56bfd5'],['b','#4b80d4'],['i','#6664bb'],['p','#9563c7'],['m','#d665a5'],['s','#f0a7b9']];
const getState=page=>page.evaluate(()=>window.drawingPro.getState());
async function coords(page,x,y){const r=await page.locator('#drawing-canvas').boundingBox();return{x:r.x+x*r.width/1200,y:r.y+y*r.height/800};}
async function move(page,x,y){const p=await coords(page,x,y);await page.mouse.move(p.x,p.y);}
async function dot(page,x,y){const p=await coords(page,x,y);await page.mouse.click(p.x,p.y);}
async function stroke(page,x1=150,y1=220,x2=500,y2=220,steps=20){await move(page,x1,y1);await page.mouse.down();const p=await coords(page,x2,y2);await page.mouse.move(p.x,p.y,{steps});await page.mouse.up();}
async function sample(page,x,y){return page.evaluate(({x,y})=>{const c=document.querySelector('#drawing-canvas'),d=window.drawingPro.getState().dpr;return [...c.getContext('2d').getImageData(Math.floor(x*d),Math.floor(y*d),1,1).data];},{x,y});}
async function inkCount(page){return page.evaluate(()=>{const c=document.querySelector('#drawing-canvas'),a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<a.length;i+=4)if(a[i])n++;return n;});}
async function setSize(page,size){await page.locator('#size-slider').fill(String(size));}
const colorRGB=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));

test.beforeEach(async({page})=>{page.on('dialog',dialog=>dialog.dismiss());await page.goto('/');await page.waitForSelector('body[data-ready="true"]');});
test.afterEach(async({page},info)=>{if(info.status!==info.expectedStatus)await page.screenshot({path:info.outputPath('failure.png'),fullPage:true}).catch(()=>{});});

test('blank start, all 16 colors, 10 tools, no runtime errors or layout overflow',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.reload();await page.waitForSelector('body[data-ready="true"]');await expect(page.locator('.swatch')).toHaveCount(16);await expect(page.locator('[data-tool]')).toHaveCount(10);await expect(page.locator('#empty-hint')).toBeVisible();expect(await inkCount(page)).toBe(0);expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('#undo-button')).toBeDisabled();
});
for(const [key,color] of colors)test(`palette ${key.toUpperCase()}: click, real stroke pixels, shortcut and live cursor`,async({page})=>{
 await page.locator(`.swatch[data-key="${key}"]`).click();await expect(page.locator(`.swatch[data-key="${key}"]`)).toHaveAttribute('aria-pressed','true');
 await stroke(page);expect((await sample(page,300,220)).slice(0,3)).toEqual(colorRGB(color));expect((await sample(page,300,220))[3]).toBe(255);
 await move(page,600,300);await page.keyboard.press(key==='k'?'r':'k');await page.keyboard.press(key.toUpperCase());
 expect((await getState(page)).color).toBe(color);await expect(page.locator('#brush-cursor')).toBeVisible();await expect(page.locator('#brush-cursor')).toHaveAttribute('data-color',color);
 expect(await page.locator('#brush-cursor').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe(`rgb(${colorRGB(color).join(', ')})`);
});
for(const size of [1,12,25,50])test(`${size}px thickness: actual-size preview, scaled cursor, measured raster width`,async({page})=>{
 await setSize(page,size);await stroke(page,100,250.5,450,250.5);await move(page,600,330);const s=await getState(page);
 expect(s.size).toBe(size);await expect(page.locator('#size-output')).toHaveText(String(size));expect((await page.locator('#size-preview').boundingBox()).width).toBe(size);
 expect((await page.locator('#brush-cursor').boundingBox()).width).toBeCloseTo(size*s.zoom,1);
 const thickness=await page.evaluate(()=>{const c=document.querySelector('#drawing-canvas'),d=window.drawingPro.getState().dpr,a=c.getContext('2d').getImageData(Math.floor(300*d),0,1,c.height).data;let n=0;for(let i=3;i<a.length;i+=4)if(a[i]>127)n++;return n/d;});expect(Math.abs(thickness-size)).toBeLessThanOrEqual(1);
});
test('real mouse drag sets size slider to both endpoints; bracket keys clamp',async({page})=>{
 const r=await page.locator('#size-slider').boundingBox();await page.mouse.move(r.x+10,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width-1,r.y+r.height/2,{steps:10});await page.mouse.up();expect((await getState(page)).size).toBe(50);
 await page.keyboard.press(']');expect((await getState(page)).size).toBe(50);await page.locator('#size-slider').press('Home');expect((await getState(page)).size).toBe(1);await page.keyboard.press('[');expect((await getState(page)).size).toBe(1);await page.keyboard.press(']');expect((await getState(page)).size).toBe(2);
});
test('100% zoom: 50px cursor equals preview; fit and zoom do not change art',async({page})=>{
 await setSize(page,50);await stroke(page);const before=await inkCount(page);await page.locator('#actual-button').click();await move(page,300,200);expect((await getState(page)).zoom).toBe(1);expect((await page.locator('#brush-cursor').boundingBox()).width).toBe(50);await page.locator('#zoom-in').click();expect((await getState(page)).zoom).toBeCloseTo(1.1);await page.locator('#zoom-out').click();await page.locator('#fit-button').click();expect((await getState(page)).fit).toBe(true);expect(await inkCount(page)).toBe(before);
});
for(const [key,id] of [['1','pen'],['2','pencil'],['3','marker'],['4','brush'],['6','line'],['7','rectangle'],['8','ellipse']])test(`${id}: number shortcut, mouse drawing, undo and redo exact pixels`,async({page})=>{
 await page.keyboard.press(key);await setSize(page,20);expect((await getState(page)).tool).toBe(id);await stroke(page,150,200,450,390);const count=await inkCount(page);expect(count).toBeGreaterThan(100);
 await page.keyboard.press('Control+z');expect(await inkCount(page)).toBe(0);await page.keyboard.press('Control+Shift+z');expect(await inkCount(page)).toBe(count);
});
test('single click produces a dot and right mouse button does not draw',async({page})=>{
 await setSize(page,30);await dot(page,300,300);expect((await sample(page,300,300))[3]).toBe(255);const count=await inkCount(page);const p=await coords(page,600,300);await page.mouse.click(p.x,p.y,{button:'right'});expect(await inkCount(page)).toBe(count);
});
test('marker opacity is uniform along one stroke, not darker at every mouse sample',async({page})=>{
 await page.keyboard.press('3');await setSize(page,30);await stroke(page);const a=(await sample(page,250,220))[3],b=(await sample(page,400,220))[3];expect(a).toBeGreaterThan(70);expect(a).toBeLessThan(100);expect(Math.abs(a-b)).toBeLessThanOrEqual(1);
});
test('opacity slider changes actual alpha; eraser remains fully effective',async({page})=>{
 await page.locator('#opacity-slider').fill('50');await setSize(page,30);await stroke(page);expect((await sample(page,300,220))[3]).toBeGreaterThanOrEqual(126);expect((await sample(page,300,220))[3]).toBeLessThanOrEqual(129);await page.keyboard.press('5');await dot(page,300,220);expect((await sample(page,300,220))[3]).toBe(0);await expect(page.locator('#opacity-slider')).toBeDisabled();
});
test('eraser removes pixels, undo restores them, redo erases again',async({page})=>{
 await setSize(page,40);await stroke(page);const before=await sample(page,300,220);await page.keyboard.press('5');await stroke(page,300,170,300,270);expect((await sample(page,300,220))[3]).toBe(0);await page.keyboard.press('Meta+z');expect(await sample(page,300,220)).toEqual(before);await page.keyboard.press('Meta+Shift+z');expect((await sample(page,300,220))[3]).toBe(0);
});
test('fill bucket fills a bounded region without escaping',async({page})=>{
 await page.keyboard.press('7');await setSize(page,12);await stroke(page,200,200,550,500);await page.keyboard.press('r');await page.keyboard.press('9');await dot(page,350,350);expect(await sample(page,350,350)).toEqual([231,76,76,255]);expect((await sample(page,100,100))[3]).toBe(0);await page.keyboard.press('Control+z');expect((await sample(page,350,350))[3]).toBe(0);await page.keyboard.press('Control+y');expect((await sample(page,350,350))[0]).toBe(231);
});
test('fill blank canvas then refill same color is safe',async({page})=>{
 await page.keyboard.press('b');await page.keyboard.press('9');await dot(page,300,300);expect(await sample(page,1100,700)).toEqual([75,128,212,255]);await dot(page,400,400);expect(await sample(page,400,400)).toEqual([75,128,212,255]);
});
test('eyedropper samples artwork and white background',async({page})=>{
 await page.keyboard.press('g');await setSize(page,30);await stroke(page);await page.keyboard.press('r');await page.keyboard.press('0');await dot(page,300,220);expect((await getState(page)).color).toBe('#47a86b');await dot(page,800,500);expect((await getState(page)).color).toBe('#ffffff');expect((await getState(page)).index).toBe(1);
});
test('new stroke after undo invalidates redo without losing earlier mark',async({page})=>{
 await stroke(page);await stroke(page,150,320,450,320);await page.keyboard.press('Control+z');await stroke(page,150,420,450,420);await expect(page.locator('#redo-button')).toBeDisabled();expect((await sample(page,300,220))[3]).toBe(255);expect((await sample(page,300,320))[3]).toBe(0);expect((await sample(page,300,420))[3]).toBe(255);
});
test('clear is confirmable, cancellable, undoable and redoable',async({page})=>{
 await stroke(page);const n=await inkCount(page);await page.locator('#clear-button').click();await page.locator('#cancel-clear').click();expect(await inkCount(page)).toBe(n);await page.locator('#clear-button').click();await page.locator('#confirm-clear').click();expect(await inkCount(page)).toBe(0);await page.locator('#undo-button').click();expect(await inkCount(page)).toBe(n);await page.locator('#redo-button').click();expect(await inkCount(page)).toBe(0);
});
test('color picker accepts HEX and RGB, rejects invalid inputs, remembers custom colors',async({page})=>{
 await page.locator('#more-colors').click();await expect(page.locator('#color-dialog')).toBeVisible();await page.locator('#hex-input').fill('#GGGGGG');await expect(page.locator('#apply-color')).toBeDisabled();await expect(page.locator('#color-error')).toContainText('valid');
 await page.locator('#hex-input').fill('#abc');await expect(page.locator('#apply-color')).toBeEnabled();await page.locator('#apply-color').click();expect((await getState(page)).color).toBe('#aabbcc');await expect(page.locator('.recent-swatch')).toHaveCount(1);
 await page.locator('#more-colors').click();await page.locator('#red-input').fill('256');await expect(page.locator('#apply-color')).toBeDisabled();await page.locator('#red-input').fill('12');await page.locator('#green-input').fill('34');await page.locator('#blue-input').fill('56');await page.locator('#apply-color').click();expect((await getState(page)).color).toBe('#0c2238');await page.locator('.recent-swatch').nth(1).click();expect((await getState(page)).color).toBe('#aabbcc');
});
test('hue and saturation/brightness support mouse and keyboard',async({page})=>{
 await page.locator('#more-colors').click();await page.locator('#hue-slider').fill('120');const r=await page.locator('#sv-picker').boundingBox();await page.mouse.click(r.x+r.width-8,r.y+8);await expect(page.locator('#hex-input')).toHaveValue('#05F505');await page.locator('#sv-picker').press('Shift+ArrowRight');await page.locator('#sv-picker').press('Shift+ArrowUp');await expect(page.locator('#hex-input')).toHaveValue('#00FF00');await page.locator('#apply-color').click();expect((await getState(page)).color).toBe('#00ff00');
});
test('cancel picker keeps original color; dialog contains keyboard focus',async({page})=>{
 await page.locator('#more-colors').click();await page.locator('#hex-input').fill('#123456');for(let i=0;i<14;i++)await page.keyboard.press('Tab');expect(await page.evaluate(()=>!!document.activeElement.closest('#color-dialog'))).toBe(true);await page.keyboard.press('Escape');await expect(page.locator('#color-dialog')).not.toBeVisible();expect((await getState(page)).color).toBe('#252629');
});
test('typing in document name, HEX, RGB and dialogs never changes tools or palette',async({page})=>{
 await page.locator('#document-name').fill('rgbyp 123 drawing');await page.keyboard.press('r');expect((await getState(page)).color).toBe('#252629');expect((await getState(page)).tool).toBe('pen');await page.locator('#document-name').press('Enter');await page.locator('#more-colors').click();await page.locator('#hex-input').fill('#b00b00');expect((await getState(page)).color).toBe('#252629');await page.keyboard.press('Escape');await page.locator('#help-button').click();await page.keyboard.press('r');expect((await getState(page)).color).toBe('#252629');await page.keyboard.press('Escape');
});
test('cursor hides outside canvas and in dialogs, then returns with new color',async({page})=>{
 await move(page,200,200);await expect(page.locator('#brush-cursor')).toBeVisible();await page.mouse.move(30,30);await expect(page.locator('#brush-cursor')).not.toBeVisible();await move(page,200,200);await page.keyboard.press('?');await expect(page.locator('#brush-cursor')).not.toBeVisible();await page.keyboard.press('Escape');await move(page,201,201);await page.keyboard.press('b');await expect(page.locator('#brush-cursor')).toHaveAttribute('data-color','#4b80d4');
});
test('Escape cancels an in-progress stroke without adding history',async({page})=>{
 await move(page,200,200);await page.mouse.down();await move(page,450,320);await page.waitForTimeout(50);expect(await inkCount(page)).toBeGreaterThan(0);await page.keyboard.press('Escape');await page.mouse.up();expect(await inkCount(page)).toBe(0);expect((await getState(page)).index).toBe(0);
});
test('pointer capture permits leaving canvas and releasing without a stuck pen',async({page})=>{
 await move(page,300,300);await page.mouse.down();const r=await page.locator('#drawing-canvas').boundingBox();await page.mouse.move(r.x+r.width+30,r.y+300,{steps:15});await page.mouse.up();expect((await getState(page)).active).toBe(false);expect((await getState(page)).index).toBe(1);const count=await inkCount(page);await move(page,500,500);expect(await inkCount(page)).toBe(count);await stroke(page,200,500,500,500);expect((await getState(page)).index).toBe(2);
});
test('Shift constrains line angle and makes equal-sided shapes',async({page})=>{
 await page.keyboard.press('7');await page.keyboard.down('Shift');await stroke(page,200,200,450,350);await page.keyboard.up('Shift');let p=(await getState(page)).ops[0].points;expect(Math.abs(p[1].x-p[0].x)).toBeCloseTo(Math.abs(p[1].y-p[0].y),2);
 await page.keyboard.press('6');await page.keyboard.down('Shift');await stroke(page,300,400,700,450);await page.keyboard.up('Shift');p=(await getState(page)).ops[1].points;expect(Math.abs(p[1].y-p[0].y)).toBeLessThan(.01);
});
test('local autosave restores exact art, name, tool, color and size after reload',async({page})=>{
 await page.locator('#document-name').fill('My studio sketch');await page.locator('#document-name').press('Enter');await page.keyboard.press('r');await setSize(page,25);await stroke(page);await page.keyboard.press('2');await expect(page.locator('#save-status')).toContainText('Saved on this device');const count=await inkCount(page);await page.reload();await page.waitForSelector('body[data-ready="true"]');expect(await inkCount(page)).toBe(count);const s=await getState(page);expect(s.name).toBe('My studio sketch');expect(s.tool).toBe('pencil');expect(s.color).toBe('#e74c4c');expect(s.size).toBe(25);await page.locator('#undo-button').click();expect(await inkCount(page)).toBe(0);
});
test('PNG export is a real 1200×800 image with white background, art and safe filename',async({page},info)=>{
 await page.locator('#document-name').fill('My sketch / test');await page.locator('#document-name').press('Enter');await page.keyboard.press('r');await setSize(page,30);await stroke(page);const downloadPromise=page.waitForEvent('download');await page.locator('#export-button').click();const download=await downloadPromise;expect(download.suggestedFilename()).toBe('My sketch - test.png');const path=info.outputPath('export.png');await download.saveAs(path);const png=PNG.sync.read(await fs.readFile(path));expect(png.width).toBe(1200);expect(png.height).toBe(800);expect([...png.data.slice(0,4)]).toEqual([255,255,255,255]);const i=(220*1200+300)*4;expect([...png.data.slice(i,i+4)]).toEqual([231,76,76,255]);
});
test('inspiration is optional, cannot overwrite drawing, and undoes as one action',async({page})=>{
 await page.locator('#demo-button').click();expect((await getState(page)).index).toBe(1);expect(await inkCount(page)).toBeGreaterThan(10000);await expect(page.locator('#demo-button')).toBeDisabled();await page.keyboard.press('Control+z');expect(await inkCount(page)).toBe(0);await expect(page.locator('#demo-button')).toBeEnabled();await stroke(page);await expect(page.locator('#demo-button')).toBeDisabled();
});
test('resizing to 390px keeps all palette colors usable, full picker in view, art intact',async({page},info)=>{
 await stroke(page);const n=await inkCount(page);await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('.swatch')).toHaveCount(16);await page.locator('.swatch[data-key="r"]').click();expect((await getState(page)).color).toBe('#e74c4c');expect(await inkCount(page)).toBe(n);const r=await page.locator('#drawing-canvas').boundingBox();expect(r.x+r.width).toBeLessThanOrEqual(390);await page.screenshot({path:info.outputPath('mobile.png')});await page.locator('#more-colors').click();await expect(page.locator('#apply-color')).toBeInViewport();await page.locator('#hex-input').fill('#123abc');await page.locator('#apply-color').click();await setSize(page,50);await stroke(page,200,400,800,400);expect((await sample(page,500,400))[3]).toBe(255);
});
test('touch gesture draws with no page scroll and no lingering cursor',async({page,context})=>{
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);const session=await context.newCDPSession(page);const a=await coords(page,200,350),b=await coords(page,850,350);await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x,y:a.y,id:1}]});for(let i=1;i<=12;i++)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(b.x-a.x)*i/12,y:a.y,id:1}]});await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});expect((await getState(page)).index).toBe(1);expect((await sample(page,500,350))[3]).toBe(255);await expect(page.locator('#brush-cursor')).not.toBeVisible();expect(await page.evaluate(()=>scrollY)).toBe(0);
});
