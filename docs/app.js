// 共通処理：年齢確認ゲート（板ごとに設置。data-needs-gate="1" のページだけ）／簡易クリック計測（端末内 localStorage）／スタンプ反応（掲示板の反応はスタンプのみ）
(function () {
  // ---------- 年齢確認ゲート（板単位） ----------
  // 全体ゲートは廃止。ゲートが必要な板（リラクゼーション板）のページだけ
  // <body data-needs-gate="1"> と #age-gate マークアップを持ち、この処理が働く。
  // 健全ジャンルの板・LP・その他のページではゲートは出ない。
  var AGE_OK_KEY = "age_ok";
  var AGE_OK_TTL = 30 * 24 * 60 * 60 * 1000; // 通過記録の有効期限：30日
  function agePassed() {
    try {
      var ts = parseInt(localStorage.getItem(AGE_OK_KEY) || "", 10);
      return !isNaN(ts) && (Date.now() - ts) < AGE_OK_TTL;
    } catch (e) {
      return false;
    }
  }
  function buildGate() {
    var existing = document.getElementById("age-gate");
    var needs = document.body && document.body.getAttribute("data-needs-gate") === "1";
    if (!needs) {
      if (existing) existing.remove();
      return;
    }
    if (agePassed()) {
      if (existing) existing.remove();
      return;
    }
    var ov = existing || document.createElement("div");
    ov.id = "age-gate";
    if (!existing) ov.innerHTML =
      '<div class="gate-box">' +
      '<div class="gate-logo">リラクゼーション板<span>（デモ）</span></div>' +
      '<p class="gate-lead">この板には、成人向けの内容を含む宣伝が掲載される場合があります。</p>' +
      '<p class="gate-q">あなたは18歳以上ですか？</p>' +
      '<button id="gate-yes" class="gate-btn yes">はい、18歳以上です</button>' +
      '<button id="gate-no" class="gate-btn no">いいえ</button>' +
      '<p id="gate-msg" class="gate-msg"></p>' +
      '<p class="gate-note">※これはデモサイトです。掲載者・店舗・数値はすべて架空で、写真はAI生成画像を使用しています。</p>' +
      "</div>";
    if (!existing) document.body.appendChild(ov);
    document.body.classList.add("gate-locked");
    document.getElementById("gate-yes").addEventListener("click", function () {
      try { localStorage.setItem(AGE_OK_KEY, String(Date.now())); } catch (e) {}
      ov.remove();
      document.body.classList.remove("gate-locked");
    });
    document.getElementById("gate-no").addEventListener("click", function () {
      location.replace("https://www.google.co.jp/");
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildGate);
  } else {
    buildGate();
  }
})();

// ---------- ユーティリティ ----------
function relTime(min) {
  if (min < 60) return min + "分前";
  if (min < 1440) return Math.floor(min / 60) + "時間前";
  return Math.floor(min / 1440) + "日前";
}
function starText(n) {
  var s = "";
  for (var i = 0; i < 5; i++) s += i < n ? "⭐" : "☆";
  return s;
}
function getStore(key, def) {
  try {
    var v = localStorage.getItem(key);
    return v === null ? def : JSON.parse(v);
  } catch (e) {
    return def;
  }
}
function setStore(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}
// 外部リンクのクリック計測（中継URL方式の原型：端末内でカウント）
function countClick(personId, type) {
  var key = "clicks_" + personId + "_" + type;
  var n = getStore(key, 0) + 1;
  setStore(key, n);
  return n;
}
function toast(msg) {
  var t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function () { t.classList.add("show"); }, 10);
  setTimeout(function () {
    t.classList.remove("show");
    setTimeout(function () { t.remove(); }, 300);
  }, 2200);
}

// ---------- 画像フォールバック（イニシャル＋色プレースホルダ） ----------
var PH_COLORS = {1: "#c96f4a", 2: "#7a9e7e", 3: "#5b7fa6", 4: "#a65b8f", 5: "#8f6a3d", 6: "#4a7a8c", 7: "#b0526b"};
function phColor(id) { return PH_COLORS[id] || "#999"; }
function imgFallback(img) {
  if (!img || img.dataset.fbDone) return;
  img.dataset.fbDone = "1";
  var span = document.createElement("span");
  span.className = "img-fallback";
  span.style.background = img.getAttribute("data-color") || "#999";
  span.textContent = (img.getAttribute("data-name") || img.alt || "？").charAt(0);
  img.replaceWith(span);
}
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("img").forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) imgFallback(img);
  });
});
// ---------- ダッシュボード連動の状態（端末内保存） ----------
function getCardState(id) { return getStore("cardstate_" + id, null); }

