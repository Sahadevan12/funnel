(function(){
  "use strict";

  /* ---------------- Featured calculators (SIP, Retirement, Wealth Goal) ---------------- */
  ['sip', 'retirement', 'goal'].forEach(function(key){
    var host = document.getElementById('calc-' + key);
    if(host){ TF_renderCalculator(host, key + '_', TF_CALCULATORS[key]); }
  });

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

      document.querySelectorAll('.risk-shape').forEach(function(s){ s.classList.toggle('active', s.dataset.profile === profile.replace('-Oriented','')); });
    }

    startBtn.addEventListener('click', function(){
      current = 0; total = 0;
      resultBox.hidden = true;
      renderQuestion();
      widget.scrollIntoView({behavior:'smooth', block:'center'});
    });

    document.getElementById('riskRestart').addEventListener('click', function(){
      current = 0; total = 0;
      document.querySelectorAll('.risk-shape').forEach(function(s){ s.classList.remove('active'); });
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

})();
