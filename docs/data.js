// 掲示板側のデータは「カードURLの索引」だけを持つ（2026-11-06、確定仕様への適合）
// 掲示板はプロフィール情報を持たない。カードの表示内容（写真・紹介文・⭐︎/いいね等の数字）の本体はカードサイト側にあり、
// 掲示板はそれを表示するだけ。ここに置くのは表示に必要な最小限：カードID／表示名（鮮度帯の名前表示用）／職種／掲載する板／カードURL。
// 表示範囲（確定）：健全ジャンル〜メディア系〜フリーセラピストが上限。範囲外の職種のカードはこの索引に入れない＝掲示板に出ない。
// デモ用データ：人物・数値はすべて架空。
const BOARD_RANGE_JOBS = ["セラピスト", "ネイリスト", "フリーアナウンサー", "インフルエンサー"];
const CARD_INDEX = [
  { id: 1, name: "りお", job: "セラピスト", board: "relaxation", cardUrl: "https://watengu.github.io/profile-card-demo/card/1.html" },
  { id: 2, name: "みゆ", job: "セラピスト", board: "relaxation", cardUrl: "https://watengu.github.io/profile-card-demo/card/2.html" },
  { id: 3, name: "さくら", job: "セラピスト", board: "relaxation", cardUrl: "https://watengu.github.io/profile-card-demo/card/3.html" },
  { id: 4, name: "あかり", job: "セラピスト", board: "relaxation", cardUrl: "https://watengu.github.io/profile-card-demo/card/4.html" },
  { id: 5, name: "かえで", job: "セラピスト", board: "relaxation", cardUrl: "https://watengu.github.io/profile-card-demo/card/5.html" },
  { id: 6, name: "ゆき", job: "セラピスト", board: "relaxation", cardUrl: "https://watengu.github.io/profile-card-demo/card/6.html" },
  { id: 7, name: "なな", job: "ネイリスト", board: "beauty", cardUrl: "https://watengu.github.io/profile-card-demo/card/7.html" }
];