// ---------- 反応はスタンプのみ（2026-11-06 設計追加） ----------
// 掲示板の見る側の反応はスタンプだけで行う。コメント・文章・いいねボタンは置かない
// （テキストゼロの原則と、荒れ対策＝前略プロフィールの衰退要因への答え）。
// 絵柄は未定：STAMPS の定義だけ差し替えれば、絵文字→専用画像へ差し替え可能（img に画像URLを入れると画像表示になる）。
var STAMPS = [
  { id: "like", label: "いいね", glyph: "❤️", img: null },
  { id: "hot", label: "熱い", glyph: "🔥", img: null },
  { id: "wow", label: "すごい", glyph: "👏", img: null },
  { id: "check", label: "気になる", glyph: "👀", img: null }
];
function stampSeed(target, stampId) {
  // デモ用の決定的な初期値（架空）。本番ではサーバー集計に置き換える。
  var h = 0, s = target + ":" + stampId;
  for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 37;
}
function stampState(target) { return getStore("bstamps_" + target, { mine: [] }); }
function stampCount(target, stampId) {
  var st = stampState(target);
  return stampSeed(target, stampId) + (st.mine.indexOf(stampId) >= 0 ? 1 : 0);
}
function buildStampBar(target) {
  var bar = document.createElement("div");
  bar.className = "stamp-bar";
  bar.setAttribute("data-stamp-bar", target);
  STAMPS.forEach(function (sp) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "stamp-btn";
    btn.setAttribute("data-stamp-btn", sp.id);
    btn.setAttribute("aria-label", sp.label);
    btn.title = sp.label;
    var face = sp.img
      ? '<img src="' + sp.img + '" alt="' + sp.label + '">'
      : '<span class="stamp-glyph">' + sp.glyph + "</span>";
    btn.innerHTML = face + '<span class="stamp-label">' + sp.label + '</span><span class="stamp-count"></span>';
    btn.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      var st = stampState(target);
      var i = st.mine.indexOf(sp.id);
      if (i >= 0) st.mine.splice(i, 1); else st.mine.push(sp.id);
      setStore("bstamps_" + target, st);
      recordMove(target);
      paintStampBar(bar, target);
      toast("スタンプで反応しました");
    });
    bar.appendChild(btn);
  });
  paintStampBar(bar, target);
  return bar;
}
function paintStampBar(bar, target) {
  var st = stampState(target);
  bar.querySelectorAll("[data-stamp-btn]").forEach(function (btn) {
    var id = btn.getAttribute("data-stamp-btn");
    btn.classList.toggle("on", st.mine.indexOf(id) >= 0);
    btn.querySelector(".stamp-count").textContent = stampCount(target, id);
  });
}
// ---------- 勢い（並びの前提、2026-11-06 メイン決定） ----------
// 並びは「最後に動きがあった順」。動き＝本人の更新（カード側の数字）＋この板での反応（スタンプ）とクリック。
// 仕組みは増やさず、既にある数字だけで組む。複雑なスコア計算はしない。
function recordMove(target) { setStore("bmove_" + target, Date.now()); }
function lastMoveMin(target) {
  var t = getStore("bmove_" + target, null);
  if (!t) return null;
  return Math.max(0, Math.round((Date.now() - t) / 60000));
}
function stampTotal(target) {
  return STAMPS.reduce(function (sum, sp) { return sum + stampCount(target, sp.id); }, 0);
}
document.addEventListener("click", function (ev) {
  var a = ev.target && ev.target.closest ? ev.target.closest(".p-card") : null;
  if (a && a.getAttribute("data-id")) recordMove("card-" + a.getAttribute("data-id"));
});
function stampTargetOf(el, idx) {
  if (el.classList.contains("p-card")) return "card-" + el.getAttribute("data-id");
  var page = (location.pathname.split("/").pop() || "index").replace(".html", "");
  return "url-" + page + "-" + idx;
}
function placeStampBars() {
  var targets = document.querySelectorAll(".p-card, .url-row");
  if (!targets.length) return;
  targets.forEach(function (el, idx) {
    var t = stampTargetOf(el, idx);
    var bar = document.querySelector('[data-stamp-bar="' + t + '"]');
    if (!bar) bar = buildStampBar(t);
    if (el.nextSibling !== bar) el.parentNode.insertBefore(bar, el.nextSibling);
  });
  // 並び替え・絞り込みで対象が移動しても、スタンプ欄が付いてくるようにする
  ["list", "url-rows"].forEach(function (cid) {
    var c = document.getElementById(cid);
    if (!c || typeof MutationObserver === "undefined") return;
    var syncing = false;
    new MutationObserver(function () {
      if (syncing) return;
      syncing = true;
      try { placeStampBars(); } finally { syncing = false; }
    }).observe(c, { childList: true });
  });
  // 反応のルールの明示（テキスト反応が無いことを先に言う）
  var first = targets[0];
  if (first && !document.querySelector(".stamp-note")) {
    var note = document.createElement("p");
    note.className = "stamp-note";
    note.textContent = "この掲示板の反応はスタンプだけです。コメントや文章での反応はできません（テキストを持たない設計と荒れ対策のため）。反応の数はデモの架空表示です。";
    var host = first.parentNode;
    if (host && (host.id === "list" || host.id === "url-rows") && host.parentNode) host.parentNode.insertBefore(note, host);
    else if (host) host.insertBefore(note, first);
  }
}
document.addEventListener("DOMContentLoaded", placeStampBars);

