(function(e,t){typeof define=="function"&&define.amd?define([],t):typeof exports=="object"?module.exports=t():e.canop=t()})(this,function(){function d(e,t,n,r,i){this.mark=[+r,+i,p++],this.action=e,this.key=t,this.value=n,this.original=null}function v(e,t,n,r,i){this.lowKey=e,this.highKey=t,this.change=n,this.originalLowKey=r||e,this.originalHighKey=i||t,this.inverted=!1}function g(e){this.list=e||[]}function y(e,t){for(var n=0;n<Math.min(e.length,t.length);n++){if(e[n]<t[n])return-1;if(e[n]>t[n])return 1}return e.length<t.length?-1:e.length>t.length?1:0}function b(e,t){if(!e||!t)return!1;var n=e.length;if(n!==t.length)return!1;for(var r=0,n=e;r<n;r++)if(e[r]!==t[r])return!1;return!0}function x(e){var i=this;this.base=e.base||0,this.localId=0,this.local=new g,this.sent=new g,this.canon=new g,this.listeners={},this.on("change",function(e){i.updateData(e)}),this.on("localChange",function(e){i.updateData(e)}),e.disableData!==undefined&&(this.disableData=e.disableData),this.data=undefined,e.data!==undefined?(this.isServer=!0,this.base=e.base||1,this.data=e.data,this.emit("localChange",{changes:[[[],t.set,this.data]]})):this.isServer=!1,this.send=e.send||function(){throw"Default Canop send operation"},this.clients={},this.nextClientId=1,this.signalFromClient=Object.create(null),this.clientState=w;if(!this.isServer){var s=function(){try{i.localId===0?i.send(JSON.stringify([r,n])):i.send(JSON.stringify([f,i.localId,i.base])),i.clientState=E}catch(e){i.emit("unsyncable",e)}};this.on("unsyncable",function(){if(i.clientState===w)return;i.clientState=w,i.once("syncing",s)}),i.once("syncing",s)}}var e={},t={set:0,stringAdd:7,stringRemove:8},n=0,r=0,i=1,s=2,o=3,u=4,a=5,f=6,l=7,c=0,h=9007199254740991,p=0;e.AtomicOperation=d,d.prototype={dup:function(){return d.fromObject(this)},change:function(){if(this.action===t.stringAdd)return new v(this.key,this.key+this.value.length,this.value.length,this.original?this.original.key:null);if(this.action===t.stringRemove)return new v(this.key,this.key+this.value.length,-this.value.length,this.original?this.original.key:null)},getModifiedBy:function(n){var r=this.key+this.value.length;this.original={mark:this.mark.slice(),action:this.action,key:this.key,value:this.value};var i=m(this.key,n);if(this.action===t.stringAdd)var s=i+this.value.length;else if(this.action===t.stringRemove)var s=m(r,n);if(i===undefined||s===undefined)this.key=0,this.value="";else{this.key=i;var o=this.key+this.value.length;if(s<o)this.value=this.value.slice(0,s-i);else if(s>o)for(var u=0;u<s-o;u++)this.value+=" "}},inverse:function(){if(this.action===t.stringAdd){var n=this.dup();n.action=t.stringRemove}else if(this.action===t.stringRemove){var n=this.dup();n.action=t.stringAdd}return n},toProtocol:function(){return[this.mark,[this.action,this.key,this.value]]}},v.prototype={dup:function(){return new v(this.lowKey,this.highKey,this.change,this.originalLowKey,this.originalHighKey)},update:function(t,n){if(this.highKey<=t)return t+this.change;if(this.lowKey<=t){if(this.change>=0)return this.lowKey<t?t+this.change:this.originalLowKey<n?t+this.change:t;if(this.lowKey<t)return;return t}return t},inverse:function(){var t=this.dup();return t.change=-t.change,t.inverted=!t.inverted,t},mirror:function(t){return this.change===-t.change&&this.originalLowKey===t.originalLowKey&&this.originalHighKey===t.originalHighKey&&this.inverted===!t.inverted}};var m=function(t,n,r){var i=t;for(var s=0;s<n.length;s++){var o=n[s],u=o.update(t,i),a=!1;if(u===undefined){for(var f=s+1;f<n.length;f++)if(o.mirror(n[f])){s=f,a=!0;break}if(!a){if(r)return t;return}}else t=u}return t};d.fromObject=function(e){var t=new d(e.action,e.key,e.value,e.mark[0]);return p--,t.mark=e.mark.slice(),e.original!=null&&(t.original={mark:e.original.mark.slice(),action:e.original.action,key:e.original.key,value:e.original.value}),t},d.fromProtocol=function(e){var t=e[0],n=e[1][0],r=e[1][1],i=e[1][2],s=new d(n,r,i,t[0]);return p--,s.mark=t.slice(),s},e.Operation=g,g.fromProtocol=function(e){var t=new g,n=e[2];for(var r=0;r<n.length;r++)t.list.push(d.fromProtocol(n[r]));return t},g.prototype={apply:function(t){var n=t.dup();this.list=this.list.concat(n.list)},combine:function(t){var n=this.dup(),r=t.dup();return n.list=n.list.concat(r.list),n},dup:function(){var t=new g;t.list=new Array(this.list.length);for(var n=0;n<this.list.length;n++)t.list[n]=this.list[n].dup();return t},inverse:function(){var t=new g;for(var n=this.list.length-1;n>=0;n--){var r=this.list[n].inverse();if(r===undefined)return;t.list.push(r)}return t},change:function T(){var e=[];for(var t=0;t<this.list.length;t++){var T=this.list[t].change();T!==undefined?e.push(T):e=[]}return e},inverseChange:function(){var t=[];for(var n=this.list.length-1;n>=0;n--){var r=this.list[n].change().inverse();if(r===undefined)return t;t.push(r)}return t},add:function(n,r,i,s,o){var u=new d(t.stringAdd,r,i,s,o);return this.list.push(u),u},remove:function(n,r,i,s,o){var u=new d(t.stringRemove,r,i,s,o);return this.list.push(u),u},toString:function N(){var e="";for(var n=0;n<this.list.length;n++){var r=this.list[n];if(r.action===t.stringAdd){var i=r.key-e.length;for(var s=0;s<i;s++)e+=" ";e=e.slice(0,r.key)+r.value+e.slice(r.key)}else r.action===t.stringRemove?(e.slice(r.key,r.key+r.value.length)!==r.value,e=e.slice(0,r.key)+e.slice(r.key+r.value.length)):r.action===t.set&&(e=r.key)}return e},toProtocol:function(){var e=[];for(var t=0;t<this.list.length;t++){var n=this.list[t];e.push(n.toProtocol())}return[s,[],e]}};var w=0,E=1,S=2;return e.Client=x,e.Server=x,x.prototype={on:function(e,t,n){this.listeners[e]=this.listeners[e]||[],this.listeners[e].push({func:t,options:n})},once:function(e,t,n){var r=this,i=function(){t(),r.removeListener(e,i)};this.on(e,i,n)},emit:function(e,t){var n=this.listeners[e];if(n==null)return;var r=n.slice(),i=r.length;for(var s=0;s<i;s++)r[s].func(t)},removeListener:function(e,t){var n=this.listeners[e];if(n==null)return;var r=n.length;for(var i=0;i<r;i++)if(n[i].func===t){n.splice(i,1);return}},readProtocol:function(e){var t=e;if(typeof t=="string")try{t=JSON.parse(t)}catch(n){throw new Error("Invalid Canop message: "+n.message+"\n"+"Message: "+e)}if(t instanceof Array){if(t[0]!==r)if(t[0]===i){if(t[1]===undefined)throw new Error("Invalid Canop message: undefined state\nMessage:"+e);if(typeof t[2]!="number")throw new Error("Invalid Canop message: non-number base\nMessage: "+e);if(typeof t[3]!="number")throw new Error("Invalid Canop message: non-number machine\nMessage: "+e)}else if(t[0]===s||t[0]===l){if(!(t[1]instanceof Array))throw new Error("Invalid Canop message: delta path is not an Array.\nMessage: "+e);if(!(t[2]instanceof Array))throw new Error("Invalid Canop message: deltas are not an Array.\nMessage: "+e);for(var c=0;c<t[2].length;c++){var h=t[2][c];if(!(h[0]instanceof Array))throw new Error("Invalid Canop message: delta "+c+" has non-Array mark.\nMessage: "+e);for(var p=0;p<h[0].length;p++)if(typeof h[0][p]!="number")throw new Error("Invalid Canop message: delta "+c+" has a non-number in mark at position "+p+".\n"+"Message: "+e);if(!(h[1]instanceof Array))throw new Error("Invalid Canop message: delta "+c+" has non-Array operation.\nMessage: "+e);if(h[1][0]!==0){if(h[1][0]!==7&&h[1][0]!==8)throw new Error("Invalid Canop message: delta "+c+" has an unsupported operation type.\n"+"Message: "+e);if(typeof h[1][1]!="number")throw new Error("Invalid Canop message: delta "+c+" has non-number string offset.\nMessage: "+e);if(typeof h[1][2]!="string")throw new Error("Invalid Canop message: delta "+c+" has non-string string edition.\nMessage: "+e)}}}else if(t[0]===o){if(typeof t[1]!="number")throw new Error("Invalid Canop message: non-number machine.\nMessage: "+e);if(t[2]!==undefined&&(typeof t[2]!="object"||t[2]instanceof Array))throw new Error("Invalid Canop message: non-object signal.\nMessage: "+e)}else if(t[0]===u||t[0]===a)t[1].forEach(function(t){if(typeof t[0]!="number")throw new Error("Invalid Canop message: non-number error code.\nMessage: "+e);if(typeof t[1]!="string")throw new Error("Invalid Canop message: non-string error message.\nMessage: "+e)});else{if(t[0]!==f)throw new Error("Invalid Canop message: unknown message type "+t[0]+"\nMessage: "+e);if(typeof t[1]!="number")throw new Error("Invalid Canop message: non-number machine.\nMessage: "+e);if(typeof t[2]!="number")throw new Error("Invalid Canop message: non-number base.\nMessage: "+e)}return t}throw new Error("Invalid Canop message: toplevel is not an array.\nMessage: "+e)},receive:function(e){var t=this;try{var n=this.readProtocol(e)}catch(r){console.error(r);return}var f=n[0];if(f===i)this.reset(n[1],n[2],n[3]),this.clientState=S,this.sendToServer();else if(f===l)this.receiveChange(n),this.clientState=S,this.sendToServer();else if(f===s){if(this.clientState!==S)return;this.receiveChange(n),this.sendToServer()}else if(f===o){if(this.clientState!==S)return;var h=n[1],p=n[2];this.signalFromClient[h]=this.signalFromClient[h]||{};if(p!==undefined)for(var d in p)this.signalFromClient[h][d]=p[d];this.emit("signal",{clientId:h,data:p})}else f===u?n[1].forEach(function(e){e[0]===c&&t.emit("unsyncable")}):f===a?n[1].forEach(function(e){console.error(e)}):console.error("Unknown protocol message "+e)},emitChanges:function(e,t,n){var r=t.map(function(e){return[[],e.action,e.key,e.value]});this.emit(e,{changes:r,posChanges:n})},receiveChange:function(e){var t=e[1],n=e[2],r=g.fromProtocol(e),i=this.base;for(var s=0;s<r.list.length;s++)if(i<r.list[s].mark[0])break;var o=s;r.list=r.list.slice(o);var u=this.local.inverse().list.concat(this.sent.inverse().list).concat(r.dup().list),a=this.receiveCanon(r);u=u.concat(this.sent.dup().list).concat(this.local.dup().list),this.emitChanges("change",u,a),this.local.list.length===0&&this.sent.list.length===0&&this.emit("synced")},reset:function(e,n,r){this.local=new g,this.sent=new g,this.canon=new g,this.localId=r,this.disableData||(this.data=e),this.receiveChange([s,[],[[[n,r,0],[t.set,e]]]])},localToSent:function(){this.sent.list=this.sent.list.concat(this.local.list),this.local.list=[]},receiveCanon:function(e){if(e.list.length===0)return[];var t=this.sent.dup();for(var n=0;n<e.list.length;n++){var r=e.list[n],i=this.sent.list[0];i!==undefined&&i.mark[1]===r.mark[1]&&i.mark[2]===r.mark[2]&&this.sent.list.shift()}var s=this.local.inverseChange().concat(t.inverseChange()).concat(e.change()),o=this.local.list.length,u=this.sent.list.length;for(var n=0;n<u;n++){var i=this.sent.list[n],a=o+u-n;i.getModifiedBy(s.slice(a)),s.push(i.change())}for(var n=0;n<o;n++){var f=this.local.list[n],a=o-n;f.getModifiedBy(s.slice(a)),s.push(f.change())}this.base=e.list[e.list.length-1].mark[0];for(var n=0;n<this.sent.list.length;n++)this.sent.list[n].mark[0]=this.base;for(var n=0;n<this.local.list.length;n++)this.local.list[n].mark[0]=this.base;return s},sendToServer:function(){if(this.clientState===w||this.clientState===E)return;if(this.sent.list.length>0)return;if(this.local.list.length>0){this.emit("syncing");try{this.send(JSON.stringify(this.local.toProtocol())),this.localToSent()}catch(t){this.emit("unsyncable",t)}}},updateData:function(e){var n=e.changes;for(var r=0;r<n.length;r++){var i=n[r],s=i[0],o=this.data,u=i[1];if(u===t.set)o=i[2];else if(u===t.stringAdd){var a=i[2],f=i[3];o=o.slice(0,a)+f+o.slice(a)}else if(u===t.stringRemove){var a=i[2],f=i[3];o=o.slice(0,a)+o.slice(a+f.length)}this.data=o}},get:function(e){if(this.disableData)throw new Error("Canop was configured not to hold data");if(this.data===undefined)throw new Error("Canop does not hold any data yet");return this.data},add:function(n,r,i){this.act([t.stringAdd,n,r,i]),this.sendToServer()},remove:function(n,r,i){this.act([t.stringRemove,n,r,i]),this.sendToServer()},toString:function(){return this.get([]).toString()},act:function(e){var t=this.commitAction(e);this.emitChanges("localChange",t),this.sendToServer()},actAtomically:function(e){var t=[];for(var n=0;n<e.length;n++)t=t.concat(this.commitAction(e[n]));this.emitChanges("localChange",t),this.sendToServer()},commitAction:function(e){var n=e[0],r=[];if(n===t.stringAdd)r.push(this.stringAdd(e));else{if(n!==t.stringRemove)throw new Error("Unknown Canop action");r.push(this.stringRemove(e))}return r},stringAdd:function(e){return this.local.add(e[1],e[2],e[3],this.base,this.localId)},stringRemove:function(e){return this.local.remove(e[1],e[2],e[3],this.base,this.localId)},signal:function(e){if(this.clientState!==S)return;var t=JSON.stringify(e);try{this.send(JSON.stringify([o,this.localId,e]))}catch(n){this.emit("unsyncable",n)}},addClient:function(e){var t=this;e.id=t.nextClientId,e.base=0,t.nextClientId++,t.clients[e.id]=e,e.onReceive(function(p){try{var d=t.readProtocol(p)}catch(v){console.error(v);return}var m=d[0];if(m===r){var y=d[1];y!==n?e.send(JSON.stringify([a,[[0,"Unsupported protocol version"]]])):(e.base=t.base,e.send(JSON.stringify([i,t.data,t.base,e.id]))),t.sendSignalsToClient(e)}else if(m===f){var b=d[2];t.removeClient(e),e.id=d[1],e.base=b,t.clients[e.id]=e;var w=t.operationsSinceBase(b);if(w!==undefined){var E=new g(w),S=w.map(function(e){return e.toProtocol()});e.send(JSON.stringify([l,[],S]))}else e.send(JSON.stringify([u,[[c,"Unknown base"]]]));t.sendSignalsToClient(e)}else if(m===s){var x=g.fromProtocol(d),T=t.receiveSent(x),p=JSON.stringify(T.toProtocol());for(var N in t.clients){var C=t.clients[N];C.send(p)}}else if(m===o){var N=d[1],k=d[2];t.signalFromClient[N]=t.signalFromClient[N]||{};if(k!==undefined)for(var L in k)t.signalFromClient[N][L]=k[L];for(var N in t.clients)if(e.id!==+N){var C=t.clients[N];C.send(p)}}else console.error("Unknown protocol message "+p)})},sendSignalsToClient:function(e){for(var t in this.clients)this.signalFromClient[t]!==undefined&&e.send(JSON.stringify([o,+t,this.signalFromClient[t]]))},removeClient:function(e){var t=e.id;delete this.clients[t];for(var n in this.clients){var r=this.clients[n];r.send(JSON.stringify([o,+t]))}delete this.signalFromClient[t]},operationsSinceBase:function(e){if(e===this.base)return[];for(var t=this.canon.list.length-1;t>=0;t--)if(this.canon.list[t].mark[0]<=e)return this.canon.list.slice(t+1)},receiveSent:function(e){var t=e.list[0].mark[0],n=e.list[0].mark[1],r=this.operationsSinceBase(t);r===undefined&&(r=this.canon.list);var i=0,s=[];for(var o=0;o<r.length;o++)r[o].mark[1]===n&&(r[o].mark[2]===e.list[i].mark[2]?i++:s.push(r[o]));var u=e.list.slice(0,i),a=e.list.slice(i),s=s.map(function(e){var t=e.dup();return e.original!=null&&(t.action=e.original.action,t.key=e.original.key,t.value=e.original.value),t}),f=e.inverseChange().concat((new g(s)).inverseChange()).concat((new g(r)).change());for(var o=0;o<a.length;o++){var l=a[o],c=a.length-o;l.getModifiedBy(f.slice(c)),f.push(l.change())}e.list=a;for(var o=0;o<e.list.length;o++)this.base++,e.list[o].mark[0]=this.base;return this.canon.apply(e),this.emitChanges("change",e.list,f),this.removeCommonOps(),e},removeCommonOps:function(){var e=this.base;for(var t in this.clients){var n=this.clients[t],r=n.base!==0,i=n.base<e;r&&i&&(e=n.base)}var s=this.canon.list.length-(this.base-e);s>0&&(this.canon.list=this.canon.list.slice(s-1))}},e.operationFromProtocol=g.fromProtocol,e.action=t,e.changePosition=m,e.PosChange=v,e});