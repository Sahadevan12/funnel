/* Shared calculator configs — single source of truth for every calculator
   on the site. Consolidates what used to be split between script.js's
   inline SIP/LumpSum/WealthGap wiring and its 8-tool modal object. */
window.TF_CALCULATORS = (function(){
  "use strict";
  var fmtINR = TF.fmtINR, fmtCompact = TF.fmtCompact;
  var sipFutureValue = TF.sipFutureValue, lumpsumFutureValue = TF.lumpsumFutureValue;
  var requiredSIPForGoal = TF.requiredSIPForGoal, emi = TF.emi;

  return {
    sip: {
      title: 'SIP Calculator',
      resultLabel: 'Estimated Corpus',
      featured: true,
      fields: [
        {id:'amount', label:'Monthly SIP Amount (₹)', def:25000, min:1000, max:500000, step:1000},
        {id:'ret', label:'Expected Return (% p.a.)', def:12, min:1, max:30, step:0.5},
        {id:'years', label:'Time Period (Years)', def:15, min:1, max:40, step:1}
      ],
      calc: function(v){
        var fv = sipFutureValue(v.amount, v.ret, v.years);
        var invested = v.amount*v.years*12;
        return { result: fv, sub: 'Invested: ' + fmtINR(invested) + ' · Wealth Gain: ' + fmtINR(fv-invested) };
      }
    },
    lumpsum: {
      title: 'Lump Sum Calculator',
      resultLabel: 'Future Value',
      fields: [
        {id:'amount', label:'Investment Amount (₹)', def:1000000, min:10000, max:20000000, step:10000},
        {id:'ret', label:'Expected Return (% p.a.)', def:14, min:1, max:30, step:0.5},
        {id:'years', label:'Time Period (Years)', def:10, min:1, max:40, step:1}
      ],
      calc: function(v){
        var fv = lumpsumFutureValue(v.amount, v.ret, v.years);
        return { result: fv, sub: 'Invested: ' + fmtINR(v.amount) + ' · Wealth Gain: ' + fmtINR(fv-v.amount) };
      }
    },
    retirement: {
      title: 'Retirement Calculator',
      resultLabel: 'Corpus Needed At Retirement',
      featured: true,
      fields: [
        {id:'expense', label:'Monthly Expense Today (₹)', def:60000, min:10000, max:500000, step:5000},
        {id:'curAge', label:'Current Age', def:35, min:18, max:60, step:1},
        {id:'retAge', label:'Retirement Age', def:60, min:40, max:70, step:1},
        {id:'lifeExp', label:'Life Expectancy', def:85, min:70, max:100, step:1},
        {id:'inflation', label:'Inflation (% p.a.)', def:6, min:2, max:12, step:0.5},
        {id:'postReturn', label:'Post-Retirement Return (% p.a.)', def:8, min:2, max:15, step:0.5}
      ],
      calc: function(v){
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
    goal: {
      title: 'Wealth Goal Calculator',
      resultLabel: 'Required Monthly SIP',
      featured: true,
      fields: [
        {id:'target', label:'Target Amount (₹)', def:10000000, min:100000, max:200000000, step:100000},
        {id:'years', label:'Time Period (Years)', def:15, min:1, max:40, step:1},
        {id:'returnPct', label:'Expected Return (% p.a.)', def:12, min:4, max:20, step:0.5}
      ],
      calc: function(v){
        var sip = requiredSIPForGoal(v.target, v.returnPct, v.years);
        return { result: sip, sub: 'To reach ' + fmtCompact(v.target) + ' in ' + v.years + ' years' };
      }
    },
    education: {
      title: "Child's Education",
      resultLabel: 'Required Monthly SIP',
      fields: [
        {id:'cost', label:'Current Education Cost (₹)', def:2000000, min:200000, max:20000000, step:100000},
        {id:'years', label:'Years To Goal', def:12, min:1, max:25, step:1},
        {id:'inflation', label:'Education Inflation (% p.a.)', def:8, min:4, max:15, step:0.5},
        {id:'returnPct', label:'Expected SIP Return (% p.a.)', def:12, min:4, max:20, step:0.5}
      ],
      calc: function(v){
        var futureCost = v.cost * Math.pow(1+v.inflation/100, v.years);
        var sip = requiredSIPForGoal(futureCost, v.returnPct, v.years);
        return { result: sip, sub: 'Future cost of education: ' + fmtCompact(futureCost) };
      }
    },
    emergency: {
      title: 'Emergency Fund',
      resultLabel: 'Recommended Emergency Fund',
      fields: [
        {id:'expense', label:'Monthly Household Expense (₹)', def:75000, min:10000, max:1000000, step:5000},
        {id:'months', label:'Months Of Cover Needed', def:6, min:3, max:24, step:1}
      ],
      calc: function(v){
        return { result: v.expense*v.months, sub: v.months + ' months × ' + fmtINR(v.expense) + ' monthly expense' };
      }
    },
    home: {
      title: 'Home Purchase',
      resultLabel: 'Estimated Monthly EMI',
      fields: [
        {id:'value', label:'Home Value (₹)', def:8000000, min:1000000, max:100000000, step:100000},
        {id:'downPct', label:'Down Payment (%)', def:20, min:10, max:50, step:1},
        {id:'rate', label:'Loan Interest Rate (% p.a.)', def:8.5, min:5, max:15, step:0.1},
        {id:'tenure', label:'Loan Tenure (Years)', def:20, min:5, max:30, step:1}
      ],
      calc: function(v){
        var downPayment = v.value*v.downPct/100;
        var loanAmount = v.value-downPayment;
        var m = emi(loanAmount, v.rate, v.tenure);
        return { result: m, sub: 'Down payment: ' + fmtCompact(downPayment) + ' · Loan amount: ' + fmtCompact(loanAmount) };
      }
    },
    swp: {
      title: 'SWP / Income',
      resultLabel: 'Sustainable Monthly Withdrawal',
      fields: [
        {id:'corpus', label:'Corpus Amount (₹)', def:5000000, min:100000, max:100000000, step:100000},
        {id:'returnPct', label:'Expected Return (% p.a.)', def:10, min:2, max:20, step:0.5},
        {id:'years', label:'Withdrawal Period (Years)', def:20, min:1, max:40, step:1}
      ],
      calc: function(v){
        var n = v.years*12, r = v.returnPct/1200;
        var m = r === 0 ? v.corpus/n : (v.corpus*r) / (1-Math.pow(1+r,-n));
        return { result: m, sub: 'Corpus lasts ' + v.years + ' years at ' + v.returnPct + '% p.a.' };
      }
    },
    inflation: {
      title: 'Inflation Impact',
      resultLabel: 'Equivalent Purchasing Power',
      fields: [
        {id:'amount', label:'Amount Today (₹)', def:10000000, min:100000, max:100000000, step:100000},
        {id:'inflation', label:'Inflation (% p.a.)', def:6, min:2, max:12, step:0.5},
        {id:'years', label:'Years', def:20, min:1, max:40, step:1}
      ],
      calc: function(v){
        var real = v.amount/Math.pow(1+v.inflation/100, v.years);
        return { result: real, sub: fmtCompact(v.amount) + ' today will feel like ' + fmtCompact(real) + " in today's money" };
      }
    },
    tax: {
      title: 'Tax Saving (80C)',
      resultLabel: 'Estimated Tax Saved',
      fields: [
        {id:'invested', label:'Planned 80C Investment (₹, max 1.5L)', def:150000, min:0, max:150000, step:5000},
        {id:'slab', label:'Tax Slab (%)', def:30, min:5, max:30, step:5}
      ],
      calc: function(v){
        var eligible = Math.min(v.invested, 150000);
        var saved = eligible*v.slab/100;
        return { result: saved, sub: 'Eligible investment: ' + fmtINR(eligible) + ' at ' + v.slab + '% slab (plus applicable cess)' };
      }
    },
    wealthgap: {
      title: 'Portfolio Structure & Allocation Review',
      desc: 'See the mathematical effect of a return-rate gap over time — enter your own assumptions.',
      resultLabel: 'Illustrative Difference',
      note: 'Illustrative only, based on the rates you enter. Not a projection, promise or guarantee of what True Funnel can achieve.',
      fields: [
        {id:'corpus', label:'Your Corpus (₹)', def:5000000, min:100000, max:50000000, step:100000},
        {id:'current', label:'Current Return (%)', def:9, min:1, max:25, step:0.5},
        {id:'compare', label:'Comparison Return (%)', def:12, min:1, max:30, step:0.5},
        {id:'years', label:'Time Period (Yrs)', def:10, min:1, max:30, step:1}
      ],
      calc: function(v){
        var fvCur = lumpsumFutureValue(v.corpus, v.current, v.years);
        var fvCmp = lumpsumFutureValue(v.corpus, Math.max(v.compare, v.current), v.years);
        var gap = Math.max(fvCmp-fvCur, 0);
        return { result: gap, sub: 'At ' + v.current + '%: ' + fmtCompact(fvCur) + ' · At ' + v.compare + '%: ' + fmtCompact(fvCmp) };
      }
    }
  };
})();
