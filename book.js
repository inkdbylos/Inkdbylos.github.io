/* INKD Studio — booking funnel */
(function () {
  var C = window.INKD_CONFIG || {};
  var API = C.API_URL;
  var token = new URLSearchParams(location.search).get('c');
  var VIEWS = ['loading', 'error', 'project', 'dates', 'review', 'deposit', 'status'];
  var STEP_OF = { project: 1, dates: 2, review: 3, deposit: 4 };
  var state = { d: null, selected: [], byDay: {}, months: [], monthIdx: 0, day: null, timer: null };

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var money = function (n) { return '$' + Number(n).toLocaleString('en-US'); };

  function show(v) {
    VIEWS.forEach(function (x) { $('view-' + x).hidden = x !== v; });
    var n = STEP_OF[v] || 0;
    var steps = document.querySelector('.steps');
    steps.hidden = !n;
    steps.querySelectorAll('li').forEach(function (li, i) {
      li.classList.toggle('is-active', i + 1 === n);
      li.classList.toggle('is-done', i + 1 < n);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setPlural(count) {
    document.querySelectorAll('[data-plural]').forEach(function (el) { el.style.display = count > 1 ? '' : 'none'; });
  }

  function fail(msg, offerStart) {
    $('error-msg').textContent = msg;
    $('error-start').classList.toggle('hide', !offerStart);
    show('error');
  }

  // ---------------- Load ----------------
  function load() {
    show('loading');
    if (!API || String(API).indexOf('PASTE_') === 0) return fail('Online booking isn’t connected yet. Please text to book.');
    if (!token) {
      return fail('This page works with your personal booking link. If you’ve been quoted, use the link I sent you. Haven’t requested your tattoo yet? Start here.', true);
    }
    return fetch(API + '?action=init&c=' + encodeURIComponent(token))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.ok) {
          if (d.code === 'NOT_FOUND') return fail('This booking link isn’t active. Text me and I’ll get you a fresh one.');
          return fail(d.error || 'Something went wrong. Please text me.');
        }
        state.d = d;
        state.selected = [];
        indexSlots();
        if (d.bookings.length) renderStatus();
        else renderProject();
      })
      .catch(function () { fail('We couldn’t load your booking. Check your connection and refresh, or text me.'); });
  }

  function indexSlots() {
    state.byDay = {};
    state.months = [];
    state.d.slots.forEach(function (s) {
      (state.byDay[s.dayKey] = state.byDay[s.dayKey] || []).push(s);
      var m = s.dayKey.slice(0, 7);
      if (state.months.indexOf(m) < 0) state.months.push(m);
    });
    state.months.sort();
    state.monthIdx = 0;
    state.day = null;
  }

  // ---------------- Step 1: Project ----------------
  function renderProject() {
    var d = state.d, c = d.client;
    setPlural(d.remaining);
    $('project-hello').textContent = 'Hi ' + c.firstName + '.';
    var rows = [];
    if (c.projectTitle) rows.push(['Project', esc(c.projectTitle)]);
    rows.push(['Session type', esc(c.categorySummary)]);
    rows.push(['Sessions', d.remaining === c.sessions
      ? String(c.sessions)
      : d.remaining + ' remaining of ' + c.sessions]);
    if (c.quote) rows.push(['Quote', esc(c.quote)]);
    rows.push(['Deposit', money(d.payment.depositPerSession) + ' per session · applied toward your tattoo']);
    $('project-details').innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
    show('project');
  }

  // ---------------- Step 2: Dates ----------------
  function renderDates() {
    var d = state.d;
    setPlural(d.remaining);
    var wks = d.rules.minDaysBetween % 7 === 0 ? (d.rules.minDaysBetween / 7) + ' weeks' : d.rules.minDaysBetween + ' days';
    $('dates-lead').textContent = d.remaining > 1
      ? 'You can reserve up to ' + d.remaining + ' sessions now. Sessions are spaced at least ' + wks + ' apart so each stage can heal.'
      : 'Highlighted dates have open times that fit your session.';
    var none = !d.slots.length;
    $('no-slots').classList.toggle('hide', !none);
    $('picker').classList.toggle('hide', none);
    if (!none) { renderCalendar(); renderTimes(); renderTray(); }
    show('dates');
  }

  function isPicked(s) { return state.selected.some(function (x) { return x.start === s.start; }); }

  function blockedReason(s) {
    if (isPicked(s)) return '';
    var d = state.d;
    if (state.selected.length >= d.remaining) {
      return 'You’ve chosen ' + (d.remaining > 1 ? 'all ' + d.remaining + ' sessions' : 'your session') + '. Remove one to change it.';
    }
    var min = d.rules.minDaysBetween;
    var others = d.bookings.map(function (b) { return b.dayIndex; })
      .concat(state.selected.map(function (x) { return x.dayIndex; }));
    if (others.some(function (di) { return Math.abs(di - s.dayIndex) < min; })) {
      return 'Too close to another session — they need ' + (min % 7 === 0 ? (min / 7) + ' weeks' : min + ' days') + ' between them to heal.';
    }
    return '';
  }

  function renderCalendar() {
    var key = state.months[state.monthIdx];
    var y = +key.slice(0, 4), m = +key.slice(5, 7);
    $('cal-title').textContent = new Date(Date.UTC(y, m - 1, 1))
      .toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    $('cal-prev').disabled = state.monthIdx === 0;
    $('cal-next').disabled = state.monthIdx >= state.months.length - 1;

    var html = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(function (x) { return '<div class="cal-dow">' + x + '</div>'; }).join('');
    var firstDow = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
    var daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
    for (var i = 0; i < firstDow; i++) html += '<span></span>';
    for (var day = 1; day <= daysIn; day++) {
      var dk = key + '-' + (day < 10 ? '0' : '') + day;
      var slots = state.byDay[dk];
      if (!slots) { html += '<span class="cal-day">' + day + '</span>'; continue; }
      var picked = slots.some(isPicked);
      var open = slots.some(function (s) { return !blockedReason(s); });
      var cls = 'cal-day' + (state.day === dk ? ' is-active' : '') + (picked ? ' is-picked' : '') + (!open && !picked ? ' is-blocked' : '');
      html += '<button class="' + cls + '" data-day="' + dk + '" aria-label="' + esc(slots[0].dateLabel) + '">' + day + '</button>';
    }
    $('cal-grid').innerHTML = html;
    $('cal-grid').querySelectorAll('button[data-day]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.day = b.getAttribute('data-day');
        renderCalendar(); renderTimes();
        $('times').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  }

  function renderTimes() {
    var box = $('times');
    if (!state.day || !state.byDay[state.day]) {
      box.innerHTML = '<p class="note">Select a highlighted date to see open times.</p>';
      return;
    }
    var slots = state.byDay[state.day];
    var html = '<h3>' + esc(slots[0].dateLabel) + '</h3>';
    slots.forEach(function (s, i) {
      var reason = blockedReason(s);
      var picked = isPicked(s);
      html += '<button class="time-btn' + (picked ? ' is-picked' : '') + '" data-i="' + i + '"' + (reason ? ' disabled' : '') + '>' +
        '<span>' + esc(s.timeLabel) + '</span><small>' + (picked ? 'Selected ✓' : esc(s.part)) + '</small></button>';
      if (reason && !picked) html += '<p class="note" style="margin:-4px 0 10px">' + esc(reason) + '</p>';
    });
    box.innerHTML = html;
    box.querySelectorAll('.time-btn').forEach(function (b) {
      b.addEventListener('click', function () { toggle(slots[+b.getAttribute('data-i')]); });
    });
  }

  function toggle(s) {
    if (isPicked(s)) state.selected = state.selected.filter(function (x) { return x.start !== s.start; });
    else if (!blockedReason(s)) state.selected.push(s);
    state.selected.sort(function (a, b) { return a.start - b.start; });
    renderCalendar(); renderTimes(); renderTray();
  }

  function renderTray() {
    var d = state.d, n = state.selected.length;
    $('tray-title').textContent = d.remaining > 1
      ? 'Selected · ' + n + ' of up to ' + d.remaining + ' sessions'
      : (n ? 'Selected' : 'No time selected yet');
    $('tray-list').innerHTML = state.selected.map(function (s, i) {
      return '<li><span><b>' + esc(s.dateLabel) + '</b><br><span class="muted">' + esc(s.timeLabel) + '</span></span>' +
        '<button data-rm="' + i + '">Remove</button></li>';
    }).join('');
    $('tray-list').querySelectorAll('button[data-rm]').forEach(function (b) {
      b.addEventListener('click', function () { toggle(state.selected[+b.getAttribute('data-rm')]); });
    });
    $('to-review').disabled = !n;
  }

  // ---------------- Step 3: Review ----------------
  function renderReview() {
    var d = state.d, n = state.selected.length;
    setPlural(n);
    $('review-list').innerHTML = state.selected.map(function (s, i) {
      var num = d.bookings.length + i + 1;
      return '<li><span><b>' + esc(s.dateLabel) + '</b><br><span class="muted">' + esc(s.timeLabel) + ' · Central</span></span>' +
        '<span class="label">Session ' + num + ' of ' + d.client.sessions + '</span></li>';
    }).join('');
    $('review-total').textContent = money(n * d.payment.depositPerSession);
    $('review-note').textContent = money(d.payment.depositPerSession) + ' per session × ' + n +
      '. Paid by Zelle or Cash App on the next screen — nothing is charged on this website.';
    $('agree').checked = false;
    $('hold-btn').disabled = true;
    $('review-error').classList.add('hide');
    show('review');
  }

  function placeHold() {
    var btn = $('hold-btn');
    btn.disabled = true;
    btn.innerHTML = 'Holding your time…';
    var body = JSON.stringify({ action: 'book', token: token, agreed: true, starts: state.selected.map(function (s) { return s.start; }) });
    fetch(API, { method: 'POST', body: body }) // text/plain body keeps the request simple for Apps Script
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.ok) return renderDeposit(res);
        if (res.code === 'SLOT_TAKEN') {
          alert(res.error);
          return load().then(function () { if (state.d && state.d.remaining) renderDates(); });
        }
        showReviewError(res.error || 'We couldn’t place your hold. Please try again.');
      })
      .catch(function () { showReviewError('Connection problem — your time was not held. Please try again.'); })
      .then(function () { btn.innerHTML = 'Hold my session' + (state.selected.length > 1 ? 's' : '') + ' <span class="arrow">→</span>'; btn.disabled = !$('agree').checked; });
  }

  function showReviewError(msg) {
    var el = $('review-error');
    el.textContent = msg;
    el.classList.remove('hide');
  }

  // ---------------- Step 4: Deposit ----------------
  function paymentBlock(total, holdMs, holdLabel) {
    var p = state.d.payment;
    var tag = String(p.cashTag || '').trim();
    var cashUrl = 'https://cash.app/' + encodeURIComponent(tag).replace('%24', '$') + '/' + total;
    var digits = String(p.phone || '').replace(/\D/g, '');
    return '' +
      '<div class="card" style="text-align:center">' +
      '  <span class="label">Time left to send your deposit</span>' +
      '  <div class="timer" data-countdown="' + holdMs + '">--:--</div>' +
      '  <p class="note" style="margin:4px 0 0">Held until ' + esc(holdLabel) + ' (Central)</p>' +
      '</div>' +
      '<div class="total"><span class="label">Deposit due</span><b>' + money(total) + '</b></div>' +
      '<div class="pay-grid">' +
      '  <div class="pay"><span class="label">Option 1</span><h3>Zelle</h3>' +
      '    <div class="handle">' + esc(p.zelleHandle) + '</div><div class="who">' + (p.zelleName ? 'Recipient: ' + esc(p.zelleName) : 'Send to this email in Zelle') + '</div>' +
      '    <button class="btn btn--ghost" data-copy="' + esc(p.zelleHandle) + '">Copy Zelle info</button></div>' +
      '  <div class="pay"><span class="label">Option 2</span><h3>Cash App</h3>' +
      '    <div class="handle">' + esc(tag) + '</div><div class="who">Amount: ' + money(total) + '</div>' +
      '    <a class="btn" href="' + cashUrl + '" target="_blank" rel="noopener">Open Cash App</a></div>' +
      '</div>' +
      '<div class="card next-steps"><span class="label">After you pay</span><ol class="numbered" style="margin-top:12px">' +
      '  <li><span>Put your <b>full name</b> in the payment note.</span></li>' +
      '  <li><span>Text a screenshot of the payment to <a href="sms:' + digits + '">' + esc(p.phone) + '</a>.</span></li>' +
      (p.photoUploadUrl
        ? '  <li><span>Haven’t sent reference photos yet? Text them, or <a href="' + esc(p.photoUploadUrl) + '" target="_blank" rel="noopener">upload them here</a>.</span></li>'
        : '  <li><span>Haven’t sent reference photos yet? Text them to the same number.</span></li>') +
      '  <li><span>You’ll get a <b>confirmation email</b> once your deposit is received. Unpaid holds are released automatically.</span></li>' +
      '</ol></div>';
  }

  function startCountdown() {
    clearInterval(state.timer);
    var tick = function () {
      document.querySelectorAll('[data-countdown]').forEach(function (el) {
        var left = Math.max(0, +el.getAttribute('data-countdown') - Date.now());
        var h = Math.floor(left / 3600000), m = Math.floor(left % 3600000 / 60000), s = Math.floor(left % 60000 / 1000);
        el.textContent = left ? (h ? h + ':' : '') + (m < 10 && h ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s : 'Expired';
      });
    };
    tick();
    state.timer = setInterval(tick, 1000);
  }

  function wireCopy(root) {
    root.querySelectorAll('[data-copy]').forEach(function (b) {
      b.addEventListener('click', function () {
        var txt = b.getAttribute('data-copy');
        var done = function () { b.textContent = 'Copied ✓'; setTimeout(function () { b.textContent = 'Copy Zelle info'; }, 2000); };
        if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, done); else done();
      });
    });
  }

  function renderDeposit(res) {
    var list = res.booked.map(function (b) {
      return '<li><span><b>' + esc(b.dateLabel) + '</b><br><span class="muted">' + esc(b.timeLabel) + '</span></span><span class="label">' + esc(b.session) + '</span></li>';
    }).join('');
    $('deposit-lead').textContent = 'Your time is on hold. Send your deposit within ' + state.d.rules.holdHours +
      ' hours to lock it in — a copy of these details was emailed to you.';
    $('deposit-body').innerHTML = '<div class="card"><ul class="tray-list" style="margin:0">' + list + '</ul></div>' +
      paymentBlock(res.depositTotal, res.holdExpires, res.holdExpiresLabel);
    wireCopy($('deposit-body'));
    startCountdown();
    show('deposit');
  }

  // ---------------- Returning client ----------------
  function renderStatus() {
    var d = state.d;
    $('status-hello').textContent = 'Welcome back, ' + d.client.firstName + '.';
    $('status-list').innerHTML = d.bookings.map(function (b) {
      var chip = b.status === 'CONFIRMED'
        ? '<span class="chip chip--ok">Confirmed</span>'
        : '<span class="chip chip--warn">Deposit due</span>';
      return '<li><span><b>' + esc(b.dateLabel) + '</b><br><span class="muted">' + esc(b.timeLabel) + ' · ' + esc(b.session) + '</span></span>' + chip + '</li>';
    }).join('');

    var pending = d.bookings.filter(function (b) { return b.status === 'PENDING' && b.holdExpires; });
    if (pending.length) {
      var soonest = pending.reduce(function (a, b) { return a.holdExpires < b.holdExpires ? a : b; });
      $('status-pay').innerHTML = paymentBlock(pending.length * d.payment.depositPerSession, soonest.holdExpires, soonest.holdExpiresLabel);
      wireCopy($('status-pay'));
      startCountdown();
    } else {
      $('status-pay').innerHTML = '';
    }
    $('status-more').classList.toggle('hide', !(d.remaining > 0));
    show('status');
  }

  // ---------------- Wire up ----------------
  $('to-dates').addEventListener('click', renderDates);
  $('cal-prev').addEventListener('click', function () { if (state.monthIdx > 0) { state.monthIdx--; renderCalendar(); } });
  $('cal-next').addEventListener('click', function () { if (state.monthIdx < state.months.length - 1) { state.monthIdx++; renderCalendar(); } });
  $('to-review').addEventListener('click', renderReview);
  $('back-dates').addEventListener('click', renderDates);
  $('agree').addEventListener('change', function () { $('hold-btn').disabled = !this.checked; });
  $('hold-btn').addEventListener('click', placeHold);
  $('status-more').addEventListener('click', renderProject);

  load();
})();
