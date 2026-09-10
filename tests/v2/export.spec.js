import {test,expect,setup,stroke} from './helpers.js';
import {PNG} from 'pngjs';
import fs from 'node:fs/promises';
setup();
test('PNG export stays 500x500 on both pixel densities and contains opaque artwork',async({page},info)=>{
 await page.locator('#document-name').fill('My sketch / test');await page.locator('#document-name').press('Enter');await page.keyboard.press('r');await stroke(page);
 const promise=page.waitForEvent('download');await page.locator('#export-button').click();const download=await promise;
 expect(download.suggestedFilename()).toBe('My sketch - test.png');
 const path=info.outputPath('painting.png');await download.saveAs(path);
 const png=PNG.sync.read(await fs.readFile(path));expect([png.width,png.height]).toEqual([500,500]);
 expect([...png.data.slice(0,4)]).toEqual([255,255,255,255]);const i=(170*500+250)*4;
 expect([...png.data.slice(i,i+4)]).toEqual([231,76,76,255]);
});
