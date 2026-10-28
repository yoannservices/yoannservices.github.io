(()=>{var cu=0,vc=1,hu=2;var Er=1,uu=2,ms=3,gi=0,Ve=1,Qe=2,Bn=0,gs=1,yc=2,Mc=3,Sc=4,du=5;var Pi=100,fu=101,pu=102,mu=103,gu=104,xu=200,_u=201,vu=202,yu=203,bc=204,Ec=205,Mu=206,Su=207,bu=208,Eu=209,Tu=210,wu=211,Au=212,Ru=213,Cu=214,Ea=0,Ta=1,wa=2,ns=3,Aa=4,Ra=5,Ca=6,Ia=7,Tc=0,Iu=1,Pu=2,En=0,wc=1,Ac=2,Rc=3,Cc=4,Ic=5,Pc=6,Lc=7;var Dc=300,xi=301,Li=302,lo=303,co=304,Tr=306,is=1e3,Dn=1001,Pa=1002,ke=1003,Lu=1004;var wr=1005;var Ge=1006,ho=1007;var _i=1008;var sn=1009,Nc=1010,Uc=1011,xs=1012,uo=1013,Tn=1014,pn=1015,wn=1016,fo=1017,po=1018,_s=1020,Fc=35902,Oc=35899,Bc=1021,zc=1022,mn=1023,Nn=1026,vi=1027,mo=1028,go=1029,yi=1030,xo=1031;var _o=1033,Ar=33776,Rr=33777,Cr=33778,Ir=33779,vo=35840,yo=35841,Mo=35842,So=35843,bo=36196,Eo=37492,To=37496,wo=37488,Ao=37489,Pr=37490,Ro=37491,Co=37808,Io=37809,Po=37810,Lo=37811,Do=37812,No=37813,Uo=37814,Fo=37815,Oo=37816,Bo=37817,zo=37818,ko=37819,Ho=37820,Go=37821,Vo=36492,Wo=36494,Xo=36495,qo=36283,Yo=36284,Lr=36285,Zo=36286;var Hs=2300,La=2301,Sa=2302,oc=2303,lc=2400,cc=2401,hc=2402;var Du=3200;var $o=0,Nu=1,jn="",Pe="srgb",Gs="srgb-linear",Vs="linear",de="srgb";var ba=7680;var Uu=519,Fu=512,Ou=513,Bu=514,Jo=515,zu=516,ku=517,Ko=518,Hu=519,Gu=35044;var kc="300 es",Sn=2e3,ss=2001;function yf(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Mf(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Ws(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Vu(){let i=Ws("canvas");return i.style.display="block",i}var Ih={},rs=null;function Hc(...i){let t="THREE."+i.shift();rs?rs("log",t,...i):console.log(t,...i)}function Wu(i){let t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function zt(...i){i=Wu(i);let t="THREE."+i.shift();if(rs)rs("warn",t,...i);else{let e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function Gt(...i){i=Wu(i);let t="THREE."+i.shift();if(rs)rs("error",t,...i);else{let e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function Ci(...i){let t=i.join(" ");t in Ih||(Ih[t]=!0,zt(...i))}function Xu(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var qu={[Ea]:Ta,[wa]:Ca,[Aa]:Ia,[ns]:Ra,[Ta]:Ea,[Ca]:wa,[Ia]:Aa,[Ra]:ns},Un=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},Xe=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Nl=Math.PI/180,Xs=180/Math.PI;function vs(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Xe[i&255]+Xe[i>>8&255]+Xe[i>>16&255]+Xe[i>>24&255]+"-"+Xe[t&255]+Xe[t>>8&255]+"-"+Xe[t>>16&15|64]+Xe[t>>24&255]+"-"+Xe[e&63|128]+Xe[e>>8&255]+"-"+Xe[e>>16&255]+Xe[e>>24&255]+Xe[n&255]+Xe[n>>8&255]+Xe[n>>16&255]+Xe[n>>24&255]).toLowerCase()}function jt(i,t,e){return Math.max(t,Math.min(e,i))}function Sf(i,t){return(i%t+t)%t}function Ul(i,t,e){return(1-e)*i+e*t}function Is(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function en(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var dt=class i{static{i.prototype.isVector2=!0}constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=jt(this.x,t.x,e.x),this.y=jt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=jt(this.x,t,e),this.y=jt(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(jt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(jt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},fn=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],f=n[s+3],h=r[a+0],d=r[a+1],m=r[a+2],x=r[a+3];if(f!==x||l!==h||c!==d||u!==m){let g=l*h+c*d+u*m+f*x;g<0&&(h=-h,d=-d,m=-m,x=-x,g=-g);let p=1-o;if(g<.9995){let M=Math.acos(g),b=Math.sin(M);p=Math.sin(p*M)/b,o=Math.sin(o*M)/b,l=l*p+h*o,c=c*p+d*o,u=u*p+m*o,f=f*p+x*o}else{l=l*p+h*o,c=c*p+d*o,u=u*p+m*o,f=f*p+x*o;let M=1/Math.sqrt(l*l+c*c+u*u+f*f);l*=M,c*=M,u*=M,f*=M}}t[e]=l,t[e+1]=c,t[e+2]=u,t[e+3]=f}static multiplyQuaternionsFlat(t,e,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],f=r[a],h=r[a+1],d=r[a+2],m=r[a+3];return t[e]=o*m+u*f+l*d-c*h,t[e+1]=l*m+u*h+c*f-o*d,t[e+2]=c*m+u*d+o*h-l*f,t[e+3]=u*m-o*f-l*h-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),f=o(r/2),h=l(n/2),d=l(s/2),m=l(r/2);switch(a){case"XYZ":this._x=h*u*f+c*d*m,this._y=c*d*f-h*u*m,this._z=c*u*m+h*d*f,this._w=c*u*f-h*d*m;break;case"YXZ":this._x=h*u*f+c*d*m,this._y=c*d*f-h*u*m,this._z=c*u*m-h*d*f,this._w=c*u*f+h*d*m;break;case"ZXY":this._x=h*u*f-c*d*m,this._y=c*d*f+h*u*m,this._z=c*u*m+h*d*f,this._w=c*u*f-h*d*m;break;case"ZYX":this._x=h*u*f-c*d*m,this._y=c*d*f+h*u*m,this._z=c*u*m-h*d*f,this._w=c*u*f+h*d*m;break;case"YZX":this._x=h*u*f+c*d*m,this._y=c*d*f+h*u*m,this._z=c*u*m-h*d*f,this._w=c*u*f-h*d*m;break;case"XZY":this._x=h*u*f-c*d*m,this._y=c*d*f-h*u*m,this._z=c*u*m+h*d*f,this._w=c*u*f+h*d*m;break;default:zt("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],u=e[6],f=e[10],h=n+o+f;if(h>0){let d=.5/Math.sqrt(h+1);this._w=.25/d,this._x=(u-l)*d,this._y=(r-c)*d,this._z=(a-s)*d}else if(n>o&&n>f){let d=2*Math.sqrt(1+n-o-f);this._w=(u-l)/d,this._x=.25*d,this._y=(s+a)/d,this._z=(r+c)/d}else if(o>f){let d=2*Math.sqrt(1+o-n-f);this._w=(r-c)/d,this._x=(s+a)/d,this._y=.25*d,this._z=(l+u)/d}else{let d=2*Math.sqrt(1+f-n-o);this._w=(a-s)/d,this._x=(r+c)/d,this._y=(l+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(jt(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,u=e._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-e;if(o<.9995){let c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,e=Math.sin(e*c)/u,this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},N=class i{static{i.prototype.isVector3=!0}constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Ph.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Ph.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*n),u=2*(o*e-r*s),f=2*(r*n-a*e);return this.x=e+l*c+a*f-o*u,this.y=n+l*u+o*c-r*f,this.z=s+l*f+r*u-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=jt(this.x,t.x,e.x),this.y=jt(this.y,t.y,e.y),this.z=jt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=jt(this.x,t,e),this.y=jt(this.y,t,e),this.z=jt(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(jt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Fl.copy(this).projectOnVector(t),this.sub(Fl)}reflect(t){return this.sub(Fl.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(jt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Fl=new N,Ph=new fn,Xt=class i{static{i.prototype.isMatrix3=!0}constructor(t,e,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c)}set(t,e,n,s,r,a,o,l,c){let u=this.elements;return u[0]=t,u[1]=s,u[2]=o,u[3]=e,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],f=n[7],h=n[2],d=n[5],m=n[8],x=s[0],g=s[3],p=s[6],M=s[1],b=s[4],y=s[7],E=s[2],T=s[5],R=s[8];return r[0]=a*x+o*M+l*E,r[3]=a*g+o*b+l*T,r[6]=a*p+o*y+l*R,r[1]=c*x+u*M+f*E,r[4]=c*g+u*b+f*T,r[7]=c*p+u*y+f*R,r[2]=h*x+d*M+m*E,r[5]=h*g+d*b+m*T,r[8]=h*p+d*y+m*R,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8];return e*a*u-e*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],f=u*a-o*c,h=o*l-u*r,d=c*r-a*l,m=e*f+n*h+s*d;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/m;return t[0]=f*x,t[1]=(s*c-u*n)*x,t[2]=(o*n-s*a)*x,t[3]=h*x,t[4]=(u*e-s*l)*x,t[5]=(s*r-o*e)*x,t[6]=d*x,t[7]=(n*l-c*e)*x,t[8]=(a*e-n*r)*x,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return Ci("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Ol.makeScale(t,e)),this}rotate(t){return Ci("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Ol.makeRotation(-t)),this}translate(t,e){return Ci("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Ol.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Ol=new Xt,Lh=new Xt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Dh=new Xt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function bf(){let i={enabled:!0,workingColorSpace:Gs,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===de&&(s.r=Zn(s.r),s.g=Zn(s.g),s.b=Zn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===de&&(s.r=es(s.r),s.g=es(s.g),s.b=es(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===jn?Vs:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Ci("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Ci("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Gs]:{primaries:t,whitePoint:n,transfer:Vs,toXYZ:Lh,fromXYZ:Dh,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Pe},outputColorSpaceConfig:{drawingBufferColorSpace:Pe}},[Pe]:{primaries:t,whitePoint:n,transfer:de,toXYZ:Lh,fromXYZ:Dh,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Pe}}}),i}var ne=bf();function Zn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function es(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Hi,Da=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{Hi===void 0&&(Hi=Ws("canvas")),Hi.width=t.width,Hi.height=t.height;let s=Hi.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=Hi}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Ws("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Zn(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Zn(e[n]/255)*255):e[n]=Zn(e[n]);return{data:e,width:t.width,height:t.height}}else return zt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Ef=0,as=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Ef++}),this.uuid=vs(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Bl(s[a].image)):r.push(Bl(s[a]))}else r=Bl(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function Bl(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Da.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(zt("Texture: Unable to serialize Texture."),{})}var Tf=0,zl=new N,je=class i extends Un{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=Dn,s=Dn,r=Ge,a=_i,o=mn,l=sn,c=i.DEFAULT_ANISOTROPY,u=jn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Tf++}),this.uuid=vs(),this.name="",this.source=new as(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new dt(0,0),this.repeat=new dt(1,1),this.center=new dt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Xt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(zl).x}get height(){return this.source.getSize(zl).y}get depth(){return this.source.getSize(zl).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){zt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){zt(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Dc)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case is:t.x=t.x-Math.floor(t.x);break;case Dn:t.x=t.x<0?0:1;break;case Pa:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case is:t.y=t.y-Math.floor(t.y);break;case Dn:t.y=t.y<0?0:1;break;case Pa:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};je.DEFAULT_IMAGE=null;je.DEFAULT_MAPPING=Dc;je.DEFAULT_ANISOTROPY=1;var be=class i{static{i.prototype.isVector4=!0}constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,l=t.elements,c=l[0],u=l[4],f=l[8],h=l[1],d=l[5],m=l[9],x=l[2],g=l[6],p=l[10];if(Math.abs(u-h)<.01&&Math.abs(f-x)<.01&&Math.abs(m-g)<.01){if(Math.abs(u+h)<.1&&Math.abs(f+x)<.1&&Math.abs(m+g)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let b=(c+1)/2,y=(d+1)/2,E=(p+1)/2,T=(u+h)/4,R=(f+x)/4,v=(m+g)/4;return b>y&&b>E?b<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(b),s=T/n,r=R/n):y>E?y<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),n=T/s,r=v/s):E<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),n=R/r,s=v/r),this.set(n,s,r,e),this}let M=Math.sqrt((g-m)*(g-m)+(f-x)*(f-x)+(h-u)*(h-u));return Math.abs(M)<.001&&(M=1),this.x=(g-m)/M,this.y=(f-x)/M,this.z=(h-u)/M,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=jt(this.x,t.x,e.x),this.y=jt(this.y,t.y,e.y),this.z=jt(this.z,t.z,e.z),this.w=jt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=jt(this.x,t,e),this.y=jt(this.y,t,e),this.z=jt(this.z,t,e),this.w=jt(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(jt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Na=class extends Un{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ge,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new be(0,0,t,e),this.scissorTest=!1,this.viewport=new be(0,0,t,e),this.textures=[];let s={width:t,height:e,depth:n.depth},r=new je(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Ge,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new as(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},nn=class extends Na{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},qs=class extends je{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=ke,this.minFilter=ke,this.wrapR=Dn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ua=class extends je{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=ke,this.minFilter=ke,this.wrapR=Dn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var fe=class i{static{i.prototype.isMatrix4=!0}constructor(t,e,n,s,r,a,o,l,c,u,f,h,d,m,x,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c,u,f,h,d,m,x,g)}set(t,e,n,s,r,a,o,l,c,u,f,h,d,m,x,g){let p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=u,p[10]=f,p[14]=h,p[3]=d,p[7]=m,p[11]=x,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,s=1/Gi.setFromMatrixColumn(t,0).length(),r=1/Gi.setFromMatrixColumn(t,1).length(),a=1/Gi.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),f=Math.sin(r);if(t.order==="XYZ"){let h=a*u,d=a*f,m=o*u,x=o*f;e[0]=l*u,e[4]=-l*f,e[8]=c,e[1]=d+m*c,e[5]=h-x*c,e[9]=-o*l,e[2]=x-h*c,e[6]=m+d*c,e[10]=a*l}else if(t.order==="YXZ"){let h=l*u,d=l*f,m=c*u,x=c*f;e[0]=h+x*o,e[4]=m*o-d,e[8]=a*c,e[1]=a*f,e[5]=a*u,e[9]=-o,e[2]=d*o-m,e[6]=x+h*o,e[10]=a*l}else if(t.order==="ZXY"){let h=l*u,d=l*f,m=c*u,x=c*f;e[0]=h-x*o,e[4]=-a*f,e[8]=m+d*o,e[1]=d+m*o,e[5]=a*u,e[9]=x-h*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){let h=a*u,d=a*f,m=o*u,x=o*f;e[0]=l*u,e[4]=m*c-d,e[8]=h*c+x,e[1]=l*f,e[5]=x*c+h,e[9]=d*c-m,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){let h=a*l,d=a*c,m=o*l,x=o*c;e[0]=l*u,e[4]=x-h*f,e[8]=m*f+d,e[1]=f,e[5]=a*u,e[9]=-o*u,e[2]=-c*u,e[6]=d*f+m,e[10]=h-x*f}else if(t.order==="XZY"){let h=a*l,d=a*c,m=o*l,x=o*c;e[0]=l*u,e[4]=-f,e[8]=c*u,e[1]=h*f+x,e[5]=a*u,e[9]=d*f-m,e[2]=m*f-d,e[6]=o*u,e[10]=x*f+h}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(wf,t,Af)}lookAt(t,e,n){let s=this.elements;return rn.subVectors(t,e),rn.lengthSq()===0&&(rn.z=1),rn.normalize(),ai.crossVectors(n,rn),ai.lengthSq()===0&&(Math.abs(n.z)===1?rn.x+=1e-4:rn.z+=1e-4,rn.normalize(),ai.crossVectors(n,rn)),ai.normalize(),jr.crossVectors(rn,ai),s[0]=ai.x,s[4]=jr.x,s[8]=rn.x,s[1]=ai.y,s[5]=jr.y,s[9]=rn.y,s[2]=ai.z,s[6]=jr.z,s[10]=rn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],f=n[5],h=n[9],d=n[13],m=n[2],x=n[6],g=n[10],p=n[14],M=n[3],b=n[7],y=n[11],E=n[15],T=s[0],R=s[4],v=s[8],w=s[12],C=s[1],L=s[5],B=s[9],H=s[13],U=s[2],k=s[6],Z=s[10],Y=s[14],st=s[3],$=s[7],tt=s[11],nt=s[15];return r[0]=a*T+o*C+l*U+c*st,r[4]=a*R+o*L+l*k+c*$,r[8]=a*v+o*B+l*Z+c*tt,r[12]=a*w+o*H+l*Y+c*nt,r[1]=u*T+f*C+h*U+d*st,r[5]=u*R+f*L+h*k+d*$,r[9]=u*v+f*B+h*Z+d*tt,r[13]=u*w+f*H+h*Y+d*nt,r[2]=m*T+x*C+g*U+p*st,r[6]=m*R+x*L+g*k+p*$,r[10]=m*v+x*B+g*Z+p*tt,r[14]=m*w+x*H+g*Y+p*nt,r[3]=M*T+b*C+y*U+E*st,r[7]=M*R+b*L+y*k+E*$,r[11]=M*v+b*B+y*Z+E*tt,r[15]=M*w+b*H+y*Y+E*nt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],u=t[2],f=t[6],h=t[10],d=t[14],m=t[3],x=t[7],g=t[11],p=t[15],M=l*d-c*h,b=o*d-c*f,y=o*h-l*f,E=a*d-c*u,T=a*h-l*u,R=a*f-o*u;return e*(x*M-g*b+p*y)-n*(m*M-g*E+p*T)+s*(m*b-x*E+p*R)-r*(m*y-x*T+g*R)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],a=t[5],o=t[9],l=t[2],c=t[6],u=t[10];return e*(a*u-o*c)-n*(r*u-o*l)+s*(r*c-a*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],f=t[9],h=t[10],d=t[11],m=t[12],x=t[13],g=t[14],p=t[15],M=e*o-n*a,b=e*l-s*a,y=e*c-r*a,E=n*l-s*o,T=n*c-r*o,R=s*c-r*l,v=u*x-f*m,w=u*g-h*m,C=u*p-d*m,L=f*g-h*x,B=f*p-d*x,H=h*p-d*g,U=M*H-b*B+y*L+E*C-T*w+R*v;if(U===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let k=1/U;return t[0]=(o*H-l*B+c*L)*k,t[1]=(s*B-n*H-r*L)*k,t[2]=(x*R-g*T+p*E)*k,t[3]=(h*T-f*R-d*E)*k,t[4]=(l*C-a*H-c*w)*k,t[5]=(e*H-s*C+r*w)*k,t[6]=(g*y-m*R-p*b)*k,t[7]=(u*R-h*y+d*b)*k,t[8]=(a*B-o*C+c*v)*k,t[9]=(n*C-e*B-r*v)*k,t[10]=(m*T-x*y+p*M)*k,t[11]=(f*y-u*T-d*M)*k,t[12]=(o*w-a*L-l*v)*k,t[13]=(e*L-n*w+s*v)*k,t[14]=(x*b-m*E-g*M)*k,t[15]=(u*E-f*b+h*M)*k,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,u=a+a,f=o+o,h=r*c,d=r*u,m=r*f,x=a*u,g=a*f,p=o*f,M=l*c,b=l*u,y=l*f,E=n.x,T=n.y,R=n.z;return s[0]=(1-(x+p))*E,s[1]=(d+y)*E,s[2]=(m-b)*E,s[3]=0,s[4]=(d-y)*T,s[5]=(1-(h+p))*T,s[6]=(g+M)*T,s[7]=0,s[8]=(m+b)*R,s[9]=(g-M)*R,s[10]=(1-(h+x))*R,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let a=Gi.set(s[0],s[1],s[2]).length(),o=Gi.set(s[4],s[5],s[6]).length(),l=Gi.set(s[8],s[9],s[10]).length();r<0&&(a=-a),_n.copy(this);let c=1/a,u=1/o,f=1/l;return _n.elements[0]*=c,_n.elements[1]*=c,_n.elements[2]*=c,_n.elements[4]*=u,_n.elements[5]*=u,_n.elements[6]*=u,_n.elements[8]*=f,_n.elements[9]*=f,_n.elements[10]*=f,e.setFromRotationMatrix(_n),n.x=a,n.y=o,n.z=l,this}makePerspective(t,e,n,s,r,a,o=Sn,l=!1){let c=this.elements,u=2*r/(e-t),f=2*r/(n-s),h=(e+t)/(e-t),d=(n+s)/(n-s),m,x;if(l)m=r/(a-r),x=a*r/(a-r);else if(o===Sn)m=-(a+r)/(a-r),x=-2*a*r/(a-r);else if(o===ss)m=-a/(a-r),x=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=f,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=x,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=Sn,l=!1){let c=this.elements,u=2/(e-t),f=2/(n-s),h=-(e+t)/(e-t),d=-(n+s)/(n-s),m,x;if(l)m=1/(a-r),x=a/(a-r);else if(o===Sn)m=-2/(a-r),x=-(a+r)/(a-r);else if(o===ss)m=-1/(a-r),x=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=f,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=m,c[14]=x,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},Gi=new N,_n=new fe,wf=new N(0,0,0),Af=new N(1,1,1),ai=new N,jr=new N,rn=new N,Nh=new fe,Uh=new fn,$n=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],f=s[2],h=s[6],d=s[10];switch(e){case"XYZ":this._y=Math.asin(jt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-jt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(jt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-jt(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(jt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-jt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,d),this._y=0);break;default:zt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Nh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Nh,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Uh.setFromEuler(this),this.setFromQuaternion(Uh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};$n.DEFAULT_ORDER="XYZ";var Ys=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Rf=0,Fh=new N,Vi=new fn,Vn=new fe,Qr=new N,Ps=new N,Cf=new N,If=new fn,Oh=new N(1,0,0),Bh=new N(0,1,0),zh=new N(0,0,1),kh={type:"added"},Pf={type:"removed"},Wi={type:"childadded",child:null},kl={type:"childremoved",child:null},ae=class i extends Un{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Rf++}),this.uuid=vs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new N,e=new $n,n=new fn,s=new N(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new fe},normalMatrix:{value:new Xt}}),this.matrix=new fe,this.matrixWorld=new fe,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ys,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Vi.setFromAxisAngle(t,e),this.quaternion.multiply(Vi),this}rotateOnWorldAxis(t,e){return Vi.setFromAxisAngle(t,e),this.quaternion.premultiply(Vi),this}rotateX(t){return this.rotateOnAxis(Oh,t)}rotateY(t){return this.rotateOnAxis(Bh,t)}rotateZ(t){return this.rotateOnAxis(zh,t)}translateOnAxis(t,e){return Fh.copy(t).applyQuaternion(this.quaternion),this.position.add(Fh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Oh,t)}translateY(t){return this.translateOnAxis(Bh,t)}translateZ(t){return this.translateOnAxis(zh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Vn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Qr.copy(t):Qr.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Ps.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Vn.lookAt(Ps,Qr,this.up):Vn.lookAt(Qr,Ps,this.up),this.quaternion.setFromRotationMatrix(Vn),s&&(Vn.extractRotation(s.matrixWorld),Vi.setFromRotationMatrix(Vn),this.quaternion.premultiply(Vi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Gt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(kh),Wi.child=t,this.dispatchEvent(Wi),Wi.child=null):Gt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Pf),kl.child=t,this.dispatchEvent(kl),kl.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Vn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Vn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Vn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(kh),Wi.child=t,this.dispatchEvent(Wi),Wi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ps,t,Cf),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ps,If,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let f=l[c];r(t.shapes,f)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){let o=a(t.geometries),l=a(t.materials),c=a(t.textures),u=a(t.images),f=a(t.shapes),h=a(t.skeletons),d=a(t.animations),m=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),f.length>0&&(n.shapes=f),h.length>0&&(n.skeletons=h),d.length>0&&(n.animations=d),m.length>0&&(n.nodes=m)}return n.object=s,n;function a(o){let l=[];for(let c in o){let u=o[c];delete u.metadata,l.push(u)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};ae.DEFAULT_UP=new N(0,1,0);ae.DEFAULT_MATRIX_AUTO_UPDATE=!0;ae.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var ze=class extends ae{constructor(){super(),this.isGroup=!0,this.type="Group"}},Lf={type:"move"},os=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ze,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ze,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ze,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(let x of t.hand.values()){let g=e.getJointPose(x,n),p=this._getHandJoint(c,x);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}let u=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],h=u.position.distanceTo(f.position),d=.02,m=.005;c.inputState.pinching&&h>d+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&h<=d-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Lf)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new ze;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},Yu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},oi={h:0,s:0,l:0},ta={h:0,s:0,l:0};function Hl(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var At=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Pe){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ne.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=ne.workingColorSpace){return this.r=t,this.g=e,this.b=n,ne.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=ne.workingColorSpace){if(t=Sf(t,1),e=jt(e,0,1),n=jt(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=Hl(a,r,t+1/3),this.g=Hl(a,r,t),this.b=Hl(a,r,t-1/3)}return ne.colorSpaceToWorking(this,s),this}setStyle(t,e=Pe){function n(r){r!==void 0&&parseFloat(r)<1&&zt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:zt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);zt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Pe){let n=Yu[t.toLowerCase()];return n!==void 0?this.setHex(n,e):zt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Zn(t.r),this.g=Zn(t.g),this.b=Zn(t.b),this}copyLinearToSRGB(t){return this.r=es(t.r),this.g=es(t.g),this.b=es(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Pe){return ne.workingToColorSpace(qe.copy(this),t),Math.round(jt(qe.r*255,0,255))*65536+Math.round(jt(qe.g*255,0,255))*256+Math.round(jt(qe.b*255,0,255))}getHexString(t=Pe){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ne.workingColorSpace){ne.workingToColorSpace(qe.copy(this),e);let n=qe.r,s=qe.g,r=qe.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,u=(o+a)/2;if(o===a)l=0,c=0;else{let f=a-o;switch(c=u<=.5?f/(a+o):f/(2-a-o),a){case n:l=(s-r)/f+(s<r?6:0);break;case s:l=(r-n)/f+2;break;case r:l=(n-s)/f+4;break}l/=6}return t.h=l,t.s=c,t.l=u,t}getRGB(t,e=ne.workingColorSpace){return ne.workingToColorSpace(qe.copy(this),e),t.r=qe.r,t.g=qe.g,t.b=qe.b,t}getStyle(t=Pe){ne.workingToColorSpace(qe.copy(this),t);let e=qe.r,n=qe.g,s=qe.b;return t!==Pe?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(oi),this.setHSL(oi.h+t,oi.s+e,oi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(oi),t.getHSL(ta);let n=Ul(oi.h,ta.h,e),s=Ul(oi.s,ta.s,e),r=Ul(oi.l,ta.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},qe=new At;At.NAMES=Yu;var Zs=class i{constructor(t,e=1,n=1e3){this.isFog=!0,this.name="",this.color=new At(t),this.near=e,this.far=n}clone(){return new i(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},$s=class extends ae{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new $n,this.environmentIntensity=1,this.environmentRotation=new $n,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},vn=new N,Wn=new N,Gl=new N,Xn=new N,Xi=new N,qi=new N,Hh=new N,Vl=new N,Wl=new N,Xl=new N,ql=new be,Yl=new be,Zl=new be,ui=class i{constructor(t=new N,e=new N,n=new N){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),vn.subVectors(t,e),s.cross(vn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){vn.subVectors(s,e),Wn.subVectors(n,e),Gl.subVectors(t,e);let a=vn.dot(vn),o=vn.dot(Wn),l=vn.dot(Gl),c=Wn.dot(Wn),u=Wn.dot(Gl),f=a*c-o*o;if(f===0)return r.set(0,0,0),null;let h=1/f,d=(c*l-o*u)*h,m=(a*u-o*l)*h;return r.set(1-d-m,m,d)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Xn)===null?!1:Xn.x>=0&&Xn.y>=0&&Xn.x+Xn.y<=1}static getInterpolation(t,e,n,s,r,a,o,l){return this.getBarycoord(t,e,n,s,Xn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Xn.x),l.addScaledVector(a,Xn.y),l.addScaledVector(o,Xn.z),l)}static getInterpolatedAttribute(t,e,n,s,r,a){return ql.setScalar(0),Yl.setScalar(0),Zl.setScalar(0),ql.fromBufferAttribute(t,e),Yl.fromBufferAttribute(t,n),Zl.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(ql,r.x),a.addScaledVector(Yl,r.y),a.addScaledVector(Zl,r.z),a}static isFrontFacing(t,e,n,s){return vn.subVectors(n,e),Wn.subVectors(t,e),vn.cross(Wn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return vn.subVectors(this.c,this.b),Wn.subVectors(this.a,this.b),vn.cross(Wn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,a,o;Xi.subVectors(s,n),qi.subVectors(r,n),Vl.subVectors(t,n);let l=Xi.dot(Vl),c=qi.dot(Vl);if(l<=0&&c<=0)return e.copy(n);Wl.subVectors(t,s);let u=Xi.dot(Wl),f=qi.dot(Wl);if(u>=0&&f<=u)return e.copy(s);let h=l*f-u*c;if(h<=0&&l>=0&&u<=0)return a=l/(l-u),e.copy(n).addScaledVector(Xi,a);Xl.subVectors(t,r);let d=Xi.dot(Xl),m=qi.dot(Xl);if(m>=0&&d<=m)return e.copy(r);let x=d*c-l*m;if(x<=0&&c>=0&&m<=0)return o=c/(c-m),e.copy(n).addScaledVector(qi,o);let g=u*m-d*f;if(g<=0&&f-u>=0&&d-m>=0)return Hh.subVectors(r,s),o=(f-u)/(f-u+(d-m)),e.copy(s).addScaledVector(Hh,o);let p=1/(g+x+h);return a=x*p,o=h*p,e.copy(n).addScaledVector(Xi,a).addScaledVector(qi,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Fn=class{constructor(t=new N(1/0,1/0,1/0),e=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(yn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(yn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=yn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,yn):yn.fromBufferAttribute(r,a),yn.applyMatrix4(t.matrixWorld),this.expandByPoint(yn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),ea.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ea.copy(n.boundingBox)),ea.applyMatrix4(t.matrixWorld),this.union(ea)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,yn),yn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ls),na.subVectors(this.max,Ls),Yi.subVectors(t.a,Ls),Zi.subVectors(t.b,Ls),$i.subVectors(t.c,Ls),li.subVectors(Zi,Yi),ci.subVectors($i,Zi),Ei.subVectors(Yi,$i);let e=[0,-li.z,li.y,0,-ci.z,ci.y,0,-Ei.z,Ei.y,li.z,0,-li.x,ci.z,0,-ci.x,Ei.z,0,-Ei.x,-li.y,li.x,0,-ci.y,ci.x,0,-Ei.y,Ei.x,0];return!$l(e,Yi,Zi,$i,na)||(e=[1,0,0,0,1,0,0,0,1],!$l(e,Yi,Zi,$i,na))?!1:(ia.crossVectors(li,ci),e=[ia.x,ia.y,ia.z],$l(e,Yi,Zi,$i,na))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,yn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(yn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(qn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),qn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),qn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),qn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),qn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),qn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),qn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),qn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(qn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},qn=[new N,new N,new N,new N,new N,new N,new N,new N],yn=new N,ea=new Fn,Yi=new N,Zi=new N,$i=new N,li=new N,ci=new N,Ei=new N,Ls=new N,na=new N,ia=new N,Ti=new N;function $l(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Ti.fromArray(i,r);let o=s.x*Math.abs(Ti.x)+s.y*Math.abs(Ti.y)+s.z*Math.abs(Ti.z),l=t.dot(Ti),c=e.dot(Ti),u=n.dot(Ti);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}var Ie=new N,sa=new dt,Df=0,Ke=class extends Un{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Df++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Gu,this.updateRanges=[],this.gpuType=pn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)sa.fromBufferAttribute(this,e),sa.applyMatrix3(t),this.setXY(e,sa.x,sa.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Ie.fromBufferAttribute(this,e),Ie.applyMatrix3(t),this.setXYZ(e,Ie.x,Ie.y,Ie.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Ie.fromBufferAttribute(this,e),Ie.applyMatrix4(t),this.setXYZ(e,Ie.x,Ie.y,Ie.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ie.fromBufferAttribute(this,e),Ie.applyNormalMatrix(t),this.setXYZ(e,Ie.x,Ie.y,Ie.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ie.fromBufferAttribute(this,e),Ie.transformDirection(t),this.setXYZ(e,Ie.x,Ie.y,Ie.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Is(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=en(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Is(e,this.array)),e}setX(t,e){return this.normalized&&(e=en(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Is(e,this.array)),e}setY(t,e){return this.normalized&&(e=en(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Is(e,this.array)),e}setZ(t,e){return this.normalized&&(e=en(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Is(e,this.array)),e}setW(t,e){return this.normalized&&(e=en(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=en(e,this.array),n=en(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=en(e,this.array),n=en(n,this.array),s=en(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=en(e,this.array),n=en(n,this.array),s=en(s,this.array),r=en(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var Js=class extends Ke{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var Ks=class extends Ke{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var se=class extends Ke{constructor(t,e,n){super(new Float32Array(t),e,n)}},Nf=new Fn,Ds=new N,Jl=new N,Jn=class{constructor(t=new N,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):Nf.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Ds.subVectors(t,this.center);let e=Ds.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Ds,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Jl.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Ds.copy(t.center).add(Jl)),this.expandByPoint(Ds.copy(t.center).sub(Jl))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Uf=0,dn=new fe,Kl=new ae,Ji=new N,an=new Fn,Ns=new Fn,Be=new N,Le=class i extends Un{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Uf++}),this.uuid=vs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(yf(t)?Ks:Js)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Xt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return dn.makeRotationFromQuaternion(t),this.applyMatrix4(dn),this}rotateX(t){return dn.makeRotationX(t),this.applyMatrix4(dn),this}rotateY(t){return dn.makeRotationY(t),this.applyMatrix4(dn),this}rotateZ(t){return dn.makeRotationZ(t),this.applyMatrix4(dn),this}translate(t,e,n){return dn.makeTranslation(t,e,n),this.applyMatrix4(dn),this}scale(t,e,n){return dn.makeScale(t,e,n),this.applyMatrix4(dn),this}lookAt(t){return Kl.lookAt(t),Kl.updateMatrix(),this.applyMatrix4(Kl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ji).negate(),this.translate(Ji.x,Ji.y,Ji.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new se(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&zt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Fn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Gt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];an.setFromBufferAttribute(r),this.morphTargetsRelative?(Be.addVectors(this.boundingBox.min,an.min),this.boundingBox.expandByPoint(Be),Be.addVectors(this.boundingBox.max,an.max),this.boundingBox.expandByPoint(Be)):(this.boundingBox.expandByPoint(an.min),this.boundingBox.expandByPoint(an.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Gt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Jn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Gt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(t){let n=this.boundingSphere.center;if(an.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];Ns.setFromBufferAttribute(o),this.morphTargetsRelative?(Be.addVectors(an.min,Ns.min),an.expandByPoint(Be),Be.addVectors(an.max,Ns.max),an.expandByPoint(Be)):(an.expandByPoint(Ns.min),an.expandByPoint(Ns.max))}an.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)Be.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Be));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Be.fromBufferAttribute(o,c),l&&(Ji.fromBufferAttribute(t,c),Be.add(Ji)),s=Math.max(s,n.distanceToSquared(Be))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Gt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Gt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new Ke(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let v=0;v<n.count;v++)o[v]=new N,l[v]=new N;let c=new N,u=new N,f=new N,h=new dt,d=new dt,m=new dt,x=new N,g=new N;function p(v,w,C){c.fromBufferAttribute(n,v),u.fromBufferAttribute(n,w),f.fromBufferAttribute(n,C),h.fromBufferAttribute(r,v),d.fromBufferAttribute(r,w),m.fromBufferAttribute(r,C),u.sub(c),f.sub(c),d.sub(h),m.sub(h);let L=1/(d.x*m.y-m.x*d.y);isFinite(L)&&(x.copy(u).multiplyScalar(m.y).addScaledVector(f,-d.y).multiplyScalar(L),g.copy(f).multiplyScalar(d.x).addScaledVector(u,-m.x).multiplyScalar(L),o[v].add(x),o[w].add(x),o[C].add(x),l[v].add(g),l[w].add(g),l[C].add(g))}let M=this.groups;M.length===0&&(M=[{start:0,count:t.count}]);for(let v=0,w=M.length;v<w;++v){let C=M[v],L=C.start,B=C.count;for(let H=L,U=L+B;H<U;H+=3)p(t.getX(H+0),t.getX(H+1),t.getX(H+2))}let b=new N,y=new N,E=new N,T=new N;function R(v){E.fromBufferAttribute(s,v),T.copy(E);let w=o[v];b.copy(w),b.sub(E.multiplyScalar(E.dot(w))).normalize(),y.crossVectors(T,w);let L=y.dot(l[v])<0?-1:1;a.setXYZW(v,b.x,b.y,b.z,L)}for(let v=0,w=M.length;v<w;++v){let C=M[v],L=C.start,B=C.count;for(let H=L,U=L+B;H<U;H+=3)R(t.getX(H+0)),R(t.getX(H+1)),R(t.getX(H+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new Ke(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let h=0,d=n.count;h<d;h++)n.setXYZ(h,0,0,0);let s=new N,r=new N,a=new N,o=new N,l=new N,c=new N,u=new N,f=new N;if(t)for(let h=0,d=t.count;h<d;h+=3){let m=t.getX(h+0),x=t.getX(h+1),g=t.getX(h+2);s.fromBufferAttribute(e,m),r.fromBufferAttribute(e,x),a.fromBufferAttribute(e,g),u.subVectors(a,r),f.subVectors(s,r),u.cross(f),o.fromBufferAttribute(n,m),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,g),o.add(u),l.add(u),c.add(u),n.setXYZ(m,o.x,o.y,o.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(g,c.x,c.y,c.z)}else for(let h=0,d=e.count;h<d;h+=3)s.fromBufferAttribute(e,h+0),r.fromBufferAttribute(e,h+1),a.fromBufferAttribute(e,h+2),u.subVectors(a,r),f.subVectors(s,r),u.cross(f),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Be.fromBufferAttribute(t,e),Be.normalize(),t.setXYZ(e,Be.x,Be.y,Be.z)}toNonIndexed(){function t(o,l){let c=o.array,u=o.itemSize,f=o.normalized,h=new c.constructor(l.length*u),d=0,m=0;for(let x=0,g=l.length;x<g;x++){o.isInterleavedBufferAttribute?d=l[x]*o.data.stride+o.offset:d=l[x]*u;for(let p=0;p<u;p++)h[m++]=c[d++]}return new Ke(h,u,f)}if(this.index===null)return zt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,n);e.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let u=0,f=c.length;u<f;u++){let h=c[u],d=t(h,n);l.push(d)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let f=0,h=c.length;f<h;f++){let d=c[f];u.push(d.toJSON(t.data))}u.length>0&&(s[l]=u,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(e))}let r=t.morphAttributes;for(let c in r){let u=[],f=r[c];for(let h=0,d=f.length;h<d;h++)u.push(f[h].clone(e));this.morphAttributes[c]=u}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let c=0,u=a.length;c<u;c++){let f=a[c];this.addGroup(f.start,f.count,f.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var jl=new N,Ff=new N,Of=new Xt,Mn=class{constructor(t=new N(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=jl.subVectors(n,e).cross(Ff.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let s=t.delta(jl),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(s,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Of.getNormalMatrix(t),s=this.coplanarPoint(jl).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},Bf=0,Kn=class extends Un{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Bf++}),this.uuid=vs(),this.name="",this.type="Material",this.blending=gs,this.side=gi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=bc,this.blendDst=Ec,this.blendEquation=Pi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new At(0,0,0),this.blendAlpha=0,this.depthFunc=ns,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Uu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ba,this.stencilZFail=ba,this.stencilZPass=ba,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){zt(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){zt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new At().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new Mn().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new dt().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new dt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var Yn=new N,Ql=new N,ra=new N,aa=new N,js=class{constructor(t=new N,e=new N(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Yn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Yn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Yn.copy(this.origin).addScaledVector(this.direction,e),Yn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Ql.copy(t).add(e).multiplyScalar(.5),ra.copy(e).sub(t).normalize(),aa.copy(this.origin).sub(Ql);let r=t.distanceTo(e)*.5,a=-this.direction.dot(ra),o=aa.dot(this.direction),l=-aa.dot(ra),c=aa.lengthSq(),u=Math.abs(1-a*a),f,h,d,m;if(u>0)if(f=a*l-o,h=a*o-l,m=r*u,f>=0)if(h>=-m)if(h<=m){let x=1/u;f*=x,h*=x,d=f*(f+a*h+2*o)+h*(a*f+h+2*l)+c}else h=r,f=Math.max(0,-(a*h+o)),d=-f*f+h*(h+2*l)+c;else h=-r,f=Math.max(0,-(a*h+o)),d=-f*f+h*(h+2*l)+c;else h<=-m?(f=Math.max(0,-(-a*r+o)),h=f>0?-r:Math.min(Math.max(-r,-l),r),d=-f*f+h*(h+2*l)+c):h<=m?(f=0,h=Math.min(Math.max(-r,-l),r),d=h*(h+2*l)+c):(f=Math.max(0,-(a*r+o)),h=f>0?r:Math.min(Math.max(-r,-l),r),d=-f*f+h*(h+2*l)+c);else h=a>0?-r:r,f=Math.max(0,-(a*h+o)),d=-f*f+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(Ql).addScaledVector(ra,h),d}intersectSphere(t,e){if(t.radius<0)return null;Yn.subVectors(t.center,this.origin);let n=Yn.dot(this.direction),s=Yn.dot(Yn)-n*n,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,l,c=1/this.direction.x,u=1/this.direction.y,f=1/this.direction.z,h=this.origin;return c>=0?(n=(t.min.x-h.x)*c,s=(t.max.x-h.x)*c):(n=(t.max.x-h.x)*c,s=(t.min.x-h.x)*c),u>=0?(r=(t.min.y-h.y)*u,a=(t.max.y-h.y)*u):(r=(t.max.y-h.y)*u,a=(t.min.y-h.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),f>=0?(o=(t.min.z-h.z)*f,l=(t.max.z-h.z)*f):(o=(t.max.z-h.z)*f,l=(t.min.z-h.z)*f),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Yn)!==null}intersectTriangle(t,e,n,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,u=o.z,f=t.x-a.x,h=t.y-a.y,d=t.z-a.z,m=e.x-a.x,x=e.y-a.y,g=e.z-a.z,p=n.x-a.x,M=n.y-a.y,b=n.z-a.z,y=Math.abs(l),E=Math.abs(c),T=Math.abs(u),R,v,w,C,L,B,H,U,k,Z,Y,st;if(y>=E&&y>=T?(w=l,B=f,k=m,st=p,l>=0?(R=c,v=u,C=h,L=d,H=x,U=g,Z=M,Y=b):(R=u,v=c,C=d,L=h,H=g,U=x,Z=b,Y=M)):E>=T?(w=c,B=h,k=x,st=M,c>=0?(R=u,v=l,C=d,L=f,H=g,U=m,Z=b,Y=p):(R=l,v=u,C=f,L=d,H=m,U=g,Z=p,Y=b)):(w=u,B=d,k=g,st=b,u>=0?(R=l,v=c,C=f,L=h,H=m,U=x,Z=p,Y=M):(R=c,v=l,C=h,L=f,H=x,U=m,Z=M,Y=p)),w===0)return null;let $=R/w,tt=v/w,nt=1/w,It=C-$*B,rt=L-tt*B,ie=H-$*k,$t=U-tt*k,ee=Z-$*st,J=Y-tt*st,et=ee*$t-J*ie,mt=It*J-rt*ee,Bt=ie*rt-$t*It;if(s){if(et<0||mt<0||Bt<0)return null}else if((et<0||mt<0||Bt<0)&&(et>0||mt>0||Bt>0))return null;let St=et+mt+Bt;if(St===0)return null;let Ht=nt*(et*B+mt*k+Bt*st);return(St>0?Ht<0:Ht>0)?null:this.at(Ht/St,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},we=class extends Kn{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new At(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $n,this.combine=Tc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Gh=new fe,wi=new js,oa=new Jn,Vh=new N,la=new N,ca=new N,ha=new N,tc=new N,ua=new N,Wh=new N,da=new N,Ut=class extends ae{constructor(t=new Le,e=new we){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(r&&o){ua.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=o[l],f=r[l];u!==0&&(tc.fromBufferAttribute(f,t),a?ua.addScaledVector(tc,u):ua.addScaledVector(tc.sub(e),u))}e.add(ua)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),oa.copy(n.boundingSphere),oa.applyMatrix4(r),wi.copy(t.ray).recast(t.near),!(oa.containsPoint(wi.origin)===!1&&(wi.intersectSphere(oa,Vh)===null||wi.origin.distanceToSquared(Vh)>(t.far-t.near)**2))&&(Gh.copy(r).invert(),wi.copy(t.ray).applyMatrix4(Gh),!(n.boundingBox!==null&&wi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,wi)))}_computeIntersections(t,e,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,f=r.attributes.normal,h=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let m=0,x=h.length;m<x;m++){let g=h[m],p=a[g.materialIndex],M=Math.max(g.start,d.start),b=Math.min(o.count,Math.min(g.start+g.count,d.start+d.count));for(let y=M,E=b;y<E;y+=3){let T=o.getX(y),R=o.getX(y+1),v=o.getX(y+2);s=fa(this,p,t,n,c,u,f,T,R,v),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=g.materialIndex,e.push(s))}}else{let m=Math.max(0,d.start),x=Math.min(o.count,d.start+d.count);for(let g=m,p=x;g<p;g+=3){let M=o.getX(g),b=o.getX(g+1),y=o.getX(g+2);s=fa(this,a,t,n,c,u,f,M,b,y),s&&(s.faceIndex=Math.floor(g/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let m=0,x=h.length;m<x;m++){let g=h[m],p=a[g.materialIndex],M=Math.max(g.start,d.start),b=Math.min(l.count,Math.min(g.start+g.count,d.start+d.count));for(let y=M,E=b;y<E;y+=3){let T=y,R=y+1,v=y+2;s=fa(this,p,t,n,c,u,f,T,R,v),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=g.materialIndex,e.push(s))}}else{let m=Math.max(0,d.start),x=Math.min(l.count,d.start+d.count);for(let g=m,p=x;g<p;g+=3){let M=g,b=g+1,y=g+2;s=fa(this,a,t,n,c,u,f,M,b,y),s&&(s.faceIndex=Math.floor(g/3),e.push(s))}}}};function zf(i,t,e,n,s,r,a,o){let l;if(t.side===Ve?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,t.side===gi,o),l===null)return null;da.copy(o),da.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(da);return c<e.near||c>e.far?null:{distance:c,point:da.clone(),object:i}}function fa(i,t,e,n,s,r,a,o,l,c){i.getVertexPosition(o,la),i.getVertexPosition(l,ca),i.getVertexPosition(c,ha);let u=zf(i,t,e,n,la,ca,ha,Wh);if(u){let f=new N;ui.getBarycoord(Wh,la,ca,ha,f),s&&(u.uv=ui.getInterpolatedAttribute(s,o,l,c,f,new dt)),r&&(u.uv1=ui.getInterpolatedAttribute(r,o,l,c,f,new dt)),a&&(u.normal=ui.getInterpolatedAttribute(a,o,l,c,f,new N),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a:o,b:l,c,normal:new N,materialIndex:0};ui.getNormal(la,ca,ha,h.normal),u.face=h,u.barycoord=f}return u}var Qs=class extends je{constructor(t=null,e=1,n=1,s,r,a,o,l,c=ke,u=ke,f,h){super(null,a,o,l,c,u,s,r,f,h),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var tr=class extends Ke{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Ki=new fe,Xh=new fe,pa=[],qh=new Fn,kf=new fe,Us=new Ut,Fs=new Jn,Ae=class extends Ut{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new tr(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,kf)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Fn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ki),qh.copy(t.boundingBox).applyMatrix4(Ki),this.boundingBox.union(qh)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Jn),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ki),Fs.copy(t.boundingSphere).applyMatrix4(Ki),this.boundingSphere.union(Fs)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(t,e){let n=this.matrixWorld,s=this.count;if(Us.geometry=this.geometry,Us.material=this.material,Us.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Fs.copy(this.boundingSphere),Fs.applyMatrix4(n),t.ray.intersectsSphere(Fs)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ki),Xh.multiplyMatrices(n,Ki),Us.matrixWorld=Xh,Us.raycast(t,pa);for(let a=0,o=pa.length;a<o;a++){let l=pa[a];l.instanceId=r,l.object=this,e.push(l)}pa.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new tr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Qs(new Float32Array(s*this.count),s,this.count,mo,pn));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*t;return r[l]=o,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Ai=new Jn,Hf=new dt(.5,.5),ma=new N,ls=class{constructor(t=new Mn,e=new Mn,n=new Mn,s=new Mn,r=new Mn,a=new Mn){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Sn,n=!1){let s=this.planes,r=t.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],f=r[5],h=r[6],d=r[7],m=r[8],x=r[9],g=r[10],p=r[11],M=r[12],b=r[13],y=r[14],E=r[15];if(s[0].setComponents(c-a,d-u,p-m,E-M).normalize(),s[1].setComponents(c+a,d+u,p+m,E+M).normalize(),s[2].setComponents(c+o,d+f,p+x,E+b).normalize(),s[3].setComponents(c-o,d-f,p-x,E-b).normalize(),n)s[4].setComponents(l,h,g,y).normalize(),s[5].setComponents(c-l,d-h,p-g,E-y).normalize();else if(s[4].setComponents(c-l,d-h,p-g,E-y).normalize(),e===Sn)s[5].setComponents(c+l,d+h,p+g,E+y).normalize();else if(e===ss)s[5].setComponents(l,h,g,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Ai.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Ai.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Ai)}intersectsSprite(t){Ai.center.set(0,0,0);let e=Hf.distanceTo(t.center);return Ai.radius=.7071067811865476+e,Ai.applyMatrix4(t.matrixWorld),this.intersectsSphere(Ai)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(ma.x=s.normal.x>0?t.max.x:t.min.x,ma.y=s.normal.y>0?t.max.y:t.min.y,ma.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(ma)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var cs=class extends Kn{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new At(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},Fa=new N,Oa=new N,Yh=new fe,Os=new js,ga=new Jn,ec=new N,Zh=new N,Ba=class extends ae{constructor(t=new Le,e=new cs){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)Fa.fromBufferAttribute(e,s-1),Oa.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=Fa.distanceTo(Oa);t.setAttribute("lineDistance",new se(n,1))}else zt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ga.copy(n.boundingSphere),ga.applyMatrix4(s),ga.radius+=r,t.ray.intersectsSphere(ga)===!1)return;Yh.copy(s).invert(),Os.copy(t.ray).applyMatrix4(Yh);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=n.index,h=n.attributes.position;if(u!==null){let d=Math.max(0,a.start),m=Math.min(u.count,a.start+a.count);for(let x=d,g=m-1;x<g;x+=c){let p=u.getX(x),M=u.getX(x+1),b=xa(this,t,Os,l,p,M,x);b&&e.push(b)}if(this.isLineLoop){let x=u.getX(m-1),g=u.getX(d),p=xa(this,t,Os,l,x,g,m-1);p&&e.push(p)}}else{let d=Math.max(0,a.start),m=Math.min(h.count,a.start+a.count);for(let x=d,g=m-1;x<g;x+=c){let p=xa(this,t,Os,l,x,x+1,x);p&&e.push(p)}if(this.isLineLoop){let x=xa(this,t,Os,l,m-1,d,m-1);x&&e.push(x)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function xa(i,t,e,n,s,r,a){let o=i.geometry.attributes.position;if(Fa.fromBufferAttribute(o,s),Oa.fromBufferAttribute(o,r),e.distanceSqToSegment(Fa,Oa,ec,Zh)>n)return;ec.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(ec);if(!(c<t.near||c>t.far))return{distance:c,point:Zh.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var $h=new N,Jh=new N,er=class extends Ba{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)$h.fromBufferAttribute(e,s),Jh.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+$h.distanceTo(Jh);t.setAttribute("lineDistance",new se(n,1))}else zt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var nr=class extends je{constructor(t=[],e=xi,n,s,r,a,o,l,c,u){super(t,e,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},On=class extends je{constructor(t,e,n,s,r,a,o,l,c){super(t,e,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var di=class extends je{constructor(t,e,n=Tn,s,r,a,o=ke,l=ke,c,u=Nn,f=1){if(u!==Nn&&u!==vi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:t,height:e,depth:f};super(h,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new as(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},za=class extends di{constructor(t,e=Tn,n=xi,s,r,a=ke,o=ke,l,c=Nn){let u={width:t,height:t,depth:1},f=[u,u,u,u,u,u];super(t,t,e,n,s,r,a,o,l,c),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},ir=class extends je{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},qt=class i extends Le{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],u=[],f=[],h=0,d=0;m("z","y","x",-1,-1,n,e,t,a,r,0),m("z","y","x",1,-1,n,e,-t,a,r,1),m("x","z","y",1,1,t,n,e,s,a,2),m("x","z","y",1,-1,t,n,-e,s,a,3),m("x","y","z",1,-1,t,e,n,s,r,4),m("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new se(c,3)),this.setAttribute("normal",new se(u,3)),this.setAttribute("uv",new se(f,2));function m(x,g,p,M,b,y,E,T,R,v,w){let C=y/R,L=E/v,B=y/2,H=E/2,U=T/2,k=R+1,Z=v+1,Y=0,st=0,$=new N;for(let tt=0;tt<Z;tt++){let nt=tt*L-H;for(let It=0;It<k;It++){let rt=It*C-B;$[x]=rt*M,$[g]=nt*b,$[p]=U,c.push($.x,$.y,$.z),$[x]=0,$[g]=0,$[p]=T>0?1:-1,u.push($.x,$.y,$.z),f.push(It/R),f.push(1-tt/v),Y+=1}}for(let tt=0;tt<v;tt++)for(let nt=0;nt<R;nt++){let It=h+nt+k*tt,rt=h+nt+k*(tt+1),ie=h+(nt+1)+k*(tt+1),$t=h+(nt+1)+k*tt;l.push(It,rt,$t),l.push(rt,ie,$t),st+=6}o.addGroup(d,st,w),d+=st,h+=Y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var sr=class i extends Le{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);let r=[],a=[],o=[],l=[],c=new N,u=new dt;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let f=0,h=3;f<=e;f++,h+=3){let d=n+f/e*s;c.x=t*Math.cos(d),c.y=t*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),u.x=(a[h]/t+1)/2,u.y=(a[h+1]/t+1)/2,l.push(u.x,u.y)}for(let f=1;f<=e;f++)r.push(f,f+1,0);this.setIndex(r),this.setAttribute("position",new se(a,3)),this.setAttribute("normal",new se(o,3)),this.setAttribute("uv",new se(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.segments,t.thetaStart,t.thetaLength)}},ce=class i extends Le{constructor(t=1,e=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let u=[],f=[],h=[],d=[],m=0,x=[],g=n/2,p=0;M(),a===!1&&(t>0&&b(!0),e>0&&b(!1)),this.setIndex(u),this.setAttribute("position",new se(f,3)),this.setAttribute("normal",new se(h,3)),this.setAttribute("uv",new se(d,2));function M(){let y=new N,E=new N,T=0,R=(e-t)/n;for(let v=0;v<=r;v++){let w=[],C=v/r,L=C*(e-t)+t;for(let B=0;B<=s;B++){let H=B/s,U=H*l+o,k=Math.sin(U),Z=Math.cos(U);E.x=L*k,E.y=-C*n+g,E.z=L*Z,f.push(E.x,E.y,E.z),y.set(k,R,Z).normalize(),h.push(y.x,y.y,y.z),d.push(H,1-C),w.push(m++)}x.push(w)}for(let v=0;v<s;v++)for(let w=0;w<r;w++){let C=x[w][v],L=x[w+1][v],B=x[w+1][v+1],H=x[w][v+1];(t>0||w!==0)&&(u.push(C,L,H),T+=3),(e>0||w!==r-1)&&(u.push(L,B,H),T+=3)}c.addGroup(p,T,0),p+=T}function b(y){let E=m,T=new dt,R=new N,v=0,w=y===!0?t:e,C=y===!0?1:-1;for(let B=1;B<=s;B++)f.push(0,g*C,0),h.push(0,C,0),d.push(.5,.5),m++;let L=m;for(let B=0;B<=s;B++){let U=B/s*l+o,k=Math.cos(U),Z=Math.sin(U);R.x=w*Z,R.y=g*C,R.z=w*k,f.push(R.x,R.y,R.z),h.push(0,C,0),T.x=k*.5+.5,T.y=Z*.5*C+.5,d.push(T.x,T.y),m++}for(let B=0;B<s;B++){let H=E+B,U=L+B;y===!0?u.push(U,U+1,H):u.push(U+1,U,H),v+=3}c.addGroup(p,v,y===!0?1:2),p+=v}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var ka=class i extends Le{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};let r=[],a=[];o(s),c(n),u(),this.setAttribute("position",new se(r,3)),this.setAttribute("normal",new se(r.slice(),3)),this.setAttribute("uv",new se(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(M){let b=new N,y=new N,E=new N;for(let T=0;T<e.length;T+=3)d(e[T+0],b),d(e[T+1],y),d(e[T+2],E),l(b,y,E,M)}function l(M,b,y,E){let T=E+1,R=[];for(let v=0;v<=T;v++){R[v]=[];let w=M.clone().lerp(y,v/T),C=b.clone().lerp(y,v/T),L=T-v;for(let B=0;B<=L;B++)B===0&&v===T?R[v][B]=w:R[v][B]=w.clone().lerp(C,B/L)}for(let v=0;v<T;v++)for(let w=0;w<2*(T-v)-1;w++){let C=Math.floor(w/2);w%2===0?(h(R[v][C+1]),h(R[v+1][C]),h(R[v][C])):(h(R[v][C+1]),h(R[v+1][C+1]),h(R[v+1][C]))}}function c(M){let b=new N;for(let y=0;y<r.length;y+=3)b.x=r[y+0],b.y=r[y+1],b.z=r[y+2],b.normalize().multiplyScalar(M),r[y+0]=b.x,r[y+1]=b.y,r[y+2]=b.z}function u(){let M=new N;for(let b=0;b<r.length;b+=3){M.x=r[b+0],M.y=r[b+1],M.z=r[b+2];let y=g(M)/2/Math.PI+.5,E=p(M)/Math.PI+.5;a.push(y,1-E)}m(),f()}function f(){for(let M=0;M<a.length;M+=6){let b=a[M+0],y=a[M+2],E=a[M+4],T=Math.max(b,y,E),R=Math.min(b,y,E);T>.9&&R<.1&&(b<.2&&(a[M+0]+=1),y<.2&&(a[M+2]+=1),E<.2&&(a[M+4]+=1))}}function h(M){r.push(M.x,M.y,M.z)}function d(M,b){let y=M*3;b.x=t[y+0],b.y=t[y+1],b.z=t[y+2]}function m(){let M=new N,b=new N,y=new N,E=new N,T=new dt,R=new dt,v=new dt;for(let w=0,C=0;w<r.length;w+=9,C+=6){M.set(r[w+0],r[w+1],r[w+2]),b.set(r[w+3],r[w+4],r[w+5]),y.set(r[w+6],r[w+7],r[w+8]),T.set(a[C+0],a[C+1]),R.set(a[C+2],a[C+3]),v.set(a[C+4],a[C+5]),E.copy(M).add(b).add(y).divideScalar(3);let L=g(E);x(T,C+0,M,L),x(R,C+2,b,L),x(v,C+4,y,L)}}function x(M,b,y,E){E<0&&M.x===1&&(a[b]=M.x-1),y.x===0&&y.z===0&&(a[b]=E/2/Math.PI+.5)}function g(M){return Math.atan2(M.z,-M.x)}function p(M){return Math.atan2(-M.y,Math.sqrt(M.x*M.x+M.z*M.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.vertices,t.indices,t.radius,t.detail)}};var on=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){zt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)n=this.getPoint(a/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let n=this.getLengths(),s=0,r=n.length,a;e?a=e:a=t*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);let u=n[s],h=n[s+1]-u,d=(a-u)/h;return(s+d)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=e||(a.isVector2?new dt:new N);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){let n=new N,s=[],r=[],a=[],o=new N,l=new fe;for(let d=0;d<=t;d++){let m=d/t;s[d]=this.getTangentAt(m,new N)}r[0]=new N,a[0]=new N;let c=Number.MAX_VALUE,u=Math.abs(s[0].x),f=Math.abs(s[0].y),h=Math.abs(s[0].z);u<=c&&(c=u,n.set(1,0,0)),f<=c&&(c=f,n.set(0,1,0)),h<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let d=1;d<=t;d++){if(r[d]=r[d-1].clone(),a[d]=a[d-1].clone(),o.crossVectors(s[d-1],s[d]),o.length()>Number.EPSILON){o.normalize();let m=Math.acos(jt(s[d-1].dot(s[d]),-1,1));r[d].applyMatrix4(l.makeRotationAxis(o,m))}a[d].crossVectors(s[d],r[d])}if(e===!0){let d=Math.acos(jt(r[0].dot(r[t]),-1,1));d/=t,s[0].dot(o.crossVectors(r[0],r[t]))>0&&(d=-d);for(let m=1;m<=t;m++)r[m].applyMatrix4(l.makeRotationAxis(s[m],d*m)),a[m].crossVectors(s[m],r[m])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},hs=class extends on{constructor(t=0,e=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new dt){let n=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let u=Math.cos(this.aRotation),f=Math.sin(this.aRotation),h=l-this.aX,d=c-this.aY;l=h*u-d*f+this.aX,c=h*f+d*u+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Ha=class extends hs{constructor(t,e,n,s,r,a){super(t,e,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Gc(){let i=0,t=0,e=0,n=0;function s(r,a,o,l){i=r,t=o,e=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,u,f){let h=(a-r)/c-(o-r)/(c+u)+(o-a)/u,d=(o-a)/u-(l-a)/(u+f)+(l-o)/f;h*=u,d*=u,s(a,o,h,d)},calc:function(r){let a=r*r,o=a*r;return i+t*r+e*a+n*o}}}var Kh=new N,jh=new N,nc=new Gc,ic=new Gc,sc=new Gc,Ga=class extends on{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new N){let n=e,s=this.points,r=s.length,a=(r-(this.closed?0:1))*t,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,u;this.closed||o>0?c=s[(o-1)%r]:(jh.subVectors(s[0],s[1]).add(s[0]),c=jh);let f=s[o%r],h=s[(o+1)%r];if(this.closed||o+2<r?u=s[(o+2)%r]:(Kh.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=Kh),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(f),d),x=Math.pow(f.distanceToSquared(h),d),g=Math.pow(h.distanceToSquared(u),d);x<1e-4&&(x=1),m<1e-4&&(m=x),g<1e-4&&(g=x),nc.initNonuniformCatmullRom(c.x,f.x,h.x,u.x,m,x,g),ic.initNonuniformCatmullRom(c.y,f.y,h.y,u.y,m,x,g),sc.initNonuniformCatmullRom(c.z,f.z,h.z,u.z,m,x,g)}else this.curveType==="catmullrom"&&(nc.initCatmullRom(c.x,f.x,h.x,u.x,this.tension),ic.initCatmullRom(c.y,f.y,h.y,u.y,this.tension),sc.initCatmullRom(c.z,f.z,h.z,u.z,this.tension));return n.set(nc.calc(l),ic.calc(l),sc.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new N().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function Qh(i,t,e,n,s){let r=(n-t)*.5,a=(s-e)*.5,o=i*i,l=i*o;return(2*e-2*n+r+a)*l+(-3*e+3*n-2*r-a)*o+r*i+e}function Gf(i,t){let e=1-i;return e*e*t}function Vf(i,t){return 2*(1-i)*i*t}function Wf(i,t){return i*i*t}function zs(i,t,e,n){return Gf(i,t)+Vf(i,e)+Wf(i,n)}function Xf(i,t){let e=1-i;return e*e*e*t}function qf(i,t){let e=1-i;return 3*e*e*i*t}function Yf(i,t){return 3*(1-i)*i*i*t}function Zf(i,t){return i*i*i*t}function ks(i,t,e,n,s){return Xf(i,t)+qf(i,e)+Yf(i,n)+Zf(i,s)}var rr=class extends on{constructor(t=new dt,e=new dt,n=new dt,s=new dt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new dt){let n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(ks(t,s.x,r.x,a.x,o.x),ks(t,s.y,r.y,a.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Va=class extends on{constructor(t=new N,e=new N,n=new N,s=new N){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new N){let n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(ks(t,s.x,r.x,a.x,o.x),ks(t,s.y,r.y,a.y,o.y),ks(t,s.z,r.z,a.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},ar=class extends on{constructor(t=new dt,e=new dt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new dt){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new dt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Wa=class extends on{constructor(t=new N,e=new N){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new N){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new N){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},or=class extends on{constructor(t=new dt,e=new dt,n=new dt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new dt){let n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(zs(t,s.x,r.x,a.x),zs(t,s.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Xa=class extends on{constructor(t=new N,e=new N,n=new N){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new N){let n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(zs(t,s.x,r.x,a.x),zs(t,s.y,r.y,a.y),zs(t,s.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},lr=class extends on{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new dt){let n=e,s=this.points,r=(s.length-1)*t,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],u=s[a>s.length-2?s.length-1:a+1],f=s[a>s.length-3?s.length-1:a+2];return n.set(Qh(o,l.x,c.x,u.x,f.x),Qh(o,l.y,c.y,u.y,f.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new dt().fromArray(s))}return this}},uc=Object.freeze({__proto__:null,ArcCurve:Ha,CatmullRomCurve3:Ga,CubicBezierCurve:rr,CubicBezierCurve3:Va,EllipseCurve:hs,LineCurve:ar,LineCurve3:Wa,QuadraticBezierCurve:or,QuadraticBezierCurve3:Xa,SplineCurve:lr}),qa=class extends on{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new uc[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let a=s[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){let u=l[c];n&&n.equals(u)||(e.push(u),n=u)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(new uc[s.type]().fromJSON(s))}return this}},cr=class extends qa{constructor(t){super(),this.type="Path",this.currentPoint=new dt,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new ar(this.currentPoint.clone(),new dt(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){let r=new or(this.currentPoint.clone(),new dt(t,e),new dt(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,a){let o=new rr(this.currentPoint.clone(),new dt(t,e),new dt(n,s),new dt(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new lr(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,e+l,n,s,r,a),this}absarc(t,e,n,s,r,a){return this.absellipse(t,e,n,n,s,r,a),this}ellipse(t,e,n,s,r,a,o,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(t+c,e+u,n,s,r,a,o,l),this}absellipse(t,e,n,s,r,a,o,l){let c=new hs(t,e,n,s,r,a,o,l);if(this.curves.length>0){let f=c.getPoint(0);f.equals(this.currentPoint)||this.lineTo(f.x,f.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},us=class extends cr{constructor(t){super(t),this.uuid=vs(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(new cr().fromJSON(s))}return this}};function $f(i,t,e=2){let n=t&&t.length,s=n?t[0]*e:i.length,r=Zu(i,0,s,e,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=tp(i,t,r,e)),i.length>80*e){o=i[0],l=i[1];let u=o,f=l;for(let h=e;h<s;h+=e){let d=i[h],m=i[h+1];d<o&&(o=d),m<l&&(l=m),d>u&&(u=d),m>f&&(f=m)}c=Math.max(u-o,f-l),c=c!==0?32767/c:0}return hr(r,a,e,o,l,c,0),a}function Zu(i,t,e,n,s){let r;if(s===up(i,t,e,n)>0)for(let a=t;a<e;a+=n)r=tu(a/n|0,i[a],i[a+1],r);else for(let a=e-n;a>=t;a-=n)r=tu(a/n|0,i[a],i[a+1],r);return r&&ds(r,r.next)&&(dr(r),r=r.next),r}function Ii(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(ds(e,e.next)||Te(e.prev,e,e.next)===0)){if(dr(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function hr(i,t,e,n,s,r,a){if(!i)return;!a&&r&&rp(i,n,s,r);let o=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(r?Kf(i,n,s,r):Jf(i)){t.push(l.i,i.i,c.i),dr(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=jf(Ii(i),t),hr(i,t,e,n,s,r,2)):a===2&&Qf(i,t,e,n,s,r):hr(Ii(i),t,e,n,s,r,1);break}}}function Jf(i){let t=i.prev,e=i,n=i.next;if(Te(t,e,n)>=0)return!1;let s=t.x,r=e.x,a=n.x,o=t.y,l=e.y,c=n.y,u=Math.min(s,r,a),f=Math.min(o,l,c),h=Math.max(s,r,a),d=Math.max(o,l,c),m=n.next;for(;m!==t;){if(m.x>=u&&m.x<=h&&m.y>=f&&m.y<=d&&Bs(s,o,r,l,a,c,m.x,m.y)&&Te(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function Kf(i,t,e,n){let s=i.prev,r=i,a=i.next;if(Te(s,r,a)>=0)return!1;let o=s.x,l=r.x,c=a.x,u=s.y,f=r.y,h=a.y,d=Math.min(o,l,c),m=Math.min(u,f,h),x=Math.max(o,l,c),g=Math.max(u,f,h),p=dc(d,m,t,e,n),M=dc(x,g,t,e,n),b=i.prevZ,y=i.nextZ;for(;b&&b.z>=p&&y&&y.z<=M;){if(b.x>=d&&b.x<=x&&b.y>=m&&b.y<=g&&b!==s&&b!==a&&Bs(o,u,l,f,c,h,b.x,b.y)&&Te(b.prev,b,b.next)>=0||(b=b.prevZ,y.x>=d&&y.x<=x&&y.y>=m&&y.y<=g&&y!==s&&y!==a&&Bs(o,u,l,f,c,h,y.x,y.y)&&Te(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;b&&b.z>=p;){if(b.x>=d&&b.x<=x&&b.y>=m&&b.y<=g&&b!==s&&b!==a&&Bs(o,u,l,f,c,h,b.x,b.y)&&Te(b.prev,b,b.next)>=0)return!1;b=b.prevZ}for(;y&&y.z<=M;){if(y.x>=d&&y.x<=x&&y.y>=m&&y.y<=g&&y!==s&&y!==a&&Bs(o,u,l,f,c,h,y.x,y.y)&&Te(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function jf(i,t){let e=i;do{let n=e.prev,s=e.next.next;!ds(n,s)&&Ju(n,e,e.next,s)&&ur(n,s)&&ur(s,n)&&(t.push(n.i,e.i,s.i),dr(e),dr(e.next),e=i=s),e=e.next}while(e!==i);return Ii(e)}function Qf(i,t,e,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&lp(a,o)){let l=Ku(a,o);a=Ii(a,a.next),l=Ii(l,l.next),hr(a,t,e,n,s,r,0),hr(l,t,e,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function tp(i,t,e,n){let s=[];for(let r=0,a=t.length;r<a;r++){let o=t[r]*n,l=r<a-1?t[r+1]*n:i.length,c=Zu(i,o,l,n,!1);c===c.next&&(c.steiner=!0),s.push(op(c))}s.sort(ep);for(let r=0;r<s.length;r++)e=np(s[r],e);return e}function ep(i,t){let e=i.x-t.x;if(e===0&&(e=i.y-t.y,e===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(t.next.y-t.y)/(t.next.x-t.x);e=n-s}return e}function np(i,t){let e=ip(i,t);if(!e)return t;let n=Ku(e,i);return Ii(n,n.next),Ii(e,e.next)}function ip(i,t){let e=t,n=i.x,s=i.y,r=-1/0,a;if(ds(i,e))return e;do{if(ds(i,e.next))return e.next;if(s<=e.y&&s>=e.next.y&&e.next.y!==e.y){let f=e.x+(s-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(f<=n&&f>r&&(r=f,a=e.x<e.next.x?e:e.next,f===n))return a}e=e.next}while(e!==t);if(!a)return null;let o=a,l=a.x,c=a.y,u=1/0;e=a;do{if(n>=e.x&&e.x>=l&&n!==e.x&&$u(s<c?n:r,s,l,c,s<c?r:n,s,e.x,e.y)){let f=Math.abs(s-e.y)/(n-e.x);ur(e,i)&&(f<u||f===u&&(e.x>a.x||e.x===a.x&&sp(a,e)))&&(a=e,u=f)}e=e.next}while(e!==o);return a}function sp(i,t){return Te(i.prev,i,t.prev)<0&&Te(t.next,i,i.next)<0}function rp(i,t,e,n){let s=i;do s.z===0&&(s.z=dc(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,ap(s)}function ap(i){let t,e=1;do{let n=i,s;i=null;let r=null;for(t=0;n;){t++;let a=n,o=0;for(let c=0;c<e&&(o++,a=a.nextZ,!!a);c++);let l=e;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(s=n,n=n.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=a}r.nextZ=null,e*=2}while(t>1);return i}function dc(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function op(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function $u(i,t,e,n,s,r,a,o){return(s-a)*(t-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(e-a)*(t-o)&&(e-a)*(r-o)>=(s-a)*(n-o)}function Bs(i,t,e,n,s,r,a,o){return!(i===a&&t===o)&&$u(i,t,e,n,s,r,a,o)}function lp(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!cp(i,t)&&(ur(i,t)&&ur(t,i)&&hp(i,t)&&(Te(i.prev,i,t.prev)||Te(i,t.prev,t))||ds(i,t)&&Te(i.prev,i,i.next)>0&&Te(t.prev,t,t.next)>0)}function Te(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function ds(i,t){return i.x===t.x&&i.y===t.y}function Ju(i,t,e,n){let s=va(Te(i,t,e)),r=va(Te(i,t,n)),a=va(Te(e,n,i)),o=va(Te(e,n,t));return!!(s!==r&&a!==o||s===0&&_a(i,e,t)||r===0&&_a(i,n,t)||a===0&&_a(e,i,n)||o===0&&_a(e,t,n))}function _a(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function va(i){return i>0?1:i<0?-1:0}function cp(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&Ju(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function ur(i,t){return Te(i.prev,i,i.next)<0?Te(i,t,i.next)>=0&&Te(i,i.prev,t)>=0:Te(i,t,i.prev)<0||Te(i,i.next,t)<0}function hp(i,t){let e=i,n=!1,s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function Ku(i,t){let e=fc(i.i,i.x,i.y),n=fc(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function tu(i,t,e,n){let s=fc(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function dr(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function fc(i,t,e){return{i,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function up(i,t,e,n){let s=0;for(let r=t,a=e-n;r<e;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}var pc=class{static triangulate(t,e,n=2){return $f(t,e,n)}},Ri=class i{static area(t){let e=t.length,n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return i.area(t)<0}static triangulateShape(t,e){let n=[],s=[],r=[];eu(t),nu(n,t);let a=t.length;e.forEach(eu);for(let l=0;l<e.length;l++)s.push(a),a+=e[l].length,nu(n,e[l]);let o=pc.triangulate(n,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function eu(i){let t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function nu(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}var fr=class i extends Le{constructor(t=new us([new dt(.5,.5),new dt(-.5,.5),new dt(-.5,-.5),new dt(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let n=this,s=[],r=[];for(let o=0,l=t.length;o<l;o++){let c=t[o];a(c)}this.setAttribute("position",new se(s,3)),this.setAttribute("uv",new se(r,2)),this.computeVertexNormals();function a(o){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,u=e.steps!==void 0?e.steps:1,f=e.depth!==void 0?e.depth:1,h=e.bevelEnabled!==void 0?e.bevelEnabled:!0,d=e.bevelThickness!==void 0?e.bevelThickness:.2,m=e.bevelSize!==void 0?e.bevelSize:d-.1,x=e.bevelOffset!==void 0?e.bevelOffset:0,g=e.bevelSegments!==void 0?e.bevelSegments:3,p=e.extrudePath,M=e.UVGenerator!==void 0?e.UVGenerator:dp,b,y=!1,E,T,R,v;if(p){b=p.getSpacedPoints(u),y=!0,h=!1;let K=p.isCatmullRomCurve3?p.closed:!1;E=p.computeFrenetFrames(u,K),T=new N,R=new N,v=new N}h||(g=0,d=0,m=0,x=0);let w=o.extractPoints(c),C=w.shape,L=w.holes;if(!Ri.isClockWise(C)){C=C.reverse();for(let K=0,ot=L.length;K<ot;K++){let lt=L[K];Ri.isClockWise(lt)&&(L[K]=lt.reverse())}}function H(K){let lt=10000000000000001e-36,ct=K[0];for(let pt=1;pt<=K.length;pt++){let Ft=pt%K.length,Dt=K[Ft],kt=Dt.x-ct.x,Wt=Dt.y-ct.y,D=kt*kt+Wt*Wt,le=Math.max(Math.abs(Dt.x),Math.abs(Dt.y),Math.abs(ct.x),Math.abs(ct.y)),Qt=lt*le*le;if(D<=Qt){K.splice(Ft,1),pt--;continue}ct=Dt}}H(C),L.forEach(H);let U=L.length,k=C;for(let K=0;K<U;K++){let ot=L[K];C=C.concat(ot)}function Z(K,ot,lt){return ot||Gt("ExtrudeGeometry: vec does not exist"),K.clone().addScaledVector(ot,lt)}let Y=C.length;function st(K,ot,lt){let ct,pt,Ft,Dt=K.x-ot.x,kt=K.y-ot.y,Wt=lt.x-K.x,D=lt.y-K.y,le=Dt*Dt+kt*kt,Qt=Dt*D-kt*Wt;if(Math.abs(Qt)>Number.EPSILON){let A=Math.sqrt(le),_=Math.sqrt(Wt*Wt+D*D),I=ot.x-kt/A,P=ot.y+Dt/A,z=lt.x-D/_,j=lt.y+Wt/_,it=((z-I)*D-(j-P)*Wt)/(Dt*D-kt*Wt);ct=I+Dt*it-K.x,pt=P+kt*it-K.y;let W=ct*ct+pt*pt;if(W<=2)return new dt(ct,pt);Ft=Math.sqrt(W/2)}else{let A=!1;Dt>Number.EPSILON?Wt>Number.EPSILON&&(A=!0):Dt<-Number.EPSILON?Wt<-Number.EPSILON&&(A=!0):Math.sign(kt)===Math.sign(D)&&(A=!0),A?(ct=-kt,pt=Dt,Ft=Math.sqrt(le)):(ct=Dt,pt=kt,Ft=Math.sqrt(le/2))}return new dt(ct/Ft,pt/Ft)}let $=[];for(let K=0,ot=k.length,lt=ot-1,ct=K+1;K<ot;K++,lt++,ct++)lt===ot&&(lt=0),ct===ot&&(ct=0),$[K]=st(k[K],k[lt],k[ct]);let tt=[],nt,It=$.concat();for(let K=0,ot=U;K<ot;K++){let lt=L[K];nt=[];for(let ct=0,pt=lt.length,Ft=pt-1,Dt=ct+1;ct<pt;ct++,Ft++,Dt++)Ft===pt&&(Ft=0),Dt===pt&&(Dt=0),nt[ct]=st(lt[ct],lt[Ft],lt[Dt]);tt.push(nt),It=It.concat(nt)}let rt;if(g===0)rt=Ri.triangulateShape(k,L);else{let K=[],ot=[];for(let lt=0;lt<g;lt++){let ct=lt/g,pt=d*Math.cos(ct*Math.PI/2),Ft=m*Math.sin(ct*Math.PI/2)+x;for(let Dt=0,kt=k.length;Dt<kt;Dt++){let Wt=Z(k[Dt],$[Dt],Ft);mt(Wt.x,Wt.y,-pt),ct===0&&K.push(Wt)}for(let Dt=0,kt=U;Dt<kt;Dt++){let Wt=L[Dt];nt=tt[Dt];let D=[];for(let le=0,Qt=Wt.length;le<Qt;le++){let A=Z(Wt[le],nt[le],Ft);mt(A.x,A.y,-pt),ct===0&&D.push(A)}ct===0&&ot.push(D)}}rt=Ri.triangulateShape(K,ot)}let ie=rt.length,$t=m+x;for(let K=0;K<Y;K++){let ot=h?Z(C[K],It[K],$t):C[K];y?(R.copy(E.normals[0]).multiplyScalar(ot.x),T.copy(E.binormals[0]).multiplyScalar(ot.y),v.copy(b[0]).add(R).add(T),mt(v.x,v.y,v.z)):mt(ot.x,ot.y,0)}for(let K=1;K<=u;K++)for(let ot=0;ot<Y;ot++){let lt=h?Z(C[ot],It[ot],$t):C[ot];y?(R.copy(E.normals[K]).multiplyScalar(lt.x),T.copy(E.binormals[K]).multiplyScalar(lt.y),v.copy(b[K]).add(R).add(T),mt(v.x,v.y,v.z)):mt(lt.x,lt.y,f/u*K)}for(let K=g-1;K>=0;K--){let ot=K/g,lt=d*Math.cos(ot*Math.PI/2),ct=m*Math.sin(ot*Math.PI/2)+x;for(let pt=0,Ft=k.length;pt<Ft;pt++){let Dt=Z(k[pt],$[pt],ct);mt(Dt.x,Dt.y,f+lt)}for(let pt=0,Ft=L.length;pt<Ft;pt++){let Dt=L[pt];nt=tt[pt];for(let kt=0,Wt=Dt.length;kt<Wt;kt++){let D=Z(Dt[kt],nt[kt],ct);y?mt(D.x,D.y+b[u-1].y,b[u-1].x+lt):mt(D.x,D.y,f+lt)}}}ee(),J();function ee(){let K=s.length/3;if(h){let ot=0,lt=Y*ot;for(let ct=0;ct<ie;ct++){let pt=rt[ct];Bt(pt[2]+lt,pt[1]+lt,pt[0]+lt)}ot=u+g*2,lt=Y*ot;for(let ct=0;ct<ie;ct++){let pt=rt[ct];Bt(pt[0]+lt,pt[1]+lt,pt[2]+lt)}}else{for(let ot=0;ot<ie;ot++){let lt=rt[ot];Bt(lt[2],lt[1],lt[0])}for(let ot=0;ot<ie;ot++){let lt=rt[ot];Bt(lt[0]+Y*u,lt[1]+Y*u,lt[2]+Y*u)}}n.addGroup(K,s.length/3-K,0)}function J(){let K=s.length/3,ot=0;et(k,ot),ot+=k.length;for(let lt=0,ct=L.length;lt<ct;lt++){let pt=L[lt];et(pt,ot),ot+=pt.length}n.addGroup(K,s.length/3-K,1)}function et(K,ot){let lt=K.length;for(;--lt>=0;){let ct=lt,pt=lt-1;pt<0&&(pt=K.length-1);for(let Ft=0,Dt=u+g*2;Ft<Dt;Ft++){let kt=Y*Ft,Wt=Y*(Ft+1),D=ot+ct+kt,le=ot+pt+kt,Qt=ot+pt+Wt,A=ot+ct+Wt;St(D,le,Qt,A)}}}function mt(K,ot,lt){l.push(K),l.push(ot),l.push(lt)}function Bt(K,ot,lt){Ht(K),Ht(ot),Ht(lt);let ct=s.length/3,pt=M.generateTopUV(n,s,ct-3,ct-2,ct-1);oe(pt[0]),oe(pt[1]),oe(pt[2])}function St(K,ot,lt,ct){Ht(K),Ht(ot),Ht(ct),Ht(ot),Ht(lt),Ht(ct);let pt=s.length/3,Ft=M.generateSideWallUV(n,s,pt-6,pt-3,pt-2,pt-1);oe(Ft[0]),oe(Ft[1]),oe(Ft[3]),oe(Ft[1]),oe(Ft[2]),oe(Ft[3])}function Ht(K){s.push(l[K*3+0]),s.push(l[K*3+1]),s.push(l[K*3+2])}function oe(K){r.push(K.x),r.push(K.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return fp(e,n,t)}static fromJSON(t,e){let n=[];for(let r=0,a=t.shapes.length;r<a;r++){let o=e[t.shapes[r]];n.push(o)}let s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new uc[s.type]().fromJSON(s)),new i(n,t.options)}},dp={generateTopUV:function(i,t,e,n,s){let r=t[e*3],a=t[e*3+1],o=t[n*3],l=t[n*3+1],c=t[s*3],u=t[s*3+1];return[new dt(r,a),new dt(o,l),new dt(c,u)]},generateSideWallUV:function(i,t,e,n,s,r){let a=t[e*3],o=t[e*3+1],l=t[e*3+2],c=t[n*3],u=t[n*3+1],f=t[n*3+2],h=t[s*3],d=t[s*3+1],m=t[s*3+2],x=t[r*3],g=t[r*3+1],p=t[r*3+2];return Math.abs(o-u)<Math.abs(a-c)?[new dt(a,1-l),new dt(c,1-f),new dt(h,1-m),new dt(x,1-p)]:[new dt(o,1-l),new dt(u,1-f),new dt(d,1-m),new dt(g,1-p)]}};function fp(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var pr=class i extends ka{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}},mr=class i extends Le{constructor(t=[new dt(0,-.5),new dt(.5,0),new dt(0,.5)],e=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:n,phiLength:s},e=Math.floor(e),s=jt(s,0,Math.PI*2);let r=[],a=[],o=[],l=[],c=[],u=1/e,f=new N,h=new dt,d=new N,m=new N,x=new N,g=0,p=0;for(let M=0;M<=t.length-1;M++)switch(M){case 0:g=t[M+1].x-t[M].x,p=t[M+1].y-t[M].y,d.x=p*1,d.y=-g,d.z=p*0,x.copy(d),d.normalize(),l.push(d.x,d.y,d.z);break;case t.length-1:l.push(x.x,x.y,x.z);break;default:g=t[M+1].x-t[M].x,p=t[M+1].y-t[M].y,d.x=p*1,d.y=-g,d.z=p*0,m.copy(d),d.x+=x.x,d.y+=x.y,d.z+=x.z,d.normalize(),l.push(d.x,d.y,d.z),x.copy(m)}for(let M=0;M<=e;M++){let b=n+M*u*s,y=Math.sin(b),E=Math.cos(b);for(let T=0;T<=t.length-1;T++){f.x=t[T].x*y,f.y=t[T].y,f.z=t[T].x*E,a.push(f.x,f.y,f.z),h.x=M/e,h.y=T/(t.length-1),o.push(h.x,h.y);let R=l[3*T+0]*y,v=l[3*T+1],w=l[3*T+0]*E;c.push(R,v,w)}}for(let M=0;M<e;M++)for(let b=0;b<t.length-1;b++){let y=b+M*t.length,E=y,T=y+t.length,R=y+t.length+1,v=y+1;r.push(E,T,v),r.push(R,v,T)}this.setIndex(r),this.setAttribute("position",new se(a,3)),this.setAttribute("uv",new se(o,2)),this.setAttribute("normal",new se(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.points,t.segments,t.phiStart,t.phiLength)}};var De=class i extends Le{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,f=t/o,h=e/l,d=[],m=[],x=[],g=[];for(let p=0;p<u;p++){let M=p*h-a;for(let b=0;b<c;b++){let y=b*f-r;m.push(y,-M,0),x.push(0,0,1),g.push(b/o),g.push(1-p/l)}}for(let p=0;p<l;p++)for(let M=0;M<o;M++){let b=M+c*p,y=M+c*(p+1),E=M+1+c*(p+1),T=M+1+c*p;d.push(b,y,T),d.push(y,E,T)}this.setIndex(d),this.setAttribute("position",new se(m,3)),this.setAttribute("normal",new se(x,3)),this.setAttribute("uv",new se(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}};var bn=class i extends Le{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,u=[],f=new N,h=new N,d=[],m=[],x=[],g=[];for(let p=0;p<=n;p++){let M=[],b=p/n,y=a+b*o,E=t*Math.cos(y),T=Math.sqrt(t*t-E*E),R=0;p===0&&a===0?R=.5/e:p===n&&l===Math.PI&&(R=-.5/e);for(let v=0;v<=e;v++){let w=v/e,C=s+w*r;f.x=-T*Math.cos(C),f.y=E,f.z=T*Math.sin(C),m.push(f.x,f.y,f.z),h.copy(f).normalize(),x.push(h.x,h.y,h.z),g.push(w+R,1-b),M.push(c++)}u.push(M)}for(let p=0;p<n;p++)for(let M=0;M<e;M++){let b=u[p][M+1],y=u[p][M],E=u[p+1][M],T=u[p+1][M+1];(p!==0||a>0)&&d.push(b,y,T),(p!==n-1||l<Math.PI)&&d.push(y,E,T)}this.setIndex(d),this.setAttribute("position",new se(m,3)),this.setAttribute("normal",new se(x,3)),this.setAttribute("uv",new se(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var gr=class i extends Le{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),s=Math.floor(s);let l=[],c=[],u=[],f=[],h=new N,d=new N,m=new N;for(let x=0;x<=n;x++){let g=a+x/n*o;for(let p=0;p<=s;p++){let M=p/s*r;d.x=(t+e*Math.cos(g))*Math.cos(M),d.y=(t+e*Math.cos(g))*Math.sin(M),d.z=e*Math.sin(g),c.push(d.x,d.y,d.z),h.x=t*Math.cos(M),h.y=t*Math.sin(M),m.subVectors(d,h).normalize(),u.push(m.x,m.y,m.z),f.push(p/s),f.push(x/n)}}for(let x=1;x<=n;x++)for(let g=1;g<=s;g++){let p=(s+1)*x+g-1,M=(s+1)*(x-1)+g-1,b=(s+1)*(x-1)+g,y=(s+1)*x+g;l.push(p,M,y),l.push(M,b,y)}this.setIndex(l),this.setAttribute("position",new se(c,3)),this.setAttribute("normal",new se(u,3)),this.setAttribute("uv",new se(f,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function Di(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];if(iu(s))s.isRenderTargetTexture?(zt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(iu(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function Ye(i){let t={};for(let e=0;e<i.length;e++){let n=Di(i[e]);for(let s in n)t[s]=n[s]}return t}function iu(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function pp(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Vc(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ne.workingColorSpace}var ju={clone:Di,merge:Ye},mp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,gp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ln=class extends Kn{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=mp,this.fragmentShader=gp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Di(t.uniforms),this.uniformsGroups=pp(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new At().setHex(s.value);break;case"v2":this.uniforms[n].value=new dt().fromArray(s.value);break;case"v3":this.uniforms[n].value=new N().fromArray(s.value);break;case"v4":this.uniforms[n].value=new be().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Xt().fromArray(s.value);break;case"m4":this.uniforms[n].value=new fe().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},Ya=class extends ln{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Vt=class extends Kn{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new At(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new At(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=$o,this.normalScale=new dt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $n,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},xr=class extends Vt{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new dt(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return jt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new At(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new At(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new At(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};var Za=class extends Kn{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Du,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},$a=class extends Kn{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function ji(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function rc(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var fi=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let a;e:{i:if(!(t<s)){for(let o=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=e[++n],t<s)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=e[--n-1],t>=r)break t}a=n,n=0;break e}break n}for(;n<a;){let o=n+a>>>1;t<e[o]?a=o:n=o+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=n[r+a];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Ja=class extends fi{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:lc,endingEnd:lc}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,a=t+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case cc:r=t,o=2*e-n;break;case hc:r=s.length-2,o=e+s[r]-s[r+1];break;default:r=t,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case cc:a=t,l=2*n-e;break;case hc:a=1,l=n+s[1]-s[0];break;default:a=t-1,l=e}let c=(n-e)*.5,u=this.valueSize;this._weightPrev=c/(e-o),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,u=this._offsetPrev,f=this._offsetNext,h=this._weightPrev,d=this._weightNext,m=(n-e)/(s-e),x=m*m,g=x*m,p=-h*g+2*h*x-h*m,M=(1+h)*g+(-1.5-2*h)*x+(-.5+h)*m+1,b=(-1-d)*g+(1.5+d)*x+.5*m,y=d*g-d*x;for(let E=0;E!==o;++E)r[E]=p*a[u+E]+M*a[c+E]+b*a[l+E]+y*a[f+E];return r}},Ka=class extends fi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,u=(n-e)/(s-e),f=1-u;for(let h=0;h!==o;++h)r[h]=a[c+h]*f+a[l+h]*u;return r}},ja=class extends fi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},Qa=class extends fi{interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,u=this.inTangents,f=this.outTangents;if(!u||!f){let m=(n-e)/(s-e),x=1-m;for(let g=0;g!==o;++g)r[g]=a[c+g]*x+a[l+g]*m;return r}let h=o*2,d=t-1;for(let m=0;m!==o;++m){let x=a[c+m],g=a[l+m],p=d*h+m*2,M=f[p],b=f[p+1],y=t*h+m*2,E=u[y],T=u[y+1],R=_p(n,e,M,E,s);r[m]=Qu(R,x,b,T,g)}return r}};function Qu(i,t,e,n,s){let r=1-i;return r*r*r*t+3*r*r*i*e+3*r*i*i*n+i*i*i*s}function xp(i,t,e,n,s){let r=1-i;return 3*r*r*(e-t)+6*r*i*(n-e)+3*i*i*(s-n)}function _p(i,t,e,n,s){let r=(i-t)/(s-t);for(let a=0;a<8;a++){let o=Qu(r,t,e,n,s)-i;if(Math.abs(o)<1e-10)break;let l=xp(r,t,e,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var cn=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=ji(e,this.TimeBufferType),this.values=ji(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:ji(t.times,Array),values:ji(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s),rc(t.settings)&&(n.settings={inTangents:ji(t.settings.inTangents,Array),outTangents:ji(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new ja(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Ka(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Ja(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new Qa(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case Hs:e=this.InterpolantFactoryMethodDiscrete;break;case La:e=this.InterpolantFactoryMethodLinear;break;case Sa:e=this.InterpolantFactoryMethodSmooth;break;case oc:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return zt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Hs;case this.InterpolantFactoryMethodLinear:return La;case this.InterpolantFactoryMethodSmooth:return Sa;case this.InterpolantFactoryMethodBezier:return oc}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t;rc(this.settings)&&(su(this.settings.inTangents,t),su(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<t;)++r;for(;a!==-1&&n[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Gt("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Gt("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){Gt("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(a!==null&&a>l){Gt("KeyframeTrack: Out of order keys.",this,o,l,a),t=!1;break}a=l}if(s!==void 0&&Mf(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Gt("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Sa,r=t.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=t[o],u=t[o+1];if(c!==u&&(o!==1||c!==t[0]))if(s)l=!0;else{let f=o*n,h=f-n,d=f+n;for(let m=0;m!==n;++m){let x=e[f+m];if(x!==e[h+m]||x!==e[d+m]){l=!0;break}}}if(l){if(o!==a){t[a]=t[o];let f=o*n,h=a*n;for(let d=0;d!==n;++d)e[h+d]=e[f+d]}++a}}if(r>0){t[a]=t[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)e[l+c]=e[o+c];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,rc(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function su(i,t){for(let e=0,n=i.length;e!==n;e+=2)i[e]*=t}cn.prototype.ValueTypeName="";cn.prototype.TimeBufferType=Float32Array;cn.prototype.ValueBufferType=Float32Array;cn.prototype.DefaultInterpolation=La;var pi=class extends cn{constructor(t,e,n){super(t,e,n)}};pi.prototype.ValueTypeName="bool";pi.prototype.ValueBufferType=Array;pi.prototype.DefaultInterpolation=Hs;pi.prototype.InterpolantFactoryMethodLinear=void 0;pi.prototype.InterpolantFactoryMethodSmooth=void 0;var to=class extends cn{constructor(t,e,n,s){super(t,e,n,s)}};to.prototype.ValueTypeName="color";var eo=class extends cn{constructor(t,e,n,s){super(t,e,n,s)}};eo.prototype.ValueTypeName="number";var no=class extends fi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-e)/(s-e),c=t*o;for(let u=c+o;c!==u;c+=4)fn.slerpFlat(r,0,a,c-o,a,c,l);return r}},_r=class extends cn{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new no(this.times,this.values,this.getValueSize(),t)}};_r.prototype.ValueTypeName="quaternion";_r.prototype.InterpolantFactoryMethodSmooth=void 0;var mi=class extends cn{constructor(t,e,n){super(t,e,n)}};mi.prototype.ValueTypeName="string";mi.prototype.ValueBufferType=Array;mi.prototype.DefaultInterpolation=Hs;mi.prototype.InterpolantFactoryMethodLinear=void 0;mi.prototype.InterpolantFactoryMethodSmooth=void 0;var io=class extends cn{constructor(t,e,n,s){super(t,e,n,s)}};io.prototype.ValueTypeName="vector";var so=class{constructor(t,e,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,f){return c.push(u,f),this},this.removeHandler=function(u){let f=c.indexOf(u);return f!==-1&&c.splice(f,2),this},this.getHandler=function(u){for(let f=0,h=c.length;f<h;f+=2){let d=c[f],m=c[f+1];if(d.global&&(d.lastIndex=0),d.test(u))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},td=new so,ro=class{constructor(t){this.manager=t!==void 0?t:td,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};ro.DEFAULT_MATERIAL_NAME="__DEFAULT";var fs=class extends ae{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new At(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},vr=class extends fs{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ae.DEFAULT_UP),this.updateMatrix(),this.groundColor=new At(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},ac=new fe,ru=new N,au=new N,yr=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new dt(512,512),this.mapType=sn,this.map=null,this.mapPass=null,this.matrix=new fe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ls,this._frameExtents=new dt(1,1),this._viewportCount=1,this._viewports=[new be(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;ru.setFromMatrixPosition(t.matrixWorld),e.position.copy(ru),au.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(au),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,s){ac.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(ac,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;t.coordinateSystem===ss||t.reversedDepth?e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),e.multiply(ac)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},ya=new N,Ma=new fn,Ln=new N,Mr=class extends ae{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new fe,this.projectionMatrix=new fe,this.projectionMatrixInverse=new fe,this.coordinateSystem=Sn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(ya,Ma,Ln),Ln.x===1&&Ln.y===1&&Ln.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ya,Ma,Ln.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(ya,Ma,Ln),Ln.x===1&&Ln.y===1&&Ln.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ya,Ma,Ln.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},hi=new N,ou=new dt,lu=new dt,He=class extends Mr{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Xs*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Nl*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Xs*2*Math.atan(Math.tan(Nl*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){hi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(hi.x,hi.y).multiplyScalar(-t/hi.z),hi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(hi.x,hi.y).multiplyScalar(-t/hi.z)}getViewSize(t,e){return this.getViewBounds(t,ou,lu),e.subVectors(lu,ou)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Nl*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},mc=class extends yr{constructor(){super(new He(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(t){let e=this.camera,n=Xs*2*t.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=t.distance||e.far;(n!==e.fov||s!==e.aspect||r!==e.far)&&(e.fov=n,e.aspect=s,e.far=r,e.updateProjectionMatrix()),super.updateMatrices(t)}copy(t){return super.copy(t),this.focus=t.focus,this.aspect=t.aspect,this}toJSON(){let t=super.toJSON();return t.focus=this.focus,t.aspect=this.aspect,t}},Sr=class extends fs{constructor(t,e,n=0,s=Math.PI/3,r=0,a=2){super(t,e),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(ae.DEFAULT_UP),this.updateMatrix(),this.target=new ae,this.distance=n,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new mc}get power(){return this.intensity*Math.PI}set power(t){this.intensity=t/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.angle=t.angle,this.penumbra=t.penumbra,this.decay=t.decay,this.target=t.target.clone(),this.map=t.map,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.angle=this.angle,e.object.decay=this.decay,e.object.penumbra=this.penumbra,e.object.target=this.target.uuid,this.map&&this.map.isTexture&&(e.object.map=this.map.toJSON(t).uuid),e.object.shadow=this.shadow.toJSON(),e}};var ps=class extends Mr{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,a=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},gc=class extends yr{constructor(){super(new ps(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},br=class extends fs{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ae.DEFAULT_UP),this.updateMatrix(),this.target=new ae,this.shadow=new gc}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var Qi=-90,ts=1,ao=class extends ae{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new He(Qi,ts,t,e);s.layers=this.layers,this.add(s);let r=new He(Qi,ts,t,e);r.layers=this.layers,this.add(r);let a=new He(Qi,ts,t,e);a.layers=this.layers,this.add(a);let o=new He(Qi,ts,t,e);o.layers=this.layers,this.add(o);let l=new He(Qi,ts,t,e);l.layers=this.layers,this.add(l);let c=new He(Qi,ts,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,l]=e;for(let c of e)this.remove(c);if(t===Sn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===ss)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,u]=this.children,f=t.getRenderTarget(),h=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),m=t.xr.enabled;t.xr.enabled=!1;let x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let g=!1;t.isWebGLRenderer===!0?g=t.state.buffers.depth.getReversed():g=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,2,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,3,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(n,4,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),n.texture.generateMipmaps=x,t.setRenderTarget(n,5,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,u),t.setRenderTarget(f,h,d),t.xr.enabled=m,n.texture.needsPMREMUpdate=!0}},oo=class extends He{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var Wc="\\[\\]\\.:\\/",vp=new RegExp("["+Wc+"]","g"),Xc="[^"+Wc+"]",yp="[^"+Wc.replace("\\.","")+"]",Mp=/((?:WC+[\/:])*)/.source.replace("WC",Xc),Sp=/(WCOD+)?/.source.replace("WCOD",yp),bp=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Xc),Ep=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Xc),Tp=new RegExp("^"+Mp+Sp+bp+Ep+"$"),wp=["material","materials","bones","map"],xc=class{constructor(t,e,n){let s=n||Me.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},Me=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(vp,"")}static parseTrackName(t){let e=Tp.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);wp.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let l=n(o.children);if(l)return l}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){zt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){Gt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Gt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Gt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let u=0;u<t.length;u++)if(t[u].name===c){c=u;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Gt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Gt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){Gt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){Gt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let a=t[s];if(a===void 0){let c=e.nodeName;Gt("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Gt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Gt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Me.Composite=xc;Me.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Me.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Me.prototype.GetterByBindingType=[Me.prototype._getValue_direct,Me.prototype._getValue_array,Me.prototype._getValue_arrayElement,Me.prototype._getValue_toArray];Me.prototype.SetterByBindingTypeAndVersioning=[[Me.prototype._setValue_direct,Me.prototype._setValue_direct_setNeedsUpdate,Me.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Me.prototype._setValue_array,Me.prototype._setValue_array_setNeedsUpdate,Me.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Me.prototype._setValue_arrayElement,Me.prototype._setValue_arrayElement_setNeedsUpdate,Me.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Me.prototype._setValue_fromArray,Me.prototype._setValue_fromArray_setNeedsUpdate,Me.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var k_=new Float32Array(1);var _c=class i{static{i.prototype.isMatrix2=!0}constructor(t,e,n,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=s,this}};function qc(i,t,e,n){let s=Ap(n);switch(e){case Bc:return i*t;case mo:return i*t/s.components*s.byteLength;case go:return i*t/s.components*s.byteLength;case yi:return i*t*2/s.components*s.byteLength;case xo:return i*t*2/s.components*s.byteLength;case zc:return i*t*3/s.components*s.byteLength;case mn:return i*t*4/s.components*s.byteLength;case _o:return i*t*4/s.components*s.byteLength;case Ar:case Rr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Cr:case Ir:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case yo:case So:return Math.max(i,16)*Math.max(t,8)/4;case vo:case Mo:return Math.max(i,8)*Math.max(t,8)/2;case bo:case Eo:case wo:case Ao:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case To:case Pr:case Ro:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Co:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Io:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Po:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Lo:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Do:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case No:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Uo:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Fo:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Oo:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Bo:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case zo:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case ko:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Ho:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Go:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Vo:case Wo:case Xo:return Math.ceil(i/4)*Math.ceil(t/4)*16;case qo:case Yo:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Lr:case Zo:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Ap(i){switch(i){case sn:case Nc:return{byteLength:1,components:1};case xs:case Uc:case wn:return{byteLength:2,components:1};case fo:case po:return{byteLength:2,components:4};case Tn:case uo:case pn:return{byteLength:4,components:1};case Fc:case Oc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?zt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Sd(){let i=null,t=!1,e=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),e(r,a)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Cp(i){let t=new WeakMap;function e(o,l){let c=o.array,u=o.usage,f=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,u),o.onUploadCallback();let d;if(c instanceof Float32Array)d=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=i.SHORT;else if(c instanceof Uint32Array)d=i.UNSIGNED_INT;else if(c instanceof Int32Array)d=i.INT;else if(c instanceof Int8Array)d=i.BYTE;else if(c instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:f}}function n(o,l,c){let u=l.array,f=l.updateRanges;if(i.bindBuffer(c,o),f.length===0)i.bufferSubData(c,0,u);else{f.sort((d,m)=>d.start-m.start);let h=0;for(let d=1;d<f.length;d++){let m=f[h],x=f[d];x.start<=m.start+m.count+1?m.count=Math.max(m.count,x.start+x.count-m.start):(++h,f[h]=x)}f.length=h+1;for(let d=0,m=f.length;d<m;d++){let x=f[d];i.bufferSubData(c,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=t.get(o);(!u||u.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Ip=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Pp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Lp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Dp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Np=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Up=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Fp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Op=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Bp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,zp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,kp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Hp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Gp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Vp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Wp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Xp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,qp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Yp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Zp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,$p=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Jp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Kp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,jp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Qp=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,tm=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,em=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,nm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,im=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,sm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,rm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,am="gl_FragColor = linearToOutputTexel( gl_FragColor );",om=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,lm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,cm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,hm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,um=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,dm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,pm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,mm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,gm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,xm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,_m=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,vm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,ym=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Mm=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Sm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,bm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Em=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Tm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,wm=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Am=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Rm=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Cm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Im=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Pm=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Lm=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Dm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Nm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Um=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Fm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Om=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Bm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,zm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,km=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Hm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Gm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Vm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Wm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Xm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,qm=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Ym=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Zm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,$m=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Jm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Km=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,jm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Qm=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,t0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,e0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,n0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,i0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,s0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,r0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,a0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,o0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,l0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,c0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,h0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,u0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,d0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,f0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,p0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,m0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,g0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,x0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,_0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,v0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,y0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,M0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,S0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,b0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,E0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,T0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,w0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,A0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,R0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,C0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,I0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,P0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,L0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,D0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,N0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,U0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,F0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,O0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,B0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,z0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,k0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,H0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,G0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,V0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,W0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,X0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,q0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Y0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Z0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,$0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,J0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,K0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,j0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Q0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,tg=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,eg=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ng=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ig=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,sg=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,rg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ag=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,og=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,lg=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,cg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Kt={alphahash_fragment:Ip,alphahash_pars_fragment:Pp,alphamap_fragment:Lp,alphamap_pars_fragment:Dp,alphatest_fragment:Np,alphatest_pars_fragment:Up,aomap_fragment:Fp,aomap_pars_fragment:Op,batching_pars_vertex:Bp,batching_vertex:zp,begin_vertex:kp,beginnormal_vertex:Hp,bsdfs:Gp,iridescence_fragment:Vp,bumpmap_pars_fragment:Wp,clipping_planes_fragment:Xp,clipping_planes_pars_fragment:qp,clipping_planes_pars_vertex:Yp,clipping_planes_vertex:Zp,color_fragment:$p,color_pars_fragment:Jp,color_pars_vertex:Kp,color_vertex:jp,common:Qp,cube_uv_reflection_fragment:tm,defaultnormal_vertex:em,displacementmap_pars_vertex:nm,displacementmap_vertex:im,emissivemap_fragment:sm,emissivemap_pars_fragment:rm,colorspace_fragment:am,colorspace_pars_fragment:om,envmap_fragment:lm,envmap_common_pars_fragment:cm,envmap_pars_fragment:hm,envmap_pars_vertex:um,envmap_physical_pars_fragment:Sm,envmap_vertex:dm,fog_vertex:fm,fog_pars_vertex:pm,fog_fragment:mm,fog_pars_fragment:gm,gradientmap_pars_fragment:xm,lightmap_pars_fragment:_m,lights_lambert_fragment:vm,lights_lambert_pars_fragment:ym,lights_pars_begin:Mm,lights_toon_fragment:bm,lights_toon_pars_fragment:Em,lights_phong_fragment:Tm,lights_phong_pars_fragment:wm,lights_physical_fragment:Am,lights_physical_pars_fragment:Rm,lights_fragment_begin:Cm,lights_fragment_maps:Im,lights_fragment_end:Pm,lightprobes_pars_fragment:Lm,logdepthbuf_fragment:Dm,logdepthbuf_pars_fragment:Nm,logdepthbuf_pars_vertex:Um,logdepthbuf_vertex:Fm,map_fragment:Om,map_pars_fragment:Bm,map_particle_fragment:zm,map_particle_pars_fragment:km,metalnessmap_fragment:Hm,metalnessmap_pars_fragment:Gm,morphinstance_vertex:Vm,morphcolor_vertex:Wm,morphnormal_vertex:Xm,morphtarget_pars_vertex:qm,morphtarget_vertex:Ym,normal_fragment_begin:Zm,normal_fragment_maps:$m,normal_pars_fragment:Jm,normal_pars_vertex:Km,normal_vertex:jm,normalmap_pars_fragment:Qm,clearcoat_normal_fragment_begin:t0,clearcoat_normal_fragment_maps:e0,clearcoat_pars_fragment:n0,iridescence_pars_fragment:i0,opaque_fragment:s0,packing:r0,premultiplied_alpha_fragment:a0,project_vertex:o0,dithering_fragment:l0,dithering_pars_fragment:c0,roughnessmap_fragment:h0,roughnessmap_pars_fragment:u0,shadowmap_pars_fragment:d0,shadowmap_pars_vertex:f0,shadowmap_vertex:p0,shadowmask_pars_fragment:m0,skinbase_vertex:g0,skinning_pars_vertex:x0,skinning_vertex:_0,skinnormal_vertex:v0,specularmap_fragment:y0,specularmap_pars_fragment:M0,tonemapping_fragment:S0,tonemapping_pars_fragment:b0,transmission_fragment:E0,transmission_pars_fragment:T0,uv_pars_fragment:w0,uv_pars_vertex:A0,uv_vertex:R0,worldpos_vertex:C0,background_vert:I0,background_frag:P0,backgroundCube_vert:L0,backgroundCube_frag:D0,cube_vert:N0,cube_frag:U0,depth_vert:F0,depth_frag:O0,distance_vert:B0,distance_frag:z0,equirect_vert:k0,equirect_frag:H0,linedashed_vert:G0,linedashed_frag:V0,meshbasic_vert:W0,meshbasic_frag:X0,meshlambert_vert:q0,meshlambert_frag:Y0,meshmatcap_vert:Z0,meshmatcap_frag:$0,meshnormal_vert:J0,meshnormal_frag:K0,meshphong_vert:j0,meshphong_frag:Q0,meshphysical_vert:tg,meshphysical_frag:eg,meshtoon_vert:ng,meshtoon_frag:ig,points_vert:sg,points_frag:rg,shadow_vert:ag,shadow_frag:og,sprite_vert:lg,sprite_frag:cg},_t={common:{diffuse:{value:new At(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Xt},alphaMap:{value:null},alphaMapTransform:{value:new Xt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Xt}},envmap:{envMap:{value:null},envMapRotation:{value:new Xt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Xt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Xt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Xt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Xt},normalScale:{value:new dt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Xt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Xt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Xt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Xt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new At(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new N},probesMax:{value:new N},probesResolution:{value:new N}},points:{diffuse:{value:new At(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Xt},alphaTest:{value:0},uvTransform:{value:new Xt}},sprite:{diffuse:{value:new At(16777215)},opacity:{value:1},center:{value:new dt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Xt},alphaMap:{value:null},alphaMapTransform:{value:new Xt},alphaTest:{value:0}}},kn={basic:{uniforms:Ye([_t.common,_t.specularmap,_t.envmap,_t.aomap,_t.lightmap,_t.fog]),vertexShader:Kt.meshbasic_vert,fragmentShader:Kt.meshbasic_frag},lambert:{uniforms:Ye([_t.common,_t.specularmap,_t.envmap,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.fog,_t.lights,{emissive:{value:new At(0)},envMapIntensity:{value:1}}]),vertexShader:Kt.meshlambert_vert,fragmentShader:Kt.meshlambert_frag},phong:{uniforms:Ye([_t.common,_t.specularmap,_t.envmap,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.fog,_t.lights,{emissive:{value:new At(0)},specular:{value:new At(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Kt.meshphong_vert,fragmentShader:Kt.meshphong_frag},standard:{uniforms:Ye([_t.common,_t.envmap,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.roughnessmap,_t.metalnessmap,_t.fog,_t.lights,{emissive:{value:new At(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Kt.meshphysical_vert,fragmentShader:Kt.meshphysical_frag},toon:{uniforms:Ye([_t.common,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.gradientmap,_t.fog,_t.lights,{emissive:{value:new At(0)}}]),vertexShader:Kt.meshtoon_vert,fragmentShader:Kt.meshtoon_frag},matcap:{uniforms:Ye([_t.common,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.fog,{matcap:{value:null}}]),vertexShader:Kt.meshmatcap_vert,fragmentShader:Kt.meshmatcap_frag},points:{uniforms:Ye([_t.points,_t.fog]),vertexShader:Kt.points_vert,fragmentShader:Kt.points_frag},dashed:{uniforms:Ye([_t.common,_t.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Kt.linedashed_vert,fragmentShader:Kt.linedashed_frag},depth:{uniforms:Ye([_t.common,_t.displacementmap]),vertexShader:Kt.depth_vert,fragmentShader:Kt.depth_frag},normal:{uniforms:Ye([_t.common,_t.bumpmap,_t.normalmap,_t.displacementmap,{opacity:{value:1}}]),vertexShader:Kt.meshnormal_vert,fragmentShader:Kt.meshnormal_frag},sprite:{uniforms:Ye([_t.sprite,_t.fog]),vertexShader:Kt.sprite_vert,fragmentShader:Kt.sprite_frag},background:{uniforms:{uvTransform:{value:new Xt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Kt.background_vert,fragmentShader:Kt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Xt}},vertexShader:Kt.backgroundCube_vert,fragmentShader:Kt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Kt.cube_vert,fragmentShader:Kt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Kt.equirect_vert,fragmentShader:Kt.equirect_frag},distance:{uniforms:Ye([_t.common,_t.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Kt.distance_vert,fragmentShader:Kt.distance_frag},shadow:{uniforms:Ye([_t.lights,_t.fog,{color:{value:new At(0)},opacity:{value:1}}]),vertexShader:Kt.shadow_vert,fragmentShader:Kt.shadow_frag}};kn.physical={uniforms:Ye([kn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Xt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Xt},clearcoatNormalScale:{value:new dt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Xt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Xt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Xt},sheen:{value:0},sheenColor:{value:new At(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Xt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Xt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Xt},transmissionSamplerSize:{value:new dt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Xt},attenuationDistance:{value:0},attenuationColor:{value:new At(0)},specularColor:{value:new At(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Xt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Xt},anisotropyVector:{value:new dt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Xt}}]),vertexShader:Kt.meshphysical_vert,fragmentShader:Kt.meshphysical_frag};var jo={r:0,b:0,g:0},hg=new fe,bd=new Xt;bd.set(-1,0,0,0,1,0,0,0,1);function ug(i,t,e,n,s,r){let a=new At(0),o=s===!0?0:1,l,c,u=null,f=0,h=null;function d(M){let b=M.isScene===!0?M.background:null;if(b&&b.isTexture){let y=M.backgroundBlurriness>0;b=t.get(b,y)}return b}function m(M){let b=!1,y=d(M);y===null?g(a,o):y&&y.isColor&&(g(y,1),b=!0);let E=i.xr.getEnvironmentBlendMode();E==="additive"?e.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||b)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function x(M,b){let y=d(b);y&&(y.isCubeTexture||y.mapping===Tr)?(c===void 0&&(c=new Ut(new qt(1,1,1),new ln({name:"BackgroundCubeMaterial",uniforms:Di(kn.backgroundCube.uniforms),vertexShader:kn.backgroundCube.vertexShader,fragmentShader:kn.backgroundCube.fragmentShader,side:Ve,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(E,T,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(hg.makeRotationFromEuler(b.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(bd),c.material.toneMapped=ne.getTransfer(y.colorSpace)!==de,(u!==y||f!==y.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=y,f=y.version,h=i.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new Ut(new De(2,2),new ln({name:"BackgroundMaterial",uniforms:Di(kn.background.uniforms),vertexShader:kn.background.vertexShader,fragmentShader:kn.background.fragmentShader,side:gi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,l.material.toneMapped=ne.getTransfer(y.colorSpace)!==de,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(u!==y||f!==y.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=y,f=y.version,h=i.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null))}function g(M,b){M.getRGB(jo,Vc(i)),e.buffers.color.setClear(jo.r,jo.g,jo.b,b,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,b=1){a.set(M),o=b,g(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(M){o=M,g(a,o)},render:m,addToRenderList:x,dispose:p}}function dg(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null),r=s,a=!1;function o(L,B,H,U,k){let Z=!1,Y=f(L,U,H,B);r!==Y&&(r=Y,c(r.object)),Z=d(L,U,H,k),Z&&m(L,U,H,k),k!==null&&t.update(k,i.ELEMENT_ARRAY_BUFFER),(Z||a)&&(a=!1,y(L,B,H,U),k!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(k).buffer))}function l(){return i.createVertexArray()}function c(L){return i.bindVertexArray(L)}function u(L){return i.deleteVertexArray(L)}function f(L,B,H,U){let k=U.wireframe===!0,Z=n[B.id];Z===void 0&&(Z={},n[B.id]=Z);let Y=L.isInstancedMesh===!0?L.id:0,st=Z[Y];st===void 0&&(st={},Z[Y]=st);let $=st[H.id];$===void 0&&($={},st[H.id]=$);let tt=$[k];return tt===void 0&&(tt=h(l()),$[k]=tt),tt}function h(L){let B=[],H=[],U=[];for(let k=0;k<e;k++)B[k]=0,H[k]=0,U[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:B,enabledAttributes:H,attributeDivisors:U,object:L,attributes:{},index:null}}function d(L,B,H,U){let k=r.attributes,Z=B.attributes,Y=0,st=H.getAttributes();for(let $ in st)if(st[$].location>=0){let nt=k[$],It=Z[$];if(It===void 0&&($==="instanceMatrix"&&L.instanceMatrix&&(It=L.instanceMatrix),$==="instanceColor"&&L.instanceColor&&(It=L.instanceColor)),nt===void 0||nt.attribute!==It||It&&nt.data!==It.data)return!0;Y++}return r.attributesNum!==Y||r.index!==U}function m(L,B,H,U){let k={},Z=B.attributes,Y=0,st=H.getAttributes();for(let $ in st)if(st[$].location>=0){let nt=Z[$];nt===void 0&&($==="instanceMatrix"&&L.instanceMatrix&&(nt=L.instanceMatrix),$==="instanceColor"&&L.instanceColor&&(nt=L.instanceColor));let It={};It.attribute=nt,nt&&nt.data&&(It.data=nt.data),k[$]=It,Y++}r.attributes=k,r.attributesNum=Y,r.index=U}function x(){let L=r.newAttributes;for(let B=0,H=L.length;B<H;B++)L[B]=0}function g(L){p(L,0)}function p(L,B){let H=r.newAttributes,U=r.enabledAttributes,k=r.attributeDivisors;H[L]=1,U[L]===0&&(i.enableVertexAttribArray(L),U[L]=1),k[L]!==B&&(i.vertexAttribDivisor(L,B),k[L]=B)}function M(){let L=r.newAttributes,B=r.enabledAttributes;for(let H=0,U=B.length;H<U;H++)B[H]!==L[H]&&(i.disableVertexAttribArray(H),B[H]=0)}function b(L,B,H,U,k,Z,Y){Y===!0?i.vertexAttribIPointer(L,B,H,k,Z):i.vertexAttribPointer(L,B,H,U,k,Z)}function y(L,B,H,U){x();let k=U.attributes,Z=H.getAttributes(),Y=B.defaultAttributeValues;for(let st in Z){let $=Z[st];if($.location>=0){let tt=k[st];if(tt===void 0&&(st==="instanceMatrix"&&L.instanceMatrix&&(tt=L.instanceMatrix),st==="instanceColor"&&L.instanceColor&&(tt=L.instanceColor)),tt!==void 0){let nt=tt.normalized,It=tt.itemSize,rt=t.get(tt);if(rt===void 0)continue;let ie=rt.buffer,$t=rt.type,ee=rt.bytesPerElement,J=$t===i.INT||$t===i.UNSIGNED_INT||tt.gpuType===uo;if(tt.isInterleavedBufferAttribute){let et=tt.data,mt=et.stride,Bt=tt.offset;if(et.isInstancedInterleavedBuffer){for(let St=0;St<$.locationSize;St++)p($.location+St,et.meshPerAttribute);L.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=et.meshPerAttribute*et.count)}else for(let St=0;St<$.locationSize;St++)g($.location+St);i.bindBuffer(i.ARRAY_BUFFER,ie);for(let St=0;St<$.locationSize;St++)b($.location+St,It/$.locationSize,$t,nt,mt*ee,(Bt+It/$.locationSize*St)*ee,J)}else{if(tt.isInstancedBufferAttribute){for(let et=0;et<$.locationSize;et++)p($.location+et,tt.meshPerAttribute);L.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=tt.meshPerAttribute*tt.count)}else for(let et=0;et<$.locationSize;et++)g($.location+et);i.bindBuffer(i.ARRAY_BUFFER,ie);for(let et=0;et<$.locationSize;et++)b($.location+et,It/$.locationSize,$t,nt,It*ee,It/$.locationSize*et*ee,J)}}else if(Y!==void 0){let nt=Y[st];if(nt!==void 0)switch(nt.length){case 2:i.vertexAttrib2fv($.location,nt);break;case 3:i.vertexAttrib3fv($.location,nt);break;case 4:i.vertexAttrib4fv($.location,nt);break;default:i.vertexAttrib1fv($.location,nt)}}}}M()}function E(){w();for(let L in n){let B=n[L];for(let H in B){let U=B[H];for(let k in U){let Z=U[k];for(let Y in Z)u(Z[Y].object),delete Z[Y];delete U[k]}}delete n[L]}}function T(L){if(n[L.id]===void 0)return;let B=n[L.id];for(let H in B){let U=B[H];for(let k in U){let Z=U[k];for(let Y in Z)u(Z[Y].object),delete Z[Y];delete U[k]}}delete n[L.id]}function R(L){for(let B in n){let H=n[B];for(let U in H){let k=H[U];if(k[L.id]===void 0)continue;let Z=k[L.id];for(let Y in Z)u(Z[Y].object),delete Z[Y];delete k[L.id]}}}function v(L){for(let B in n){let H=n[B],U=L.isInstancedMesh===!0?L.id:0,k=H[U];if(k!==void 0){for(let Z in k){let Y=k[Z];for(let st in Y)u(Y[st].object),delete Y[st];delete k[Z]}delete H[U],Object.keys(H).length===0&&delete n[B]}}}function w(){C(),a=!0,r!==s&&(r=s,c(r.object))}function C(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:w,resetDefaultState:C,dispose:E,releaseStatesOfGeometry:T,releaseStatesOfObject:v,releaseStatesOfProgram:R,initAttributes:x,enableAttribute:g,disableUnusedAttributes:M}}function fg(i,t,e){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),e.update(c,n,1)}function a(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),e.update(c,n,u))}function o(l,c,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let h=0;for(let d=0;d<u;d++)h+=c[d];e.update(h,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function pg(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let R=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(R){return!(R!==mn&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){let v=R===wn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(R!==sn&&R!==pn&&!v&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(R){if(R==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",u=l(c);u!==c&&(zt("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let f=e.logarithmicDepthBuffer===!0,h=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&h===!1&&zt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),m=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),b=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),E=i.getParameter(i.MAX_SAMPLES),T=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:f,reversedDepthBuffer:h,maxTextures:d,maxVertexTextures:m,maxTextureSize:x,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:M,maxVaryings:b,maxFragmentUniforms:y,maxSamples:E,samples:T}}function mg(i){let t=this,e=null,n=0,s=!1,r=!1,a=new Mn,o=new Xt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,h){let d=f.length!==0||h||n!==0||s;return s=h,n=f.length,d},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,h){e=u(f,h,0)},this.setState=function(f,h,d){let m=f.clippingPlanes,x=f.clipIntersection,g=f.clipShadows,p=i.get(f);if(!s||m===null||m.length===0||r&&!g)r?u(null):c();else{let M=r?0:n,b=M*4,y=p.clippingState||null;l.value=y,y=u(m,h,b,d);for(let E=0;E!==b;++E)y[E]=e[E];p.clippingState=y,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(f,h,d,m){let x=f!==null?f.length:0,g=null;if(x!==0){if(g=l.value,m!==!0||g===null){let p=d+x*4,M=h.matrixWorldInverse;o.getNormalMatrix(M),(g===null||g.length<p)&&(g=new Float32Array(p));for(let b=0,y=d;b!==x;++b,y+=4)a.copy(f[b]).applyMatrix4(M,o),a.normal.toArray(g,y),g[y+3]=a.constant}l.value=g,l.needsUpdate=!0}return t.numPlanes=x,t.numIntersection=0,g}}var Ms=4,gg=6,xg=20,_g=256,Dr=new ps,ed=new At,Yc=null,Zc=0,$c=0,Jc=!1,vg=new N,Ni=new N,tl=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){let{size:a=256,position:o=vg}=r;Yc=this._renderer.getRenderTarget(),Zc=this._renderer.getActiveCubeFace(),$c=this._renderer.getActiveMipmapLevel(),Jc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,s,l,o),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=sd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=id(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Yc,Zc,$c),this._renderer.xr.enabled=Jc,t.scissorTest=!1,ys(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===xi||t.mapping===Li?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Yc=this._renderer.getRenderTarget(),Zc=this._renderer.getActiveCubeFace(),$c=this._renderer.getActiveMipmapLevel(),Jc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Ge,minFilter:Ge,generateMipmaps:!1,type:wn,format:mn,colorSpace:Gs,depthBuffer:!1},s=nd(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=nd(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=yg(r)),this._blurMaterial=Sg(r,t,e),this._ggxMaterial=Mg(r,t,e)}return s}_compileMaterial(t){let e=new Ut(new Le,t);this._renderer.compile(e,Dr)}_sceneToCubeUV(t,e,n,s,r){let l=new He(90,1,e,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],f=this._renderer,h=f.autoClear,d=f.toneMapping;f.getClearColor(ed),f.toneMapping=En,f.autoClear=!1,f.state.buffers.depth.getReversed()&&(f.setRenderTarget(s),f.clearDepth(),f.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Ut(new qt,new we({name:"PMREM.Background",side:Ve,depthWrite:!1,depthTest:!1})));let x=this._backgroundBox,g=x.material,p=!1,M=t.background;M?M.isColor&&(g.color.copy(M),t.background=null,p=!0):(g.color.copy(ed),p=!0);for(let b=0;b<6;b++){let y=b%3;y===0?(l.up.set(0,c[b],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[b],r.y,r.z)):y===1?(l.up.set(0,0,c[b]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[b],r.z)):(l.up.set(0,c[b],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[b]));let E=this._cubeSize;ys(s,y*E,b>2?E:0,E,E),f.setRenderTarget(s),p&&f.render(x,l),f.render(t,l)}f.toneMapping=d,f.autoClear=h,t.background=M}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===xi||t.mapping===Li;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=sd()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=id());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=t;let l=this._cubeSize;ys(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,Dr)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),u=e/(this._lodMeshes.length-1),f=Math.sqrt(c*c-u*u),h=c*1.25,d=f*h,{_lodMax:m}=this,x=this._sizeLods[n],g=3*x*(n>m-Ms?n-m+Ms:0),p=4*(this._cubeSize-x);l.envMap.value=t.texture,l.roughness.value=d,l.mipInt.value=m-e,ys(r,g,p,3*x,2*x),s.setRenderTarget(r),s.render(o,Dr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=m-n,ys(t,g,p,3*x,2*x),s.setRenderTarget(t),s.render(o,Dr)}_blur(t,e,n,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,n,a),this._blurPass(r,t,n,n,a)}_blurPass(t,e,n,s,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=t.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let u=this._sizeLods[s],f=3*u*(s>this._lodMax-Ms?s-this._lodMax+Ms:0),h=4*(this._cubeSize-u);ys(e,f,h,3*u,2*u),a.setRenderTarget(e),a.render(l,Dr)}};function yg(i){let t=[],e=[],n=i,s=i-Ms+1+gg;for(let r=0;r<s;r++){let a=Math.pow(2,n);t.push(a);let o=1/(a-2),l=-o,c=1+o,u=[l,l,c,l,c,c,l,l,c,c,l,c],f=6,h=6,d=3,m=new Float32Array(d*h*f),x=new Float32Array(d*h*f);for(let p=0;p<f;p++){let M=p%3*2/3-1,b=p>2?0:-1,y=[M,b,0,M+2/3,b,0,M+2/3,b+1,0,M,b,0,M+2/3,b+1,0,M,b+1,0];m.set(y,d*h*p);for(let E=0;E<h;E++){let T=u[E*2]*2-1,R=u[E*2+1]*2-1;p===0?Ni.set(1,R,T):p===1?Ni.set(-T,1,-R):p===2?Ni.set(-T,R,1):p===3?Ni.set(-1,R,-T):p===4?Ni.set(-T,-1,R):Ni.set(T,R,-1),Ni.toArray(x,(p*h+E)*d)}}let g=new Le;g.setAttribute("position",new Ke(m,d)),g.setAttribute("outputDirection",new Ke(x,d)),e.push(new Ut(g,null)),n>Ms&&n--}return{lodMeshes:e,sizeLods:t}}function nd(i,t,e){let n=new nn(i,t,e);return n.texture.mapping=Tr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ys(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Mg(i,t,e){return new ln({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:_g,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:nl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Bn,depthTest:!1,depthWrite:!1})}function Sg(i,t,e){return new ln({name:"SphericalGaussianBlur",defines:{SAMPLES:xg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:nl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:Bn,depthTest:!1,depthWrite:!1})}function id(){return new ln({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:nl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Bn,depthTest:!1,depthWrite:!1})}function sd(){return new ln({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:nl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Bn,depthTest:!1,depthWrite:!1})}function nl(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var el=class extends nn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new nr(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new qt(5,5,5),r=new ln({name:"CubemapFromEquirect",uniforms:Di(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ve,blending:Bn});r.uniforms.tEquirect.value=e;let a=new Ut(s,r),o=e.minFilter;return e.minFilter===_i&&(e.minFilter=Ge),new ao(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}};function bg(i){let t=new WeakMap,e=new WeakMap,n=null;function s(h,d=!1){return h==null?null:d?a(h):r(h)}function r(h){if(h&&h.isTexture){let d=h.mapping;if(d===lo||d===co)if(t.has(h)){let m=t.get(h).texture;return o(m,h.mapping)}else{let m=h.image;if(m&&m.height>0){let x=new el(m.height);return x.fromEquirectangularTexture(i,h),t.set(h,x),h.addEventListener("dispose",c),o(x.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture){let d=h.mapping,m=d===lo||d===co,x=d===xi||d===Li;if(m||x){let g=e.get(h),p=g!==void 0?g.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==p)return n===null&&(n=new tl(i)),g=m?n.fromEquirectangular(h,g):n.fromCubemap(h,g),g.texture.pmremVersion=h.pmremVersion,e.set(h,g),g.texture;if(g!==void 0)return g.texture;{let M=h.image;return m&&M&&M.height>0||x&&M&&l(M)?(n===null&&(n=new tl(i)),g=m?n.fromEquirectangular(h):n.fromCubemap(h),g.texture.pmremVersion=h.pmremVersion,e.set(h,g),h.addEventListener("dispose",u),g.texture):null}}}return h}function o(h,d){return d===lo?h.mapping=xi:d===co&&(h.mapping=Li),h}function l(h){let d=0,m=6;for(let x=0;x<m;x++)h[x]!==void 0&&d++;return d===m}function c(h){let d=h.target;d.removeEventListener("dispose",c);let m=t.get(d);m!==void 0&&(t.delete(d),m.dispose())}function u(h){let d=h.target;d.removeEventListener("dispose",u);let m=e.get(d);m!==void 0&&(e.delete(d),m.dispose())}function f(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:f}}function Eg(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&Ci("WebGLRenderer: "+n+" extension not supported."),s}}}function Tg(i,t,e,n){let s={},r=new WeakMap;function a(f){let h=f.target;h.index!==null&&t.remove(h.index);for(let m in h.attributes)t.remove(h.attributes[m]);h.removeEventListener("dispose",a),delete s[h.id];let d=r.get(h);d&&(t.remove(d),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,e.memory.geometries--}function o(f,h){return s[h.id]===!0||(h.addEventListener("dispose",a),s[h.id]=!0,e.memory.geometries++),h}function l(f){let h=f.attributes;for(let d in h)t.update(h[d],i.ARRAY_BUFFER)}function c(f){let h=[],d=f.index,m=f.attributes.position,x=0;if(m===void 0)return;if(d!==null){let M=d.array;x=d.version;for(let b=0,y=M.length;b<y;b+=3){let E=M[b+0],T=M[b+1],R=M[b+2];h.push(E,T,T,R,R,E)}}else{let M=m.array;x=m.version;for(let b=0,y=M.length/3-1;b<y;b+=3){let E=b+0,T=b+1,R=b+2;h.push(E,T,T,R,R,E)}}let g=new(m.count>=65535?Ks:Js)(h,1);g.version=x;let p=r.get(f);p&&t.remove(p),r.set(f,g)}function u(f){let h=r.get(f);if(h){let d=f.index;d!==null&&h.version<d.version&&c(f)}else c(f);return r.get(f)}return{get:o,update:l,getWireframeAttribute:u}}function wg(i,t,e){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,h){i.drawElements(n,h,r,f*a),e.update(h,n,1)}function c(f,h,d){d!==0&&(i.drawElementsInstanced(n,h,r,f*a,d),e.update(h,n,d))}function u(f,h,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,f,0,d);let x=0;for(let g=0;g<d;g++)x+=h[g];e.update(x,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function Ag(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:Gt("WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Rg(i,t,e){let n=new WeakMap,s=new be;function r(a,o,l){let c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=u!==void 0?u.length:0,h=n.get(o);if(h===void 0||h.count!==f){let w=function(){R.dispose(),n.delete(o),o.removeEventListener("dispose",w)};h!==void 0&&h.texture.dispose();let d=o.morphAttributes.position!==void 0,m=o.morphAttributes.normal!==void 0,x=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],M=o.morphAttributes.color||[],b=0;d===!0&&(b=1),m===!0&&(b=2),x===!0&&(b=3);let y=o.attributes.position.count*b,E=1;y>t.maxTextureSize&&(E=Math.ceil(y/t.maxTextureSize),y=t.maxTextureSize);let T=new Float32Array(y*E*4*f),R=new qs(T,y,E,f);R.type=pn,R.needsUpdate=!0;let v=b*4;for(let C=0;C<f;C++){let L=g[C],B=p[C],H=M[C],U=y*E*4*C;for(let k=0;k<L.count;k++){let Z=k*v;d===!0&&(s.fromBufferAttribute(L,k),T[U+Z+0]=s.x,T[U+Z+1]=s.y,T[U+Z+2]=s.z,T[U+Z+3]=0),m===!0&&(s.fromBufferAttribute(B,k),T[U+Z+4]=s.x,T[U+Z+5]=s.y,T[U+Z+6]=s.z,T[U+Z+7]=0),x===!0&&(s.fromBufferAttribute(H,k),T[U+Z+8]=s.x,T[U+Z+9]=s.y,T[U+Z+10]=s.z,T[U+Z+11]=H.itemSize===4?s.w:1)}}h={count:f,texture:R,size:new dt(y,E)},n.set(o,h),o.addEventListener("dispose",w)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let d=0;for(let x=0;x<c.length;x++)d+=c[x];let m=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(i,"morphTargetBaseInfluence",m),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function Cg(i,t,e,n,s){let r=new WeakMap;function a(c){let u=s.render.frame,f=c.geometry,h=t.get(c,f);if(r.get(h)!==u&&(t.update(h),r.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(e.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){let d=c.skeleton;r.get(d)!==u&&(d.update(),r.set(d,u))}return h}function o(){r=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),e.remove(u.instanceMatrix),u.instanceColor!==null&&e.remove(u.instanceColor)}return{update:a,dispose:o}}var Ig={[wc]:"LINEAR_TONE_MAPPING",[Ac]:"REINHARD_TONE_MAPPING",[Rc]:"CINEON_TONE_MAPPING",[Cc]:"ACES_FILMIC_TONE_MAPPING",[Pc]:"AGX_TONE_MAPPING",[Lc]:"NEUTRAL_TONE_MAPPING",[Ic]:"CUSTOM_TONE_MAPPING"};function Pg(i,t,e,n,s,r){let a=new nn(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Le;c.setAttribute("position",new se([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new se([0,2,0,0,2,0],2));let u=new Ya({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new Ut(c,u),h=new ps(-1,1,1,-1,0,1),d=null,m=null,x=!1,g,p=null,M=[],b=!1;this.setSize=function(y,E){a.setSize(y,E),o!==null&&o.setSize(y,E),l!==null&&l.setSize(y,E);for(let T=0;T<M.length;T++){let R=M[T];R.setSize&&R.setSize(y,E)}},this.setEffects=function(y){M=y,b=M.length>0&&M[0].isRenderPass===!0;let E=a.width,T=a.height;M.length>0&&o===null&&(o=new nn(E,T,{type:wn,depthBuffer:!1,stencilBuffer:!1}),l=new nn(E,T,{type:wn,depthBuffer:!1,stencilBuffer:!1}));for(let R=0;R<M.length;R++){let v=M[R];v.setSize&&v.setSize(E,T)}},this.begin=function(y,E){if(x||y.toneMapping===En&&M.length===0)return!1;if(p=E,E!==null){let T=E.width,R=E.height;(a.width!==T||a.height!==R)&&this.setSize(T,R)}return b===!1&&y.setRenderTarget(a),g=y.toneMapping,y.toneMapping=En,!0},this.hasRenderPass=function(){return b},this.end=function(y,E){y.toneMapping=g,x=!0;let T=a,R=o;for(let v=0;v<M.length;v++){let w=M[v];w.enabled!==!1&&(w.render(y,R,T,E),w.needsSwap!==!1&&(T=R,R=R===o?l:o))}if(d!==y.outputColorSpace||m!==y.toneMapping){d=y.outputColorSpace,m=y.toneMapping,u.defines={},ne.getTransfer(d)===de&&(u.defines.SRGB_TRANSFER="");let v=Ig[m];v&&(u.defines[v]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=T.texture,y.setRenderTarget(p),y.render(f,h),p=null,x=!1},this.isCompositing=function(){return x},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),u.dispose()}}var Ed=new je,Qc=new di(1,1),Td=new qs,wd=new Ua,Ad=new nr,rd=[],ad=[],od=new Float32Array(16),ld=new Float32Array(9),cd=new Float32Array(4);function bs(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=rd[s];if(r===void 0&&(r=new Float32Array(s),rd[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function Ue(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Fe(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function il(i,t){let e=ad[t];e===void 0&&(e=new Int32Array(t),ad[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Lg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Dg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ue(e,t))return;i.uniform2fv(this.addr,t),Fe(e,t)}}function Ng(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ue(e,t))return;i.uniform3fv(this.addr,t),Fe(e,t)}}function Ug(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ue(e,t))return;i.uniform4fv(this.addr,t),Fe(e,t)}}function Fg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ue(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Fe(e,t)}else{if(Ue(e,n))return;cd.set(n),i.uniformMatrix2fv(this.addr,!1,cd),Fe(e,n)}}function Og(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ue(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Fe(e,t)}else{if(Ue(e,n))return;ld.set(n),i.uniformMatrix3fv(this.addr,!1,ld),Fe(e,n)}}function Bg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ue(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Fe(e,t)}else{if(Ue(e,n))return;od.set(n),i.uniformMatrix4fv(this.addr,!1,od),Fe(e,n)}}function zg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function kg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ue(e,t))return;i.uniform2iv(this.addr,t),Fe(e,t)}}function Hg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ue(e,t))return;i.uniform3iv(this.addr,t),Fe(e,t)}}function Gg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ue(e,t))return;i.uniform4iv(this.addr,t),Fe(e,t)}}function Vg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function Wg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ue(e,t))return;i.uniform2uiv(this.addr,t),Fe(e,t)}}function Xg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ue(e,t))return;i.uniform3uiv(this.addr,t),Fe(e,t)}}function qg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ue(e,t))return;i.uniform4uiv(this.addr,t),Fe(e,t)}}function Yg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Qc.compareFunction=e.isReversedDepthBuffer()?Ko:Jo,r=Qc):r=Ed,e.setTexture2D(t||r,s)}function Zg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||wd,s)}function $g(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Ad,s)}function Jg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Td,s)}function Kg(i){switch(i){case 5126:return Lg;case 35664:return Dg;case 35665:return Ng;case 35666:return Ug;case 35674:return Fg;case 35675:return Og;case 35676:return Bg;case 5124:case 35670:return zg;case 35667:case 35671:return kg;case 35668:case 35672:return Hg;case 35669:case 35673:return Gg;case 5125:return Vg;case 36294:return Wg;case 36295:return Xg;case 36296:return qg;case 35678:case 36198:case 36298:case 36306:case 35682:return Yg;case 35679:case 36299:case 36307:return Zg;case 35680:case 36300:case 36308:case 36293:return $g;case 36289:case 36303:case 36311:case 36292:return Jg}}function jg(i,t){i.uniform1fv(this.addr,t)}function Qg(i,t){let e=bs(t,this.size,2);i.uniform2fv(this.addr,e)}function tx(i,t){let e=bs(t,this.size,3);i.uniform3fv(this.addr,e)}function ex(i,t){let e=bs(t,this.size,4);i.uniform4fv(this.addr,e)}function nx(i,t){let e=bs(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function ix(i,t){let e=bs(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function sx(i,t){let e=bs(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function rx(i,t){i.uniform1iv(this.addr,t)}function ax(i,t){i.uniform2iv(this.addr,t)}function ox(i,t){i.uniform3iv(this.addr,t)}function lx(i,t){i.uniform4iv(this.addr,t)}function cx(i,t){i.uniform1uiv(this.addr,t)}function hx(i,t){i.uniform2uiv(this.addr,t)}function ux(i,t){i.uniform3uiv(this.addr,t)}function dx(i,t){i.uniform4uiv(this.addr,t)}function fx(i,t,e){let n=this.cache,s=t.length,r=il(e,s);Ue(n,r)||(i.uniform1iv(this.addr,r),Fe(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Qc:a=Ed;for(let o=0;o!==s;++o)e.setTexture2D(t[o]||a,r[o])}function px(i,t,e){let n=this.cache,s=t.length,r=il(e,s);Ue(n,r)||(i.uniform1iv(this.addr,r),Fe(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||wd,r[a])}function mx(i,t,e){let n=this.cache,s=t.length,r=il(e,s);Ue(n,r)||(i.uniform1iv(this.addr,r),Fe(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||Ad,r[a])}function gx(i,t,e){let n=this.cache,s=t.length,r=il(e,s);Ue(n,r)||(i.uniform1iv(this.addr,r),Fe(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||Td,r[a])}function xx(i){switch(i){case 5126:return jg;case 35664:return Qg;case 35665:return tx;case 35666:return ex;case 35674:return nx;case 35675:return ix;case 35676:return sx;case 5124:case 35670:return rx;case 35667:case 35671:return ax;case 35668:case 35672:return ox;case 35669:case 35673:return lx;case 5125:return cx;case 36294:return hx;case 36295:return ux;case 36296:return dx;case 35678:case 36198:case 36298:case 36306:case 35682:return fx;case 35679:case 36299:case 36307:return px;case 35680:case 36300:case 36308:case 36293:return mx;case 36289:case 36303:case 36311:case 36292:return gx}}var th=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Kg(e.type)}},eh=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=xx(e.type)}},nh=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(t,e[o.id],n)}}},Kc=/(\w+)(\])?(\[|\.)?/g;function hd(i,t){i.seq.push(t),i.map[t.id]=t}function _x(i,t,e){let n=i.name,s=n.length;for(Kc.lastIndex=0;;){let r=Kc.exec(n),a=Kc.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){hd(e,c===void 0?new th(o,i,t):new eh(o,i,t));break}else{let f=e.map[o];f===void 0&&(f=new nh(o),hd(e,f)),e=f}}}var Ss=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=t.getActiveUniform(e,a),l=t.getUniformLocation(e,o.name);_x(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){let o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&n.push(a)}return n}};function ud(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var vx=37297,yx=0;function Mx(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}var dd=new Xt;function Sx(i){ne._getMatrix(dd,ne.workingColorSpace,i);let t=`mat3( ${dd.elements.map(e=>e.toFixed(4))} )`;switch(ne.getTransfer(i)){case Vs:return[t,"LinearTransferOETF"];case de:return[t,"sRGBTransferOETF"];default:return zt("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function fd(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+Mx(i.getShaderSource(t),o)}else return r}function bx(i,t){let e=Sx(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var Ex={[wc]:"Linear",[Ac]:"Reinhard",[Rc]:"Cineon",[Cc]:"ACESFilmic",[Pc]:"AgX",[Lc]:"Neutral",[Ic]:"Custom"};function Tx(i,t){let e=Ex[t];return e===void 0?(zt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var Qo=new N;function wx(){ne.getLuminanceCoefficients(Qo);let i=Qo.x.toFixed(4),t=Qo.y.toFixed(4),e=Qo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Ax(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ur).join(`
`)}function Rx(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Cx(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function Ur(i){return i!==""}function pd(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function md(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Ix=/^[ \t]*#include +<([\w\d./]+)>/gm;function ih(i){return i.replace(Ix,Lx)}var Px=new Map;function Lx(i,t){let e=Kt[t];if(e===void 0){let n=Px.get(t);if(n!==void 0)e=Kt[n],zt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return ih(e)}var Dx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function gd(i){return i.replace(Dx,Nx)}function Nx(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function xd(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var Ux={[Er]:"SHADOWMAP_TYPE_PCF",[ms]:"SHADOWMAP_TYPE_VSM"};function Fx(i){return Ux[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Ox={[xi]:"ENVMAP_TYPE_CUBE",[Li]:"ENVMAP_TYPE_CUBE",[Tr]:"ENVMAP_TYPE_CUBE_UV"};function Bx(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":Ox[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var zx={[Li]:"ENVMAP_MODE_REFRACTION"};function kx(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":zx[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Hx={[Tc]:"ENVMAP_BLENDING_MULTIPLY",[Iu]:"ENVMAP_BLENDING_MIX",[Pu]:"ENVMAP_BLENDING_ADD"};function Gx(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Hx[i.combine]||"ENVMAP_BLENDING_NONE"}function Vx(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function Wx(i,t,e,n){let s=i.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,l=Fx(e),c=Bx(e),u=kx(e),f=Gx(e),h=Vx(e),d=Ax(e),m=Rx(r),x=s.createProgram(),g,p,M=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(Ur).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(Ur).join(`
`),p.length>0&&(p+=`
`)):(g=[xd(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ur).join(`
`),p=[xd(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+u:"",e.envMap?"#define "+f:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==En?"#define TONE_MAPPING":"",e.toneMapping!==En?Kt.tonemapping_pars_fragment:"",e.toneMapping!==En?Tx("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Kt.colorspace_pars_fragment,bx("linearToOutputTexel",e.outputColorSpace),wx(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Ur).join(`
`)),a=ih(a),a=pd(a,e),a=md(a,e),o=ih(o),o=pd(o,e),o=md(o,e),a=gd(a),o=gd(o),e.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,g=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",e.glslVersion===kc?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===kc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let b=M+g+a,y=M+p+o,E=ud(s,s.VERTEX_SHADER,b),T=ud(s,s.FRAGMENT_SHADER,y);s.attachShader(x,E),s.attachShader(x,T),e.index0AttributeName!==void 0?s.bindAttribLocation(x,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function R(L){if(i.debug.checkShaderErrors){let B=s.getProgramInfoLog(x)||"",H=s.getShaderInfoLog(E)||"",U=s.getShaderInfoLog(T)||"",k=B.trim(),Z=H.trim(),Y=U.trim(),st=!0,$=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(st=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,x,E,T);else{let tt=fd(s,E,"vertex"),nt=fd(s,T,"fragment");Gt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+k+`
`+tt+`
`+nt)}else k!==""?zt("WebGLProgram: Program Info Log:",k):(Z===""||Y==="")&&($=!1);$&&(L.diagnostics={runnable:st,programLog:k,vertexShader:{log:Z,prefix:g},fragmentShader:{log:Y,prefix:p}})}s.deleteShader(E),s.deleteShader(T),v=new Ss(s,x),w=Cx(s,x)}let v;this.getUniforms=function(){return v===void 0&&R(this),v};let w;this.getAttributes=function(){return w===void 0&&R(this),w};let C=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=s.getProgramParameter(x,vx)),C},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=yx++,this.cacheKey=t,this.usedTimes=1,this.program=x,this.vertexShader=E,this.fragmentShader=T,this}var Xx=0,sh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new rh(t),e.set(t,n)),n}},rh=class{constructor(t){this.id=Xx++,this.code=t,this.usedTimes=0}};function qx(i){return i===yi||i===Pr||i===Lr}function Yx(i,t,e,n,s,r){let a=new Ys,o=new sh,l=new Set,c=[],u=new Map,f=n.logarithmicDepthBuffer,h=n.precision,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(v){return l.add(v),v===0?"uv":`uv${v}`}function x(v,w,C,L,B,H){let U=L.fog,k=B.geometry,Z=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?L.environment:null,Y=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,st=t.get(v.envMap||Z,Y),$=st&&st.mapping===Tr?st.image.height:null,tt=d[v.type];v.precision!==null&&(h=n.getMaxPrecision(v.precision),h!==v.precision&&zt("WebGLProgram.getParameters:",v.precision,"not supported, using",h,"instead."));let nt=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,It=nt!==void 0?nt.length:0,rt=0;k.morphAttributes.position!==void 0&&(rt=1),k.morphAttributes.normal!==void 0&&(rt=2),k.morphAttributes.color!==void 0&&(rt=3);let ie,$t,ee,J;if(tt){let xe=kn[tt];ie=xe.vertexShader,$t=xe.fragmentShader}else{ie=v.vertexShader,$t=v.fragmentShader;let xe=o.getVertexShaderStage(v),he=o.getFragmentShaderStage(v);o.update(v,xe,he),ee=xe.id,J=he.id}let et=i.getRenderTarget(),mt=i.state.buffers.depth.getReversed(),Bt=B.isInstancedMesh===!0,St=B.isBatchedMesh===!0,Ht=!!v.map,oe=!!v.matcap,K=!!st,ot=!!v.aoMap,lt=!!v.lightMap,ct=!!v.bumpMap&&v.wireframe===!1,pt=!!v.normalMap,Ft=!!v.displacementMap,Dt=!!v.emissiveMap,kt=!!v.metalnessMap,Wt=!!v.roughnessMap,D=v.anisotropy>0,le=v.clearcoat>0,Qt=v.dispersion>0,A=v.retroreflectivity>0,_=v.iridescence>0,I=v.sheen>0,P=v.transmission>0,z=D&&!!v.anisotropyMap,j=le&&!!v.clearcoatMap,it=le&&!!v.clearcoatNormalMap,W=le&&!!v.clearcoatRoughnessMap,X=_&&!!v.iridescenceMap,ht=_&&!!v.iridescenceThicknessMap,vt=I&&!!v.sheenColorMap,ft=I&&!!v.sheenRoughnessMap,ut=!!v.specularMap,Et=!!v.specularColorMap,Ot=!!v.specularIntensityMap,Zt=P&&!!v.transmissionMap,O=P&&!!v.thicknessMap,gt=!!v.gradientMap,Q=!!v.alphaMap,xt=v.alphaTest>0,bt=!!v.alphaHash,at=!!v.extensions,Nt=En;v.toneMapped&&(et===null||et.isXRRenderTarget===!0)&&(Nt=i.toneMapping);let Pt={shaderID:tt,shaderType:v.type,shaderName:v.name,vertexShader:ie,fragmentShader:$t,defines:v.defines,customVertexShaderID:ee,customFragmentShaderID:J,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:h,batching:St,batchingColor:St&&B._colorsTexture!==null,instancing:Bt,instancingColor:Bt&&B.instanceColor!==null,instancingMorph:Bt&&B.morphTexture!==null,outputColorSpace:et===null?i.outputColorSpace:et.isXRRenderTarget===!0?et.texture.colorSpace:ne.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:Ht,matcap:oe,envMap:K,envMapMode:K&&st.mapping,envMapCubeUVHeight:$,aoMap:ot,lightMap:lt,bumpMap:ct,normalMap:pt,displacementMap:Ft,emissiveMap:Dt,normalMapObjectSpace:pt&&v.normalMapType===Nu,normalMapTangentSpace:pt&&v.normalMapType===$o,packedNormalMap:pt&&v.normalMapType===$o&&qx(v.normalMap.format),metalnessMap:kt,roughnessMap:Wt,anisotropy:D,anisotropyMap:z,clearcoat:le,clearcoatMap:j,clearcoatNormalMap:it,clearcoatRoughnessMap:W,dispersion:Qt,retroreflection:A,iridescence:_,iridescenceMap:X,iridescenceThicknessMap:ht,sheen:I,sheenColorMap:vt,sheenRoughnessMap:ft,specularMap:ut,specularColorMap:Et,specularIntensityMap:Ot,transmission:P,transmissionMap:Zt,thicknessMap:O,gradientMap:gt,opaque:v.transparent===!1&&v.blending===gs&&v.alphaToCoverage===!1,alphaMap:Q,alphaTest:xt,alphaHash:bt,combine:v.combine,mapUv:Ht&&m(v.map.channel),aoMapUv:ot&&m(v.aoMap.channel),lightMapUv:lt&&m(v.lightMap.channel),bumpMapUv:ct&&m(v.bumpMap.channel),normalMapUv:pt&&m(v.normalMap.channel),displacementMapUv:Ft&&m(v.displacementMap.channel),emissiveMapUv:Dt&&m(v.emissiveMap.channel),metalnessMapUv:kt&&m(v.metalnessMap.channel),roughnessMapUv:Wt&&m(v.roughnessMap.channel),anisotropyMapUv:z&&m(v.anisotropyMap.channel),clearcoatMapUv:j&&m(v.clearcoatMap.channel),clearcoatNormalMapUv:it&&m(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:W&&m(v.clearcoatRoughnessMap.channel),iridescenceMapUv:X&&m(v.iridescenceMap.channel),iridescenceThicknessMapUv:ht&&m(v.iridescenceThicknessMap.channel),sheenColorMapUv:vt&&m(v.sheenColorMap.channel),sheenRoughnessMapUv:ft&&m(v.sheenRoughnessMap.channel),specularMapUv:ut&&m(v.specularMap.channel),specularColorMapUv:Et&&m(v.specularColorMap.channel),specularIntensityMapUv:Ot&&m(v.specularIntensityMap.channel),transmissionMapUv:Zt&&m(v.transmissionMap.channel),thicknessMapUv:O&&m(v.thicknessMap.channel),alphaMapUv:Q&&m(v.alphaMap.channel),vertexTangents:!!k.attributes.tangent&&(pt||D),vertexNormals:!!k.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!k.attributes.uv&&(Ht||Q),fog:!!U,useFog:v.fog===!0,fogExp2:!!U&&U.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||k.attributes.normal===void 0&&pt===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:mt,skinning:B.isSkinnedMesh===!0,hasPositionAttribute:k.attributes.position!==void 0,morphTargets:k.morphAttributes.position!==void 0,morphNormals:k.morphAttributes.normal!==void 0,morphColors:k.morphAttributes.color!==void 0,morphTargetsCount:It,morphTextureStride:rt,numSunLights:w.sun.length,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numSunLightShadows:w.sunShadowMap.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numLightProbeGrids:H.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:v.dithering,shadowMapEnabled:i.shadowMap.enabled&&C.length>0,shadowMapType:i.shadowMap.type,toneMapping:Nt,decodeVideoTexture:Ht&&v.map.isVideoTexture===!0&&ne.getTransfer(v.map.colorSpace)===de,decodeVideoTextureEmissive:Dt&&v.emissiveMap.isVideoTexture===!0&&ne.getTransfer(v.emissiveMap.colorSpace)===de,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===Qe,flipSided:v.side===Ve,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:at&&v.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(at&&v.extensions.multiDraw===!0||St)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return Pt.vertexUv1s=l.has(1),Pt.vertexUv2s=l.has(2),Pt.vertexUv3s=l.has(3),l.clear(),Pt}function g(v){let w=[];if(v.shaderID?w.push(v.shaderID):(w.push(v.customVertexShaderID),w.push(v.customFragmentShaderID)),v.defines!==void 0)for(let C in v.defines)w.push(C),w.push(v.defines[C]);return v.isRawShaderMaterial===!1&&(p(w,v),M(w,v),w.push(i.outputColorSpace)),w.push(v.customProgramCacheKey),w.join()}function p(v,w){v.push(w.precision),v.push(w.outputColorSpace),v.push(w.envMapMode),v.push(w.envMapCubeUVHeight),v.push(w.mapUv),v.push(w.alphaMapUv),v.push(w.lightMapUv),v.push(w.aoMapUv),v.push(w.bumpMapUv),v.push(w.normalMapUv),v.push(w.displacementMapUv),v.push(w.emissiveMapUv),v.push(w.metalnessMapUv),v.push(w.roughnessMapUv),v.push(w.anisotropyMapUv),v.push(w.clearcoatMapUv),v.push(w.clearcoatNormalMapUv),v.push(w.clearcoatRoughnessMapUv),v.push(w.iridescenceMapUv),v.push(w.iridescenceThicknessMapUv),v.push(w.sheenColorMapUv),v.push(w.sheenRoughnessMapUv),v.push(w.specularMapUv),v.push(w.specularColorMapUv),v.push(w.specularIntensityMapUv),v.push(w.transmissionMapUv),v.push(w.thicknessMapUv),v.push(w.combine),v.push(w.fogExp2),v.push(w.sizeAttenuation),v.push(w.morphTargetsCount),v.push(w.morphAttributeCount),v.push(w.numSunLights),v.push(w.numDirLights),v.push(w.numPointLights),v.push(w.numSpotLights),v.push(w.numSpotLightMaps),v.push(w.numHemiLights),v.push(w.numRectAreaLights),v.push(w.numSunLightShadows),v.push(w.numDirLightShadows),v.push(w.numPointLightShadows),v.push(w.numSpotLightShadows),v.push(w.numSpotLightShadowsWithMaps),v.push(w.numLightProbes),v.push(w.shadowMapType),v.push(w.toneMapping),v.push(w.numClippingPlanes),v.push(w.numClipIntersection),v.push(w.depthPacking)}function M(v,w){a.disableAll(),w.instancing&&a.enable(0),w.instancingColor&&a.enable(1),w.instancingMorph&&a.enable(2),w.matcap&&a.enable(3),w.envMap&&a.enable(4),w.normalMapObjectSpace&&a.enable(5),w.normalMapTangentSpace&&a.enable(6),w.clearcoat&&a.enable(7),w.iridescence&&a.enable(8),w.alphaTest&&a.enable(9),w.vertexColors&&a.enable(10),w.vertexAlphas&&a.enable(11),w.vertexUv1s&&a.enable(12),w.vertexUv2s&&a.enable(13),w.vertexUv3s&&a.enable(14),w.vertexTangents&&a.enable(15),w.anisotropy&&a.enable(16),w.alphaHash&&a.enable(17),w.batching&&a.enable(18),w.dispersion&&a.enable(19),w.retroreflection&&a.enable(24),w.batchingColor&&a.enable(20),w.gradientMap&&a.enable(21),w.packedNormalMap&&a.enable(22),w.vertexNormals&&a.enable(23),v.push(a.mask),a.disableAll(),w.fog&&a.enable(0),w.useFog&&a.enable(1),w.flatShading&&a.enable(2),w.logarithmicDepthBuffer&&a.enable(3),w.reversedDepthBuffer&&a.enable(4),w.skinning&&a.enable(5),w.morphTargets&&a.enable(6),w.morphNormals&&a.enable(7),w.morphColors&&a.enable(8),w.premultipliedAlpha&&a.enable(9),w.shadowMapEnabled&&a.enable(10),w.doubleSided&&a.enable(11),w.flipSided&&a.enable(12),w.useDepthPacking&&a.enable(13),w.dithering&&a.enable(14),w.transmission&&a.enable(15),w.sheen&&a.enable(16),w.opaque&&a.enable(17),w.pointsUvs&&a.enable(18),w.decodeVideoTexture&&a.enable(19),w.decodeVideoTextureEmissive&&a.enable(20),w.alphaToCoverage&&a.enable(21),w.numLightProbeGrids>0&&a.enable(22),w.hasPositionAttribute&&a.enable(23),v.push(a.mask)}function b(v){let w=d[v.type],C;if(w){let L=kn[w];C=ju.clone(L.uniforms)}else C=v.uniforms;return C}function y(v,w){let C=u.get(w);return C!==void 0?++C.usedTimes:(C=new Wx(i,w,v,s),c.push(C),u.set(w,C)),C}function E(v){if(--v.usedTimes===0){let w=c.indexOf(v);c[w]=c[c.length-1],c.pop(),u.delete(v.cacheKey),v.destroy()}}function T(v){o.remove(v)}function R(){o.dispose()}return{getParameters:x,getProgramCacheKey:g,getUniforms:b,acquireProgram:y,releaseProgram:E,releaseShaderCache:T,programs:c,dispose:R}}function Zx(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function $x(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function _d(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function vd(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(h){let d=0;return h.isInstancedMesh&&(d+=2),h.isSkinnedMesh&&(d+=1),d}function o(h,d,m,x,g,p){let M=i[t];return M===void 0?(M={id:h.id,object:h,geometry:d,material:m,materialVariant:a(h),groupOrder:x,renderOrder:h.renderOrder,z:g,group:p},i[t]=M):(M.id=h.id,M.object=h,M.geometry=d,M.material=m,M.materialVariant=a(h),M.groupOrder=x,M.renderOrder=h.renderOrder,M.z=g,M.group=p),t++,M}function l(h,d,m,x,g,p,M){M.reversedDepth===!0&&(g=-g);let b=o(h,d,m,x,g,p);m.transmission>0?n.push(b):m.transparent===!0?s.push(b):e.push(b)}function c(h,d,m,x,g,p){let M=o(h,d,m,x,g,p);m.transmission>0?n.unshift(M):m.transparent===!0?s.unshift(M):e.unshift(M)}function u(h,d){e.length>1&&e.sort(h||$x),n.length>1&&n.sort(d||_d),s.length>1&&s.sort(d||_d)}function f(){for(let h=t,d=i.length;h<d;h++){let m=i[h];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:f,sort:u}}function Jx(){let i=new WeakMap;function t(n,s){let r=i.get(n),a;return r===void 0?(a=new vd,i.set(n,[a])):s>=r.length?(a=new vd,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function Kx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new N,color:new At};break;case"SpotLight":e={position:new N,direction:new N,color:new At,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new N,color:new At,distance:0,decay:0};break;case"HemisphereLight":e={direction:new N,skyColor:new At,groundColor:new At};break;case"RectAreaLight":e={color:new At,position:new N,halfWidth:new N,halfHeight:new N};break}return i[t.id]=e,e}}}function jx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new dt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new dt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new dt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var Qx=0;function t_(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function e_(i){let t=new Kx,e=jx(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new N);let s=new N,r=new fe,a=new fe;function o(c){let u=0,f=0,h=0;for(let B=0;B<9;B++)n.probe[B].set(0,0,0);let d=0,m=0,x=0,g=0,p=0,M=0,b=0,y=0,E=0,T=0,R=0,v=0,w=0,C=0;c.sort(t_);for(let B=0,H=c.length;B<H;B++){let U=c[B],k=U.color,Z=U.intensity,Y=U.distance,st=null;if(U.shadow&&U.shadow.map&&(U.shadow.map.texture.format===yi?st=U.shadow.map.texture:st=U.shadow.map.depthTexture||U.shadow.map.texture),U.isAmbientLight)u+=k.r*Z,f+=k.g*Z,h+=k.b*Z;else if(U.isLightProbe){for(let $=0;$<9;$++)n.probe[$].addScaledVector(U.sh.coefficients[$],Z);C++}else if(U.isSunLight){let $=t.get(U);if($.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){let tt=U.shadow,nt=e.get(U);nt.shadowIntensity=tt.intensity,nt.shadowBias=tt.bias,nt.shadowNormalBias=tt.normalBias,nt.shadowRadius=tt.radius,nt.shadowMapSize.copy(tt.mapSize).multiply(tt.getFrameExtents()),n.sunShadow[m]=nt,n.sunShadowMap[m]=st;let It=tt.getViewportCount();for(let rt=0;rt<It;rt++)n.sunShadowMatrix[x+rt]=tt.getMatrix(rt),n.sunShadowCascade[x+rt]=tt._cascadeData[rt];x+=It,m++}n.sun[d]=$,d++}else if(U.isDirectionalLight){let $=t.get(U);if($.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){let tt=U.shadow,nt=e.get(U);nt.shadowIntensity=tt.intensity,nt.shadowBias=tt.bias,nt.shadowNormalBias=tt.normalBias,nt.shadowRadius=tt.radius,nt.shadowMapSize=tt.mapSize,n.directionalShadow[g]=nt,n.directionalShadowMap[g]=st,n.directionalShadowMatrix[g]=U.shadow.matrix,E++}n.directional[g]=$,g++}else if(U.isSpotLight){let $=t.get(U);$.position.setFromMatrixPosition(U.matrixWorld),$.color.copy(k).multiplyScalar(Z),$.distance=Y,$.coneCos=Math.cos(U.angle),$.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),$.decay=U.decay,n.spot[M]=$;let tt=U.shadow;if(U.map&&(n.spotLightMap[v]=U.map,v++,tt.updateMatrices(U),U.castShadow&&w++),n.spotLightMatrix[M]=tt.matrix,U.castShadow){let nt=e.get(U);nt.shadowIntensity=tt.intensity,nt.shadowBias=tt.bias,nt.shadowNormalBias=tt.normalBias,nt.shadowRadius=tt.radius,nt.shadowMapSize=tt.mapSize,n.spotShadow[M]=nt,n.spotShadowMap[M]=st,R++}M++}else if(U.isRectAreaLight){let $=t.get(U);$.color.copy(k).multiplyScalar(Z),$.halfWidth.set(U.width*.5,0,0),$.halfHeight.set(0,U.height*.5,0),n.rectArea[b]=$,b++}else if(U.isPointLight){let $=t.get(U);if($.color.copy(U.color).multiplyScalar(U.intensity),$.distance=U.distance,$.decay=U.decay,U.castShadow){let tt=U.shadow,nt=e.get(U);nt.shadowIntensity=tt.intensity,nt.shadowBias=tt.bias,nt.shadowNormalBias=tt.normalBias,nt.shadowRadius=tt.radius,nt.shadowMapSize=tt.mapSize,nt.shadowCameraNear=tt.camera.near,nt.shadowCameraFar=tt.camera.far,n.pointShadow[p]=nt,n.pointShadowMap[p]=st,n.pointShadowMatrix[p]=U.shadow.matrix,T++}n.point[p]=$,p++}else if(U.isHemisphereLight){let $=t.get(U);$.skyColor.copy(U.color).multiplyScalar(Z),$.groundColor.copy(U.groundColor).multiplyScalar(Z),n.hemi[y]=$,y++}}b>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=_t.LTC_FLOAT_1,n.rectAreaLTC2=_t.LTC_FLOAT_2):(n.rectAreaLTC1=_t.LTC_HALF_1,n.rectAreaLTC2=_t.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=f,n.ambient[2]=h;let L=n.hash;(L.sunLength!==d||L.directionalLength!==g||L.pointLength!==p||L.spotLength!==M||L.rectAreaLength!==b||L.hemiLength!==y||L.numSunShadows!==m||L.numDirectionalShadows!==E||L.numPointShadows!==T||L.numSpotShadows!==R||L.numSpotMaps!==v||L.numLightProbes!==C)&&(n.sun.length=d,n.directional.length=g,n.spot.length=M,n.rectArea.length=b,n.point.length=p,n.hemi.length=y,n.sunShadow.length=m,n.sunShadowMap.length=m,n.sunShadowMatrix.length=x,n.sunShadowCascade.length=x,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.directionalShadowMatrix.length=E,n.pointShadow.length=T,n.pointShadowMap.length=T,n.pointShadowMatrix.length=T,n.spotShadow.length=R,n.spotShadowMap.length=R,n.spotLightMatrix.length=R+v-w,n.spotLightMap.length=v,n.numSpotLightShadowsWithMaps=w,n.numLightProbes=C,L.sunLength=d,L.directionalLength=g,L.pointLength=p,L.spotLength=M,L.rectAreaLength=b,L.hemiLength=y,L.numSunShadows=m,L.numDirectionalShadows=E,L.numPointShadows=T,L.numSpotShadows=R,L.numSpotMaps=v,L.numLightProbes=C,n.version=Qx++)}function l(c,u){let f=0,h=0,d=0,m=0,x=0,g=0,p=u.matrixWorldInverse;for(let M=0,b=c.length;M<b;M++){let y=c[M];if(y.isSunLight){let E=n.sun[f];E.direction.setFromMatrixPosition(y.matrixWorld),E.direction.transformDirection(p),f++}else if(y.isDirectionalLight){let E=n.directional[h];E.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),h++}else if(y.isSpotLight){let E=n.spot[m];E.position.setFromMatrixPosition(y.matrixWorld),E.position.applyMatrix4(p),E.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),m++}else if(y.isRectAreaLight){let E=n.rectArea[x];E.position.setFromMatrixPosition(y.matrixWorld),E.position.applyMatrix4(p),a.identity(),r.copy(y.matrixWorld),r.premultiply(p),a.extractRotation(r),E.halfWidth.set(y.width*.5,0,0),E.halfHeight.set(0,y.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),x++}else if(y.isPointLight){let E=n.point[d];E.position.setFromMatrixPosition(y.matrixWorld),E.position.applyMatrix4(p),d++}else if(y.isHemisphereLight){let E=n.hemi[g];E.direction.setFromMatrixPosition(y.matrixWorld),E.direction.transformDirection(p),g++}}}return{setup:o,setupView:l,state:n}}function yd(i){let t=new e_(i),e=[],n=[],s=[];function r(h){f.camera=h,e.length=0,n.length=0,s.length=0}function a(h){e.push(h)}function o(h){n.push(h)}function l(h){s.push(h)}function c(){t.setup(e)}function u(h){t.setupView(e,h)}let f={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:f,setupLights:c,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function n_(i){let t=new WeakMap;function e(s,r=0){let a=t.get(s),o;return a===void 0?(o=new yd(i),t.set(s,[o])):r>=a.length?(o=new yd(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}var i_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,s_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,r_=[new N(1,0,0),new N(-1,0,0),new N(0,1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1)],a_=[new N(0,-1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1),new N(0,-1,0),new N(0,-1,0)],Md=new fe,Nr=new N,jc=new N;function o_(i,t,e){let n=new ls,s=new dt,r=new dt,a=new be,o=new Za,l=new $a,c={},u=e.maxTextureSize,f={[gi]:Ve,[Ve]:gi,[Qe]:Qe},h=new ln({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new dt},radius:{value:4}},vertexShader:i_,fragmentShader:s_}),d=h.clone();d.defines.HORIZONTAL_PASS=1;let m=new Le;m.setAttribute("position",new Ke(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new Ut(m,h),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Er;let p=this.type;this.render=function(T,R,v){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||T.length===0)return;this.type===uu&&(zt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Er);let w=i.getRenderTarget(),C=i.getActiveCubeFace(),L=i.getActiveMipmapLevel(),B=i.state;B.setBlending(Bn),B.buffers.depth.getReversed()===!0?B.buffers.color.setClear(0,0,0,0):B.buffers.color.setClear(1,1,1,1),B.buffers.depth.setTest(!0),B.setScissorTest(!1);let H=p!==this.type;H&&R.traverse(function(U){U.material&&(Array.isArray(U.material)?U.material.forEach(k=>k.needsUpdate=!0):U.material.needsUpdate=!0)});for(let U=0,k=T.length;U<k;U++){let Z=T[U],Y=Z.shadow;if(Y===void 0){zt("WebGLShadowMap:",Z,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;s.copy(Y.mapSize);let st=Y.getFrameExtents();s.multiply(st),r.copy(Y.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/st.x),s.x=r.x*st.x,Y.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/st.y),s.y=r.y*st.y,Y.mapSize.y=r.y));let $=i.state.buffers.depth.getReversed();if(Y.camera._reversedDepth=$,Y.map===null||H===!0){if(Y.map!==null&&(Y.map.depthTexture!==null&&(Y.map.depthTexture.dispose(),Y.map.depthTexture=null),Y.map.dispose()),this.type===ms){if(Z.isPointLight){zt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}Y.map=new nn(s.x,s.y,{format:yi,type:wn,minFilter:Ge,magFilter:Ge,generateMipmaps:!1}),Y.map.texture.name=Z.name+".shadowMap",Y.map.depthTexture=new di(s.x,s.y,pn),Y.map.depthTexture.name=Z.name+".shadowMapDepth",Y.map.depthTexture.format=Nn,Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=ke,Y.map.depthTexture.magFilter=ke}else Z.isPointLight?(Y.map=new el(s.x),Y.map.depthTexture=new za(s.x,Tn)):(Y.map=new nn(s.x,s.y),Y.map.depthTexture=new di(s.x,s.y,Tn)),Y.map.depthTexture.name=Z.name+".shadowMap",Y.map.depthTexture.format=Nn,this.type===Er?(Y.map.depthTexture.compareFunction=$?Ko:Jo,Y.map.depthTexture.minFilter=Ge,Y.map.depthTexture.magFilter=Ge):(Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=ke,Y.map.depthTexture.magFilter=ke);Y.camera.updateProjectionMatrix()}Y.map.isWebGLCubeRenderTarget!==!0&&(Y.map.width!==s.x||Y.map.height!==s.y)&&Y.map.setSize(s.x,s.y);let tt=Y.map.isWebGLCubeRenderTarget?6:Y.getViewportCount();Z.isPointLight!==!0&&Y.updateMatrices(Z,v);for(let nt=0;nt<tt;nt++){let It=Y.getCamera(nt);if(Z.isPointLight){let rt=Y.camera,ie=Y.matrix,$t=Z.distance||rt.far;$t!==rt.far&&(rt.far=$t,rt.updateProjectionMatrix()),Nr.setFromMatrixPosition(Z.matrixWorld),rt.position.copy(Nr),jc.copy(rt.position),jc.add(r_[nt]),rt.up.copy(a_[nt]),rt.lookAt(jc),rt.updateMatrixWorld(),ie.makeTranslation(-Nr.x,-Nr.y,-Nr.z),Md.multiplyMatrices(rt.projectionMatrix,rt.matrixWorldInverse),Y._frustum.setFromProjectionMatrix(Md,rt.coordinateSystem,rt.reversedDepth)}if(Y.map.isWebGLCubeRenderTarget)i.setRenderTarget(Y.map,nt),i.clear();else{nt===0&&(i.setRenderTarget(Y.map),i.clear());let rt=Y.getViewport(nt);a.set(r.x*rt.x,r.y*rt.y,r.x*rt.z,r.y*rt.w),B.viewport(a)}n=Y.getFrustum(nt),y(R,v,It,Z,this.type)}Y.isPointLightShadow!==!0&&this.type===ms&&M(Y,v),Y.needsUpdate=!1}p=this.type,g.needsUpdate=!1,i.setRenderTarget(w,C,L)};function M(T,R){let v=t.update(x);h.defines.VSM_SAMPLES!==T.blurSamples&&(h.defines.VSM_SAMPLES=T.blurSamples,d.defines.VSM_SAMPLES=T.blurSamples,h.needsUpdate=!0,d.needsUpdate=!0),T.mapPass===null?T.mapPass=new nn(s.x,s.y,{format:yi,type:wn}):(T.mapPass.width!==T.map.width||T.mapPass.height!==T.map.height)&&T.mapPass.setSize(T.map.width,T.map.height),h.uniforms.shadow_pass.value=T.map.depthTexture,h.uniforms.resolution.value.set(T.map.width,T.map.height),h.uniforms.radius.value=T.radius,i.setRenderTarget(T.mapPass),i.clear(),i.renderBufferDirect(R,null,v,h,x,null),d.uniforms.shadow_pass.value=T.mapPass.texture,d.uniforms.resolution.value.set(T.map.width,T.map.height),d.uniforms.radius.value=T.radius,i.setRenderTarget(T.map),i.clear(),i.renderBufferDirect(R,null,v,d,x,null)}function b(T,R,v,w){let C=null,L=v.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(L!==void 0)C=L;else if(C=v.isPointLight===!0?l:o,i.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){let B=C.uuid,H=R.uuid,U=c[B];U===void 0&&(U={},c[B]=U);let k=U[H];k===void 0&&(k=C.clone(),U[H]=k,R.addEventListener("dispose",E)),C=k}if(C.visible=R.visible,C.wireframe=R.wireframe,w===ms?C.side=R.shadowSide!==null?R.shadowSide:R.side:C.side=R.shadowSide!==null?R.shadowSide:f[R.side],C.alphaMap=R.alphaMap,C.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,C.map=R.map,C.clipShadows=R.clipShadows,C.clippingPlanes=R.clippingPlanes,C.clipIntersection=R.clipIntersection,C.displacementMap=R.displacementMap,C.displacementScale=R.displacementScale,C.displacementBias=R.displacementBias,C.wireframeLinewidth=R.wireframeLinewidth,C.linewidth=R.linewidth,v.isPointLight===!0&&C.isMeshDistanceMaterial===!0){let B=i.properties.get(C);B.light=v}return C}function y(T,R,v,w,C){if(T.visible===!1)return;if(T.layers.test(R.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&C===ms)&&(!T.frustumCulled||T.intersectsFrustum(n))){T.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,T.matrixWorld);let H=t.update(T),U=T.material;if(Array.isArray(U)){let k=H.groups;for(let Z=0,Y=k.length;Z<Y;Z++){let st=k[Z],$=U[st.materialIndex];if($&&$.visible){let tt=b(T,$,w,C);T.onBeforeShadow(i,T,R,v,H,tt,st),i.renderBufferDirect(v,null,H,tt,T,st),T.onAfterShadow(i,T,R,v,H,tt,st)}}}else if(U.visible){let k=b(T,U,w,C);T.onBeforeShadow(i,T,R,v,H,k,null),i.renderBufferDirect(v,null,H,k,T,null),T.onAfterShadow(i,T,R,v,H,k,null)}}let B=T.children;for(let H=0,U=B.length;H<U;H++)y(B[H],R,v,w,C)}function E(T){T.target.removeEventListener("dispose",E);for(let v in c){let w=c[v],C=T.target.uuid;C in w&&(w[C].dispose(),delete w[C])}}}function l_(i,t){function e(){let O=!1,gt=new be,Q=null,xt=new be(0,0,0,0);return{setMask:function(bt){Q!==bt&&!O&&(i.colorMask(bt,bt,bt,bt),Q=bt)},setLocked:function(bt){O=bt},setClear:function(bt,at,Nt,Pt,xe){xe===!0&&(bt*=Pt,at*=Pt,Nt*=Pt),gt.set(bt,at,Nt,Pt),xt.equals(gt)===!1&&(i.clearColor(bt,at,Nt,Pt),xt.copy(gt))},reset:function(){O=!1,Q=null,xt.set(-1,0,0,0)}}}function n(){let O=!1,gt=!1,Q=null,xt=null,bt=null;return{setReversed:function(at){if(gt!==at){let Nt=t.get("EXT_clip_control");at?Nt.clipControlEXT(Nt.LOWER_LEFT_EXT,Nt.ZERO_TO_ONE_EXT):Nt.clipControlEXT(Nt.LOWER_LEFT_EXT,Nt.NEGATIVE_ONE_TO_ONE_EXT),gt=at;let Pt=bt;bt=null,this.setClear(Pt)}},getReversed:function(){return gt},setTest:function(at){at?et(i.DEPTH_TEST):mt(i.DEPTH_TEST)},setMask:function(at){Q!==at&&!O&&(i.depthMask(at),Q=at)},setFunc:function(at){if(gt&&(at=qu[at]),xt!==at){switch(at){case Ea:i.depthFunc(i.NEVER);break;case Ta:i.depthFunc(i.ALWAYS);break;case wa:i.depthFunc(i.LESS);break;case ns:i.depthFunc(i.LEQUAL);break;case Aa:i.depthFunc(i.EQUAL);break;case Ra:i.depthFunc(i.GEQUAL);break;case Ca:i.depthFunc(i.GREATER);break;case Ia:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}xt=at}},setLocked:function(at){O=at},setClear:function(at){bt!==at&&(bt=at,gt&&(at=1-at),i.clearDepth(at))},reset:function(){O=!1,Q=null,xt=null,bt=null,gt=!1}}}function s(){let O=!1,gt=null,Q=null,xt=null,bt=null,at=null,Nt=null,Pt=null,xe=null;return{setTest:function(he){O||(he?et(i.STENCIL_TEST):mt(i.STENCIL_TEST))},setMask:function(he){gt!==he&&!O&&(i.stencilMask(he),gt=he)},setFunc:function(he,xn,In){(Q!==he||xt!==xn||bt!==In)&&(i.stencilFunc(he,xn,In),Q=he,xt=xn,bt=In)},setOp:function(he,xn,In){(at!==he||Nt!==xn||Pt!==In)&&(i.stencilOp(he,xn,In),at=he,Nt=xn,Pt=In)},setLocked:function(he){O=he},setClear:function(he){xe!==he&&(i.clearStencil(he),xe=he)},reset:function(){O=!1,gt=null,Q=null,xt=null,bt=null,at=null,Nt=null,Pt=null,xe=null}}}let r=new e,a=new n,o=new s,l=new WeakMap,c=new WeakMap,u={},f={},h={},d=new WeakMap,m=[],x=null,g=!1,p=null,M=null,b=null,y=null,E=null,T=null,R=null,v=new At(0,0,0),w=0,C=!1,L=null,B=null,H=null,U=null,k=null,Z=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Y=!1,st=0,$=i.getParameter(i.VERSION);$.indexOf("WebGL")!==-1?(st=parseFloat(/^WebGL (\d)/.exec($)[1]),Y=st>=1):$.indexOf("OpenGL ES")!==-1&&(st=parseFloat(/^OpenGL ES (\d)/.exec($)[1]),Y=st>=2);let tt=null,nt={},It=i.getParameter(i.SCISSOR_BOX),rt=i.getParameter(i.VIEWPORT),ie=new be().fromArray(It),$t=new be().fromArray(rt);function ee(O,gt,Q,xt){let bt=new Uint8Array(4),at=i.createTexture();i.bindTexture(O,at),i.texParameteri(O,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(O,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Nt=0;Nt<Q;Nt++)O===i.TEXTURE_3D||O===i.TEXTURE_2D_ARRAY?i.texImage3D(gt,0,i.RGBA,1,1,xt,0,i.RGBA,i.UNSIGNED_BYTE,bt):i.texImage2D(gt+Nt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,bt);return at}let J={};J[i.TEXTURE_2D]=ee(i.TEXTURE_2D,i.TEXTURE_2D,1),J[i.TEXTURE_CUBE_MAP]=ee(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),J[i.TEXTURE_2D_ARRAY]=ee(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),J[i.TEXTURE_3D]=ee(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),et(i.DEPTH_TEST),a.setFunc(ns),ct(!1),pt(vc),et(i.CULL_FACE),ot(Bn);function et(O){u[O]!==!0&&(i.enable(O),u[O]=!0)}function mt(O){u[O]!==!1&&(i.disable(O),u[O]=!1)}function Bt(O,gt){return h[O]!==gt?(i.bindFramebuffer(O,gt),h[O]=gt,O===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=gt),O===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=gt),!0):!1}function St(O,gt){let Q=m,xt=!1;if(O){Q=d.get(gt),Q===void 0&&(Q=[],d.set(gt,Q));let bt=O.textures;if(Q.length!==bt.length||Q[0]!==i.COLOR_ATTACHMENT0){for(let at=0,Nt=bt.length;at<Nt;at++)Q[at]=i.COLOR_ATTACHMENT0+at;Q.length=bt.length,xt=!0}}else Q[0]!==i.BACK&&(Q[0]=i.BACK,xt=!0);xt&&i.drawBuffers(Q)}function Ht(O){return x!==O?(i.useProgram(O),x=O,!0):!1}let oe={[Pi]:i.FUNC_ADD,[fu]:i.FUNC_SUBTRACT,[pu]:i.FUNC_REVERSE_SUBTRACT};oe[mu]=i.MIN,oe[gu]=i.MAX;let K={[xu]:i.ZERO,[_u]:i.ONE,[vu]:i.SRC_COLOR,[bc]:i.SRC_ALPHA,[Tu]:i.SRC_ALPHA_SATURATE,[bu]:i.DST_COLOR,[Mu]:i.DST_ALPHA,[yu]:i.ONE_MINUS_SRC_COLOR,[Ec]:i.ONE_MINUS_SRC_ALPHA,[Eu]:i.ONE_MINUS_DST_COLOR,[Su]:i.ONE_MINUS_DST_ALPHA,[wu]:i.CONSTANT_COLOR,[Au]:i.ONE_MINUS_CONSTANT_COLOR,[Ru]:i.CONSTANT_ALPHA,[Cu]:i.ONE_MINUS_CONSTANT_ALPHA};function ot(O,gt,Q,xt,bt,at,Nt,Pt,xe,he){if(O===Bn){g===!0&&(mt(i.BLEND),g=!1);return}if(g===!1&&(et(i.BLEND),g=!0),O!==du){if(O!==p||he!==C){if((M!==Pi||E!==Pi)&&(i.blendEquation(i.FUNC_ADD),M=Pi,E=Pi),he)switch(O){case gs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case yc:i.blendFunc(i.ONE,i.ONE);break;case Mc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Sc:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Gt("WebGLState: Invalid blending: ",O);break}else switch(O){case gs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case yc:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Mc:Gt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Sc:Gt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Gt("WebGLState: Invalid blending: ",O);break}b=null,y=null,T=null,R=null,v.set(0,0,0),w=0,p=O,C=he}return}bt=bt||gt,at=at||Q,Nt=Nt||xt,(gt!==M||bt!==E)&&(i.blendEquationSeparate(oe[gt],oe[bt]),M=gt,E=bt),(Q!==b||xt!==y||at!==T||Nt!==R)&&(i.blendFuncSeparate(K[Q],K[xt],K[at],K[Nt]),b=Q,y=xt,T=at,R=Nt),(Pt.equals(v)===!1||xe!==w)&&(i.blendColor(Pt.r,Pt.g,Pt.b,xe),v.copy(Pt),w=xe),p=O,C=!1}function lt(O,gt){O.side===Qe?mt(i.CULL_FACE):et(i.CULL_FACE);let Q=O.side===Ve;gt&&(Q=!Q),ct(Q),O.blending===gs&&O.transparent===!1?ot(Bn):ot(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),a.setFunc(O.depthFunc),a.setTest(O.depthTest),a.setMask(O.depthWrite),r.setMask(O.colorWrite);let xt=O.stencilWrite;o.setTest(xt),xt&&(o.setMask(O.stencilWriteMask),o.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),o.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),Dt(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?et(i.SAMPLE_ALPHA_TO_COVERAGE):mt(i.SAMPLE_ALPHA_TO_COVERAGE)}function ct(O){L!==O&&(O?i.frontFace(i.CW):i.frontFace(i.CCW),L=O)}function pt(O){O!==cu?(et(i.CULL_FACE),O!==B&&(O===vc?i.cullFace(i.BACK):O===hu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):mt(i.CULL_FACE),B=O}function Ft(O){O!==H&&(Y&&i.lineWidth(O),H=O)}function Dt(O,gt,Q){O?(et(i.POLYGON_OFFSET_FILL),(U!==gt||k!==Q)&&(U=gt,k=Q,a.getReversed()&&(gt=-gt),i.polygonOffset(gt,Q))):mt(i.POLYGON_OFFSET_FILL)}function kt(O){O?et(i.SCISSOR_TEST):mt(i.SCISSOR_TEST)}function Wt(O){O===void 0&&(O=i.TEXTURE0+Z-1),tt!==O&&(i.activeTexture(O),tt=O)}function D(O,gt,Q){Q===void 0&&(tt===null?Q=i.TEXTURE0+Z-1:Q=tt);let xt=nt[Q];xt===void 0&&(xt={type:void 0,texture:void 0},nt[Q]=xt),(xt.type!==O||xt.texture!==gt)&&(tt!==Q&&(i.activeTexture(Q),tt=Q),i.bindTexture(O,gt||J[O]),xt.type=O,xt.texture=gt)}function le(){let O=nt[tt];O!==void 0&&O.type!==void 0&&(i.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function Qt(){try{i.compressedTexImage2D(...arguments)}catch(O){Gt("WebGLState:",O)}}function A(){try{i.compressedTexImage3D(...arguments)}catch(O){Gt("WebGLState:",O)}}function _(){try{i.texSubImage2D(...arguments)}catch(O){Gt("WebGLState:",O)}}function I(){try{i.texSubImage3D(...arguments)}catch(O){Gt("WebGLState:",O)}}function P(){try{i.compressedTexSubImage2D(...arguments)}catch(O){Gt("WebGLState:",O)}}function z(){try{i.compressedTexSubImage3D(...arguments)}catch(O){Gt("WebGLState:",O)}}function j(){try{i.texStorage2D(...arguments)}catch(O){Gt("WebGLState:",O)}}function it(){try{i.texStorage3D(...arguments)}catch(O){Gt("WebGLState:",O)}}function W(){try{i.texImage2D(...arguments)}catch(O){Gt("WebGLState:",O)}}function X(){try{i.texImage3D(...arguments)}catch(O){Gt("WebGLState:",O)}}function ht(O){return f[O]!==void 0?f[O]:i.getParameter(O)}function vt(O,gt){f[O]!==gt&&(i.pixelStorei(O,gt),f[O]=gt)}function ft(O){ie.equals(O)===!1&&(i.scissor(O.x,O.y,O.z,O.w),ie.copy(O))}function ut(O){$t.equals(O)===!1&&(i.viewport(O.x,O.y,O.z,O.w),$t.copy(O))}function Et(O,gt){let Q=c.get(gt);Q===void 0&&(Q=new WeakMap,c.set(gt,Q));let xt=Q.get(O);xt===void 0&&(xt=i.getUniformBlockIndex(gt,O.name),Q.set(O,xt))}function Ot(O,gt){let xt=c.get(gt).get(O);l.get(gt)!==xt&&(i.uniformBlockBinding(gt,xt,O.__bindingPointIndex),l.set(gt,xt))}function Zt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},f={},tt=null,nt={},h={},d=new WeakMap,m=[],x=null,g=!1,p=null,M=null,b=null,y=null,E=null,T=null,R=null,v=new At(0,0,0),w=0,C=!1,L=null,B=null,H=null,U=null,k=null,ie.set(0,0,i.canvas.width,i.canvas.height),$t.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:et,disable:mt,bindFramebuffer:Bt,drawBuffers:St,useProgram:Ht,setBlending:ot,setMaterial:lt,setFlipSided:ct,setCullFace:pt,setLineWidth:Ft,setPolygonOffset:Dt,setScissorTest:kt,activeTexture:Wt,bindTexture:D,unbindTexture:le,compressedTexImage2D:Qt,compressedTexImage3D:A,texImage2D:W,texImage3D:X,pixelStorei:vt,getParameter:ht,updateUBOMapping:Et,uniformBlockBinding:Ot,texStorage2D:j,texStorage3D:it,texSubImage2D:_,texSubImage3D:I,compressedTexSubImage2D:P,compressedTexSubImage3D:z,scissor:ft,viewport:ut,reset:Zt}}function c_(i,t,e,n,s,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new dt,u=new WeakMap,f=new Set,h,d=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(A,_){return m?new OffscreenCanvas(A,_):Ws("canvas")}function g(A,_,I){let P=1,z=Qt(A);if((z.width>I||z.height>I)&&(P=I/Math.max(z.width,z.height)),P<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){let j=Math.floor(P*z.width),it=Math.floor(P*z.height);h===void 0&&(h=x(j,it));let W=_?x(j,it):h;return W.width=j,W.height=it,W.getContext("2d").drawImage(A,0,0,j,it),zt("WebGLRenderer: Texture has been resized from ("+z.width+"x"+z.height+") to ("+j+"x"+it+")."),W}else return"data"in A&&zt("WebGLRenderer: Image in DataTexture is too big ("+z.width+"x"+z.height+")."),A;return A}function p(A){return A.generateMipmaps}function M(A){i.generateMipmap(A)}function b(A){return A.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?i.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function y(A,_,I,P,z,j=!1){if(A!==null){if(i[A]!==void 0)return i[A];zt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let it;P&&(it=t.get("EXT_texture_norm16"),it||zt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let W=_;if(_===i.RED&&(I===i.FLOAT&&(W=i.R32F),I===i.HALF_FLOAT&&(W=i.R16F),I===i.UNSIGNED_BYTE&&(W=i.R8),I===i.UNSIGNED_SHORT&&it&&(W=it.R16_EXT),I===i.SHORT&&it&&(W=it.R16_SNORM_EXT)),_===i.RED_INTEGER&&(I===i.UNSIGNED_BYTE&&(W=i.R8UI),I===i.UNSIGNED_SHORT&&(W=i.R16UI),I===i.UNSIGNED_INT&&(W=i.R32UI),I===i.BYTE&&(W=i.R8I),I===i.SHORT&&(W=i.R16I),I===i.INT&&(W=i.R32I)),_===i.RG&&(I===i.FLOAT&&(W=i.RG32F),I===i.HALF_FLOAT&&(W=i.RG16F),I===i.UNSIGNED_BYTE&&(W=i.RG8),I===i.UNSIGNED_SHORT&&it&&(W=it.RG16_EXT),I===i.SHORT&&it&&(W=it.RG16_SNORM_EXT)),_===i.RG_INTEGER&&(I===i.UNSIGNED_BYTE&&(W=i.RG8UI),I===i.UNSIGNED_SHORT&&(W=i.RG16UI),I===i.UNSIGNED_INT&&(W=i.RG32UI),I===i.BYTE&&(W=i.RG8I),I===i.SHORT&&(W=i.RG16I),I===i.INT&&(W=i.RG32I)),_===i.RGB_INTEGER&&(I===i.UNSIGNED_BYTE&&(W=i.RGB8UI),I===i.UNSIGNED_SHORT&&(W=i.RGB16UI),I===i.UNSIGNED_INT&&(W=i.RGB32UI),I===i.BYTE&&(W=i.RGB8I),I===i.SHORT&&(W=i.RGB16I),I===i.INT&&(W=i.RGB32I)),_===i.RGBA_INTEGER&&(I===i.UNSIGNED_BYTE&&(W=i.RGBA8UI),I===i.UNSIGNED_SHORT&&(W=i.RGBA16UI),I===i.UNSIGNED_INT&&(W=i.RGBA32UI),I===i.BYTE&&(W=i.RGBA8I),I===i.SHORT&&(W=i.RGBA16I),I===i.INT&&(W=i.RGBA32I)),_===i.RGB&&(I===i.UNSIGNED_SHORT&&it&&(W=it.RGB16_EXT),I===i.SHORT&&it&&(W=it.RGB16_SNORM_EXT),I===i.UNSIGNED_INT_5_9_9_9_REV&&(W=i.RGB9_E5),I===i.UNSIGNED_INT_10F_11F_11F_REV&&(W=i.R11F_G11F_B10F)),_===i.RGBA){let X=j?Vs:ne.getTransfer(z);I===i.FLOAT&&(W=i.RGBA32F),I===i.HALF_FLOAT&&(W=i.RGBA16F),I===i.UNSIGNED_BYTE&&(W=X===de?i.SRGB8_ALPHA8:i.RGBA8),I===i.UNSIGNED_SHORT&&it&&(W=it.RGBA16_EXT),I===i.SHORT&&it&&(W=it.RGBA16_SNORM_EXT),I===i.UNSIGNED_SHORT_4_4_4_4&&(W=i.RGBA4),I===i.UNSIGNED_SHORT_5_5_5_1&&(W=i.RGB5_A1)}return(W===i.R16F||W===i.R32F||W===i.RG16F||W===i.RG32F||W===i.RGBA16F||W===i.RGBA32F)&&t.get("EXT_color_buffer_float"),W}function E(A,_){let I;return A?_===null||_===Tn||_===_s?I=i.DEPTH24_STENCIL8:_===pn?I=i.DEPTH32F_STENCIL8:_===xs&&(I=i.DEPTH24_STENCIL8,zt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===Tn||_===_s?I=i.DEPTH_COMPONENT24:_===pn?I=i.DEPTH_COMPONENT32F:_===xs&&(I=i.DEPTH_COMPONENT16),I}function T(A,_){return p(A)===!0||A.isFramebufferTexture&&A.minFilter!==ke&&A.minFilter!==Ge?Math.log2(Math.max(_.width,_.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?_.mipmaps.length:1}function R(A){let _=A.target;_.removeEventListener("dispose",R),w(_),_.isVideoTexture&&u.delete(_),_.isHTMLTexture&&f.delete(_)}function v(A){let _=A.target;_.removeEventListener("dispose",v),L(_)}function w(A){let _=n.get(A);if(_.__webglInit===void 0)return;let I=A.source,P=d.get(I);if(P){let z=P[_.__cacheKey];z.usedTimes--,z.usedTimes===0&&C(A),Object.keys(P).length===0&&d.delete(I)}n.remove(A)}function C(A){let _=n.get(A);i.deleteTexture(_.__webglTexture);let I=A.source,P=d.get(I);delete P[_.__cacheKey],a.memory.textures--}function L(A){let _=n.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),n.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let P=0;P<6;P++){if(Array.isArray(_.__webglFramebuffer[P]))for(let z=0;z<_.__webglFramebuffer[P].length;z++)i.deleteFramebuffer(_.__webglFramebuffer[P][z]);else i.deleteFramebuffer(_.__webglFramebuffer[P]);_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer[P])}else{if(Array.isArray(_.__webglFramebuffer))for(let P=0;P<_.__webglFramebuffer.length;P++)i.deleteFramebuffer(_.__webglFramebuffer[P]);else i.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&i.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let P=0;P<_.__webglColorRenderbuffer.length;P++)_.__webglColorRenderbuffer[P]&&i.deleteRenderbuffer(_.__webglColorRenderbuffer[P]);_.__webglDepthRenderbuffer&&i.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let I=A.textures;for(let P=0,z=I.length;P<z;P++){let j=n.get(I[P]);j.__webglTexture&&(i.deleteTexture(j.__webglTexture),a.memory.textures--),n.remove(I[P])}n.remove(A)}let B=0;function H(){B=0}function U(){return B}function k(A){B=A}function Z(){let A=B;return A>=s.maxTextures&&zt("WebGLTextures: Trying to use "+(A+1)+" texture units while this GPU supports only "+s.maxTextures),B+=1,A}function Y(A){let _=[];return _.push(A.wrapS),_.push(A.wrapT),_.push(A.wrapR||0),_.push(A.magFilter),_.push(A.minFilter),_.push(A.anisotropy),_.push(A.internalFormat),_.push(A.format),_.push(A.type),_.push(A.generateMipmaps),_.push(A.premultiplyAlpha),_.push(A.flipY),_.push(A.unpackAlignment),_.push(A.colorSpace),_.join()}function st(A,_){let I=n.get(A);if(A.isVideoTexture&&D(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&I.__version!==A.version){let P=A.image;if(P===null)zt("WebGLRenderer: Texture marked for update but no image data found.");else if(P.complete===!1)zt("WebGLRenderer: Texture marked for update but image is incomplete");else{mt(I,A,_);return}}else A.isExternalTexture&&(I.__webglTexture=A.sourceTexture?A.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,I.__webglTexture,i.TEXTURE0+_)}function $(A,_){let I=n.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&I.__version!==A.version){mt(I,A,_);return}else A.isExternalTexture&&(I.__webglTexture=A.sourceTexture?A.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,I.__webglTexture,i.TEXTURE0+_)}function tt(A,_){let I=n.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&I.__version!==A.version){mt(I,A,_);return}e.bindTexture(i.TEXTURE_3D,I.__webglTexture,i.TEXTURE0+_)}function nt(A,_){let I=n.get(A);if(A.isCubeDepthTexture!==!0&&A.version>0&&I.__version!==A.version){Bt(I,A,_);return}e.bindTexture(i.TEXTURE_CUBE_MAP,I.__webglTexture,i.TEXTURE0+_)}let It={[is]:i.REPEAT,[Dn]:i.CLAMP_TO_EDGE,[Pa]:i.MIRRORED_REPEAT},rt={[ke]:i.NEAREST,[Lu]:i.NEAREST_MIPMAP_NEAREST,[wr]:i.NEAREST_MIPMAP_LINEAR,[Ge]:i.LINEAR,[ho]:i.LINEAR_MIPMAP_NEAREST,[_i]:i.LINEAR_MIPMAP_LINEAR},ie={[Fu]:i.NEVER,[Hu]:i.ALWAYS,[Ou]:i.LESS,[Jo]:i.LEQUAL,[Bu]:i.EQUAL,[Ko]:i.GEQUAL,[zu]:i.GREATER,[ku]:i.NOTEQUAL};function $t(A,_){if(_.type===pn&&t.has("OES_texture_float_linear")===!1&&(_.magFilter===Ge||_.magFilter===ho||_.magFilter===wr||_.magFilter===_i||_.minFilter===Ge||_.minFilter===ho||_.minFilter===wr||_.minFilter===_i)&&zt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(A,i.TEXTURE_WRAP_S,It[_.wrapS]),i.texParameteri(A,i.TEXTURE_WRAP_T,It[_.wrapT]),(A===i.TEXTURE_3D||A===i.TEXTURE_2D_ARRAY)&&i.texParameteri(A,i.TEXTURE_WRAP_R,It[_.wrapR]),i.texParameteri(A,i.TEXTURE_MAG_FILTER,rt[_.magFilter]),i.texParameteri(A,i.TEXTURE_MIN_FILTER,rt[_.minFilter]),_.compareFunction&&(i.texParameteri(A,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(A,i.TEXTURE_COMPARE_FUNC,ie[_.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===ke||_.minFilter!==wr&&_.minFilter!==_i||_.type===pn&&t.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){let I=t.get("EXT_texture_filter_anisotropic");i.texParameterf(A,I.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function ee(A,_){let I=!1;A.__webglInit===void 0&&(A.__webglInit=!0,_.addEventListener("dispose",R));let P=_.source,z=d.get(P);z===void 0&&(z={},d.set(P,z));let j=Y(_);if(j!==A.__cacheKey){z[j]===void 0&&(z[j]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,I=!0),z[j].usedTimes++;let it=z[A.__cacheKey];it!==void 0&&(z[A.__cacheKey].usedTimes--,it.usedTimes===0&&C(_)),A.__cacheKey=j,A.__webglTexture=z[j].texture}return I}function J(A,_,I){return Math.floor(Math.floor(A/I)/_)}function et(A,_,I,P){let j=A.updateRanges;if(j.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,_.width,_.height,I,P,_.data);else{j.sort((vt,ft)=>vt.start-ft.start);let it=0;for(let vt=1;vt<j.length;vt++){let ft=j[it],ut=j[vt],Et=ft.start+ft.count,Ot=J(ut.start,_.width,4),Zt=J(ft.start,_.width,4);ut.start<=Et+1&&Ot===Zt&&J(ut.start+ut.count-1,_.width,4)===Ot?ft.count=Math.max(ft.count,ut.start+ut.count-ft.start):(++it,j[it]=ut)}j.length=it+1;let W=e.getParameter(i.UNPACK_ROW_LENGTH),X=e.getParameter(i.UNPACK_SKIP_PIXELS),ht=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,_.width);for(let vt=0,ft=j.length;vt<ft;vt++){let ut=j[vt],Et=Math.floor(ut.start/4),Ot=Math.ceil(ut.count/4),Zt=Et%_.width,O=Math.floor(Et/_.width),gt=Ot,Q=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,Zt),e.pixelStorei(i.UNPACK_SKIP_ROWS,O),e.texSubImage2D(i.TEXTURE_2D,0,Zt,O,gt,Q,I,P,_.data)}A.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,W),e.pixelStorei(i.UNPACK_SKIP_PIXELS,X),e.pixelStorei(i.UNPACK_SKIP_ROWS,ht)}}function mt(A,_,I){let P=i.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(P=i.TEXTURE_2D_ARRAY),_.isData3DTexture&&(P=i.TEXTURE_3D);let z=ee(A,_),j=_.source;e.bindTexture(P,A.__webglTexture,i.TEXTURE0+I);let it=n.get(j);if(j.version!==it.__version||z===!0){if(e.activeTexture(i.TEXTURE0+I),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){let Q=ne.getPrimaries(ne.workingColorSpace),xt=_.colorSpace===jn?null:ne.getPrimaries(_.colorSpace),bt=_.colorSpace===jn||Q===xt?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,bt)}e.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment);let X=g(_.image,!1,s.maxTextureSize);X=le(_,X);let ht=r.convert(_.format,_.colorSpace),vt=r.convert(_.type),ft=y(_.internalFormat,ht,vt,_.normalized,_.colorSpace,_.isVideoTexture);$t(P,_);let ut,Et=_.mipmaps,Ot=_.isVideoTexture!==!0,Zt=it.__version===void 0||z===!0,O=j.dataReady,gt=T(_,X);if(_.isDepthTexture)ft=E(_.format===vi,_.type),Zt&&(Ot?e.texStorage2D(i.TEXTURE_2D,1,ft,X.width,X.height):e.texImage2D(i.TEXTURE_2D,0,ft,X.width,X.height,0,ht,vt,null));else if(_.isDataTexture)if(Et.length>0){Ot&&Zt&&e.texStorage2D(i.TEXTURE_2D,gt,ft,Et[0].width,Et[0].height);for(let Q=0,xt=Et.length;Q<xt;Q++)ut=Et[Q],Ot?O&&e.texSubImage2D(i.TEXTURE_2D,Q,0,0,ut.width,ut.height,ht,vt,ut.data):e.texImage2D(i.TEXTURE_2D,Q,ft,ut.width,ut.height,0,ht,vt,ut.data);_.generateMipmaps=!1}else Ot?(Zt&&e.texStorage2D(i.TEXTURE_2D,gt,ft,X.width,X.height),O&&et(_,X,ht,vt)):e.texImage2D(i.TEXTURE_2D,0,ft,X.width,X.height,0,ht,vt,X.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Ot&&Zt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,gt,ft,Et[0].width,Et[0].height,X.depth);for(let Q=0,xt=Et.length;Q<xt;Q++)if(ut=Et[Q],_.format!==mn)if(ht!==null)if(Ot){if(O)if(_.layerUpdates.size>0){let bt=qc(ut.width,ut.height,_.format,_.type);for(let at of _.layerUpdates){let Nt=ut.data.subarray(at*bt/ut.data.BYTES_PER_ELEMENT,(at+1)*bt/ut.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,at,ut.width,ut.height,1,ht,Nt)}}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,ut.width,ut.height,X.depth,ht,ut.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,Q,ft,ut.width,ut.height,X.depth,0,ut.data,0,0);else zt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ot?O&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,ut.width,ut.height,X.depth,ht,vt,ut.data):e.texImage3D(i.TEXTURE_2D_ARRAY,Q,ft,ut.width,ut.height,X.depth,0,ht,vt,ut.data);_.layerUpdates.size>0&&_.clearLayerUpdates()}else{Ot&&Zt&&e.texStorage2D(i.TEXTURE_2D,gt,ft,Et[0].width,Et[0].height);for(let Q=0,xt=Et.length;Q<xt;Q++)ut=Et[Q],_.format!==mn?ht!==null?Ot?O&&e.compressedTexSubImage2D(i.TEXTURE_2D,Q,0,0,ut.width,ut.height,ht,ut.data):e.compressedTexImage2D(i.TEXTURE_2D,Q,ft,ut.width,ut.height,0,ut.data):zt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ot?O&&e.texSubImage2D(i.TEXTURE_2D,Q,0,0,ut.width,ut.height,ht,vt,ut.data):e.texImage2D(i.TEXTURE_2D,Q,ft,ut.width,ut.height,0,ht,vt,ut.data)}else if(_.isDataArrayTexture)if(Ot){if(Zt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,gt,ft,X.width,X.height,X.depth),O)if(_.layerUpdates.size>0){let Q=qc(X.width,X.height,_.format,_.type);for(let xt of _.layerUpdates){let bt=X.data.subarray(xt*Q/X.data.BYTES_PER_ELEMENT,(xt+1)*Q/X.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,xt,X.width,X.height,1,ht,vt,bt)}_.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,X.width,X.height,X.depth,ht,vt,X.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,ft,X.width,X.height,X.depth,0,ht,vt,X.data);else if(_.isData3DTexture)Ot?(Zt&&e.texStorage3D(i.TEXTURE_3D,gt,ft,X.width,X.height,X.depth),O&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,X.width,X.height,X.depth,ht,vt,X.data)):e.texImage3D(i.TEXTURE_3D,0,ft,X.width,X.height,X.depth,0,ht,vt,X.data);else if(_.isFramebufferTexture){if(Zt)if(Ot)e.texStorage2D(i.TEXTURE_2D,gt,ft,X.width,X.height);else{let Q=X.width,xt=X.height;for(let bt=0;bt<gt;bt++)e.texImage2D(i.TEXTURE_2D,bt,ft,Q,xt,0,ht,vt,null),Q>>=1,xt>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in i){let Q=i.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),X.parentNode!==Q){Q.appendChild(X),f.add(_),Q.onpaint=xt=>{let bt=xt.changedElements;for(let at of f)bt.includes(at.image)&&(at.needsUpdate=!0)},Q.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,X);else{let bt=i.RGBA,at=i.RGBA,Nt=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,bt,at,Nt,X)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Et.length>0){if(Ot&&Zt){let Q=Qt(Et[0]);e.texStorage2D(i.TEXTURE_2D,gt,ft,Q.width,Q.height)}for(let Q=0,xt=Et.length;Q<xt;Q++)ut=Et[Q],Ot?O&&e.texSubImage2D(i.TEXTURE_2D,Q,0,0,ht,vt,ut):e.texImage2D(i.TEXTURE_2D,Q,ft,ht,vt,ut);_.generateMipmaps=!1}else if(Ot){if(Zt){let Q=Qt(X);e.texStorage2D(i.TEXTURE_2D,gt,ft,Q.width,Q.height)}O&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,ht,vt,X)}else e.texImage2D(i.TEXTURE_2D,0,ft,ht,vt,X);p(_)&&M(P),it.__version=j.version,_.onUpdate&&_.onUpdate(_)}A.__version=_.version}function Bt(A,_,I){if(_.image.length!==6)return;let P=ee(A,_),z=_.source;e.bindTexture(i.TEXTURE_CUBE_MAP,A.__webglTexture,i.TEXTURE0+I);let j=n.get(z);if(z.version!==j.__version||P===!0){e.activeTexture(i.TEXTURE0+I);let it=ne.getPrimaries(ne.workingColorSpace),W=_.colorSpace===jn?null:ne.getPrimaries(_.colorSpace),X=_.colorSpace===jn||it===W?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,X);let ht=_.isCompressedTexture||_.image[0].isCompressedTexture,vt=_.image[0]&&_.image[0].isDataTexture,ft=[];for(let at=0;at<6;at++)!ht&&!vt?ft[at]=g(_.image[at],!0,s.maxCubemapSize):ft[at]=vt?_.image[at].image:_.image[at],ft[at]=le(_,ft[at]);let ut=ft[0],Et=r.convert(_.format,_.colorSpace),Ot=r.convert(_.type),Zt=y(_.internalFormat,Et,Ot,_.normalized,_.colorSpace),O=_.isVideoTexture!==!0,gt=j.__version===void 0||P===!0,Q=z.dataReady,xt=T(_,ut);$t(i.TEXTURE_CUBE_MAP,_);let bt;if(ht){O&&gt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,xt,Zt,ut.width,ut.height);for(let at=0;at<6;at++){bt=ft[at].mipmaps;for(let Nt=0;Nt<bt.length;Nt++){let Pt=bt[Nt];_.format!==mn?Et!==null?O?Q&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,Nt,0,0,Pt.width,Pt.height,Et,Pt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,Nt,Zt,Pt.width,Pt.height,0,Pt.data):zt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):O?Q&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,Nt,0,0,Pt.width,Pt.height,Et,Ot,Pt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,Nt,Zt,Pt.width,Pt.height,0,Et,Ot,Pt.data)}}}else{if(bt=_.mipmaps,O&&gt){bt.length>0&&xt++;let at=Qt(ft[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,xt,Zt,at.width,at.height)}for(let at=0;at<6;at++)if(vt){O?Q&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,0,0,ft[at].width,ft[at].height,Et,Ot,ft[at].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,Zt,ft[at].width,ft[at].height,0,Et,Ot,ft[at].data);for(let Nt=0;Nt<bt.length;Nt++){let xe=bt[Nt].image[at].image;O?Q&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,Nt+1,0,0,xe.width,xe.height,Et,Ot,xe.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,Nt+1,Zt,xe.width,xe.height,0,Et,Ot,xe.data)}}else{O?Q&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,0,0,Et,Ot,ft[at]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,Zt,Et,Ot,ft[at]);for(let Nt=0;Nt<bt.length;Nt++){let Pt=bt[Nt];O?Q&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,Nt+1,0,0,Et,Ot,Pt.image[at]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+at,Nt+1,Zt,Et,Ot,Pt.image[at])}}}p(_)&&M(i.TEXTURE_CUBE_MAP),j.__version=z.version,_.onUpdate&&_.onUpdate(_)}A.__version=_.version}function St(A,_,I,P,z,j){let it=r.convert(I.format,I.colorSpace),W=r.convert(I.type),X=y(I.internalFormat,it,W,I.normalized,I.colorSpace),ht=n.get(_),vt=n.get(I);if(vt.__renderTarget=_,!ht.__hasExternalTextures){let ft=Math.max(1,_.width>>j),ut=Math.max(1,_.height>>j);z===i.TEXTURE_3D||z===i.TEXTURE_2D_ARRAY?e.texImage3D(z,j,X,ft,ut,_.depth,0,it,W,null):e.texImage2D(z,j,X,ft,ut,0,it,W,null)}e.bindFramebuffer(i.FRAMEBUFFER,A),Wt(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,P,z,vt.__webglTexture,0,kt(_)):(z===i.TEXTURE_2D||z>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&z<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,P,z,vt.__webglTexture,j),e.bindFramebuffer(i.FRAMEBUFFER,null)}function Ht(A,_,I){if(i.bindRenderbuffer(i.RENDERBUFFER,A),_.depthBuffer){let P=_.depthTexture,z=P&&P.isDepthTexture?P.type:null,j=E(_.stencilBuffer,z),it=_.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Wt(_)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,kt(_),j,_.width,_.height):I?i.renderbufferStorageMultisample(i.RENDERBUFFER,kt(_),j,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,j,_.width,_.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,it,i.RENDERBUFFER,A)}else{let P=_.textures;for(let z=0;z<P.length;z++){let j=P[z],it=r.convert(j.format,j.colorSpace),W=r.convert(j.type),X=y(j.internalFormat,it,W,j.normalized,j.colorSpace);Wt(_)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,kt(_),X,_.width,_.height):I?i.renderbufferStorageMultisample(i.RENDERBUFFER,kt(_),X,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,X,_.width,_.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function oe(A,_,I){let P=_.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,A),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let z=n.get(_.depthTexture);if(z.__renderTarget=_,(!z.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),P){if(z.__webglInit===void 0&&(z.__webglInit=!0,_.depthTexture.addEventListener("dispose",R)),z.__webglTexture===void 0){z.__webglTexture=i.createTexture(),e.bindTexture(i.TEXTURE_CUBE_MAP,z.__webglTexture),$t(i.TEXTURE_CUBE_MAP,_.depthTexture);let ht=r.convert(_.depthTexture.format),vt=r.convert(_.depthTexture.type),ft;_.depthTexture.format===Nn?ft=i.DEPTH_COMPONENT24:_.depthTexture.format===vi&&(ft=i.DEPTH24_STENCIL8);for(let ut=0;ut<6;ut++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,0,ft,_.width,_.height,0,ht,vt,null)}}else st(_.depthTexture,0);let j=z.__webglTexture,it=kt(_),W=P?i.TEXTURE_CUBE_MAP_POSITIVE_X+I:i.TEXTURE_2D,X=_.depthTexture.format===vi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(_.depthTexture.format===Nn)Wt(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,X,W,j,0,it):i.framebufferTexture2D(i.FRAMEBUFFER,X,W,j,0);else if(_.depthTexture.format===vi)Wt(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,X,W,j,0,it):i.framebufferTexture2D(i.FRAMEBUFFER,X,W,j,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function K(A){let _=n.get(A),I=A.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==A.depthTexture){let P=A.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),P){let z=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,P.removeEventListener("dispose",z)};P.addEventListener("dispose",z),_.__depthDisposeCallback=z}_.__boundDepthTexture=P}if(A.depthTexture&&!_.__autoAllocateDepthBuffer)if(I)for(let P=0;P<6;P++)oe(_.__webglFramebuffer[P],A,P);else{let P=A.texture.mipmaps;P&&P.length>0?oe(_.__webglFramebuffer[0],A,0):oe(_.__webglFramebuffer,A,0)}else if(I){_.__webglDepthbuffer=[];for(let P=0;P<6;P++)if(e.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[P]),_.__webglDepthbuffer[P]===void 0)_.__webglDepthbuffer[P]=i.createRenderbuffer(),Ht(_.__webglDepthbuffer[P],A,!1);else{let z=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,j=_.__webglDepthbuffer[P];i.bindRenderbuffer(i.RENDERBUFFER,j),i.framebufferRenderbuffer(i.FRAMEBUFFER,z,i.RENDERBUFFER,j)}}else{let P=A.texture.mipmaps;if(P&&P.length>0?e.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=i.createRenderbuffer(),Ht(_.__webglDepthbuffer,A,!1);else{let z=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,j=_.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,j),i.framebufferRenderbuffer(i.FRAMEBUFFER,z,i.RENDERBUFFER,j)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function ot(A,_,I){let P=n.get(A);_!==void 0&&St(P.__webglFramebuffer,A,A.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),I!==void 0&&K(A)}function lt(A){let _=A.texture,I=n.get(A),P=n.get(_);A.addEventListener("dispose",v);let z=A.textures,j=A.isWebGLCubeRenderTarget===!0,it=z.length>1;if(it||(P.__webglTexture===void 0&&(P.__webglTexture=i.createTexture()),P.__version=_.version,a.memory.textures++),j){I.__webglFramebuffer=[];for(let W=0;W<6;W++)if(_.mipmaps&&_.mipmaps.length>0){I.__webglFramebuffer[W]=[];for(let X=0;X<_.mipmaps.length;X++)I.__webglFramebuffer[W][X]=i.createFramebuffer()}else I.__webglFramebuffer[W]=i.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){I.__webglFramebuffer=[];for(let W=0;W<_.mipmaps.length;W++)I.__webglFramebuffer[W]=i.createFramebuffer()}else I.__webglFramebuffer=i.createFramebuffer();if(it)for(let W=0,X=z.length;W<X;W++){let ht=n.get(z[W]);ht.__webglTexture===void 0&&(ht.__webglTexture=i.createTexture(),a.memory.textures++)}if(A.samples>0&&Wt(A)===!1){I.__webglMultisampledFramebuffer=i.createFramebuffer(),I.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,I.__webglMultisampledFramebuffer);for(let W=0;W<z.length;W++){let X=z[W];I.__webglColorRenderbuffer[W]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,I.__webglColorRenderbuffer[W]);let ht=r.convert(X.format,X.colorSpace),vt=r.convert(X.type),ft=y(X.internalFormat,ht,vt,X.normalized,X.colorSpace,A.isXRRenderTarget===!0),ut=kt(A);i.renderbufferStorageMultisample(i.RENDERBUFFER,ut,ft,A.width,A.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+W,i.RENDERBUFFER,I.__webglColorRenderbuffer[W])}i.bindRenderbuffer(i.RENDERBUFFER,null),A.depthBuffer&&(I.__webglDepthRenderbuffer=i.createRenderbuffer(),Ht(I.__webglDepthRenderbuffer,A,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(j){e.bindTexture(i.TEXTURE_CUBE_MAP,P.__webglTexture),$t(i.TEXTURE_CUBE_MAP,_);for(let W=0;W<6;W++)if(_.mipmaps&&_.mipmaps.length>0)for(let X=0;X<_.mipmaps.length;X++)St(I.__webglFramebuffer[W][X],A,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+W,X);else St(I.__webglFramebuffer[W],A,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+W,0);p(_)&&M(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(it){for(let W=0,X=z.length;W<X;W++){let ht=z[W],vt=n.get(ht),ft=i.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(ft=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(ft,vt.__webglTexture),$t(ft,ht),St(I.__webglFramebuffer,A,ht,i.COLOR_ATTACHMENT0+W,ft,0),p(ht)&&M(ft)}e.unbindTexture()}else{let W=i.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(W=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(W,P.__webglTexture),$t(W,_),_.mipmaps&&_.mipmaps.length>0)for(let X=0;X<_.mipmaps.length;X++)St(I.__webglFramebuffer[X],A,_,i.COLOR_ATTACHMENT0,W,X);else St(I.__webglFramebuffer,A,_,i.COLOR_ATTACHMENT0,W,0);p(_)&&M(W),e.unbindTexture()}A.depthBuffer&&K(A)}function ct(A){let _=A.textures;for(let I=0,P=_.length;I<P;I++){let z=_[I];if(p(z)){let j=b(A),it=n.get(z).__webglTexture;e.bindTexture(j,it),M(j),e.unbindTexture()}}}let pt=[],Ft=[];function Dt(A){if(A.samples>0){if(Wt(A)===!1){let _=A.textures,I=A.width,P=A.height,z=i.COLOR_BUFFER_BIT,j=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,it=n.get(A),W=_.length>1;if(W)for(let ht=0;ht<_.length;ht++)e.bindFramebuffer(i.FRAMEBUFFER,it.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ht,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,it.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ht,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,it.__webglMultisampledFramebuffer);let X=A.texture.mipmaps;X&&X.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,it.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,it.__webglFramebuffer);for(let ht=0;ht<_.length;ht++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(z|=i.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(z|=i.STENCIL_BUFFER_BIT)),W){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,it.__webglColorRenderbuffer[ht]);let vt=n.get(_[ht]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,vt,0)}i.blitFramebuffer(0,0,I,P,0,0,I,P,z,i.NEAREST),l===!0&&(pt.length=0,Ft.length=0,pt.push(i.COLOR_ATTACHMENT0+ht),A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&(pt.push(j),Ft.push(j),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Ft)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,pt))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),W)for(let ht=0;ht<_.length;ht++){e.bindFramebuffer(i.FRAMEBUFFER,it.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ht,i.RENDERBUFFER,it.__webglColorRenderbuffer[ht]);let vt=n.get(_[ht]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,it.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ht,i.TEXTURE_2D,vt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,it.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&l){let _=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[_])}}}function kt(A){return Math.min(s.maxSamples,A.samples)}function Wt(A){let _=n.get(A);return A.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function D(A){let _=a.render.frame;u.get(A)!==_&&(u.set(A,_),A.update())}function le(A,_){let I=A.colorSpace,P=A.format,z=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||I!==Gs&&I!==jn&&(ne.getTransfer(I)===de?(P!==mn||z!==sn)&&zt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Gt("WebGLTextures: Unsupported texture color space:",I)),_}function Qt(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(c.width=A.naturalWidth||A.width,c.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(c.width=A.displayWidth,c.height=A.displayHeight):(c.width=A.width,c.height=A.height),c}this.allocateTextureUnit=Z,this.resetTextureUnits=H,this.getTextureUnits=U,this.setTextureUnits=k,this.setTexture2D=st,this.setTexture2DArray=$,this.setTexture3D=tt,this.setTextureCube=nt,this.rebindTextures=ot,this.setupRenderTarget=lt,this.updateRenderTargetMipmap=ct,this.updateMultisampleRenderTarget=Dt,this.setupDepthRenderbuffer=K,this.setupFrameBufferTexture=St,this.useMultisampledRTT=Wt,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function h_(i,t){function e(n,s=jn){let r,a=ne.getTransfer(s);if(n===sn)return i.UNSIGNED_BYTE;if(n===fo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===po)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Fc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Oc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Nc)return i.BYTE;if(n===Uc)return i.SHORT;if(n===xs)return i.UNSIGNED_SHORT;if(n===uo)return i.INT;if(n===Tn)return i.UNSIGNED_INT;if(n===pn)return i.FLOAT;if(n===wn)return i.HALF_FLOAT;if(n===Bc)return i.ALPHA;if(n===zc)return i.RGB;if(n===mn)return i.RGBA;if(n===Nn)return i.DEPTH_COMPONENT;if(n===vi)return i.DEPTH_STENCIL;if(n===mo)return i.RED;if(n===go)return i.RED_INTEGER;if(n===yi)return i.RG;if(n===xo)return i.RG_INTEGER;if(n===_o)return i.RGBA_INTEGER;if(n===Ar||n===Rr||n===Cr||n===Ir)if(a===de)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Ar)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Rr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Cr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ir)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Ar)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Rr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Cr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ir)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===vo||n===yo||n===Mo||n===So)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===vo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===yo)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Mo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===So)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===bo||n===Eo||n===To||n===wo||n===Ao||n===Pr||n===Ro)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===bo||n===Eo)return a===de?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===To)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===wo)return r.COMPRESSED_R11_EAC;if(n===Ao)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Pr)return r.COMPRESSED_RG11_EAC;if(n===Ro)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Co||n===Io||n===Po||n===Lo||n===Do||n===No||n===Uo||n===Fo||n===Oo||n===Bo||n===zo||n===ko||n===Ho||n===Go)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Co)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Io)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Po)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Lo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Do)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===No)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Uo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Fo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Oo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Bo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===zo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===ko)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Ho)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Go)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Vo||n===Wo||n===Xo)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Vo)return a===de?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Wo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Xo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===qo||n===Yo||n===Lr||n===Zo)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===qo)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Yo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Lr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Zo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===_s?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var u_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,d_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,ah=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new ir(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new ln({vertexShader:u_,fragmentShader:d_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Ut(new De(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},oh=class extends Un{constructor(t,e){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,f=null,h=null,d=null,m=null,x=typeof XRWebGLBinding<"u",g=new ah,p={},M=e.getContextAttributes(),b=null,y=null,E=[],T=[],R=new dt,v=null,w=null,C=new He;C.viewport=new be;let L=new He;L.viewport=new be;let B=[C,L],H=new oo,U=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let et=E[J];return et===void 0&&(et=new os,E[J]=et),et.getTargetRaySpace()},this.getControllerGrip=function(J){let et=E[J];return et===void 0&&(et=new os,E[J]=et),et.getGripSpace()},this.getHand=function(J){let et=E[J];return et===void 0&&(et=new os,E[J]=et),et.getHandSpace()};function Z(J){let et=T.indexOf(J.inputSource);if(et===-1)return;let mt=E[et];mt!==void 0&&(mt.update(J.inputSource,J.frame,c||a),mt.dispatchEvent({type:J.type,data:J.inputSource}))}function Y(){s.removeEventListener("select",Z),s.removeEventListener("selectstart",Z),s.removeEventListener("selectend",Z),s.removeEventListener("squeeze",Z),s.removeEventListener("squeezestart",Z),s.removeEventListener("squeezeend",Z),s.removeEventListener("end",Y),s.removeEventListener("inputsourceschange",st);for(let J=0;J<E.length;J++){let et=T[J];et!==null&&(T[J]=null,E[J].disconnect(et))}U=null,k=null,g.reset();for(let J in p)delete p[J];if(t.setRenderTarget(b),d=null,h=null,f=null,s=null,y=null,ee.stop(),n.isPresenting=!1,t.setPixelRatio(v),t.setSize(R.width,R.height,!1),w!==null){let J=w.camera;J.fov=w.fov,J.zoom=w.zoom,J.updateProjectionMatrix(),w=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){r=J,n.isPresenting===!0&&zt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){o=J,n.isPresenting===!0&&zt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(J){c=J},this.getBaseLayer=function(){return h!==null?h:d},this.getBinding=function(){return f===null&&x&&(f=new XRWebGLBinding(s,e)),f},this.getFrame=function(){return m},this.getSession=function(){return s},this.setSession=async function(J){if(s=J,s!==null){if(b=t.getRenderTarget(),s.addEventListener("select",Z),s.addEventListener("selectstart",Z),s.addEventListener("selectend",Z),s.addEventListener("squeeze",Z),s.addEventListener("squeezestart",Z),s.addEventListener("squeezeend",Z),s.addEventListener("end",Y),s.addEventListener("inputsourceschange",st),M.xrCompatible!==!0&&await e.makeXRCompatible(),v=t.getPixelRatio(),t.getSize(R),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let mt=null,Bt=null,St=null;M.depth&&(St=M.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,mt=M.stencil?vi:Nn,Bt=M.stencil?_s:Tn);let Ht={colorFormat:e.RGBA8,depthFormat:St,scaleFactor:r};f=this.getBinding(),h=f.createProjectionLayer(Ht),s.updateRenderState({layers:[h]}),t.setPixelRatio(1),t.setSize(h.textureWidth,h.textureHeight,!1),y=new nn(h.textureWidth,h.textureHeight,{format:mn,type:sn,depthTexture:new di(h.textureWidth,h.textureHeight,Bt,void 0,void 0,void 0,void 0,void 0,void 0,mt),stencilBuffer:M.stencil,colorSpace:t.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let mt={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,e,mt),s.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),y=new nn(d.framebufferWidth,d.framebufferHeight,{format:mn,type:sn,colorSpace:t.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),ee.setContext(s),ee.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function st(J){for(let et=0;et<J.removed.length;et++){let mt=J.removed[et],Bt=T.indexOf(mt);Bt>=0&&(T[Bt]=null,E[Bt].disconnect(mt))}for(let et=0;et<J.added.length;et++){let mt=J.added[et],Bt=T.indexOf(mt);if(Bt===-1){for(let Ht=0;Ht<E.length;Ht++)if(Ht>=T.length){T.push(mt),Bt=Ht;break}else if(T[Ht]===null){T[Ht]=mt,Bt=Ht;break}if(Bt===-1)break}let St=E[Bt];St&&St.connect(mt)}}let $=new N,tt=new N;function nt(J,et,mt){$.setFromMatrixPosition(et.matrixWorld),tt.setFromMatrixPosition(mt.matrixWorld);let Bt=$.distanceTo(tt),St=et.projectionMatrix.elements,Ht=mt.projectionMatrix.elements,oe=St[14]/(St[10]-1),K=St[14]/(St[10]+1),ot=(St[9]+1)/St[5],lt=(St[9]-1)/St[5],ct=(St[8]-1)/St[0],pt=(Ht[8]+1)/Ht[0],Ft=oe*ct,Dt=oe*pt,kt=Bt/(-ct+pt),Wt=kt*-ct;if(et.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(Wt),J.translateZ(kt),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),St[10]===-1)J.projectionMatrix.copy(et.projectionMatrix),J.projectionMatrixInverse.copy(et.projectionMatrixInverse);else{let D=oe+kt,le=K+kt,Qt=Ft-Wt,A=Dt+(Bt-Wt),_=ot*K/le*D,I=lt*K/le*D;J.projectionMatrix.makePerspective(Qt,A,_,I,D,le),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function It(J,et){et===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(et.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(s===null)return;let et=J.near,mt=J.far;g.texture!==null&&(g.depthNear>0&&(et=g.depthNear),g.depthFar>0&&(mt=g.depthFar)),H.near=L.near=C.near=et,H.far=L.far=C.far=mt,(U!==H.near||k!==H.far)&&(s.updateRenderState({depthNear:H.near,depthFar:H.far}),U=H.near,k=H.far),H.layers.mask=J.layers.mask|6,C.layers.mask=H.layers.mask&-5,L.layers.mask=H.layers.mask&-3;let Bt=J.parent,St=H.cameras;It(H,Bt);for(let Ht=0;Ht<St.length;Ht++)It(St[Ht],Bt);St.length===2?nt(H,C,L):H.projectionMatrix.copy(C.projectionMatrix),w===null&&J.isPerspectiveCamera&&(w={camera:J,fov:J.fov,zoom:J.zoom}),rt(J,H,Bt)};function rt(J,et,mt){mt===null?J.matrix.copy(et.matrixWorld):(J.matrix.copy(mt.matrixWorld),J.matrix.invert(),J.matrix.multiply(et.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(et.projectionMatrix),J.projectionMatrixInverse.copy(et.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=Xs*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return H},this.getFoveation=function(){if(!(h===null&&d===null))return l},this.setFoveation=function(J){l=J,h!==null&&(h.fixedFoveation=J),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=J)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(H)},this.getCameraTexture=function(J){return p[J]};let ie=null;function $t(J,et){if(u=et.getViewerPose(c||a),m=et,u!==null){let mt=u.views;d!==null&&(t.setRenderTargetFramebuffer(y,d.framebuffer),t.setRenderTarget(y));let Bt=!1;mt.length!==H.cameras.length&&(H.cameras.length=0,Bt=!0);for(let K=0;K<mt.length;K++){let ot=mt[K],lt=null;if(d!==null)lt=d.getViewport(ot);else{let pt=f.getViewSubImage(h,ot);lt=pt.viewport,K===0&&(t.setRenderTargetTextures(y,pt.colorTexture,pt.depthStencilTexture),t.setRenderTarget(y))}let ct=B[K];ct===void 0&&(ct=new He,ct.layers.enable(K),ct.viewport=new be,B[K]=ct),ct.matrix.fromArray(ot.transform.matrix),ct.matrix.decompose(ct.position,ct.quaternion,ct.scale),ct.projectionMatrix.fromArray(ot.projectionMatrix),ct.projectionMatrixInverse.copy(ct.projectionMatrix).invert(),ct.viewport.set(lt.x,lt.y,lt.width,lt.height),K===0&&(H.matrix.copy(ct.matrix),H.matrix.decompose(H.position,H.quaternion,H.scale)),Bt===!0&&H.cameras.push(ct)}let St=s.enabledFeatures;if(St&&St.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){f=n.getBinding();let K=f.getDepthInformation(mt[0]);K&&K.isValid&&K.texture&&g.init(K,s.renderState)}if(St&&St.includes("camera-access")&&x){t.state.unbindTexture(),f=n.getBinding();for(let K=0;K<mt.length;K++){let ot=mt[K].camera;if(ot){let lt=p[ot];lt||(lt=new ir,p[ot]=lt);let ct=f.getCameraImage(ot);lt.sourceTexture=ct}}}}for(let mt=0;mt<E.length;mt++){let Bt=T[mt],St=E[mt];Bt!==null&&St!==void 0&&St.update(Bt,et,c||a)}ie&&ie(J,et),et.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:et}),m=null}let ee=new Sd;ee.setAnimationLoop($t),this.setAnimationLoop=function(J){ie=J},this.dispose=function(){}}},f_=new fe,Rd=new Xt;Rd.set(-1,0,0,0,1,0,0,0,1);function p_(i,t){function e(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function n(g,p){p.color.getRGB(g.fogColor.value,Vc(i)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function s(g,p,M,b,y){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(g,p):p.isMeshLambertMaterial?(r(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(g,p),f(g,p)):p.isMeshPhongMaterial?(r(g,p),u(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(g,p),h(g,p),p.isMeshPhysicalMaterial&&d(g,p,y)):p.isMeshMatcapMaterial?(r(g,p),m(g,p)):p.isMeshDepthMaterial?r(g,p):p.isMeshDistanceMaterial?(r(g,p),x(g,p)):p.isMeshNormalMaterial?r(g,p):p.isLineBasicMaterial?(a(g,p),p.isLineDashedMaterial&&o(g,p)):p.isPointsMaterial?l(g,p,M,b):p.isSpriteMaterial?c(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,e(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,e(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===Ve&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,e(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===Ve&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,e(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,e(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);let M=t.get(p),b=M.envMap,y=M.envMapRotation;b&&(g.envMap.value=b,g.envMapRotation.value.setFromMatrix4(f_.makeRotationFromEuler(y)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(Rd),g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,g.aoMapTransform))}function a(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,e(p.map,g.mapTransform))}function o(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function l(g,p,M,b){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*M,g.scale.value=b*.5,p.map&&(g.map.value=p.map,e(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function c(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,e(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function u(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function f(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function h(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function d(g,p,M){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Ve&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.retroreflectivity>0&&(g.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=M.texture,g.transmissionSamplerSize.value.set(M.width,M.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,p){p.matcap&&(g.matcap.value=p.matcap)}function x(g,p){let M=t.get(p).light;g.referencePosition.value.setFromMatrixPosition(M.matrixWorld),g.nearDistance.value=M.shadow.camera.near,g.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function m_(i,t,e,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,E){let T=E.program;n.uniformBlockBinding(y,T)}function c(y,E){let T=s[y.id];T===void 0&&(g(y),T=u(y),s[y.id]=T,y.addEventListener("dispose",M));let R=E.program;n.updateUBOMapping(y,R);let v=t.render.frame;r[y.id]!==v&&(h(y),r[y.id]=v)}function u(y){let E=f();y.__bindingPointIndex=E;let T=i.createBuffer(),R=y.__size,v=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,T),i.bufferData(i.UNIFORM_BUFFER,R,v),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,E,T),T}function f(){for(let y=0;y<o;y++)if(a.indexOf(y)===-1)return a.push(y),y;return Gt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(y){let E=s[y.id],T=y.uniforms,R=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let v=0,w=T.length;v<w;v++){let C=T[v];if(Array.isArray(C))for(let L=0,B=C.length;L<B;L++)d(C[L],v,L,R);else d(C,v,0,R)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function d(y,E,T,R){if(x(y,E,T,R)===!0){let v=y.__offset,w=y.value;if(Array.isArray(w)){let C=0;for(let L=0;L<w.length;L++){let B=w[L],H=p(B);m(B,y.__data,C),typeof B!="number"&&typeof B!="boolean"&&!B.isMatrix3&&!ArrayBuffer.isView(B)&&(C+=H.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(w,y.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,v,y.__data)}}function m(y,E,T){typeof y=="number"||typeof y=="boolean"?E[0]=y:y.isMatrix3?(E[0]=y.elements[0],E[1]=y.elements[1],E[2]=y.elements[2],E[3]=0,E[4]=y.elements[3],E[5]=y.elements[4],E[6]=y.elements[5],E[7]=0,E[8]=y.elements[6],E[9]=y.elements[7],E[10]=y.elements[8],E[11]=0):ArrayBuffer.isView(y)?E.set(new y.constructor(y.buffer,y.byteOffset,E.length)):y.toArray(E,T)}function x(y,E,T,R){let v=y.value,w=E+"_"+T;if(R[w]===void 0)return typeof v=="number"||typeof v=="boolean"?R[w]=v:ArrayBuffer.isView(v)?R[w]=v.slice():R[w]=v.clone(),!0;{let C=R[w];if(typeof v=="number"||typeof v=="boolean"){if(C!==v)return R[w]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(C.equals(v)===!1)return C.copy(v),!0}}return!1}function g(y){let E=y.uniforms,T=0,R=16;for(let w=0,C=E.length;w<C;w++){let L=Array.isArray(E[w])?E[w]:[E[w]];for(let B=0,H=L.length;B<H;B++){let U=L[B],k=Array.isArray(U.value)?U.value:[U.value];for(let Z=0,Y=k.length;Z<Y;Z++){let st=k[Z],$=p(st),tt=T%R,nt=tt%$.boundary,It=tt+nt;T+=nt,It!==0&&R-It<$.storage&&(T+=R-It),U.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=T,T+=$.storage}}}let v=T%R;return v>0&&(T+=R-v),y.__size=T,y.__cache={},this}function p(y){let E={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(E.boundary=4,E.storage=4):y.isVector2?(E.boundary=8,E.storage=8):y.isVector3||y.isColor?(E.boundary=16,E.storage=12):y.isVector4?(E.boundary=16,E.storage=16):y.isMatrix3?(E.boundary=48,E.storage=48):y.isMatrix4?(E.boundary=64,E.storage=64):y.isTexture?zt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(E.boundary=16,E.storage=y.byteLength):zt("WebGLRenderer: Unsupported uniform value type.",y),E}function M(y){let E=y.target;E.removeEventListener("dispose",M);let T=a.indexOf(E.__bindingPointIndex);a.splice(T,1),i.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function b(){for(let y in s)i.deleteBuffer(s[y]);a=[],s={},r={}}return{bind:l,update:c,dispose:b}}var g_=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),zn=null;function x_(){return zn===null&&(zn=new Qs(g_,16,16,yi,wn),zn.name="DFG_LUT",zn.minFilter=Ge,zn.magFilter=Ge,zn.wrapS=Dn,zn.wrapT=Dn,zn.generateMipmaps=!1,zn.needsUpdate=!0),zn}var Fr=class{constructor(t={}){let{canvas:e=Vu(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:h=!1,outputBufferType:d=sn}=t;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=n.getContextAttributes().alpha}else m=a;let x=d,g=new Set([_o,xo,go]),p=new Set([sn,Tn,xs,_s,fo,po]),M=new Uint32Array(4),b=new Int32Array(4),y=new N,E=null,T=null,R=[],v=[],w=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=En,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let C=this,L=!1,B=null,H=null,U=null,k=null;this._outputColorSpace=Pe;let Z=0,Y=0,st=null,$=-1,tt=null,nt=new be,It=new be,rt=null,ie=new At(0),$t=0,ee=e.width,J=e.height,et=1,mt=null,Bt=null,St=new be(0,0,ee,J),Ht=new be(0,0,ee,J),oe=!1,K=new ls,ot=!1,lt=!1,ct=new fe,pt=new N,Ft=new be,Dt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},kt=!1;function Wt(){return st===null?et:1}let D=n;function le(S,F){return e.getContext(S,F)}let Qt,A,_,I,P,z,j,it,W,X,ht,vt,ft,ut,Et,Ot,Zt,O,gt,Q,xt,bt,at;try{let S={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:f};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",xe,!1),e.addEventListener("webglcontextrestored",he,!1),e.addEventListener("webglcontextcreationerror",xn,!1),D===null){let F="webgl2";if(D=le(F,S),D===null)throw le(F)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Nt()}catch(S){throw e.removeEventListener("webglcontextlost",xe,!1),e.removeEventListener("webglcontextrestored",he,!1),e.removeEventListener("webglcontextcreationerror",xn,!1),Gt("WebGLRenderer: "+S.message),S}function Nt(){Qt=new Eg(D),Qt.init(),xt=new h_(D,Qt),A=new pg(D,Qt,t,xt),_=new l_(D,Qt),A.reversedDepthBuffer&&h&&_.buffers.depth.setReversed(!0),H=D.createFramebuffer(),U=D.createFramebuffer(),k=D.createFramebuffer(),I=new Ag(D),P=new Zx,z=new c_(D,Qt,_,P,A,xt,I),j=new bg(C),it=new Cp(D),bt=new dg(D,it),W=new Tg(D,it,I,bt),X=new Cg(D,W,it,bt,I),O=new Rg(D,A,z),Et=new mg(P),ht=new Yx(C,j,Qt,A,bt,Et),vt=new p_(C,P),ft=new Jx,ut=new n_(Qt),Zt=new ug(C,j,_,X,m,l),Ot=new o_(C,X,A),at=new m_(D,I,A,_),gt=new fg(D,Qt,I),Q=new wg(D,Qt,I),I.programs=ht.programs,C.capabilities=A,C.extensions=Qt,C.properties=P,C.renderLists=ft,C.shadowMap=Ot,C.state=_,C.info=I}x!==sn&&(w=new Pg(x,e.width,e.height,o,s,r));let Pt=new oh(C,D);this.xr=Pt,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){let S=Qt.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){let S=Qt.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return et},this.setPixelRatio=function(S){S!==void 0&&(et=S,this.setSize(ee,J,!1))},this.getSize=function(S){return S.set(ee,J)},this.setSize=function(S,F,q=!0){if(Pt.isPresenting){zt("WebGLRenderer: Can't change size while VR device is presenting.");return}ee=S,J=F,e.width=Math.floor(S*et),e.height=Math.floor(F*et),q===!0&&(e.style.width=S+"px",e.style.height=F+"px"),w!==null&&w.setSize(e.width,e.height),this.setViewport(0,0,S,F)},this.getDrawingBufferSize=function(S){return S.set(ee*et,J*et).floor()},this.setDrawingBufferSize=function(S,F,q){ee=S,J=F,et=q,e.width=Math.floor(S*q),e.height=Math.floor(F*q),this.setViewport(0,0,S,F)},this.setEffects=function(S){if(x===sn){Gt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(S){for(let F=0;F<S.length;F++)if(S[F].isOutputPass===!0){zt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}w.setEffects(S||[])},this.getCurrentViewport=function(S){return S.copy(nt)},this.getViewport=function(S){return S.copy(St)},this.setViewport=function(S,F,q,G){S.isVector4?St.set(S.x,S.y,S.z,S.w):St.set(S,F,q,G),_.viewport(nt.copy(St).multiplyScalar(et).round())},this.getScissor=function(S){return S.copy(Ht)},this.setScissor=function(S,F,q,G){S.isVector4?Ht.set(S.x,S.y,S.z,S.w):Ht.set(S,F,q,G),_.scissor(It.copy(Ht).multiplyScalar(et).round())},this.getScissorTest=function(){return oe},this.setScissorTest=function(S){_.setScissorTest(oe=S)},this.setOpaqueSort=function(S){mt=S},this.setTransparentSort=function(S){Bt=S},this.getClearColor=function(S){return S.copy(Zt.getClearColor())},this.setClearColor=function(){Zt.setClearColor(...arguments)},this.getClearAlpha=function(){return Zt.getClearAlpha()},this.setClearAlpha=function(){Zt.setClearAlpha(...arguments)},this.clear=function(S=!0,F=!0,q=!0){let G=0;if(S){let V=!1;if(st!==null){let Mt=st.texture.format;V=g.has(Mt)}if(V){let Mt=st.texture.type,wt=p.has(Mt),yt=Zt.getClearColor(),Rt=Zt.getClearAlpha(),Lt=yt.r,Jt=yt.g,te=yt.b;wt?(M[0]=Lt,M[1]=Jt,M[2]=te,M[3]=Rt,D.clearBufferuiv(D.COLOR,0,M)):(b[0]=Lt,b[1]=Jt,b[2]=te,b[3]=Rt,D.clearBufferiv(D.COLOR,0,b))}else G|=D.COLOR_BUFFER_BIT}F&&(G|=D.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),q&&(G|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&D.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(S){S.setRenderer(this),B=S},this.dispose=function(){e.removeEventListener("webglcontextlost",xe,!1),e.removeEventListener("webglcontextrestored",he,!1),e.removeEventListener("webglcontextcreationerror",xn,!1),Zt.dispose(),ft.dispose(),ut.dispose(),P.dispose(),j.dispose(),X.dispose(),bt.dispose(),at.dispose(),ht.dispose(),Pt.dispose(),Pt.removeEventListener("sessionstart",Mh),Pt.removeEventListener("sessionend",Sh),bi.stop()};function xe(S){S.preventDefault(),Hc("WebGLRenderer: Context Lost."),L=!0}function he(){Hc("WebGLRenderer: Context Restored."),L=!1;let S=I.autoReset,F=Ot.enabled,q=Ot.autoUpdate,G=Ot.needsUpdate,V=Ot.type;Nt(),I.autoReset=S,Ot.enabled=F,Ot.autoUpdate=q,Ot.needsUpdate=G,Ot.type=V}function xn(S){Gt("WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function In(S){let F=S.target;F.removeEventListener("dispose",In),ff(F)}function ff(S){pf(S),P.remove(S)}function pf(S){let F=P.get(S).programs;F!==void 0&&(F.forEach(function(q){ht.releaseProgram(q)}),S.isShaderMaterial&&ht.releaseShaderCache(S))}this.renderBufferDirect=function(S,F,q,G,V,Mt){F===null&&(F=Dt);let wt=V.isMesh&&V.matrixWorld.determinantAffine()<0,yt=xf(S,F,q,G,V);_.setMaterial(G,wt);let Rt=q.index,Lt=1;if(G.wireframe===!0){if(Rt=W.getWireframeAttribute(q),Rt===void 0)return;Lt=2}let Jt=q.drawRange,te=q.attributes.position,Ct=Jt.start*Lt,ue=(Jt.start+Jt.count)*Lt;Mt!==null&&(Ct=Math.max(Ct,Mt.start*Lt),ue=Math.min(ue,(Mt.start+Mt.count)*Lt)),Rt!==null?(Ct=Math.max(Ct,0),ue=Math.min(ue,Rt.count)):te!=null&&(Ct=Math.max(Ct,0),ue=Math.min(ue,te.count));let Ce=ue-Ct;if(Ce<0||Ce===1/0)return;bt.setup(V,G,yt,q,Rt);let ye,ge=gt;if(Rt!==null&&(ye=it.get(Rt),ge=Q,ge.setIndex(ye)),V.isMesh)G.wireframe===!0?(_.setLineWidth(G.wireframeLinewidth*Wt()),ge.setMode(D.LINES)):ge.setMode(D.TRIANGLES);else if(V.isLine){let We=G.linewidth;We===void 0&&(We=1),_.setLineWidth(We*Wt()),V.isLineSegments?ge.setMode(D.LINES):V.isLineLoop?ge.setMode(D.LINE_LOOP):ge.setMode(D.LINE_STRIP)}else V.isPoints?ge.setMode(D.POINTS):V.isSprite&&ge.setMode(D.TRIANGLES);if(V.isBatchedMesh)if(Qt.get("WEBGL_multi_draw"))ge.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{let We=V._multiDrawStarts,Tt=V._multiDrawCounts,Je=V._multiDrawCount,re=Rt?it.get(Rt).bytesPerElement:1,un=P.get(G).currentProgram.getUniforms();for(let Pn=0;Pn<Je;Pn++)un.setValue(D,"_gl_DrawID",Pn),ge.render(We[Pn]/re,Tt[Pn])}else if(V.isInstancedMesh)ge.renderInstances(Ct,Ce,V.count);else if(q.isInstancedBufferGeometry){let We=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,Tt=Math.min(q.instanceCount,We);ge.renderInstances(Ct,Ce,Tt)}else ge.render(Ct,Ce)};function yh(S,F,q,G){B!==null&&S.isNodeMaterial&&B.setObject(G,S),ot===!0&&Et.setState(S,q,!1),S.transparent===!0&&S.side===Qe&&S.forceSinglePass===!1?(S.side=Ve,S.needsUpdate=!0,Kr(S,F,G),S.side=gi,S.needsUpdate=!0,Kr(S,F,G),S.side=Qe):Kr(S,F,G)}this.compile=function(S,F,q=null){q===null&&(q=S),B!==null&&B.renderStart(S,F,q),T=ut.get(q),T.init(F),v.push(T),q.traverseVisible(function(V){V.isLight&&V.layers.test(F.layers)&&(T.pushLight(V),V.castShadow&&T.pushShadow(V))}),S!==q&&S.traverseVisible(function(V){V.isLight&&V.layers.test(F.layers)&&(T.pushLight(V),V.castShadow&&T.pushShadow(V))}),T.setupLights(),B!==null&&B.updateLights(T.state.lightsArray),lt=this.localClippingEnabled,ot=Et.init(this.clippingPlanes,lt),ot===!0&&Et.setGlobalState(this.clippingPlanes,F),B!==null&&Ot.render(T.state.shadowsArray,q,F);let G=new Set;return S.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;let Mt=V.material;if(Mt)if(Array.isArray(Mt))for(let wt=0;wt<Mt.length;wt++){let yt=Mt[wt];yh(yt,q,F,V),G.add(yt)}else yh(Mt,q,F,V),G.add(Mt)}),T=v.pop(),B!==null&&B.renderEnd(),G},this.compileAsync=function(S,F,q=null){let G=this.compile(S,F,q);return new Promise(V=>{function Mt(){if(G.forEach(function(wt){let Rt=P.get(wt).currentProgram;(Rt===void 0||Rt.isReady())&&G.delete(wt)}),G.size===0){V(S);return}setTimeout(Mt,10)}Qt.get("KHR_parallel_shader_compile")!==null?Mt():setTimeout(Mt,10)})};let Ll=null;function mf(S){Ll&&Ll(S)}function Mh(){bi.stop()}function Sh(){bi.start()}let bi=new Sd;bi.setAnimationLoop(mf),typeof self<"u"&&bi.setContext(self),this.setAnimationLoop=function(S){Ll=S,Pt.setAnimationLoop(S),S===null?bi.stop():bi.start()},Pt.addEventListener("sessionstart",Mh),Pt.addEventListener("sessionend",Sh),this.render=function(S,F){if(F!==void 0&&F.isCamera!==!0){Gt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;B!==null&&B.renderStart(S,F);let q=Pt.enabled===!0&&Pt.isPresenting===!0,G=w!==null&&(st===null||q)&&w.begin(C,st);if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),Pt.enabled===!0&&Pt.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(Pt.cameraAutoUpdate===!0&&Pt.updateCamera(F),F=Pt.getCamera()),S.isScene===!0&&S.onBeforeRender(C,S,F,st),T=ut.get(S,v.length),T.init(F),T.state.textureUnits=z.getTextureUnits(),v.push(T),ct.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),K.setFromProjectionMatrix(ct,Sn,F.reversedDepth),lt=this.localClippingEnabled,ot=Et.init(this.clippingPlanes,lt),E=ft.get(S,R.length),E.init(),R.push(E),Pt.enabled===!0&&Pt.isPresenting===!0){let wt=C.xr.getDepthSensingMesh();wt!==null&&Dl(wt,F,-1/0,C.sortObjects)}Dl(S,F,0,C.sortObjects),E.finish(),B!==null&&B.updateLights(T.state.lightsArray),C.sortObjects===!0&&E.sort(mt,Bt),kt=Pt.enabled===!1||Pt.isPresenting===!1||Pt.hasDepthSensing()===!1,kt&&Zt.addToRenderList(E,S),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ot===!0&&Et.beginShadows();let V=T.state.shadowsArray;if(Ot.render(V,S,F),ot===!0&&Et.endShadows(),(G&&w.hasRenderPass())===!1){let wt=E.opaque,yt=E.transmissive;if(T.setupLights(),F.isArrayCamera){let Rt=F.cameras;if(yt.length>0)for(let Lt=0,Jt=Rt.length;Lt<Jt;Lt++){let te=Rt[Lt];Eh(wt,yt,S,te)}kt&&Zt.render(S);for(let Lt=0,Jt=Rt.length;Lt<Jt;Lt++){let te=Rt[Lt];bh(E,S,te,te.viewport)}}else yt.length>0&&Eh(wt,yt,S,F),kt&&Zt.render(S),bh(E,S,F)}st!==null&&Y===0&&(z.updateMultisampleRenderTarget(st),z.updateRenderTargetMipmap(st)),G&&w.end(C),S.isScene===!0&&S.onAfterRender(C,S,F),bt.resetDefaultState(),$=-1,tt=null,v.pop(),v.length>0?(T=v[v.length-1],z.setTextureUnits(T.state.textureUnits),ot===!0&&Et.setGlobalState(C.clippingPlanes,T.state.camera)):T=null,R.pop(),R.length>0?E=R[R.length-1]:E=null,B!==null&&B.renderEnd()};function Dl(S,F,q,G){if(S.visible===!1)return;if(S.layers.test(F.layers)){if(S.isGroup)q=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(F);else if(S.isLightProbeGrid)T.pushLightProbeGrid(S);else if(S.isLight)T.pushLight(S),S.castShadow&&T.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||S.intersectsFrustum(K)){G&&Ft.setFromMatrixPosition(S.matrixWorld).applyMatrix4(ct);let wt=X.update(S),yt=S.material;yt.visible&&E.push(S,wt,yt,q,Ft.z,null,F)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||S.intersectsFrustum(K))){let wt=X.update(S),yt=S.material;if(G&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),Ft.copy(S.boundingSphere.center)):(wt.boundingSphere===null&&wt.computeBoundingSphere(),Ft.copy(wt.boundingSphere.center)),Ft.applyMatrix4(S.matrixWorld).applyMatrix4(ct)),Array.isArray(yt)){let Rt=wt.groups;for(let Lt=0,Jt=Rt.length;Lt<Jt;Lt++){let te=Rt[Lt],Ct=yt[te.materialIndex];Ct&&Ct.visible&&E.push(S,wt,Ct,q,Ft.z,te,F)}}else yt.visible&&E.push(S,wt,yt,q,Ft.z,null,F)}}let Mt=S.children;for(let wt=0,yt=Mt.length;wt<yt;wt++)Dl(Mt[wt],F,q,G)}function bh(S,F,q,G){let{opaque:V,transmissive:Mt,transparent:wt}=S;T.setupLightsView(q),ot===!0&&Et.setGlobalState(C.clippingPlanes,q),G&&_.viewport(nt.copy(G)),V.length>0&&Jr(V,F,q),Mt.length>0&&Jr(Mt,F,q),wt.length>0&&Jr(wt,F,q),_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),_.setPolygonOffset(!1)}function Eh(S,F,q,G){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[G.id]===void 0){let Ct=Qt.has("EXT_color_buffer_half_float")||Qt.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[G.id]=new nn(1,1,{generateMipmaps:!0,type:Ct?wn:sn,minFilter:_i,samples:Math.max(4,A.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:ne.workingColorSpace})}let Mt=T.state.transmissionRenderTarget[G.id],wt=G.viewport||nt;Mt.setSize(wt.z*C.transmissionResolutionScale,wt.w*C.transmissionResolutionScale);let yt=C.getRenderTarget(),Rt=C.getActiveCubeFace(),Lt=C.getActiveMipmapLevel();C.setRenderTarget(Mt),C.getClearColor(ie),$t=C.getClearAlpha(),$t<1&&C.setClearColor(16777215,.5),C.clear(),kt&&Zt.render(q);let Jt=C.toneMapping;C.toneMapping=En;let te=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),T.setupLightsView(G),ot===!0&&Et.setGlobalState(C.clippingPlanes,G),Jr(S,q,G),z.updateMultisampleRenderTarget(Mt),z.updateRenderTargetMipmap(Mt),Qt.has("WEBGL_multisampled_render_to_texture")===!1){let Ct=!1;for(let ue=0,Ce=F.length;ue<Ce;ue++){let ye=F[ue],{object:ge,geometry:We,material:Tt,group:Je}=ye;if(Tt.side===Qe&&ge.layers.test(G.layers)){let re=Tt.side;Tt.side=Ve,Tt.needsUpdate=!0,Th(ge,q,G,We,Tt,Je),Tt.side=re,Tt.needsUpdate=!0,Ct=!0}}Ct===!0&&(z.updateMultisampleRenderTarget(Mt),z.updateRenderTargetMipmap(Mt))}C.setRenderTarget(yt,Rt,Lt),C.setClearColor(ie,$t),te!==void 0&&(G.viewport=te),C.toneMapping=Jt}function Jr(S,F,q){let G=F.isScene===!0?F.overrideMaterial:null;for(let V=0,Mt=S.length;V<Mt;V++){let wt=S[V],{object:yt,geometry:Rt,group:Lt}=wt,Jt=wt.material;Jt.allowOverride===!0&&G!==null&&(Jt=G),yt.layers.test(q.layers)&&Th(yt,F,q,Rt,Jt,Lt)}}function Th(S,F,q,G,V,Mt){B!==null&&V.isNodeMaterial&&B.setObject(S,V),S.onBeforeRender(C,F,q,G,V,Mt),S.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),V.onBeforeRender(C,F,q,G,S,Mt),V.transparent===!0&&V.side===Qe&&V.forceSinglePass===!1?(V.side=Ve,V.needsUpdate=!0,C.renderBufferDirect(q,F,G,V,S,Mt),V.side=gi,V.needsUpdate=!0,C.renderBufferDirect(q,F,G,V,S,Mt),V.side=Qe):C.renderBufferDirect(q,F,G,V,S,Mt),S.onAfterRender(C,F,q,G,V,Mt)}function Kr(S,F,q){F.isScene!==!0&&(F=Dt);let G=P.get(S),V=T.state.lights,Mt=T.state.shadowsArray,wt=V.state.version,yt=ht.getParameters(S,V.state,Mt,F,q,T.state.lightProbeGridArray),Rt=ht.getProgramCacheKey(yt),Lt=G.programs;G.environment=S.isMeshStandardMaterial||S.isMeshLambertMaterial||S.isMeshPhongMaterial?F.environment:null,G.fog=F.fog;let Jt=S.isMeshStandardMaterial||S.isMeshLambertMaterial&&!S.envMap||S.isMeshPhongMaterial&&!S.envMap;G.envMap=j.get(S.envMap||G.environment,Jt),G.envMapRotation=G.environment!==null&&S.envMap===null?F.environmentRotation:S.envMapRotation,Lt===void 0&&(S.addEventListener("dispose",In),Lt=new Map,G.programs=Lt);let te=Lt.get(Rt);if(te!==void 0){if(G.currentProgram===te&&G.lightsStateVersion===wt)return Ah(S,yt),te}else yt.uniforms=ht.getUniforms(S),B!==null&&S.isNodeMaterial&&B.build(S,q,yt),S.onBeforeCompile(yt,C),te=ht.acquireProgram(yt,Rt),Lt.set(Rt,te),G.uniforms=yt.uniforms;let Ct=G.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Ct.clippingPlanes=Et.uniform),Ah(S,yt),G.needsLights=vf(S),G.lightsStateVersion=wt,G.needsLights&&(Ct.ambientLightColor.value=V.state.ambient,Ct.lightProbe.value=V.state.probe,Ct.sunLights.value=V.state.sun,Ct.sunLightShadows.value=V.state.sunShadow,Ct.directionalLights.value=V.state.directional,Ct.directionalLightShadows.value=V.state.directionalShadow,Ct.spotLights.value=V.state.spot,Ct.spotLightShadows.value=V.state.spotShadow,Ct.rectAreaLights.value=V.state.rectArea,Ct.ltc_1.value=V.state.rectAreaLTC1,Ct.ltc_2.value=V.state.rectAreaLTC2,Ct.pointLights.value=V.state.point,Ct.pointLightShadows.value=V.state.pointShadow,Ct.hemisphereLights.value=V.state.hemi,Ct.sunShadowMatrix.value=V.state.sunShadowMatrix,Ct.sunShadowCascade.value=V.state.sunShadowCascade,Ct.directionalShadowMatrix.value=V.state.directionalShadowMatrix,Ct.spotLightMatrix.value=V.state.spotLightMatrix,Ct.spotLightMap.value=V.state.spotLightMap,Ct.pointShadowMatrix.value=V.state.pointShadowMatrix),G.lightProbeGrid=T.state.lightProbeGridArray.length>0,G.currentProgram=te,G.uniformsList=null,te}function wh(S){if(S.uniformsList===null){let F=S.currentProgram.getUniforms();S.uniformsList=Ss.seqWithValue(F.seq,S.uniforms)}return S.uniformsList}function Ah(S,F){let q=P.get(S);q.outputColorSpace=F.outputColorSpace,q.batching=F.batching,q.batchingColor=F.batchingColor,q.instancing=F.instancing,q.instancingColor=F.instancingColor,q.instancingMorph=F.instancingMorph,q.skinning=F.skinning,q.morphTargets=F.morphTargets,q.morphNormals=F.morphNormals,q.morphColors=F.morphColors,q.morphTargetsCount=F.morphTargetsCount,q.numClippingPlanes=F.numClippingPlanes,q.numIntersection=F.numClipIntersection,q.vertexAlphas=F.vertexAlphas,q.vertexTangents=F.vertexTangents,q.toneMapping=F.toneMapping}function gf(S,F){if(S.length===0)return null;if(S.length===1)return S[0].texture!==null?S[0]:null;y.setFromMatrixPosition(F.matrixWorld);for(let q=0,G=S.length;q<G;q++){let V=S[q];if(V.texture!==null&&V.boundingBox.containsPoint(y))return V}return null}function xf(S,F,q,G,V){F.isScene!==!0&&(F=Dt),z.resetTextureUnits();let Mt=F.fog,wt=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?F.environment:null,yt=st===null?C.outputColorSpace:st.isXRRenderTarget===!0?st.texture.colorSpace:ne.workingColorSpace,Rt=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,Lt=j.get(G.envMap||wt,Rt),Jt=G.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,te=!!q.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Ct=!!q.morphAttributes.position,ue=!!q.morphAttributes.normal,Ce=!!q.morphAttributes.color,ye=En;G.toneMapped&&(st===null||st.isXRRenderTarget===!0)&&(ye=C.toneMapping);let ge=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,We=ge!==void 0?ge.length:0,Tt=P.get(G),Je=T.state.lights;if(ot===!0&&(lt===!0||S!==tt)){let _e=S===tt&&G.id===$;Et.setState(G,S,_e)}let re=!1;G.version===Tt.__version?(Tt.needsLights&&Tt.lightsStateVersion!==Je.state.version||Tt.outputColorSpace!==yt||V.isBatchedMesh&&Tt.batching===!1||!V.isBatchedMesh&&Tt.batching===!0||V.isBatchedMesh&&Tt.batchingColor===!0&&V._colorsTexture===null||V.isBatchedMesh&&Tt.batchingColor===!1&&V._colorsTexture!==null||V.isInstancedMesh&&Tt.instancing===!1||!V.isInstancedMesh&&Tt.instancing===!0||V.isSkinnedMesh&&Tt.skinning===!1||!V.isSkinnedMesh&&Tt.skinning===!0||V.isInstancedMesh&&Tt.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&Tt.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&Tt.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&Tt.instancingMorph===!1&&V.morphTexture!==null||Tt.envMap!==Lt||G.fog===!0&&Tt.fog!==Mt||Tt.numClippingPlanes!==void 0&&(Tt.numClippingPlanes!==Et.numPlanes||Tt.numIntersection!==Et.numIntersection)||Tt.vertexAlphas!==Jt||Tt.vertexTangents!==te||Tt.morphTargets!==Ct||Tt.morphNormals!==ue||Tt.morphColors!==Ce||Tt.toneMapping!==ye||Tt.morphTargetsCount!==We||!!Tt.lightProbeGrid!=T.state.lightProbeGridArray.length>0)&&(re=!0):(re=!0,Tt.__version=G.version);let un=Tt.currentProgram;re===!0&&(un=Kr(G,F,V),B&&G.isNodeMaterial&&B.onUpdateProgram(G,un,Tt));let Pn=!1,ii=!1,zi=!1,me=un.getUniforms(),Re=Tt.uniforms;if(_.useProgram(un.program)&&(Pn=!0,ii=!0,zi=!0),G.id!==$&&($=G.id,ii=!0),Tt.needsLights){let _e=gf(T.state.lightProbeGridArray,V);Tt.lightProbeGrid!==_e&&(Tt.lightProbeGrid=_e,ii=!0)}if(Pn||tt!==S){_.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),me.setValue(D,"projectionMatrix",S.projectionMatrix),me.setValue(D,"viewMatrix",S.matrixWorldInverse);let ri=me.map.cameraPosition;ri!==void 0&&ri.setValue(D,pt.setFromMatrixPosition(S.matrixWorld)),A.logarithmicDepthBuffer&&me.setValue(D,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&me.setValue(D,"isOrthographic",S.isOrthographicCamera===!0),tt!==S&&(tt=S,ii=!0,zi=!0)}if(Tt.needsLights&&(Je.state.sunShadowMap.length>0&&me.setValue(D,"sunShadowMap",Je.state.sunShadowMap,z),Je.state.directionalShadowMap.length>0&&me.setValue(D,"directionalShadowMap",Je.state.directionalShadowMap,z),Je.state.spotShadowMap.length>0&&me.setValue(D,"spotShadowMap",Je.state.spotShadowMap,z),Je.state.pointShadowMap.length>0&&me.setValue(D,"pointShadowMap",Je.state.pointShadowMap,z)),V.isSkinnedMesh){me.setOptional(D,V,"bindMatrix"),me.setOptional(D,V,"bindMatrixInverse");let _e=V.skeleton;_e&&(_e.boneTexture===null&&_e.computeBoneTexture(),me.setValue(D,"boneTexture",_e.boneTexture,z))}V.isBatchedMesh&&(me.setOptional(D,V,"batchingTexture"),me.setValue(D,"batchingTexture",V._matricesTexture,z),me.setOptional(D,V,"batchingIdTexture"),me.setValue(D,"batchingIdTexture",V._indirectTexture,z),me.setOptional(D,V,"batchingColorTexture"),V._colorsTexture!==null&&me.setValue(D,"batchingColorTexture",V._colorsTexture,z));let si=q.morphAttributes;if((si.position!==void 0||si.normal!==void 0||si.color!==void 0)&&O.update(V,q,un),(ii||Tt.receiveShadow!==V.receiveShadow)&&(Tt.receiveShadow=V.receiveShadow,me.setValue(D,"receiveShadow",V.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&F.environment!==null&&(Re.envMapIntensity.value=F.environmentIntensity),Re.dfgLUT!==void 0&&(Re.dfgLUT.value=x_()),ii){if(me.setValue(D,"toneMappingExposure",C.toneMappingExposure),Tt.needsLights&&_f(Re,zi),Mt&&G.fog===!0&&vt.refreshFogUniforms(Re,Mt),vt.refreshMaterialUniforms(Re,G,et,J,T.state.transmissionRenderTarget[S.id]),Tt.needsLights&&Tt.lightProbeGrid){let _e=Tt.lightProbeGrid;Re.probesSH.value=_e.texture,Re.probesMin.value.copy(_e.boundingBox.min),Re.probesMax.value.copy(_e.boundingBox.max),Re.probesResolution.value.copy(_e.resolution)}Ss.upload(D,wh(Tt),Re,z)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Ss.upload(D,wh(Tt),Re,z),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&me.setValue(D,"center",V.center),me.setValue(D,"modelViewMatrix",V.modelViewMatrix),me.setValue(D,"normalMatrix",V.normalMatrix),me.setValue(D,"modelMatrix",V.matrixWorld),G.uniformsGroups!==void 0){let _e=G.uniformsGroups;for(let ri=0,ki=_e.length;ri<ki;ri++){let Ch=_e[ri];at.update(Ch,un),at.bind(Ch,un)}}return un}function _f(S,F){S.ambientLightColor.needsUpdate=F,S.lightProbe.needsUpdate=F,S.sunLights.needsUpdate=F,S.sunLightShadows.needsUpdate=F,S.directionalLights.needsUpdate=F,S.directionalLightShadows.needsUpdate=F,S.pointLights.needsUpdate=F,S.pointLightShadows.needsUpdate=F,S.spotLights.needsUpdate=F,S.spotLightShadows.needsUpdate=F,S.rectAreaLights.needsUpdate=F,S.hemisphereLights.needsUpdate=F}function vf(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return Z},this.getActiveMipmapLevel=function(){return Y},this.getRenderTarget=function(){return st},this.setRenderTargetTextures=function(S,F,q){let G=P.get(S);G.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),P.get(S.texture).__webglTexture=F,P.get(S.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:q,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,F){let q=P.get(S);q.__webglFramebuffer=F,q.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(S,F=0,q=0){st=S,Z=F,Y=q;let G=null,V=!1,Mt=!1;if(S){let yt=P.get(S);if(yt.__useDefaultFramebuffer!==void 0){_.bindFramebuffer(D.FRAMEBUFFER,yt.__webglFramebuffer),nt.copy(S.viewport),It.copy(S.scissor),rt=S.scissorTest,_.viewport(nt),_.scissor(It),_.setScissorTest(rt),$=-1;return}else if(yt.__webglFramebuffer===void 0)z.setupRenderTarget(S);else if(yt.__hasExternalTextures)z.rebindTextures(S,P.get(S.texture).__webglTexture,P.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){let Jt=S.depthTexture;if(yt.__boundDepthTexture!==Jt){if(Jt!==null&&P.has(Jt)&&(S.width!==Jt.image.width||S.height!==Jt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");z.setupDepthRenderbuffer(S)}}let Rt=S.texture;(Rt.isData3DTexture||Rt.isDataArrayTexture||Rt.isCompressedArrayTexture)&&(Mt=!0);let Lt=P.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Lt[F])?G=Lt[F][q]:G=Lt[F],V=!0):S.samples>0&&z.useMultisampledRTT(S)===!1?G=P.get(S).__webglMultisampledFramebuffer:Array.isArray(Lt)?G=Lt[q]:G=Lt,nt.copy(S.viewport),It.copy(S.scissor),rt=S.scissorTest}else nt.copy(St).multiplyScalar(et).floor(),It.copy(Ht).multiplyScalar(et).floor(),rt=oe;if(q!==0&&(G=H),_.bindFramebuffer(D.FRAMEBUFFER,G)&&_.drawBuffers(S,G),_.viewport(nt),_.scissor(It),_.setScissorTest(rt),V){let yt=P.get(S.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+F,yt.__webglTexture,q)}else if(Mt){let yt=F;for(let Rt=0;Rt<S.textures.length;Rt++){let Lt=P.get(S.textures[Rt]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+Rt,Lt.__webglTexture,q,yt)}}else if(S!==null&&q!==0){let yt=P.get(S.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,yt.__webglTexture,q)}$=-1};function Rh(S){let F=P.get(S);return(F.__readFormat!==S.format||F.__readType!==S.type)&&(F.__readFormat=S.format,F.__readType=S.type,F.__formatReadable=A.textureFormatReadable(S.format),F.__typeReadable=A.textureTypeReadable(S.type)),F}this.readRenderTargetPixels=function(S,F,q,G,V,Mt,wt,yt=0){if(!(S&&S.isWebGLRenderTarget)){Gt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Rt=P.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&wt!==void 0&&(Rt=Rt[wt]),Rt){_.bindFramebuffer(D.FRAMEBUFFER,Rt);try{let Lt=S.textures[yt],Jt=Lt.format,te=Lt.type;S.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+yt);let Ct=Rh(Lt);if(Ct.__formatReadable===!1){Gt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ct.__typeReadable===!1){Gt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=S.width-G&&q>=0&&q<=S.height-V&&D.readPixels(F,q,G,V,xt.convert(Jt),xt.convert(te),Mt)}finally{let Lt=st!==null?P.get(st).__webglFramebuffer:null;_.bindFramebuffer(D.FRAMEBUFFER,Lt)}}},this.readRenderTargetPixelsAsync=async function(S,F,q,G,V,Mt,wt,yt=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Rt=P.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&wt!==void 0&&(Rt=Rt[wt]),Rt)if(F>=0&&F<=S.width-G&&q>=0&&q<=S.height-V){_.bindFramebuffer(D.FRAMEBUFFER,Rt);let Lt=S.textures[yt],Jt=Lt.format,te=Lt.type;S.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+yt);let Ct=Rh(Lt);if(Ct.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ct.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ue=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,ue),D.bufferData(D.PIXEL_PACK_BUFFER,Mt.byteLength,D.STREAM_READ),D.readPixels(F,q,G,V,xt.convert(Jt),xt.convert(te),0),D.bindBuffer(D.PIXEL_PACK_BUFFER,null);let Ce=st!==null?P.get(st).__webglFramebuffer:null;_.bindFramebuffer(D.FRAMEBUFFER,Ce);let ye=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await Xu(D,ye,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,ue),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,Mt),D.bindBuffer(D.PIXEL_PACK_BUFFER,null),D.deleteBuffer(ue),D.deleteSync(ye),Mt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,F=null,q=0){let G=Math.pow(2,-q),V=Math.floor(S.image.width*G),Mt=Math.floor(S.image.height*G),wt=F!==null?F.x:0,yt=F!==null?F.y:0;z.setTexture2D(S,0),D.copyTexSubImage2D(D.TEXTURE_2D,q,0,0,wt,yt,V,Mt),_.unbindTexture()},this.copyTextureToTexture=function(S,F,q=null,G=null,V=0,Mt=0){let wt,yt,Rt,Lt,Jt,te,Ct,ue,Ce,ye=S.isCompressedTexture?S.mipmaps[Mt]:S.image;if(q!==null)wt=q.max.x-q.min.x,yt=q.max.y-q.min.y,Rt=q.isBox3?q.max.z-q.min.z:1,Lt=q.min.x,Jt=q.min.y,te=q.isBox3?q.min.z:0;else{let Re=Math.pow(2,-V);wt=Math.floor(ye.width*Re),yt=Math.floor(ye.height*Re),S.isDataArrayTexture?Rt=ye.depth:S.isData3DTexture?Rt=Math.floor(ye.depth*Re):Rt=1,Lt=0,Jt=0,te=0}G!==null?(Ct=G.x,ue=G.y,Ce=G.z):(Ct=0,ue=0,Ce=0);let ge=xt.convert(F.format),We=xt.convert(F.type),Tt;F.isData3DTexture?(z.setTexture3D(F,0),Tt=D.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(z.setTexture2DArray(F,0),Tt=D.TEXTURE_2D_ARRAY):(z.setTexture2D(F,0),Tt=D.TEXTURE_2D),_.activeTexture(D.TEXTURE0),_.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,F.flipY),_.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),_.pixelStorei(D.UNPACK_ALIGNMENT,F.unpackAlignment);let Je=_.getParameter(D.UNPACK_ROW_LENGTH),re=_.getParameter(D.UNPACK_IMAGE_HEIGHT),un=_.getParameter(D.UNPACK_SKIP_PIXELS),Pn=_.getParameter(D.UNPACK_SKIP_ROWS),ii=_.getParameter(D.UNPACK_SKIP_IMAGES);_.pixelStorei(D.UNPACK_ROW_LENGTH,ye.width),_.pixelStorei(D.UNPACK_IMAGE_HEIGHT,ye.height),_.pixelStorei(D.UNPACK_SKIP_PIXELS,Lt),_.pixelStorei(D.UNPACK_SKIP_ROWS,Jt),_.pixelStorei(D.UNPACK_SKIP_IMAGES,te);let zi=S.isDataArrayTexture||S.isData3DTexture,me=F.isDataArrayTexture||F.isData3DTexture;if(S.isDepthTexture){let Re=P.get(S),si=P.get(F),_e=P.get(Re.__renderTarget),ri=P.get(si.__renderTarget);_.bindFramebuffer(D.READ_FRAMEBUFFER,_e.__webglFramebuffer),_.bindFramebuffer(D.DRAW_FRAMEBUFFER,ri.__webglFramebuffer);for(let ki=0;ki<Rt;ki++)zi&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,P.get(S).__webglTexture,V,te+ki),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,P.get(F).__webglTexture,Mt,Ce+ki)),D.blitFramebuffer(Lt,Jt,wt,yt,Ct,ue,wt,yt,D.DEPTH_BUFFER_BIT,D.NEAREST);_.bindFramebuffer(D.READ_FRAMEBUFFER,null),_.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(V!==0||S.isRenderTargetTexture||P.has(S)){let Re=P.get(S),si=P.get(F);_.bindFramebuffer(D.READ_FRAMEBUFFER,U),_.bindFramebuffer(D.DRAW_FRAMEBUFFER,k);for(let _e=0;_e<Rt;_e++)zi?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Re.__webglTexture,V,te+_e):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Re.__webglTexture,V),me?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,si.__webglTexture,Mt,Ce+_e):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,si.__webglTexture,Mt),V!==0?D.blitFramebuffer(Lt,Jt,wt,yt,Ct,ue,wt,yt,D.COLOR_BUFFER_BIT,D.NEAREST):me?D.copyTexSubImage3D(Tt,Mt,Ct,ue,Ce+_e,Lt,Jt,wt,yt):D.copyTexSubImage2D(Tt,Mt,Ct,ue,Lt,Jt,wt,yt);_.bindFramebuffer(D.READ_FRAMEBUFFER,null),_.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else me?S.isDataTexture||S.isData3DTexture?D.texSubImage3D(Tt,Mt,Ct,ue,Ce,wt,yt,Rt,ge,We,ye.data):F.isCompressedArrayTexture?D.compressedTexSubImage3D(Tt,Mt,Ct,ue,Ce,wt,yt,Rt,ge,ye.data):D.texSubImage3D(Tt,Mt,Ct,ue,Ce,wt,yt,Rt,ge,We,ye):S.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,Mt,Ct,ue,wt,yt,ge,We,ye.data):S.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,Mt,Ct,ue,ye.width,ye.height,ge,ye.data):D.texSubImage2D(D.TEXTURE_2D,Mt,Ct,ue,wt,yt,ge,We,ye);_.pixelStorei(D.UNPACK_ROW_LENGTH,Je),_.pixelStorei(D.UNPACK_IMAGE_HEIGHT,re),_.pixelStorei(D.UNPACK_SKIP_PIXELS,un),_.pixelStorei(D.UNPACK_SKIP_ROWS,Pn),_.pixelStorei(D.UNPACK_SKIP_IMAGES,ii),Mt===0&&F.generateMipmaps&&D.generateMipmap(Tt),_.unbindTexture()},this.initRenderTarget=function(S){P.get(S).__webglFramebuffer===void 0&&z.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?z.setTextureCube(S,0):S.isData3DTexture?z.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?z.setTexture2DArray(S,0):z.setTexture2D(S,0),_.unbindTexture()},this.resetState=function(){Z=0,Y=0,st=null,_.reset(),bt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Sn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=ne._getDrawingBufferColorSpace(t),e.unpackColorSpace=ne._getUnpackColorSpace()}};function Cd(i){let t=i.WebGLRenderer.prototype;if(t.__perf)return;t.__perf=!0;let e=new WeakMap,n=a=>e.get(a)||e.set(a,{base:1,scale:1,skip:!1,avg:16.7,good:0,started:!1}).get(a),s=(a,o)=>Object.defineProperty(t,a,{configurable:!0,set(l){Object.defineProperty(this,a,{value:o(this,l),writable:!0,configurable:!0})}});s("setPixelRatio",(a,o)=>l=>{let c=n(a);c.base=l,o.call(a,l*c.scale)}),s("render",(a,o)=>(...l)=>{let c=n(a);if(c.started||r(a,c),!c.skip)return o.apply(a,l)});function r(a,o){o.started=!0;let l=performance.now(),c=0;(function u(f){requestAnimationFrame(u);let h=f-l;l=f,!(h>250||document.hidden)&&(o.skip=f-c<1e3/60-1.5,o.skip||(c=f),o.avg+=(h-o.avg)*.08,o.avg>1e3/40&&o.scale>.4?(o.scale=Math.max(.4,o.scale-.1),o.avg=16.7,o.good=0,a.setPixelRatio(o.base)):o.avg<1e3/55&&o.scale<1?++o.good>240&&(o.scale=Math.min(1,o.scale+.05),o.good=0,a.setPixelRatio(o.base)):o.good=0)})(l)}}var Es={minibus:{id:"minibus",kind:"mini",name:"Minibus",length:7,width:2.2,height:2.7,wheelbase:3.6,frontOverhang:1.2,mass:5500,power:110,maxSpeed:25,maxAccel:2,brake:8,turnRadius:6.5,rollGain:.012,seats:20,doors:1,price:0,level:1,consumption:14,color:"#2a7fd4"},standard:{id:"standard",kind:"std",name:"Bus standard",length:12,width:2.55,height:3.2,wheelbase:5.9,frontOverhang:2.7,mass:14e3,power:210,maxSpeed:22,maxAccel:1.5,brake:7,turnRadius:10.5,rollGain:.01,seats:80,doors:2,price:6e3,level:1,consumption:38,color:"#f2b01e"},electric:{id:"electric",kind:"std",name:"Bus \xE9lectrique",length:12,width:2.55,height:3.2,wheelbase:5.9,frontOverhang:2.7,mass:15500,power:180,maxSpeed:20,maxAccel:1.8,brake:7,turnRadius:10.5,rollGain:.01,seats:75,doors:2,price:12e3,level:2,electric:!0,range:250,color:"#1fb6a5"},doubleDecker:{id:"doubleDecker",kind:"double",name:"Double \xE9tage",length:10.5,width:2.55,height:4.3,wheelbase:5.6,frontOverhang:2.5,mass:16500,power:190,maxSpeed:20,maxAccel:1.2,brake:6.5,turnRadius:10.5,rollGain:.032,seats:85,doors:2,price:14e3,level:3,consumption:45,color:"#d11a2a"},articulated:{id:"articulated",kind:"artic",name:"Bus articul\xE9",length:18,width:2.55,height:3.2,wheelbase:5.9,frontOverhang:2.7,mass:24e3,power:260,maxSpeed:20,maxAccel:1.1,brake:6.5,turnRadius:11.5,rollGain:.01,seats:130,doors:3,price:18e3,level:4,consumption:52,color:"#2e9b5a",artic:{frontLen:9.3,hingeZ:-1,rearLen:8.1,axleDist:6.3}}},Id=["minibus","standard","electric","doubleDecker","articulated"],Pd=i=>i.electric?10/(i.range*1e3):i.consumption/1e5*10/200;var Se=[{x:1,z:0},{x:0,z:1},{x:-1,z:0},{x:0,z:-1}],tn=i=>({x:-i.z,z:i.x}),ti=i=>i%2===0?"x":"z",Oe=i=>(i-9/2)*100,An=(i,t)=>i>=0&&i<10&&t>=0&&t<10,Or=(i,t)=>i*10+t,Hn=(i,t,e,n)=>{let s=Or(i,t),r=Or(e,n);return s<r?`${s}-${r}`:`${r}-${s}`},sl=i=>Math.atan2(Math.sin(i),Math.cos(i)),Ld=i=>{let t=Math.sin(i),e=Math.cos(i);return Math.abs(t)>Math.abs(e)?t>0?0:2:e>0?1:3};function Ts(i,t){return i>=1&&i<=2&&t>=4&&t<=5?"gare":Math.abs(i-4)<=1&&Math.abs(t-4)<=1?"centre":i>=6&&t<=3?"commerce":"peripherie"}var Dd={gare:30,centre:30,peripherie:50,commerce:50};function Br(i,t){let e=Math.min(8,Math.max(0,Math.round(i/100)+4)),n=Math.min(8,Math.max(0,Math.round(t/100)+4));return Ts(e,n)}var __=new Set(["5,5","2,1","7,7","8,2"]),Ze=[];for(let i=0;i<10;i++)for(let t=0;t<10;t++){let e=Oe(i),n=Oe(t),s=__.has(`${i},${t}`)?"round":Br(e,n)==="peripherie"?"stop":"signal";Ze[Or(i,t)]={i,j:t,x:e,z:n,idx:Or(i,t),type:s,off:(i*7+t*13)%38,major:(i+t)%2===0?"x":"z"}}var hn=(i,t)=>Ze[Or(i,t)],ws=[{i:1,j:4,name:"D\xE9p\xF4t"},{i:4,j:6,name:"Centre"},{i:7,j:3,name:"Zone commerciale"},{i:2,j:1,name:"P\xE9riph\xE9rie"}].map(i=>{let t=hn(i.i,i.j),e=hn(i.i+1,i.j),n=(t.x+e.x)/2;return{...i,x:n,z:t.z+4.7,px:n,pz:t.z+7.6}}),Ui={x:Oe(1)+20,z:Oe(4)+3,heading:Math.PI/2};var rl=(i,t,e)=>Math.min(e,Math.max(t,i)),Nd=i=>i<0?-1:1,al=class{constructor(t){this.s=t,this.grip=1,this.canDrive=!0,this.dragK=t.power*1e3/(t.mass*t.maxSpeed)/t.maxSpeed**2,this.maxSteer=Math.atan(t.wheelbase/t.turnRadius),this.zFront=t.wheelbase+t.frontOverhang,this.reset(0,0,0)}reset(t,e,n){this.x=t,this.z=e,this.heading=n,this.vx=0,this.vz=0,this.speed=0,this.steer=0,this.yawRate=0,this.thr=0,this.accelLong=0,this.accelLat=0,this.roll=0,this.rollV=0,this.pitch=0,this.pitchV=0,this.heading2=n,this.artic=0}refPoint(){let t=this.s.wheelbase*.9;return{x:this.x+Math.sin(this.heading)*t,z:this.z+Math.cos(this.heading)*t}}update(t,e){let n=this.s,s=Math.sin(this.heading),r=Math.cos(this.heading),a=this.vx*s+this.vz*r,o=this.vx*r-this.vz*s,l=this.canDrive?e.throttle:0;this.thr+=(l-this.thr)*Math.min(1,t*(n.electric?1.6:6));let c=0;this.thr>.001&&(c+=a<-.5?6:this.thr*Math.min(n.maxAccel,n.power*1e3/(n.mass*Math.max(a,4)))),e.brake>0&&(c+=a>.5?-n.brake*e.brake*this.grip:a>-4&&this.canDrive?-1.8*e.brake:0),Math.abs(a)>.05&&(c-=Nd(a)*(this.dragK*a*a+(n.electric?.2:.3))),e.handbrake&&(c-=Nd(a)*6*this.grip);let u=a+c*t;!(this.thr>.001)&&!e.brake&&a*u<0&&(u=0),this.accelLong+=((u-a)/t-this.accelLong)*Math.min(1,t*8);let f=this.maxSteer/(1+(Math.abs(u)/10)**2),h=e.steer*f,d=(Math.abs(h)<Math.abs(this.steer)?2.5:1.5)*t;this.steer+=rl(h-this.steer,-d,d),this.yawRate=u/n.wheelbase*Math.tan(this.steer),this.heading+=this.yawRate*t;let m=Math.sin(this.heading),x=Math.cos(this.heading),g=s*u+r*o,p=r*u-s*o,M=g*m+p*x,b=g*x-p*m;b*=Math.exp(-(e.handbrake?1.2:8)*this.grip*t),this.vx=m*M+x*b,this.vz=x*M-m*b,this.speed=M,this.x=rl(this.x+this.vx*t,-1900,1900),this.z=rl(this.z+this.vz*t,-1900,1900);let y=n.artic;if(y){let R=m*y.hingeZ,v=x*y.hingeZ,w=this.vx+this.yawRate*v,C=this.vz-this.yawRate*R,L=Math.cos(this.heading2),B=-Math.sin(this.heading2);this.heading2+=(w*L+C*B)/y.axleDist*t,this.artic=rl(sl(this.heading2-this.heading),-.85,.85),this.heading2=this.heading+this.artic}this.accelLat+=(this.yawRate*M-this.accelLat)*Math.min(1,t*8);let E=this.accelLat*n.rollGain,T=-this.accelLong*.008;this.rollV+=(40*(E-this.roll)-5*this.rollV)*t,this.roll+=this.rollV*t,this.pitchV+=(40*(T-this.pitch)-6*this.pitchV)*t,this.pitch+=this.pitchV*t}collisionPoints(){let t=this.s,e=t.width/2*.95,n=[],s=Math.sin(this.heading),r=Math.cos(this.heading),a=(o,l)=>{for(let c=o+e;c<=l-e+.01;c+=e*1.4)n.push({x:this.x+s*c,z:this.z+r*c,r:e})};if(t.artic){let o=t.artic,l=Math.sin(this.heading2),c=Math.cos(this.heading2);a(o.hingeZ+.3,this.zFront);let u=this.x+s*o.hingeZ,f=this.z+r*o.hingeZ;for(let h=.3+e;h<=.3+o.rearLen-e+.01;h+=e*1.4)n.push({x:u-l*h,z:f-c*h,r:e})}else a(this.zFront-t.length,this.zFront);return n}};var Fi=(i,t)=>Object.assign(document.createElement("canvas"),{width:i,height:t}),Oi=i=>{let t=new On(i);return t.colorSpace=Pe,t.anisotropy=4,t},ve=(i,t={})=>new Vt({color:i,roughness:.7,metalness:.1,...t}),zr=.5,Mi=.35,As=1.3;function Ud(i,t,e,n){let s=i.kind==="double",r=s?384:256,a=Fi(1024,r),o=a.getContext("2d");o.fillStyle=i.color,o.fillRect(0,0,1024,r),o.fillStyle="#f2f2f2",o.fillRect(0,r-51,1024,14);let l=As/t*1024,c=e.map(d=>n?(1-d)*1024-l:d*1024),u=s?[[205,95],[40,100]]:[[38,92]],f=Math.round(t/1.6),h=1024/f;o.fillStyle="#15222f";for(let[d,m]of u)for(let x=0;x<f;x++){let g=x*h+5,p=(x+1)*h-5;d>150&&c.some(M=>p>M-6&&g<M+l+6)||o.fillRect(g,d,p-g,m)}o.fillStyle="#1b2d3f";for(let d of c)o.fillRect(d,s?190:30,l,s?160:175);return Oi(a)}function Fd(i,t){let e=Fi(512,256),n=e.getContext("2d");return n.fillStyle=i.color,n.fillRect(0,0,512,256),n.fillStyle="#15222f",t?(n.fillRect(20,40,472,i.kind==="double"?70:150),i.kind==="double"&&n.fillRect(20,150,472,70),n.fillStyle="#0a0a0a",n.fillRect(150,12,212,22),n.fillStyle="#ffb000",n.font="bold 18px monospace",n.textAlign="center",n.fillText("BUS CITY",256,30)):n.fillRect(60,50,392,100),n.fillStyle="#f2f2f2",n.fillRect(0,225,512,14),Oi(e)}function Od(i,t,e,n){let s=i.kind==="double",r=s?384:256,a=Fi(1024,r),o=a.getContext("2d");o.fillStyle="#c9ced4",o.fillRect(0,0,1024,r),o.fillStyle="#9aa1a8",o.fillRect(0,r-70,1024,70);let l=As/t*1024,c=e.map(d=>n?(1-d)*1024-l:d*1024),u=s?[[205,95],[40,100]]:[[38,92]],f=Math.round(t/1.6),h=1024/f;for(let[d,m]of u)for(let x=0;x<f;x++)o.clearRect(x*h+5,d,h-10,m);for(let d of c)o.clearRect(d,s?190:30,l,s?160:175);return Oi(a)}function Bd(i,t){let e=Fi(512,256),n=e.getContext("2d");return n.fillStyle="#c9ced4",n.fillRect(0,0,512,256),t?(n.clearRect(20,40,472,i.kind==="double"?70:150),i.kind==="double"&&n.clearRect(20,150,472,70)):n.clearRect(60,50,392,100),Oi(e)}var ol=i=>new Vt({map:i,roughness:.8,side:Ve,transparent:!0,alphaTest:.5}),ll=new we({visible:!1}),cl=i=>new Vt({map:i,roughness:.6}),zd=ve("#1d232b"),Rn=ve("#0c0d10",{roughness:.8}),hh=ve("#d5dae0",{roughness:.15,metalness:1}),hl=ve("#8e949e",{roughness:.45,metalness:.85}),kd=new xr({color:"#0a1622",roughness:.05,metalness:.5,clearcoat:1,transparent:!0,opacity:.55}),v_=new mr([[.3,-.15],[.46,-.15],[.5,-.11],[.51,-.05],[.51,.05],[.5,.11],[.46,.15],[.3,.15]].map(([i,t])=>new dt(i,t)),32).rotateZ(Math.PI/2),y_=new ce(.3,.3,.27,24).rotateZ(Math.PI/2),M_=new ce(.27,.29,.03,24).rotateZ(Math.PI/2),S_=new ce(.09,.1,.07,16).rotateZ(Math.PI/2),b_=new ce(.018,.018,.035,6).rotateZ(Math.PI/2),ei=(i,t,e,n,s,r,a=!1)=>{let o=new Ut(t,e);return o.position.set(n,s,r),o.castShadow=a,i.add(o),o},$e=(i,t,e,n,s,r,a,o)=>ei(i,new qt(t,e,n),s,r,a,o),kr=(i,t,e,n,s,r,a,o,l=12)=>{let c=new ce(t,t,e,l);return o==="z"?c.rotateX(Math.PI/2):o==="x"&&c.rotateZ(Math.PI/2),ei(i,c,n,s,r,a)};function E_(i,t,e,n){let s=t.width,r=t.height,a=n-e,o=(n+e)/2,l=ve(t.color,{roughness:.35,metalness:.3});for(let f of[-1,1])kr(i,.11,a-.04,l,f*(s/2-.05),r-.08,o,"z",14),$e(i,.03,.22,a-.1,Rn,f*(s/2+.005),Mi+.1,o),$e(i,.03,.06,a-.1,hh,f*(s/2+.01),Mi+.26,o);let c=r+.01,u=Math.min(2.4,a*.3);$e(i,s*.6,.28,u,ve("#c9ced4",{roughness:.5}),0,c+.14,o-a*.1);for(let f=0;f<6;f++)$e(i,s*.5,.02,.04,Rn,0,c+.29,o-a*.1-u/2+.2+f*(u-.4)/5);$e(i,.6,.06,.6,hl,s*.15,c+.03,o+a*.28),$e(i,.6,.06,.6,hl,-s*.15,c+.03,o+a*.3),kr(i,.015,.4,Rn,-s*.3,c+.2,o+a*.36,"y",6)}function lh(i,t,e,n,s){let r=n-e,a=t.width,o=t.height,l=new Ut(new qt(a,o-Mi,r),[cl(Ud(t,r,[],!1)),cl(Ud(t,r,s.doors,!0)),ve("#d8dde2"),ve("#222"),s.front?cl(Fd(t,!0)):zd,s.rear?cl(Fd(t,!1)):zd]);l.position.set(0,(o+Mi)/2,(n+e)/2),l.castShadow=!0,i.add(l),E_(i,t,e,n);let c=new Ut(new qt(a-.04,o-Mi-.04,r-.04),[ol(Od(t,r,[],!0)),ol(Od(t,r,s.doors,!1)),ll,ll,s.front?ol(Bd(t,!0)):ll,s.rear?ol(Bd(t,!1)):ll]);c.position.copy(l.position),i.add(c);let u=[],f=ve("#2a3c50",{roughness:.3});for(let h of s.doors){let d=n-(h+As/r/2)*r,m=As/2;for(let x of[1,-1]){let g=new Ut(new qt(.05,t.kind==="double"?1.9:2.3,m),f);g.position.set(-a/2-.03,t.kind==="double"?1.4:1.55,d+x*m/2),i.add(g),u.push({m:g,z0:g.position.z,dir:x,travel:m})}}return{len:r,leaves:u,doorZ:s.doors.map(h=>n-(h+As/r/2)*r)}}var Hd=(i,t,e)=>{let n=[];for(let s=i;s>t;s-=e)n.push(s);return n};function ch(i,t,e,n,s){let r=t.width,a=t.height,o=n-e,l=t.kind==="double",c=l?[.6,2.6]:[.6],u=l?[2.4,a-.15]:[a-.15],f=(w,C)=>{let L=new Ut(new De(r-.1,o-.1),ve(C,{side:Qe}));L.rotation.x=-Math.PI/2,L.position.set(0,w,(n+e)/2),i.add(L)};c.forEach(w=>f(w,"#3b3f45")),u.forEach(w=>f(w,"#cfd3d8"));let h=[],d=[],m=n-(s?3:1),x=e+1.8;for(let w of c){for(let C of Hd(m,x,.9))for(let L of[-1,-.55,.55,1])h.push([L,w,C]);for(let C of Hd(m,x,.6))for(let L of[-.2,.2])d.push([L,w,C])}let g=new fe,p=new fn,M=new N,b=new N,y=new Ae(new qt(.42,.5,.45),ve("#2b3a55"),h.length);h.forEach(([w,C,L],B)=>y.setMatrixAt(B,g.makeTranslation(w,C+.25,L)));let E=h.map(w=>({s:w,seated:!0})).concat(d.map(w=>({s:w,seated:!1}))),T=new Ae(new ce(.2,.22,1,8),ve("#fff"),E.length),R=new Ae(new bn(.14,8,6),ve("#e0b896"),E.length),v=["#c0392b","#2980b9","#27ae60","#8e44ad","#d35400","#34495e","#16a085","#7f8c8d"];return E.forEach(({s:[w,C,L],seated:B},H)=>{let U=B?.75:1.3,k=B?C+.875:C+.65;T.setMatrixAt(H,g.compose(M.set(w,k,L),p,b.set(1,U,1))),R.setMatrixAt(H,g.compose(M.set(w,k+U/2+.16,L),p,b.set(1,1,1))),T.setColorAt(H,new At(v[(H*7+3)%v.length]))}),T.count=R.count=0,T.frustumCulled=R.frustumCulled=y.frustumCulled=!1,i.add(y,T,R),{slotCount:E.length,setCount:w=>{T.count=R.count=Math.min(w,E.length)}}}function Gd(i){let t=i.width,e=i.height,n=i.artic,s=i.wheelbase+i.frontOverhang,r=new ze,a=new ze;r.add(a);let o=[],l=[],c=[],u=[],f=ve("#151515"),h=ve("#b9c0cc",{roughness:.3,metalness:.9}),d=(I,P,z)=>{for(let j of[-1,1]){let it=new ze,W=new ze;it.position.set(j*(t/2-.12),zr,P),ei(W,v_,f,0,0,0,!0),ei(W,y_,h,0,0,0),ei(W,M_,h,j*.14,0,0),ei(W,S_,hl,j*.17,0,0);for(let vt=0;vt<8;vt++){let ft=vt/8*Math.PI*2;ei(W,b_,hh,j*.165,Math.sin(ft)*.17,Math.cos(ft)*.17)}it.add(W),I.add(it);let X=new ce(zr+.1,zr+.1,.55,22,1,!0,-Math.PI/2,Math.PI).rotateZ(Math.PI/2),ht=Rn.clone();ht.side=Qe,ei(I,X,ht,j*(t/2-.12),zr,P),o.push({pivot:it,spin:W,front:z})}},m=new Vt({color:"#fff6d8",emissive:"#fff6d8",emissiveIntensity:.15}),x=new Vt({color:"#661111",emissive:"#ff1111",emissiveIntensity:.1}),g={left:[],right:[]},p=(I,P,z,j,it,W=.35,X=.18)=>{let ht=new Ut(new qt(W,X,.06),P);ht.position.set(z,j,it),I.add(ht)},M=(I,P,z)=>{for(let j of[-1,1]){z?p(I,m,j*(t/2-.4),.8,P+.03):p(I,x,j*(t/2-.3),.9,P-.03,.3,.3);let it=new Vt({color:"#b36b00",emissive:"#ff9900",emissiveIntensity:0});(j>0?g.left:g.right).push(it),p(I,it,j*(t/2-.1),1.1,P+(z?.03:-.03),.16,.16)}},b=null,y=null,E=null,T,R=new ae;R.rotation.y=Math.PI,T=new ae,T.rotation.y=Math.PI;let v;if(n){let I=s-n.frontLen;v=lh(a,i,I,s,{doors:[.08,.6],front:!0,rear:!1}),l.push(...v.leaves),d(a,i.wheelbase,!0),d(a,0,!1),M(a,s,!0),c.push(ch(a,i,I,s,!0)),b=new ze,b.position.z=n.hingeZ,a.add(b);let P=-.3,z=-.3-n.rearLen,j=lh(b,i,z,P,{doors:[.45],front:!1,rear:!0});l.push(...j.leaves),d(b,-n.axleDist,!1),M(b,z,!1),c.push(ch(b,i,z,P,!1)),T.position.set(0,2,z+.8),b.add(T);let it=7,W=[ve("#1c2128"),ve("#2d343d")];for(let ht=0;ht<it;ht++){let vt=new Ut(new qt(t-.15,e-Mi-.3,.16),W[ht%2]);vt.castShadow=!0,a.add(vt),u.push(vt)}y={fz:I,N:it,y:(e+Mi)/2};let X=new Ut(new ce(.9,.9,.08,16),ve("#444"));X.position.set(0,.7,n.hingeZ),a.add(X)}else{let I=s-i.length,P=i.kind==="mini"?1.1:0;if(v=lh(a,i,I,s-P,{doors:i.doors===1?[.12]:[.07,.67],front:!P,rear:!0}),P){let z=new Ut(new qt(t,.9,P),ve(i.color));z.position.set(0,Mi+.45,s-P/2),z.castShadow=!0,a.add(z)}if(i.electric){let z=new Ut(new qt(t-.6,.35,i.length-3),ve("#2c3a46"));z.position.set(0,e+.17,(s+I)/2),a.add(z)}d(a,s-i.frontOverhang,!0),d(a,0,!1),M(a,s,!0),M(a,I,!1),c.push(ch(a,i,I,s-P,!0)),T.position.set(0,2,I+.8),a.add(T),l.push(...v.leaves)}let w=i.kind==="mini"?1.1:0,C=s-w;$e(a,t-.1,.09,.05,Rn,0,e*.92,C+.03);for(let I of[0])$e(a,.03,i.kind==="double"?.7:e*.55,.05,Rn,I*(t/2-.12),i.kind==="double"?1.55:1.45,C+.03);let L=new Ut(new De(1.4,.2),new we({map:(()=>{let I=Fi(256,40),P=I.getContext("2d");return P.fillStyle="#080808",P.fillRect(0,0,256,40),P.fillStyle="#ffb000",P.font="bold 26px monospace",P.textAlign="center",P.fillText("1  GARE - CENTRE",128,29),Oi(I)})()}));L.position.set(0,e-.3,C+.04),a.add(L);for(let I of[-1,1])kr(a,.015,.4,Rn,I*(t/2+.15),e*.62,C-.1,"x",8),$e(a,.05,.34,.16,Rn,I*(t/2+.36),e*.58,C-.1),$e(a,.015,.3,.13,kd,I*(t/2+.335),e*.58,C-.1);$e(a,t+.02,.28,.14,Rn,0,.5,C+.04),$e(a,t*.5,.1,.06,hl,0,.38,C+.08),ei(a,new sr(.11,20),hh,0,.78,C+.04);for(let I of[-.45,.2]){let P=$e(a,.02,.03,.9,Rn,I,e*.45,C+.05);P.rotation.z=.3}n||($e(a,t+.02,.22,.12,Rn,0,.55,s-i.length-.03),$e(a,.5,.12,.02,ve("#f4f4f4"),0,.9,s-i.length-.07)),E=new ze,E.position.set(-t/2-.03,.62,v.doorZ[0]);let B=new Ut(new qt(1.2,.04,As*.8).translate(-.6,0,0),ve("#e8c200"));E.add(B),E.visible=!1,a.add(E);let H={lights:!1,doors:0,ramp:0},U=ve("#202328",{roughness:.85}),k=ve("#31353b",{roughness:.8}),Z=ve("#d5dae0",{roughness:.15,metalness:1}),Y=s-.72,st=t-.2,$=new us([[0,0],[.66,0],[.62,.3],[.4,.44],[.16,.5],[0,.34]].map(([I,P])=>new dt(I,P))),tt=new fr($,{depth:st,bevelEnabled:!1});tt.translate(0,0,-st/2),tt.rotateY(-Math.PI/2);let nt=new Ut(tt,U);nt.position.set(0,1.2,Y),a.add(nt);let It=Fi(512,256),rt=It.getContext("2d"),ie=Oi(It),$t=0,ee=(I,P)=>{rt.fillStyle="#04070b",rt.fillRect(0,0,512,256),rt.strokeStyle="#1a2a3a",rt.lineWidth=3,rt.strokeRect(2,2,508,252);let z=150,j=140,it=105;rt.lineWidth=3,rt.strokeStyle="#7fe8e8",rt.beginPath(),rt.arc(z,j,it,Math.PI*.75,Math.PI*2.25),rt.stroke(),rt.fillStyle="#d8e6f0",rt.font="bold 16px monospace",rt.textAlign="center";for(let vt=0;vt<=100;vt+=10){let ft=Math.PI*.75+vt/100*Math.PI*1.5,ut=Math.cos(ft),Et=Math.sin(ft);rt.lineWidth=3,rt.beginPath(),rt.moveTo(z+ut*(it-14),j+Et*(it-14)),rt.lineTo(z+ut*it,j+Et*it),rt.stroke(),rt.fillText(String(vt),z+ut*(it-30),j+Et*(it-30)+5)}let W=Math.PI*.75+Math.min(Math.abs(I),100)/100*Math.PI*1.5;rt.strokeStyle="#ff5a3c",rt.lineWidth=5,rt.beginPath(),rt.moveTo(z,j),rt.lineTo(z+Math.cos(W)*(it-8),j+Math.sin(W)*(it-8)),rt.stroke(),rt.fillStyle="#ff5a3c",rt.beginPath(),rt.arc(z,j,8,0,7),rt.fill(),rt.fillStyle="#fff",rt.font="bold 54px monospace",rt.textAlign="right",rt.fillText(String(Math.round(Math.abs(I))),400,150),rt.font="20px monospace",rt.fillStyle="#7fe8e8",rt.fillText("km/h",400,178);let X=(vt,ft,ut,Et,Ot)=>{rt.fillStyle=Ot?ut:"#1d2a36",rt.font="bold 18px monospace",rt.textAlign="center",rt.fillText(Et,vt,ft)},ht=Math.floor(P.time*3)%2===0;X(330,40,"#ffb000","\u25C0",P.indicator>0&&ht),X(430,40,"#ffb000","\u25B6",P.indicator<0&&ht),X(360,215,"#4aa3ff","PHARES",H.lights),X(440,215,"#4adf80","PORTES",H.doors>.05),X(360,240,"#ffb000","RAMPE",H.ramp>.05),X(440,240,"#ff3030","FREIN",!!P.braking),ie.needsUpdate=!0},J=new Ut(new De(.46,.23),new we({map:ie}));J.position.set(.7,1.86,Y+.05),J.rotation.set(.35,Math.PI,0),a.add(J),ee(0,{time:0,indicator:0,braking:!1});let et=Fi(512,96),mt=et.getContext("2d");mt.fillStyle="#15181c",mt.fillRect(0,0,512,96),mt.fillStyle="#c9d2da",mt.font="bold 20px monospace",mt.textAlign="center";let Bt=["PORTES O","RAMPE R","PHARES L","KLAXON H","\u25C0 A","E \u25B6","CARTE M"];Bt.forEach((I,P)=>mt.fillText(I,36+P*73,84));let St=new Ut(new De(.5,.094),new we({map:Oi(et)}));St.position.set(.28,1.83,Y+.2),St.rotation.set(-.7,Math.PI,0),a.add(St);let Ht=["#27d36b","#ffb000","#4aa3ff","#ffffff","#ffb000","#ffb000","#7fe8e8"],oe=Bt.map((I,P)=>{let z=new Vt({color:"#2a2f35",emissive:Ht[P],emissiveIntensity:0,roughness:.4}),j=new Ut(new ce(.02,.022,.018,14),z);return j.position.set(.28+.215-P*.0715,1.85,Y+.19),j.rotation.x=Math.PI/2-.7,a.add(j),z}),K=new ze;K.position.set(.7,1.7,s-1.02),K.rotation.x=-1;let ot=new ze;ot.add(new Ut(new gr(.23,.032,10,32),U));for(let I of[Math.PI/2,Math.PI*7/6,Math.PI*11/6]){let P=new Ut(new qt(.22,.035,.03),U);P.position.set(Math.cos(I)*.11,Math.sin(I)*.11,0),P.rotation.z=I,ot.add(P)}ot.add(new Ut(new ce(.06,.06,.05,16).rotateX(Math.PI/2),k)),K.add(ot);let lt=new Ut(new ce(.045,.06,.5,12),k);lt.position.set(.7,1.5,s-.8),lt.rotation.x=-1,a.add(lt);for(let I of[-1,1]){let P=new Ut(new ce(.012,.012,.16,8).rotateZ(Math.PI/2),k);P.position.set(.7+I*.14,1.66,s-.84),a.add(P)}let ct=ve("#2b3a55",{roughness:.9}),pt=new Ut(new qt(.52,.12,.5),ct);pt.position.set(.7,1,s-2.05);let Ft=new Ut(new qt(.5,.75,.12),ct);Ft.position.set(.7,1.42,s-2.32),Ft.rotation.x=-.12;let Dt=new Ut(new qt(.3,.2,.1),ct);Dt.position.set(.7,1.9,s-2.36);let kt=new Ut(new ce(.06,.08,.5,10),k);kt.position.set(.7,.72,s-2.05);let Wt=new Ut(new qt(.26,.09,.03),U);Wt.position.set(.1,e-.34,s-.3);let D=new Ut(new De(.23,.07),kd);D.position.set(.1,e-.34,s-.32),D.rotation.y=Math.PI,new Ut(new qt(.5,.025,.22),U).position.set(.7,e-.1,s-.18),a.add(K,pt,Ft,Dt,kt,Wt,D),kr(a,.022,i.length-3,Z,0,e-.34,s-1.5-(i.length-3)/2,"z",8);for(let I of v.doorZ)for(let P of[-.8,.8])kr(a,.025,e-.8,Z,-t/2+.3,.6+(e-.8)/2,I+P,"y",8);for(let I=s-3;I>s-i.length+1;I-=2.2)$e(a,.5,.02,.35,new we({color:"#fff7dc"}),0,e-.17,I);let Qt=pt;R.position.set(.7,2.05,s-1.7),a.add(R);let A=new Sr("#fff3d0",0,80,.5,.5,1);A.position.set(0,1,s),A.target.position.set(0,0,s+20),a.add(A,A.target);let _={root:r,eye:R,eyeInt:T,length:i.length,spinAngle:0,slotCount:c.reduce((I,P)=>I+P.slotCount,0),setLights(I){H.lights=I,m.emissiveIntensity=I?2.5:.15,A.intensity=I?600:0},setDoors(I){H.doors=I;for(let P of l)P.m.position.z=P.z0+P.dir*I*P.travel},setRamp(I){H.ramp=I,E.visible=I>.02,E.rotation.z=.45*I,E.scale.x=Math.max(I,.01)},setPassengers(I){let P=_.slotCount,z=Math.min(I,P);c.forEach((j,it)=>{let W=it===c.length-1?z:Math.round(Math.min(I,P)*j.slotCount/P);j.setCount(W),z-=W})},update(I,P,z){r.position.set(I.x,0,I.z),r.rotation.y=I.heading,a.rotation.set(I.pitch,0,I.roll),_.spinAngle+=I.speed*P/zr;for(let X of o)X.spin.rotation.x=_.spinAngle,X.front&&(X.pivot.rotation.y=I.steer);ot.rotation.z=-I.steer*7,$t+=P,$t>.05&&($t=0,ee(I.speed*3.6,z));let j=Math.floor(z.time*3)%2===0,it=[H.doors>.05,H.ramp>.05,H.lights,!!z.horn,z.indicator>0&&j,z.indicator<0&&j,!1];if(oe.forEach((X,ht)=>{X.emissiveIntensity=it[ht]?2.2:0}),b){b.rotation.y=I.artic;let X=I.artic,ht=i.artic,vt=-.3*Math.sin(X),ft=ht.hingeZ-.3*Math.cos(X);for(let ut=0;ut<u.length;ut++){let Et=(ut+.5)/u.length;u[ut].position.set(vt*Et,y.y,y.fz+(ft-y.fz)*Et),u[ut].rotation.y=X*Et}}x.emissiveIntensity=z.braking?2.5:.1;let W=Math.floor(z.time*3)%2===0;for(let X of g.left)X.emissiveIntensity=z.indicator>0&&W?3:0;for(let X of g.right)X.emissiveIntensity=z.indicator<0&&W?3:0}};return _}var ul=class{constructor(t,e,n=1){this.id=t,this.stats=Es[t],this.phys=new al(this.stats),this.model=Gd(this.stats),this.energy=n,this.lights=!1,this.perM=Pd(this.stats),this.scene=e,e.add(this.model.root)}place(t,e,n){this.phys.reset(t,e,n)}burn(t){this.energy=Math.max(0,this.energy-Math.abs(this.phys.speed)*t*this.perM)}dispose(){this.scene.remove(this.model.root),this.model.root.traverse(t=>{t.geometry?.dispose?.();for(let e of[].concat(t.material??[]))e.map?.dispose?.(),e.dispose?.()})}};var Vd=(i,t,e)=>Math.min(e,Math.max(t,i)),dl=class{constructor(t=20){this.cell=t,this.map=new Map,this.dynamic=[],this.stamp=0}_k(t,e){return(t+1e3)*4096+(e+1e3)}_cells(t,e,n,s,r){let a=this.cell;for(let o=Math.floor(t/a);o<=Math.floor(e/a);o++)for(let l=Math.floor(n/a);l<=Math.floor(s/a);l++)r(this._k(o,l))}_add(t,e,n,s,r){this._cells(e,n,s,r,a=>{let o=this.map.get(a);o||this.map.set(a,o=[]),o.push(t)})}addBox(t,e,n,s,r){this._add({t:0,minx:t,maxx:e,minz:n,maxz:s,tag:r,s:0},t,e,n,s)}addCircle(t,e,n,s){this._add({t:1,x:t,z:e,r:n,tag:s,s:0},t-n,t+n,e-n,e+n)}resolve(t,e,n){this.stamp++;let s=0,r=0,a=null,o=l=>{if(l.t===1){let c=t-l.x,u=e-l.z,f=n+l.r,h=c*c+u*u;if(h<f*f){let d=Math.sqrt(h)||.001;s+=c/d*(f-d),r+=u/d*(f-d),a=l}}else{let c=Vd(t,l.minx,l.maxx),u=Vd(e,l.minz,l.maxz),f=t-c,h=e-u,d=f*f+h*h;if(d>=n*n)return;if(a=l,d>1e-6){let b=Math.sqrt(d);s+=f/b*(n-b),r+=h/b*(n-b);return}let m=t-l.minx,x=l.maxx-t,g=e-l.minz,p=l.maxz-e,M=Math.min(m,x,g,p);M===m?s-=m+n:M===x?s+=x+n:M===g?r-=g+n:r+=p+n}};this._cells(t-n,t+n,e-n,e+n,l=>{let c=this.map.get(l);if(c)for(let u of c)u.s!==this.stamp&&(u.s=this.stamp,o(u))});for(let l of this.dynamic)o(l);return{px:s,pz:r,hit:a}}};var T_=[{id:"L1",name:"Ligne 1 \xB7 Gare \u2013 Centre",rect:[1,4,5,6],level:1,price:0,color:"#ffb000"},{id:"L2",name:"Ligne 2 \xB7 Circulaire Centre",rect:[3,3,6,6],level:1,price:1e3,color:"#4aa3ff"},{id:"L3",name:"Ligne 3 \xB7 P\xE9riph\xE9rie Nord-Ouest",rect:[0,0,4,3],level:2,price:2500,color:"#3ddc84"},{id:"L4",name:"Ligne 4 \xB7 Zone commerciale",rect:[6,0,9,3],level:3,price:5e3,color:"#ff6bd6"},{id:"L5",name:"Ligne 5 \xB7 Grande ceinture",rect:[0,0,9,9],level:4,price:9e3,color:"#b48bff"}],Xd=["Gare","March\xE9","Mairie","H\xF4pital","Lyc\xE9e","Parc","Mus\xE9e","Th\xE9\xE2tre","Stade","Port","Cath\xE9drale","Universit\xE9","Poste","Biblioth\xE8que","Piscine","Cin\xE9ma","Jardin","Place Neuve","Fontaine","Zone Sud"],fl=8,qd=16;function w_(i,t){let[e,n,s,r]=i.rect,a=[];for(let h=e;h<s;h++)a.push([h,n]);for(let h=n;h<r;h++)a.push([s,h]);for(let h=s;h>e;h--)a.push([h,r]);for(let h=r;h>n;h--)a.push([e,h]);let o=a.length,l=Math.min(12,Math.max(6,Math.floor(o*.7))),c=[];for(let h=0;h<l;h++){let d=Math.floor(h*o/l),[m,x]=a[d],[g,p]=a[(d+1)%o],M=Se.findIndex(w=>w.x===Math.sign(g-m)&&w.z===Math.sign(p-x)),b=Se[M],y=tn(b),E=hn(m,x),T=hn(g,p),R=(E.x+T.x)/2,v=(E.z+T.z)/2;c.push({k:h,line:i.id,edgeIndex:d,edge:Hn(m,x,g,p),dirK:M,axis:M%2===0?"x":"z",x:R+y.x*4.7,z:v+y.z*4.7,hx:b.x,hz:b.z,heading:Math.atan2(b.x,b.z),shelter:{x:R+y.x*7.4,z:v+y.z*7.4},name:Xd[(t*5+h*3)%Xd.length],zone:Br(R,v)})}let u=[15];for(let h=1;h<l;h++){let d=c[h].edgeIndex-c[h-1].edgeIndex;u.push(u[h-1]+qd+d*100/fl)}let f=o*100/fl+l*qd;return{...i,path:a.map(([h,d])=>({i:h,j:d,x:Oe(h),z:Oe(d)})),stops:c,sched:u,lapTime:f}}var Cn=T_.map(w_),Yd=Cn.flatMap(i=>i.stops);var A_=i=>()=>{i|=0,i=i+1831565813|0;let t=Math.imul(i^i>>>15,1|i);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296},Gr=(i,t)=>Object.assign(document.createElement("canvas"),{width:i,height:t}),Hr=new ae,Zd={tower1:{w:22,d:22,h:72,wall:"#7f8da0",glass:"#1d2c3d",roof:"#666"},tower2:{w:20,d:20,h:96,wall:"#5f7388",glass:"#14202e",roof:"#555"},tower3:{w:24,d:24,h:55,wall:"#9a9186",glass:"#1d2c3d",roof:"#666"},office:{w:32,d:26,h:44,wall:"#a8a496",glass:"#26384a",shop:1,roof:"#777"},block:{w:34,d:30,h:30,wall:"#b9a48c",glass:"#2b3b4c",shop:1,roof:"#7a6f66"},mid:{w:28,d:24,h:21,wall:"#c4b7a2",glass:"#2b3b4c",shop:1,roof:"#7a6f66"},house:{w:12,d:10,h:7,wall:"#d8c6a9",glass:"#33475b",roof:"#8a4b3a"},house2:{w:10,d:12,h:8,wall:"#c98f7a",glass:"#33475b",roof:"#5b6670"},shop:{w:34,d:28,h:8,wall:"#d9d4c7",glass:"#3a5266",shop:1,roof:"#777"},mall:{w:62,d:46,h:12,wall:"#c9ced6",glass:"#26384a",shop:1,roof:"#888"},station:{w:70,d:34,h:20,wall:"#a89a85",glass:"#26384a",shop:1,roof:"#6b6b6b"},depot:{w:50,d:26,h:9,wall:"#8a8f96",glass:"#222",roof:"#666"}};function $d(i,t,e,n){let r=Math.ceil(i*8),a=Math.ceil(t*8),o=Gr(r,a),l=Gr(r,a),c=o.getContext("2d"),u=l.getContext("2d");c.fillStyle=e.wall,c.fillRect(0,0,r,a),u.fillStyle="#000",u.fillRect(0,0,r,a);let f=3.5,h=1.7,d=1.9,m=Math.max(1,Math.floor(t/f)),x=Math.max(1,Math.floor(i/3.2));for(let p=0;p<m;p++){let M=a-(p+1)*f*8+(f-d)/2*8;if(p===0&&e.shop){c.fillStyle=e.glass,c.fillRect(r*.04,M-6,r*.92,d*8+8),u.fillStyle="#ffe9b0",u.fillRect(r*.04,M-6,r*.92,d*8+8);continue}for(let b=0;b<x;b++){let y=(b+.5)*(r/x)-h*8/2;c.fillStyle=e.glass,c.fillRect(y,M,h*8,d*8),n()<.4&&(u.fillStyle=n()<.8?"#ffd98a":"#bcd8ff",u.fillRect(y,M,h*8,d*8))}}let g=p=>{let M=new On(p);return M.colorSpace=Pe,M.anisotropy=4,M};return{map:g(o),emissive:g(l)}}function uh(i,t,e,n){let s=Gr(i,i),r=s.getContext("2d");r.fillStyle=t,r.fillRect(0,0,i,i);for(let o=0;o<i*i/12;o++){let l=(Math.random()-.5)*e|0;r.fillStyle=`rgba(${l>0?255:0},${l>0?255:0},${l>0?255:0},${Math.abs(l)/255})`,r.fillRect(Math.random()*i,Math.random()*i,2,2)}n&&(r.strokeStyle=n,r.lineWidth=2,r.strokeRect(0,0,i,i));let a=new On(s);return a.colorSpace=Pe,a.wrapS=a.wrapT=is,a}var pl=class{constructor(t,e){this.scene=t,this.renderer=e,this.col=new dl,this.rand=A_(7),this.nightMats=[],this.wetMats=[],this.build()}setNight(t){for(let e of this.nightMats)e.emissiveIntensity=e.userData.max*t}setWet(t){for(let e of this.wetMats)e.roughness=e.userData.dry-t*.55}instanced(t,e,n,s,r=!1){let a=new Ae(t,e,Math.max(1,n.length));return n.forEach((o,l)=>a.setMatrixAt(l,o)),s&&s.forEach((o,l)=>a.setColorAt(l,o)),a.count=n.length,a.castShadow=r,a.receiveShadow=!0,a.frustumCulled=!1,this.scene.add(a),a}M(t,e,n,s=0,r=1,a=1,o=1){return Hr.position.set(t,e,n),Hr.rotation.set(0,s,0),Hr.scale.set(r,a,o),Hr.updateMatrix(),Hr.matrix.clone()}build(){let{scene:t,rand:e}=this,n=900,s=(h,d)=>new De(h,d).rotateX(-Math.PI/2),r=uh(128,"#3f6b3a",60);r.repeat.set(500,500),r.anisotropy=this.renderer.capabilities.getMaxAnisotropy();let a=new Ut(new De(6e3,6e3),new Vt({map:r,roughness:1}));a.rotation.x=-Math.PI/2,a.position.y=-.02,a.receiveShadow=!0,t.add(a);let o=uh(128,"#43484f",50);o.anisotropy=this.renderer.capabilities.getMaxAnisotropy();let l=new Vt({map:o,roughness:.95});l.userData.dry=.95,this.wetMats.push(l),this.asphalt=l;let c=n+12+40;for(let h=0;h<10;h++){let d=new Ut(new qt(c,.04,12),l);d.position.set(0,0,Oe(h));let m=new Ut(new qt(12,.04,c),l);m.position.set(Oe(h),.002,0),d.receiveShadow=m.receiveShadow=!0,t.add(d,m)}let u=new Vt({map:uh(64,"#9a9a96",40,"#7a7a76"),roughness:.9});u.map.repeat.set(30,30);let f=[];for(let h=0;h<9;h++)for(let d=0;d<9;d++)f.push(this.M((h-4)*100,.075,(d-4)*100,0,88,.15,88));this.instanced(new qt(1,1,1),u,f),this.markings(),this.lots(),this.treesAndLamps(),this.busStops(),this.chargers()}markings(){let t=new we({color:"#e8e8e8"}),e=(m,x)=>new De(m,x).rotateX(-Math.PI/2),n=[],s=[],r=[],a=[],o=[],l=.035;for(let m of Ze)Se.forEach((x,g)=>{if(!An(m.i+x.x,m.j+x.z))return;let p=g%2===0?Math.PI/2:0,M=tn(x);if(g<2)for(let b=14;b<86;b+=7)n.push(this.M(m.x+x.x*(b+1.5),l,m.z+x.z*(b+1.5),p));if(m.type!=="round")if(r.push(this.M(m.x+x.x*11.5-M.x*Jd,l,m.z+x.z*11.5-M.z*Jd,p)),m.type==="signal")for(let b=-5.5;b<=5.5;b+=1)s.push(this.M(m.x+x.x*9+M.x*b,l,m.z+x.z*9+M.z*b,p));else R_(m,g)&&(a.push(this.M(m.x+x.x*9-M.x*6.8,2.4,m.z+x.z*9-M.z*6.8,Math.atan2(x.x,x.z))),o.push(this.M(m.x+x.x*9-M.x*6.8,1.2,m.z+x.z*9-M.z*6.8)))});this.instanced(e(.18,3),t,n),this.instanced(e(.5,3),t,s),this.instanced(e(5.8,.4),t,r);let c=Gr(64,64),u=c.getContext("2d");u.fillStyle="#c4161c",u.fillRect(0,0,64,64),u.strokeStyle="#fff",u.lineWidth=4,u.strokeRect(3,3,58,58),u.fillStyle="#fff",u.font="bold 20px sans-serif",u.textAlign="center",u.fillText("STOP",32,40);let f=new On(c);f.colorSpace=Pe,this.instanced(new qt(.8,.8,.05),new we({map:f}),a),this.instanced(new ce(.04,.04,2.4,6),new Vt({color:"#888"}),o);let h=[],d=[];for(let m of Ze)m.type==="round"&&(h.push(this.M(m.x,.12,m.z,0,4.2,.24,4.2)),this.col.addCircle(m.x,m.z,4.2,"island"),d.push([m.x,m.z]));this.instanced(new ce(1,1,1,24),new Vt({color:"#4d7f3f"}),h),this.islandTrees=d}lots(){let{rand:t}=this,e={},n=(u,f,h)=>{let d=Zd[u];(e[u]??=[]).push(this.M(f,d.h/2+.15,h)),this.col.addBox(f-d.w/2,f+d.w/2,h-d.d/2,h+d.d/2,"building")},s=[],r=[],a=[],o=[],l=[];this.parkTrees=l;let c=u=>u[Math.floor(t()*u.length)];for(let u=0;u<9;u++)for(let f=0;f<9;f++){let h=(u-4)*100,d=(f-4)*100,m=Ts(u,f);if(m==="centre")for(let x of[-20,20])for(let g of[-20,20]){let p=c(u===4&&f===4?["tower1","tower2","tower2","tower3"]:["tower1","tower3","office","block","mid","tower2"]);n(p,h+x,d+g)}else if(m==="peripherie")if(t()<.15){s.push(this.M(h,.16,d,0,80,1,80));for(let x=0;x<14;x++)l.push([h+(t()-.5)*70,d+(t()-.5)*70])}else for(let x of[-26,0,26])for(let g of[-26,0,26])t()<.85&&n(t()<.5?"house":"house2",h+x+(t()-.5)*4,d+g+(t()-.5)*4);else if(m==="commerce")r.push(this.M(h,.16,d,0,80,1,80)),t()<.5?n("mall",h,d-14):(n("shop",h-20,d-22),n("shop",h+20,d-22));else if(u===1&&f===4)r.push(this.M(h,.16,d,0,80,1,80)),n("depot",h,d-25);else if(u===2&&f===4)r.push(this.M(h,.16,d,0,80,1,80)),n("station",h,d-20),this.stationSign=[h,d-20+17.2];else{o.push(this.M(h,.16,d,0,80,1,80));for(let x=-3;x<=3;x+=2)for(let g of[-.72,.72])a.push(this.M(h,.22,d+x*9+g,0,78,1,1))}}this.instanced(dh(),new Vt({color:"#4a8a3d",roughness:1}),s),this.instanced(dh(),new Vt({color:"#35383d",roughness:.95}),r),this.instanced(dh(),new Vt({color:"#6b6258",roughness:1}),o),this.instanced(new qt(1,.12,.12),new Vt({color:"#8a8f96",metalness:.6}),a);for(let[u,f]of Object.entries(e)){let h=Zd[u],d=$d(h.d,h.h,h,t),m=h.w===h.d?d:$d(h.w,h.h,h,t),x=y=>{let E=new Vt({map:y.map,emissiveMap:y.emissive,emissive:"#ffffff",emissiveIntensity:0,roughness:.8});return E.userData.max=1.1,this.nightMats.push(E),E},g=x(d),p=x(m),M=new Vt({color:h.roof,roughness:.9}),b=new Ae(new qt(h.w,h.h,h.d),[g,g,M,M,p,p],f.length);f.forEach((y,E)=>b.setMatrixAt(E,y)),b.castShadow=b.receiveShadow=!0,b.frustumCulled=!1,this.scene.add(b)}if(this.stationSign){let u=Gr(512,96),f=u.getContext("2d");f.fillStyle="#12306b",f.fillRect(0,0,512,96),f.fillStyle="#fff",f.font="bold 64px sans-serif",f.textAlign="center",f.fillText("GARE",256,70);let h=new On(u);h.colorSpace=Pe;let d=new Vt({map:h,emissiveMap:h,emissive:"#fff",emissiveIntensity:.4}),m=new Ut(new De(16,3),d);m.position.set(this.stationSign[0],14,this.stationSign[1]),this.scene.add(m)}}treesAndLamps(){let{rand:t}=this,e=Yd.map(d=>d.shelter),n=(d,m,x)=>e.some(g=>Math.hypot(g.x-d,g.z-m)<x),s=(d,m,x)=>Ze.some(g=>Math.abs(g.x-d)<x&&Math.abs(g.z-m)<x),r=[],a=88/2;for(let d=0;d<9;d++)for(let m=0;m<9;m++){let x=(d-4)*100,g=(m-4)*100,p=Ts(d,m),M=p==="centre"?18:12;for(let b=-a+8;b<=a-8;b+=M)for(let[y,E]of[[x+b,g-a+1.8],[x+b,g+a-1.8],[x-a+1.8,g+b],[x+a-1.8,g+b]])s(y,E,15)||n(y,E,6)||r.push([y,E])}r.push(...this.parkTrees??[],...this.islandTrees??[]);let o=[],l=[],c=[];for(let[d,m]of r){let x=.8+t()*.6;o.push(this.M(d,1*x,m,0,x,x,x)),l.push(this.M(d,3.3*x,m,t()*3,x,x,x)),c.push(new At().setHSL(.27+t()*.08,.5,.25+t()*.1)),this.col.addCircle(d,m,.5,"tree")}this.instanced(new ce(.15,.22,2,6),new Vt({color:"#5a3c25"}),o),this.instanced(new pr(1.6,0),new Vt({color:"#ffffff",flatShading:!0}),l,c);let u=[],f=[];for(let d of Ze)for(let m=0;m<2;m++){let x=Se[m];if(!An(d.i+x.x,d.j+x.z))continue;let g=tn(x);for(let p of[22,38,62,78])for(let M of[-1,1]){let b=d.x+x.x*p+g.x*M*6.8,y=d.z+x.z*p+g.z*M*6.8;u.push(this.M(b,3.25,y)),f.push(this.M(b-g.x*M*.9,6.5,y-g.z*M*.9,m%2===0?0:Math.PI/2)),this.col.addCircle(b,y,.25,"lamp")}}this.instanced(new ce(.07,.1,6.5,6),new Vt({color:"#555"}),u);let h=new Vt({color:"#fff3c0",emissive:"#ffd27a",emissiveIntensity:0});h.userData.max=3,this.nightMats.push(h),this.instanced(new qt(1.8,.14,.35),h,f)}busStops(){let t=[],e=[],n=[],s=[],r=[],a=[],o=new Set;for(let c of Cn)for(let u of c.stops){let f=`${u.shelter.x},${u.shelter.z}`,h=u.axis==="x",d=h?0:Math.PI/2,m={x:-u.hz,z:u.hx},x=u.shelter.x+m.x*.6,g=u.shelter.z+m.z*.6;if(!o.has(f)){o.add(f),t.push(this.M(u.shelter.x,2.5,u.shelter.z,d)),e.push(this.M(x,1.25,g,d));for(let p of[-1.5,1.5])n.push(this.M(u.shelter.x+u.hx*p,1.25,u.shelter.z+u.hz*p));s.push(this.M(u.x+m.x*2.4-u.hx*2.5,1.6,u.z+m.z*2.4-u.hz*2.5)),this.col.addBox(u.shelter.x-(h?1.7:.7),u.shelter.x+(h?1.7:.7),u.shelter.z-(h?.7:1.7),u.shelter.z+(h?.7:1.7),"shelter")}r.push(this.M(u.x+m.x*2.4-u.hx*2.5,3.5,u.z+m.z*2.4-u.hz*2.5,Math.atan2(u.hx,u.hz)+Math.PI/2)),a.push(new At(c.color))}let l=new Vt({color:"#8fb5cc",transparent:!0,opacity:.45});this.instanced(new qt(3.4,.12,1.5),new Vt({color:"#333"}),t,null,!0),this.instanced(new qt(3.2,2.2,.06),l,e),this.instanced(new ce(.05,.05,2.5,6),new Vt({color:"#444"}),n),this.instanced(new ce(.04,.04,3.2,6),new Vt({color:"#777"}),s),this.instanced(new ce(.4,.4,.06,16).rotateZ(Math.PI/2),new we({color:"#fff"}),r,a)}chargers(){let t=new Vt({color:"#1fe0b0",emissive:"#1fe0b0",emissiveIntensity:.8});for(let e of ws){let n=new Ut(new qt(.5,1.8,.4),t);n.position.set(e.px,.9,e.pz);let s=new Ut(new qt(6,.2,2.6),new Vt({color:"#2f3b46"}));s.position.set(e.px,3.6,e.pz-1);let r=new Ut(new De(14,3.4).rotateX(-Math.PI/2),new we({color:"#1fe0b0",transparent:!0,opacity:.25}));r.position.set(e.x,.05,e.z),this.scene.add(n,s,r),this.col.addCircle(e.px,e.pz,.5,"charger")}}},Jd=3,R_=(i,t)=>(t%2===0?"x":"z")!==i.major,dh=()=>new De(1,1).rotateX(-Math.PI/2);var ml=38;function Bi(i,t,e){let n=(e+i.off)%ml;return t==="z"?n<14?"G":n<17?"Y":"R":n>=19&&n<33?"G":n>=33&&n<36?"Y":"R"}function Kd(i,t,e){let n=(e+i.off)%ml;return t==="z"?n>=17?ml-n:0:n<19?19-n:n>=36?ml-n+19:0}var C_={R:["#ff2a2a","#2a0a0a"],Y:["#ffc400","#2a2200"],G:["#27e85f","#052a10"]},gl=class{constructor(t){this.arms=[];for(let r of Ze)r.type==="signal"&&Se.forEach((a,o)=>{if(!An(r.i+a.x,r.j+a.z))return;let l=tn({x:-a.x,z:-a.z});this.arms.push({n:r,k:o,axis:ti(o),x:r.x+a.x*7.5+l.x*6.6,z:r.z+a.z*7.5+l.z*6.6,d:a})});let e=this.arms.length,n=new ae,s=(r,a,o)=>{let l=new Ae(r,a,o);return l.frustumCulled=!1,t.add(l),l};this.poles=s(new qt(.2,4.2,.2),new Vt({color:"#333"}),e),this.heads=s(new qt(.45,1.3,.35),new Vt({color:"#111"}),e),this.bulbs=s(new bn(.16,8,6),new we({color:"#fff"}),e*3),this.arms.forEach((r,a)=>{n.rotation.set(0,Math.atan2(r.d.x,r.d.z),0),n.scale.set(1,1,1),n.position.set(r.x,2.1,r.z),n.updateMatrix(),this.poles.setMatrixAt(a,n.matrix),n.position.set(r.x,4.5,r.z),n.updateMatrix(),this.heads.setMatrixAt(a,n.matrix),[4.9,4.5,4.1].forEach((o,l)=>{n.position.set(r.x+r.d.x*.2,o,r.z+r.d.z*.2),n.updateMatrix(),this.bulbs.setMatrixAt(a*3+l,n.matrix)})}),this.cache=new Map,this.byNode=new Map,this.arms.forEach((r,a)=>{let o=r.n.idx;this.byNode.has(o)||this.byNode.set(o,[]),this.byNode.get(o).push(a)}),this.update(0,!0)}update(t,e=!1){let n=!1;for(let[s,r]of this.byNode){let a=Ze[s];for(let o of["x","z"]){let l=Bi(a,o,t),c=s+o;if(!(!e&&this.cache.get(c)===l)){this.cache.set(c,l),n=!0;for(let u of r)this.arms[u].axis===o&&["R","Y","G"].forEach((f,h)=>this.bulbs.setColorAt(u*3+h,new At(C_[f][l===f?0:1])))}}}n&&(this.bulbs.instanceColor.needsUpdate=!0)}};var fh=Math.PI*2,xl=(i,t,e)=>Math.min(e,Math.max(t,i)),jd=(i,t)=>i.x*t.z-i.z*t.x;function nf(i,t,e){let n=[0];for(let s=1;s<t.length;s++)n.push(n[s-1]+Math.hypot(t[s].x-t[s-1].x,t[s].z-t[s-1].z));return{type:i,pts:t,cum:n,len:n[n.length-1],...e}}function Qd(i,t){let e=Se[t],n=tn(e),s=hn(i.i+e.x,i.j+e.z);return nf("edge",[{x:i.x+e.x*6+n.x*3,z:i.z+e.z*6+n.z*3},{x:s.x-e.x*6+n.x*3,z:s.z-e.z*6+n.z*3}],{a:i,b:s,k:t,key:Hn(i.i,i.j,s.i,s.j)})}function I_(i,t,e){let n=Se[t],s=tn(n),r=Se[e],a=tn(r),o={x:i.x-n.x*6+s.x*3,z:i.z-n.z*6+s.z*3},l={x:i.x+r.x*6+a.x*3,z:i.z+r.z*6+a.z*3},c=[];if(i.type==="round"){let u=Math.hypot(o.x-i.x,o.z-i.z),f=Math.atan2(o.x-i.x,o.z-i.z),d=((Math.atan2(l.x-i.x,l.z-i.z)-f)%fh+fh)%fh,m=Math.max(2,Math.ceil(d/.2));for(let x=0;x<=m;x++){let g=f+d*x/m;c.push({x:i.x+Math.sin(g)*u,z:i.z+Math.cos(g)*u})}}else if(e===t)c.push(o,l);else{let u=jd({x:l.x-o.x,z:l.z-o.z},r)/jd(n,r),f={x:o.x+n.x*u,z:o.z+n.z*u};for(let h=0;h<=8;h++){let d=h/8,m=1-d;c.push({x:m*m*o.x+2*m*d*f.x+d*d*l.x,z:m*m*o.z+2*m*d*f.z+d*d*l.z})}}return nf("turn",c,{b:i,k:t,k2:e})}function tf(i,t,e){let{pts:n,cum:s}=i,r=1;for(;r<n.length-1&&s[r]<t;)r++;let a=n[r-1],o=n[r],l=s[r]-s[r-1]||1,c=xl((t-s[r-1])/l,0,1);return e.x=a.x+(o.x-a.x)*c,e.z=a.z+(o.z-a.z)*c,e.h=Math.atan2(o.x-a.x,o.z-a.z),e}var ef=(i,t)=>(t-i+4)%4,_l=class{constructor(t,e=70){this.cars=[],this.occ=new Map,this.closed=new Set,this.jam=new Set,this.n=e;let n=new Ae(new qt(1.8,.75,4.2),new Vt({color:"#fff",roughness:.5}),e),s=new Ae(new qt(1.6,.6,2.2),new Vt({color:"#27313c",roughness:.2}),e);this.lamps=new Ae(new qt(.4,.16,.06),new we({color:"#fff"}),e*4);for(let a of[n,s,this.lamps])a.frustumCulled=!1,t.add(a);n.castShadow=s.castShadow=!0,this.body=n,this.cab=s,this.dummy=new ae,this.tmp={};let r=["#c0392b","#2980b9","#ecf0f1","#2c3e50","#f39c12","#27ae60","#7f8c8d","#8e44ad","#bdc3c7"];for(let a=0;a<e;a++)this.cars.push({leg:null,s:0,v:0,desired:10,nextK:0,stopT:0,stuck:0,x:0,z:0,h:0,active:!1}),n.setColorAt(a,new At(r[a%r.length]));for(let a=0;a<e;a++)for(let o=0;o<4;o++)this.lamps.setColorAt(a*4+o,new At(o<2?"#fff3c0":"#c01010"))}place(t,e,n,s){t.leg=Qd(e,n),t.s=s,t.stopT=0,t.active=!0,this.pickNext(t),tf(t.leg,s,t)}pickNext(t){let e=t.leg.b,n=[];Se.forEach((s,r)=>{if(r===(t.leg.k+2)%4)return;let a=e.i+s.x,o=e.j+s.z;An(a,o)&&!this.closed.has(Hn(e.i,e.j,a,o))&&n.push(r)}),t.nextK=n.length?n[Math.floor(Math.random()*n.length)]:-1}respawn(t,e,n=90,s=380){for(let r=0;r<20;r++){let a=xl(Math.round(e.x/100+4.5+(Math.random()-.5)*2*(s/100)),0,9),o=xl(Math.round(e.z/100+4.5+(Math.random()-.5)*2*(s/100)),0,9),l=Math.floor(Math.random()*4),c=hn(a,o);if(!An(a+Se[l].x,o+Se[l].z)||this.closed.has(Hn(a,o,a+Se[l].x,o+Se[l].z)))continue;this.place(t,c,l,5+Math.random()*74);let u=Math.hypot(t.x-e.x,t.z-e.z);if(u<n||u>s*1.3||this.cars.some(f=>f!==t&&f.active&&Math.hypot(f.x-t.x,f.z-t.z)<8)){t.active=!1;continue}return t.v=0,t.desired=8+Math.random()*4,!0}return t.active=!1,!1}leaveNode(t){if(t.inNode!=null){let e=this.occ.get(t.inNode);e&&e.splice(e.indexOf(t),1),t.inNode=null}}init(t){for(let e of this.cars)this.respawn(e,t,30,450)}closeEdge(t,e){this.closed.add(t);for(let n of this.cars)n.active&&n.leg.key===t&&(this.leaveNode(n),this.respawn(n,e))}openEdge(t){this.closed.delete(t)}gather(t,e,n,s){this.cars.slice().sort((a,o)=>Math.hypot(o.x-s.x,o.z-s.z)-Math.hypot(a.x-s.x,a.z-s.z)).slice(0,n).forEach((a,o)=>{this.leaveNode(a),this.place(a,t,e,8+o*6.5),a.v=1}),this.jam.add(Hn(t.i,t.j,t.i+Se[e].x,t.j+Se[e].z))}canEnter(t,e,n,s){let r=t.leg.b,a=t.leg.k;if(r.type==="signal"){let c=Bi(r,ti(a),e);if(c==="R"||c==="Y"&&n>t.v*t.v/6)return!1}else if(r.type==="stop"&&ti(a)!==r.major&&t.stopT<1.5)return!1;let o=t.nextK<0?0:ef(a,t.nextK),l=(c,u)=>c===a?!1:r.type==="round"?!0:c===(a+2)%4?o===3||u===3:!0;for(let c of this.occ.get(r.idx)??[])if(l(c.leg.k,ef(c.leg.k,c.nextK)))return!1;for(let c of s.nodes)if(c.idx===r.idx&&l(c.k,3))return!1;return!0}update(t,e){let{t:n,bus:s,peds:r}=e,a=0;this.cars.forEach((o,l)=>{if(!o.active){a++<2&&this.respawn(o,s);return}let c=o.leg,u=1/0,f=1/0;c.type==="edge"&&(f=c.len-5.5-2.2-o.s,f>-1&&(o.v<.3&&f<2?o.stopT+=t:f>=2&&(o.stopT=0),this.canEnter(o,n,Math.max(f,0),s)||(u=f)));let h=Math.sin(o.h),d=Math.cos(o.h),m=(p,M,b,y)=>{let E=p-o.x,T=M-o.z,R=E*h+T*d;R<.5||R>30||Math.abs(E*d-T*h)>y||(u=Math.min(u,R-b-2.2))};for(let p=0;p<this.cars.length;p++){let M=this.cars[p];p!==l&&M.active&&m(M.x,M.z,2.1,1.9)}for(let p of s.circles)m(p.x,p.z,p.r,p.r+1);for(let p of r)m(p.x,p.z,.3,1.6);let x=1;c.type==="edge"&&this.jam.has(c.key)&&(x=.12);let g=o.desired*x;if(c.type==="turn"&&(g=Math.min(g,6)),u<1/0&&(g=Math.min(g,Math.sqrt(2*3.5*Math.max(u-1.2,0)))),o.v+=xl(g-o.v,-6*t,2.2*t),o.stuck=o.v<.2?o.stuck+t:0,o.s+=o.v*t,o.s>=c.len){let p=o.s-c.len;if(c.type==="edge"){if(o.nextK<0){this.respawn(o,s);return}let M=I_(c.b,c.k,o.nextK);o.inNode=c.b.idx;let b=this.occ.get(o.inNode);b||this.occ.set(o.inNode,b=[]),b.push(o),o.turn=M,o.edgeLeg=c,o.leg=Object.assign(M,{b:c.b,k:c.k}),o.s=p}else{this.leaveNode(o);let M=c.b,b=c.k2,y=Se[b];if(!An(M.i+y.x,M.j+y.z)){this.respawn(o,s);return}o.leg=Qd(M,b),o.s=p,o.stopT=0,this.pickNext(o)}}tf(o.leg,o.s,o),o.stuck>45&&Math.hypot(o.x-s.x,o.z-s.z)>80?(this.leaveNode(o),this.respawn(o,s)):Math.hypot(o.x-s.x,o.z-s.z)>450&&(this.leaveNode(o),this.respawn(o,s))}),this.render()}render(){let t=this.dummy;this.cars.forEach((e,n)=>{let s=e.active?1:0,r=Math.sin(e.h),a=Math.cos(e.h);t.rotation.set(0,e.h,0),t.position.set(e.x,.7,e.z),t.scale.set(s,s,s),t.updateMatrix(),this.body.setMatrixAt(n,t.matrix),t.position.set(e.x-r*.2,1.4,e.z-a*.2),t.updateMatrix(),this.cab.setMatrixAt(n,t.matrix),[[.6,2.1,0],[-.6,2.1,0],[.6,-2.1,0],[-.6,-2.1,0]].forEach(([o,l],c)=>{t.position.set(e.x+a*o+r*l,.75,e.z-r*o+a*l),t.updateMatrix(),this.lamps.setMatrixAt(n*4+c,t.matrix)})}),this.body.instanceMatrix.needsUpdate=this.cab.instanceMatrix.needsUpdate=this.lamps.instanceMatrix.needsUpdate=!0,this.body.instanceColor.needsUpdate=!0}};var vl=120,Vr=7.4,P_=1.4,yl=class{constructor(t){this.cws=[];for(let n of Ze)n.type==="signal"&&Se.forEach((s,r)=>{if(!An(n.i+s.x,n.j+s.z))return;let a=tn(s),o=n.x+s.x*9,l=n.z+s.z*9;this.cws.push({n,axis:ti(r),ax:o-a.x*Vr,az:l-a.z*Vr,bx:o+a.x*Vr,bz:l+a.z*Vr,cx:o,cz:l})});this.list=[],this.active=[],this.lastScan=-9,this.body=new Ae(new ce(.22,.25,1.1,8),new Vt({color:"#fff"}),vl),this.head=new Ae(new bn(.14,8,6),new Vt({color:"#e0b896"}),vl);let e=["#c0392b","#2980b9","#27ae60","#8e44ad","#d35400","#34495e","#f1c40f","#16a085"];for(let n=0;n<vl;n++)this.body.setColorAt(n,new At(e[n%e.length]));for(let n of[this.body,this.head])n.frustumCulled=!1,n.count=0,n.castShadow=!0,t.add(n);this.d=new ae,this.crossing=[]}update(t,e,n){if(e-this.lastScan>1&&(this.lastScan=e,this.active=this.cws.filter(r=>Math.hypot(r.cx-n.x,r.cz-n.z)<170)),this.list.length<vl&&this.active.length&&Math.random()<t*4){let r=this.active[Math.floor(Math.random()*this.active.length)];this.list.push({cw:r,side:Math.random()<.5?0:1,t:0,state:"wait",wait:1+Math.random()*10,x:0,z:0,ph:Math.random()*6})}this.crossing.length=0;for(let r=this.list.length-1;r>=0;r--){let a=this.list[r],o=a.cw;if(Math.hypot(o.cx-n.x,o.cz-n.z)>260){this.list.splice(r,1);continue}a.state==="wait"?(a.wait-=t,a.wait<=0&&Bi(o.n,o.axis,e)==="R"&&Kd(o.n,o.axis,e)>=12.5&&(a.state="cross",a.t=0)):(a.t+=P_*t/(2*Vr),a.t>=1&&(a.state="wait",a.t=0,a.side^=1,a.wait=4+Math.random()*14));let l=a.side===0?a.t:1-a.t,c=a.state==="cross"?l:a.side===0?0:1;a.x=o.ax+(o.bx-o.ax)*c,a.z=o.az+(o.bz-o.az)*c,a.state==="cross"&&this.crossing.push(a)}let s=this.d;this.list.forEach((r,a)=>{let o=r.state==="cross"?Math.abs(Math.sin(e*7+r.ph))*.05:0;s.rotation.set(0,0,0),s.scale.set(1,1,1),s.position.set(r.x,.7+o,r.z),s.updateMatrix(),this.body.setMatrixAt(a,s.matrix),s.position.set(r.x,1.42+o,r.z),s.updateMatrix(),this.head.setMatrixAt(a,s.matrix)}),this.body.count=this.head.count=this.list.length,this.body.instanceMatrix.needsUpdate=this.head.instanceMatrix.needsUpdate=!0}remove(t){let e=this.list.indexOf(t);e>=0&&this.list.splice(e,1)}};var Ml=16,Sl=class{constructor(t){this.body=new Ae(new ce(.2,.23,1.2,8),new Vt({color:"#fff"}),Ml),this.head=new Ae(new bn(.14,8,6),new Vt({color:"#e0b896"}),Ml);let e=["#c0392b","#2980b9","#27ae60","#8e44ad","#d35400","#34495e","#f1c40f","#16a085"];for(let n=0;n<Ml;n++)this.body.setColorAt(n,new At(e[n*3%e.length]));for(let n of[this.body,this.head])n.frustumCulled=!1,n.count=0,t.add(n);this.stop=null,this.d=new ae}set(t,e){let n=t?Math.min(e,Ml):0,s=this.d;for(let r=0;r<n;r++){let a=(r%8-3.5)*.55,o=-.5-Math.floor(r/8)*.6,l=t.shelter.x+t.hx*a+-t.hz*o,c=t.shelter.z+t.hz*a+t.hx*o;s.position.set(l,.75,c),s.updateMatrix(),this.body.setMatrixAt(r,s.matrix),s.position.set(l,1.5,c),s.updateMatrix(),this.head.setMatrixAt(r,s.matrix)}this.body.count=this.head.count=n,this.body.instanceMatrix.needsUpdate=this.head.instanceMatrix.needsUpdate=!0}};var ph="busCitySimulator.save.v1",Rs=[0,150,500,1100,2e3],rf=2.6,sf=()=>({money:1500,xp:0,ownedBuses:["minibus"],ownedLines:["L1"],bus:"minibus",line:"L1",fines:0,finesTotal:0,runs:0,pax:0,stopsDone:0,energy:{minibus:1},hours:8}),bl=class{constructor(){let t=null;try{t=JSON.parse(localStorage.getItem(ph))}catch{}this.d={...sf(),...t??{}},this.onLevel=()=>{},this.dirty=!1}get level(){let t=1;return Rs.forEach((e,n)=>{this.d.xp>=e&&(t=n+1)}),t}get maxLevel(){return this.level>=Rs.length}xpProgress(){let t=this.level,e=Rs[t-1],n=Rs[t];return n===void 0?1:(this.d.xp-e)/(n-e)}addMoney(t){this.d.money+=t,this.dirty=!0}addXp(t){let e=this.level;this.d.xp+=t,this.dirty=!0,this.level>e&&this.onLevel(this.level)}ownsBus(t){return this.d.ownedBuses.includes(t)}ownsLine(t){return this.d.ownedLines.includes(t)}buyBus(t){let e=Es[t];return this.ownsBus(t)?"D\xE9j\xE0 poss\xE9d\xE9":this.level<e.level?`Niveau ${e.level} requis`:this.d.money<e.price?"Fonds insuffisants":(this.d.money-=e.price,this.d.ownedBuses.push(t),this.save(),null)}buyLine(t){let e=Cn.find(n=>n.id===t);return this.ownsLine(t)?"D\xE9j\xE0 poss\xE9d\xE9e":this.level<e.level?`Niveau ${e.level} requis`:this.d.money<e.price?"Fonds insuffisants":(this.d.money-=e.price,this.d.ownedLines.push(t),this.save(),null)}save(){try{localStorage.setItem(ph,JSON.stringify(this.d))}catch{}this.dirty=!1}reset(){try{localStorage.removeItem(ph)}catch{}this.d=sf()}};var El=class{constructor(t){this.g=t,this.cool={speed:0,hit:0},this.slow=-1,this.insideNode=-1,this.limit=50}update(t){let e=this.g,n=e.vehicle.phys,s=e.time;for(let h in this.cool)this.cool[h]=Math.max(0,this.cool[h]-t);let r=Math.abs(n.speed)*3.6;this.limit=Dd[Br(n.x,n.z)],r>this.limit+10&&!this.cool.speed&&(e.fine(45+Math.round(r-this.limit-10)*2,`Exc\xE8s de vitesse : ${Math.round(r)} km/h pour ${this.limit}`,4),this.cool.speed=10);let a=n.refPoint(),o=Math.min(9,Math.max(0,Math.round(a.x/100+4.5))),l=Math.min(9,Math.max(0,Math.round(a.z/100+4.5))),c=hn(o,l),u=Math.abs(a.x-c.x)<6&&Math.abs(a.z-c.z)<6;if(!u&&Math.hypot(a.x-c.x,a.z-c.z)<22&&Math.abs(n.speed)<1.5&&(this.slow=c.idx),u&&this.insideNode!==c.idx&&Math.abs(n.speed)>1){let h=ti(Ld(n.heading));c.type==="signal"&&Bi(c,h,s)==="R"?e.fine(135,"Feu rouge grill\xE9",12):c.type==="stop"&&h!==c.major&&this.slow!==c.idx&&e.fine(90,"Stop non marqu\xE9",6)}this.insideNode=u?c.idx:-1;let f=e.busCircles;for(let h of e.peds.crossing)for(let d of f)if(Math.hypot(h.x-d.x,h.z-d.z)<d.r+.3){e.fine(500,"Pi\xE9ton percut\xE9 !",30),e.peds.remove(h),e.audio.thud();break}}collision(t){t<1.2||this.cool.hit||(this.cool.hit=2.5,this.g.audio.thud(),t>2.5&&this.g.fine(100+Math.round(t*25),"Collision",Math.min(25,t*3)))}};var mh=(i,t,e)=>Math.min(e,Math.max(t,i)),L_={gare:[10,20],centre:[8,16],commerce:[5,12],peripherie:[2,8]},Tl=class{constructor(t){this.g=t,this.active=!1,this.line=null,this.run=null,this.stopIdx=0,this.onboard=0,this.satisfaction=100,this.doorsOpen=!1,this.doorsF=0,this.rampOn=!1,this.rampF=0,this.srv=null,this.waiting=0,this.pmr=null,this.extra=0,this.delay=0,this.promptText="",this.lastFine=0}get capacity(){return this.g.vehicle.stats.seats}get stop(){return this.line?this.line.stops[this.stopIdx]:null}get expected(){return this.run.t0+this.line.sched[this.stopIdx]+this.extra}start(t){this.line=Cn.find(e=>e.id===t),this.active=!0,this.stopIdx=0,this.extra=0,this.srv=null,this.run={t0:this.g.time,punct:0,early:0},this.g.economy.d.line=t,this.armStop(),this.g.toast(`Service d\xE9marr\xE9 : ${this.line.name}`,"ok")}end(){this.active=!1,this.line=null,this.srv=null,this.g.crowd.set(null,0)}armStop(){let t=this.stop,[e,n]=L_[t.zone];this.waiting=Math.round(e+Math.random()*(n-e)),this.srv=null,this.g.crowd.set(t,this.waiting)}toggleDoors(){let t=this.g,e=t.vehicle.phys;if(this.doorsOpen)this.srv&&this.srv.phase!=="done"&&(this.sat(-6),t.toast("D\xE9part pr\xE9cipit\xE9 : des voyageurs attendaient","warn"),this.srv.phase="done",this.srv.aborted=!0),this.doorsOpen=!1,t.audio.doors();else{if(Math.abs(e.speed)>.8)return t.toast("Arr\xEAtez le bus avant d'ouvrir les portes","warn");this.doorsOpen=!0,t.audio.doors()}}toggleRamp(){if(!this.doorsOpen)return this.g.toast("Ouvrez les portes pour d\xE9ployer la rampe","warn");this.rampOn=!this.rampOn,this.g.audio.beep(520,.1)}skipStop(){!this.active||this.doorsOpen||(this.g.toast(`Arr\xEAt \xAB ${this.stop.name} \xBB saut\xE9`,"bad"),this.sat(-10),this.g.fine(30,"Arr\xEAt non desservi",0),this.pmr=null,this.advance())}sat(t){this.satisfaction=mh(this.satisfaction+t,0,100)}inZone(){let t=this.stop,e=this.g.vehicle.phys,n=e.refPoint(),s=n.x-t.x,r=n.z-t.z,a=s*t.hx+r*t.hz,o=s*-t.hz+r*t.hx;return{ok:Math.abs(a)<9&&Math.abs(o)<1.6&&Math.abs(sl(e.heading-t.heading))<.25,along:a,lat:o,dist:Math.hypot(s,r)}}update(t){let e=this.g,n=e.vehicle.phys,s=e.vehicle.model;if(this.doorsF=mh(this.doorsF+(this.doorsOpen?1:-1)*t/1.2,0,1),this.doorsOpen||(this.rampOn=!1),this.rampF=mh(this.rampF+(this.rampOn?1:-1)*t/1,0,1),s.setDoors(this.doorsF),s.setRamp(this.rampF),s.setPassengers(this.onboard),this.onboard>0){let l=0;n.accelLong<-4.2&&(l+=(-n.accelLong-4.2)*2.5),n.accelLong>2.4&&(l+=(n.accelLong-2.4)*2),Math.abs(n.accelLat)>2.8&&Math.abs(n.speed)>3&&(l+=(Math.abs(n.accelLat)-2.8)*3),this.doorsF>.1&&Math.abs(n.speed)>2&&(l+=6),this.sat(l>0?-l*t:.25*t)}if(this.promptText="",!this.active)return;let r=this.inZone(),a=this.stop;if(this.delay=e.time-this.expected,!this.srv){this.doorsOpen&&r.ok&&Math.abs(n.speed)<.8?this.beginServe(r):r.ok&&Math.abs(n.speed)<.8?this.promptText="Ouvrez les portes (O)":r.dist<40&&(this.promptText=`Arr\xEAt \xAB ${a.name} \xBB : alignez-vous le long du trottoir`);return}let o=this.srv;if(o.timer-=t,o.phase==="alight")o.nOff<=0?o.phase="board":o.timer<=0&&(o.nOff--,this.onboard--,o.timer=.7,e.audio.beep(660,.05));else if(o.phase==="board"){let l=o.pmr&&!o.pmrDone&&this.rampF<.95;if(o.nWait<=0&&(!o.pmr||o.pmrDone))o.phase="done";else if(l&&o.nWait<=0)this.promptText="Passager PMR : d\xE9ployez la rampe (R)";else if(o.timer<=0){if(this.onboard>=this.capacity)e.toast("Bus complet","warn"),o.nWait=0,o.phase="done";else if(o.nWait>0){o.nWait--,this.onboard++,o.timer=.9;let c=rf*(.7+.3*this.satisfaction/100);o.revenue+=c,e.economy.addMoney(c),e.economy.d.pax++,e.audio.ticket()}else o.pmr&&!o.pmrDone&&this.rampF>=.95&&(o.pmrDone=!0,this.onboard=Math.min(this.capacity,this.onboard+1),o.timer=2,e.economy.addMoney(25),this.sat(5),e.toast("Assistance PMR : +25 \u20AC","ok"),this.pmr=null,e.audio.ticket());e.crowd.set(a,o.nWait+(o.pmr&&!o.pmrDone?1:0))}}o.phase==="done"?(o.finished||(o.finished=!0,o.aborted||(this.promptText="")),this.doorsOpen?this.promptText="Fermez les portes (O) et repartez":o.finished&&this.completeStop()):this.promptText||(this.promptText=`Arr\xEAt en cours : ${this.onboard} \xE0 bord`)}beginServe(t){let e=this.stop,n=this.stopIdx===this.line.stops.length-1,s=!!(this.pmr&&this.pmr.line===e.line&&this.pmr.k===e.k);this.srv={phase:"alight",timer:.5,arrive:this.g.time,expected:this.expected,lat:Math.abs(t.lat),nOff:n?this.onboard:Math.floor(this.onboard*(.25+Math.random()*.3)),nWait:this.waiting,pmr:s,pmrDone:!1,revenue:0,finished:!1,aborted:!1},this.g.audio.beep(880,.15)}completeStop(){let t=this.g,e=this.srv,n=t.economy,s=e.arrive-e.expected,r=`Arr\xEAt \xAB ${this.stop.name} \xBB : +${e.revenue.toFixed(0)} \u20AC`;if(Math.abs(s)<=20)n.addMoney(15),this.sat(3),this.run.punct++,r+=" \xB7 ponctuel +15 \u20AC";else if(s>60){let o=Math.min(40,Math.round((s-60)*.2));n.addMoney(-o),this.sat(-5),r+=` \xB7 retard \u2212${o} \u20AC`}let a=10;e.lat<.5&&(n.addMoney(5),a+=5,r+=" \xB7 arr\xEAt pr\xE9cis +5 \u20AC"),n.addXp(a),n.d.stopsDone++,t.toast(r,s>60?"warn":"ok"),this.advance()}advance(){let t=this.line.stops.length;if(this.stopIdx++,this.stopIdx>=t){let e=this.g,n=e.economy,s=Math.round(15*t*(.5+this.satisfaction/200));n.addMoney(s),n.addXp(40),n.d.runs++,e.toast(`Course termin\xE9e : bonus ${s} \u20AC \xB7 satisfaction ${Math.round(this.satisfaction)}%`,"ok");let r=this.line.stops[t-1].edgeIndex,o=(this.line.path.length-r+this.line.stops[0].edgeIndex)*100/fl;this.stopIdx=0,this.extra=0,this.run={t0:e.time+o-this.line.sched[0],punct:0},n.save()}this.armStop()}};var wl=class{constructor(t){this.g=t,this.timer=45,this.current=null,this.closed=[],this.group=new ze,t.scene.add(this.group)}get label(){return this.current?this.current.label:""}update(t){let e=this.g,n=e.service;if(this.current){let r=this.current;r.left-=t,r.type==="breakdown"&&r.left<=0?(e.vehicle.phys.canDrive=!0,e.toast("Moteur red\xE9marr\xE9","ok"),this.end()):(r.type==="jam"||r.type==="detour")&&r.left<=0?this.end():r.type==="pmr"&&!n.pmr&&this.end();return}if(!n.active||n.srv||(this.timer-=t,this.timer>0))return;this.timer=60+Math.random()*50;let s=["pmr","jam","detour","breakdown"][Math.floor(Math.random()*4)];this[s]()}end(){let t=this.current;if(t){if(t.type==="jam"&&this.g.traffic.jam.delete(t.key),t.type==="detour"){this.g.traffic.openEdge(t.key);for(let e of t.meshes)this.group.remove(e);for(let e of t.circles)this.g.city.col.dynamic.splice(this.g.city.col.dynamic.indexOf(e),1);this.closed=[],this.g.toast("Route rouverte","ok")}this.current=null}}edge(t){let e=this.g.service.line.path,n=e.length,s=e[(t%n+n)%n],r=e[((t+1)%n+n)%n];return{a:hn(s.i,s.j),b:hn(r.i,r.j),k:Se.findIndex(a=>a.x===Math.sign(r.i-s.i)&&a.z===Math.sign(r.j-s.j))}}pmr(){let t=this.g.service,e=t.stop;t.pmr={line:e.line,k:e.k},this.current={type:"pmr",left:1e9,label:"PMR"},this.g.toast(`Un passager PMR attend \xE0 l'arr\xEAt \xAB ${e.name} \xBB : rampe (R) une fois les portes ouvertes`,"info")}jam(){let t=this.g.service,e=this.edge(t.stop.edgeIndex+1),n=Hn(e.a.i,e.a.j,e.b.i,e.b.j);this.g.traffic.gather(e.a,e.k,9,this.g.vehicle.phys),this.current={type:"jam",left:80,key:n,label:"Embouteillage"},this.g.toast("Embouteillage signal\xE9 sur votre parcours, apr\xE8s le prochain arr\xEAt","warn")}detour(){let t=this.g,e=t.service,n=new Set(e.line.stops.map(m=>m.edgeIndex)),s=e.stop.edgeIndex+1;for(let m=0;m<4&&n.has((s%e.line.path.length+e.line.path.length)%e.line.path.length);m++)s++;let r=this.edge(s),a=Hn(r.a.i,r.a.j,r.b.i,r.b.j),o=Se[r.k],l=tn(o),c=(r.a.x+r.b.x)/2,u=(r.a.z+r.b.z)/2,f=[],h=[],d=new Vt({color:"#e0401c"});for(let m of[-3,3]){let x=new Ut(new qt(5.8,1,.4),d);x.position.set(c+l.x*m,.5,u+l.z*m),x.rotation.y=Math.atan2(l.x,l.z),x.castShadow=!0,this.group.add(x),f.push(x);let g={t:1,x:x.position.x,z:x.position.z,r:3.1,tag:"barrier"};t.city.col.dynamic.push(g),h.push(g)}t.traffic.closeEdge(a,t.vehicle.phys),this.closed=[{ax:r.a.x,az:r.a.z,bx:r.b.x,bz:r.b.z}],e.extra+=60,this.current={type:"detour",left:150,key:a,meshes:f,circles:h,label:"D\xE9viation"},t.toast("D\xE9viation : route barr\xE9e apr\xE8s le prochain arr\xEAt. Contournez par une rue voisine (+60 s de tol\xE9rance)","warn")}breakdown(){let t=this.g;Math.abs(t.vehicle.phys.speed)<.1||(t.vehicle.phys.canDrive=!1,t.service.sat(-5),this.current={type:"breakdown",left:18,label:"Panne moteur"},t.toast("Panne moteur ! Immobilisez-vous, le d\xE9pannage prend 18 s","bad"),t.audio.beep(180,.5,"sawtooth"))}};var Wr=(i,t,e)=>Math.min(e,Math.max(t,i)),D_=i=>i*i*(3-2*i),Xr={day:new At("#9cc7ea"),dusk:new At("#f08a4b"),night:new At("#070b1a"),rain:new At("#68737e"),fog:new At("#b8c0c6")},af={clear:"D\xE9gag\xE9",rain:"Pluie",fog:"Brouillard"},Al=class{constructor(t,e,n=8){this.scene=t,this.city=e,this.hours=n,this.weather="clear",this.timer=120,this.rain=0,this.fog=0,this.grip=1,this.night=0,this.elev=1,this.hemi=new vr("#dbeaff","#4a4a4a",1.1),this.sun=new br("#fff4e0",2.2),this.sun.castShadow=!0,this.sun.shadow.mapSize.set(2048,2048),Object.assign(this.sun.shadow.camera,{left:-45,right:45,top:45,bottom:-45,near:1,far:260}),this.sun.shadow.bias=-4e-4,t.add(this.hemi,this.sun,this.sun.target),t.background=new At,t.fog=new Zs("#9cc7ea",150,900);let s=1800,r=new Float32Array(s*6);this.drops=new Float32Array(s*3);for(let o=0;o<s;o++)this.drops[o*3]=(Math.random()-.5)*60,this.drops[o*3+1]=Math.random()*25,this.drops[o*3+2]=(Math.random()-.5)*60;let a=new Le;a.setAttribute("position",new Ke(r,3)),this.rainMesh=new er(a,new cs({color:"#cfe3f5",transparent:!0,opacity:0})),this.rainMesh.frustumCulled=!1,this.rainMesh.visible=!1,t.add(this.rainMesh),this.sky=new At}get clock(){let t=Math.floor(this.hours)%24,e=Math.floor(this.hours%1*60);return`${String(t).padStart(2,"0")}:${String(e).padStart(2,"0")}`}setWeather(t){this.weather=t}update(t,e,n){if(this.hours=(this.hours+t/60)%24,this.timer-=t,this.timer<=0){this.timer=90+Math.random()*120;let h=Math.random(),d=h<.5?"clear":h<.8?"rain":"fog";this.weather=d}let s=this.weather==="rain"?1:0,r=this.weather==="fog"?1:0,a=Math.min(1,t/12);this.rain+=(s-this.rain)*a,this.fog+=(r-this.fog)*a,this.grip=1-.3*this.rain;let o=(this.hours-6)/12*Math.PI,l=Math.sin(o);this.elev=l,this.night=1-Wr((l+.1)/.3,0,1);let c=Wr(l*2+.2,.08,1);this.sky.copy(Xr.night).lerp(Xr.dusk,D_(Wr((l+.15)/.2,0,1))).lerp(Xr.day,Wr((l-.1)/.3,0,1));let u=this.rain*.7,f=this.fog*.85;if(this.sky.lerp(Xr.rain.clone().multiplyScalar(c),u).lerp(Xr.fog.clone().multiplyScalar(c),f),this.scene.background.copy(this.sky),this.scene.fog.color.copy(this.sky),this.scene.fog.near=150-90*this.rain-142*this.fog,this.scene.fog.far=900-400*this.rain-770*this.fog,this.hemi.intensity=.28+.85*Wr(l+.1,0,1)*(1-.35*this.rain),this.hemi.color.set(this.night>.5?"#6f86b8":"#dbeaff"),this.sun.intensity=(Math.max(0,l)*2.2+.12)*(1-.65*this.rain-.4*this.fog),this.sun.color.set(l<.2?"#ffb070":"#fff4e0"),this.sun.position.set(e.x+Math.cos(o)*80,20+Math.max(.12,l)*90,e.z+40),this.sun.target.position.set(e.x,0,e.z),this.city.setNight(this.night),this.city.setWet(this.rain),this.rainMesh.visible=this.rain>.02,this.rainMesh.visible){this.rainMesh.material.opacity=.45*this.rain,this.rainMesh.position.copy(n);let h=this.rainMesh.geometry.attributes.position.array,d=this.drops;for(let m=0;m<d.length/3;m++){d[m*3+1]-=28*t,d[m*3+1]<0&&(d[m*3+1]+=25);let x=d[m*3],g=d[m*3+1],p=d[m*3+2];h[m*6]=x,h[m*6+1]=g,h[m*6+2]=p,h[m*6+3]=x-.05,h[m*6+4]=g+.6,h[m*6+5]=p}this.rainMesh.geometry.attributes.position.needsUpdate=!0}}};var Rl=class{constructor(){this.ctx=null}unlock(){if(this.ctx){this.ctx.resume?.();return}let t=this.ctx=new AudioContext,e=this.out=t.createGain();e.gain.value=.7,e.connect(t.destination);let n=(l,c)=>{let u=t.createOscillator();return u.type=l,u.frequency.value=c,u.start(),u};this.engine={o:n("sawtooth",50),o2:n("square",25),g:t.createGain(),f:t.createBiquadFilter()},this.engine.f.type="lowpass",this.engine.f.frequency.value=400,this.engine.g.gain.value=0,this.engine.o.connect(this.engine.f),this.engine.o2.connect(this.engine.f),this.engine.f.connect(this.engine.g),this.engine.g.connect(e),this.ev={o:n("sine",200),g:t.createGain()},this.ev.g.gain.value=0,this.ev.o.connect(this.ev.g),this.ev.g.connect(e),this.horn=t.createGain(),this.horn.gain.value=0,this.horn.connect(e);for(let l of[400,500])n("sawtooth",l).connect(this.horn);let s=t.createBuffer(1,t.sampleRate*2,t.sampleRate),r=s.getChannelData(0);for(let l=0;l<r.length;l++)r[l]=Math.random()*2-1;let a=t.createBufferSource();a.buffer=s,a.loop=!0,a.start();let o=t.createBiquadFilter();o.type="bandpass",o.frequency.value=3e3,this.rain=t.createGain(),this.rain.gain.value=0,a.connect(o),o.connect(this.rain),this.rain.connect(e),this.noise=s}update({speed:t,throttle:e,electric:n,rain:s,horn:r,paused:a}){let o=this.ctx;if(!o)return;let l=o.currentTime,c=Math.abs(t),u=a?0:1,f=28+c*3.2+e*12;this.engine.o.frequency.setTargetAtTime(f,l,.08),this.engine.o2.frequency.setTargetAtTime(f/2,l,.08),this.engine.f.frequency.setTargetAtTime(250+e*500+c*20,l,.1),this.engine.g.gain.setTargetAtTime(n?0:u*(.07+e*.07),l,.1),this.ev.o.frequency.setTargetAtTime(180+c*38,l,.1),this.ev.g.gain.setTargetAtTime(n?u*Math.min(.05,.004+c*.002):0,l,.1),this.horn.gain.setTargetAtTime(r?.08:0,l,.02),this.rain.gain.setTargetAtTime(u*s*.12,l,.5)}beep(t,e=.1,n="sine",s=.15){let r=this.ctx;if(!r)return;let a=r.createOscillator(),o=r.createGain();a.type=n,a.frequency.value=t,o.gain.setValueAtTime(s,r.currentTime),o.gain.exponentialRampToValueAtTime(1e-4,r.currentTime+e),a.connect(o),o.connect(this.out),a.start(),a.stop(r.currentTime+e)}ticket(){this.beep(1200,.08),setTimeout(()=>this.beep(1600,.12),80)}doors(){this.beep(300,.25,"square",.06)}tick(){this.beep(1800,.02,"square",.04)}chime(){this.beep(880,.2),setTimeout(()=>this.beep(1175,.3),180)}thud(){let t=this.ctx;if(!t)return;let e=t.createBufferSource(),n=t.createGain(),s=t.createBiquadFilter();e.buffer=this.noise,s.type="lowpass",s.frequency.value=400,n.gain.setValueAtTime(.5,t.currentTime),n.gain.exponentialRampToValueAtTime(1e-4,t.currentTime+.4),e.connect(s),s.connect(n),n.connect(this.out),e.start(),e.stop(t.currentTime+.4)}};var of=["Vue externe","Cabine conducteur","Int\xE9rieur passagers"],N_=i=>Math.atan2(Math.sin(i),Math.cos(i)),Cl=class{constructor(t){this.camera=t,this.view=0,this.follow=0}get name(){return of[this.view]}get cabin(){return this.view===1}get inside(){return this.view>0}toggle(){this.view=(this.view+1)%of.length,this.camera.fov=this.inside?70:60,this.camera.updateProjectionMatrix()}update(t,e){let n=e.phys,s=e.model;if(this.inside){s.root.updateMatrixWorld(!0);let o=this.view===1?s.eye:s.eyeInt;o.getWorldPosition(this.camera.position),o.getWorldQuaternion(this.camera.quaternion),this.follow=n.heading;return}this.follow+=N_(n.heading-this.follow)*(1-Math.exp(-3*t));let r=s.length,a=r*.8+8;this.camera.position.set(n.x-Math.sin(this.follow)*a,4+r*.2+(e.stats.height>4?1.5:0),n.z-Math.cos(this.follow)*a),this.camera.lookAt(n.x+Math.sin(n.heading)*r*.3,1.8,n.z+Math.cos(n.heading)*r*.3)}};var qr=new Set,gh=new Set,U_=new Set([" ","arrowup","arrowdown","arrowleft","arrowright","tab"]);addEventListener("keydown",i=>{let t=i.key.toLowerCase();qr.has(t)||gh.add(t),qr.add(t),U_.has(t)&&i.preventDefault()});addEventListener("keyup",i=>qr.delete(i.key.toLowerCase()));addEventListener("blur",()=>qr.clear());var lf=[],F_=i=>Math.abs(i)<.12?0:i;function cf(){let i=(navigator.getGamepads?.()??[]).find(Boolean),t=a=>!!i?.buttons[a]?.pressed,e=a=>t(a)&&!lf[a],n=(...a)=>a.some(o=>qr.has(o)),s=(...a)=>a.some(o=>gh.has(o)),r={throttle:Math.max(n("z","arrowup")?1:0,i?.buttons[7]?.value??0),brake:Math.max(n("s","arrowdown")?1:0,i?.buttons[6]?.value??0),steer:(n("q","arrowleft")?1:0)-(n("d","arrowright")?1:0)||-F_(i?.axes[0]??0),handbrake:n(" ")||t(0),horn:n("h")||t(1),toggleView:s("c","v")||e(3),toggleLights:s("l")||e(2),toggleHelp:s("i"),indicatorLeft:s("a")||e(4),indicatorRight:s("e")||e(5),doors:s("o")||e(14),ramp:s("r")||e(15),skip:s("n"),map:s("m")||e(12),menu:s("tab","escape")||e(9)};return lf=i?i.buttons.map(a=>a.pressed):[],gh.clear(),r}var Gn=.5,Cs=520,Yr=1040*Gn,O_={gare:"#2d3a55",centre:"#3b3442",commerce:"#403b2a",peripherie:"#223426"},Zr=Math.PI*2,xh=Object.assign(document.createElement("canvas"),{width:Yr,height:Yr});{let i=xh.getContext("2d");i.fillStyle="#16301f",i.fillRect(0,0,Yr,Yr);let t=e=>(e+Cs)*Gn;for(let e=0;e<9;e++)for(let n=0;n<9;n++){i.fillStyle=O_[Ts(e,n)];let s=88*Gn;i.fillRect(t((e-4)*100)-s/2,t((n-4)*100)-s/2,s,s)}i.strokeStyle="#8590a0",i.lineWidth=12*Gn,i.lineCap="butt";for(let e=0;e<10;e++)i.beginPath(),i.moveTo(t(Oe(0)-20),t(Oe(e))),i.lineTo(t(Oe(9)+20),t(Oe(e))),i.stroke(),i.beginPath(),i.moveTo(t(Oe(e)),t(Oe(0)-20)),i.lineTo(t(Oe(e)),t(Oe(9)+20)),i.stroke();i.fillStyle="#4d7f3f";for(let e of Ze)e.type==="round"&&(i.beginPath(),i.arc(t(e.x),t(e.z),5.5*Gn,0,Zr),i.fill())}function hf(i,t,e,n){let s=o=>(o+Cs)*Gn;i.lineJoin="round";for(let o of n)i.strokeStyle=o.color,i.globalAlpha=o===t.service.line?1:.55,i.lineWidth=3/e,i.beginPath(),o.path.forEach((l,c)=>c?i.lineTo(s(l.x),s(l.z)):i.moveTo(s(l.x),s(l.z))),i.closePath(),i.stroke();i.globalAlpha=1;let r=t.service.line,a=1+.25*Math.sin(t.time*6);for(let o of n)for(let l of o.stops){let c=r===o&&t.service.stopIdx===l.k;i.fillStyle=c?"#fff":o.color,i.strokeStyle="#000",i.lineWidth=1/e,i.beginPath(),i.arc(s(l.x),s(l.z),(c?6*a:3.2)/e,0,Zr),i.fill(),i.stroke()}i.fillStyle="#1fe0b0";for(let o of ws)i.beginPath(),i.arc(s(o.x),s(o.z),3/e,0,Zr),i.fill();i.strokeStyle="#ff3b30",i.lineWidth=4/e;for(let o of t.events.closed)i.beginPath(),i.moveTo(s(o.ax),s(o.az)),i.lineTo(s(o.bx),s(o.bz)),i.stroke()}function uf(i,t){let e=i.getContext("2d"),n=i.width/2,s=t.vehicle.phys,r=1.4;e.clearRect(0,0,i.width,i.width),e.save(),e.beginPath(),e.arc(n,n,n-2,0,Zr),e.clip(),e.fillStyle="#0d1219",e.fillRect(0,0,i.width,i.width),e.translate(n,n),e.rotate(s.heading-Math.PI),e.scale(r,r),e.translate(-(s.x+Cs)*Gn,-(s.z+Cs)*Gn),e.drawImage(xh,0,0),hf(e,t,r,t.service.line?[t.service.line]:[]),e.restore(),e.fillStyle="#fff",e.strokeStyle="#000",e.lineWidth=2,e.beginPath(),e.moveTo(n,n-9),e.lineTo(n+6,n+7),e.lineTo(n-6,n+7),e.closePath(),e.fill(),e.stroke(),e.strokeStyle="#ffffff55",e.lineWidth=3,e.beginPath(),e.arc(n,n,n-2,0,Zr),e.stroke()}function df(i,t){let e=i.getContext("2d"),n=i.width/Yr,s=t.vehicle.phys;e.clearRect(0,0,i.width,i.height),e.save(),e.scale(n,n),e.drawImage(xh,0,0),hf(e,t,n,Cn.filter(r=>t.economy.ownsLine(r.id)||r===t.service.line)),e.translate((s.x+Cs)*Gn,(s.z+Cs)*Gn),e.rotate(Math.atan2(Math.cos(s.heading),Math.sin(s.heading))),e.fillStyle="#fff",e.strokeStyle="#000",e.lineWidth=1.5,e.beginPath(),e.moveTo(9,0),e.lineTo(-6,5),e.lineTo(-6,-5),e.closePath(),e.fill(),e.stroke(),e.restore()}var B_=i=>document.getElementById(i),Yt=Object.fromEntries(["clock","weather","money","level","xpbar","nsName","nsDist","nsDelta","arrow","nextstop","prompt","pax","sat","satbar","enbar","enlabel","limit","kmh","gear","hb","lights","indL","indR","view","help","dial","toasts","event","minimap","mapfull","maparea","door","ramp"].map(i=>[i,B_(i)])),Ee=Yt.dial.getContext("2d");function z_(i){let e=Math.PI*.8,n=Math.PI*2.2,s=120,r=130,a=100;Ee.clearRect(0,0,240,240),Ee.fillStyle="#0b0d11e6",Ee.beginPath(),Ee.arc(s,r,a+12,0,7),Ee.fill(),Ee.strokeStyle="#cfd6df",Ee.fillStyle="#cfd6df",Ee.font="12px system-ui",Ee.textAlign="center";for(let l=0;l<=100;l+=10){let c=e+l/100*(n-e),u=Math.cos(c),f=Math.sin(c);Ee.lineWidth=2,Ee.beginPath(),Ee.moveTo(s+u*(a-10),r+f*(a-10)),Ee.lineTo(s+u*a,r+f*a),Ee.stroke(),Ee.fillText(l,s+u*(a-24),r+f*(a-24)+4)}let o=e+Math.min(Math.abs(i),100)/100*(n-e);Ee.strokeStyle="#ff5a3c",Ee.lineWidth=3,Ee.beginPath(),Ee.moveTo(s,r),Ee.lineTo(s+Math.cos(o)*(a-14),r+Math.sin(o)*(a-14)),Ee.stroke(),Ee.fillStyle="#fff",Ee.font="bold 22px system-ui",Ee.fillText(Math.round(Math.abs(i)),s,r+50)}var Il=class{constructor(t){this.g=t,this.mapOpen=!1,this.frame=0}toggleHelp(){Yt.help.classList.toggle("hidden")}toggleMap(){this.mapOpen=!this.mapOpen,Yt.maparea.style.display=this.mapOpen?"flex":"none"}toast(t,e="info"){let n=document.createElement("div");for(n.className=`toast ${e}`,n.textContent=t,Yt.toasts.appendChild(n);Yt.toasts.children.length>5;)Yt.toasts.firstChild.remove();setTimeout(()=>n.classList.add("out"),5200),setTimeout(()=>n.remove(),5800)}update(t){let e=this.g,n=e.vehicle,s=n.phys,r=e.service,a=e.economy,o=s.speed*3.6;Yt.kmh.textContent=Math.round(Math.abs(o)),Yt.gear.textContent=s.speed>.3?"D":s.speed<-.3?"R":"N",Yt.hb.classList.toggle("off",!t.handbrake),Yt.lights.classList.toggle("off",!n.lights),Yt.indL.classList.toggle("off",t.indicator<=0),Yt.indR.classList.toggle("off",t.indicator>=0),Yt.door.classList.toggle("off",!r.doorsOpen),Yt.ramp.classList.toggle("off",!r.rampOn),Yt.view.textContent=e.rig.name,Yt.dial.style.display="none",e.rig.cabin&&z_(o),Yt.clock.textContent=e.env.clock,Yt.weather.textContent=af[e.env.weather],Yt.money.textContent=`${Math.round(a.d.money).toLocaleString("fr-FR")} \u20AC`,Yt.money.classList.toggle("neg",a.d.money<0),Yt.level.textContent=`Niveau ${a.level}`,Yt.xpbar.style.width=`${Math.round(a.xpProgress()*100)}%`,Yt.pax.textContent=`${r.onboard} / ${r.capacity}`,Yt.sat.textContent=`${Math.round(r.satisfaction)}%`,Yt.satbar.style.width=`${r.satisfaction}%`,Yt.satbar.style.background=r.satisfaction>60?"#3ddc84":r.satisfaction>30?"#ffb000":"#ff453a",Yt.enbar.style.width=`${n.energy*100}%`,Yt.enbar.style.background=n.energy>.2?"#4aa3ff":"#ff453a",Yt.enlabel.textContent=n.stats.electric?"\u26A1 Batterie":"\u26FD Carburant",Yt.limit.textContent=e.rules.limit,Yt.event.textContent=e.events.label,Yt.event.style.display=e.events.label?"block":"none";let l=r.stop;if(Yt.nextstop.style.display=r.active?"flex":"none",r.active){let c=s.refPoint(),u=l.x-c.x,f=l.z-c.z;Yt.nsName.textContent=`${r.stopIdx+1}/${r.line.stops.length} \xB7 ${l.name}`,Yt.nsDist.textContent=`${Math.round(Math.hypot(u,f))} m`;let h=Math.round(r.delay);Yt.nsDelta.textContent=h>20?`+${h} s de retard`:h<-20?`${-h} s d'avance`:"\xE0 l'heure",Yt.nsDelta.className=h>60?"bad":h>20?"warn":"ok";let d=Math.atan2(u,f)-s.heading;d=Math.atan2(Math.sin(d),Math.cos(d)),Yt.arrow.style.transform=`rotate(${-d}rad)`}Yt.prompt.textContent=t.prompt||r.promptText,Yt.prompt.style.opacity=Yt.prompt.textContent?1:0,(this.frame++&1)===0&&uf(Yt.minimap,e),this.mapOpen&&df(Yt.mapfull,e)}};var $r=i=>`${Math.round(i).toLocaleString("fr-FR")} \u20AC`,Pl=class{constructor(t){this.g=t,this.open=!1,this.tab="service",this.root=document.getElementById("menu"),this.root.addEventListener("click",e=>{let n=e.target.closest("[data-act]");n&&this.act(n.dataset.act)})}toggle(t){this.open=t??!this.open,this.root.style.display=this.open?"flex":"none",this.open&&this.render()}act(t){let e=this.g,n=e.economy,[s,r]=t.split(":"),a=null;if(s==="tab")this.tab=r;else{if(s==="close")return this.toggle(!1);if(s==="line"){e.service.start(r),this.toggle(!1);return}else if(s==="stop")e.service.end();else if(s==="buyline")a=n.buyLine(r);else if(s==="buybus")a=n.buyBus(r);else if(s==="usebus"){e.switchBus(r),this.toggle(!1);return}else if(s==="reset"&&confirm("Effacer la sauvegarde ?")){n.reset(),location.reload();return}}a&&e.toast(a,"warn"),this.render()}render(){let t=this.g,e=t.economy,n=e.d,s=t.service,r=[["service","Service"],["garage","Garage"],["carriere","Carri\xE8re"]],a="";this.tab==="service"?a=Cn.map(o=>{let l=e.ownsLine(o.id),c=e.level<o.level,u=s.line===o?'<button data-act="stop">Arr\xEAter</button>':l?`<button class="go" data-act="line:${o.id}">D\xE9marrer</button>`:c?`<button disabled>Niveau ${o.level}</button>`:`<button data-act="buyline:${o.id}">Acheter ${$r(o.price)}</button>`;return`<div class="card"><i class="dot" style="background:${o.color}"></i><div class="grow"><b>${o.name}</b>
          <small>${o.stops.length} arr\xEAts \xB7 ${(o.path.length*100/1e3).toFixed(1)} km \xB7 course \u2248 ${Math.round(o.lapTime/60)} min</small></div>${u}</div>`}).join("")+`<p class="hint">Conduisez jusqu'\xE0 l'arr\xEAt, alignez-vous le long du trottoir, ouvrez les portes (O). Le d\xE9p\xF4t est au sud-ouest du centre. La carte : M.</p>`:this.tab==="garage"?a=Id.map(o=>{let l=Es[o],c=e.ownsBus(o),u=e.level<l.level,h=t.vehicle.id===o?"<button disabled>En service</button>":c?`<button class="go" data-act="usebus:${o}">Utiliser</button>`:u?`<button disabled>Niveau ${l.level}</button>`:`<button data-act="buybus:${o}">Acheter ${$r(l.price)}</button>`,d=l.electric?`autonomie ${l.range} km`:`${l.consumption} L/100 km`;return`<div class="card"><i class="dot" style="background:${l.color}"></i><div class="grow"><b>${l.name}</b>
          <small>${l.seats} places \xB7 ${l.length} m \xB7 ${l.power} kW \xB7 rayon ${l.turnRadius} m \xB7 ${d} \xB7 ${l.doors} porte${l.doors>1?"s":""}</small></div>${h}</div>`}).join("")+'<p class="hint">Changer de bus vous ram\xE8ne au d\xE9p\xF4t et arr\xEAte le service en cours.</p>':a=`<div class="stats"><div><b>${e.level}</b><small>Niveau</small></div><div><b>${n.xp}</b><small>XP${e.maxLevel?"":` / ${Rs[e.level]}`}</small></div>
        <div><b>${$r(n.money)}</b><small>Argent</small></div><div><b>${n.runs}</b><small>Courses</small></div><div><b>${n.stopsDone}</b><small>Arr\xEAts</small></div>
        <div><b>${n.pax}</b><small>Voyageurs</small></div><div><b>${n.fines}</b><small>Amendes</small></div><div><b>${$r(n.finesTotal)}</b><small>Total amendes</small></div></div>
        <p class="hint">Niveau 2 : p\xE9riph\xE9rie, bus \xE9lectrique \xB7 Niveau 3 : zone commerciale, double \xE9tage \xB7 Niveau 4 : grande ceinture, bus articul\xE9.</p>
        <button class="danger" data-act="reset">Effacer la sauvegarde</button>`,this.root.innerHTML=`<div class="panel"><div class="head"><h1>Bus City Simulator</h1><span>${$r(n.money)} \xB7 Niveau ${e.level}</span>
      <button data-act="close">\u2715</button></div><div class="tabs">${r.map(([o,l])=>`<button class="${this.tab===o?"on":""}" data-act="tab:${o}">${l}</button>`).join("")}</div>
      <div class="body">${a}</div><div class="foot">Tab / \xC9chap : menu \xB7 C vue \xB7 O portes \xB7 R rampe PMR \xB7 N sauter l'arr\xEAt \xB7 M carte \xB7 I aide</div></div>`}};Cd({WebGLRenderer:Fr});var _h=1/120,vh=class{constructor(){let t=document.getElementById("scene");this.renderer=new Fr({canvas:t,antialias:!0}),this.renderer.setPixelRatio(Math.min(devicePixelRatio,2)),this.renderer.shadowMap.enabled=!0,this.scene=new $s,this.camera=new He(60,1,.1,1500),this.time=0,this.acc=0,this.paused=!1,this.saveT=0,this.ctl={indicator:0,braking:!1,handbrake:!1,time:0,prompt:""},this.economy=new bl,this.audio=new Rl,this.city=new pl(this.scene,this.renderer),this.env=new Al(this.scene,this.city,this.economy.d.hours),this.lights=new gl(this.scene),this.traffic=new _l(this.scene),this.peds=new yl(this.scene),this.crowd=new Sl(this.scene),this.rig=new Cl(this.camera),this.vehicle=null,this.busCircles=[],this.busInfo={x:0,z:0,circles:[],nodes:[]},this.switchBus(this.economy.d.bus,!1),this.service=new Tl(this),this.rules=new El(this),this.events=new wl(this),this.hud=new Il(this),this.menu=new Pl(this),this.economy.onLevel=e=>{this.toast(`Niveau ${e} atteint ! Nouveaux quartiers et v\xE9hicules d\xE9bloqu\xE9s`,"ok"),this.audio.chime(),this.economy.save()},this.markers(),this.traffic.init(this.vehicle.phys),addEventListener("resize",()=>this.resize()),addEventListener("pointerdown",()=>this.audio.unlock()),addEventListener("keydown",()=>this.audio.unlock()),addEventListener("beforeunload",()=>this.save()),this.resize(),this.menu.toggle(!0),this.last=performance.now(),this.renderer.setAnimationLoop(e=>{let n=Math.min((e-this.last)/1e3,.1);this.last=e,this.step(n)})}resize(){this.renderer.setSize(innerWidth,innerHeight,!1),this.camera.aspect=innerWidth/innerHeight,this.camera.updateProjectionMatrix()}toast(t,e){this.hud?.toast(t,e)}fine(t,e,n){let s=this.economy;s.addMoney(-t),s.d.fines++,s.d.finesTotal+=t,n&&this.service.sat(-n),this.toast(`Amende ${t} \u20AC : ${e}`,"bad")}switchBus(t,e=!0){let n=this.economy;this.vehicle&&(n.d.energy[this.vehicle.id]=this.vehicle.energy,this.vehicle.dispose(),this.service?.end()),this.vehicle=new ul(t,this.scene,n.d.energy[t]??1),this.vehicle.place(Ui.x,Ui.z,Ui.heading),n.d.bus=t,this.service&&(this.service.onboard=0,this.service.doorsOpen=!1,this.service.satisfaction=100),this.rig.update(1,this.vehicle),e&&(n.save(),this.toast(`${this.vehicle.stats.name} pr\xEAt au d\xE9p\xF4t`,"ok"))}save(){let t=this.economy;t.d.hours=this.env.hours,t.d.energy[this.vehicle.id]=this.vehicle.energy,t.save()}markers(){let t=new Ut(new ce(1.1,1.1,14,16,1,!0),new we({color:"#7fd1ff",transparent:!0,opacity:.25,side:Qe,depthWrite:!1})),e=new Ut(new De(16,3.4).rotateX(-Math.PI/2),new we({color:"#3ddc84",transparent:!0,opacity:.35,depthWrite:!1}));t.visible=e.visible=!1,this.scene.add(t,e),this.marker={beam:t,zone:e}}updateMarkers(){let t=this.service,{beam:e,zone:n}=this.marker;if(e.visible=n.visible=t.active,!t.active)return;let s=t.stop;e.position.set(s.shelter.x,7,s.shelter.z),n.position.set(s.x,.06,s.z),n.rotation.y=s.axis==="x"?0:Math.PI/2,n.material.color.set(t.inZone().ok?"#3ddc84":"#ffb000"),e.material.opacity=.18+.1*Math.sin(this.time*4)}collide(){let t=this.vehicle.phys,e=this.city.col,n=t.collisionPoints(),s=0,r=0,a=0;for(let o of n){let l=e.resolve(o.x+s,o.z+r,o.r);if(!l.hit)continue;s+=l.px,r+=l.pz;let c=Math.hypot(l.px,l.pz)||1,u=l.px/c,f=l.pz/c,h=t.vx*u+t.vz*f;h<0&&(a=Math.max(a,-h),t.vx-=h*u*1.3,t.vz-=h*f*1.3)}for(let o of this.traffic.cars)if(!(!o.active||Math.abs(o.x-t.x)>30||Math.abs(o.z-t.z)>30))for(let l of n){let c=l.x+s-o.x,u=l.z+r-o.z,f=Math.hypot(c,u),h=l.r+1.7;if(f>=h)continue;let d=c/(f||1),m=u/(f||1),x=t.vx*d+t.vz*m;s+=d*(h-f),r+=m*(h-f),x<0&&(a=Math.max(a,-x),t.vx-=x*d*1.3,t.vz-=x*m*1.3),o.v=0}(s||r)&&(t.x+=s,t.z+=r,t.speed=t.vx*Math.sin(t.heading)+t.vz*Math.cos(t.heading),a>0&&this.rules.collision(a)),this.busCircles=n.map(o=>({x:o.x+s,z:o.z+r,r:o.r}))}busNodes(){let t=[],e=new Set;for(let n of this.busCircles){let s=Math.round(n.x/100+4.5),r=Math.round(n.z/100+4.5);if(s<0||r<0||s>9||r>9)continue;let a=s*10+r,o=Ze[a];if(e.has(a)||Math.abs(n.x-o.x)>8||Math.abs(n.z-o.z)>8)continue;e.add(a);let l=this.vehicle.phys,c=Math.sin(l.heading),u=Math.cos(l.heading);t.push({idx:a,k:Math.abs(c)>Math.abs(u)?c>0?0:2:u>0?1:3})}return t}step(t){let e=cf();e.menu&&this.menu.toggle(),e.map&&this.hud.toggleMap(),e.toggleHelp&&this.hud.toggleHelp(),this.paused=this.menu.open;let n=this.vehicle,s=n.phys,r=this.ctl;if(this.paused){this.audio.update({speed:0,throttle:0,electric:!1,rain:0,horn:!1,paused:!0}),this.rig.update(t,n),this.renderer.render(this.scene,this.camera);return}for(this.time+=t,r.time+=t,e.toggleView&&this.rig.toggle(),e.toggleLights&&(n.lights=!n.lights,n.model.setLights(n.lights)),e.indicatorLeft&&(r.indicator=r.indicator>0?0:1),e.indicatorRight&&(r.indicator=r.indicator<0?0:-1),r.indicator&&Math.abs(s.steer)>.12&&Math.sign(s.steer)===r.indicator&&(r.armed=!0),r.armed&&Math.abs(s.steer)<.03&&(r.indicator=0,r.armed=!1),e.doors&&this.service.toggleDoors(),e.ramp&&this.service.toggleRamp(),e.skip&&this.service.skipStop(),Math.floor(r.time*3)%2===0!==r.blink&&(r.blink=!r.blink,r.indicator&&r.blink&&this.audio.tick()),s.grip=this.env.grip,s.canDrive=n.energy>0&&this.events.current?.type!=="breakdown",this.acc+=t;this.acc>=_h;this.acc-=_h)s.update(_h,e);this.collide(),n.burn(t),this.energyLogic(t),r.handbrake=e.handbrake,r.braking=e.brake>0&&s.speed>.5||e.handbrake,n.model.update(s,t,r),this.rig.update(t,n),this.env.update(t,s,this.camera.position),this.lights.update(this.time),this.busInfo={x:s.x,z:s.z,circles:this.busCircles,nodes:this.busNodes()},this.peds.update(t,this.time,s),this.traffic.update(t,{t:this.time,bus:this.busInfo,peds:this.peds.crossing}),this.rules.update(t),this.service.update(t),this.events.update(t),this.updateMarkers(),r.prompt=this.chargePrompt??"",this.hud.update(r),this.audio.update({speed:s.speed,throttle:s.thr,electric:!!n.stats.electric,rain:this.env.rain,horn:e.horn}),this.saveT+=t,this.saveT>15&&(this.saveT=0,this.save()),this.renderer.render(this.scene,this.camera)}energyLogic(t){let e=this.vehicle,n=e.phys,s=n.refPoint(),r=this.economy;this.chargePrompt="";let a=ws.find(o=>Math.hypot(o.x-s.x,o.z-s.z)<7);if(a&&Math.abs(n.speed)<.6&&e.energy<1){let o=.05*t;e.energy=Math.min(1,e.energy+o),r.addMoney(-o*(e.stats.electric?50:120)),this.chargePrompt=e.stats.electric?"\u26A1 Recharge en cours\u2026":"\u26FD Plein en cours\u2026"}else a&&e.energy<.3&&(this.chargePrompt="Arr\xEAtez-vous pour faire le plein");e.energy<.15&&!this.lowWarned&&(this.lowWarned=!0,this.toast(e.stats.electric?"Batterie faible : rejoignez une borne \u26A1":"R\xE9servoir presque vide : rejoignez une station \u26FD","warn")),e.energy>.3&&(this.lowWarned=!1),e.energy<=0?(this.dead=(this.dead??0)+t,this.dead>25&&(this.dead=0,e.energy=.6,e.place(Ui.x,Ui.z,Ui.heading),this.fine(300,"Remorquage : panne d'\xE9nergie",0),this.service.end())):this.dead=0}};window.game=new vh;})();
/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
