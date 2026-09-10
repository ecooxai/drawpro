"""Paint exclusively with native mouse drags and keyboard input via the MCP computer tool.
No DOM evaluation, canvas API, image import, SVG import, or browser automation.
The curves below are a drawing plan, sampled into mouse positions.
"""
import json, math, re, time, urllib.request, pathlib, sys, colorsys, subprocess
from PIL import Image, ImageDraw, ImageFilter, ImageChops
ROOT=pathlib.Path('/Users/ecoo/project/newlessagettest/drawing-pro/output/two-girls')
ROOT.mkdir(exist_ok=True,parents=True)
WORKSPACE='821c590b19feed3d403d4a05b3cdca2c'
TARGET=dict(workspace=WORKSPACE,window_id=5709,pid=34056,mode='background',screen_width=2400,screen_height=1560,show_pointer=False)
ORIGIN=(404.0,188.5)
LAST={}
count=0
color_cache=None
size_cache=None
tool_cache=None

def act(action,**kw):
 global LAST,count
 if action=='drag':
  subprocess.run(['osascript','-e','tell application \"System Events\" to set frontmost of first application process whose unix id is 34056 to true'],check=True,capture_output=True)
 args=dict(TARGET,action=action,**kw)
 request={'jsonrpc':'2.0','id':1,'method':'tools/call','params':{'name':'computer','arguments':args}}
 req=urllib.request.Request('http://127.0.0.1:3210/mcp',data=json.dumps(request).encode(),headers={'Content-Type':'application/json'})
 with urllib.request.urlopen(req,timeout=120) as response: result=json.load(response)
 if 'error' in result: raise RuntimeError(result['error'])
 result=result['result']
 if result.get('isError'): raise RuntimeError(result)
 text=next(c['text'] for c in result['content'] if c['type']=='text')
 LAST=json.loads(text)
 if LAST.get('ok') is False or LAST.get('screenshot_error'): raise RuntimeError(LAST)
 if (LAST.get('screen_width'),LAST.get('screen_height')) != (2400,1560): raise RuntimeError(('Window geometry changed',LAST))
 count+=1
 with (ROOT/'native-input-log.jsonl').open('a') as f: f.write(json.dumps({'action':args,'result':LAST})+'\n')
 (ROOT/'latest.json').write_text(json.dumps(LAST))
 return LAST

def click(x,y): return act('click',x=round(x*2),y=round(y*2))
def key(k): return act('key',key=k)
def text(s): return act('type',text=str(s))

def color(h):
 global color_cache
 if h==color_cache:return
 expected=tuple(int(h[i:i+2],16) for i in (1,3,5))
 hue,sat,val=colorsys.rgb_to_hsv(*(c/255 for c in expected))
 click(53,108.5)
 click(437+min(359,hue*360)*326/359,472.5)
 click(431+sat*338,250+(1-val)*180)
 click(710,598)
 im=Image.open(LAST['path']).convert('RGB')
 actual=im.getpixel((106,212))
 if max(abs(a-b) for a,b in zip(actual,expected))>6:raise RuntimeError(('Color selection did not take',h,actual,LAST['path']))
 color_cache=h
 print('COLOR',h,actual,flush=True)

def size(n):
 global size_cache
 n=round(n)
 if n==size_cache:return
 click(621+(n-1)*50/49,96.5)
 size_cache=n

def points(d):
 tokens=re.findall(r'[MLCQZmlcqz]|[-+]?(?:\d*\.\d+|\d+)',d)
 p=[];i=0;cmd=None;start=None;cur=(0,0)
 while i<len(tokens):
  if tokens[i].isalpha():cmd=tokens[i].upper();i+=1
  if cmd=='Z':
   if start is not None:p.append(start);cur=start
   cmd=None;continue
  n={'M':2,'L':2,'Q':4,'C':6}[cmd]
  a=list(map(float,tokens[i:i+n]));i+=n
  if cmd in ('M','L'):
   cur=(a[0],a[1]);p.append(cur)
   if cmd=='M':start=cur;cmd='L'
  elif cmd=='Q':
   q=(a[0],a[1]);end=(a[2],a[3]);length=math.dist(cur,q)+math.dist(q,end);steps=max(3,math.ceil(length/2.4));prev=cur
   for j in range(1,steps+1):
    t=j/steps;u=1-t;p.append((u*u*prev[0]+2*u*t*q[0]+t*t*end[0],u*u*prev[1]+2*u*t*q[1]+t*t*end[1]))
   cur=end
  else:
   q=(a[0],a[1]);r=(a[2],a[3]);end=(a[4],a[5]);length=math.dist(cur,q)+math.dist(q,r)+math.dist(r,end);steps=max(3,math.ceil(length/2.4));prev=cur
   for j in range(1,steps+1):
    t=j/steps;u=1-t;p.append((u**3*prev[0]+3*u*u*t*q[0]+3*u*t*t*r[0]+t**3*end[0],u**3*prev[1]+3*u*u*t*q[1]+3*u*t*t*r[1]+t**3*end[1]))
   cur=end
 return p