/* ===== 通報→即・仮非表示（2026-11-06 通報対応の決定） =====
   通報は選択式（テキスト入力なし）。1件で即・仮非表示（最終削除ではない）。
   運営確認で「戻す／削除」を決める。デモでは状態を端末内（localStorage）に持つため、
   仮非表示はこの端末の中だけ。本番はサーバー側で全閲覧者に効かせる（仕様ファイル参照）。 */
var REPORT_REASONS = ["範囲外の内容（性的サービスなど）", "権利侵害・なりすまし", "リンク切れ・情報の誤り", "その他"];
var REPORT_KEY = "demo_reports_v1";
function loadReports() {
  try { return JSON.parse(localStorage.getItem(REPORT_KEY) || "{}"); } catch (e) { return {}; }
}
function saveReports(map) {
  try { localStorage.setItem(REPORT_KEY, JSON.stringify(map)); } catch (e) {}
}
function reportKeyOf(el) {
  var card = el.closest ? el.closest(".p-card") : null;
  if (card && card.dataset && card.dataset.id) return "card-" + card.dataset.id;
  if (el.classList.contains("p-card") && el.dataset.id) return "card-" + el.dataset.id;
  var nameEl = el.querySelector ? el.querySelector(".u-name") : null;
  return "url-" + (nameEl ? nameEl.textContent.trim() : "row");
}
function applyProvHide(el) {
  var key = reportKeyOf(el);
  var parent = el.parentNode;
  if (!parent) return;
  var sib = el.nextSibling;
  if (sib && sib.classList && sib.classList.contains("stamp-bar")) sib.style.display = "none";
  el.style.display = "none";
  var line = parent.querySelector ? parent.querySelector('.report-line[data-for="' + key + '"]') : null;
  if (line) line.style.display = "none";
  if (!parent.querySelector || !parent.querySelector('.prov-note[data-for="' + key + '"]')) {
    var note = document.createElement("div");
    note.className = "prov-note";
    note.setAttribute("data-for", key);
    note.textContent = "この掲載は通報を受けて確認中です（仮非表示）。運営の確認で戻る場合があります。";
    parent.insertBefore(note, el.nextSibling);
  }
}
function placeReportUI() {
  var reports = loadReports();
  var targets = document.querySelectorAll(".p-card, .url-row");
  Array.prototype.forEach.call(targets, function (el) {
    var key = reportKeyOf(el);
    if (reports[key]) { applyProvHide(el); return; }
    var parent = el.parentNode;
    if (!parent || (parent.querySelector && parent.querySelector('.report-line[data-for="' + key + '"]'))) return;
    var line = document.createElement("div");
    line.className = "report-line";
    line.setAttribute("data-for", key);
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "report-btn";
    btn.textContent = "通報する";
    btn.addEventListener("click", function () { openReportPanel(el, key, line); });
    line.appendChild(btn);
    var anchor = el.nextSibling;
    /* スタンプ欄がある場合はその後ろ、無ければ掲載の直後に出す */
    var stampBar = null;
    var sib = el.nextSibling;
    while (sib) { if (sib.classList && sib.classList.contains("stamp-bar")) { stampBar = sib; break; } sib = sib.nextSibling; }
    if (stampBar) parent.insertBefore(line, stampBar.nextSibling);
    else parent.insertBefore(line, anchor);
  });
}
var reportPanel = null;
var LOGIN_KEY = "demo_login_v1";
function isLoggedIn() {
  try { return !!localStorage.getItem(LOGIN_KEY); } catch (e) { return false; }
}
function openReportPanel(el, key, line) {
  closeReportPanel();
  reportPanel = document.createElement("div");
  reportPanel.className = "report-panel";
  if (!isLoggedIn()) {
    var gateTitle = document.createElement("p");
    gateTitle.className = "rp-title";
    gateTitle.textContent = "通報はログインした利用者だけが送れます（通報元の確認が取れないと、繰り返し通報の割り引きができないため）。ログインはカード側のアカウントで行います。利用者でない方（なりすまし被害など）は、通報・削除の窓口ページのメール窓口からご連絡ください。";
    reportPanel.appendChild(gateTitle);
    var loginBtn = document.createElement("button");
    loginBtn.type = "button";
    loginBtn.className = "rp-confirm";
    loginBtn.textContent = "ログインする（デモ用：この端末だけで有効な仮ログイン）";
    loginBtn.addEventListener("click", function () {
      try { localStorage.setItem(LOGIN_KEY, "1"); } catch (e) {}
      toast("ログインしました（デモ）");
      openReportPanel(el, key, line);
    });
    reportPanel.appendChild(loginBtn);
    var gateCancel = document.createElement("button");
    gateCancel.type = "button";
    gateCancel.className = "rp-cancel";
    gateCancel.textContent = "やめる";
    gateCancel.addEventListener("click", closeReportPanel);
    reportPanel.appendChild(gateCancel);
    line.parentNode.insertBefore(reportPanel, line.nextSibling);
    return;
  }
  var title = document.createElement("p");
  title.className = "rp-title";
  title.textContent = "通報の理由を選んでください（文章の入力はありません）。通報すると、この掲載は確認のため即・仮非表示になります。";
  reportPanel.appendChild(title);
  var chosen = -1;
  var confirmBtn = document.createElement("button");
  confirmBtn.type = "button";
  confirmBtn.className = "rp-confirm";
  confirmBtn.textContent = "通報して仮非表示にする";
  confirmBtn.disabled = true;
  REPORT_REASONS.forEach(function (r, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "rp-reason";
    b.textContent = r;
    b.addEventListener("click", function () {
      chosen = i;
      Array.prototype.forEach.call(reportPanel.querySelectorAll(".rp-reason"), function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      confirmBtn.disabled = false;
    });
    reportPanel.appendChild(b);
  });
  var cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "rp-cancel";
  cancelBtn.textContent = "やめる";
  cancelBtn.addEventListener("click", closeReportPanel);
  confirmBtn.addEventListener("click", function () {
    if (chosen < 0) return;
    var reports = loadReports();
    reports[key] = { r: chosen, t: Date.now() };
    saveReports(reports);
    closeReportPanel();
    applyProvHide(el);
    toast("通報を受け付けました。この掲載は確認のため仮非表示になりました");
  });
  var row = document.createElement("div");
  row.className = "rp-row";
  row.appendChild(confirmBtn);
  row.appendChild(cancelBtn);
  reportPanel.appendChild(row);
  line.parentNode.insertBefore(reportPanel, line.nextSibling);
}
function closeReportPanel() {
  if (reportPanel && reportPanel.parentNode) reportPanel.parentNode.removeChild(reportPanel);
  reportPanel = null;
}
document.addEventListener("DOMContentLoaded", placeReportUI);
(function watchReportContainers() {
  var seen = {};
  ["list", "url-rows"].forEach(function (id) {
    var c = document.getElementById(id);
    if (!c || seen[c.id]) return;
    seen[c.id] = 1;
    if (typeof MutationObserver === "undefined") return;
    var syncing = false;
    new MutationObserver(function () {
      if (syncing) return;
      syncing = true;
      try { placeReportUI(); } finally { syncing = false; }
    }).observe(c, { childList: true });
  });
  if (!Object.keys(seen).length) document.addEventListener("DOMContentLoaded", watchReportContainers);
})();
