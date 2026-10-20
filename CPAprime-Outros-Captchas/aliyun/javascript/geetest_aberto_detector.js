
var p = document.querySelectorAll(
    '[class*=geetest_slice_bg],[class*=geetest_item_img],[class*=geetest_window],' +
    '[class*=geetest_popup_ghost],[class*=geetest_box],[class*=geetest_panel]');
for (var k = 0; k < p.length; k++) {
    var el = p[k];
    var r = el.getBoundingClientRect();
    if (r.width < 3 || r.height < 3) { continue; }
    var cs = window.getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') { continue; }
    if (parseFloat(cs.opacity) === 0) { continue; }
    return true;
}
return false;
