(function () {
    'use strict';

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var n$c=function(r,o){return n$c=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(n,r){n.__proto__=r;}||function(n,r){for(var o in r)Object.prototype.hasOwnProperty.call(r,o)&&(n[o]=r[o]);},n$c(r,o)};function r$d(r,o){if('function'!=typeof o&&null!==o)throw new TypeError('Class extends value '+o+' is not a constructor or null');function t(){this.constructor=r;}n$c(r,o),r.prototype=null===o?Object.create(o):(t.prototype=o.prototype,new t);}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function n$b(n){return void 0===n}function r$c(n){return null===n}function t$b(t){return n$b(t)||r$c(t)}function u$7(n){return Array.isArray(n)}function o$b(n){return f$8(n,'function')}function e$7(n){return f$8(n,'number')}function i$7(n){return f$8(n,'object')}function c$6(n){return f$8(n,'string')}function f$8(n,r){return typeof n===r}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var o$a='open',e$6='redraw',r$b='update',p$8=5,m$3=[4,0],a$7=[1,2],f$7=[0,0],n$a={top:f$7,right:f$7,bottom:f$7,left:f$7};function u$6(o){n$b(o.height)&&(o.height=14);}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var t$a=Math.floor(1048575*Math.random())<<10;function r$a(){return (t$a++).toString(36)}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function n$9(n,r){return n.subscribe(r)}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var t$9=function(t,i,r,o){this.Ia=t,this.Ja=i,this.Ka=r,this.La=n$9(i,o);};

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function i$6(i){if(!i||!i$7(i))return  false;var n=i;return o$b(n.get)&&o$b(n.subscribe)}function n$8(n){return !(!n||!i$7(n))&&i$6(n)&&o$b(n.set)}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function o$9(o){return !(!o||!i$7(o))&&n$8(o.twoway)}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function r$9(r){return o$9(r)?r.twoway:r}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var r$8=function(){function r(){this.Ma=[],this.za=null;}return r.prototype.add=function(i,t,n,o){this.on(i,n,(function(i,n){var r=o?o(n):n;i[t]=r;}));},r.prototype.callback=function(t,n,o,r,s){o$9(o)?t[n]=function(i,t){var n=s?s(i,t):i;o.twoway.set(n),r&&r(n);}:r&&(t[n]=s?function(i,t){return r(s(i,t))}:r);},r.prototype.twoway=function(i,t,n,o,r){this.add(i,t,o),this.callback(i,n,o,r);},r.prototype.on=function(i,r,s){var u=r$9(r);if(i$6(u)){var f=this.Aa(i,u,s);this.Ma.push(f),s(i,u.get());}else n$b(u)||s(i,u);},r.prototype.Na=function(){this.za=null;},r.prototype.Oa=function(){return this.Ma.length>0},r}();

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var t$8=function(r){function t(){return null!==r&&r.apply(this,arguments)||this}return r$d(t,r),t.prototype.ya=function(i){var n=i.ga;n&&this.Ba(n),this.za=i;},t.prototype.Aa=function(i,r,t){var o=this;return new t$9('',r,t,(function(i){var n=o.za;n&&n.ua&&t(n.ua,i);}))},t.prototype.Ba=function(i){var n=this.Ma;if(n)for(var r=0,t=n;r<t.length;r++){var o=t[r];o.Ka(i,o.Ja.get());}},t}(r$8);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function r$7(r,n){n||(n={});for(var o=0,t=r;o<t.length;o++){var a=t[o],e=a.name;e&&!(e in n)&&(n[e]=a);}return n}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function n$7(n){return u$5(n,0)}function r$6(n){return u$5(n,1)}function t$7(n){return u$5(n,2)}function u$5(n,r){return n[1]===r}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function o$8(o){throw Error(o)}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function n$6(t){if(n$b(t))return t;if(e$7(t))return [t,0];var n=t.trim(),o=n.length;if(o>1){var u=o-1,s=void 0,a=n[u];if('w'===a?s=2:'%'===a?s=1:o>2&&(u--,'x'===a&&'p'===n[u]&&(s=0)),!n$b(s))return [parseFloat(n.substring(0,u)),s]}o$8('Value \''+t+'\' is not a valid scale.');}function o$7(t,r){return n$6(t)||r}function u$4(r){return o$7(r,f$7)}function s$3(t,r,e,i){switch(t[1]){case 2:return (e?t[0]/e:1)*r*(100-i)*.01;case 1:return .01*t[0]*r;default:return t[0]}}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var e$5=['y','x'],a$6=['height','width'],u$3=['top','left'],s$2=['bottom','right'];function p$7(t,o,i){var a=o[u$3[i]],p=o[s$2[i]];return n$7(a)&&n$7(p)||o$8('Window padding must be absolute for "auto" window size.'),t[e$5[i]]+=a[0],a[0]+p[0]}function f$6(r,t,o,i){m$2(r,1,t,i),m$2(r,0,o,i);}function m$2(n,e,p,f){var m=a$6[e],g=f[u$3[e]],d=f[s$2[e]],v=n[m]-l$4(p,g,d,n$7),h=l$4(p,g,d,r$6),w=l$4(p,g,d,t$7),b=s$3(p,v,w,h);return n[m]=b,c$5(n,e,f,v,w,h)}function c$5(r,t,o,n,p,f){return function(r,t,o,n,e,a,u,s,p){var f=s$3(t[s],o,n,e),m=s$3(t[p],o,n,e);return r[a]+=f,f+r[u]+m}(r,o,n,p,f,e$5[t],a$6[t],u$3[t],s$2[t])}function l$4(r,t,o,i){var n=0;return i(r)&&(n+=r[0]),i(t)&&(n+=t[0]),i(o)&&(n+=o[0]),n}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var a$5='inherit',s$1='auto',u$2=['minHeight','minWidth'],f$5=['maxHeight','maxWidth'];function p$6(i,t,r,e){return r!=a$5?i$7(r)?r.value:r:l$3(i,t,e)}function l$3(i,t,r){if(c$6(r))return s$1;var e=r,o=e.value||r;return g(i,t,o,e.min||o,e.max||o),o}function d$1(n,m,a,s,u){var f=a$6[m],p=s[u$3[m]],l=s[s$2[m]],d=a[f]+p[0]+l[0]+u;return n$7(p)&&n$7(l)||o$8('Padding for '+f+' must be absolute for auto window resize.'),g(n,m,d,d,d),d}function g(i,t,e,o,n){i[a$6[t]]=e,i[u$2[t]]=o,i[f$5[t]]=n;}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var o$6=15,u$1=function(){function o(s){var n=this,h=s.width,o=s.height,u=s.position,f=new t$8,e={classification:'fui-'+r$a(),title:'',colours:s.colours,onUpdate:function(){n.ha(),n.c((function(i){return i.update()}));},onClose:function(){n.m();}},c=l$3(e,1,h),l=l$3(e,0,o);this.qa(c,l),f.add(e,'title',s.title),this.ea=f.Oa()?f:null,this.fa=u,this.ga=e;}return o.prototype.ha=function(){var i=this.ua,t=this.t,s=this.w;if(i&&t){if(!(4&s)){var n=i.width,h=i.height,r=2&s||this.ra==n,o=1&s||this.sa==h;if(r&&o)return;this.ra=n,this.sa=h;}this.d(i,t),this.w&=-5;}},o.prototype.ma=function(i,t){return {x:0,y:t,width:2&i?s$1:this.ra,height:1&i?s$1:this.sa-t}},o.prototype.na=function(i,t,s,n){var r=this.w;2&r&&(this.ra=d$1(i,1,t,n,0)),1&r&&(this.sa=d$1(i,0,t,n,s));},o.prototype.qa=function(i,t){var s=this.w;i==s$1?s|=2:(s&=-3,this.ra=i),t==s$1?s|=1:(s&=-2,this.sa=t),this.w=s;},o.prototype.l=function(i,t){this.d(i,this.a),function(i,t){t&&'default'!==t&&('center'===t?(i.x=ui.width/2-i.width/2,i.y=ui.height/2-i.height/2):(i.x=t.x,i.y=t.y));}(i,this.fa),t&&t.ya(this);var n=ui.openWindow(i),h=r$7(n.widgets);this.ua=n,this.t=h,this.c((function(i){return i.open(n,h)}));},o.prototype.m=function(){this.c((function(i){return i.close()}));var i=this.ea;i&&i.Na(),this.ua=null,this.t=null;},o.prototype.open=function(){if(this.ua)this.focus();else {var i=this.ga,t=this.ea;this.l(i,t);}},o.prototype.close=function(){this.ua&&this.ua.close();},o.prototype.focus=function(){this.ua&&this.ua.bringToFront();},o.prototype.redraw=function(){this.w|=4;},o}();

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var t$6=function(t,i){this.position=t.parse(i),this.xa=t;};

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function f$4(r){return (c$4(r.width)?1:0)|(c$4(r.height)?2:0)}function c$4(r){return n$b(r)||r===s$1}function m$1(r,n,t){return a$4(r,n,(function(r){return function(r,n){var t=r[a$6[n]],u=r.padding,f=u[u$3[n]],c=u[s$2[n]];return s(t,f,c)?t[0]+f[0]+c[0]:null}(t,r)}))}function p$5(n,t,u,f,c){return a$4(n,t,(function(n){return function(n,t,u,f){var c,m,p=u===f,a=0;if(p&&!n$7(t))return null;for(var l=a$6[f],v=u$3[f],d=s$2[f],j=-1,w=0,g=n;w<g.length;w++){var H=g[w],x=H.position,y=x[l],S=x.padding,b=S[v],h=S[d];if(!s(y,b,h))return null;H.skip||(c=a,m=y[0]+b[0]+h[0],a=p?c+m:c<m?m:c,j++);}return p&&(a+=t[0]*j),a}(u,f,c,n)}))}function a$4(r,n,t){return !!(3&n&&l$2(r,1&n,1,t)|l$2(r,2&n,0,t))}function l$2(n,u,o,e){var f;if(u&&!r$c(f=e(o))){var c=a$6[o],m=n[c];if(m[0]!==f||!n$7(m))return n[c]=[f,0],1}return 0}function s(n,t,u){return n$7(n)&&n$7(t)&&n$7(u)}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function f$3(r,e,a,f,d){var v=r.length;if(v)for(var u=1==a?0:1,_=function(r,e,a,i){var t=r.length,n={S:Array(t),H:0,T:0,D:0};l$1(e,n,t-1);for(var s=0;s<t;s++){var f=r[s],d=f.padding,v={R:f[a$6[a]],rr:f[a$6[i]],h:d};n.S[s]=v;var u=v.R,_=v.h[u$3[a]],c=v.h[s$2[a]];l$1(u,n,1),l$1(_,n,1),l$1(c,n,1);}return n}(r,f,a,u),c=e[a$6[a]]-_.H,g=_.D,S=_.T,j=s$3(f,c,g,S),q=0,h=0;h<v;h++){var x=_.S[h],z=q+e[e$5[a]],P=s$3(x.R,c,g,S),y=x.h,A={};A[e$5[a]]=z,A[a$6[a]]=P,A[e$5[u]]=e[e$5[u]],A[a$6[u]]=e[a$6[u]],q+=c$5(A,a,y,c,g,S),m$2(A,u,x.rr,y),d(h,A),q+=j;}}function l$1(i,o,t){var n=i[0]*t;t$7(i)?o.D+=n:n$7(i)?o.H+=n:r$6(i)&&(o.T+=n);}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function f$2(l,f){var u;if(f||(f=n$a),n$b(l))u=l;else if(u$7(l)){var g=l.length;if(2===g){var c=u$4(l[0]),d=u$4(l[1]);u=p$4(c,d,c,d);}else 4===g?u=p$4(u$4(l[0]),u$4(l[1]),u$4(l[2]),u$4(l[3])):o$8('Padding array of unknown length: '+g+'. Only lengths of 2 or 4 are supported.');}else if(i$7(l))u=p$4(a$3(u$3[0],l,f),a$3(s$2[1],l,f),a$3(s$2[0],l,f),a$3(u$3[1],l,f));else {var j=u$4(l);u=p$4(j,j,j,j);}return u||f}function a$3(e,r,t){var o=r[e];return o$7(n$b(o)?r.rest:o,t[e])}function p$4(e,r,t,o){return {top:e,right:r,bottom:t,left:o}}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function t$5(t,n){return {width:o$7(t.width,a$7),height:o$7(t.height,a$7),padding:f$2(t.padding,n)}}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function c$3(t){return t.direction=1,l(t)}function p$3(t){return t.direction=0,l(t)}function l(t){return function(r,i){return new h(r,i,t)}}var h=function(o){function c(t,s,f){var c=o.call(this,t,f)||this;c.parse=t$5,c.L=f.direction||0,c.M=n$6(f.spacing)||m$3;for(var p=f$4(f),l=u$7(f)?f:f.content,h=l.length,j=Array(h),v=0;v<h;v++){var b=l[v];j[v]=b(c,s);}return c.w=4|p,c.v=j,s.on(e$6,(function(){var t=c.w;if(4&t){c.w&=-5;var r=c.v,i=r.filter((function(t){return !t.skip}));p$5(c.position,t,r,c.M,c.L),c.N=i,c.O=i.map((function(t){return t.position}));}})),c}return r$d(c,o),c.prototype.recalculate=function(){this.w|=4,3&this.w&&this.xa.recalculate();},c.prototype.layout=function(t,r){var i=this;f$3(this.O,r,this.L,this.M,(function(r,o){i.N[r].layout(t,o);}));},c}(t$6);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var o$5=function(t){function o(){return null!==t&&t.apply(this,arguments)||this}return r$d(o,t),o.prototype.ya=function(i){var r=i.Fa;r&&this.Ba(r),this.za=i;},o.prototype.Aa=function(i,t,o){var s=this,e=i.name||(i.name=r$a());return new t$9(e,t,o,(function(i){var r=s.za;if(r&&r.isOpen()){var n=r.getWidget(e);n&&o(n,i);}}))},o.prototype.Ba=function(i){var r=this.Ma;if(r)for(var n=0,t=r;n<t.length;n++){var o=t[n];o.Ka(i[o.Ia],o.Ja.get());}},o}(r$8);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function o$4(o,r){for(var f=0,n=o.length;f<n;f++)o[f](r);}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var f$1=function(){function i(t,i,s,n,o,r,h){this.width=t,this.height=i,this.xa=s,this.l=n,this.Ca=o,this.Da=r,this.m=h,this.recalculate=this.redraw;}return i.prototype.layout=function(t,i){o$4(this.Da,this);var s=this.j,n=s.position,o=p$2(t,this.width,n,1),r=p$2(t,this.height,n,0);return s.layout(i,t),{width:o,height:r}},i.prototype.redraw=function(){this.Fa&&this.xa.redraw();},i.prototype.parse=function(i){return {width:a$7,height:a$7,h:f$2(i.padding)}},i.prototype.getWidget=function(t){var i,s=this.Fa;return s&&(i=s[t]),i||null},i.prototype.isOpen=function(){return !!this.Fa},i.prototype.open=function(t,i){l$3(t,1,this.width),l$3(t,0,this.height),this.Fa=i;var s=this.B;s&&s.ya(this),o$4(this.l,this);},i.prototype.update=function(){o$4(this.Ca,this);},i.prototype.close=function(){o$4(this.m,this);var t=this.B;t&&t.Na(),this.Fa=void 0;},i}();function p$2(t,o,h,m){var f=a$6[m],p=t[f],l=h[f],d=h.h,c=o==a$5;return c&&p==s$1||o==s$1?(n$7(l)||o$8('Window body '+f+' must resolve to absolute size for "auto" window size.'),l[0]+p$7(t,d,m)):(m$2(t,m,l,d),c?p:l[0])}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var r$5=function(){function r(r,s,o){this.va=[];var m=[],f=[],h$1=[],l=[],u=new f$1(o.width||a$5,o.height||a$5,r,m,f,h$1,l),p=new o$5,w=s.onOpen,a=s.onUpdate,c=s.onClose;this.open=m,this.update=f,this.redraw=h$1,this.close=l,this.binder=p,this.context=u,u.j=new h(u,this,o),u.B=p.Oa()?p:null,w&&m.push(w),a&&f.push(a),c&&l.push(c);}return r.prototype.add=function(i){this.va.push(i);},r.prototype.on=function(i,t){this[i].push(t);},r}();

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function n$5(){}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function v$1(t){return new d(t)}var d=function(o){function n(t){var s,r=o.call(this,t)||this,n=r.ga,f={},a=t.width,c=t.height,l=t.tabs,v=t.padding,d=t.startingTab||0,j=t.static;if(j){var w=new r$5(r,t,j),g=w.va;n.widgets=g,r$7(g,f),s=w.context,r.w|=16;}else s={open:t.onOpen||n$5,update:t.onUpdate||n$5,close:t.onClose||n$5};r.e=s,r.f=a,r.g=c,r.h=f$2(n$b(v)?p$8:v);for(var y=l.length,b=Array(y),A=Array(y),H=0;H<y;H++){var x={image:16};b[H]=l[H](r,x),A[H]=x;var B=x.widgets;B&&r$7(B,f);}return n.tabs=A,n.tabIndex=d,n.onTabChange=function(){return r.r()},r.a=f,r.i=b,r.s=d,r.k=t.onTabChange,r.w|=y>0?8:0,r}return r$d(n,o),n.prototype.l=function(t,i){8&this.w&&this.o(t,this.u()),o.prototype.l.call(this,t,i);},n.prototype.m=function(){o.prototype.m.call(this),this.s=this.ga.tabIndex||0;},n.prototype.c=function(t){t(this.e),8&this.w&&t(this.u());},n.prototype.o=function(t,i){var s=p$6(t,1,i.width,this.f),r=p$6(t,0,i.height,this.g);this.qa(s,r);},n.prototype.d=function(t,i){8&this.w&&this.p(this.u(),t,i),this.q(i);},n.prototype.p=function(t,i,s){var r=this.ma(this.w,44),o=this.h;j(r,o,1),j(r,o,0);var n=t.layout(r,s);this.na(i,n,44,o);},n.prototype.q=function(t){if(16&this.w){var i=this.ma(0,o$6),o=this.h;m$2(i,1,a$7,o),m$2(i,0,a$7,o),this.e.layout(i,t);}},n.prototype.r=function(){var t=this.ua;if(t){var i=r$7(t.widgets),s=t.tabIndex;this.u().close(),this.s=s,this.t=i;var r=this.u(),o=this.k;this.o(t,r),this.p(r,t,i),this.q(i),r.open(t,i),o&&o(s);}},n.prototype.u=function(){return this.i[this.s]},n}(u$1);function j(t,i,h){t[a$6[h]]==s$1?p$7(t,i,h):m$2(t,h,a$7,i);}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function e$4(e){return function(n,t){var f=new r$5(n,e,e);return t.image=e.image,t.widgets=f.va,f.context}}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var i$5=function(){function i(t){this.U=t;}return i.prototype.get=function(){return this.U},i.prototype.subscribe=function(t){this.Ga?this.Ga.push(t):this.Ga=[t];var i=this.Ga;return function(){var n=i.indexOf(t);-1!==n&&i.splice(n,1);}},i.prototype.Ha=function(i){this.Ga&&o$4(this.Ga,i);},i}();

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var o$3=function(i){function o(){return null!==i&&i.apply(this,arguments)||this}return r$d(o,i),o.prototype.set=function(t){this.U!==t&&(this.U=t,this.Ha(t));},o}(i$5);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function t$4(t){return new o$3(t)}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function o$2(o){return i$6(o)?o.get():o}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var r$4=Array.prototype.slice;

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function i$4(){for(var i=arguments,e=r$4.call(i,0,-1),u=e.length,m=i[u],f=t$4(n$4(e,m)),a=0;a<u;)n$9(e[a++],(function(){var r=n$4(e,m);return f.set(r)}));return f}function n$4(r,t){var o=r.map((function(r){return r.get()}));return t.apply(void 0,o)}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function t$3(t){return {twoway:t}}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function r$3(r,t){i$6(r)?(n$9(r,t),t(r.get())):n$b(r)||t(r);}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function n$3(n,r,t){return n<r?n=r:n>t&&(n=t),n}function r$2(n,r,t){return n<r?n=t:n>t&&(n=r),n}var t$2=Math.round;

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function i$3(i,m,o){var r=i[m];r.x=t$2(o.x),r.y=t$2(o.y),r.width=t$2(o.width-.1),r.height=t$2(o.height-.1);}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var n$2=function(s){function n(i,r,n,e){var m=s.call(this,r,e)||this;m.name=r$a(),m.type=i,m.x=m.y=m.width=m.height=0;var l=n.binder,u=n.context,f=e.visibility;return l.add(m,'tooltip',e.tooltip),l.add(m,'isDisabled',e.disabled),l.add(m,'isVisible',f,(function(i){return 'visible'===i})),r$3(f,(function(i){var t=m.skip,o='none'===i;m.skip=o,(t||o)&&(r.recalculate(),u.redraw());})),n.add(m),m}return r$d(n,s),n.prototype.layout=function(i,t){i$3(i,this.name,t);},n}(t$6);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function a$2(t){return function(i,r){return new f(i,r,t)}}var f=function(m){function a(t,i,n){var e,a=this,f='groupbox',u='content',l=f$4(n);if(u in n){a=m.call(this,f,t,i,n)||this,e=n[u];var p=i.binder,c=n.text;p.add(a,'text',c),l|=c?8:0;}else a=m.call(this,f,t,i,{})||this,e=n;a.w=4|l;var h=e(a,i);return a.z=h,i.on(e$6,(function(){4&a.w&&(a.w&=-5,m$1(a.position,a.w,a.z.position));})),a}return r$d(a,m),a.prototype.parse=function(t){var r=f$2(6);return 8&this.w&&(r.top=[15,0]),t$5(t,r)},a.prototype.recalculate=function(){this.w|=4,3&this.w&&this.xa.recalculate();},a.prototype.layout=function(t,i){var r=8&this.w?0:4;i.y-=r,i.height+=r,m.prototype.layout.call(this,t,i),i.y+=r,i.height-=r;var o=this.z,s=o.position;f$6(i,s.width,s.height,s.padding),o.layout(t,i);},a}(n$2);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function n$1(t){return function(r,n){return new o$1(r,n,t)}}var o$1=function(r){function n(t,n,o){var e=r.call(this,'button',t,n,o)||this,i=n.binder;return i.add(e,'text',o.text),i.add(e,'image',o.image),i.add(e,'border',o.border),i.add(e,'isPressed',o.isPressed),e.onClick=o.onClick,e}return r$d(n,r),n}(n$2);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function n(n,t,o){return t?function(u){n.E||(o?o(u,t):t(u));}:t}function t$1(n,t,o,u){n.E=true,t[o]=u,n.E=false;}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function e$3(t){return n$b(t.width)&&(t.width=12),n$b(t.height)&&(t.height=12),function(o,r){return new u(o,r,t)}}var u=function(i){function n$1(t,n$1,e){var u=i.call(this,'colourpicker',t,n$1,e)||this,s=e.colour,m=n$1.binder;return m.on(u,s,(function(t,r){t$1(u,t,'colour',r);})),m.callback(u,'onChange',s,n(u,e.onChange)),u}return r$d(n$1,i),n$1.prototype.layout=function(t,o){o.y+=1,i.prototype.layout.call(this,t,o);},n$1}(n$2);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function e$2(t){return u$6(t),function(n,i){return new m(n,i,t)}}var m=function(o){function s(t,s,e){var m=o.call(this,'dropdown',t,s,e)||this;m.items=[],m.selectedIndex=0;var f,u=e.items,c=e.disabled,a=e.disabledMessage,h=e.onChange,p='empty'===(f=e.autoDisable)?0:'single'===f?1:-1,d=e.selectedIndex,l=function(t){m.C(t,o$2(u),o$2(c),p,a);},v=s.binder,j=l;i$6(u)&&(j=function(t,n){l(t),m.F(t,n),m.A=n;}),v.on(m,u,j),v.on(m,d,(function(t,n){m.G=n,l(t);})),v.on(m,c,l);var b=n(m,h,(function(t,n){return n(t<0?0:t)}));return v.callback(m,'onChange',d,b),m}return r$d(s,o),s.prototype.C=function(t,n,i,r,o){this.E=true;var s=i||!n||n.length<=r;s&&o?t.items=[o]:(t.items=n,t.selectedIndex=this.G||0),t.isDisabled=s,this.E=false;},s.prototype.F=function(t,n){var i=this.A;if(i){var r=i[t.selectedIndex||0],o=n.indexOf(r);o<0&&(o=0),this.G!==o&&(this.G=o,t.selectedIndex=o);}},s}(n$2);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function e$1(e){if(i$6(e)){var m=t$4(e.get());return n$9(e,(function(r){return m.set(r)})),m}return t$4(e)}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function t(t,s){return o$9(t)?t:t$3(e$1(t||s))}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function a$1(t){return u$6(t),function(r,i){return new c$2(r,i,t)}}var c$2=function(e){function f(t,m,u){var f=e.call(this,'spinner',t,m,u)||this;f.V=1,f.W=-2147483648,f.X=2147483647;var a=u.value,c=o$9(a)?a.twoway:e$1(a||0),p=u.format||function(t){return t.toString()},h=m.binder,l=u.disabledMessage,j=u.minimum,v=u.maximum;if(l){var d=u.disabled;h.add(f,'text',d,(function(t){return t?l:p(c.get())}));var g=p;p=function(t){return o$2(d)?l:g(t)};}return f.U=c,h.add(f,'text',c,p),r$3(u.step,(function(t){return f.V=t})),r$3(j,(function(t){var r=c.get();f.W=t,r<t&&f._(t,t-r);})),r$3(v,(function(t){var r=c.get();f.X=t,r>t&&f._(t,t-r);})),f.Y=u.wrapMode||'clamp',f.Z=u.onChange,f.onIncrement=function(){return f.$(1)},f.onDecrement=function(){return f.$(-1)},f.W>f.X&&o$8('Spinner: minimum '+f.W+' is larger than maximum '+f.X),f}return r$d(f,e),f.prototype.$=function(t){var r=this.W,i=this.X;if(!(r>=i)){var n,o=this.V*t,s=this.U.get(),e=s+o,f=this.Y;n='wrap'===f||'clampThenWrap'===f&&(e<r&&s===r||e>i&&s===i)?r$2(e,r,i):n$3(e,r,i),this._(n,o);}},f.prototype._=function(t,r){this.U.set(t),this.Z&&this.Z(t,r);},f}(n$2);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function i$2(i){var r,o,f$1,m=0;if('content'in i){r=i.content,o=i.gap,f$1=i.spacing;var u=i.direction;n$b(u)||(m=u);}else r=i;var c=i,l={content:r,direction:m,spacing:f$1,padding:o};return c.content=function(n,e){return new h(n,e,l)},function(n,t){return new f(n,t,c)}}

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function o(t){return u$6(t),function(n,r){return new i$1(n,r,t)}}var i$1=function(n){function r(t,r,o){var i=n.call(this,'label',t,r,o)||this;i.text='';var e=r.binder;return e.add(i,'text',o.text),e.add(i,'textAlign',o.alignment),i}return r$d(r,n),r.prototype.layout=function(t,r){r.y+=2,n.prototype.layout.call(this,t,r);},r}(n$2);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function p$1(r){return function(t,i){return new c$1(t,i,r)}}var c$1=function(l){function p(r,n,a){var p=l.call(this,'listview',r,n,a)||this,c=a.selectedCell,h=a.onClick,d=n.binder;d.add(p,'items',a.items),d.add(p,'selectedCell',c),d.callback(p,'onClick',c,h&&function(r){r&&h(r.row,r.column);},(function(r,i){var o=o$2(p.P);return o&&o.row==r&&o.column==i?o:{row:r,column:i}})),p.showColumnHeaders=!n$b(a.columns),p.scrollbars=a.scrollbars,p.canSelect=a.canSelect,p.isStriped=a.isStriped,p.onHighlight=a.onHighlight,p.P=r$9(c);var v=a.columns;if(p.columns=v,!v)return p;for(var j,w,b,g=v.length,y=Array(g),x=-1,C=false,k=0;k<g;k++){if(j=v[k],c$6(j))v[k]={header:j},w=a$7;else {var A=j.tooltip,L=j.ratioWidth,S=j.width;w=n$b(S)&&!n$b(L)?[L,2]:o$7(S,a$7),A&&(j.headerTooltip=A);}b=w[1],y[k]=w,C||(C=x!=b&&-1!=x),x=b;}if(C||1==x)return p.Q=y.map((function(r){return {width:r,height:f$7,padding:n$a}})),p;for(k=0;k<g;k++){var _=v[k];S=y[k],0==x?_.width=S[0]:(_.width=void 0,_.ratioWidth=S[0]);}return p}return r$d(p,l),p.prototype.layout=function(r,t){var i=this,o=this.Q;if(o){var s=r[this.name];this.Q&&s.width!==t.width&&(f$3(o,t,1,f$7,(function(r,t){i.columns[r].width=t$2(t.width);})),s.columns=this.columns,s.width=t.width),s.x=t.x,s.y=t.y,s.height=t.height;}else l.prototype.layout.call(this,r,t);},p}(n$2);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    function r$1(n){return function(t,o){return new i(t,o,n)}}var i=function(o){function r(n,r,i){var u,e=t(i.isPressed,false),m=e.twoway;return i.isPressed=e,u=o.call(this,n,r,i)||this,r.binder.callback(u,'onClick',e,i.onChange,(function(){return !m.get()})),u}return r$d(r,o),r}(o$1);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var e;!function(e){e[e.Gridlines=128]='Gridlines',e[e.UndergroundInside=1]='UndergroundInside',e[e.HideBase=4096]='HideBase',e[e.HideVertical=8192]='HideVertical',e[e.SoundOn=1024]='SoundOn',e[e.LandOwnership=256]='LandOwnership',e[e.ConstructionRights=512]='ConstructionRights',e[e.InvisibleEntities=16384]='InvisibleEntities',e[e.ClipView=131072]='ClipView',e[e.HighlightPathIssues=262144]='HighlightPathIssues',e[e.TransparentBackground=524288]='TransparentBackground',e[e.LandHeights=16]='LandHeights',e[e.TrackHeights=32]='TrackHeights',e[e.PathHeights=64]='PathHeights',e[e.SeeThroughRides=2]='SeeThroughRides',e[e.SeeThroughVehicles=1048576]='SeeThroughVehicles',e[e.SeeThroughVegetation=2097152]='SeeThroughVegetation',e[e.SeeThroughScenery=4]='SeeThroughScenery',e[e.SeeThroughPaths=65536]='SeeThroughPaths',e[e.SeeThroughSupports=8]='SeeThroughSupports',e[e.InvisibleGuests=2048]='InvisibleGuests',e[e.InvisibleStaff=8388608]='InvisibleStaff',e[e.InvisibleRides=16777218]='InvisibleRides',e[e.InvisibleVehicles=34603008]='InvisibleVehicles',e[e.InvisibleVegetation=69206016]='InvisibleVegetation',e[e.InvisibleScenery=134217732]='InvisibleScenery',e[e.InvisiblePaths=268500992]='InvisiblePaths',e[e.InvisibleSupports=536870920]='InvisibleSupports';}(e||(e={}));

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var a={x:-9e3,y:-9e3};function c(r){return function(t,n){return new v(t,n,r)}}var p=e.HideBase|e.HideVertical|e.InvisibleGuests|e.InvisibleStaff|e.InvisibleRides|e.InvisibleVehicles|e.InvisibleVegetation|e.InvisibleScenery|e.InvisiblePaths|e.SeeThroughSupports,v=function(u){function f(r,o,s){var f=u.call(this,'viewport',r,o,s)||this,a=o.binder,c=s.target,p=s.visibilityFlags,v=s.disabled,l=s.zoom,j=function(r){f.aa(r.viewport,c,p,v);};return a.on(f,p,j),a.on(f,v,j),a.on(f,c,j),a.on(f,l,(function(r,t){var n=r.viewport;n&&(n.zoom=t);})),o.on(o$a,(function(r){var t=f.da(r);t&&l&&(t.zoom=o$2(l)),f.aa(t,c,p,v);})),(i$6(c)||e$7(c))&&o.on(r$b,(function(r){var t=f.da(r);f.aa(t,c,p,v);})),f}return r$d(f,u),f.prototype.aa=function(r,t,i,o){if(r){var s=this.ba(o$2(t)),e=o$2(i),m=o$2(o);this.ca(r,s,e,m);}},f.prototype.ba=function(r){var t=null;if(!t$b(r))if(e$7(r)){var n=map.getEntity(r);n&&(t={x:n.x,y:n.y,z:n.z});}else i$7(r)&&(t=r);return t},f.prototype.ca=function(r,t,n,i){!i&&t||(n=p,t=a),r.moveTo(t),r.visibilityFlags=n||0;},f.prototype.da=function(r){var t=r.getWidget(this.name);return t?t.viewport:null},f}(n$2);

    // Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI
    var r;!function(r){r[r.Black=0]='Black',r[r.Grey=1]='Grey',r[r.White=2]='White',r[r.DarkPurple=3]='DarkPurple',r[r.LightPurple=4]='LightPurple',r[r.BrightPurple=5]='BrightPurple',r[r.DarkBlue=6]='DarkBlue',r[r.LightBlue=7]='LightBlue',r[r.IcyBlue=8]='IcyBlue',r[r.Teal=9]='Teal',r[r.Aquamarine=10]='Aquamarine',r[r.SaturatedGreen=11]='SaturatedGreen',r[r.DarkGreen=12]='DarkGreen',r[r.MossGreen=13]='MossGreen',r[r.BrightGreen=14]='BrightGreen',r[r.OliveGreen=15]='OliveGreen',r[r.DarkOliveGreen=16]='DarkOliveGreen',r[r.BrightYellow=17]='BrightYellow',r[r.Yellow=18]='Yellow',r[r.DarkYellow=19]='DarkYellow',r[r.LightOrange=20]='LightOrange',r[r.DarkOrange=21]='DarkOrange',r[r.LightBrown=22]='LightBrown',r[r.SaturatedBrown=23]='SaturatedBrown',r[r.DarkBrown=24]='DarkBrown',r[r.SalmonPink=25]='SalmonPink',r[r.BordeauxRed=26]='BordeauxRed',r[r.SaturatedRed=27]='SaturatedRed',r[r.BrightRed=28]='BrightRed',r[r.DarkPink=29]='DarkPink',r[r.BrightPink=30]='BrightPink',r[r.LightPink=31]='LightPink',r[r.DarkOliveDark=32]='DarkOliveDark',r[r.DarkOliveLight=33]='DarkOliveLight',r[r.SaturatedBrownLight=34]='SaturatedBrownLight',r[r.BordeauxRedDark=35]='BordeauxRedDark',r[r.BordeauxRedLight=36]='BordeauxRedLight',r[r.GrassGreenDark=37]='GrassGreenDark',r[r.GrassGreenLight=38]='GrassGreenLight',r[r.OliveDark=39]='OliveDark',r[r.OliveLight=40]='OliveLight',r[r.SaturatedGreenLight=41]='SaturatedGreenLight',r[r.TanDark=42]='TanDark',r[r.TanLight=43]='TanLight',r[r.DullPurpleLight=44]='DullPurpleLight',r[r.DullGreenDark=45]='DullGreenDark',r[r.DullGreenLight=46]='DullGreenLight',r[r.SaturatedPurpleDark=47]='SaturatedPurpleDark',r[r.SaturatedPurpleLight=48]='SaturatedPurpleLight',r[r.OrangeLight=49]='OrangeLight',r[r.AquaDark=50]='AquaDark',r[r.MagentaLight=51]='MagentaLight',r[r.DullBrownDark=52]='DullBrownDark',r[r.DullBrownLight=53]='DullBrownLight',r[r.Invisible=54]='Invisible',r[r.Void=55]='Void';}(r||(r={}));

    const ACCESSORY_TYPES = [null, "hat", "sunglasses", "balloon", "umbrella"];
    const COLOUR_ACCESSORIES = { hat: true, balloon: true, umbrella: true };
    const DEFAULT_COLOURS = { hat: 6, balloon: 14, umbrella: 0 };
    const ACTION_LABELS = {
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
    const ACTION_EXCLUDE = [
        "walking", "watchRide", "holdMat",
        "sittingIdle", "sittingEatFood",
        "sittingLookAroundLeft", "sittingLookAroundRight",
        "hanging", "drowning"
    ];
    // ── ViewModel ──────────────────────────────────────────────────────────
    class PeepSimModel {
        constructor() {
            // Guest state
            this.selectedGuestId = t$4(null);
            this.guestList = t$4([]);
            this.selectedGuestIndex = t$4(0);
            // Computed: the actual guest entity (re-derived each update)
            this.guestTarget = t$4(null);
            // Control mode
            this.controlMode = t$4("direct");
            // Direct control
            this.heldDirection = t$4(-1);
            this.moveToolActive = t$4(false);
            // Queued control
            this.queuePaused = t$4(true);
            this.actionQueue = t$4([]);
            this.queueListItems = t$4([]);
            this.queueSelectedRow = t$4(-1);
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
            this.hasGuest = i$4(this.selectedGuestId, id => id !== null);
            this.noGuest = i$4(this.selectedGuestId, id => id === null);
            // Internals (not stores — runtime state for tick executor)
            this.tickInterval = null;
            this.directionInterval = null;
            this.actionPlayInterval = null;
            this.currentAction = null;
            this.moveTickCount = 0;
            this.lastMoveDist = -1;
            this.actionTickCount = 0;
            this.guestRefreshCounter = 0;
            this.pauseSlotNormal = -1;
            this.pauseSlotPressed = -1;
            this.lastTabIndex = -1;
        }
    }

    function getSelectedGuest(model) {
        const id = model.selectedGuestId.get();
        if (id === null)
            return null;
        const entity = map.getEntity(id);
        if (!entity || entity.type !== "guest") {
            model.selectedGuestId.set(null);
            model.guestTarget.set(null);
            return null;
        }
        return entity;
    }
    function selectGuest(model, id) {
        model.selectedGuestId.set(id);
        model.guestTarget.set(id);
        syncAccessoriesFromGuest(model);
        refreshActionAnimations(model);
    }
    function spawnGuest(model) {
        const guest = park.generateGuest();
        if (guest && guest.id !== null) {
            model.selectedGuestId.set(guest.id);
            model.guestTarget.set(guest.id);
            context.executeAction("guestsetname", { peep: guest.id, name: "PeepSim" }, () => { });
        }
        return guest;
    }
    function refreshGuestList(model) {
        const list = map.getAllEntities("guest")
            .filter(g => g.id !== null)
            .map(g => ({
            id: g.id,
            name: g.name
        }));
        model.guestList.set(list);
        const currentId = model.selectedGuestId.get();
        if (currentId !== null) {
            const idx = list.findIndex(g => g.id === currentId);
            model.selectedGuestIndex.set(idx >= 0 ? idx + 1 : 0);
        }
        else {
            model.selectedGuestIndex.set(0);
        }
    }
    function freezeGuest(model) {
        const guest = getSelectedGuest(model);
        if (guest) {
            guest.setFlag("positionFrozen", true);
            guest.animation = "watchRide";
            guest.animationOffset = 0;
        }
    }
    function unfreezeGuest(model) {
        const guest = getSelectedGuest(model);
        if (guest) {
            guest.setFlag("positionFrozen", false);
            guest.animation = "walking";
            guest.animationOffset = 0;
        }
    }
    function setAccessory(model, type) {
        const prev = model.accessoryActive.get();
        model.accessoryActive.set(type);
        const guest = getSelectedGuest(model);
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
        freezeGuest(model);
    }
    function setAccessoryColour(model, colour) {
        model.accessoryColour.set(colour);
        const guest = getSelectedGuest(model);
        if (!guest)
            return;
        const type = model.accessoryActive.get();
        if (type && COLOUR_ACCESSORIES[type]) {
            applyAccessoryColour(model, guest, type);
        }
    }
    function applyAccessoryColour(model, guest, type) {
        const colour = model.accessoryColour.get();
        if (type === "hat")
            guest.hatColour = colour;
        if (type === "balloon")
            guest.balloonColour = colour;
        if (type === "umbrella")
            guest.umbrellaColour = colour;
    }
    function enforceAccessories(model) {
        const guest = getSelectedGuest(model);
        if (!guest)
            return;
        const active = model.accessoryActive.get();
        if (active && !guest.hasItem({ type: active })) {
            guest.giveItem({ type: active });
            if (COLOUR_ACCESSORIES[active]) {
                applyAccessoryColour(model, guest, active);
            }
        }
    }
    function syncAccessoriesFromGuest(model) {
        const guest = getSelectedGuest(model);
        if (!guest)
            return;
        model.accessoryActive.set(null);
        model.accessoryColour.set(0);
        model.accessoryIndex.set(0);
        for (let i = 1; i < ACCESSORY_TYPES.length; i++) {
            const type = ACCESSORY_TYPES[i];
            if (guest.hasItem({ type })) {
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
        const guest = getSelectedGuest(model);
        if (!guest)
            return;
        model.shirtColour.set(guest.tshirtColour);
        model.pantsColour.set(guest.trousersColour);
        syncAccessoriesFromGuest(model);
    }
    function refreshActionAnimations(model) {
        const guest = getSelectedGuest(model);
        if (!guest) {
            model.actionAnimations.set([]);
            model.actionLabels.set(["(no guest)"]);
            model.queueActionAnimations.set([]);
            model.queueActionLabels.set(["(none)"]);
            return;
        }
        const available = guest.availableAnimations || [];
        const anims = [];
        const labels = [];
        for (const anim of available) {
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
    function resetState(model) {
        const guest = getSelectedGuest(model);
        if (guest) {
            guest.setFlag("positionFrozen", false);
            guest.animation = "walking";
            guest.animationOffset = 0;
        }
        model.selectedGuestId.set(null);
        model.guestTarget.set(null);
        model.accessoryActive.set(null);
        model.accessoryColour.set(0);
        model.accessoryIndex.set(0);
    }

    function addAction(model, action) {
        const queue = model.actionQueue.get().slice();
        queue.push(action);
        model.actionQueue.set(queue);
        refreshQueueList(model);
    }
    function removeAction(model, index) {
        const queue = model.actionQueue.get().slice();
        queue.splice(index, 1);
        model.actionQueue.set(queue);
        refreshQueueList(model);
    }
    function clearActions(model) {
        model.actionQueue.set([]);
        model.currentAction = null;
        model.actionTickCount = 0;
        refreshQueueList(model);
    }
    function refreshQueueList(model) {
        const actions = model.actionQueue.get();
        const items = actions.map((a, i) => {
            let desc;
            if (a.type === "action") {
                const label = ACTION_LABELS[a.animation] || a.animation;
                desc = `${label} (${a.duration || 3}s)`;
            }
            else {
                desc = `Move \u2192 ${a.target.x}, ${a.target.y}`;
            }
            return [String(i + 1), desc];
        });
        model.queueListItems.set(items);
    }
    function pauseQueue(model) {
        model.queuePaused.set(true);
        freezeGuest(model);
    }
    function resumeQueue(model) {
        model.queuePaused.set(false);
        const guest = getSelectedGuest(model);
        if (!guest)
            return;
        const current = model.currentAction;
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
    function directMove(model, tileX, tileY, skipHighlight) {
        const guest = getSelectedGuest(model);
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
        {
            highlightTarget(tileX, tileY);
        }
    }
    function directWalk(model, direction) {
        const guest = getSelectedGuest(model);
        if (!guest)
            return;
        if (guest.getFlag("positionFrozen")) {
            guest.setFlag("positionFrozen", false);
            guest.animation = "walking";
            guest.animationOffset = 0;
        }
        const rotation = ui.mainViewport.rotation;
        const adjusted = (direction - rotation + 4) & 3;
        let dx = 0, dy = 0;
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
        clearHighlight();
    }
    function startExecutor(model) {
        if (model.tickInterval !== null)
            return;
        model.tickInterval = context.setInterval(() => {
            executeTick(model);
        }, 100);
    }
    function stopExecutor(model) {
        if (model.tickInterval !== null) {
            context.clearInterval(model.tickInterval);
            model.tickInterval = null;
        }
    }
    function highlightTarget(tileX, tileY) {
        ui.tileSelection.tiles = [{ x: tileX * 32, y: tileY * 32 }];
    }
    function clearHighlight() {
        ui.tileSelection.tiles = [];
    }
    function finishCurrentAction(model) {
        model.currentAction = null;
        model.moveTickCount = 0;
        model.lastMoveDist = -1;
        model.actionTickCount = 0;
        clearHighlight();
        if (model.actionQueue.get().length === 0) {
            freezeGuest(model);
            model.queuePaused.set(true);
        }
    }
    function executeTick(model) {
        const guest = getSelectedGuest(model);
        if (!guest)
            return;
        if (model.queuePaused.get())
            return;
        const current = model.currentAction;
        if (current !== null) {
            if (current.type === "action") {
                model.actionTickCount++;
                const durationTicks = (current.duration || 3) * 10;
                if (model.actionTickCount >= durationTicks) {
                    finishCurrentAction(model);
                }
                return;
            }
            if (current.target) {
                const targetX = current.target.x * 32 + 16;
                const targetY = current.target.y * 32 + 16;
                const dx = guest.x - targetX;
                const dy = guest.y - targetY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 32) {
                    finishCurrentAction(model);
                    return;
                }
                model.moveTickCount++;
                if (model.moveTickCount % 10 === 0) {
                    if (model.lastMoveDist >= 0 && Math.abs(dist - model.lastMoveDist) < 4) {
                        guest.destination = { x: targetX, y: targetY };
                    }
                    model.lastMoveDist = dist;
                }
            }
            return;
        }
        const queue = model.actionQueue.get();
        if (queue.length === 0)
            return;
        const next = queue[0];
        model.actionQueue.set(queue.slice(1));
        model.currentAction = next;
        model.moveTickCount = 0;
        model.lastMoveDist = -1;
        model.actionTickCount = 0;
        if (next.type === "action") {
            freezeGuest(model);
            guest.animation = next.animation;
            guest.animationOffset = 0;
        }
        else if (next.target) {
            unfreezeGuest(model);
            guest.destination = {
                x: next.target.x * 32 + 16,
                y: next.target.y * 32 + 16
            };
            highlightTarget(next.target.x, next.target.y);
        }
        refreshQueueList(model);
    }
    function startDirectionWalk(model, direction) {
        if (!getSelectedGuest(model)) {
            ui.showError("PeepSim", "No guest selected!");
            return;
        }
        const current = model.heldDirection.get();
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
        model.directionInterval = context.setInterval(() => {
            if (model.heldDirection.get() < 0)
                return;
            directWalk(model, model.heldDirection.get());
        }, 400);
    }
    function stopDirectionWalk(model) {
        const wasActive = model.heldDirection.get() >= 0;
        model.heldDirection.set(-1);
        if (model.directionInterval !== null) {
            context.clearInterval(model.directionInterval);
            model.directionInterval = null;
        }
        return wasActive;
    }
    function activateMoveTool(model) {
        if (!getSelectedGuest(model)) {
            ui.showError("PeepSim", "No guest selected!");
            return;
        }
        stopDirectionWalk(model);
        model.moveToolActive.set(true);
        ui.activateTool({
            id: "peepsim-move",
            cursor: "walk_down",
            filter: ["terrain"],
            onMove: (e) => {
                if (e.mapCoords) {
                    ui.tileSelection.tiles = [{ x: e.mapCoords.x, y: e.mapCoords.y }];
                }
            },
            onDown: (e) => {
                if (e.mapCoords) {
                    const tileX = Math.floor(e.mapCoords.x / 32);
                    const tileY = Math.floor(e.mapCoords.y / 32);
                    if (model.controlMode.get() === "direct") {
                        directMove(model, tileX, tileY);
                    }
                    else {
                        addAction(model, { type: "move", target: { x: tileX, y: tileY } });
                    }
                }
            },
            onFinish: () => {
                model.moveToolActive.set(false);
                clearHighlight();
            }
        });
    }
    function deactivateMoveTool(model) {
        if (ui.tool && ui.tool.id === "peepsim-move") {
            ui.tool.cancel();
        }
        model.moveToolActive.set(false);
    }
    function performSelectedAction(model) {
        const guest = getSelectedGuest(model);
        if (!guest)
            return;
        const anims = model.actionAnimations.get();
        if (anims.length === 0)
            return;
        if (!guest.getFlag("positionFrozen"))
            return;
        const idx = model.selectedActionIndex.get();
        if (idx < 0 || idx >= anims.length)
            return;
        const anim = anims[idx];
        if (model.actionPlayInterval !== null) {
            context.clearInterval(model.actionPlayInterval);
            model.actionPlayInterval = null;
        }
        guest.animation = anim;
        guest.animationOffset = 0;
        let prevOffset = -1;
        model.actionPlayInterval = context.setInterval(() => {
            const g = getSelectedGuest(model);
            if (!g || g.animation !== anim) {
                if (model.actionPlayInterval !== null) {
                    context.clearInterval(model.actionPlayInterval);
                    model.actionPlayInterval = null;
                }
                return;
            }
            const offset = g.animationOffset;
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

    function guestSelector(model) {
        return c$3([
            e$2({
                width: "1w",
                items: i$4(model.guestList, list => {
                    const items = ["(none)"];
                    for (const g of list) {
                        items.push(`${g.name} (#${g.id})`);
                    }
                    return items;
                }),
                selectedIndex: model.selectedGuestIndex,
                onChange: (index) => {
                    stopDirectionWalk(model);
                    deactivateMoveTool(model);
                    clearActions(model);
                    pauseQueue(model);
                    resetState(model);
                    const list = model.guestList.get();
                    if (index > 0 && index <= list.length) {
                        selectGuest(model, list[index - 1].id);
                        freezeGuest(model);
                    }
                }
            }),
            n$1({
                text: "New",
                width: "50px",
                height: "14px",
                tooltip: "Spawn a new guest",
                onClick: () => {
                    stopDirectionWalk(model);
                    deactivateMoveTool(model);
                    clearActions(model);
                    pauseQueue(model);
                    resetState(model);
                    spawnGuest(model);
                    freezeGuest(model);
                    syncAccessoriesFromGuest(model);
                    refreshGuestList(model);
                }
            })
        ]);
    }

    const SPR_DIR_NE = 5635;
    const SPR_DIR_SE = 5636;
    const SPR_DIR_SW = 5637;
    const SPR_DIR_NW = 5638;
    function directTab(model) {
        return [
            a$2({
                text: "Preview",
                height: "160px",
                content: c({
                    target: model.guestTarget
                })
            }),
            guestSelector(model),
            i$2({
                text: "Direct Control",
                content: [
                    r$1({
                        text: "Move To",
                        height: "20px",
                        tooltip: "Click a tile to walk the guest there",
                        isPressed: model.moveToolActive,
                        disabled: model.noGuest,
                        onChange: (pressed) => {
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
                                    n$1({
                                        image: SPR_DIR_NW,
                                        width: "45px",
                                        height: "29px",
                                        isPressed: i$4(model.heldDirection, d => d === 3),
                                        disabled: model.noGuest,
                                        onClick: () => startDirectionWalk(model, 3)
                                    }),
                                    n$1({
                                        image: SPR_DIR_NE,
                                        width: "45px",
                                        height: "29px",
                                        isPressed: i$4(model.heldDirection, d => d === 0),
                                        disabled: model.noGuest,
                                        onClick: () => startDirectionWalk(model, 0)
                                    })
                                ]),
                                c$3([
                                    n$1({
                                        image: SPR_DIR_SW,
                                        width: "45px",
                                        height: "29px",
                                        isPressed: i$4(model.heldDirection, d => d === 2),
                                        disabled: model.noGuest,
                                        onClick: () => startDirectionWalk(model, 2)
                                    }),
                                    n$1({
                                        image: SPR_DIR_SE,
                                        width: "45px",
                                        height: "29px",
                                        isPressed: i$4(model.heldDirection, d => d === 1),
                                        disabled: model.noGuest,
                                        onClick: () => startDirectionWalk(model, 1)
                                    })
                                ])
                            ]),
                            c$3({ width: "1w", content: [] })
                        ]
                    }),
                    n$1({
                        image: 5597,
                        width: "28px",
                        height: "28px",
                        border: false,
                        tooltip: "Toggle guest idle",
                        disabled: model.noGuest,
                        padding: { left: "1w", right: "1w" },
                        onClick: () => {
                            const guest = getSelectedGuest(model);
                            if (!guest)
                                return;
                            const wasWalking = stopDirectionWalk(model);
                            if (wasWalking) {
                                freezeGuest(model);
                            }
                            else if (guest.getFlag("positionFrozen")) {
                                unfreezeGuest(model);
                            }
                            else {
                                freezeGuest(model);
                            }
                        }
                    }),
                    c$3([
                        e$2({
                            width: "1w",
                            items: model.actionLabels,
                            selectedIndex: model.selectedActionIndex,
                            disabled: model.noGuest,
                            onChange: (index) => {
                                model.selectedActionIndex.set(index);
                            }
                        }),
                        n$1({
                            text: "Perform",
                            width: "60px",
                            height: "16px",
                            tooltip: "Perform the selected action",
                            disabled: model.noGuest,
                            onClick: () => performSelectedAction(model)
                        })
                    ])
                ]
            })
        ];
    }

    function queuedTab(model) {
        return [
            a$2({
                text: "Preview",
                height: "160px",
                content: c({
                    target: model.guestTarget
                })
            }),
            guestSelector(model),
            i$2({
                text: "Queued Control",
                content: [
                    c$3([
                        r$1({
                            image: 5597,
                            width: "28px",
                            height: "28px",
                            border: false,
                            tooltip: "Play/Pause queue",
                            disabled: model.noGuest,
                            isPressed: model.queuePaused,
                            onChange: (pressed) => {
                                if (pressed) {
                                    pauseQueue(model);
                                }
                                else {
                                    resumeQueue(model);
                                }
                            }
                        }),
                        c$3({ width: "1w", content: [] }),
                        n$1({
                            text: "Delete",
                            width: "90px",
                            height: "28px",
                            disabled: model.noGuest,
                            onClick: () => {
                                const row = model.queueSelectedRow.get();
                                if (row >= 0) {
                                    removeAction(model, row);
                                }
                            }
                        }),
                        n$1({
                            text: "Clear All",
                            width: "90px",
                            height: "28px",
                            disabled: model.noGuest,
                            onClick: () => {
                                clearActions(model);
                            }
                        })
                    ]),
                    p$1({
                        height: "128px",
                        scrollbars: "vertical",
                        isStriped: true,
                        columns: [
                            { header: "#", width: "24px" },
                            { header: "Action" }
                        ],
                        items: model.queueListItems,
                        canSelect: true,
                        onClick: (row) => {
                            model.queueSelectedRow.set(row);
                        }
                    }),
                    r$1({
                        text: "+ Move To",
                        height: "20px",
                        isPressed: model.moveToolActive,
                        disabled: model.noGuest,
                        onChange: (pressed) => {
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
                            onChange: (index) => {
                                model.selectedQueueActionIndex.set(index);
                            }
                        }),
                        o({
                            text: "for",
                            width: "20px"
                        }),
                        a$1({
                            width: "55px",
                            value: t$3(model.queueDuration),
                            minimum: 1,
                            maximum: 60,
                            disabled: model.noGuest,
                            format: (v) => `${v}s`
                        }),
                        n$1({
                            text: "+ Add",
                            width: "60px",
                            height: "18px",
                            disabled: model.noGuest,
                            onClick: () => {
                                const anims = model.queueActionAnimations.get();
                                if (!anims.length)
                                    return;
                                const anim = anims[model.selectedQueueActionIndex.get()];
                                const dur = model.queueDuration.get();
                                addAction(model, { type: "action", animation: anim, duration: dur });
                            }
                        })
                    ])
                ]
            })
        ];
    }

    const ACCESSORY_LABELS = ["None", "Hat", "Sunglasses", "Balloon", "Umbrella"];
    function appearanceTab(model) {
        return [
            a$2({
                text: "Preview",
                height: "160px",
                content: c({
                    target: model.guestTarget
                })
            }),
            guestSelector(model),
            i$2({
                text: "Appearance",
                content: [
                    c$3([
                        o({ text: "Shirt colour:", width: "90px" }),
                        e$3({
                            colour: model.shirtColour,
                            disabled: model.noGuest,
                            onChange: (colour) => {
                                const guest = getSelectedGuest(model);
                                if (guest) {
                                    guest.tshirtColour = colour;
                                    model.shirtColour.set(colour);
                                }
                            }
                        })
                    ]),
                    c$3([
                        o({ text: "Pants colour:", width: "90px" }),
                        e$3({
                            colour: model.pantsColour,
                            disabled: model.noGuest,
                            onChange: (colour) => {
                                const guest = getSelectedGuest(model);
                                if (guest) {
                                    guest.trousersColour = colour;
                                    model.pantsColour.set(colour);
                                }
                            }
                        })
                    ]),
                    c$3([
                        o({ text: "Accessory:", width: "90px" }),
                        e$2({
                            width: "110px",
                            items: ACCESSORY_LABELS,
                            selectedIndex: model.accessoryIndex,
                            disabled: model.noGuest,
                            onChange: (index) => {
                                model.accessoryIndex.set(index);
                                const type = ACCESSORY_TYPES[index];
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
                            disabled: model.noGuest,
                            onChange: (colour) => {
                                setAccessoryColour(model, colour);
                            }
                        })
                    ])
                ]
            })
        ];
    }

    const GUEST_REFRESH_INTERVAL = 80;
    function createPeepSimWindow(model) {
        return v$1({
            title: "PeepSim",
            width: 300,
            height: { value: 400, min: 300, max: 600 },
            padding: 5,
            colours: [r.Grey, r.LightPurple, r.LightPurple],
            onOpen: () => {
                startExecutor(model);
                model.lastTabIndex = 0;
                model.guestRefreshCounter = 0;
                refreshGuestList(model);
            },
            onUpdate: () => {
                enforceAccessories(model);
                model.guestRefreshCounter++;
                if (model.guestRefreshCounter >= GUEST_REFRESH_INTERVAL) {
                    model.guestRefreshCounter = 0;
                    refreshGuestList(model);
                }
                syncAppearanceFromGuest(model);
            },
            onClose: () => {
                stopDirectionWalk(model);
                if (model.actionPlayInterval !== null) {
                    context.clearInterval(model.actionPlayInterval);
                    model.actionPlayInterval = null;
                }
                if (ui.tool) {
                    ui.tool.cancel();
                }
                stopExecutor(model);
                clearActions(model);
                clearHighlight();
                resetState(model);
            },
            onTabChange: (tabIndex) => {
                const prev = model.lastTabIndex;
                if (tabIndex !== prev) {
                    stopDirectionWalk(model);
                    deactivateMoveTool(model);
                    if (prev === 0 && tabIndex === 1) {
                        clearActions(model);
                        pauseQueue(model);
                    }
                    else if (prev === 1 && tabIndex === 0) {
                        clearActions(model);
                        pauseQueue(model);
                    }
                    model.lastTabIndex = tabIndex;
                    if (tabIndex === 0) {
                        model.controlMode.set("direct");
                    }
                    else if (tabIndex === 1) {
                        model.controlMode.set("queued");
                    }
                }
                refreshGuestList(model);
                refreshActionAnimations(model);
            },
            tabs: [
                e$4({
                    image: 5577,
                    content: directTab(model)
                }),
                e$4({
                    image: { frameBase: 5229, frameCount: 8, frameDuration: 4 },
                    content: queuedTab(model)
                }),
                e$4({
                    image: { frameBase: 5221, frameCount: 8, frameDuration: 4 },
                    content: appearanceTab(model)
                })
            ]
        });
    }

    const PLUGIN_VERSION = "0.2.0";
    function main() {
        if (typeof ui !== "undefined") {
            ui.registerMenuItem("PeepSim", () => {
                const model = new PeepSimModel();
                createPeepSimWindow(model).open();
            });
        }
        console.log(`[peepsim] loaded v${PLUGIN_VERSION}`);
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

})();
