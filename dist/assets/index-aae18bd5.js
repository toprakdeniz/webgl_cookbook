(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))c(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&c(a)}).observe(document,{childList:!0,subtree:!0});function d(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function c(t){if(t.ep)return;t.ep=!0;const r=d(t);fetch(t.href,r)}})();var u=document.getElementById("glcanvas"),e=u.getContext("webgl");e||alert("no webgl for you");let f=`
attribute vec4 a_position;
varying vec4 v_position;
void main() {
    v_position = a_position;
    gl_Position = a_position;
}
`,p=`
precision mediump float;
varying vec4 v_position;
void main() {
    gl_FragColor = vec4( abs(v_position.x), abs(v_position.y),  abs(v_position.x) * abs(v_position.y)  , 1.0);
}
`,n=e.createShader(e.VERTEX_SHADER);e.shaderSource(n,f);e.compileShader(n);let s=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(s,p);e.compileShader(s);let o=e.createProgram();e.attachShader(o,n);e.attachShader(o,s);e.linkProgram(o);e.useProgram(o);let l=e.getAttribLocation(o,"a_position"),g=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,g);let m=[0,0,0,.5,.7,0];e.bufferData(e.ARRAY_BUFFER,new Float32Array(m),e.STATIC_DRAW);e.enableVertexAttribArray(l);e.vertexAttribPointer(l,2,e.FLOAT,!1,0,0);e.drawArrays(e.TRIANGLES,0,3);
