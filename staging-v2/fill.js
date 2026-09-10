function floodFill(target, point, color, opacity=100) {
 if (opacity <= 0) return;
 const w=target.canvas.width, h=target.canvas.height;
 const x=clamp(Math.floor(point.x*w/W),0,w-1), y=clamp(Math.floor(point.y*h/H),0,h-1);
 const image=target.getImageData(0,0,w,h), data=image.data;
 const start=y*w+x, seed=Array.from(data.slice(start*4,start*4+4));
 const replacement=rgb(color), sourceAlpha=opacity/100;
 if(seed[3]===255 && replacement.every((n,i)=>seed[i]===n))return;
 const queue=new Int32Array(w*h), visited=new Uint8Array(w*h);
 let head=0,tail=1;queue[0]=start;visited[start]=1;
 const push=i=>{if(!visited[i]){visited[i]=1;queue[tail++]=i;}};
 while(head<tail) {
  const index=queue[head++], j=index*4;
  const match=seed[3]===0 ? data[j+3]===0 : seed.every((n,i)=>Math.abs(data[j+i]-n)<=18);
  if(!match)continue;
  const destAlpha=data[j+3]/255, resultAlpha=sourceAlpha+destAlpha*(1-sourceAlpha);
  for(let c=0;c<3;c++) data[j+c]=Math.round((replacement[c]*sourceAlpha+data[j+c]*destAlpha*(1-sourceAlpha))/resultAlpha);
  data[j+3]=Math.round(resultAlpha*255);
  const col=index%w;
  if(col>0)push(index-1);if(col<w-1)push(index+1);
  if(index>=w)push(index-w);if(index<(h-1)*w)push(index+w);
 }
 target.putImageData(image,0,0);
}
