"""Drive ONLY the isolated paint window's mouse/keyboard input; never draw via canvas APIs."""
import asyncio, base64, json, math
from pathlib import Path
import websockets

ROOT = Path(__file__).resolve().parent
class Painter:
    async def __aenter__(self):
        session=json.loads((ROOT/'background-session.json').read_text())
        self.ws=await websockets.connect(session['websocket'], max_size=60_000_000)
        self.inset=session['window_inset_y']; self.seq=0
        return self
    async def __aexit__(self,*args):
        await self.ws.close()
    async def call(self,method,params=None):
        self.seq+=1; n=self.seq
        await self.ws.send(json.dumps({'id':n,'method':method,'params':params or {}}))
        while True:
            r=json.loads(await self.ws.recv())
            if r.get('id')==n:
                if 'error' in r: raise RuntimeError(r['error'])
                return r.get('result',{})
    async def mouse(self,kind,x,y,pressed=False):
        return await self.call('Input.dispatchMouseEvent',{'type':kind,'x':x,'y':y-self.inset,'button':'left' if pressed or kind=='mouseReleased' else 'none','buttons':1 if pressed else 0,'clickCount':1 if kind!='mouseMoved' else 0,'pointerType':'mouse'})
    async def click(self,x,y):
        await self.mouse('mouseMoved',x,y)
        await self.mouse('mousePressed',x,y,True)
        await self.mouse('mouseReleased',x,y)
        await asyncio.sleep(.08)
    async def drag(self,points,step=2.0):
        if len(points)<2: return
        await self.mouse('mouseMoved',*points[0])
        await self.mouse('mousePressed',*points[0],True)
        try:
            for a,b in zip(points,points[1:]):
                n=max(1,math.ceil(math.dist(a,b)/step))
                for i in range(1,n+1):
                    t=i/n
                    await self.mouse('mouseMoved',a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,True)
        finally:
            await self.mouse('mouseReleased',*points[-1])
        await asyncio.sleep(.06)
    async def key(self,key,mod=0):
        codes={'Tab':9,'Enter':13,'Escape':27,'Backspace':8,'ArrowLeft':37,'ArrowRight':39,'ArrowUp':38,'ArrowDown':40}
        vk=codes.get(key,ord(key.upper()) if len(key)==1 else 0)
        for kind in ['keyDown','keyUp']:
            await self.call('Input.dispatchKeyEvent',{'type':kind,'key':key,'windowsVirtualKeyCode':vk,'nativeVirtualKeyCode':vk,'modifiers':mod})
        await asyncio.sleep(.04)
    async def type(self,text):
        await self.call('Input.insertText',{'text':str(text)})
        await asyncio.sleep(.06)
    async def field(self,x,y,text):
        await self.click(x,y); await self.key('a',4); await self.type(text); await self.key('Tab')
    async def size(self,n):
        await self.field(698,151,str(n))
    async def opacity(self,n):
        await self.field(850,151,str(n))
    async def tool(self,name):
        x={'brush':138,'square':174,'triangle':210,'diamond':246,'flat':282,'star':318,'eraser':373,'line':409,'rect':445,'ellipse':481,'fill':517,'eyedropper':553}[name]
        await self.click(x,151)
    async def shot(self,name='latest.png'):
        await self.mouse('mouseMoved',120,185)
        await asyncio.sleep(.3)
        r=await self.call('Page.captureScreenshot',{'format':'png','fromSurface':True})
        (ROOT/name).write_bytes(base64.b64decode(r['data']))
        print('Observation:', 'artwork/'+name, flush=True)

async def main():
    async with Painter() as p:
        await p.click(54,591)
        await p.shot('color-picker.png')
if __name__=='__main__': asyncio.run(main())
