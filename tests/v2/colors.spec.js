import {test,expect,setup,state,stroke,move,sample} from './helpers.js';
setup();
const colors=[['k','#252629'],['a','#8c939b'],['w','#ffffff'],['n','#946443'],['r','#e74c4c'],['o','#f39743'],['y','#f2cb4c'],['l','#accb51'],['g','#47a86b'],['t','#38a99f'],['c','#56bfd5'],['b','#4b80d4'],['i','#6664bb'],['p','#9563c7'],['m','#d665a5'],['s','#f0a7b9']];
for(const [key,color] of colors)test('color '+key+' click, pixels, shortcut and pointer',async({page})=>{
 await page.locator('.swatch[data-key="'+key+'"]').click();await stroke(page);
 expect(await sample(page,250,170)).toEqual([...[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)),255]);
 await move(page,250,250);await page.keyboard.press('k');await page.keyboard.press(key.toUpperCase());
 expect((await state(page)).color).toBe(color);await expect(page.locator('#brush-cursor')).toHaveAttribute('data-color',color);
});
test('full picker validates HEX/RGB and restores recent colors',async({page})=>{
 await page.locator('#more-colors').click();await page.locator('#hex-input').fill('#zzzzzz');await expect(page.locator('#apply-color')).toBeDisabled();
 await page.locator('#hex-input').fill('#abc');await page.locator('#apply-color').click();expect((await state(page)).color).toBe('#aabbcc');
 await page.locator('#more-colors').click();await page.locator('#red-input').fill('999');await expect(page.locator('#apply-color')).toBeDisabled();
 await page.locator('#red-input').fill('12');await page.locator('#green-input').fill('34');await page.locator('#blue-input').fill('56');await page.locator('#apply-color').click();expect((await state(page)).color).toBe('#0c2238');
 await page.locator('.recent-swatch').nth(1).click();expect((await state(page)).color).toBe('#aabbcc');
});
