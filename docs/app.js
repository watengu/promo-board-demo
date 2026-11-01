// 共通処理：年齢確認ゲート／簡易クリック計測（端末内 localStorage）／いいね・お気に入り
(function () {
  // ---------- 年齢確認ゲート ----------
  function buildGate() {
    var existing = document.getElementById("age-gate");
    if (sessionStorage.getItem("age_ok") === "1") {
      if (existing) existing.remove();
      return;
    }
    var ov = existing || document.createElement("div");
    ov.id = "age-gate";
    if (!existing) ov.innerHTML =
      '<div class="gate-box">' +
      '<div class="gate-logo">フリーセラピスト掲示板<span>（デモ）</span></div>' +
      '<p class="gate-lead">このサイトはフリーセラピストの宣伝リンク集です。</p>' +
      '<p class="gate-q">あなたは18歳以上ですか？</p>' +
      '<button id="gate-yes" class="gate-btn yes">はい、18歳以上です</button>' +
      '<button id="gate-no" class="gate-btn no">いいえ</button>' +
      '<p id="gate-msg" class="gate-msg"></p>' +
      '<p class="gate-note">※これはデモサイトです。掲載者・店舗・数値はすべて架空で、写真はAI生成画像を使用しています。</p>' +
      "</div>";
    if (!existing) document.body.appendChild(ov);
    document.body.classList.add("gate-locked");
    document.getElementById("gate-yes").addEventListener("click", function () {
      sessionStorage.setItem("age_ok", "1");
      ov.remove();
      document.body.classList.remove("gate-locked");
    });
    document.getElementById("gate-no").addEventListener("click", function () {
      document.getElementById("gate-msg").textContent =
        "18歳未満の方はご利用いただけません。";
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
var PH_COLORS = {1: "#c96f4a", 2: "#7a9e7e", 3: "#5b7fa6", 4: "#a65b8f", 5: "#8f6a3d", 6: "#4a7a8c"};
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
