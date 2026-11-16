/* Segment/AABB intersection shared by sight, shots and devices. */
(()=>{'use strict';
 function segmentRect(ax,ay,bx,by,r,pad=0){let lo=0,hi=1;for(const [a,d,min,max]of [[ax,bx-ax,r.x-pad,r.x+r.width+pad],[ay,by-ay,r.y-pad,r.y+r.height+pad]]){if(Math.abs(d)<1e-9){if(a<min||a>max)return false;}else{let t0=(min-a)/d,t1=(max-a)/d;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)return false;}}return true;}
 const intersects=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
 window.OriginGeometry={segmentRect,intersects};})();
