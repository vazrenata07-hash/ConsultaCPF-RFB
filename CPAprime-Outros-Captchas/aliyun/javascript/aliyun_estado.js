
function _cxAli(id) {
    var e = document.getElementById(id);
    if (!e) { return null; }
    var r = e.getBoundingClientRect();
    if (r.width < 1 && r.height < 1) { return null; }
    return { x: r.left, y: r.top, w: r.width, h: r.height,
             nw: e.naturalWidth || 0, nh: e.naturalHeight || 0, src: e.src || '' };
}
return {
    fundo: _cxAli('aliyunCaptcha-img'),
    peca: _cxAli('aliyunCaptcha-puzzle'),
    alca: _cxAli('aliyunCaptcha-sliding-slider')
};
