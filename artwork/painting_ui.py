"""Paint-app UI helpers: brush strokes, field typing and bucket clicks only."""
import asyncio, math
from mouse_painter import Painter as BasePainter

class Painter(BasePainter):
    async def field(self,x,y,text):
        await self.click(x,y)
        await self.call('Input.dispatchKeyEvent',{'type':'keyDown','key':'a','code':'KeyA','modifiers':4,'windowsVirtualKeyCode':65,'commands':['selectAll']})
        await self.call('Input.dispatchKeyEvent',{'type':'keyUp','key':'a','code':'KeyA','modifiers':4,'windowsVirtualKeyCode':65})
        await self.type(str(text))
        await self.key('Tab')
    async def color(self,value):
        await self.click(54,591)
        await self.field(650,565,value)
        await self.click(830,636)
        await asyncio.sleep(.08)
    async def fill(self,value,seeds):
        await self.color(value)
        await self.tool('fill')
        for x,y in seeds: await self.click(x,y)
        await self.tool('brush')
    async def strokes(self,value,width,paths,smooth=False):
        await self.color(value); await self.size(width); await self.tool('brush')
        for points in paths:
            await self.drag(curve(points) if smooth else points)
    async def undo(self,n=1):
        for _ in range(n): await self.click(1340,108); await asyncio.sleep(.1)

def curve(points,steps=5):
    """Interpolate a hand-authored mouse path, not image/vector rendering."""
    out=[]
    padded=[points[0]]+points+[points[-1]]
    for i in range(1,len(padded)-2):
        p0,p1,p2,p3=padded[i-1:i+3]
        for j in range(steps):
            t=j/steps; t2=t*t; t3=t2*t
            out.append([.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3) for k in (0,1)])
    out.append(list(points[-1])); return out
