import asyncio,json,base64,math
from pathlib import Path
import websockets
URL="ws://127.0.0.1:61104/devtools/page/A976B9A59E061670009E750DB1FDCA3A"
class Pen:
 async def __aenter__(self):
  self.ws=await websockets.connect(URL,max_size=20000000);self.i=0;return self
 async def __aexit__(self,*a):await self.ws.close()
 async def call(self,m,p):
  self.i+=1;i=self.i
  await self.ws.send(json.dumps(dict(id=i,method=m,params=p)))
  while True:
   r=json.loads(await self.ws.recv())
   if r.get("id")==i:
    if "error" in r:raise RuntimeError(r["error"])
    return r.get("result",{})
 async def event(self,t,x,y,d=False):
  p=dict(type=t,x=x,y=y-87,button="left",buttons=int(d),pointerType="pen",force=int(d))
  if t!="mouseMoved":p["clickCount"]=1
  await self.call("Input.dispatchMouseEvent",p)
 async def click(self,x,y):
  await self.event("mouseMoved",x,y);await self.event("mousePressed",x,y,True);await self.event("mouseReleased",x,y);await asyncio.sleep(.08)
 async def drag(self,pts):
  await self.event("mouseMoved",*pts[0]);await self.event("mousePressed",*pts[0],True)
  for p in pts[1:]:
   await self.event("mouseMoved",*p,True);await asyncio.sleep(.004)
  await self.event("mouseReleased",*pts[-1]);await asyncio.sleep(.08)
 async def key(self,k,mods=0):
  p=dict(key=k,modifiers=mods)
  if mods==4 and k=="a":p["commands"]=["selectAll"]
  await self.call("Input.dispatchKeyEvent",dict(p,type="keyDown"));await self.call("Input.dispatchKeyEvent",dict(p,type="keyUp"))
 async def replace(self,t):
  await self.key("a",4);await self.call("Input.insertText",dict(text=str(t)))
 async def size(self,n):
  await self.click(702,151);await self.replace(n);await self.key("Tab")
 async def opacity(self,n):
  await self.click(850,151);await self.replace(n);await self.key("Tab")
 async def color(self,c):
  await self.click(52,591);await self.click(588,565);await self.replace(c);await self.click(754,636)
 async def tool(self,t):
  await self.click(dict(brush=138,star=318,line=409,rect=445,ellipse=481,fill=517,dropper=553)[t],151)
 async def stroke(self,pts):
  await self.tool("brush");await self.drag(pts)
 async def fill(self,x,y):
  await self.tool("fill");await self.click(x,y)
 async def shot(self,name):
  await self.event("mouseMoved",1080,740);await asyncio.sleep(.6)
  r=await self.call("Page.captureScreenshot",dict(format="png"))
  Path(name).write_bytes(base64.b64decode(r["data"]));print(name,flush=True)

def C(start,*segments):
 out=[start];a=start
 for b,c,d in segments:
  n=max(8,int((math.dist(a,b)+math.dist(b,c)+math.dist(c,d))/2))
  for i in range(1,n+1):
   t=i/n;u=1-t
   out.append((u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]))
  a=d
 return out
