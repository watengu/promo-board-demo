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
