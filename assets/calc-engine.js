/* Shared calculator rendering engine — data-driven slider calculators.
   Used by index.html (3 featured tools) and tools.html (all tools). */
window.TF_renderCalculator = (function(){
  "use strict";
  var fmtCompact = TF.fmtCompact, fmtNum = TF.fmtNum;

  return function renderCalculatorInto(container, idPrefix, config){
    var html = '<h3>' + config.title + '</h3>';
    if(config.desc){ html += '<p class="calc-desc">' + config.desc + '</p>'; }
    config.fields.forEach(function(f){
      html += '<div class="calc-field">' +
        '<div class="calc-field-head"><label for="' + idPrefix + f.id + '">' + f.label + '</label><span class="calc-val" id="' + idPrefix + f.id + 'Val">' + fmtNum(f.def) + '</span></div>' +
        '<input type="range" id="' + idPrefix + f.id + '" min="' + f.min + '" max="' + f.max + '" step="' + f.step + '" value="' + f.def + '">' +
        '</div>';
    });
    html += '<div class="calc-result"><span class="calc-result-label">' + config.resultLabel + '</span>' +
      '<strong class="calc-result-num" id="' + idPrefix + 'Result">₹0</strong>' +
      '<span class="calc-result-sub" id="' + idPrefix + 'Sub"></span></div>';
    if(config.note){ html += '<p class="calc-note">' + config.note + '</p>'; }
    container.innerHTML = html;

    function byId(id){ return container.querySelector('#' + id); }

    function recompute(){
      var values = {};
      config.fields.forEach(function(f){
        var el = byId(idPrefix + f.id);
        values[f.id] = +el.value;
        byId(idPrefix + f.id + 'Val').textContent = fmtNum(+el.value);
      });
      var out = config.calc(values);
      byId(idPrefix + 'Result').textContent = fmtCompact(out.result);
      byId(idPrefix + 'Sub').textContent = out.sub;
    }
    config.fields.forEach(function(f){
      byId(idPrefix + f.id).addEventListener('input', recompute);
    });
    recompute();
  };
})();
