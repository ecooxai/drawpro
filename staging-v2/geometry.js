function smoothPath(c,points) {
 c.beginPath();const p=points[0];c.moveTo(p.x,p.y);
 if(points.length===2){c.lineTo(points[1].x,points[1].y);return;}
 for(let i=1;i<points.length-1;i++){const a=points[i],b=points[i+1];c.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2);}
 const last=points.at(-1);c.lineTo(last.x,last.y);
}
function strokePath(c,op,width=op.size) {
 const p=op.points;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';
 if(p.length===1){c.beginPath();c.arc(p[0].x,p[0].y,width/2,0,Math.PI*2);c.fill();return;}
 smoothPath(c,p);c.stroke();
}
