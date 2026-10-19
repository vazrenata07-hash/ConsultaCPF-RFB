
// So as marcas DENTRO da foto atual. O DOM guarda paineis antigos, cujas
// marcas ficam em 0,0 (mesma armadilha do 3x3) -- contar todas dava 3 antes
// mesmo do primeiro toque.
var bgs = document.querySelectorAll('[class*=geetest_bg]');
var foto = null;
for (var j = bgs.length - 1; j >= 0; j--) {
    var r = bgs[j].getBoundingClientRect();
    if (r.width >= 40 && r.height >= 40) { foto = r; break; }
}
if (!foto) { return -1; }
var m = document.querySelectorAll('[class*=geetest_square_mark]');
var n = 0;
for (var i = 0; i < m.length; i++) {
    var rr = m[i].getBoundingClientRect();
    var mx = rr.left + rr.width / 2;
    var my = rr.top + rr.height / 2;
    if (mx >= foto.left && mx <= foto.left + foto.width &&
        my >= foto.top && my <= foto.top + foto.height) { n = n + 1; }
}
return n;
