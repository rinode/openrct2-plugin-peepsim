(function (exports) {
    'use strict';

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var n$d=function(r,o){return n$d=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(n,r){n.__proto__=r;}||function(n,r){for(var o in r)Object.prototype.hasOwnProperty.call(r,o)&&(n[o]=r[o]);},n$d(r,o)};function r$f(r,o){if('function'!=typeof o&&null!==o)throw new TypeError('Class extends value '+o+' is not a constructor or null');function t(){this.constructor=r;}n$d(r,o),r.prototype=null===o?Object.create(o):(t.prototype=o.prototype,new t);}'function'==typeof SuppressedError&&SuppressedError;

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function n$c(n){return void 0===n}function r$e(n){return null===n}function t$b(t){return n$c(t)||r$e(t)}function u$7(n){return Array.isArray(n)}function o$d(n){return f$8(n,'function')}function e$8(n){return f$8(n,'number')}function i$7(n){return f$8(n,'object')}function c$6(n){return f$8(n,'string')}function f$8(n,r){return typeof n===r}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var o$c='open',e$7='redraw',r$d='update',p$8=5,m$3=[4,0],a$6=[1,2],f$7=[0,0],n$b={top:f$7,right:f$7,bottom:f$7,left:f$7};function u$6(o){n$c(o.height)&&(o.height=14);}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var t$a=Math.floor(1048575*Math.random())<<10;function r$c(){return (t$a++).toString(36)}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function n$a(n,r){return n.subscribe(r)}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var t$9=function(t,i,r,o){this.Ia=t,this.Ja=i,this.Ka=r,this.La=n$a(i,o);};

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function i$6(i){if(!i||!i$7(i))return  false;var n=i;return o$d(n.get)&&o$d(n.subscribe)}function n$9(n){return !(!n||!i$7(n))&&i$6(n)&&o$d(n.set)}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function o$b(o){return !(!o||!i$7(o))&&n$9(o.twoway)}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function r$b(r){return o$b(r)?r.twoway:r}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var r$a=function(){function r(){this.Ma=[],this.za=null;}return r.prototype.add=function(i,t,n,o){this.on(i,n,(function(i,n){var r=o?o(n):n;i[t]=r;}));},r.prototype.callback=function(t,n,o,r,s){o$b(o)?t[n]=function(i,t){var n=s?s(i,t):i;o.twoway.set(n),r&&r(n);}:r&&(t[n]=s?function(i,t){return r(s(i,t))}:r);},r.prototype.twoway=function(i,t,n,o,r){this.add(i,t,o),this.callback(i,n,o,r);},r.prototype.on=function(i,r,s){var u=r$b(r);if(i$6(u)){var f=this.Aa(i,u,s);this.Ma.push(f),s(i,u.get());}else n$c(u)||s(i,u);},r.prototype.Na=function(){this.za=null;},r.prototype.Oa=function(){return this.Ma.length>0},r}();

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var t$8=function(r){function t(){return null!==r&&r.apply(this,arguments)||this}return r$f(t,r),t.prototype.ya=function(i){var n=i.ga;n&&this.Ba(n),this.za=i;},t.prototype.Aa=function(i,r,t){var o=this;return new t$9('',r,t,(function(i){var n=o.za;n&&n.ua&&t(n.ua,i);}))},t.prototype.Ba=function(i){var n=this.Ma;if(n)for(var r=0,t=n;r<t.length;r++){var o=t[r];o.Ka(i,o.Ja.get());}},t}(r$a);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function r$9(r,n){n||(n={});for(var o=0,t=r;o<t.length;o++){var a=t[o],e=a.name;e&&!(e in n)&&(n[e]=a);}return n}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function n$8(n){return u$5(n,0)}function r$8(n){return u$5(n,1)}function t$7(n){return u$5(n,2)}function u$5(n,r){return n[1]===r}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function o$a(o){throw Error(o)}function r$7(o){}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function n$7(t){if(n$c(t))return t;if(e$8(t))return [t,0];var n=t.trim(),o=n.length;if(o>1){var u=o-1,s=void 0,a=n[u];if('w'===a?s=2:'%'===a?s=1:o>2&&(u--,'x'===a&&'p'===n[u]&&(s=0)),!n$c(s))return [parseFloat(n.substring(0,u)),s]}o$a('Value \''+t+'\' is not a valid scale.');}function o$9(t,r){return n$7(t)||r}function u$4(r){return o$9(r,f$7)}function s$3(t,r,e,i){switch(t[1]){case 2:return (e?t[0]/e:1)*r*(100-i)*.01;case 1:return .01*t[0]*r;default:return t[0]}}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var e$6=['y','x'],a$5=['height','width'],u$3=['top','left'],s$2=['bottom','right'];function p$7(t,o,i){var a=o[u$3[i]],p=o[s$2[i]];return n$8(a)&&n$8(p)||o$a('Window padding must be absolute for "auto" window size.'),t[e$6[i]]+=a[0],a[0]+p[0]}function f$6(r,t,o,i){m$2(r,1,t,i),m$2(r,0,o,i);}function m$2(n,e,p,f){var m=a$5[e],g=f[u$3[e]],d=f[s$2[e]],v=n[m]-l$4(p,g,d,n$8),h=l$4(p,g,d,r$8),w=l$4(p,g,d,t$7),b=s$3(p,v,w,h);return n[m]=b,c$5(n,e,f,v,w,h)}function c$5(r,t,o,n,p,f){return function(r,t,o,n,e,a,u,s,p){var f=s$3(t[s],o,n,e),m=s$3(t[p],o,n,e);return r[a]+=f,f+r[u]+m}(r,o,n,p,f,e$6[t],a$5[t],u$3[t],s$2[t])}function l$4(r,t,o,i){var n=0;return i(r)&&(n+=r[0]),i(t)&&(n+=t[0]),i(o)&&(n+=o[0]),n}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var a$4='inherit',s$1='auto',u$2=['minHeight','minWidth'],f$5=['maxHeight','maxWidth'];function p$6(i,t,r,e){return r!=a$4?i$7(r)?r.value:r:l$3(i,t,e)}function l$3(i,t,r){if(c$6(r))return s$1;var e=r,o=e.value||r;return g(i,t,o,e.min||o,e.max||o),o}function d$1(n,m,a,s,u){var f=a$5[m],p=s[u$3[m]],l=s[s$2[m]],d=a[f]+p[0]+l[0]+u;return n$8(p)&&n$8(l)||o$a('Padding for '+f+' must be absolute for auto window resize.'),g(n,m,d,d,d),d}function g(i,t,e,o,n){i[a$5[t]]=e,i[u$2[t]]=o,i[f$5[t]]=n;}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var o$8=15,u$1=function(){function o(s){var n=this,h=s.width,o=s.height,u=s.position,f=new t$8,e={classification:'fui-'+r$c(),title:'',colours:s.colours,onUpdate:function(){n.ha(),n.c((function(i){return i.update()}));},onClose:function(){n.m();}},c=l$3(e,1,h),l=l$3(e,0,o);this.qa(c,l),f.add(e,'title',s.title),this.ea=f.Oa()?f:null,this.fa=u,this.ga=e;}return o.prototype.ha=function(){var i=this.ua,t=this.t,s=this.w;if(i&&t){if(!(4&s)){var n=i.width,h=i.height,r=2&s||this.ra==n,o=1&s||this.sa==h;if(r&&o)return;this.ra=n,this.sa=h;}this.d(i,t),this.w&=-5;}},o.prototype.ma=function(i,t){return {x:0,y:t,width:2&i?s$1:this.ra,height:1&i?s$1:this.sa-t}},o.prototype.na=function(i,t,s,n){var r=this.w;2&r&&(this.ra=d$1(i,1,t,n,0)),1&r&&(this.sa=d$1(i,0,t,n,s));},o.prototype.qa=function(i,t){var s=this.w;i==s$1?s|=2:(s&=-3,this.ra=i),t==s$1?s|=1:(s&=-2,this.sa=t),this.w=s;},o.prototype.l=function(i,t){this.d(i,this.a),function(i,t){t&&'default'!==t&&('center'===t?(i.x=ui.width/2-i.width/2,i.y=ui.height/2-i.height/2):(i.x=t.x,i.y=t.y));}(i,this.fa),t&&t.ya(this);var n=ui.openWindow(i),h=r$9(n.widgets);this.ua=n,this.t=h,this.c((function(i){return i.open(n,h)}));},o.prototype.m=function(){this.c((function(i){return i.close()}));var i=this.ea;i&&i.Na(),this.ua=null,this.t=null;},o.prototype.open=function(){if(this.ua)this.focus();else {var i=this.ga,t=this.ea;this.l(i,t);}},o.prototype.close=function(){this.ua&&this.ua.close();},o.prototype.focus=function(){this.ua&&this.ua.bringToFront();},o.prototype.redraw=function(){this.w|=4;},o}();

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var t$6=function(t,i){this.position=t.parse(i),this.xa=t;};

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function f$4(r){return (c$4(r.width)?1:0)|(c$4(r.height)?2:0)}function c$4(r){return n$c(r)||r===s$1}function m$1(r,n,t){return a$3(r,n,(function(r){return function(r,n){var t=r[a$5[n]],u=r.padding,f=u[u$3[n]],c=u[s$2[n]];return s(t,f,c)?t[0]+f[0]+c[0]:null}(t,r)}))}function p$5(n,t,u,f,c){return a$3(n,t,(function(n){return function(n,t,u,f){var c,m,p=u===f,a=0;if(p&&!n$8(t))return null;for(var l=a$5[f],v=u$3[f],d=s$2[f],j=-1,w=0,g=n;w<g.length;w++){var H=g[w],x=H.position,y=x[l],S=x.padding,b=S[v],h=S[d];if(!s(y,b,h))return null;H.skip||(c=a,m=y[0]+b[0]+h[0],a=p?c+m:c<m?m:c,j++);}return p&&(a+=t[0]*j),a}(u,f,c,n)}))}function a$3(r,n,t){return !!(3&n&&l$2(r,1&n,1,t)|l$2(r,2&n,0,t))}function l$2(n,u,o,e){var f;if(u&&!r$e(f=e(o))){var c=a$5[o],m=n[c];if(m[0]!==f||!n$8(m))return n[c]=[f,0],1}return 0}function s(n,t,u){return n$8(n)&&n$8(t)&&n$8(u)}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function f$3(r,e,a,f,d){var v=r.length;if(v)for(var u=1==a?0:1,_=function(r,e,a,i){var t=r.length,n={S:Array(t),H:0,T:0,D:0};l$1(e,n,t-1);for(var s=0;s<t;s++){var f=r[s],d=f.padding,v={R:f[a$5[a]],rr:f[a$5[i]],h:d};n.S[s]=v;var u=v.R,_=v.h[u$3[a]],c=v.h[s$2[a]];l$1(u,n,1),l$1(_,n,1),l$1(c,n,1);}return n}(r,f,a,u),c=e[a$5[a]]-_.H,g=_.D,S=_.T,j=s$3(f,c,g,S),q=0,h=0;h<v;h++){var x=_.S[h],z=q+e[e$6[a]],P=s$3(x.R,c,g,S),y=x.h,A={};A[e$6[a]]=z,A[a$5[a]]=P,A[e$6[u]]=e[e$6[u]],A[a$5[u]]=e[a$5[u]],q+=c$5(A,a,y,c,g,S),m$2(A,u,x.rr,y),d(h,A),q+=j;}}function l$1(i,o,t){var n=i[0]*t;t$7(i)?o.D+=n:n$8(i)?o.H+=n:r$8(i)&&(o.T+=n);}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function f$2(l,f){var u;if(f||(f=n$b),n$c(l))u=l;else if(u$7(l)){var g=l.length;if(2===g){var c=u$4(l[0]),d=u$4(l[1]);u=p$4(c,d,c,d);}else 4===g?u=p$4(u$4(l[0]),u$4(l[1]),u$4(l[2]),u$4(l[3])):o$a('Padding array of unknown length: '+g+'. Only lengths of 2 or 4 are supported.');}else if(i$7(l))u=p$4(a$2(u$3[0],l,f),a$2(s$2[1],l,f),a$2(s$2[0],l,f),a$2(u$3[1],l,f));else {var j=u$4(l);u=p$4(j,j,j,j);}return u||f}function a$2(e,r,t){var o=r[e];return o$9(n$c(o)?r.rest:o,t[e])}function p$4(e,r,t,o){return {top:e,right:r,bottom:t,left:o}}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function t$5(t,n){return {width:o$9(t.width,a$6),height:o$9(t.height,a$6),padding:f$2(t.padding,n)}}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function c$3(t){return t.direction=1,l(t)}function p$3(t){return t.direction=0,l(t)}function l(t){return function(r,i){return new h(r,i,t)}}var h=function(o){function c(t,s,f){var c=o.call(this,t,f)||this;c.parse=t$5,c.L=f.direction||0,c.M=n$7(f.spacing)||m$3;for(var p=f$4(f),l=u$7(f)?f:f.content,h=l.length,j=Array(h),v=0;v<h;v++){var b=l[v];j[v]=b(c,s);}return c.w=4|p,c.v=j,s.on(e$7,(function(){var t=c.w;if(4&t){c.w&=-5;var r=c.v,i=r.filter((function(t){return !t.skip}));p$5(c.position,t,r,c.M,c.L),c.N=i,c.O=i.map((function(t){return t.position}));}})),c}return r$f(c,o),c.prototype.recalculate=function(){this.w|=4,3&this.w&&this.xa.recalculate();},c.prototype.layout=function(t,r){var i=this;r$7(!!this.N),f$3(this.O,r,this.L,this.M,(function(r,o){i.N[r].layout(t,o);}));},c}(t$6);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var o$7=function(t){function o(){return null!==t&&t.apply(this,arguments)||this}return r$f(o,t),o.prototype.ya=function(i){var r=i.Fa;r&&this.Ba(r),this.za=i;},o.prototype.Aa=function(i,t,o){var s=this,e=i.name||(i.name=r$c());return new t$9(e,t,o,(function(i){var r=s.za;if(r&&r.isOpen()){var n=r.getWidget(e);n&&o(n,i);}}))},o.prototype.Ba=function(i){var r=this.Ma;if(r)for(var n=0,t=r;n<t.length;n++){var o=t[n];o.Ka(i[o.Ia],o.Ja.get());}},o}(r$a);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function o$6(o,r){for(var f=0,n=o.length;f<n;f++)o[f](r);}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var f$1=function(){function i(t,i,s,n,o,r,h){this.width=t,this.height=i,this.xa=s,this.l=n,this.Ca=o,this.Da=r,this.m=h,this.recalculate=this.redraw;}return i.prototype.layout=function(t,i){o$6(this.Da,this);var s=this.j,n=s.position,o=p$2(t,this.width,n,1),r=p$2(t,this.height,n,0);return s.layout(i,t),{width:o,height:r}},i.prototype.redraw=function(){this.Fa&&this.xa.redraw();},i.prototype.parse=function(i){return {width:a$6,height:a$6,h:f$2(i.padding)}},i.prototype.getWidget=function(t){var i,s=this.Fa;return s&&(i=s[t]),i||null},i.prototype.isOpen=function(){return !!this.Fa},i.prototype.open=function(t,i){l$3(t,1,this.width),l$3(t,0,this.height),this.Fa=i;var s=this.B;s&&s.ya(this),o$6(this.l,this);},i.prototype.update=function(){o$6(this.Ca,this);},i.prototype.close=function(){o$6(this.m,this);var t=this.B;t&&t.Na(),this.Fa=void 0;},i}();function p$2(t,o,h,m){var f=a$5[m],p=t[f],l=h[f],d=h.h,c=o==a$4;return c&&p==s$1||o==s$1?(n$8(l)||o$a('Window body '+f+' must resolve to absolute size for "auto" window size.'),l[0]+p$7(t,d,m)):(m$2(t,m,l,d),c?p:l[0])}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var r$6=function(){function r(r,s,o){this.va=[];var m=[],f=[],h$1=[],l=[],u=new f$1(o.width||a$4,o.height||a$4,r,m,f,h$1,l),p=new o$7,w=s.onOpen,a=s.onUpdate,c=s.onClose;this.open=m,this.update=f,this.redraw=h$1,this.close=l,this.binder=p,this.context=u,u.j=new h(u,this,o),u.B=p.Oa()?p:null,w&&m.push(w),a&&f.push(a),c&&l.push(c);}return r.prototype.add=function(i){this.va.push(i);},r.prototype.on=function(i,t){this[i].push(t);},r}();

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    (function(i){function o(t){var r=i.call(this,t)||this,o=new r$6(r,t,t),s=o.va;return r.ga.widgets=s,r.a=r$9(s),r.b=o.context,r}return r$f(o,i),o.prototype.c=function(t){t(this.b);},o.prototype.d=function(t,i){var o=this.ma(this.w,o$8),m=this.b.layout(o,i);this.na(t,m,o$8,n$b);},o})(u$1);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function n$6(){}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function v$1(t){return new d(t)}var d=function(o){function n(t){var s,r=o.call(this,t)||this,n=r.ga,f={},a=t.width,c=t.height,l=t.tabs,v=t.padding,d=t.startingTab||0,j=t.static;if(j){var w=new r$6(r,t,j),g=w.va;n.widgets=g,r$9(g,f),s=w.context,r.w|=16;}else s={open:t.onOpen||n$6,update:t.onUpdate||n$6,close:t.onClose||n$6};r.e=s,r.f=a,r.g=c,r.h=f$2(n$c(v)?p$8:v);for(var y=l.length,b=Array(y),A=Array(y),H=0;H<y;H++){var x={image:16};b[H]=l[H](r,x),A[H]=x;var B=x.widgets;B&&r$9(B,f);}return n.tabs=A,n.tabIndex=d,n.onTabChange=function(){return r.r()},r.a=f,r.i=b,r.s=d,r.k=t.onTabChange,r.w|=y>0?8:0,r}return r$f(n,o),n.prototype.l=function(t,i){8&this.w&&this.o(t,this.u()),o.prototype.l.call(this,t,i);},n.prototype.m=function(){o.prototype.m.call(this),this.s=this.ga.tabIndex||0;},n.prototype.c=function(t){t(this.e),8&this.w&&t(this.u());},n.prototype.o=function(t,i){var s=p$6(t,1,i.width,this.f),r=p$6(t,0,i.height,this.g);this.qa(s,r);},n.prototype.d=function(t,i){8&this.w&&this.p(this.u(),t,i),this.q(i);},n.prototype.p=function(t,i,s){var r=this.ma(this.w,44),o=this.h;j(r,o,1),j(r,o,0);var n=t.layout(r,s);this.na(i,n,44,o);},n.prototype.q=function(t){if(16&this.w){var i=this.ma(0,o$8),o=this.h;m$2(i,1,a$6,o),m$2(i,0,a$6,o),this.e.layout(i,t);}},n.prototype.r=function(){var t=this.ua;if(t){var i=r$9(t.widgets),s=t.tabIndex;this.u().close(),this.s=s,this.t=i;var r=this.u(),o=this.k;this.o(t,r),this.p(r,t,i),this.q(i),r.open(t,i),o&&o(s);}},n.prototype.u=function(){return this.i[this.s]},n}(u$1);function j(t,i,h){t[a$5[h]]==s$1?p$7(t,i,h):m$2(t,h,a$6,i);}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function e$5(e){return function(n,t){var f=new r$6(n,e,e);return t.image=e.image,t.widgets=f.va,f.context}}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var i$5=function(){function i(t){this.U=t;}return i.prototype.get=function(){return this.U},i.prototype.subscribe=function(t){this.Ga?this.Ga.push(t):this.Ga=[t];var i=this.Ga;return function(){var n=i.indexOf(t);-1!==n&&i.splice(n,1);}},i.prototype.Ha=function(i){this.Ga&&o$6(this.Ga,i);},i}();

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var o$5=function(i){function o(){return null!==i&&i.apply(this,arguments)||this}return r$f(o,i),o.prototype.set=function(t){this.U!==t&&(this.U=t,this.Ha(t));},o}(i$5);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function t$4(t){return new o$5(t)}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    (function(r){function s(){var t=null!==r&&r.apply(this,arguments)||this;return t.push=t.wa('push'),t.pop=t.wa('pop'),t.unshift=t.wa('unshift'),t.shift=t.wa('shift'),t.splice=t.wa('splice'),t.sort=t.wa('sort'),t}return r$f(s,r),s.prototype.set=function(t,r){u$7(t)?this.U=t:this.U[t]=r,this.Ha(this.U);},s.prototype.insert=function(t){for(var i=[],r=1;r<arguments.length;r++)i[r-1]=arguments[r];var s=this.U;return s.splice.apply(s,[t,0].concat(i)),this.Ha(s),s.length},s.prototype.resize=function(t){var i=this.U;i.length=t,this.Ha(i);},s.prototype.wa=function(t){var i=this;return function(){for(var r=[],s=0;s<arguments.length;s++)r[s]=arguments[s];var n=i.U,o=n[t].apply(n,r);return i.Ha(n),o}},s})(i$5);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function o$4(o){return i$6(o)?o.get():o}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var r$5=Array.prototype.slice;

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function i$4(){for(var i=arguments,e=r$5.call(i,0,-1),u=e.length,m=i[u],f=t$4(n$5(e,m)),a=0;a<u;)n$a(e[a++],(function(){var r=n$5(e,m);return f.set(r)}));return f}function n$5(r,t){var o=r.map((function(r){return r.get()}));return t.apply(void 0,o)}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function t$3(t){return {twoway:t}}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function o$3(o,i,p){for(var s=o.length,f=i.width,m=i.height,n=Array(s),t=0,e=0,l=0;l<s;l++)if(!(S=o[l]).skip){var v=S.position,c=v.width,g=v.height;t$7(c)&&(t+=c[0]),t$7(g)&&(e+=g[0]),n[l]=v;}var j={};for(l=0;l<s;l++){var S=n[l];j.x=i.x+s$3(S.x,f,t,0),j.y=i.y+s$3(S.y,m,e,0),j.width=s$3(S.width,f,t,0),j.height=s$3(S.height,m,e,0),o[l].layout(p,j);}}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    (function(r){function m(t,o,s){var m=r.call(this,t,s)||this;m.recalculate=n$6;var e=u$7(s)?s:s.content,u=e.length;m.v=Array(u);for(var a=0;a<e.length;a++){var f=e[a];m.v[a]=f(m,o);}return m}return r$f(m,r),m.prototype.parse=function(t){return {x:n$7(t.x),y:n$7(t.y),width:n$7(t.width),height:n$7(t.height)}},m.prototype.layout=function(t,r){o$3(this.v,r,t);},m})(t$6);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function r$4(r,t){i$6(r)?(n$a(r,t),t(r.get())):n$c(r)||t(r);}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function n$4(n,r,t){return n<r?n=r:n>t&&(n=t),n}function r$3(n,r,t){return n<r?n=t:n>t&&(n=r),n}var t$2=Math.round;

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function i$3(i,m,o){var r=i[m];r.x=t$2(o.x),r.y=t$2(o.y),r.width=t$2(o.width-.1),r.height=t$2(o.height-.1);}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var n$3=function(s){function n(i,r,n,e){var m=s.call(this,r,e)||this;m.name=r$c(),m.type=i,m.x=m.y=m.width=m.height=0;var l=n.binder,u=n.context,f=e.visibility;return l.add(m,'tooltip',e.tooltip),l.add(m,'isDisabled',e.disabled),l.add(m,'isVisible',f,(function(i){return 'visible'===i})),r$4(f,(function(i){var t=m.skip,o='none'===i;m.skip=o,(t||o)&&(r.recalculate(),u.redraw());})),n.add(m),m}return r$f(n,s),n.prototype.layout=function(i,t){i$3(i,this.name,t);},n}(t$6);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var f=function(m){function a(t,i,n){var e,a=this,f='groupbox',u='content',l=f$4(n);if(u in n){a=m.call(this,f,t,i,n)||this,e=n[u];var p=i.binder,c=n.text;p.add(a,'text',c),l|=c?8:0;}else a=m.call(this,f,t,i,{})||this,e=n;a.w=4|l;var h=e(a,i);return a.z=h,i.on(e$7,(function(){4&a.w&&(a.w&=-5,m$1(a.position,a.w,a.z.position));})),a}return r$f(a,m),a.prototype.parse=function(t){var r=f$2(6);return 8&this.w&&(r.top=[15,0]),t$5(t,r)},a.prototype.recalculate=function(){this.w|=4,3&this.w&&this.xa.recalculate();},a.prototype.layout=function(t,i){var r=8&this.w?0:4;i.y-=r,i.height+=r,m.prototype.layout.call(this,t,i),i.y+=r,i.height-=r;var o=this.z,s=o.position;f$6(i,s.width,s.height,s.padding),o.layout(t,i);},a}(n$3);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function n$2(t){return function(r,n){return new o$2(r,n,t)}}var o$2=function(r){function n(t,n,o){var e=r.call(this,'button',t,n,o)||this,i=n.binder;return i.add(e,'text',o.text),i.add(e,'image',o.image),i.add(e,'border',o.border),i.add(e,'isPressed',o.isPressed),e.onClick=o.onClick,e}return r$f(n,r),n}(n$3);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function r$2(t){return u$6(t),function(n,o){return new e$4(n,o,t)}}var e$4=function(n){function o(t,o,r){var e=n.call(this,'checkbox',t,o,r)||this,i=o.binder;return i.add(e,'text',r.text),i.twoway(e,'isChecked','onChange',r.isChecked,r.onChange),e}return r$f(o,n),o.prototype.layout=function(t,o){o.y+=1,n.prototype.layout.call(this,t,o);},o}(n$3);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function n$1(n,t,o){return t?function(u){n.E||(o?o(u,t):t(u));}:t}function t$1(n,t,o,u){n.E=true,t[o]=u,n.E=false;}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function e$3(t){return n$c(t.width)&&(t.width=12),n$c(t.height)&&(t.height=12),function(o,r){return new u(o,r,t)}}var u=function(i){function n(t,n,e){var u=i.call(this,'colourpicker',t,n,e)||this,s=e.colour,m=n.binder;return m.on(u,s,(function(t,r){t$1(u,t,'colour',r);})),m.callback(u,'onChange',s,n$1(u,e.onChange)),u}return r$f(n,i),n.prototype.layout=function(t,o){o.y+=1,i.prototype.layout.call(this,t,o);},n}(n$3);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function e$2(t){return u$6(t),function(n,i){return new m(n,i,t)}}var m=function(o){function s(t,s,e){var m=o.call(this,'dropdown',t,s,e)||this;m.items=[],m.selectedIndex=0;var f,u=e.items,c=e.disabled,a=e.disabledMessage,h=e.onChange,p='empty'===(f=e.autoDisable)?0:'single'===f?1:-1,d=e.selectedIndex,l=function(t){m.C(t,o$4(u),o$4(c),p,a);},v=s.binder,j=l;i$6(u)&&(j=function(t,n){l(t),m.F(t,n),m.A=n;}),v.on(m,u,j),v.on(m,d,(function(t,n){m.G=n,l(t);})),v.on(m,c,l);var b=n$1(m,h,(function(t,n){return n(t<0?0:t)}));return v.callback(m,'onChange',d,b),m}return r$f(s,o),s.prototype.C=function(t,n,i,r,o){this.E=true;var s=i||!n||n.length<=r;s&&o?t.items=[o]:(t.items=n,t.selectedIndex=this.G||0),t.isDisabled=s,this.E=false;},s.prototype.F=function(t,n){var i=this.A;if(i){var r=i[t.selectedIndex||0],o=n.indexOf(r);o<0&&(o=0),this.G!==o&&(this.G=o,t.selectedIndex=o);}},s}(n$3);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    (function(o){function s(r,n,s){for(var m=this,f=s.buttons,u=f.length,e=Array(u),a=Array(u),c=0;c<u;c++){var p=f[c];e[c]=p.text,a[c]=p.onClick;}var j=t$4(e[0]||''),l=s;l.items=e,l.onChange=function(r){m.J=r,j.set(e[r]||'');},m=o.call(this,r,n,l)||this;var v=s;return v.text=j,v.onClick=function(){var r=a[m.J];r&&r();},m.I=new o$2(r,n,v),m.J=0,m}return r$f(s,o),s.prototype.layout=function(r,t){i$3(r,this.name,t),t.x++,t.y++,t.width-=13,t.height-=2,i$3(r,this.I.name,t);},s})(m);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function e$1(e){if(i$6(e)){var m=t$4(e.get());return n$a(e,(function(r){return m.set(r)})),m}return t$4(e)}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function t(t,s){return o$b(t)?t:t$3(e$1(t||s))}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function a$1(t){return u$6(t),function(r,i){return new c$2(r,i,t)}}var c$2=function(e){function f(t,m,u){var f=e.call(this,'spinner',t,m,u)||this;f.V=1,f.W=-2147483648,f.X=2147483647;var a=u.value,c=o$b(a)?a.twoway:e$1(a||0),p=u.format||function(t){return t.toString()},h=m.binder,l=u.disabledMessage,j=u.minimum,v=u.maximum;if(l){var d=u.disabled;h.add(f,'text',d,(function(t){return t?l:p(c.get())}));var g=p;p=function(t){return o$4(d)?l:g(t)};}return f.U=c,h.add(f,'text',c,p),r$4(u.step,(function(t){return f.V=t})),r$4(j,(function(t){var r=c.get();f.W=t,r<t&&f._(t,t-r);})),r$4(v,(function(t){var r=c.get();f.X=t,r>t&&f._(t,t-r);})),f.Y=u.wrapMode||'clamp',f.Z=u.onChange,f.onIncrement=function(){return f.$(1)},f.onDecrement=function(){return f.$(-1)},f.W>f.X&&o$a('Spinner: minimum '+f.W+' is larger than maximum '+f.X),f}return r$f(f,e),f.prototype.$=function(t){var r=this.W,i=this.X;if(!(r>=i)){var n,o=this.V*t,s=this.U.get(),e=s+o,f=this.Y;n='wrap'===f||'clampThenWrap'===f&&(e<r&&s===r||e>i&&s===i)?r$3(e,r,i):n$4(e,r,i),this._(n,o);}},f.prototype._=function(t,r){this.U.set(t),this.Z&&this.Z(t,r);},f}(n$3);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    (function(n){function e(o,m,e){var a=this,u=t(e.selectedIndex,0),p={tooltip:e.tooltip,disabled:e.disabled,visibility:e.visibility,wrapMode:e.wrapMode||'wrap',minimum:0,value:u,onChange:e.onChange},d=e.items;if(i$6(d)){var l=t$4(0);n$a(d,(function(o){var r=o.length;l.set(o&&r>0?r-1:0);})),p.maximum=l;}else if(d){var b=d.length;p.maximum=b>0?b-1:0;}e.selectedIndex=u;var c=new c$2(o,m,p);return (a=n.call(this,o,m,e)||this).K=c,a}return r$f(e,n),e.prototype.layout=function(o,r){i$3(o,this.K.name,r),r.width-=25,i$3(o,this.name,r);},e})(m);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    (function(r){function n(t,n,o){var i=r.call(this,'custom',t,n,o)||this;return i.onDraw=o.onDraw,i}return r$f(n,r),n})(n$3);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function i$2(i){var r,o,f$1,m=0;if('content'in i){r=i.content,o=i.gap,f$1=i.spacing;var u=i.direction;n$c(u)||(m=u);}else r=i;var c=i,l={content:r,direction:m,spacing:f$1,padding:o};return c.content=function(n,e){return new h(n,e,l)},function(n,t){return new f(n,t,c)}}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function o$1(t){return u$6(t),function(n,r){return new i$1(n,r,t)}}var i$1=function(n){function r(t,r,o){var i=n.call(this,'label',t,r,o)||this;i.text='';var e=r.binder;return e.add(i,'text',o.text),e.add(i,'textAlign',o.alignment),i}return r$f(r,n),r.prototype.layout=function(t,r){r.y+=2,n.prototype.layout.call(this,t,r);},r}(n$3);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function p$1(r){return function(t,i){return new c$1(t,i,r)}}var c$1=function(l){function p(r,n,a){var p=l.call(this,'listview',r,n,a)||this,c=a.selectedCell,h=a.onClick,d=n.binder;d.add(p,'items',a.items),d.add(p,'selectedCell',c),d.callback(p,'onClick',c,h&&function(r){r&&h(r.row,r.column);},(function(r,i){var o=o$4(p.P);return o&&o.row==r&&o.column==i?o:{row:r,column:i}})),p.showColumnHeaders=!n$c(a.columns),p.scrollbars=a.scrollbars,p.canSelect=a.canSelect,p.isStriped=a.isStriped,p.onHighlight=a.onHighlight,p.P=r$b(c);var v=a.columns;if(p.columns=v,!v)return p;for(var j,w,b,g=v.length,y=Array(g),x=-1,C=false,k=0;k<g;k++){if(j=v[k],c$6(j))v[k]={header:j},w=a$6;else {var A=j.tooltip,L=j.ratioWidth,S=j.width;w=n$c(S)&&!n$c(L)?[L,2]:o$9(S,a$6),A&&(j.headerTooltip=A);}b=w[1],y[k]=w,C||(C=x!=b&&-1!=x),x=b;}if(C||1==x)return p.Q=y.map((function(r){return {width:r,height:f$7,padding:n$b}})),p;for(k=0;k<g;k++){var _=v[k];S=y[k],0==x?_.width=S[0]:(_.width=void 0,_.ratioWidth=S[0]);}return p}return r$f(p,l),p.prototype.layout=function(r,t){var i=this,o=this.Q;if(o){var s=r[this.name];this.Q&&s.width!==t.width&&(f$3(o,t,1,f$7,(function(r,t){i.columns[r].width=t$2(t.width);})),s.columns=this.columns,s.width=t.width),s.x=t.x,s.y=t.y,s.height=t.height;}else l.prototype.layout.call(this,r,t);},p}(n$3);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    (function(n){function o(t,o,r){var e=n.call(this,'textbox',t,o,r)||this,i=o.binder;return i.twoway(e,'text','onChange',r.text,r.onChange),i.add(e,'maxLength',r.maxLength),e}return r$f(o,n),o})(n$3);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function r$1(n){return function(t,o){return new i(t,o,n)}}var i=function(o){function r(n,r,i){var u,e=t(i.isPressed,false),m=e.twoway;return i.isPressed=e,u=o.call(this,n,r,i)||this,r.binder.callback(u,'onClick',e,i.onChange,(function(){return !m.get()})),u}return r$f(r,o),r}(o$2);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var e;!function(e){e[e.Gridlines=128]='Gridlines',e[e.UndergroundInside=1]='UndergroundInside',e[e.HideBase=4096]='HideBase',e[e.HideVertical=8192]='HideVertical',e[e.SoundOn=1024]='SoundOn',e[e.LandOwnership=256]='LandOwnership',e[e.ConstructionRights=512]='ConstructionRights',e[e.InvisibleEntities=16384]='InvisibleEntities',e[e.ClipView=131072]='ClipView',e[e.HighlightPathIssues=262144]='HighlightPathIssues',e[e.TransparentBackground=524288]='TransparentBackground',e[e.LandHeights=16]='LandHeights',e[e.TrackHeights=32]='TrackHeights',e[e.PathHeights=64]='PathHeights',e[e.SeeThroughRides=2]='SeeThroughRides',e[e.SeeThroughVehicles=1048576]='SeeThroughVehicles',e[e.SeeThroughVegetation=2097152]='SeeThroughVegetation',e[e.SeeThroughScenery=4]='SeeThroughScenery',e[e.SeeThroughPaths=65536]='SeeThroughPaths',e[e.SeeThroughSupports=8]='SeeThroughSupports',e[e.InvisibleGuests=2048]='InvisibleGuests',e[e.InvisibleStaff=8388608]='InvisibleStaff',e[e.InvisibleRides=16777218]='InvisibleRides',e[e.InvisibleVehicles=34603008]='InvisibleVehicles',e[e.InvisibleVegetation=69206016]='InvisibleVegetation',e[e.InvisibleScenery=134217732]='InvisibleScenery',e[e.InvisiblePaths=268500992]='InvisiblePaths',e[e.InvisibleSupports=536870920]='InvisibleSupports';}(e||(e={}));

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var a={x:-9e3,y:-9e3};function c(r){return function(t,n){return new v(t,n,r)}}var p=e.HideBase|e.HideVertical|e.InvisibleGuests|e.InvisibleStaff|e.InvisibleRides|e.InvisibleVehicles|e.InvisibleVegetation|e.InvisibleScenery|e.InvisiblePaths|e.SeeThroughSupports,v=function(u){function f(r,o,s){var f=u.call(this,'viewport',r,o,s)||this,a=o.binder,c=s.target,p=s.visibilityFlags,v=s.disabled,l=s.zoom,j=function(r){f.aa(r.viewport,c,p,v);};return a.on(f,p,j),a.on(f,v,j),a.on(f,c,j),a.on(f,l,(function(r,t){var n=r.viewport;n&&(n.zoom=t);})),o.on(o$c,(function(r){var t=f.da(r);t&&l&&(t.zoom=o$4(l)),f.aa(t,c,p,v);})),(i$6(c)||e$8(c))&&o.on(r$d,(function(r){var t=f.da(r);f.aa(t,c,p,v);})),f}return r$f(f,u),f.prototype.aa=function(r,t,i,o){if(r){var s=this.ba(o$4(t)),e=o$4(i),m=o$4(o);this.ca(r,s,e,m);}},f.prototype.ba=function(r){var t=null;if(!t$b(r))if(e$8(r)){var n=map.getEntity(r);n&&(t={x:n.x,y:n.y,z:n.z});}else i$7(r)&&(t=r);return t},f.prototype.ca=function(r,t,n,i){!i&&t||(n=p,t=a),r.moveTo(t),r.visibilityFlags=n||0;},f.prototype.da=function(r){var t=r.getWidget(this.name);return t?t.viewport:null},f}(n$3);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var n=['x','y','width','height','name','tooltip','isVisible','isDisabled'];(function(i){function r(t,r,o,e){var s=i.call(this,t,r,o,e)||this;for(var u in e) -1==n.indexOf(u)&&(s[u]=e[u]);return s}return r$f(r,i),r})(n$3);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var r;!function(r){r[r.Black=0]='Black',r[r.Grey=1]='Grey',r[r.White=2]='White',r[r.DarkPurple=3]='DarkPurple',r[r.LightPurple=4]='LightPurple',r[r.BrightPurple=5]='BrightPurple',r[r.DarkBlue=6]='DarkBlue',r[r.LightBlue=7]='LightBlue',r[r.IcyBlue=8]='IcyBlue',r[r.Teal=9]='Teal',r[r.Aquamarine=10]='Aquamarine',r[r.SaturatedGreen=11]='SaturatedGreen',r[r.DarkGreen=12]='DarkGreen',r[r.MossGreen=13]='MossGreen',r[r.BrightGreen=14]='BrightGreen',r[r.OliveGreen=15]='OliveGreen',r[r.DarkOliveGreen=16]='DarkOliveGreen',r[r.BrightYellow=17]='BrightYellow',r[r.Yellow=18]='Yellow',r[r.DarkYellow=19]='DarkYellow',r[r.LightOrange=20]='LightOrange',r[r.DarkOrange=21]='DarkOrange',r[r.LightBrown=22]='LightBrown',r[r.SaturatedBrown=23]='SaturatedBrown',r[r.DarkBrown=24]='DarkBrown',r[r.SalmonPink=25]='SalmonPink',r[r.BordeauxRed=26]='BordeauxRed',r[r.SaturatedRed=27]='SaturatedRed',r[r.BrightRed=28]='BrightRed',r[r.DarkPink=29]='DarkPink',r[r.BrightPink=30]='BrightPink',r[r.LightPink=31]='LightPink',r[r.DarkOliveDark=32]='DarkOliveDark',r[r.DarkOliveLight=33]='DarkOliveLight',r[r.SaturatedBrownLight=34]='SaturatedBrownLight',r[r.BordeauxRedDark=35]='BordeauxRedDark',r[r.BordeauxRedLight=36]='BordeauxRedLight',r[r.GrassGreenDark=37]='GrassGreenDark',r[r.GrassGreenLight=38]='GrassGreenLight',r[r.OliveDark=39]='OliveDark',r[r.OliveLight=40]='OliveLight',r[r.SaturatedGreenLight=41]='SaturatedGreenLight',r[r.TanDark=42]='TanDark',r[r.TanLight=43]='TanLight',r[r.DullPurpleLight=44]='DullPurpleLight',r[r.DullGreenDark=45]='DullGreenDark',r[r.DullGreenLight=46]='DullGreenLight',r[r.SaturatedPurpleDark=47]='SaturatedPurpleDark',r[r.SaturatedPurpleLight=48]='SaturatedPurpleLight',r[r.OrangeLight=49]='OrangeLight',r[r.AquaDark=50]='AquaDark',r[r.MagentaLight=51]='MagentaLight',r[r.DullBrownDark=52]='DullBrownDark',r[r.DullBrownLight=53]='DullBrownLight',r[r.Invisible=54]='Invisible',r[r.Void=55]='Void';}(r||(r={}));

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var o;!function(o){o[o.Vertical=0]='Vertical',o[o.Horizontal=1]='Horizontal';}(o||(o={}));

    function createGuestState() {
        return {
            mode: "uncontrolled",
            actionQueue: [],
            currentAction: null,
            queuePaused: true,
            queueExecutingIndex: -1,
            keepSteps: false,
            loopQueue: false,
            heldDirection: -1,
            moveTickCount: 0,
            lastMoveDist: -1,
            actionTickCount: 0
        };
    }
    var ACCESSORY_TYPES = [null, "hat", "sunglasses", "balloon", "umbrella"];
    var COLOUR_ACCESSORIES = { hat: true, balloon: true, umbrella: true };
    var DEFAULT_COLOURS = { hat: 6, balloon: 14, umbrella: 0 };
    var MODE_LABELS = ["Uncontrolled", "Direct", "Queued"];
    var ACTION_LABELS = {
        jump: "Jump",
        takePhoto: "Take Photo",
        wave: "Wave",
        wave2: "Wave (alt)",
        clap: "Clap",
        joy: "Joy",
        wow: "Wow",
        checkTime: "Check Time",
        readMap: "Read Map",
        drawPicture: "Draw Picture",
        disgust: "Disgust",
        throwUp: "Throw Up",
        shakeHead: "Shake Head",
        beingWatched: "Being Watched",
        withdrawMoney: "Withdraw Money",
        emptyPockets: "Empty Pockets",
        eatFood: "Eat Food"
    };
    var ACTION_EXCLUDE = [
        "walking", "watchRide", "holdMat",
        "sittingIdle", "sittingEatFood",
        "sittingLookAroundLeft", "sittingLookAroundRight",
        "hanging", "drowning"
    ];
    // ── Global guest state (singleton, survives window close) ──────────────
    var guestStates = {};
    function resetGuestStates() {
        var keys = Object.keys(guestStates);
        for (var i = 0; i < keys.length; i++) {
            delete guestStates[parseInt(keys[i], 10)];
        }
    }
    // ── ViewModel ──────────────────────────────────────────────────────────
    var PeepSimModel = /** @class */ (function () {
        function PeepSimModel() {
            // Guest selection
            this.selectedGuestId = t$4(null);
            this.guestList = t$4([]);
            this.selectedGuestIndex = t$4(0);
            this.guestTarget = t$4(null);
            // Mode for current guest (0=uncontrolled, 1=direct, 2=queued)
            this.selectedMode = t$4(0);
            // Direct control
            this.heldDirection = t$4(-1);
            this.moveToolActive = t$4(false);
            this.guestFrozen = t$4(false);
            // Queued control
            this.queuePaused = t$4(true);
            this.actionQueue = t$4([]);
            this.queueListItems = t$4([]);
            this.queueSelectedCell = t$4(null);
            this.keepSteps = t$4(false);
            this.loopQueue = t$4(false);
            this.queueExecutingIndex = t$4(-1);
            // Picker tool
            this.pickerActive = t$4(false);
            // Appearance
            this.accessoryActive = t$4(null);
            this.accessoryColour = t$4(0);
            this.shirtColour = t$4(0);
            this.pantsColour = t$4(0);
            this.accessoryIndex = t$4(0);
            // Action dropdowns
            this.actionAnimations = t$4([]);
            this.actionLabels = t$4([]);
            this.selectedActionIndex = t$4(0);
            this.queueActionAnimations = t$4([]);
            this.queueActionLabels = t$4([]);
            this.selectedQueueActionIndex = t$4(0);
            this.queueDuration = t$4(3);
            // Has-guest computed
            this.hasGuest = i$4(this.selectedGuestId, function (id) { return id !== null; });
            this.noGuest = i$4(this.selectedGuestId, function (id) { return id === null; });
            // Internals
            this.isRefreshing = false;
            this.directionInterval = null;
            this.actionPlayInterval = null;
            this.currentAction = null;
            this.moveTickCount = 0;
            this.lastMoveDist = -1;
            this.actionTickCount = 0;
            this.guestRefreshCounter = 0;
        }
        return PeepSimModel;
    }());

    function getSelectedGuest(model) {
        var id = model.selectedGuestId.get();
        if (id === null)
            return null;
        var entity = map.getEntity(id);
        if (!entity || entity.type !== "guest") {
            model.selectedGuestId.set(null);
            model.guestTarget.set(null);
            return null;
        }
        return entity;
    }
    // ── State swap ─────────────────────────────────────────────────────────
    /**
     * Release a direct-mode guest when the UI detaches (close window / switch guest).
     * Unfreezes the guest entity and removes it from global state.
     */
    function releaseDirectGuest(model) {
        var id = model.selectedGuestId.get();
        if (id === null)
            return;
        if (model.selectedMode.get() !== 1)
            return;
        var entity = map.getEntity(id);
        if (entity && entity.type === "guest") {
            unfreezeGuestEntity(entity);
        }
        delete guestStates[id];
    }
    function saveCurrentGuestState(model) {
        var id = model.selectedGuestId.get();
        if (id === null)
            return;
        var modeIndex = model.selectedMode.get();
        // Direct mode is UI-only — release instead of saving
        if (modeIndex === 1) {
            releaseDirectGuest(model);
            return;
        }
        var mode = "uncontrolled";
        if (modeIndex === 2)
            mode = "queued";
        var gs = guestStates[id];
        if (!gs) {
            gs = createGuestState();
            guestStates[id] = gs;
        }
        gs.mode = mode;
        gs.actionQueue = model.actionQueue.get().slice();
        gs.currentAction = model.currentAction;
        gs.queuePaused = model.queuePaused.get();
        gs.queueExecutingIndex = model.queueExecutingIndex.get();
        gs.keepSteps = model.keepSteps.get();
        gs.loopQueue = model.loopQueue.get();
        gs.heldDirection = model.heldDirection.get();
        gs.moveTickCount = model.moveTickCount;
        gs.lastMoveDist = model.lastMoveDist;
        gs.actionTickCount = model.actionTickCount;
    }
    function loadGuestState(model, guestId) {
        var gs = guestStates[guestId];
        if (!gs) {
            gs = createGuestState();
            guestStates[guestId] = gs;
        }
        var modeIndex = 0;
        if (gs.mode === "direct")
            modeIndex = 1;
        else if (gs.mode === "queued")
            modeIndex = 2;
        model.selectedMode.set(modeIndex);
        model.actionQueue.set(gs.actionQueue.slice());
        model.currentAction = gs.currentAction;
        model.queuePaused.set(gs.queuePaused);
        model.queueExecutingIndex.set(gs.queueExecutingIndex);
        model.keepSteps.set(gs.keepSteps);
        model.loopQueue.set(gs.loopQueue);
        model.heldDirection.set(gs.heldDirection);
        model.moveTickCount = gs.moveTickCount;
        model.lastMoveDist = gs.lastMoveDist;
        model.actionTickCount = gs.actionTickCount;
    }
    function ensureGuestState(model, guestId) {
        var gs = guestStates[guestId];
        if (!gs) {
            gs = createGuestState();
            guestStates[guestId] = gs;
        }
        return gs;
    }
    // ── Guest selection ────────────────────────────────────────────────────
    function selectGuest(model, id) {
        model.selectedGuestId.set(id);
        model.guestTarget.set(id);
        syncAccessoriesFromGuest(model);
        refreshActionAnimations(model);
    }
    function spawnGuest(model) {
        var guest = park.generateGuest();
        if (guest && guest.id !== null) {
            model.selectedGuestId.set(guest.id);
            model.guestTarget.set(guest.id);
            context.executeAction("guestsetname", { peep: guest.id, name: "PeepSim" }, function () { });
            var gs = createGuestState();
            gs.mode = "direct";
            guestStates[guest.id] = gs;
            model.selectedMode.set(1);
        }
        return guest;
    }
    function refreshGuestList(model) {
        var list = map.getAllEntities("guest")
            .filter(function (g) { return g.id !== null; })
            .map(function (g) { return ({
            id: g.id,
            name: g.name
        }); });
        var currentId = model.selectedGuestId.get();
        var newIdx = (currentId !== null)
            ? (list.findIndex(function (g) { return g.id === currentId; }) + 1) || 0
            : 0;
        model.isRefreshing = true;
        model.guestList.set(list);
        model.selectedGuestIndex.set(newIdx);
        model.isRefreshing = false;
    }
    // ── Find guest ─────────────────────────────────────────────────────────
    function findGuest(model) {
        var guest = getSelectedGuest(model);
        if (!guest)
            return;
        ui.mainViewport.scrollTo({ x: guest.x, y: guest.y });
    }
    // ── Freeze / unfreeze ──────────────────────────────────────────────────
    function freezeGuestEntity(guest) {
        guest.setFlag("positionFrozen", true);
        guest.animation = "watchRide";
        guest.animationOffset = 0;
    }
    function unfreezeGuestEntity(guest) {
        guest.setFlag("positionFrozen", false);
        guest.animation = "walking";
        guest.animationOffset = 0;
    }
    function freezeGuest(model) {
        var guest = getSelectedGuest(model);
        if (guest) {
            freezeGuestEntity(guest);
        }
        model.guestFrozen.set(true);
    }
    function unfreezeGuest(model) {
        var guest = getSelectedGuest(model);
        if (guest) {
            unfreezeGuestEntity(guest);
        }
        model.guestFrozen.set(false);
    }
    // ── Accessories ────────────────────────────────────────────────────────
    function setAccessory(model, type) {
        var prev = model.accessoryActive.get();
        model.accessoryActive.set(type);
        var guest = getSelectedGuest(model);
        if (!guest)
            return;
        if (prev) {
            guest.removeItem({ type: prev });
        }
        if (type) {
            guest.giveItem({ type: type });
            if (COLOUR_ACCESSORIES[type]) {
                applyAccessoryColour(model, guest, type);
            }
        }
        if (model.selectedMode.get() !== 0) {
            freezeGuest(model);
        }
    }
    function setAccessoryColour(model, colour) {
        model.accessoryColour.set(colour);
        var guest = getSelectedGuest(model);
        if (!guest)
            return;
        var type = model.accessoryActive.get();
        if (type && COLOUR_ACCESSORIES[type]) {
            applyAccessoryColour(model, guest, type);
        }
    }
    function applyAccessoryColour(model, guest, type) {
        var colour = model.accessoryColour.get();
        if (type === "hat")
            guest.hatColour = colour;
        if (type === "balloon")
            guest.balloonColour = colour;
        if (type === "umbrella")
            guest.umbrellaColour = colour;
    }
    function enforceAccessories(model) {
        var guest = getSelectedGuest(model);
        if (!guest)
            return;
        var active = model.accessoryActive.get();
        if (active && !guest.hasItem({ type: active })) {
            guest.giveItem({ type: active });
            if (COLOUR_ACCESSORIES[active]) {
                applyAccessoryColour(model, guest, active);
            }
        }
    }
    function syncAccessoriesFromGuest(model) {
        var guest = getSelectedGuest(model);
        if (!guest)
            return;
        model.accessoryActive.set(null);
        model.accessoryColour.set(0);
        model.accessoryIndex.set(0);
        for (var i = 1; i < ACCESSORY_TYPES.length; i++) {
            var type = ACCESSORY_TYPES[i];
            if (guest.hasItem({ type: type })) {
                model.accessoryActive.set(type);
                model.accessoryIndex.set(i);
                if (type === "hat")
                    model.accessoryColour.set(guest.hatColour);
                else if (type === "balloon")
                    model.accessoryColour.set(guest.balloonColour);
                else if (type === "umbrella")
                    model.accessoryColour.set(guest.umbrellaColour);
                break;
            }
        }
    }
    function syncAppearanceFromGuest(model) {
        var guest = getSelectedGuest(model);
        if (!guest)
            return;
        model.guestFrozen.set(guest.getFlag("positionFrozen"));
        model.shirtColour.set(guest.tshirtColour);
        model.pantsColour.set(guest.trousersColour);
        syncAccessoriesFromGuest(model);
    }
    // ── Action animations ──────────────────────────────────────────────────
    function refreshActionAnimations(model) {
        var guest = getSelectedGuest(model);
        if (!guest) {
            model.actionAnimations.set([]);
            model.actionLabels.set(["(no guest)"]);
            model.queueActionAnimations.set([]);
            model.queueActionLabels.set(["(none)"]);
            return;
        }
        var available = guest.availableAnimations || [];
        var anims = [];
        var labels = [];
        for (var _i = 0, available_1 = available; _i < available_1.length; _i++) {
            var anim = available_1[_i];
            if (ACTION_EXCLUDE.indexOf(anim) >= 0)
                continue;
            labels.push(ACTION_LABELS[anim] || anim);
            anims.push(anim);
        }
        model.actionAnimations.set(anims);
        model.actionLabels.set(labels.length > 0 ? labels : ["(none available)"]);
        model.selectedActionIndex.set(0);
        model.queueActionAnimations.set(anims);
        model.queueActionLabels.set(labels.length > 0 ? labels : ["(none)"]);
        model.selectedQueueActionIndex.set(0);
    }
    // ── Reset ──────────────────────────────────────────────────────────────
    function resetState(model) {
        model.selectedGuestId.set(null);
        model.guestTarget.set(null);
        model.selectedGuestIndex.set(0);
        model.guestList.set([]);
        model.selectedMode.set(0);
        model.accessoryActive.set(null);
        model.accessoryColour.set(0);
        model.accessoryIndex.set(0);
        model.actionQueue.set([]);
        model.queueListItems.set([]);
        model.queuePaused.set(true);
        model.queueExecutingIndex.set(-1);
        model.keepSteps.set(false);
        model.loopQueue.set(false);
        model.heldDirection.set(-1);
        model.currentAction = null;
        model.moveTickCount = 0;
        model.lastMoveDist = -1;
        model.actionTickCount = 0;
    }

    // ── Queue manipulation ─────────────────────────────────────────────────
    function addAction(model, action) {
        var queue = model.actionQueue.get().slice();
        queue.push(action);
        model.actionQueue.set(queue);
        // Sync to global state
        var id = model.selectedGuestId.get();
        if (id !== null && guestStates[id]) {
            guestStates[id].actionQueue = queue.slice();
        }
        refreshQueueList(model);
    }
    function removeAction(model, index) {
        var queue = model.actionQueue.get().slice();
        queue.splice(index, 1);
        model.actionQueue.set(queue);
        // Adjust executing index if needed
        var execIdx = model.queueExecutingIndex.get();
        if (execIdx >= 0) {
            if (index < execIdx) {
                model.queueExecutingIndex.set(execIdx - 1);
            }
            else if (index === execIdx) {
                model.queueExecutingIndex.set(-1);
                model.currentAction = null;
            }
        }
        // Sync to global state
        var id = model.selectedGuestId.get();
        if (id !== null && guestStates[id]) {
            guestStates[id].actionQueue = queue.slice();
            guestStates[id].queueExecutingIndex = model.queueExecutingIndex.get();
            guestStates[id].currentAction = model.currentAction;
        }
        refreshQueueList(model);
    }
    function clearActions(model) {
        model.actionQueue.set([]);
        model.currentAction = null;
        model.actionTickCount = 0;
        model.queueExecutingIndex.set(-1);
        model.queueSelectedCell.set(null);
        // Sync to global state
        var id = model.selectedGuestId.get();
        if (id !== null && guestStates[id]) {
            guestStates[id].actionQueue = [];
            guestStates[id].currentAction = null;
            guestStates[id].actionTickCount = 0;
            guestStates[id].queueExecutingIndex = -1;
        }
        refreshQueueList(model);
    }
    function refreshQueueList(model) {
        var actions = model.actionQueue.get();
        var execIdx = model.queueExecutingIndex.get();
        var paused = model.queuePaused.get();
        var items = actions.map(function (a, i) {
            var desc;
            if (a.type === "action") {
                var label = ACTION_LABELS[a.animation] || a.animation;
                desc = "".concat(label, " (").concat(a.duration || 3, "s)");
            }
            else {
                desc = "Move \u2192 ".concat(a.target.x, ", ").concat(a.target.y);
            }
            var status = "";
            if (i === execIdx) {
                status = paused ? "||" : "\u25B6";
            }
            return [status, String(i + 1), desc];
        });
        model.queueListItems.set(items);
    }
    // ── Queue play/pause ───────────────────────────────────────────────────
    function pauseQueue(model) {
        model.queuePaused.set(true);
        var id = model.selectedGuestId.get();
        if (id !== null && guestStates[id]) {
            guestStates[id].queuePaused = true;
        }
        freezeGuest(model);
    }
    function resumeQueue(model) {
        model.queuePaused.set(false);
        var id = model.selectedGuestId.get();
        var gs = (id !== null) ? guestStates[id] : undefined;
        if (gs) {
            gs.queuePaused = false;
        }
        var guest = getSelectedGuest(model);
        if (!guest)
            return;
        // Re-initiate the current action on the entity
        var current = gs ? gs.currentAction : model.currentAction;
        if (current && current.type === "move" && current.target) {
            unfreezeGuest(model);
            guest.destination = {
                x: current.target.x * 32 + 16,
                y: current.target.y * 32 + 16
            };
        }
        else if (current && current.type === "action") {
            freezeGuest(model);
            guest.animation = current.animation;
        }
    }
    // ── Direct control ─────────────────────────────────────────────────────
    function directMove(model, tileX, tileY) {
        var guest = getSelectedGuest(model);
        if (!guest)
            return;
        model.actionQueue.set([]);
        model.currentAction = { type: "move", target: { x: tileX, y: tileY } };
        model.moveTickCount = 0;
        model.lastMoveDist = -1;
        unfreezeGuest(model);
        guest.destination = {
            x: tileX * 32 + 16,
            y: tileY * 32 + 16
        };
    }
    function directWalk(model, direction) {
        var guest = getSelectedGuest(model);
        if (!guest)
            return;
        if (guest.getFlag("positionFrozen")) {
            guest.setFlag("positionFrozen", false);
            guest.animation = "walking";
            guest.animationOffset = 0;
        }
        var rotation = ui.mainViewport.rotation;
        var adjusted = (direction - rotation + 4) & 3;
        var dx = 0, dy = 0;
        if (adjusted === 0) {
            dx = -2;
        }
        else if (adjusted === 1) {
            dy = 2;
        }
        else if (adjusted === 2) {
            dx = 2;
        }
        else if (adjusted === 3) {
            dy = -2;
        }
        guest.destination = {
            x: guest.x + dx * 32,
            y: guest.y + dy * 32
        };
        model.actionQueue.set([]);
        model.currentAction = null;
    }
    // ── Global Executor ────────────────────────────────────────────────────
    var globalTickInterval = null;
    function startGlobalExecutor() {
        if (globalTickInterval !== null)
            return;
        globalTickInterval = context.setInterval(function () {
            globalExecuteTick();
        }, 100);
    }
    function finishGuestAction(gs, guest) {
        gs.currentAction = null;
        gs.moveTickCount = 0;
        gs.lastMoveDist = -1;
        gs.actionTickCount = 0;
        if (gs.keepSteps) {
            var nextIdx = gs.queueExecutingIndex + 1;
            if (nextIdx >= gs.actionQueue.length) {
                if (gs.loopQueue && gs.actionQueue.length > 0) {
                    gs.queueExecutingIndex = -1; // will be picked up next tick
                }
                else {
                    freezeGuestEntity(guest);
                    gs.queuePaused = true;
                    gs.queueExecutingIndex = -1;
                }
            }
        }
        else {
            if (gs.actionQueue.length === 0) {
                freezeGuestEntity(guest);
                gs.queuePaused = true;
                gs.queueExecutingIndex = -1;
            }
        }
    }
    function executeGuestTick(id, gs) {
        var entity = map.getEntity(id);
        if (!entity || entity.type !== "guest")
            return;
        var guest = entity;
        var current = gs.currentAction;
        if (current !== null) {
            if (current.type === "action") {
                gs.actionTickCount++;
                var durationTicks = (current.duration || 3) * 10;
                if (gs.actionTickCount >= durationTicks) {
                    finishGuestAction(gs, guest);
                }
                return;
            }
            if (current.target) {
                var targetX = current.target.x * 32 + 16;
                var targetY = current.target.y * 32 + 16;
                var dx = guest.x - targetX;
                var dy = guest.y - targetY;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 32) {
                    finishGuestAction(gs, guest);
                    return;
                }
                gs.moveTickCount++;
                if (gs.moveTickCount % 10 === 0) {
                    if (gs.lastMoveDist >= 0 && Math.abs(dist - gs.lastMoveDist) < 4) {
                        guest.destination = { x: targetX, y: targetY };
                    }
                    gs.lastMoveDist = dist;
                }
            }
            return;
        }
        // Pick next action
        if (gs.actionQueue.length === 0) {
            freezeGuestEntity(guest);
            gs.queuePaused = true;
            gs.queueExecutingIndex = -1;
            return;
        }
        var nextIdx;
        var next;
        if (gs.keepSteps) {
            nextIdx = gs.queueExecutingIndex + 1;
            if (nextIdx >= gs.actionQueue.length) {
                if (gs.loopQueue) {
                    nextIdx = 0;
                }
                else {
                    freezeGuestEntity(guest);
                    gs.queuePaused = true;
                    gs.queueExecutingIndex = -1;
                    return;
                }
            }
            next = gs.actionQueue[nextIdx];
            gs.queueExecutingIndex = nextIdx;
        }
        else {
            next = gs.actionQueue[0];
            gs.actionQueue = gs.actionQueue.slice(1);
            nextIdx = 0;
            gs.queueExecutingIndex = 0;
        }
        gs.currentAction = next;
        gs.moveTickCount = 0;
        gs.lastMoveDist = -1;
        gs.actionTickCount = 0;
        if (next.type === "action") {
            freezeGuestEntity(guest);
            guest.animation = next.animation;
            guest.animationOffset = 0;
        }
        else if (next.target) {
            unfreezeGuestEntity(guest);
            guest.destination = {
                x: next.target.x * 32 + 16,
                y: next.target.y * 32 + 16
            };
        }
    }
    var uiModel = null;
    /** Register the UI model so the executor can sync state directly to stores. */
    function setUIModel(model) {
        uiModel = model;
    }
    function globalExecuteTick() {
        var ids = Object.keys(guestStates);
        for (var i = 0; i < ids.length; i++) {
            var id = parseInt(ids[i], 10);
            if (isNaN(id))
                continue;
            var gs = guestStates[id];
            if (!gs)
                continue;
            if (gs.mode !== "queued")
                continue;
            if (gs.queuePaused)
                continue;
            executeGuestTick(id, gs);
        }
        // Sync selected guest's state → UI stores (atomic, same call frame)
        if (uiModel !== null) {
            var selId = uiModel.selectedGuestId.get();
            if (selId !== null) {
                var selGs = guestStates[selId];
                if (selGs && selGs.mode === "queued") {
                    syncGuestToUI(uiModel, selGs);
                }
            }
        }
    }
    /** One-way sync: guestStates → UI stores. Only sets stores when values differ. */
    function syncGuestToUI(model, gs) {
        var changed = false;
        model.isRefreshing = true;
        if (model.queuePaused.get() !== gs.queuePaused) {
            model.queuePaused.set(gs.queuePaused);
            changed = true;
        }
        if (model.queueExecutingIndex.get() !== gs.queueExecutingIndex) {
            model.queueExecutingIndex.set(gs.queueExecutingIndex);
            changed = true;
        }
        if (model.currentAction !== gs.currentAction) {
            model.currentAction = gs.currentAction;
            changed = true;
        }
        // Compare queue by length — executor either slices (shrinks) or leaves it
        var mq = model.actionQueue.get();
        if (mq.length !== gs.actionQueue.length) {
            model.actionQueue.set(gs.actionQueue.slice());
            changed = true;
        }
        if (changed) {
            refreshQueueList(model);
        }
        model.isRefreshing = false;
    }
    /** Sync global guestStates → UI model for the selected guest (call from onUpdate). */
    function syncFromGlobalState(model) {
        var id = model.selectedGuestId.get();
        if (id === null)
            return;
        var gs = guestStates[id];
        if (!gs || gs.mode !== "queued")
            return;
        syncGuestToUI(model, gs);
    }
    /** Sync a single field from UI model → global guestStates for the selected guest. */
    function syncSettingToGlobal(model) {
        var id = model.selectedGuestId.get();
        if (id === null)
            return;
        var gs = guestStates[id];
        if (!gs)
            return;
        gs.keepSteps = model.keepSteps.get();
        gs.loopQueue = model.loopQueue.get();
    }
    // ── Direction walking ──────────────────────────────────────────────────
    function startDirectionWalk(model, direction) {
        if (!getSelectedGuest(model)) {
            ui.showError("PeepSim", "No guest selected!");
            return;
        }
        var current = model.heldDirection.get();
        if (current === direction) {
            stopDirectionWalk(model);
            freezeGuest(model);
            return;
        }
        if (model.directionInterval !== null) {
            context.clearInterval(model.directionInterval);
            model.directionInterval = null;
        }
        model.heldDirection.set(direction);
        directWalk(model, direction);
        model.directionInterval = context.setInterval(function () {
            if (model.heldDirection.get() < 0)
                return;
            directWalk(model, model.heldDirection.get());
        }, 400);
    }
    function stopDirectionWalk(model) {
        var wasActive = model.heldDirection.get() >= 0;
        model.heldDirection.set(-1);
        if (model.directionInterval !== null) {
            context.clearInterval(model.directionInterval);
            model.directionInterval = null;
        }
        return wasActive;
    }
    // ── Move tool ──────────────────────────────────────────────────────────
    function activateMoveTool(model) {
        if (!getSelectedGuest(model)) {
            ui.showError("PeepSim", "No guest selected!");
            return;
        }
        stopDirectionWalk(model);
        model.pickerActive.set(false);
        model.moveToolActive.set(true);
        ui.activateTool({
            id: "peepsim-move",
            cursor: "walk_down",
            filter: ["terrain"],
            onDown: function (e) {
                if (e.mapCoords) {
                    var tileX = Math.floor(e.mapCoords.x / 32);
                    var tileY = Math.floor(e.mapCoords.y / 32);
                    var mode = model.selectedMode.get();
                    if (mode === 1) {
                        directMove(model, tileX, tileY);
                    }
                    else if (mode === 2) {
                        addAction(model, { type: "move", target: { x: tileX, y: tileY } });
                    }
                }
            },
            onFinish: function () {
                model.moveToolActive.set(false);
            }
        });
    }
    function deactivateMoveTool(model) {
        if (ui.tool && ui.tool.id === "peepsim-move") {
            ui.tool.cancel();
        }
        model.moveToolActive.set(false);
    }
    // ── Picker tool ────────────────────────────────────────────────────────
    function activatePickerTool(model) {
        model.moveToolActive.set(false);
        model.pickerActive.set(true);
        ui.activateTool({
            id: "peepsim-picker",
            cursor: "cross_hair",
            filter: ["entity"],
            onDown: function (e) {
                if (e.entityId === undefined)
                    return;
                var entity = map.getEntity(e.entityId);
                if (!entity || entity.type !== "guest")
                    return;
                // Save current guest state before switching
                saveCurrentGuestState(model);
                stopDirectionWalk(model);
                deactivateMoveTool(model);
                // Ensure the picked guest has a state entry
                ensureGuestState(model, e.entityId);
                // Select and load
                selectGuest(model, e.entityId);
                loadGuestState(model, e.entityId);
                refreshGuestList(model);
                refreshQueueList(model);
            },
            onFinish: function () {
                model.pickerActive.set(false);
            }
        });
    }
    function deactivatePickerTool(model) {
        if (ui.tool && ui.tool.id === "peepsim-picker") {
            ui.tool.cancel();
        }
        model.pickerActive.set(false);
    }
    // ── Perform single action ──────────────────────────────────────────────
    function performSelectedAction(model) {
        var guest = getSelectedGuest(model);
        if (!guest)
            return;
        var anims = model.actionAnimations.get();
        if (anims.length === 0)
            return;
        if (!guest.getFlag("positionFrozen"))
            return;
        var idx = model.selectedActionIndex.get();
        if (idx < 0 || idx >= anims.length)
            return;
        var anim = anims[idx];
        if (model.actionPlayInterval !== null) {
            context.clearInterval(model.actionPlayInterval);
            model.actionPlayInterval = null;
        }
        guest.animation = anim;
        guest.animationOffset = 0;
        var prevOffset = -1;
        model.actionPlayInterval = context.setInterval(function () {
            var g = getSelectedGuest(model);
            if (!g || g.animation !== anim) {
                if (model.actionPlayInterval !== null) {
                    context.clearInterval(model.actionPlayInterval);
                    model.actionPlayInterval = null;
                }
                return;
            }
            var offset = g.animationOffset;
            if (prevOffset >= 0 && offset < prevOffset) {
                g.animation = "watchRide";
                g.animationOffset = 0;
                if (model.actionPlayInterval !== null) {
                    context.clearInterval(model.actionPlayInterval);
                    model.actionPlayInterval = null;
                }
            }
            prevOffset = offset;
        }, 50);
    }
    // ── Mode transitions ───────────────────────────────────────────────────
    function handleModeChange(model, newModeIndex) {
        var oldModeIndex = model.selectedMode.get();
        if (oldModeIndex === newModeIndex)
            return;
        // Clean up old mode
        if (oldModeIndex === 1) {
            // Leaving direct mode
            stopDirectionWalk(model);
            deactivateMoveTool(model);
        }
        else if (oldModeIndex === 2) {
            // Leaving queued mode
            pauseQueue(model);
            deactivateMoveTool(model);
        }
        model.selectedMode.set(newModeIndex);
        var id = model.selectedGuestId.get();
        // Enter new mode
        if (newModeIndex === 0) {
            // Uncontrolled — dispose all state, let AI take over
            unfreezeGuest(model);
            clearActions(model);
            model.heldDirection.set(-1);
            if (id !== null) {
                delete guestStates[id];
            }
        }
        else if (newModeIndex === 1) {
            // Direct — activate idle state
            freezeGuest(model);
            if (id !== null) {
                var gs = ensureGuestState(model, id);
                gs.mode = "direct";
            }
        }
        else if (newModeIndex === 2) {
            // Queued — activate paused queue state
            freezeGuest(model);
            model.queuePaused.set(true);
            if (id !== null) {
                var gs = ensureGuestState(model, id);
                gs.mode = "queued";
                gs.queuePaused = true;
            }
        }
        // Refresh guest list to update mode labels in dropdown
        refreshGuestList(model);
    }

    var SPR_PAUSE = 5597;
    var PAUSE_BTN_SIZE = 28;
    var pauseSlotNormal = -1;
    var pauseSlotPressed = -1;
    function initPauseSprites() {
        var range = ui.imageManager.allocate(2);
        if (!range)
            return;
        pauseSlotNormal = range.start;
        pauseSlotPressed = range.start + 1;
        renderPauseSlot(pauseSlotNormal, SPR_PAUSE, [3, 0, 0, 5]);
        renderPauseSlot(pauseSlotPressed, SPR_PAUSE, [3, 2, 0, 5]);
    }
    function renderPauseSlot(slotId, spriteId, clip) {
        var W = PAUSE_BTN_SIZE;
        var H = PAUSE_BTN_SIZE;
        ui.imageManager.draw(slotId, { width: W - 3, height: H - 2 }, function (g) {
            var info = g.getImage(spriteId);
            if (!info)
                return;
            g.clear();
            g.colour = 54;
            g.secondaryColour = 54;
            g.tertiaryColour = 18;
            var cL = clip[0], cT = clip[1], cR = clip[2], cB = clip[3];
            var imgX = Math.floor((W - info.width) / 2 + (cR - cL) / 2) - info.offset.x + 1;
            var imgY = Math.floor((H - info.height) / 2 + (cB - cT) / 2) - info.offset.y - 1;
            g.clip(imgX + info.offset.x + cL, imgY + info.offset.y + cT, info.width - cL - cR, info.height - cT - cB);
            g.image(spriteId, imgX, imgY);
        });
    }
    function getPauseImage(pressed) {
        if (pressed) {
            return pauseSlotPressed >= 0 ? pauseSlotPressed : SPR_PAUSE;
        }
        return pauseSlotNormal >= 0 ? pauseSlotNormal : SPR_PAUSE;
    }

    function peepSelector(model) {
        return i$2({
            text: "Peep",
            content: [
                c$3([
                    c({
                        target: model.guestTarget,
                        height: "130px"
                    }),
                    p$3({
                        width: "24px",
                        content: [
                            r$1({
                                image: "eyedropper",
                                width: "24px",
                                height: "24px",
                                tooltip: "Pick a guest from the park",
                                isPressed: model.pickerActive,
                                onChange: function (pressed) {
                                    if (pressed) {
                                        activatePickerTool(model);
                                    }
                                    else {
                                        deactivatePickerTool(model);
                                    }
                                }
                            }),
                            n$2({
                                image: "locate",
                                width: "24px",
                                height: "24px",
                                tooltip: "Find selected guest",
                                disabled: model.noGuest,
                                onClick: function () {
                                    findGuest(model);
                                }
                            }),
                            n$2({
                                image: 29448, // SPR_G2_PEEP_SPAWN
                                width: "24px",
                                height: "24px",
                                tooltip: "Spawn a new guest",
                                onClick: function () {
                                    saveCurrentGuestState(model);
                                    stopDirectionWalk(model);
                                    deactivateMoveTool(model);
                                    spawnGuest(model);
                                    freezeGuest(model);
                                    syncAccessoriesFromGuest(model);
                                    refreshGuestList(model);
                                }
                            })
                        ]
                    })
                ]),
                c$3([
                    e$2({
                        width: "1w",
                        items: i$4(model.guestList, model.selectedMode, function (list) {
                            var items = ["(none)"];
                            for (var i = 0; i < list.length; i++) {
                                var g = list[i];
                                var gs = guestStates[g.id];
                                var suffix = "";
                                if (gs) {
                                    if (gs.mode === "direct")
                                        suffix = " (dc)";
                                    else if (gs.mode === "queued")
                                        suffix = " (qc)";
                                }
                                items.push(g.name + suffix);
                            }
                            return items;
                        }),
                        selectedIndex: t$3(model.selectedGuestIndex),
                        onChange: function (index) {
                            if (model.isRefreshing)
                                return;
                            var list = model.guestList.get();
                            var newId = (index > 0 && index <= list.length) ? list[index - 1].id : null;
                            saveCurrentGuestState(model);
                            stopDirectionWalk(model);
                            deactivateMoveTool(model);
                            if (newId !== null) {
                                selectGuest(model, newId);
                                loadGuestState(model, newId);
                                refreshQueueList(model);
                            }
                            else {
                                resetState(model);
                            }
                        }
                    }),
                    e$2({
                        width: "90px",
                        items: MODE_LABELS,
                        selectedIndex: model.selectedMode,
                        disabled: model.noGuest,
                        onChange: function (index) {
                            if (model.isRefreshing)
                                return;
                            handleModeChange(model, index);
                        }
                    })
                ])
            ]
        });
    }

    var SPR_DIR_NE = 5635;
    var SPR_DIR_SE = 5636;
    var SPR_DIR_SW = 5637;
    var SPR_DIR_NW = 5638;
    function modeVis(model, targetMode) {
        return i$4(model.selectedMode, function (m) { return (m === targetMode ? "visible" : "none"); });
    }
    function controlTab(model) {
        // Shared visibility stores — one per mode, applied to every leaf control
        // so that OpenRCT2's flat widget list properly hides children.
        var vis0 = modeVis(model, 0);
        var vis1 = modeVis(model, 1);
        var vis2 = modeVis(model, 2);
        return [
            peepSelector(model),
            // ── Uncontrolled mode (0) ──────────────────────────────────────
            o$1({
                text: "Guest is walking freely.",
                height: "40px",
                visibility: vis0
            }),
            // ── Direct control (1) ─────────────────────────────────────────
            i$2({
                text: "Direct Control",
                visibility: vis1,
                content: [
                    r$1({
                        text: "Move To",
                        height: "20px",
                        tooltip: "Click a tile to walk the guest there",
                        isPressed: model.moveToolActive,
                        disabled: model.noGuest,
                        visibility: vis1,
                        onChange: function (pressed) {
                            if (pressed) {
                                activateMoveTool(model);
                            }
                            else {
                                deactivateMoveTool(model);
                            }
                        }
                    }),
                    c$3({
                        padding: { top: "4px", bottom: "4px" },
                        content: [
                            c$3({ width: "1w", content: [] }),
                            p$3([
                                c$3([
                                    n$2({
                                        image: SPR_DIR_NW,
                                        width: "45px",
                                        height: "29px",
                                        isPressed: i$4(model.heldDirection, function (d) { return d === 3; }),
                                        disabled: model.noGuest,
                                        visibility: vis1,
                                        onClick: function () { return startDirectionWalk(model, 3); }
                                    }),
                                    n$2({
                                        image: SPR_DIR_NE,
                                        width: "45px",
                                        height: "29px",
                                        isPressed: i$4(model.heldDirection, function (d) { return d === 0; }),
                                        disabled: model.noGuest,
                                        visibility: vis1,
                                        onClick: function () { return startDirectionWalk(model, 0); }
                                    })
                                ]),
                                c$3([
                                    n$2({
                                        image: SPR_DIR_SW,
                                        width: "45px",
                                        height: "29px",
                                        isPressed: i$4(model.heldDirection, function (d) { return d === 2; }),
                                        disabled: model.noGuest,
                                        visibility: vis1,
                                        onClick: function () { return startDirectionWalk(model, 2); }
                                    }),
                                    n$2({
                                        image: SPR_DIR_SE,
                                        width: "45px",
                                        height: "29px",
                                        isPressed: i$4(model.heldDirection, function (d) { return d === 1; }),
                                        disabled: model.noGuest,
                                        visibility: vis1,
                                        onClick: function () { return startDirectionWalk(model, 1); }
                                    })
                                ])
                            ]),
                            c$3({ width: "1w", content: [] })
                        ]
                    }),
                    r$1({
                        image: i$4(model.guestFrozen, function (f) { return getPauseImage(f); }),
                        width: "28px",
                        height: "28px",
                        border: false,
                        tooltip: "Toggle guest idle",
                        isPressed: model.guestFrozen,
                        disabled: model.noGuest,
                        visibility: vis1,
                        padding: { left: "1w", right: "1w" },
                        onChange: function (pressed) {
                            var guest = getSelectedGuest(model);
                            if (!guest)
                                return;
                            stopDirectionWalk(model);
                            if (pressed) {
                                freezeGuest(model);
                            }
                            else {
                                unfreezeGuest(model);
                            }
                        }
                    }),
                    c$3([
                        e$2({
                            width: "1w",
                            items: model.actionLabels,
                            selectedIndex: model.selectedActionIndex,
                            disabled: model.noGuest,
                            visibility: vis1,
                            onChange: function (index) {
                                model.selectedActionIndex.set(index);
                            }
                        }),
                        n$2({
                            text: "Perform",
                            width: "60px",
                            height: "16px",
                            tooltip: "Perform the selected action",
                            disabled: model.noGuest,
                            visibility: vis1,
                            onClick: function () { return performSelectedAction(model); }
                        })
                    ])
                ]
            }),
            // ── Queued control (2) ─────────────────────────────────────────
            i$2({
                text: "Queued Control",
                visibility: vis2,
                content: [
                    c$3([
                        r$1({
                            image: i$4(model.queuePaused, function (p) { return getPauseImage(p); }),
                            width: "28px",
                            height: "28px",
                            border: false,
                            tooltip: "Play/Pause queue",
                            disabled: model.noGuest,
                            isPressed: model.queuePaused,
                            visibility: vis2,
                            onChange: function (pressed) {
                                if (model.isRefreshing)
                                    return;
                                if (pressed) {
                                    pauseQueue(model);
                                }
                                else {
                                    resumeQueue(model);
                                }
                                refreshQueueList(model);
                            }
                        }),
                        p$3({
                            width: "1w",
                            spacing: "1px",
                            content: [
                                r$2({
                                    text: "Auto-clear",
                                    tooltip: "Remove actions from the list after they complete",
                                    isChecked: i$4(model.keepSteps, function (k) { return !k; }),
                                    visibility: vis2,
                                    onChange: function (checked) {
                                        if (model.isRefreshing)
                                            return;
                                        model.keepSteps.set(!checked);
                                        if (checked) {
                                            model.loopQueue.set(false);
                                        }
                                        syncSettingToGlobal(model);
                                    }
                                }),
                                r$2({
                                    text: "Loop",
                                    tooltip: "Loop the queue when it reaches the end",
                                    isChecked: t$3(model.loopQueue),
                                    disabled: i$4(model.keepSteps, function (k) { return !k; }),
                                    visibility: vis2,
                                    onChange: function () {
                                        if (model.isRefreshing)
                                            return;
                                        syncSettingToGlobal(model);
                                    }
                                })
                            ]
                        }),
                        n$2({
                            text: "Clear",
                            width: "70px",
                            height: "28px",
                            disabled: i$4(model.noGuest, model.queuePaused, function (ng, paused) { return ng || !paused; }),
                            visibility: vis2,
                            onClick: function () {
                                var cell = model.queueSelectedCell.get();
                                if (cell && cell.row >= 0) {
                                    removeAction(model, cell.row);
                                }
                            }
                        }),
                        n$2({
                            text: "Clear All",
                            width: "70px",
                            height: "28px",
                            disabled: model.noGuest,
                            visibility: vis2,
                            onClick: function () {
                                clearActions(model);
                            }
                        })
                    ]),
                    p$1({
                        height: "128px",
                        scrollbars: "vertical",
                        isStriped: true,
                        columns: [
                            { header: "", width: "14px" },
                            { header: "#", width: "20px" },
                            { header: "Action" }
                        ],
                        items: model.queueListItems,
                        canSelect: true,
                        selectedCell: t$3(model.queueSelectedCell),
                        disabled: model.noGuest,
                        visibility: vis2,
                        onClick: function (row) {
                            if (!model.queuePaused.get())
                                return;
                            model.queueSelectedCell.set({ row: row, column: 0 });
                        }
                    }),
                    r$1({
                        text: "+ Move To",
                        height: "20px",
                        isPressed: model.moveToolActive,
                        disabled: model.noGuest,
                        visibility: vis2,
                        onChange: function (pressed) {
                            if (pressed) {
                                activateMoveTool(model);
                            }
                            else {
                                deactivateMoveTool(model);
                            }
                        }
                    }),
                    c$3([
                        e$2({
                            width: "1w",
                            items: model.queueActionLabels,
                            selectedIndex: model.selectedQueueActionIndex,
                            disabled: model.noGuest,
                            visibility: vis2,
                            onChange: function (index) {
                                model.selectedQueueActionIndex.set(index);
                            }
                        }),
                        o$1({
                            text: "for",
                            width: "20px",
                            visibility: vis2
                        }),
                        a$1({
                            width: "55px",
                            value: t$3(model.queueDuration),
                            minimum: 1,
                            maximum: 60,
                            disabled: model.noGuest,
                            visibility: vis2,
                            format: function (v) { return "".concat(v, "s"); }
                        }),
                        n$2({
                            text: "+ Add",
                            width: "60px",
                            height: "18px",
                            disabled: model.noGuest,
                            visibility: vis2,
                            onClick: function () {
                                var anims = model.queueActionAnimations.get();
                                var idx = model.selectedQueueActionIndex.get();
                                if (idx >= 0 && idx < anims.length) {
                                    addAction(model, {
                                        type: "action",
                                        animation: anims[idx],
                                        duration: model.queueDuration.get()
                                    });
                                }
                            }
                        })
                    ])
                ]
            })
        ];
    }

    var ACCESSORY_LABELS = ["None", "Hat", "Sunglasses", "Balloon", "Umbrella"];
    function appearanceTab(model) {
        return [
            peepSelector(model),
            i$2({
                text: "Appearance",
                content: [
                    c$3([
                        o$1({ text: "Shirt colour:", width: "90px" }),
                        e$3({
                            colour: model.shirtColour,
                            disabled: model.noGuest,
                            onChange: function (colour) {
                                var guest = getSelectedGuest(model);
                                if (guest) {
                                    guest.tshirtColour = colour;
                                    model.shirtColour.set(colour);
                                }
                            }
                        })
                    ]),
                    c$3([
                        o$1({ text: "Pants colour:", width: "90px" }),
                        e$3({
                            colour: model.pantsColour,
                            disabled: model.noGuest,
                            onChange: function (colour) {
                                var guest = getSelectedGuest(model);
                                if (guest) {
                                    guest.trousersColour = colour;
                                    model.pantsColour.set(colour);
                                }
                            }
                        })
                    ]),
                    c$3([
                        o$1({ text: "Accessory:", width: "90px" }),
                        e$2({
                            width: "110px",
                            items: ACCESSORY_LABELS,
                            selectedIndex: model.accessoryIndex,
                            disabled: model.noGuest,
                            onChange: function (index) {
                                model.accessoryIndex.set(index);
                                var type = ACCESSORY_TYPES[index];
                                if (type && COLOUR_ACCESSORIES[type]) {
                                    setAccessory(model, type);
                                    model.accessoryColour.set(DEFAULT_COLOURS[type]);
                                    setAccessoryColour(model, DEFAULT_COLOURS[type]);
                                }
                                else {
                                    setAccessory(model, type);
                                }
                            }
                        }),
                        e$3({
                            colour: model.accessoryColour,
                            visibility: i$4(model.accessoryIndex, function (idx) {
                                var type = ACCESSORY_TYPES[idx];
                                return (type && COLOUR_ACCESSORIES[type] ? "visible" : "hidden");
                            }),
                            disabled: model.noGuest,
                            onChange: function (colour) {
                                setAccessoryColour(model, colour);
                            }
                        })
                    ])
                ]
            })
        ];
    }

    var STORAGE_KEY = "peepsim.state";
    function savePluginState() {
        var guests = {};
        var ids = Object.keys(guestStates);
        for (var j = 0; j < ids.length; j++) {
            var gid = parseInt(ids[j], 10);
            if (isNaN(gid))
                continue;
            var gs = guestStates[gid];
            if (!gs)
                continue;
            // Verify guest still exists
            var entity = map.getEntity(gid);
            if (!entity || entity.type !== "guest")
                continue;
            guests[String(gid)] = {
                mode: gs.mode,
                actionQueue: gs.actionQueue.slice(),
                currentAction: gs.currentAction,
                queuePaused: gs.queuePaused,
                queueExecutingIndex: gs.queueExecutingIndex,
                keepSteps: gs.keepSteps,
                loopQueue: gs.loopQueue,
                moveTickCount: gs.moveTickCount,
                lastMoveDist: gs.lastMoveDist,
                actionTickCount: gs.actionTickCount
            };
        }
        var state = {
            version: 1,
            guests: guests
        };
        context.getParkStorage().set(STORAGE_KEY, state);
    }
    /** Load guestStates from park storage into the global singleton. */
    function loadPluginState() {
        var raw = context.getParkStorage().get(STORAGE_KEY);
        if (!raw || !raw.guests)
            return;
        resetGuestStates();
        var keys = Object.keys(raw.guests);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var id = parseInt(key, 10);
            if (isNaN(id))
                continue;
            // Verify guest still exists
            var entity = map.getEntity(id);
            if (!entity || entity.type !== "guest")
                continue;
            var saved = raw.guests[key];
            var gs = createGuestState();
            if (saved.mode === "direct")
                gs.mode = "direct";
            else if (saved.mode === "queued")
                gs.mode = "queued";
            else
                gs.mode = "uncontrolled";
            if (saved.actionQueue && Array.isArray(saved.actionQueue)) {
                gs.actionQueue = saved.actionQueue;
            }
            gs.currentAction = saved.currentAction || null;
            gs.queuePaused = saved.queuePaused !== false;
            gs.queueExecutingIndex = typeof saved.queueExecutingIndex === "number" ? saved.queueExecutingIndex : -1;
            gs.keepSteps = saved.keepSteps === true;
            gs.loopQueue = saved.loopQueue === true;
            gs.moveTickCount = saved.moveTickCount || 0;
            gs.lastMoveDist = typeof saved.lastMoveDist === "number" ? saved.lastMoveDist : -1;
            gs.actionTickCount = saved.actionTickCount || 0;
            guestStates[id] = gs;
            // Re-freeze guests that were in direct or queued mode
            if (gs.mode === "direct" || gs.mode === "queued") {
                var guest = entity;
                guest.setFlag("positionFrozen", true);
                guest.animation = "watchRide";
                guest.animationOffset = 0;
            }
        }
    }

    var GUEST_REFRESH_INTERVAL = 80;
    function createPeepSimWindow(model) {
        initPauseSprites();
        return v$1({
            title: "PeepSim",
            width: 300,
            height: "auto",
            padding: 5,
            colours: [r.Grey, r.OliveGreen, r.OliveGreen],
            onOpen: function () {
                setUIModel(model);
                model.guestRefreshCounter = 0;
                resetState(model);
                refreshGuestList(model);
            },
            onUpdate: function () {
                enforceAccessories(model);
                // Sync executor changes → UI for selected guest
                syncFromGlobalState(model);
                model.guestRefreshCounter++;
                if (model.guestRefreshCounter >= GUEST_REFRESH_INTERVAL) {
                    model.guestRefreshCounter = 0;
                    refreshGuestList(model);
                }
                syncAppearanceFromGuest(model);
            },
            onClose: function () {
                stopDirectionWalk(model);
                deactivatePickerTool(model);
                if (model.actionPlayInterval !== null) {
                    context.clearInterval(model.actionPlayInterval);
                    model.actionPlayInterval = null;
                }
                if (ui.tool) {
                    ui.tool.cancel();
                }
                // Save UI state back to global guestStates, then reset
                saveCurrentGuestState(model);
                savePluginState();
                resetState(model);
                setUIModel(null);
            },
            onTabChange: function () {
                refreshGuestList(model);
                refreshActionAnimations(model);
                refreshQueueList(model);
            },
            tabs: [
                e$5({
                    image: 5577,
                    height: "auto",
                    content: controlTab(model)
                }),
                e$5({
                    image: { frameBase: 5221, frameCount: 8, frameDuration: 4 },
                    height: "auto",
                    content: appearanceTab(model)
                })
            ]
        });
    }

    var PLUGIN_VERSION = "0.3.0";
    // Shared model instance — survives window close/reopen
    var sharedModel = null;
    function getSharedModel() {
        if (!sharedModel) {
            sharedModel = new PeepSimModel();
        }
        return sharedModel;
    }
    function main() {
        if (typeof ui !== "undefined") {
            ui.registerMenuItem("PeepSim", function () {
                var model = getSharedModel();
                createPeepSimWindow(model).open();
            });
        }
        // Load guest states + freeze controlled guests on park load.
        loadPluginState();
        startGlobalExecutor();
        context.subscribe("map.changed", function () {
            loadPluginState();
            // Retry a few ticks later in case entities aren't ready yet
            var retries = 5;
            var sub = context.subscribe("interval.tick", function () {
                retries--;
                loadPluginState();
                if (retries <= 0) {
                    sub.dispose();
                }
            });
        });
        context.subscribe("map.save", function () {
            if (sharedModel) {
                saveCurrentGuestState(sharedModel);
            }
            savePluginState();
        });
        console.log("[peepsim] loaded v".concat(PLUGIN_VERSION));
    }
    registerPlugin({
        name: "openrct2-plugin-peepsim",
        version: PLUGIN_VERSION,
        licence: "MIT",
        authors: ["rinode"],
        type: "local",
        targetApiVersion: 77,
        main: main
    });

    exports.getSharedModel = getSharedModel;

    return exports;

})({});
