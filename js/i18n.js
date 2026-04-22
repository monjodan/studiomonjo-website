/**
 * Studio Monjo i18n runtime for JS-rendered strings.
 *
 * Each locale page sets window.SM_LOCALE = 'en' | 'ko' before loading this file.
 * Page-level static copy lives in the HTML for SEO; this catalog covers only
 * what JavaScript renders (form labels, button text, error messages, dynamic
 * counts, status pills).
 *
 * Usage:
 *   T('commission.send')
 *   T('readyMade.availableCount', { count: 3 })
 */
(function () {
  var DEFAULT_LOCALE = 'en';

  var MESSAGES = {
    en: {
      /* ---- dynamic offering / ready-made / FAQ copy ---- */
      'offer.altExample': '{name} hand-painted notebook — example',
      'offer.pages': '{count} pages',
      'offer.included.paper': 'Paper made for fountain pens — no feathering, no bleed-through',
      'offer.included.cover': 'Hand-painted cover in ink and watercolour',
      'offer.included.binding': 'Hand-stitched binding',
      'offer.included.signed': 'Signed and stamped',
      'offer.dimPages': '{dims} · {pages} pages',

      /* CTA labels (wired via data-commission + piece cards) */
      'cta.commission': 'Commission ↗',
      'cta.buyOnNaver': 'Buy on Naver ↗',
      'cta.shopOnNaver': 'Shop on Naver ↗',
      'cta.reserve': 'Reserve ↗',
      'cta.reserved': 'Reserved',
      'cta.international': 'International ↗',
      'cta.shop': 'Shop',
      'cta.shopExt': 'Shop ↗',
      'cta.naverShop': 'Naver Shop',

      /* ready-made pill labels */
      'status.available': 'Available',
      'status.reserved': 'Reserved',
      'status.sold': 'Sold',
      'status.comingSoon': 'Coming soon',

      /* ready-made lede (adaptive) */
      'readyMade.gallery': '{title} — view gallery',
      'readyMade.ledeAvailable': '{count} available right now. Each piece is unique — once it\u2019s gone, it\u2019s gone. If nothing here fits, commission one above.',
      'readyMade.ledeNone': 'Nothing available right now — previous pieces below. For something new, commission one above.',

      /* loading / error states */
      'load.loading': 'Loading…',
      'load.notebooksError': 'Could not load the notebooks.',

      /* ---- essays ---- */
      'essays.lang': 'Korean · Essay',
      'essays.read': 'Read →',
      'essays.loading': 'Loading essays…',
      'essays.empty': 'No essays yet.',
      'essays.unavailable': 'Essay list unavailable — visit Brunch directly.',
      'essays.networkError': 'Could not load essays. Visit Brunch directly below.',
      'essays.intro': '{count} essays on Brunch — on consciousness, control, aesthetics, and living between languages and cultures.',
      'essays.introSingular': '{count} essay on Brunch — on consciousness, control, aesthetics, and living between languages and cultures.',

      /* ---- commission modal ---- */
      'commission.title': 'Commission a notebook',
      'commission.titleReserve': 'Reserve a piece',
      'commission.intro': 'Tell me which size and any direction you have in mind. I\u2019ll reply within a day with a timeline, shipping quote, and payment details.',
      'commission.introReserve': 'You\u2019re reserving this ready-made piece. I\u2019ll reply within a day with payment and shipping details.',
      'commission.pieceLabel': 'For',
      'commission.size': 'Size',
      'commission.sizeA6': 'A6 — Pocket',
      'commission.sizeA5': 'A5 — Desk',
      'commission.direction': 'Direction',
      'commission.directionOptional': '— optional',
      'commission.directionPh': 'A mood, a palette, a subject. Or leave blank and I\u2019ll choose.',
      'commission.name': 'Name',
      'commission.email': 'Email',
      'commission.emailPh': 'you@example.com',
      'commission.country': 'Country / shipping region',
      'commission.countryPh': 'e.g. France, Korea, Japan',
      'commission.send': 'Send enquiry',
      'commission.sending': 'Sending…',
      'commission.close': 'Close',
      'commission.subjectCommission': 'New notebook commission — Studio Monjo',
      'commission.subjectReserve': 'Ready-made — {piece}',
      'commission.doneTitle': 'Thank you.',
      'commission.doneBody': 'Your enquiry is on its way. I\u2019ll reply personally within 24 hours with next steps.',
      'commission.foot': 'I reply personally, usually within 24 hours. No newsletters, no third-party sharing.',
      'commission.errorSetup': 'The commission form is being set up — please try again shortly.',
      'commission.errorGeneric': 'Something went wrong. Please try again.',
      'commission.errorNetwork': 'Network error. Please try again.',
      'commission.requiredMark': '*',

      /* language switcher */
      'lang.en': 'EN',
      'lang.ko': '한국어',
      'lang.switch': 'Language'
    },

    ko: {
      /* ---- 상품·기성품·FAQ 동적 카피 ---- */
      'offer.altExample': '{name} 손으로 그린 노트 — 예시 이미지',
      'offer.pages': '{count}페이지',
      'offer.included.paper': '만년필에 맞춘 종이 — 번짐 없고 뒷면 비침 없어요',
      'offer.included.cover': '잉크와 수채로 한 장씩 그린 커버',
      'offer.included.binding': '손바느질 제본',
      'offer.included.signed': '스튜디오 낙관과 서명',
      'offer.dimPages': '{dims} · {pages}페이지',

      'cta.commission': '주문 제작 ↗',
      'cta.buyOnNaver': '네이버에서 구매 ↗',
      'cta.shopOnNaver': '네이버에서 쇼핑 ↗',
      'cta.reserve': '예약하기 ↗',
      'cta.reserved': '예약 완료',
      'cta.international': '해외 주문 ↗',
      'cta.shop': '샵',
      'cta.shopExt': '샵 ↗',
      'cta.naverShop': '네이버 스토어',

      'status.available': '구매 가능',
      'status.reserved': '예약 중',
      'status.sold': '판매 완료',
      'status.comingSoon': '준비 중',

      'readyMade.gallery': '{title} — 갤러리 보기',
      'readyMade.ledeAvailable': '지금 바로 받아 갈 수 있는 노트가 {count}권 있어요. 같은 그림은 다시 그리지 않아, 한 번 나가면 그대로 끝이에요. 마음에 드는 것이 없다면 위에서 주문 제작해 보세요.',
      'readyMade.ledeNone': '지금 당장 준비된 기성품은 없어요 — 지난 작업은 아래에서 확인할 수 있고, 새로 받고 싶으시면 위에서 주문 제작해 주세요.',

      'load.loading': '불러오는 중…',
      'load.notebooksError': '노트를 불러오지 못했어요.',

      /* ---- 에세이 ---- */
      'essays.lang': '한국어 · 에세이',
      'essays.read': '읽기 →',
      'essays.loading': '에세이를 불러오는 중…',
      'essays.empty': '아직 공개된 에세이가 없어요.',
      'essays.unavailable': '에세이 목록을 불러올 수 없어요 — 브런치에서 바로 보실 수 있어요.',
      'essays.networkError': '에세이를 불러오지 못했어요. 아래 브런치에서 바로 읽어 보세요.',
      'essays.intro': '브런치에 쓴 에세이 {count}편 — 의식, 통제, 미학, 그리고 언어와 문화 사이에 산다는 것에 대한 글이에요.',
      'essays.introSingular': '브런치에 쓴 에세이 {count}편 — 의식, 통제, 미학, 그리고 언어와 문화 사이에 산다는 것에 대한 글이에요.',

      /* ---- 주문 폼 ---- */
      'commission.title': '노트 주문 제작',
      'commission.titleReserve': '기성품 예약하기',
      'commission.intro': '원하시는 사이즈와, 혹시 염두에 둔 분위기·색감·주제가 있다면 편하게 적어 주세요. 하루 안에 제작 일정과 배송 견적, 결제 방법을 답장으로 보내 드려요.',
      'commission.introReserve': '이 기성품을 예약하시는 거예요. 하루 안에 결제와 배송 관련 안내를 답장으로 드릴게요.',
      'commission.pieceLabel': '대상',
      'commission.size': '사이즈',
      'commission.sizeA6': 'A6 — 포켓',
      'commission.sizeA5': 'A5 — 데스크',
      'commission.direction': '원하시는 방향',
      'commission.directionOptional': '— 선택',
      'commission.directionPh': '분위기, 색감, 주제… 무엇이든 괜찮아요. 비워 두시면 제가 골라서 그려요.',
      'commission.name': '이름',
      'commission.email': '이메일',
      'commission.emailPh': 'you@example.com',
      'commission.country': '배송 국가 / 지역',
      'commission.countryPh': '예) 대한민국, 프랑스, 일본',
      'commission.send': '문의 보내기',
      'commission.sending': '보내는 중…',
      'commission.close': '닫기',
      'commission.subjectCommission': '노트 주문 제작 문의 — 스튜디오 몬조',
      'commission.subjectReserve': '기성품 예약 — {piece}',
      'commission.doneTitle': '감사합니다.',
      'commission.doneBody': '문의가 잘 접수됐어요. 24시간 안에 직접 답장드릴게요.',
      'commission.foot': '제가 직접 답장드리고, 보통 24시간 안에 회신해요. 뉴스레터·외부 공유는 없어요.',
      'commission.errorSetup': '주문 폼을 준비 중이에요 — 잠시 후 다시 시도해 주세요.',
      'commission.errorGeneric': '전송 중 문제가 있었어요. 다시 시도해 주세요.',
      'commission.errorNetwork': '네트워크 오류예요. 다시 시도해 주세요.',
      'commission.requiredMark': '*',

      'lang.en': 'EN',
      'lang.ko': '한국어',
      'lang.switch': '언어'
    }
  };

  function currentLocale() {
    var l = (window.SM_LOCALE || document.documentElement.lang || DEFAULT_LOCALE).toLowerCase();
    return MESSAGES[l] ? l : DEFAULT_LOCALE;
  }

  function format(str, vars) {
    if (!vars) return str;
    return str.replace(/\{(\w+)\}/g, function (_, k) {
      return vars[k] == null ? '' : String(vars[k]);
    });
  }

  function T(key, vars) {
    var loc = currentLocale();
    var dict = MESSAGES[loc] || MESSAGES[DEFAULT_LOCALE];
    var msg = dict[key];
    if (msg == null) msg = (MESSAGES[DEFAULT_LOCALE][key] != null ? MESSAGES[DEFAULT_LOCALE][key] : key);
    return format(msg, vars);
  }

  function pickLocalized(obj, field) {
    if (!obj) return '';
    var loc = currentLocale();
    return obj[field + '_' + loc] || obj[field + '_en'] || obj[field] || '';
  }

  function numberLocale() {
    return currentLocale() === 'ko' ? 'ko-KR' : 'en-US';
  }

  window.SM = window.SM || {};
  window.SM.T = T;
  window.SM.locale = currentLocale;
  window.SM.pickLocalized = pickLocalized;
  window.SM.numberLocale = numberLocale;
})();
