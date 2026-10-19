
function _nineVisiveis() {
    var todos = document.querySelectorAll('[class*=geetest_item_img]');
    var vivos = [];
    for (var i = 0; i < todos.length; i++) {
        var r = todos[i].getBoundingClientRect();
        if (r.width < 3 || r.height < 3) { continue; }
        var cs = window.getComputedStyle(todos[i]);
        if (cs.display === 'none' || cs.visibility === 'hidden') { continue; }
        if (parseFloat(cs.opacity) === 0) { continue; }
        vivos.push(todos[i]);
    }
    if (vivos.length < 9) { return null; }
    return vivos.slice(vivos.length - 9);
}
