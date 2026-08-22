/* Shared, page-agnostic utilities and widgets — safe to include on any page. */
window.TF = (function(){
  "use strict";

  function fmtINR(num){
    var n = Math.round(num);
    return '₹' + n.toLocaleString('en-IN');
  }
  function fmtCompact(num){
    var abs = Math.abs(num);
    if(abs >= 1e7) return '₹' + (num/1e7).toFixed(2) + ' Cr';
    if(abs >= 1e5) return '₹' + (num/1e5).toFixed(2) + ' L';
    return fmtINR(num);
  }
  function fmtNum(num){
    return Math.round(num).toLocaleString('en-IN');
  }
  function sipFutureValue(monthly, annualRatePct, years){
    var n = years*12, r = annualRatePct/1200;
    if(r === 0) return monthly*n;
    return monthly * ((Math.pow(1+r,n)-1)/r) * (1+r);
  }
  function lumpsumFutureValue(amount, annualRatePct, years){
    return amount * Math.pow(1+annualRatePct/100, years);
  }
  function requiredSIPForGoal(target, annualRatePct, years){
    var n = years*12, r = annualRatePct/1200;
    if(r === 0) return target/n;
    return target / (((Math.pow(1+r,n)-1)/r) * (1+r));
  }
  function emi(principal, annualRatePct, years){
    var n = years*12, r = annualRatePct/1200;
    if(r === 0) return principal/n;
    return principal * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1);
  }

  return {
    fmtINR: fmtINR,
    fmtCompact: fmtCompact,
    fmtNum: fmtNum,
    sipFutureValue: sipFutureValue,
    lumpsumFutureValue: lumpsumFutureValue,
    requiredSIPForGoal: requiredSIPForGoal,
    emi: emi
  };
})();

(function(){
  "use strict";

  /* ---------------- Nav toggle ---------------- */
  var navToggle = document.getElementById('navToggle');
  var nav = document.querySelector('.nav');
  if(navToggle && nav){
    navToggle.addEventListener('click', function(){
      nav.classList.toggle('nav-open');
      document.body.style.overflow = nav.classList.contains('nav-open') ? 'hidden' : '';
    });
    document.querySelectorAll('.nav-links a, .nav-actions a').forEach(function(a){
      a.addEventListener('click', function(){ nav.classList.remove('nav-open'); document.body.style.overflow = ''; });
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && nav.classList.contains('nav-open')){
        nav.classList.remove('nav-open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---------------- FAQ accordion (delegated: works for dynamically-rendered FAQ lists too) ---------------- */
  document.addEventListener('click', function(e){
    var btn = e.target.closest('.faq-q');
    if(!btn) return;
    var item = btn.closest('.faq-item');
    var wasOpen = item.classList.contains('open');
    item.parentElement.querySelectorAll('.faq-item').forEach(function(i){ i.classList.remove('open'); });
    if(!wasOpen) item.classList.add('open');
  });

  /* ---------------- Sticky bottom bar ---------------- */
  (function(){
    var bar = document.getElementById('stickyBar');
    if(!bar) return;
    var closeBtn = document.getElementById('stickyBarClose');
    window.addEventListener('scroll', function(){
      if(window.scrollY > 500){ bar.classList.remove('hidden'); }
    }, {passive:true});
    if(closeBtn){ closeBtn.addEventListener('click', function(){ bar.classList.add('hidden'); }); }
  })();

  /* ---------------- Exit intent modal ---------------- */
  (function(){
    var modal = document.getElementById('exitModal');
    if(!modal) return;
    var closeBtn = document.getElementById('exitModalClose');
    var cta = document.getElementById('exitModalCta');
    var shownOnExitIntent = false;

    function open(){ modal.hidden = false; }
    function close(){ modal.hidden = true; }

    document.addEventListener('mouseout', function(e){
      if(!shownOnExitIntent && !e.relatedTarget && e.clientY < 10){
        shownOnExitIntent = true;
        open();
      }
    });
    // Any element on the page can open this modal directly via data-open-review-modal
    document.addEventListener('click', function(e){
      if(e.target.closest('[data-open-review-modal]')){ open(); }
    });
    if(closeBtn){ closeBtn.addEventListener('click', close); }
    modal.addEventListener('click', function(e){ if(e.target === modal) close(); });
    if(cta){ cta.addEventListener('click', close); }
  })();

})();
