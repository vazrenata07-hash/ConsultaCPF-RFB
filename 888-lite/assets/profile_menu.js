(function profileMenu() {
  'use strict';
  if (window.__localProfileMenuV6 || !window.LocalIdentity) return;
  try { if (!window.LocalIdentity.isTrustedOrigin(location.origin)) return; } catch (_) { return; }
  window.__localProfileMenuV6 = true;
  window.__localProfileMenuV5 = true;
  var ID = 'local-clear-profile-v6', lastDialog = 0, frameworkStarted = 0;
  var active = false, inherited = false, row = null, settingsRow = null;
  var mountObserver = null, menuObserver = null, mountTimer = 0, pending = 0;
  var mountAttempts = 0, mounting = false;
  var words = [
    'modo noturno','modo diurno','faca login no dispositivo','meus registros',
    'gestao de saques','encontre-nos','encontre nos','bonus de sugestao',
    'seguranca','dados','idioma','faq','promocao',
    'night mode','day mode','device login','log in on device','security','language'
  ];
  function text(value) {
    value = String(value || '').toLowerCase();
    if (value.normalize) value = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return value.replace(/[\u00a0\s]+/g, ' ').trim();
  }
  function keyword(value) {
    value = text(value);
    return words.indexOf(value) >= 0 ? value : '';
  }
  function visible(element) {
    if (!element || !element.getBoundingClientRect) return false;
    var bounds = element.getBoundingClientRect();
    if (bounds.width < 2 || bounds.height < 2) return false;
    var style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.visibility !== 'collapse';
  }
  function openConfirmation(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); if (event.stopImmediatePropagation) event.stopImmediatePropagation(); }
    if (Date.now() - lastDialog < 1000) return;
    lastDialog = Date.now();
    window.LocalIdentity.requestReset();
  }
  function rowFor(label) {
    var current = label, best = null, width = Math.min(document.documentElement.clientWidth * 0.55, 240);
    for (var level = 0; current && current !== document.body && level < 7; level++, current = current.parentElement) {
      var rect = current.getBoundingClientRect();
      if (rect.height > 120) break;
      if (rect.height >= 30 && rect.width >= width) best = current;
      if (best && /^(LI|BUTTON|A)$/.test(current.tagName)) break;
    }
    return best;
  }
  function anchors(root) {
    var result = [], walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false), node, limit = 0;
    while ((node = walker.nextNode()) && limit++ < 1500) {
      if (node.nodeValue.length > 90) continue;
      var key = keyword(node.nodeValue), parent = node.parentElement;
      if (!key || !visible(parent)) continue;
      var row = rowFor(parent);
      if (row && !result.some(function (item) { return item.row === row; })) result.push({row: row, key: key});
    }
    return result;
  }
  function menuArray(component) {
    var props = component.props || {};
    return [props.menuList, props.data, props.items].filter(function (list) {
      return Array.isArray(list) && list.length >= 2 && list.some(function (entry) {
        if (!entry || typeof entry !== 'object') return false;
        try { return !!keyword(typeof entry.title === 'function' ? entry.title() : entry.title); } catch (_) { return false; }
      });
    });
  }
  function frameworkEntry(items) {
    // Prefer the Vue component's own menu array when production metadata is available.
    for (var i = 0; i < items.length; i++) {
      var node = items[i].row;
      for (var level = 0; node && level < 5; level++, node = node.parentElement) {
        var component = node.__vueParentComponent || (node.__vnode && node.__vnode.component);
        for (var depth = 0; component && depth < 6; depth++, component = component.parent) {
          try {
            var lists = menuArray(component);
            for (var j = 0; j < lists.length; j++) {
              var list = lists[j];
              if (list.some(function (entry) { return entry && entry.id === ID; })) return true;
              list.push({
                id: ID, key: ID, title: function () { return 'Limpar dados'; },
                icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath fill="none" stroke="%23ffffff" stroke-width="2" d="M20 7v5h-5M20 12a8 8 0 1 0-2 6"/%3E%3C/svg%3E',
                onClick: openConfirmation, click: openConfirmation, hidden: false
              });
              frameworkStarted = Date.now();
              if (typeof component.update === 'function') component.update();
              return true;
            }
          } catch (_) { /* A readonly menu is handled by the DOM path below. */ }
        }
      }
    }
    return false;
  }
  function makeRow(template, settings) {
    var tag = template.tagName === 'LI' ? 'li' : 'div';
    var row = document.createElement(tag), style = getComputedStyle(template), rect = template.getBoundingClientRect();
    row.id = settings ? 'mint-port-settings-v7' : ID; row.className = template.className || '';
    row.setAttribute('data-local-cleanup', 'profile'); row.setAttribute('role', 'button');
    row.setAttribute('aria-label', settings ? 'Configurações' : 'Limpar dados e renovar IDs locais'); row.tabIndex = 0;
    row.style.cssText = 'display:flex!important;position:relative!important;align-items:center;box-sizing:border-box;width:100%;flex-shrink:0;cursor:pointer;clear:both;';
    row.style.minHeight = Math.max(48, Math.min(80, rect.height)) + 'px';
    row.style.paddingLeft = style.paddingLeft === '0px' ? '20px' : style.paddingLeft;
    row.style.paddingRight = style.paddingRight === '0px' ? '20px' : style.paddingRight;
    row.style.color = style.color; row.style.fontFamily = style.fontFamily;
    row.style.fontSize = style.fontSize; row.style.backgroundColor = style.backgroundColor;
    var icon = document.createElement('span'); icon.textContent = settings ? '⚙' : '↻';
    icon.style.cssText = 'display:inline-flex;width:28px;min-width:28px;align-items:center;justify-content:center;font-size:30px;margin-right:18px;color:inherit;';
    var label = document.createElement('span'); label.textContent = settings ? 'Configurações' : 'Limpar dados';
    label.style.cssText = 'display:block;flex:1;color:inherit;font:inherit;font-size:16px;line-height:1.4;';
    var arrow = document.createElement('span'); arrow.textContent = '›';
    arrow.style.cssText = 'font-size:28px;line-height:1;opacity:.6;color:inherit;';
    row.appendChild(icon); row.appendChild(label); row.appendChild(arrow);
    var action = settings ? function(event){event.preventDefault();event.stopImmediatePropagation();try{if(window.MintPort&&window.MintPort.openSettings(location.origin)===true)return;}catch(_){}location.href='mint-port://settings';} : openConfirmation;
    row.addEventListener('click', action, true);
    row.addEventListener('keydown', function (event) { if (event.key === 'Enter' || event.key === ' ') action(event); }, true);
    return row;
  }
  function routeIsProfile() {
    function match(value) {
      return String(value || '').split('?')[0].replace(/\/+$/, '').toLowerCase() === '/home/mine';
    }
    return match(location.pathname) || match(location.hash.replace(/^#/, ''));
  }
  function insert() {
    if (!document.body || document.hidden) return null;
    var existing = document.getElementById(ID);
    if (existing && visible(existing)) return existing;
    var root = document.querySelector('[data-route-for-scroll="mine"]');
    if (root && !visible(root)) root = null;
    // Wait for the requested view instead of inspecting the previous page during a route transition.
    if (!root && document.querySelector('[data-route-for-scroll]')) return null;
    var scope = root || document.body;
    var lists = scope.querySelectorAll('ul.menulist');
    for (var listIndex = lists.length - 1; listIndex >= 0; listIndex--) {
      var list = lists[listIndex], template = list.lastElementChild;
      if (!template || !visible(template)) continue;
      if (existing) existing.remove();
      var direct = makeRow(template); list.appendChild(direct); return direct;
    }
    var items = anchors(scope);
    if (!items.length) return null;
    var framework = frameworkEntry(items);
    existing = document.getElementById(ID);
    if (framework && existing && visible(existing)) return existing;
    if (framework) {
      var labels = scope.querySelectorAll('span, p, div');
      for (var item = 0; item < labels.length; item++) {
        if (labels[item].children.length || text(labels[item].textContent) !== 'limpar dados' || !visible(labels[item])) continue;
        var rendered = rowFor(labels[item]);
        if (rendered) {
          rendered.id = ID; rendered.setAttribute('data-local-cleanup','profile');
          rendered.addEventListener('click',openConfirmation,true); return rendered;
        }
      }
      if (Date.now() - frameworkStarted < 500) { schedule(); return null; }
    }
    var selected = items[items.length - 1];
    items.forEach(function (item) { if (/modo noturno|modo diurno|night mode|day mode/.test(item.key)) selected = item; });
    var parent = selected.row.parentElement;
    if (!parent || parent === document.body || parent === document.documentElement) return null;
    if (existing) existing.remove();
    var added = makeRow(selected.row); parent.insertBefore(added,selected.row.nextSibling); return added;
  }
  function stopMounting() {
    mounting = false;
    if (mountObserver) { mountObserver.disconnect(); mountObserver = null; }
    if (mountTimer) { clearTimeout(mountTimer); mountTimer = 0; }
    if (pending) { clearTimeout(pending); pending = 0; }
  }
  function stop() {
    stopMounting();
    if (menuObserver) { menuObserver.disconnect(); menuObserver = null; }
    row = null;
  }
  function settled(element) {
    row = element; stopMounting();
    settingsRow = document.getElementById('mint-port-settings-v7');
    if (!settingsRow || settingsRow.parentElement !== row.parentElement) {
      if(settingsRow)settingsRow.remove();
      settingsRow=makeRow(row,true);row.parentElement.insertBefore(settingsRow,row);
    }
    if (menuObserver) menuObserver.disconnect();
    var host = row.parentElement;
    if (host && host.parentElement && host.parentElement !== document.body) host = host.parentElement;
    if (!host) return;
    // No search here: only restart insertion if the web component actually removes our row.
    menuObserver = new MutationObserver(function () {
      if (active && row && (!row.isConnected || !settingsRow || !settingsRow.isConnected)) beginMounting();
    });
    menuObserver.observe(host,{childList:true,subtree:true});
  }
  function attempt() {
    pending = 0;
    if (!active || !mounting) return;
    if (++mountAttempts > 16) { stopMounting(); return; }
    try { var inserted = insert(); if (inserted) settled(inserted); } catch (_) {}
  }
  function schedule() {
    if (!active || !mounting || pending) return;
    pending = setTimeout(attempt,120);
  }
  function beginMounting() {
    stop();
    if (!active) return;
    mounting = true; mountAttempts = 0;
    mountObserver = new MutationObserver(schedule);
    mountObserver.observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','hidden']});
    mountTimer = setTimeout(stopMounting,15000);
    schedule();
  }
  var ROUTE_MESSAGE = 'local-profile-route-v6';
  function publishRoute() {
    for (var frame = 0; frame < window.frames.length; frame++) {
      try { window.frames[frame].postMessage({type:ROUTE_MESSAGE,active:active},'*'); } catch (_) {}
    }
  }
  function navigation() {
    var next = routeIsProfile() || inherited;
    if (next !== active) {
      active = next;
      if (active) beginMounting(); else stop();
      publishRoute();
    } else if (active && !mounting && (!row || !row.isConnected || !settingsRow || !settingsRow.isConnected)) beginMounting();
  }
  window.addEventListener('message',function (event) {
    if (!event.data || event.data.type !== ROUTE_MESSAGE) return;
    try { if (!window.LocalIdentity.isTrustedOrigin(event.origin)) return; } catch (_) { return; }
    if (event.data.query) {
      for (var frame = 0; frame < window.frames.length; frame++) {
        if (event.source === window.frames[frame]) {
          try { event.source.postMessage({type:ROUTE_MESSAGE,active:active},'*'); } catch (_) {}
          break;
        }
      }
    } else if (window.parent !== window && event.source === window.parent) {
      inherited = event.data.active === true; navigation();
    }
  });
  ['popstate','hashchange','pageshow'].forEach(function (event) { window.addEventListener(event,navigation); });
  document.addEventListener('DOMContentLoaded',navigation);
  document.addEventListener('visibilitychange',function () { if (!document.hidden) navigation(); });
  ['pushState','replaceState'].forEach(function (method) {
    var original = history[method];
    history[method] = function () { var result = original.apply(this,arguments); navigation(); return result; };
  });
  navigation();
  if (window.parent !== window) {
    try { window.parent.postMessage({type:ROUTE_MESSAGE,query:true},'*'); } catch (_) {}
  }
})();
