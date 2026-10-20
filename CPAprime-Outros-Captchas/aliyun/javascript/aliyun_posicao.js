
var out = {};
var f = document.getElementById('aliyunCaptcha-img');
var p = document.getElementById('aliyunCaptcha-puzzle');
if (f) { out.fundo = f.getBoundingClientRect().left; }
if (p) { out.peca = p.getBoundingClientRect().left; }
return out;
