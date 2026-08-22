(function(){
  "use strict";

  var fmtINR = TF.fmtINR, fmtCompact = TF.fmtCompact, fmtNum = TF.fmtNum;
  var sipFutureValue = TF.sipFutureValue, lumpsumFutureValue = TF.lumpsumFutureValue;
  var requiredSIPForGoal = TF.requiredSIPForGoal, emi = TF.emi;

  /* ---------------- SIP Calculator ---------------- */
  var sipAmount = document.getElementById('sipAmount');
  var sipReturn = document.getElementById('sipReturn');
  var sipYears = document.getElementById('sipYears');
  if(sipAmount && sipReturn && sipYears){
    var updateSIP = function(){
      var amt = +sipAmount.value, ret = +sipReturn.value, yrs = +sipYears.value;
      document.getElementById('sipAmountVal').textContent = fmtNum(amt);
      document.getElementById('sipReturnVal').textContent = ret;
      document.getElementById('sipYearsVal').textContent = yrs;
      var fv = sipFutureValue(amt, ret, yrs);
      var invested = amt*yrs*12;
      var gain = fv-invested;
      document.getElementById('sipCorpus').textContent = fmtCompact(fv);
      document.getElementById('sipBreakdown').textContent = 'Invested: ' + fmtINR(invested) + ' · Wealth Gain: ' + fmtINR(gain);
    };
    [sipAmount, sipReturn, sipYears].forEach(function(el){ el.addEventListener('input', updateSIP); });
    updateSIP();
  }

  /* ---------------- Lump Sum Calculator ---------------- */
  var lsAmount = document.getElementById('lsAmount');
  var lsReturn = document.getElementById('lsReturn');
  var lsYears = document.getElementById('lsYears');
  if(lsAmount && lsReturn && lsYears){
    var updateLS = function(){
      var amt = +lsAmount.value, ret = +lsReturn.value, yrs = +lsYears.value;
      document.getElementById('lsAmountVal').textContent = fmtNum(amt);
      document.getElementById('lsReturnVal').textContent = ret;
      document.getElementById('lsYearsVal').textContent = yrs;
      var fv = lumpsumFutureValue(amt, ret, yrs);
      var gain = fv-amt;
      document.getElementById('lsFuture').textContent = fmtCompact(fv);
      document.getElementById('lsBreakdown').textContent = 'Invested: ' + fmtINR(amt) + ' · Wealth Gain: ' + fmtINR(gain);
    };
    [lsAmount, lsReturn, lsYears].forEach(function(el){ el.addEventListener('input', updateLS); });
    updateLS();
  }

  /* ---------------- Wealth Gap Calculator ---------------- */
  var gapCorpus = document.getElementById('gapCorpus');
  var gapCurrent = document.getElementById('gapCurrent');
  var gapOptimised = document.getElementById('gapOptimised');
  var gapYears = document.getElementById('gapYears');
  if(gapCorpus && gapCurrent && gapOptimised && gapYears){
    var updateGap = function(){
      var corpus = +gapCorpus.value, cur = +gapCurrent.value, opt = +gapOptimised.value, yrs = +gapYears.value;
      document.getElementById('gapCorpusVal').textContent = fmtNum(corpus);
      document.getElementById('gapCurrentVal').textContent = cur;
      document.getElementById('gapOptimisedVal').textContent = opt;
      document.getElementById('gapYearsVal').textContent = yrs;
      var fvCur = lumpsumFutureValue(corpus, cur, yrs);
      var fvOpt = lumpsumFutureValue(corpus, Math.max(opt,cur), yrs);
      var gap = Math.max(fvOpt-fvCur, 0);
      document.getElementById('gapResult').textContent = fmtCompact(gap);
      document.getElementById('gapBreakdown').textContent = 'At ' + cur + '%: ' + fmtCompact(fvCur) + ' · At ' + opt + '%: ' + fmtCompact(fvOpt);
    };
    [gapCorpus, gapCurrent, gapOptimised, gapYears].forEach(function(el){ el.addEventListener('input', updateGap); });
    updateGap();
  }

  /* ---------------- Portfolio Health Check widget ---------------- */
  (function(){
    var widget = document.getElementById('healthWidget');
    if(!widget) return;
    var steps = widget.querySelectorAll('.hw-step');
    var stepLabel = document.getElementById('hwStepLabel');
    var barFill = document.getElementById('hwBarFill');
    var current = 1;
    var selectedAssets = [];
    var holdingsRange = null;
    var goal = null;

    function show(n){
      current = n;
      steps.forEach(function(s){ s.hidden = (+s.dataset.step !== n); });
      stepLabel.textContent = n <= 3 ? ('STEP ' + n + ' OF 4') : 'RESULT';
      barFill.style.width = (n/4*100) + '%';
    }

    document.getElementById('assetGrid').addEventListener('click', function(e){
      var chip = e.target.closest('.asset-chip');
      if(!chip) return;
      var asset = chip.dataset.asset;
      chip.classList.toggle('selected');
      if(chip.classList.contains('selected')){ selectedAssets.push(asset); }
      else { selectedAssets = selectedAssets.filter(function(a){ return a!==asset; }); }
    });

    document.getElementById('hwStep1Next').addEventListener('click', function(){
      show(2);
    });

    document.getElementById('hwHoldingsOptions').addEventListener('click', function(e){
      var opt = e.target.closest('.option-row');
      if(!opt) return;
      this.querySelectorAll('.option-row').forEach(function(o){ o.classList.remove('selected'); });
      opt.classList.add('selected');
      holdingsRange = opt.dataset.val;
      setTimeout(function(){ show(3); }, 200);
    });

    document.getElementById('hwGoalOptions').addEventListener('click', function(e){
      var opt = e.target.closest('.option-row');
      if(!opt) return;
      this.querySelectorAll('.option-row').forEach(function(o){ o.classList.remove('selected'); });
      opt.classList.add('selected');
      goal = opt.dataset.val;
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
      if(score >= 80){ verdict = 'Strong Portfolio — Minor Fixes Needed'; msg = 'Your allocation is well diversified. A quick review could still unlock 1-2% more efficiency.'; }
      else if(score >= 60){ verdict = 'Decent, But Scattered'; msg = 'You have the right instruments but likely overlapping funds and no clear architecture. Worth a free review.'; }
      else { verdict = 'Needs Restructuring'; msg = 'Your portfolio is either too concentrated or too fragmented. A focused consultation can fix this fast.'; }

      document.getElementById('scoreNum').textContent = score;
      document.getElementById('scoreVerdict').textContent = verdict;
      document.getElementById('scoreMsg').textContent = msg;
      var circumference = 326.7;
      var offset = circumference - (score/100)*circumference;
      document.getElementById('ringFg').style.strokeDashoffset = offset;
      show(4);
    }

    document.getElementById('hwRestart').addEventListener('click', function(){
      selectedAssets = []; holdingsRange = null; goal = null;
      document.querySelectorAll('#assetGrid .asset-chip').forEach(function(c){ c.classList.remove('selected'); });
      document.querySelectorAll('#hwHoldingsOptions .option-row, #hwGoalOptions .option-row').forEach(function(o){ o.classList.remove('selected'); });
      document.getElementById('ringFg').style.strokeDashoffset = 326.7;
      show(1);
    });
  })();

  /* ---------------- Risk Profile assessment ---------------- */
  (function(){
    var startBtn = document.getElementById('riskStartBtn');
    var widget = document.getElementById('riskWidget');
    var host = document.getElementById('riskQuestionHost');
    var stepLabel = document.getElementById('riskStepLabel');
    var barFill = document.getElementById('riskBarFill');
    var resultBox = document.getElementById('riskResult');
    if(!widget) return;

    var questions = [
      { q: 'Which age bracket are you in?', opts: ['Under 30','30–45','46–58','59+'] },
      { q: 'What is your investment time horizon?', opts: ['Less than 2 years','2–5 years','5–10 years','10+ years'] },
      { q: 'If your portfolio dropped 20% in a month, you would...', opts: ['Sell everything immediately','Sell part of it','Hold and wait','Invest more at lower prices'] },
      { q: 'How stable is your primary income?', opts: ['Very unstable','Somewhat stable','Stable','Very stable / multiple sources'] },
      { q: 'What is your primary investment goal?', opts: ['Capital protection','Regular income','Steady long-term growth','Maximum growth, risk accepted'] },
      { q: 'How much prior investing experience do you have?', opts: ['None','Only FDs / savings','Mutual funds / SIPs','Direct equity, PMS or AIF'] },
      { q: 'How many financial dependents do you support?', opts: ['4 or more','2–3','1','None'] },
      { q: 'How soon might you need to liquidate this investment?', opts: ['Within a year, likely','Might need some, uncertain','Unlikely, have other reserves','Very unlikely, fully surplus capital'] },
      { q: 'How would you describe your existing debt?', opts: ['High EMIs / loans','Moderate, manageable','Low','None'] },
      { q: 'What return would satisfy you over the long run?', opts: ['Beat inflation slightly, low risk','Steady, moderate returns','Meaningfully above FD returns','Maximum possible, volatility is fine'] }
    ];
    var current = 0;
    var total = 0;

    function renderQuestion(){
      var item = questions[current];
      stepLabel.textContent = 'QUESTION ' + (current+1) + ' OF ' + questions.length;
      barFill.style.width = ((current)/questions.length*100) + '%';
      var html = '<div class="hw-step"><h3>' + item.q + '</h3><div class="option-list">';
      item.opts.forEach(function(opt, i){
        html += '<button type="button" class="option-row" data-points="' + (i+1) + '">' + opt + '</button>';
      });
      html += '</div></div>';
      host.innerHTML = html;
      host.hidden = false;
      resultBox.hidden = true;
      host.querySelectorAll('.option-row').forEach(function(btn){
        btn.addEventListener('click', function(){
          total += +btn.dataset.points;
          current++;
          if(current < questions.length){ renderQuestion(); }
          else { showResult(); }
        });
      });
    }

    function showResult(){
      host.hidden = true;
      barFill.style.width = '100%';
      stepLabel.textContent = 'RESULT';
      var profile, msg;
      if(total <= 15){ profile = 'Conservative'; msg = 'You prioritise capital protection. A debt-heavy, low-volatility mutual fund allocation suits you best.'; }
      else if(total <= 25){ profile = 'Moderate'; msg = 'You can accept measured risk for better returns. A balanced hybrid and large-cap equity mix fits well.'; }
      else if(total <= 33){ profile = 'Growth-Oriented'; msg = 'You are comfortable with market swings for long-term gains. Multi-cap and flexi-cap PMS strategies suit your profile.'; }
      else { profile = 'Aggressive'; msg = 'You seek maximum growth and can stomach volatility. Thematic PMS, AIF and concentrated equity strategies fit you.'; }

      document.getElementById('riskScoreNum').textContent = total;
      document.getElementById('riskVerdict').textContent = 'Your Profile: ' + profile;
      document.getElementById('riskMsg').textContent = msg;
      var circumference = 326.7;
      var pct = Math.min(total/40, 1);
      document.getElementById('riskRingFg').style.strokeDashoffset = circumference - pct*circumference;
      resultBox.hidden = false;
    }

    startBtn.addEventListener('click', function(){
      current = 0; total = 0;
      resultBox.hidden = true;
      renderQuestion();
      widget.scrollIntoView({behavior:'smooth', block:'center'});
    });

    document.getElementById('riskRestart').addEventListener('click', function(){
      current = 0; total = 0;
      renderQuestion();
    });
  })();

  /* ---------------- Lead form (multi-step) ---------------- */
  (function(){
    var form = document.getElementById('leadForm');
    if(!form) return;
    var steps = form.querySelectorAll('.form-step');
    var stepLabel = document.getElementById('formStepLabel');
    var barFill = document.getElementById('formBarFill');
    var labels = { 1:'STEP 1 OF 3 — YOUR DETAILS', 2:'STEP 2 OF 3 — YOUR PROFILE', 3:'STEP 3 OF 3 — PREFERENCES' };

    function show(step){
      steps.forEach(function(s){ s.hidden = (s.dataset.step !== String(step)); });
      if(labels[step]){ stepLabel.textContent = labels[step]; barFill.style.width = (step/3*100) + '%'; }
    }

    document.getElementById('formStep1Next').addEventListener('click', function(){
      var name = document.getElementById('fullName');
      var phone = document.getElementById('phone');
      var email = document.getElementById('email');
      if(!name.value.trim() || !phone.value.trim() || !email.value.trim()){
        form.reportValidity();
        return;
      }
      show(2);
    });
    document.getElementById('formStep2Back').addEventListener('click', function(){ show(1); });
    document.getElementById('formStep2Next').addEventListener('click', function(){ show(3); });
    document.getElementById('formStep3Back').addEventListener('click', function(){ show(2); });

    form.addEventListener('submit', function(e){
      e.preventDefault();
      steps.forEach(function(s){ s.hidden = true; });
      form.querySelector('.form-success').hidden = false;
      stepLabel.textContent = 'DONE';
      barFill.style.width = '100%';
    });
  })();

  /* ---------------- 8 extra goal-planning tool modals ---------------- */
  (function(){
    var modal = document.getElementById('toolModal');
    if(!modal) return;
    var closeBtn = document.getElementById('toolModalClose');
    var titleEl = document.getElementById('toolModalTitle');
    var descEl = document.getElementById('toolModalDesc');
    var iconEl = document.getElementById('toolModalIcon');
    var fieldsEl = document.getElementById('toolModalFields');
    var resultLabelEl = document.getElementById('toolModalResultLabel');
    var resultEl = document.getElementById('toolModalResult');
    var subEl = document.getElementById('toolModalSub');

    var tools = {
      retirement: {
        icon:'🏖️', title:'Retirement Corpus', desc:"How much do you need to retire comfortably?",
        fields:[
          {id:'expense', label:'Monthly Expense Today (₹)', def:60000, min:10000, max:500000, step:5000},
          {id:'curAge', label:'Current Age', def:35, min:18, max:60, step:1},
          {id:'retAge', label:'Retirement Age', def:60, min:40, max:70, step:1},
          {id:'lifeExp', label:'Life Expectancy', def:85, min:70, max:100, step:1},
          {id:'inflation', label:'Inflation (% p.a.)', def:6, min:2, max:12, step:0.5},
          {id:'postReturn', label:'Post-Retirement Return (% p.a.)', def:8, min:2, max:15, step:0.5}
        ],
        resultLabel:'Corpus Needed At Retirement',
        calc:function(v){
          var yearsToRet = Math.max(v.retAge - v.curAge, 0);
          var retYears = Math.max(v.lifeExp - v.retAge, 1);
          var futureMonthlyExpense = v.expense * Math.pow(1+v.inflation/100, yearsToRet);
          var realReturn = (((1+v.postReturn/100)/(1+v.inflation/100))-1);
          var annualExpense = futureMonthlyExpense*12;
          var corpus;
          if(Math.abs(realReturn) < 0.0001){ corpus = annualExpense*retYears; }
          else { corpus = annualExpense * (1-Math.pow(1+realReturn,-retYears))/realReturn * (1+realReturn); }
          return { result: corpus, sub: 'Future monthly expense at retirement: ' + fmtINR(futureMonthlyExpense) + ' · ' + retYears + ' yrs post-retirement' };
        }
      },
      education: {
        icon:'🎓', title:"Child's Education", desc:'Plan for rising education costs in India & abroad.',
        fields:[
          {id:'cost', label:'Current Education Cost (₹)', def:2000000, min:200000, max:20000000, step:100000},
          {id:'years', label:'Years To Goal', def:12, min:1, max:25, step:1},
          {id:'inflation', label:'Education Inflation (% p.a.)', def:8, min:4, max:15, step:0.5},
          {id:'returnPct', label:'Expected SIP Return (% p.a.)', def:12, min:4, max:20, step:0.5}
        ],
        resultLabel:'Required Monthly SIP',
        calc:function(v){
          var futureCost = v.cost * Math.pow(1+v.inflation/100, v.years);
          var sip = requiredSIPForGoal(futureCost, v.returnPct, v.years);
          return { result: sip, sub: 'Future cost of education: ' + fmtCompact(futureCost) };
        }
      },
      emergency: {
        icon:'🛡️', title:'Emergency Fund', desc:'Calculate your ideal safety net amount.',
        fields:[
          {id:'expense', label:'Monthly Household Expense (₹)', def:75000, min:10000, max:1000000, step:5000},
          {id:'months', label:'Months Of Cover Needed', def:6, min:3, max:24, step:1}
        ],
        resultLabel:'Recommended Emergency Fund',
        calc:function(v){
          return { result: v.expense*v.months, sub: v.months + ' months × ' + fmtINR(v.expense) + ' monthly expense' };
        }
      },
      home: {
        icon:'🏠', title:'Home Purchase', desc:'Down payment + EMI readiness calculator.',
        fields:[
          {id:'value', label:'Home Value (₹)', def:8000000, min:1000000, max:100000000, step:100000},
          {id:'downPct', label:'Down Payment (%)', def:20, min:10, max:50, step:1},
          {id:'rate', label:'Loan Interest Rate (% p.a.)', def:8.5, min:5, max:15, step:0.1},
          {id:'tenure', label:'Loan Tenure (Years)', def:20, min:5, max:30, step:1}
        ],
        resultLabel:'Estimated Monthly EMI',
        calc:function(v){
          var downPayment = v.value*v.downPct/100;
          var loanAmount = v.value-downPayment;
          var m = emi(loanAmount, v.rate, v.tenure);
          return { result: m, sub: 'Down payment: ' + fmtCompact(downPayment) + ' · Loan amount: ' + fmtCompact(loanAmount) };
        }
      },
      swp: {
        icon:'💸', title:'SWP / Income', desc:'Monthly income from your mutual fund corpus.',
        fields:[
          {id:'corpus', label:'Corpus Amount (₹)', def:5000000, min:100000, max:100000000, step:100000},
          {id:'returnPct', label:'Expected Return (% p.a.)', def:10, min:2, max:20, step:0.5},
          {id:'years', label:'Withdrawal Period (Years)', def:20, min:1, max:40, step:1}
        ],
        resultLabel:'Sustainable Monthly Withdrawal',
        calc:function(v){
          var n = v.years*12, r = v.returnPct/1200;
          var m = r === 0 ? v.corpus/n : (v.corpus*r) / (1-Math.pow(1+r,-n));
          return { result: m, sub: 'Corpus lasts ' + v.years + ' years at ' + v.returnPct + '% p.a.' };
        }
      },
      inflation: {
        icon:'📉', title:'Inflation Impact', desc:'What will ₹1 Cr be worth in 20 years?',
        fields:[
          {id:'amount', label:'Amount Today (₹)', def:10000000, min:100000, max:100000000, step:100000},
          {id:'inflation', label:'Inflation (% p.a.)', def:6, min:2, max:12, step:0.5},
          {id:'years', label:'Years', def:20, min:1, max:40, step:1}
        ],
        resultLabel:'Equivalent Purchasing Power',
        calc:function(v){
          var real = v.amount/Math.pow(1+v.inflation/100, v.years);
          return { result: real, sub: fmtCompact(v.amount) + ' today will feel like ' + fmtCompact(real) + " in today's money" };
        }
      },
      tax: {
        icon:'🧾', title:'Tax Saving (80C)', desc:'Optimise your ELSS and 80C investments.',
        fields:[
          {id:'invested', label:'Planned 80C Investment (₹, max 1.5L)', def:150000, min:0, max:150000, step:5000},
          {id:'slab', label:'Tax Slab (%)', def:30, min:5, max:30, step:5}
        ],
        resultLabel:'Estimated Tax Saved',
        calc:function(v){
          var eligible = Math.min(v.invested, 150000);
          var saved = eligible*v.slab/100;
          return { result: saved, sub: 'Eligible investment: ' + fmtINR(eligible) + ' at ' + v.slab + '% slab (plus applicable cess)' };
        }
      },
      goal: {
        icon:'🎯', title:'Wealth Goal', desc:'Custom target — how much SIP to reach ₹X?',
        fields:[
          {id:'target', label:'Target Amount (₹)', def:10000000, min:100000, max:200000000, step:100000},
          {id:'years', label:'Time Period (Years)', def:15, min:1, max:40, step:1},
          {id:'returnPct', label:'Expected Return (% p.a.)', def:12, min:4, max:20, step:0.5}
        ],
        resultLabel:'Required Monthly SIP',
        calc:function(v){
          var sip = requiredSIPForGoal(v.target, v.returnPct, v.years);
          return { result: sip, sub: 'To reach ' + fmtCompact(v.target) + ' in ' + v.years + ' years' };
        }
      }
    };

    function renderTool(key){
      var tool = tools[key];
      iconEl.textContent = tool.icon;
      titleEl.textContent = tool.title;
      descEl.textContent = tool.desc;
      resultLabelEl.textContent = tool.resultLabel;

      var html = '';
      tool.fields.forEach(function(f){
        html += '<div class="calc-field">' +
          '<div class="calc-field-head"><label for="tf_' + f.id + '">' + f.label + '</label><span class="calc-val" id="tfval_' + f.id + '">' + fmtNum(f.def) + '</span></div>' +
          '<input type="range" id="tf_' + f.id + '" min="' + f.min + '" max="' + f.max + '" step="' + f.step + '" value="' + f.def + '">' +
          '</div>';
      });
      fieldsEl.innerHTML = html;

      function recompute(){
        var values = {};
        tool.fields.forEach(function(f){
          var el = document.getElementById('tf_' + f.id);
          values[f.id] = +el.value;
          document.getElementById('tfval_' + f.id).textContent = fmtNum(+el.value);
        });
        var out = tool.calc(values);
        resultEl.textContent = fmtCompact(out.result);
        subEl.textContent = out.sub;
      }
      tool.fields.forEach(function(f){
        document.getElementById('tf_' + f.id).addEventListener('input', recompute);
      });
      recompute();
    }

    document.getElementById('moreToolsGrid').addEventListener('click', function(e){
      var card = e.target.closest('.tool-card');
      if(!card) return;
      renderTool(card.dataset.tool);
      modal.hidden = false;
    });

    function close(){ modal.hidden = true; }
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', function(e){ if(e.target === modal) close(); });
    document.getElementById('toolModalCta').addEventListener('click', close);
  })();

})();
