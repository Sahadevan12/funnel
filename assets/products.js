(function(){
  "use strict";
  var fmtINR = TF.fmtINR, fmtCompact = TF.fmtCompact, fmtNum = TF.fmtNum;
  var sipFutureValue = TF.sipFutureValue, lumpsumFutureValue = TF.lumpsumFutureValue;

  /* ---------------- Trust bar ---------------- */
  function renderTrustBar(){
    var host = document.getElementById('trustBarGrid');
    if(!host) return;
    host.innerHTML = TF_STATS.map(function(s){
      var isNumeric = s.numeric != null;
      return '<div class="trust-stat' + (s.isText ? ' trust-stat-text' : '') + '"' +
        (isNumeric ? ' data-numeric="' + s.numeric + '" data-suffix="' + (s.suffix || '') + '"' : '') + '>' +
        '<strong>' + (isNumeric ? '0' + (s.suffix || '') : s.value) + '</strong><span>' + s.label + '</span></div>';
    }).join('');
  }

  function countUpStats(){
    var stats = document.querySelectorAll('.trust-stat[data-numeric]');
    if(!stats.length) return;
    var done = false;
    function run(){
      if(done) return;
      done = true;
      stats.forEach(function(el){
        var target = +el.dataset.numeric;
        var suffix = el.dataset.suffix || '';
        var strong = el.querySelector('strong');
        var duration = 900;
        var startTime = null;
        function tick(ts){
          if(startTime === null) startTime = ts;
          var progress = Math.min((ts-startTime)/duration, 1);
          var val = Math.round(target*progress);
          strong.textContent = val + suffix;
          if(progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){ if(entry.isIntersecting) run(); });
    }, {threshold:0.4});
    obs.observe(stats[0].closest('.trust-bar-grid') || stats[0]);
    setTimeout(run, 2500); // safety net in case the observer never fires
  }

  /* ---------------- Goal selector ---------------- */
  function renderGoals(){
    var host = document.getElementById('goalGrid');
    if(!host) return;
    host.innerHTML = TF_GOALS.map(function(g){
      var recommended = g.productIds.map(function(id){
        var p = TF_PRODUCTS.find(function(pr){ return pr.id === id; });
        return '<span>' + p.shortName + '</span>';
      }).join('');
      return '<button type="button" class="goal-card" data-goal="' + g.id + '">' +
        '<div class="goal-icon">' + g.icon + '</div><h3>' + g.title + '</h3><p>' + g.desc + '</p>' +
        '<div class="goal-tags">' + recommended + '</div></button>';
    }).join('');
    host.addEventListener('click', function(e){
      var card = e.target.closest('.goal-card');
      if(!card) return;
      var goal = TF_GOALS.find(function(g){ return g.id === card.dataset.goal; });
      host.querySelectorAll('.goal-card').forEach(function(c){ c.classList.remove('active'); });
      card.classList.add('active');
      highlightProducts(goal.productIds);
    });
  }

  function highlightProducts(productIds){
    var blocks = document.querySelectorAll('.product-section');
    blocks.forEach(function(b){
      var match = productIds.indexOf(b.dataset.productId) > -1;
      b.classList.toggle('goal-match', match);
      b.classList.toggle('goal-dim', !match);
      var badge = b.querySelector('.goal-match-badge');
      if(badge){ badge.hidden = !match; }
    });
    var target = document.getElementById('allProductsGrid');
    if(target){ target.scrollIntoView({behavior:'smooth', block:'start'}); }
  }

  /* ---------------- Sticky product subnav ---------------- */
  function renderSubnav(){
    var host = document.getElementById('productSubnav');
    if(!host) return;
    host.innerHTML = TF_PRODUCTS.map(function(p){
      return '<a href="#product-' + p.id + '">' + p.icon + ' ' + p.shortName + '</a>';
    }).join('');
  }

  /* ---------------- Generic slider-calculator engine ---------------- */
  function renderCalculatorInto(container, idPrefix, config){
    var html = '<div class="calc-card" style="border:none;padding:0;box-shadow:none;">';
    config.fields.forEach(function(f){
      html += '<div class="calc-field">' +
        '<div class="calc-field-head"><label for="' + idPrefix + f.id + '">' + f.label + '</label><span class="calc-val" id="' + idPrefix + f.id + 'Val">' + fmtNum(f.def) + '</span></div>' +
        '<input type="range" id="' + idPrefix + f.id + '" min="' + f.min + '" max="' + f.max + '" step="' + f.step + '" value="' + f.def + '">' +
        '</div>';
    });
    html += '<div class="calc-result"><span class="calc-result-label">' + config.resultLabel + '</span>' +
      '<strong class="calc-result-num" id="' + idPrefix + 'Result">₹0</strong>' +
      '<span class="calc-result-sub" id="' + idPrefix + 'Sub"></span></div>';
    if(config.note){ html += '<p class="muted-sm" style="margin-top:10px;">' + config.note + '</p>'; }
    html += '</div>';
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
  }

  function calculatorConfigsFor(product){
    if(product.calculatorType === 'management-value'){
      return [{
        label: 'See What Optimised Management Could Add',
        fields: [
          {id:'corpus', label:'Your Corpus (₹)', def:5000000, min:500000, max:50000000, step:100000},
          {id:'current', label:'Current Return (% p.a.)', def:9, min:1, max:20, step:0.5},
          {id:'target', label:'Target Return (% p.a.)', def:13, min:1, max:25, step:0.5},
          {id:'years', label:'Time Period (Years)', def:10, min:1, max:30, step:1}
        ],
        resultLabel: 'Illustrative Difference',
        note: 'Illustrative only, based on the rates you enter — not a performance guarantee or projection.',
        calc: function(v){
          var fvCur = lumpsumFutureValue(v.corpus, v.current, v.years);
          var fvOpt = lumpsumFutureValue(v.corpus, Math.max(v.target, v.current), v.years);
          var gap = Math.max(fvOpt-fvCur, 0);
          return { result: gap, sub: 'At ' + v.current + '%: ' + fmtCompact(fvCur) + ' · At ' + v.target + '%: ' + fmtCompact(fvOpt) };
        }
      }];
    }
    if(product.calculatorType === 'sip-lumpsum'){
      return [
        {
          label: 'SIP',
          fields: [
            {id:'amount', label:'Monthly SIP Amount (₹)', def:25000, min:1000, max:500000, step:1000},
            {id:'ret', label:'Expected Return (% p.a.)', def:12, min:1, max:30, step:0.5},
            {id:'years', label:'Time Period (Years)', def:15, min:1, max:40, step:1}
          ],
          resultLabel: 'Estimated Corpus',
          calc: function(v){
            var fv = sipFutureValue(v.amount, v.ret, v.years);
            var invested = v.amount*v.years*12;
            return { result: fv, sub: 'Invested: ' + fmtINR(invested) + ' · Wealth Gain: ' + fmtINR(fv-invested) };
          }
        },
        {
          label: 'Lump Sum',
          fields: [
            {id:'amount', label:'Investment Amount (₹)', def:1000000, min:10000, max:20000000, step:10000},
            {id:'ret', label:'Expected Return (% p.a.)', def:12, min:1, max:30, step:0.5},
            {id:'years', label:'Time Period (Years)', def:10, min:1, max:40, step:1}
          ],
          resultLabel: 'Future Value',
          calc: function(v){
            var fv = lumpsumFutureValue(v.amount, v.ret, v.years);
            return { result: fv, sub: 'Invested: ' + fmtINR(v.amount) + ' · Wealth Gain: ' + fmtINR(fv-v.amount) };
          }
        }
      ];
    }
    if(product.calculatorType === 'lumpsum'){
      return [{
        label: 'Lump Sum',
        fields: [
          {id:'amount', label:'Investment Amount (₹)', def:10000000, min:1000000, max:100000000, step:100000},
          {id:'ret', label:'Expected Return (% p.a.)', def:12, min:1, max:25, step:0.5},
          {id:'years', label:'Time Period (Years)', def:7, min:1, max:25, step:1}
        ],
        resultLabel: 'Future Value',
        calc: function(v){
          var fv = lumpsumFutureValue(v.amount, v.ret, v.years);
          return { result: fv, sub: 'Invested: ' + fmtINR(v.amount) + ' · Wealth Gain: ' + fmtINR(fv-v.amount) };
        }
      }];
    }
    return null;
  }

  function renderCalculatorSection(container, product){
    var configs = calculatorConfigsFor(product);
    if(!configs) return;
    var idBase = 'pc_' + product.id + '_';
    var wrap = document.createElement('div');
    wrap.className = 'calc-card';
    if(configs.length > 1){
      var tabsHtml = '<div class="tag-row" style="margin-bottom:18px;" role="tablist">' + configs.map(function(c, i){
        return '<button type="button" class="option-row" style="display:inline-block;width:auto;padding:8px 16px;" data-tab="' + i + '">' + c.label + '</button>';
      }).join('') + '</div><div class="calc-host"></div>';
      wrap.innerHTML = tabsHtml;
      var host = wrap.querySelector('.calc-host');
      var tabBtns = wrap.querySelectorAll('[data-tab]');
      function activate(i){
        tabBtns.forEach(function(b, bi){ b.classList.toggle('selected', bi===i); });
        renderCalculatorInto(host, idBase + i + '_', configs[i]);
      }
      tabBtns.forEach(function(b, i){ b.addEventListener('click', function(){ activate(i); }); });
      activate(0);
    } else {
      renderCalculatorInto(wrap, idBase + '0_', configs[0]);
    }
    container.appendChild(wrap);
  }

  /* ---------------- Portfolio Health Check (ported, for Portfolio Overhaul product) ---------------- */
  function renderHealthCheck(container){
    container.innerHTML =
      '<div class="hw-progress"><span id="pohStepLabel">STEP 1 OF 3</span><div class="hw-bar"><div class="hw-bar-fill" id="pohBarFill"></div></div></div>' +
      '<div class="hw-step" data-step="1">' +
        '<p class="hw-hint">Tap all asset types you currently hold.</p>' +
        '<div class="asset-grid" id="pohAssetGrid">' +
          ['Mutual Funds','Direct Stocks','Fixed Deposits','PPF / EPF','Gold / SGBs','Real Estate','PMS','AIF','Crypto'].map(function(a){
            return '<button type="button" class="asset-chip" data-asset="' + a + '"><span>' + a + '</span></button>';
          }).join('') +
        '</div>' +
        '<button type="button" class="btn btn-primary btn-block" id="pohStep1Next">Continue →</button>' +
      '</div>' +
      '<div class="hw-step" data-step="2" hidden>' +
        '<p class="hw-hint">How many schemes / stocks do you hold across mutual funds and direct equity?</p>' +
        '<div class="option-list" id="pohHoldingsOptions">' +
          '<button type="button" class="option-row" data-val="0">Just getting started</button>' +
          '<button type="button" class="option-row" data-val="1-5">1 – 5</button>' +
          '<button type="button" class="option-row" data-val="6-15">6 – 15</button>' +
          '<button type="button" class="option-row" data-val="16+">16+</button>' +
        '</div>' +
      '</div>' +
      '<div class="hw-step hw-result" data-step="3" hidden>' +
        '<div class="score-ring"><svg viewBox="0 0 120 120"><circle class="ring-bg" cx="60" cy="60" r="52"></circle><circle class="ring-fg" id="pohRingFg" cx="60" cy="60" r="52"></circle></svg>' +
          '<div class="score-num"><strong id="pohScoreNum">0</strong><span>/100</span></div></div>' +
        '<h3 id="pohVerdict">Portfolio Health Score</h3>' +
        '<p id="pohMsg" class="hw-hint"></p>' +
        '<button type="button" class="btn-link" id="pohRestart">Start over</button>' +
      '</div>';

    var steps = container.querySelectorAll('.hw-step');
    var stepLabel = container.querySelector('#pohStepLabel');
    var barFill = container.querySelector('#pohBarFill');
    var selectedAssets = [];
    var holdingsRange = null;

    function show(n){
      steps.forEach(function(s){ s.hidden = (+s.dataset.step !== n); });
      stepLabel.textContent = n < 3 ? ('STEP ' + n + ' OF 3') : 'RESULT';
      barFill.style.width = (n/3*100) + '%';
    }

    container.querySelector('#pohAssetGrid').addEventListener('click', function(e){
      var chip = e.target.closest('.asset-chip');
      if(!chip) return;
      var asset = chip.dataset.asset;
      chip.classList.toggle('selected');
      if(chip.classList.contains('selected')){ selectedAssets.push(asset); }
      else { selectedAssets = selectedAssets.filter(function(a){ return a!==asset; }); }
    });
    container.querySelector('#pohStep1Next').addEventListener('click', function(){ show(2); });
    container.querySelector('#pohHoldingsOptions').addEventListener('click', function(e){
      var opt = e.target.closest('.option-row');
      if(!opt) return;
      this.querySelectorAll('.option-row').forEach(function(o){ o.classList.remove('selected'); });
      opt.classList.add('selected');
      holdingsRange = opt.dataset.val;
      setTimeout(computeScore, 200);
    });

    function computeScore(){
      var score = 40;
      score += Math.min(selectedAssets.length, 8) * 5;
      if(holdingsRange === '16+') score -= 15;
      else if(holdingsRange === '6-15') score -= 8;
      if(selectedAssets.indexOf('PMS') > -1 || selectedAssets.indexOf('AIF') > -1) score += 10;
      if(selectedAssets.indexOf('Crypto') > -1) score -= 5;
      if(selectedAssets.length <= 2) score -= 10;
      score = Math.max(30, Math.min(95, Math.round(score)));

      var verdict, msg;
      if(score >= 80){ verdict = 'Strong Portfolio — Minor Fixes Needed'; msg = 'Your allocation is well diversified. A quick review could still unlock more efficiency.'; }
      else if(score >= 60){ verdict = 'Decent, But Scattered'; msg = 'You have the right instruments but likely overlapping funds and no clear architecture.'; }
      else { verdict = 'Needs Restructuring'; msg = 'Your portfolio is either too concentrated or too fragmented. A focused review can fix this.'; }

      container.querySelector('#pohScoreNum').textContent = score;
      container.querySelector('#pohVerdict').textContent = verdict;
      container.querySelector('#pohMsg').textContent = msg;
      var circumference = 326.7;
      container.querySelector('#pohRingFg').style.strokeDashoffset = circumference - (score/100)*circumference;
      show(3);
    }

    container.querySelector('#pohRestart').addEventListener('click', function(){
      selectedAssets = []; holdingsRange = null;
      container.querySelectorAll('.asset-chip, .option-row').forEach(function(el){ el.classList.remove('selected'); });
      container.querySelector('#pohRingFg').style.strokeDashoffset = 326.7;
      show(1);
    });
  }

  /* ---------------- Product block template ---------------- */
  function renderProductSection(product){
    var section = document.createElement('div');
    section.className = 'product-section reveal';
    section.id = 'product-' + product.id;
    section.dataset.productId = product.id;

    section.innerHTML =
      '<div class="product-block">' +
        '<span class="goal-match-badge" hidden>★ Matches Your Goal</span>' +
        '<div class="product-block-head">' +
          '<div class="product-block-icon">' + product.icon + '</div>' +
          '<div><h2>' + product.name + '</h2><p class="product-block-tagline">' + product.tagline + '</p>' +
          (product.minInvestment ? '<span class="product-block-min">Minimum ' + product.minInvestment + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="product-strip">' +
          '<p class="product-strip-positioning">' + product.positioning + '</p>' +
          '<div class="product-strip-pillars">' + product.pillars.map(function(p){ return '<span>' + p + '</span>'; }).join('<span class="dot">·</span>') + '</div>' +
          '<button type="button" class="product-strip-cta" data-enquiry-toggle>' + product.ctaLabel + ' →</button>' +
        '</div>' +
        '<div class="product-body-grid">' +
          '<div>' +
            '<div class="product-subhead">Why Choose This Solution</div>' +
            '<ul class="benefit-list">' + product.whyChoose.map(function(b){ return '<li>' + b + '</li>'; }).join('') + '</ul>' +
            '<div class="product-subhead">Who Is It For?</div>' +
            '<div class="who-for-box">' + product.whoFor + '</div>' +
            '<div class="product-subhead">Available Strategies</div>' +
            '<div class="subcat-grid">' + product.subcategories.map(function(s){
              return '<div class="subcat-card"><strong>' + s.name + '</strong><span>' + s.desc + '</span></div>';
            }).join('') + '</div>' +
          '</div>' +
          '<div>' +
            '<div class="product-subhead">How We Help</div>' +
            '<div class="how-help-row">' + product.howWeHelp.map(function(h, i){
              return '<div class="how-help-step"><div class="how-help-num">' + (i+1) + '</div><strong>' + h.title + '</strong><span>' + h.desc + '</span></div>';
            }).join('') + '</div>' +
            '<div class="product-subhead">Eligibility</div>' +
            '<div class="eligibility-box">' + product.eligibility + '</div>' +
            '<div class="calc-panel"><div class="calc-panel-label">📊 Run The Numbers</div><div class="calc-slot"></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="product-block-cta">' +
          '<button type="button" class="btn btn-primary" data-enquiry-toggle>' + product.ctaLabel + '</button>' +
        '</div>' +
        '<div class="mini-enquiry" id="enquiry-' + product.id + '" hidden></div>' +
      '</div>';

    var calcSlot = section.querySelector('.calc-slot');
    if(product.calculatorType === 'health-check'){
      renderHealthCheck(calcSlot);
    } else {
      renderCalculatorSection(calcSlot, product);
    }
    renderMiniEnquiry(section.querySelector('.mini-enquiry'), product);

    var enquiry = section.querySelector('.mini-enquiry');
    section.addEventListener('click', function(e){
      if(!e.target.closest('[data-enquiry-toggle]')) return;
      enquiry.hidden = false;
      requestAnimationFrame(function(){
        enquiry.scrollIntoView({behavior:'smooth', block:'center'});
        var firstField = enquiry.querySelector('input');
        if(firstField){ firstField.focus({preventScroll:true}); }
      });
    });

    return section;
  }

  function renderAllProducts(){
    var host = document.getElementById('allProductsGrid');
    if(!host) return;
    TF_PRODUCTS.forEach(function(p){
      host.appendChild(renderProductSection(p));
    });
  }

  /* ---------------- Featured PMS section (uses real data, avoids duplicating copy) ---------------- */
  function renderFeaturedPMS(){
    var host = document.getElementById('featuredBenefits');
    if(!host) return;
    var pms = TF_PRODUCTS.find(function(p){ return p.id === 'pms'; });
    host.innerHTML = pms.whyChoose.map(function(b){ return '<li>' + b + '</li>'; }).join('');
    var whoFor = document.getElementById('featuredWhoFor');
    if(whoFor){ whoFor.textContent = pms.whoFor; }
  }

  /* ---------------- Comparison table ---------------- */
  function renderComparison(){
    var host = document.getElementById('comparisonTableHost');
    if(!host) return;
    var rows = [
      {key:'idealFor', label:'Ideal For'},
      {key:'approach', label:'Investment Approach'},
      {key:'riskProfile', label:'Risk Profile'},
      {key:'timeHorizon', label:'Time Horizon'},
      {key:'professionalManagement', label:'Professional Management'},
      {key:'portfolioReview', label:'Portfolio Review'}
    ];
    var html = '<table class="comparison-table"><thead><tr><th></th>' +
      TF_PRODUCTS.map(function(p, i){ return '<th' + (i===0 ? ' class="comparison-featured-col"' : '') + '>' + p.icon + ' ' + p.shortName + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function(r){
      html += '<tr><td>' + r.label + '</td>' + TF_PRODUCTS.map(function(p, i){ return '<td' + (i===0 ? ' class="comparison-featured-col"' : '') + '>' + p.comparison[r.key] + '</td>'; }).join('') + '</tr>';
    });
    html += '</tbody></table>';
    host.innerHTML = html;
  }

  /* ---------------- Timeline / flow ---------------- */
  function renderTimeline(){
    var host = document.getElementById('processTimeline');
    if(!host) return;
    host.innerHTML = TF_PROCESS.map(function(s){
      return '<div class="timeline-step"><div class="timeline-num">' + s.step + '</div><h3>' + s.title + '</h3><p>' + s.desc + '</p></div>';
    }).join('');
  }
  function renderFlow(){
    var host = document.getElementById('strategyFlow');
    if(!host) return;
    host.innerHTML = TF_STRATEGY_FLOW.map(function(s){
      return '<div class="flow-step"><strong>' + s.title + '</strong><span>' + s.desc + '</span></div>';
    }).join('');
  }
  function renderFeeGrid(){
    var host = document.getElementById('feeGrid');
    if(!host) return;
    host.innerHTML = TF_FEE_VALUE.map(function(f){
      return '<div class="fee-card"><div class="fee-card-icon">' + f.icon + '</div><strong>' + f.title + '</strong><span>' + f.desc + '</span></div>';
    }).join('');
  }

  /* ---------------- Standards (what to expect — no fabricated testimonials) ---------------- */
  function renderStandards(){
    var host = document.getElementById('standardsGrid');
    if(!host) return;
    host.innerHTML = TF_STANDARDS.map(function(s){
      return '<div class="standard-card"><div class="standard-icon">' + s.icon + '</div>' +
        '<div class="standard-title">' + s.title + '</div><p class="standard-desc">' + s.desc + '</p></div>';
    }).join('');
  }

  /* ---------------- Mini enquiry form (reusable, shared submit handling) ---------------- */
  var enquiryCounter = 0;
  function renderMiniEnquiry(container, product){
    enquiryCounter++;
    var uid = 'mef' + enquiryCounter;
    container.innerHTML =
      '<div class="mini-enquiry-title">Talk to an Advisor About ' + product.name + '</div>' +
      '<form data-product="' + product.name + '">' +
        '<div class="mini-enquiry-grid">' +
          '<input class="form-input" type="text" id="' + uid + 'name" placeholder="Name" required>' +
          '<input class="form-input" type="tel" id="' + uid + 'phone" placeholder="Phone" required>' +
          '<input class="form-input full-span" type="email" id="' + uid + 'email" placeholder="Email" required>' +
          '<select class="form-input full-span" id="' + uid + 'interest">' +
            TF_PRODUCTS.map(function(p){ return '<option' + (p.id===product.id ? ' selected' : '') + '>' + p.name + '</option>'; }).join('') +
          '</select>' +
          '<textarea class="form-input full-span" id="' + uid + 'msg" rows="2" placeholder="Message (optional)"></textarea>' +
        '</div>' +
        '<button type="submit" class="btn btn-primary btn-block" style="margin-top:14px;">Talk to an Advisor</button>' +
      '</form>' +
      '<div class="mini-enquiry-success">✓ Thank you — our wealth consultant will call you within 2 hours.</div>';

    container.querySelector('form').addEventListener('submit', function(e){
      e.preventDefault();
      container.classList.add('submitted');
    });
  }

  /* ---------------- FAQ ---------------- */
  function renderFAQ(){
    var host = document.getElementById('productFaqList');
    if(!host) return;
    host.innerHTML = TF_PRODUCT_FAQ.map(function(item, i){
      return '<div class="faq-item' + (i===0 ? ' open' : '') + '"><button type="button" class="faq-q">' + item.q + ' <span>+</span></button>' +
        '<div class="faq-a"><p>' + item.a + '</p></div></div>';
    }).join('');

    var ld = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": TF_PRODUCT_FAQ.map(function(item){
        return { "@type": "Question", "name": item.q, "acceptedAnswer": { "@type": "Answer", "text": item.a } };
      })
    };
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(ld);
    document.head.appendChild(script);
  }

  /* ---------------- Scroll reveal ---------------- */
  function initReveal(){
    var els = document.querySelectorAll('.reveal');
    if(!els.length) return;
    if(typeof IntersectionObserver !== 'function'){
      els.forEach(function(el){ el.classList.add('in-view'); });
      return;
    }
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, {threshold:0.12});
    els.forEach(function(el){ obs.observe(el); });
  }

  /* ---------------- Init ---------------- */
  renderTrustBar();
  renderGoals();
  renderSubnav();
  renderFeaturedPMS();
  renderAllProducts();
  renderComparison();
  renderTimeline();
  renderFlow();
  renderFeeGrid();
  renderStandards();
  renderFAQ();
  countUpStats();
  initReveal();
})();
