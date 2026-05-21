/* ============================================================
   ROI CALCULATOR — Shared across pages
   Automatically detects which page it's running on by
   checking for page-specific DOM elements or data attributes.
   ============================================================ */

(function () {
  "use strict";

  // -------------------------------------------------------
  // 1. Detect page type
  // -------------------------------------------------------
  // Property Management page uses # of Units input label text
  // Real Estate page uses "Active Listings" label text
  const isRealEstate =
    document.querySelector('.roi-inputs h3')?.textContent?.trim() === 'Your Agent Info' ||
    document.querySelector('label[for="num-units"]')?.textContent?.trim() === 'Active Listings';

  // -------------------------------------------------------
  // 2. Page-specific configuration
  // -------------------------------------------------------
  const CONFIG = isRealEstate
    ? {
        // Real Estate Agent metrics
        missedCallRate: 0.43,
        aiRecoveryRate: 0.85,
        leadToDealRate: 0.25,
        badgeLabel: '↑ +43%',
        hoursPerCall: 0.25,
        hourlyRate: 25,
        businessDays: 20,
        // Pricing thresholds for real estate
        getMonthlyPrice: (listings) => (listings > 20 ? 399 : 199),
        resetValues: { dailyCalls: 8, secondInput: '10000', numUnits: 12 },
        badgeText: '↑ +43%',
      }
    : {
        // Property Management metrics
        missedCallRate: 0.61,
        aiRecoveryRate: 0.85,
        leadToDealRate: 0.2,
        badgeLabel: '↑ +61%',
        hoursPerCall: 0.25,
        hourlyRate: 25,
        businessDays: 20,
        // Pricing thresholds for property management
        getMonthlyPrice: (units) => (units > 50 ? 399 : 199),
        resetValues: { dailyCalls: 20, secondInput: '1500', numUnits: 50 },
        badgeText: '↑ +61%',
      };

  // -------------------------------------------------------
  // 3. Helper functions
  // -------------------------------------------------------
  function parseCurrency(val) {
    return parseFloat(String(val).replace(/,/g, '')) || 0;
  }

  function formatCurrency(num) {
    if (num >= 1000000) {
      return '$' + (num / 1000000).toFixed(1) + 'M';
    }
    return '$' + Math.round(num).toLocaleString();
  }

  // -------------------------------------------------------
  // 4. Main calculation
  // -------------------------------------------------------
  function calculateROI() {
    const dailyCalls = parseInt(document.getElementById('daily-calls')?.value) || 0;
    const secondInput = parseCurrency(document.getElementById('avg-monthly-rent')?.value);
    const numUnits = parseInt(document.getElementById('num-units')?.value) || 0;

    const isAnnual =
      document.querySelector('.roi-period-toggle .active')?.dataset?.period === 'annual';

    const cfg = CONFIG;

    // Core metrics
    const missedPerDay = dailyCalls * cfg.missedCallRate;
    const recoveredPerDay = missedPerDay * cfg.aiRecoveryRate;

    const monthlyRaw = recoveredPerDay * cfg.businessDays * cfg.leadToDealRate;
    const monthlyDeals = Math.round(monthlyRaw);
    const monthlyRevenue = Math.round(monthlyDeals * secondInput);
    const monthlyHours = Math.round(recoveredPerDay * cfg.hoursPerCall * cfg.businessDays);

    // Scale to period
    const dealsRecovered = isAnnual ? monthlyDeals * 12 : monthlyDeals;
    const revenueRecovered = isAnnual ? monthlyRevenue * 12 : monthlyRevenue;
    const hoursSavedPeriod = isAnnual ? monthlyHours * 12 : monthlyHours;

    const payrollSavedValue = Math.round(hoursSavedPeriod * cfg.hourlyRate);

    // Payback period
    const monthlyPrice = cfg.getMonthlyPrice(numUnits);
    const paybackText =
      monthlyRevenue > monthlyPrice
        ? '<1 month'
        : Math.ceil(monthlyPrice / Math.max(monthlyRevenue, 1)) + ' months';

    // Update DOM
    const extraJobsEl = document.getElementById('extra-jobs');
    if (extraJobsEl) extraJobsEl.textContent = dealsRecovered;

    const revenueExtraEl = document.getElementById('revenue-extra');
    if (revenueExtraEl) revenueExtraEl.textContent = formatCurrency(revenueRecovered);

    const hoursSavedEl = document.getElementById('hours-saved');
    if (hoursSavedEl) hoursSavedEl.textContent = hoursSavedPeriod;

    const hoursDetailEl = document.getElementById('hours-saved-detail');
    if (hoursDetailEl) {
      const label = isRealEstate ? 'agent time' : 'payroll';
      hoursDetailEl.textContent =
        hoursSavedPeriod + ' hours saved, worth ' + formatCurrency(payrollSavedValue) + ' in ' + label;
    }

    const paybackEl = document.getElementById('roi-payback');
    if (paybackEl) paybackEl.innerHTML = paybackText;

    const badge = document.querySelector('.roi-result-extra .roi-result-badge');
    if (badge) badge.textContent = cfg.badgeText;
  }

  // -------------------------------------------------------
  // 5. Wire up events
  // -------------------------------------------------------
  // Period toggle buttons
  const periodBtns = document.querySelectorAll('.roi-period-toggle button');
  periodBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      periodBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      calculateROI();
    });
  });

  // Input listeners
  ['daily-calls', 'avg-monthly-rent', 'num-units'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calculateROI);
  });

  // Reset button
  const resetBtn = document.getElementById('roi-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const r = CONFIG.resetValues;
      const callsEl = document.getElementById('daily-calls');
      const rentEl = document.getElementById('avg-monthly-rent');
      const unitsEl = document.getElementById('num-units');
      if (callsEl) callsEl.value = r.dailyCalls;
      if (rentEl) rentEl.value = r.secondInput;
      if (unitsEl) unitsEl.value = r.numUnits;
      calculateROI();
    });
  }

  // Format second input on blur (add commas)
  const secondInputEl = document.getElementById('avg-monthly-rent');
  if (secondInputEl) {
    secondInputEl.addEventListener('blur', () => {
      let val = parseCurrency(secondInputEl.value);
      if (val > 0) secondInputEl.value = val.toLocaleString();
      calculateROI();
    });
  }

  // -------------------------------------------------------
  // 6. Initial calculation
  // -------------------------------------------------------
  if (document.getElementById('daily-calls')) {
    calculateROI();
  }
})();