def drag(p,duration=None):
 if len(p)<2:return
 # A click at the intended start gives the canvas focus before a drag.
 # The dot is part of the same brush stroke, not a mark elsewhere.
 click(ORIGIN[0]+p[0][0],ORIGIN[1]+p[0][1])
 # Every drag remains inside this drawing's 500 x 500 canvas.
 assert all(1<=x<=499 and 1<=y<=499 for x,y in p),('Out of canvas',p)
 screen=[[round(2*(ORIGIN[0]+x),2),round(2*(ORIGIN[1]+y),2)] for x,y in p]
 for k in range(0,len(screen)-1,480):
  part=screen[k:k+481]
  dur=duration or min(5,max(.35,len(part)*.010))
  act('drag',path=part,duration=dur)

def tool(name):
 global tool_cache
 if name==tool_cache:return
 click(137 if name=='brush' else 517,96)
 tool_cache=name

def stroke(h,n,d):
 color(h);tool('brush');size(n);drag(points(d))

def fills(poly,brush=2):
 """Horizontal mouse hatching, clipped to the drawn contour; not pixel rendering."""
 if poly[0]!=poly[-1]:poly=poly+[poly[0]]
 ymin=min(y for x,y in poly);ymax=max(y for x,y in poly)
 rows=[];y=ymin+.65;step=brush*.48
 while y<ymax-.4:
  xs=[]
  for (x1,y1),(x2,y2) in zip(poly,poly[1:]):
   if (y1<=y<y2) or (y2<=y<y1):xs.append(x1+(y-y1)*(x2-x1)/(y2-y1))
  xs.sort();pairs=[]
  for k in range(0,len(xs)-1,2):
   a=xs[k]+brush*.35;b=xs[k+1]-brush*.35
   if b>=a:pairs.append((a,b))
  rows.append((y,pairs));y+=step
 # Preserve disconnected regions rather than dragging through the empty space.
 paths=[];active=[]
 for row,(y,pairs) in enumerate(rows):
  new=[];used=set()
  for a,b in pairs:
   candidates=[(abs(path[-1][0]-(a+b)/2),idx,path) for idx,path in enumerate(active) if idx not in used and min(path[-2][0],path[-1][0])<=b and max(path[-2][0],path[-1][0])>=a]
   if candidates:
    _,idx,path=min(candidates);used.add(idx)
   else:path=[]
   if not path or abs(path[-1][0]-a)<abs(path[-1][0]-b):path.extend([(a,y),(b,y)])
   else:path.extend([(b,y),(a,y)])
   new.append(path)
  for idx,path in enumerate(active):
   if idx not in used and len(path)>1:paths.append(path)
  active=new
 paths.extend(path for path in active if len(path)>1)
 return paths

def canvas_image():
 return Image.open(LAST['path']).convert('RGB').crop((808,377,1808,1377)).resize((500,500),Image.Resampling.BOX)

def shape(h,d,n=2):
 color(h);tool('brush');size(n)
 p=points(d)
 if p[0]!=p[-1]:p.append(p[0])
 drag(p)
 mask=Image.new('L',(500,500));ImageDraw.Draw(mask).polygon(p,fill=255)
 inner=mask.filter(ImageFilter.MinFilter(5))
 permitted=mask.filter(ImageFilter.MaxFilter(11))
 expected=Image.open(LAST['path']).convert('RGB').getpixel((106,212))
 bounds=inner.getbbox()
 if bounds is None:return
 tool('fill')
 for attempt in range(12):
  before=canvas_image();pix=before.load();mi=inner.load()
  candidates=[]
  for y in range(bounds[1],bounds[3],2):
   for x in range(bounds[0],bounds[2],2):
    if mi[x,y] and max(abs(a-b) for a,b in zip(pix[x,y],expected))>9:candidates.append((x,y))
  if not candidates:break
  def clearance(pt):
   x,y=pt;best=1e9
   for (ax,ay),(bx,by) in zip(p,p[1:]):
    dx=bx-ax;dy=by-ay;t=max(0,min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy))) if dx or dy else 0
    best=min(best,(x-ax-t*dx)**2+(y-ay-t*dy)**2)
   return best
  x,y=max(candidates,key=clearance)
  click(ORIGIN[0]+x+.25,ORIGIN[1]+y+.25)
  after=canvas_image()
  diff=ImageChops.difference(before,after).convert('L')
  leak=ImageChops.subtract(diff,permitted)
  changed=sum(v>20 for v in leak.getdata())
  if changed>50:
   click(1099,52)
   raise RuntimeError(('Fill escaped contour; undone',h,(x,y),changed,LAST['path']))
 else:raise RuntimeError(('Fill did not converge',h,LAST['path']))
 print('PAINTED',h,'fills',attempt+1,flush=True)

def dot(h,n,x,y):
 color(h);tool('brush');size(n);click(ORIGIN[0]+x,ORIGIN[1]+y)

def lines(h,n,items):
 color(h);tool('brush');size(n)
 for d in items:drag(points(d))

def finish(label):
 (ROOT/(label+'.json')).write_text(json.dumps(LAST))
 print('DONE',label,'actions',count,'screenshot',LAST.get('path'),flush=True)

if __name__=='__main__':
 key('escape')
 click(315,52);key('cmd+a');text('Two Girls - Quiet Light and Summer Sky');key('enter')
 size(2);key('1')
 finish('setup')
