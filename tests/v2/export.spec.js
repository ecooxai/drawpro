import {test,expect,setup,stroke,dot} from './helpers.js';
import {PNG} from 'pngjs';
import fs from 'node:fs/promises';
setup();

async function openDownload(page){
 await page.locator('#export-button').click();
 await expect(page.locator('#export-menu')).toBeVisible();
}

test('download menu opens below the button and PNG export stays 500x500 with opaque artwork',async({page},info)=>{
 await page.locator('#document-name').fill('My sketch / test');await page.locator('#document-name').press('Enter');await page.keyboard.press('r');await stroke(page);
 await openDownload(page);
 const button=await page.locator('#export-button').boundingBox(),menu=await page.locator('#export-menu').boundingBox();
 expect(menu.y).toBeGreaterThanOrEqual(button.y+button.height-1);
 const promise=page.waitForEvent('download');await page.locator('[data-export-format="png"]').click();const download=await promise;
 expect(download.suggestedFilename()).toBe('My sketch - test.png');
 const path=info.outputPath('painting.png');await download.saveAs(path);
 const png=PNG.sync.read(await fs.readFile(path));expect([png.width,png.height]).toEqual([500,500]);
 expect([...png.data.slice(0,4)]).toEqual([255,255,255,255]);const i=(170*500+250)*4;
 expect([...png.data.slice(i,i+4)]).toEqual([231,76,76,255]);
 await expect(page.locator('#export-menu')).not.toBeVisible();
});

test('download menu exports real JPG and WebP files',async({page},info)=>{
 await dot(page,200,200);
 for(const [format,extension,magic] of [['jpg','jpg',[0xff,0xd8,0xff]],['webp','webp',[0x52,0x49,0x46,0x46]]]){
  await openDownload(page);const promise=page.waitForEvent('download');await page.locator(`[data-export-format="${format}"]`).click();const download=await promise;
  expect(download.suggestedFilename().endsWith('.'+extension)).toBe(true);const path=info.outputPath('painting.'+extension);await download.saveAs(path);const data=await fs.readFile(path);
  expect([...data.subarray(0,magic.length)]).toEqual(magic);if(format==='webp')expect(data.subarray(8,12).toString()).toBe('WEBP');
 }
});

test('help uses a help icon and explains both color entry methods',async({page})=>{
 await expect(page.locator('#help-button [data-icon="help"]')).toHaveCount(1);await page.locator('#help-button').click();
 await expect(page.locator('#help-title')).toHaveText('Help');await expect(page.locator('.help-color-guide')).toContainText('Click the large color indicator');
 await expect(page.locator('.help-color-guide')).toContainText('field immediately below the color indicator');
 await expect(page.locator('#current-chip')).toHaveAttribute('aria-label','Open color picker');await expect(page.locator('#color-value')).toHaveAttribute('title','Type a HEX color');
});

test('video export makes one transient WebP frame per action and updates duration for 30 60 and 120 FPS',async({page},info)=>{
 await stroke(page,70,100,430,100);await stroke(page,70,200,430,200);await dot(page,250,300);
 await openDownload(page);await page.locator('#video-option').click();await expect(page.locator('#video-options')).toBeVisible();
 await expect(page.locator('#video-frame-count')).toHaveText('3 frames');await expect(page.locator('#video-length')).toHaveText('0.10 s');
 await page.locator('[data-fps="60"]').click();await expect(page.locator('[data-fps="60"]')).toHaveAttribute('aria-checked','true');await expect(page.locator('#video-length')).toHaveText('0.05 s');
 await page.locator('[data-fps="120"]').click();await expect(page.locator('[data-fps="120"]')).toHaveAttribute('aria-checked','true');await expect(page.locator('#video-length')).toHaveText('0.03 s');
 await page.evaluate(()=>{window.__webpFrames=0;const original=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(callback,type,...rest){if(type==='image/webp')window.__webpFrames++;return original.call(this,callback,type,...rest);};});
 const promise=page.waitForEvent('download');await page.locator('#export-video-button').click();const download=await promise;
 expect(download.suggestedFilename().endsWith('.webm')).toBe(true);const path=info.outputPath('actions.webm');await download.saveAs(path);const data=await fs.readFile(path);
 expect(data.length).toBeGreaterThan(100);expect([...data.subarray(0,4)]).toEqual([0x1a,0x45,0xdf,0xa3]);expect(await page.evaluate(()=>window.__webpFrames)).toBe(3);
 await expect(page.locator('#export-menu')).not.toBeVisible();
});
