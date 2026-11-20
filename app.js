(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem('ongi.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('ongi.' + k, JSON.stringify(v)); } catch { /* 저장 불가 환경 */ } },
  };

  /* ───────── 데이터 ───────── */
  const AUTO_DEVICES = ['거실 조명', '스마트 스피커', '공기청정기', '냉장고', '난방 센서', '현관 센서'];

  const CATEGORIES = [
    { name: '조명·전원', icon: 'cat-power', items: ['조명', '전구', '스위치', '플러그', '멀티탭', '콘센트', '무드등', 'LED 스트립', '조광기', '전력 측정기'] },
    { name: '공기·온도', icon: 'cat-air', items: ['에어컨', '냉난방 조절기', '보일러', '선풍기', '서큘레이터', '가습기', '제습기', '온습도 센서', '공기질 센서', '전기 히터'] },
    { name: '출입·보안', icon: 'cat-security', items: ['도어락', '현관 센서', '창문 센서', '스마트 초인종', '홈캠', '모션 센서', '비상 버튼', '사이렌', '스마트 금고'] },
    { name: '생활·청소', icon: 'cat-cleaning', items: ['로봇청소기', '물걸레 청소기', '세탁기', '건조기', '의류 관리기', '스마트 커튼', '블라인드', '전동 빨래건조대', '식물 조명'] },
    { name: '주방·식생활', icon: 'cat-kitchen', items: ['냉장고', '정수기', '전자레인지', '오븐', '인덕션', '식기세척기', '커피머신', '전기포트', '에어프라이어', '밥솥'] },
    { name: '미디어·네트워크', icon: 'cat-media', items: ['TV', '스마트 스피커', '사운드바', '셋톱박스', '프로젝터', '와이파이 공유기', '허브', '태블릿', '스마트 디스플레이'] },
    { name: '건강·수면', icon: 'sleep', items: ['스마트워치', '매트리스 센서', '수면 조명', '체중계', '혈압계', '안마의자', '아로마 디퓨저', '백색소음기'] },
    { name: '반려·식물', icon: 'cat-pets', items: ['자동 급식기', '급수기', '펫캠', '펫 도어', '식물 센서', '자동 물주기'] },
    { name: '안전·에너지', icon: 'cat-energy', items: ['화재 감지기', '가스 감지기', '누수 센서', '가스 밸브 차단기', '태양광 모니터', '스마트 계량기', '전기차 충전기', '비상등', '일산화탄소 감지기'] },
    { name: '생활 서비스', icon: 'cat-service', optional: true, items: ['택배 알림', '방문 돌봄 연동', '세탁 수거', '장보기 연동', '병원 예약 알림'] },
  ];

  const MOODS = [
    { key: 'tired', img: 'tired', feel: '몸이 지쳤을 때', title: '하루 끝의 포근함', desc: '지친 몸에 느긋한 여백을 주세요', set: '조명 30% · 부드러운 로파이', badge: '포근해지는 중', home: '지금은 포근하게 쉬고 있어요.' },
    { key: 'comfort', img: 'comfort', feel: '편안할 때', title: '지금의 편안함', desc: '좋은 흐름을 은은하게 이어가요', set: '조명 50% · 잔잔한 재즈', badge: '편안해지는 중', home: '지금은 조금 편안해 보여요.' },
    { key: 'down', img: 'down', feel: '마음이 가라앉을 때', title: '마음에 작은 온기', desc: '나만의 속도로 쉬어가는 시간', set: '조명 40% · 따뜻한 피아노', badge: '따뜻해지는 중', home: '마음이 조금씩 따뜻해지고 있어요.' },
    { key: 'pounding', img: 'pounding', feel: '심장이 빨리 뛸 때', title: '잠시, 천천히', desc: '주변 자극을 줄인 조용한 분위기', set: '조명 25% · 잔잔한 빗소리', badge: '차분해지는 중', home: '숨이 천천히 고르게 돌아오고 있어요.' },
    { key: 'tense', img: 'tense', feel: '긴장될 때', title: '여유를 찾는 틈', desc: '분주한 순간에 잠깐의 쉼표를', set: '조명 35% · 고요한 숲 소리', badge: '느슨해지는 중', home: '긴장이 조금씩 풀리고 있어요.' },
    { key: 'excited', img: 'excited', feel: '기분 좋게 설렐 때', title: '기분 좋은 반짝임', desc: '가벼운 설렘을 공간에도 담아요', set: '조명 70% · 산뜻한 어쿠스틱', badge: '설레는 중', home: '오늘은 기분 좋은 반짝임이 느껴져요.' },
  ];

  const HOME_DEVICES = [
    { room: '거실', items: [['light', '거실 조명', '켜짐 · 40%'], ['speaker', '스마트 스피커', '재즈 재생 중'], ['tv', 'TV', '대기', 1], ['purifier', '공기청정기', '조용히'], ['curtain', '커튼', '30% 열림']] },
    { room: '침실', items: [['moodlight', '무드등', '살구 · 숨쉬기'], ['humidifier', '가습기', '45%'], ['diffuser', '디퓨저', '라벤더'], ['mattress', '매트리스 센서', '연결됨', 1]] },
    { room: '주방', items: [['fridge', '냉장고', '연결됨', 1], ['water', '정수기', '연결됨', 1]] },
    { room: '현관', items: [['doorlock', '도어락', '잠김', 1], ['entrance', '현관 센서', '연결됨', 1]] },
  ];

  const state = {
    theme: store.get('theme', 'aurora'),
    picked: new Set(),
    added: [],
    savedName: null,
  };

  /* ───────── 테마 ───────── */
  const themeColor = $('meta[name="theme-color"]');
  function applyTheme(t) {
    state.theme = t;
    document.body.dataset.theme = t;
    themeColor.setAttribute('content', t === 'white' ? '#ffffff' : '#f7f3fb');
    $$('[data-theme-opt]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.themeOpt === t)));
    $('#themeName').textContent = t === 'white' ? '화이트' : '오로라';
    store.set('theme', t);
  }
  $$('[data-theme-opt]').forEach(b => b.addEventListener('click', () => applyTheme(b.dataset.themeOpt)));
  $('#themeRow').addEventListener('click', () => {
    applyTheme(state.theme === 'white' ? 'aurora' : 'white');
    toast(state.theme === 'white' ? '화이트 테마로 바꿨어요' : '오로라 테마로 바꿨어요');
  });
  applyTheme(state.theme);

  /* ───────── 라우터 (해시 기반: 안드로이드 뒤로가기 지원) ───────── */
  const screens = Object.fromEntries($$('[data-screen]').map(s => [s.dataset.screen, s]));
  let current = null;
  const enterHooks = {};

  function show(name, dir = 1) {
    if (!screens[name]) name = 'welcome';
    if (name === current) return;
    const prev = current && screens[current];
    const next = screens[name];
    if (prev) {
      prev.classList.remove('active', 'leave', 'leave-back');
      prev.classList.add(dir > 0 ? 'leave' : 'leave-back');
    }
    next.classList.remove('leave', 'leave-back');
    next.scrollTop = 0;
    next.classList.add('active');
    current = name;
    closeSheet(true);
    enterHooks[name] && enterHooks[name]();
  }

  function go(name, { replace = false } = {}) {
    if (name === current) return;
    if (replace) { replacing = true; location.replace('#' + name); }
    else location.hash = name;
  }

  // 앱 안에서 쌓인 화면 기록 (뒤로가기 방향/가능 여부 판단용)
  const stack = [];
  let replacing = false;
  window.addEventListener('hashchange', () => {
    const name = location.hash.slice(1) || 'welcome';
    let dir = 1;
    if (replacing) { stack[stack.length - 1] = name; replacing = false; }
    else if (stack.length > 1 && stack[stack.length - 2] === name) { stack.pop(); dir = -1; }
    else stack.push(name);
    show(name, dir);
  });

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-go]');
    if (t) { e.preventDefault(); go(t.dataset.go, { replace: t.hasAttribute('data-replace') }); return; }
    if (e.target.closest('.back')) { e.preventDefault(); back(); }
  });

  function back() {
    if (stack.length > 1) history.back();
    else go(store.get('onboarded', false) ? 'home' : 'welcome', { replace: true });
  }

  /* ───────── 토스트 ───────── */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2000);
  }

  /* ───────── 온보딩 · 기기 검색 ───────── */
  let searchTimer;
  enterHooks.search = () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { if (current === 'search') go('found', { replace: true }); }, 3200);
  };

  function chipGrid(el, list) {
    el.innerHTML = list.map((n, i) => `<div class="found-chip" style="animation-delay:${i * 70}ms">${n}</div>`).join('');
  }
  enterHooks.found = () => chipGrid($('#foundGrid'), AUTO_DEVICES);
  chipGrid($('#autoGrid'), AUTO_DEVICES);

  /* 직접 선택 */
  const catList = $('#catList');
  catList.innerHTML = CATEGORIES.map((c, ci) => `
    <div class="cat${ci === 0 ? ' open' : ''}" data-cat="${ci}">
      <button class="cat-head" aria-expanded="${ci === 0}">
        <img class="ci" src="assets/ic/${c.icon === 'sleep' ? 'sleep3' : c.icon}.svg" alt="" />
        <span class="cn">${c.name}<small>${c.optional ? '·  선택' : c.items.length}</small><b></b></span>
        <span class="tog"><img src="assets/ic/${ci === 0 ? 'minus' : 'plus'}.svg" alt="" /></span>
      </button>
      <div class="cat-body">${c.items.map(it => `<button class="dev-pick" data-dev="${it}">${it}</button>`).join('')}</div>
    </div>`).join('');

  catList.addEventListener('click', e => {
    const head = e.target.closest('.cat-head');
    if (head) {
      const cat = head.parentElement;
      const open = cat.classList.toggle('open');
      head.setAttribute('aria-expanded', open);
      $('.tog img', head).src = `assets/ic/${open ? 'minus' : 'plus'}.svg`;
      return;
    }
    const pick = e.target.closest('.dev-pick');
    if (pick) {
      const n = pick.dataset.dev;
      const on = pick.classList.toggle('on');
      on ? state.picked.add(n) : state.picked.delete(n);
      updatePicked();
    }
  });

  function updatePicked() {
    $('#manualCount').textContent = state.picked.size;
    $$('.cat', catList).forEach(cat => {
      const cnt = $$('.dev-pick.on', cat).length;
      $('.cn b', cat).textContent = cnt ? cnt + '개 선택' : '';
    });
  }

  $$('.tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.tab').forEach(t => t.classList.toggle('on', t === tab));
    $$('.tab-pane').forEach(p => p.classList.toggle('on', p.dataset.pane === tab.dataset.tab));
  }));

  /* 바텀시트 */
  const sheet = $('#sheet');
  function openSheet() {
    const list = [...state.picked];
    $('#sheetCount').textContent = list.length + '개';
    $('#sheetList').innerHTML = list.length
      ? list.map(n => `<span>${n}</span>`).join('')
      : '<span class="empty">아직 고른 기기가 없어요. 아래 목록에서 기기를 골라주세요.</span>';
    $('#sheetAdd').disabled = !list.length;
    sheet.classList.add('open');
    sheet.setAttribute('aria-hidden', 'false');
  }
  function closeSheet(silent) {
    sheet.classList.remove('open');
    sheet.setAttribute('aria-hidden', 'true');
  }
  $('#addSelected').addEventListener('click', openSheet);
  $$('[data-close]', sheet).forEach(b => b.addEventListener('click', () => closeSheet()));
  $('#sheetAdd').addEventListener('click', () => {
    state.added = [...new Set([...state.added, ...state.picked])];
    closeSheet();
    toast(`${state.picked.size}개의 기기를 추가했어요`);
    state.picked.clear();
    $$('.dev-pick.on').forEach(b => b.classList.remove('on'));
    updatePicked();
    renderDevices();
    if (store.get('onboarded', false)) go('devices', { replace: true });
    else go('learn', { replace: true });
  });

  /* 집 알아가기 (0.09초마다 1%씩) */
  let learnTimer;
  const LEARN_STEPS = [
    [0, '집 안을 둘러보기 시작했어요'],
    [15, '거실을 둘러보고 있어요'],
    [40, '주방을 살펴보고 있어요'],
    [62, '현관을 확인하고 있어요'],
    [82, '침실을 둘러보고 있어요'],
    [100, '집 안을 다 둘러봤어요'],
  ];
  enterHooks.learn = () => {
    clearInterval(learnTimer);
    const total = 6 + state.added.length;
    let p = 0;
    const bar = $('#learnBar'), msg = $('#learnMsg'), stat = $('#learnStat');
    const tick = () => {
      bar.style.width = p + '%';
      msg.textContent = LEARN_STEPS.filter(s => p >= s[0]).pop()[1];
      const spaces = LEARN_STEPS.slice(1, 5).filter(s => p >= s[0]).length;
      stat.textContent = `찾은 공간 ${spaces}곳 · 기기 ${Math.round(total * p / 100)}개`;
    };
    tick();
    learnTimer = setInterval(() => {
      if (current !== 'learn') return clearInterval(learnTimer);
      p += 1; tick();
      if (p >= 100) {
        clearInterval(learnTimer);
        setTimeout(() => current === 'learn' && go('ready', { replace: true }), 700);
      }
    }, 90);
  };
  enterHooks.ready = () => { $('#readyDevices').textContent = 6 + state.added.length; };
  enterHooks.home = () => { store.set('onboarded', true); setGreeting(); };

  /* ───────── 홈 ───────── */
  function setGreeting() {
    const h = new Date().getHours();
    $('#greet').textContent = h < 5 ? '조용한 밤이에요' : h < 11 ? '좋은 아침이에요' : h < 17 ? '좋은 오후예요' : h < 22 ? '좋은 저녁이에요' : '편안한 밤이에요';
  }
  function setHomeMood(m) {
    $('#homeMood').style.setProperty('--img', `url(assets/mood/${m.img}.jpg)`);
    $('#homeBadge').textContent = m.badge;
    $('#homeText').textContent = m.home;
  }

  /* ───────── 저장한 분위기 ───────── */
  const carousel = $('#carousel'), pager = $('#pager');
  function centerPadding() {
    const card = $('.mcard', carousel);
    if (!card || !carousel.clientWidth) return;
    const pad = Math.max(16, (carousel.clientWidth - card.offsetWidth) / 2);
    carousel.style.paddingLeft = carousel.style.paddingRight = pad + 'px';
  }
  window.addEventListener('resize', centerPadding);
  function moodsView() {
    const list = MOODS.map(m => ({ ...m }));
    if (state.savedName) list[0].title = state.savedName;
    return list;
  }
  function renderMoods() {
    const list = moodsView();
    $$('.moodCount').forEach(el => (el.textContent = list.length));
    carousel.innerHTML = list.map((m, i) => `
      <article class="mcard${i === 0 ? ' on' : ''}" data-i="${i}">
        <div class="mood-graphic" style="--img:url(assets/mood/${m.img}.jpg)"></div>
        <div><p class="feel">${m.feel}</p><h3>${esc(m.title)}</h3><p class="desc">${m.desc}</p><p class="set">${m.set}</p></div>
        <button class="on-btn" data-mood="${i}">이 분위기 켜기</button>
      </article>`).join('');
    pager.innerHTML = list.map((_, i) => `<button class="${i === 0 ? 'on' : ''}" aria-label="${i + 1}번째 분위기" data-page="${i}"></button>`).join('');
    $('#moodList').innerHTML = list.map((m, i) => `
      <button class="mrow" data-mood="${i}">
        <span class="thumb"><span class="mood-graphic" style="--img:url(assets/mood/${m.img}.jpg)"></span></span>
        <span class="info"><span class="feel">${m.feel}</span><h3>${esc(m.title)}</h3><span class="desc">${m.desc}</span><span class="set">${m.set} …</span></span>
        ${i === 0 ? '<em class="new">NEW</em>' : ''}
      </button>`).join('');
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  let raf;
  carousel.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const cards = $$('.mcard', carousel);
      const mid = carousel.scrollLeft + carousel.clientWidth / 2;
      let best = 0, bestD = Infinity;
      cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bestD) { bestD = d; best = i; } });
      cards.forEach((c, i) => c.classList.toggle('on', i === best));
      $$('button', pager).forEach((b, i) => b.classList.toggle('on', i === best));
    });
  }, { passive: true });
  pager.addEventListener('click', e => {
    const b = e.target.closest('[data-page]');
    if (!b) return;
    const card = $$('.mcard', carousel)[+b.dataset.page];
    carousel.scrollTo({ left: card.offsetLeft - (carousel.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' });
  });
  carousel.addEventListener('click', e => {
    const card = e.target.closest('.mcard');
    if (card && !card.classList.contains('on') && !e.target.closest('.on-btn')) {
      carousel.scrollTo({ left: card.offsetLeft - (carousel.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' });
    }
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-mood]');
    if (!b) return;
    const m = moodsView()[+b.dataset.mood];
    setHomeMood(m);
    toast(`‘${m.title}’ 분위기를 켰어요`);
    setTimeout(() => go('home'), 650);
  });

  enterHooks.saved = () => {
    const t = $('#savedToast');
    if (state.justSaved) { $('#savedToastText').textContent = `‘${state.savedName}’을 저장했어요`; t.hidden = false; state.justSaved = false; }
    else t.hidden = true;
    centerPadding();
    carousel.scrollLeft = 0;
    carousel.dispatchEvent(new Event('scroll'));
  };

  /* ───────── 분위기 저장 ───────── */
  $$('.opt').forEach(o => o.addEventListener('click', () => $$('.opt').forEach(x => x.classList.toggle('on', x === o))));
  $('#saveMood').addEventListener('click', () => {
    const name = $('#moodName').value.trim() || '오늘의 온기';
    state.savedName = name;
    state.justSaved = true;
    renderMoods();
    go('saved', { replace: true });
  });
  $('#moodName').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });

  /* ───────── 분위기 조절 컨트롤 ───────── */
  $$('[data-seg]').forEach(seg => seg.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b) $$('button', seg).forEach(x => x.classList.toggle('on', x === b));
  }));
  $$('[data-chips]').forEach(ch => ch.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b) $$('button', ch).forEach(x => x.classList.toggle('on', x === b));
  }));
  $$('.slider').forEach(sl => {
    const input = $('input', sl), out = $('b', sl);
    const kelvin = sl.hasAttribute('data-kelvin');
    const upd = () => {
      const v = +input.value, pct = ((v - input.min) / (input.max - input.min)) * 100;
      input.style.setProperty('--p', pct + '%');
      out.textContent = kelvin ? Math.round((2000 + v * 35) / 100) * 100 + 'K' : v + (sl.dataset.suffix || '');
    };
    input.addEventListener('input', upd);
    upd();
  });
  $$('.picker').forEach(p => p.addEventListener('click', () => {
    const opts = p.dataset.options.split(',');
    const v = $('.v', p);
    v.textContent = opts[(opts.indexOf(v.textContent) + 1) % opts.length];
  }));
  let temp = 22;
  $$('[data-step]').forEach(b => b.addEventListener('click', () => {
    temp = Math.min(30, Math.max(16, temp + +b.dataset.step));
    $('#tempVal').textContent = temp + '°';
  }));
  // 조절하면 미리보기가 살짝 반응
  $('[data-screen="adjust"]').addEventListener('input', () => {
    const pv = $('#livePreview');
    pv.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 400 });
  });

  /* ───────── 설정 ───────── */
  $$('.pill-tag').forEach(t => t.addEventListener('click', () => {
    const on = t.classList.toggle('on');
    t.textContent = on ? '켜짐' : '꺼짐';
  }));
  $('#restart').addEventListener('click', () => {
    store.set('onboarded', false);
    state.added = []; state.picked.clear(); updatePicked(); renderDevices();
    go('welcome', { replace: true });
  });

  /* ───────── 우리 집 기기 ───────── */
  function renderDevices() {
    const groups = HOME_DEVICES.map(g => ({ ...g, items: [...g.items] }));
    if (state.added.length) groups.push({ room: '새로 추가한 기기', items: state.added.map(n => ['light', n, '연결 대기', 1]) });
    const total = groups.reduce((a, g) => a + g.items.length, 0);
    $$('.deviceTotal').forEach(el => (el.textContent = total));
    $('#deviceGroups').innerHTML = groups.map(g => `
      <div class="dev-group">
        <p>${g.room}<span>${g.items.length}</span></p>
        <div class="glass dev-card">${g.items.map(([ic, n, st, idle]) => `
          <button class="dev-row${idle ? ' idle' : ''}">
            <img class="di" src="assets/ic/${ic}.svg" alt="" /><span class="n">${esc(n)}</span><span class="st">${st}</span><img class="chev" src="assets/ic/more.svg" alt="" />
          </button>`).join('')}
        </div>
      </div>`).join('');
  }

  /* ───────── 시작 ───────── */
  renderMoods();
  renderDevices();
  updatePicked();
  setGreeting();
  const start = screens[location.hash.slice(1)] ? location.hash.slice(1) : 'welcome';
  stack.push(start);
  if (location.hash.slice(1) !== start) history.replaceState(null, '', '#' + start);
  show(start);

  // 확대 방지(더블탭) — iOS Safari
  let lastTouch = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTouch < 300 && !e.target.closest('input')) e.preventDefault();
    lastTouch = now;
  }, { passive: false });
})();
