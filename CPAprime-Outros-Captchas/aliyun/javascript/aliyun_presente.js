
var f = document.getElementById('aliyunCaptcha-img');
if (!f) { return false; }
var r = f.getBoundingClientRect();
return r.width > 40 && r.height > 40;
