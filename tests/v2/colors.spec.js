import {test,expect,setup,state,stroke,move,sample} from './helpers.js';
setup();
const colors=[['k','#252629'],['w','#ffffff'],['r','#e74c4c'],['o','#f39743'],['y','#f2cb4c'],['g','#47a86b'],['c','#56bfd5'],['b','#4b80d4'],['p','#9563c7'],['s','#f0a7b9']];
for(const [key,color] of colors)test('color '+key+' click, pixels, shortcut and pointer',async({page})=>{
 await page.locator('.swatch[data-key="'+key+'"]').click();await stroke(page);
 expect(await sample(page,250,170)).toEqual([...[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)),255]);
 await move(page,250,250);await page.keyboard.press('k');await page.keyboard.press(key.toUpperCase());
 expect((await state(page)).color).toBe(color);await expect(page.locator('#brush-cursor')).toHaveAttribute('data-color',color);
});
test('full picker validates HEX/RGB and restores recent colors',async({page})=>{
 await page.locator('#current-chip').click();await page.locator('#hex-input').fill('#zzzzzz');await expect(page.locator('#apply-color')).toBeDisabled();
 await page.locator('#hex-input').fill('#abc');await page.locator('#apply-color').click();expect((await state(page)).color).toBe('#aabbcc');await page.waitForTimeout(2100);
 await page.locator('#current-chip').click();await page.locator('#red-input').fill('999');await expect(page.locator('#apply-color')).toBeDisabled();
 await page.locator('#red-input').fill('12');await page.locator('#green-input').fill('34');await page.locator('#blue-input').fill('56');await page.locator('#apply-color').click();expect((await state(page)).color).toBe('#0c2238');await page.waitForTimeout(2100);
 await page.locator('.recent-swatch').nth(1).click();expect((await state(page)).color).toBe('#aabbcc');
});

test('current HEX input changes color immediately and remembers stable custom colors after 2 seconds',async({page})=>{
 await page.locator('#color-value').fill('#123456');expect((await state(page)).color).toBe('#123456');await expect(page.locator('.recent-swatch')).toHaveCount(0);
 await page.waitForTimeout(1100);await page.locator('#color-value').fill('#654321');await page.waitForTimeout(1100);await expect(page.locator('.recent-swatch')).toHaveCount(0);
 await page.waitForTimeout(1100);await expect(page.locator('.recent-swatch')).toHaveCount(1);await expect(page.locator('.recent-swatch').first()).toHaveAttribute('title','Recent #654321');
});
