// Sweep convex brush tips along each segment. Fill the union once for uniform opacity.
function addPolygon(c, points) {
 c.moveTo(...points[0]);
 for (let i=1;i<points.length;i++) c.lineTo(...points[i]);
 c.closePath();
}
function convexHull(points) {
 const sorted=points.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lower=[], upper=[];
 for (const p of sorted) {while(lower.length>=2&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
 for (const p of sorted.reverse()) {while(upper.length>=2&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
 lower.pop();upper.pop();return lower.concat(upper);
}
function drawShapeBrush(c, op) {
 const polygon=polygonFor(op.tool,op.size);
 const stamp=p=>polygon.map(([x,y])=>[x+p.x,y+p.y]);
 c.beginPath();addPolygon(c,stamp(op.points[0]));
 if (op.tool==='star') {
  const spacing=Math.max(2,op.size*.9);let carry=0;
  for(let i=1;i<op.points.length;i++) {
   const a=op.points[i-1],b=op.points[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
   for(let distance=spacing-carry;distance<=len;distance+=spacing) addPolygon(c,stamp({x:a.x+dx*distance/len,y:a.y+dy*distance/len}));
   carry=(carry+len)%spacing;
  }
 } else {
  for(let i=1;i<op.points.length;i++) addPolygon(c,convexHull([...stamp(op.points[i-1]),...stamp(op.points[i])]));
 }
 c.fill();
}
