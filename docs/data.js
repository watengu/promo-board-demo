// デモ用データ：掲載者・数値・店舗はすべて架空。外部リンクは全てプレースホルダ（#）。
const PEOPLE = [
  {
    id: 1, name: "りお", area: "銀座", age: 26,
    tags: ["アロマ", "オイル", "深夜OK"],
    stars: 5, likes: 128, views: 2480,
    updatedMin: 40, updatedLabel: "本日 14:50 更新",
    joinedDays: 21, openToday: true, mood: "🌿", streak: 5,
    shop: "サロン・フィオーレ銀座（架空）",
    style: "アロマセラピスト歴5年。静かな個室で、ゆったりした施術が得意です。",
    height: "162cm", job: "セラピスト", work: "フリー（店舗所属なし）",
    links: [
      { type: "home", label: "公式プロフィール（外部）", url: "#" },
      { type: "blog", label: "写メ日記（外部）", url: "#" },
      { type: "sns", label: "SNS（外部）", url: "#" }
    ],
    diary: [
      { date: "2026-11-01", title: "11/1 本日の空き状況（外部ページ）", url: "#" },
      { date: "2026-10-31", title: "10/31 ハロウィンの夜に", url: "#" },
      { date: "2026-10-29", title: "10/29 新しいアロマが届きました", url: "#" },
      { date: "2026-10-27", title: "10/27 雨の日の過ごし方", url: "#" }
    ],
    photos: ["images/p1-a.jpg", "images/p1-b.jpg"]
  },
  {
    id: 2, name: "みゆ", area: "新宿", age: 24,
    tags: ["リンパ", "ヘッドスパ"],
    stars: 4, likes: 86, views: 1730,
    updatedMin: 130, updatedLabel: "本日 13:05 更新",
    joinedDays: 3, openToday: true, mood: "☀️", streak: 3,
    shop: "メゾンロゼ新宿（架空）",
    style: "リンパケア専門。むくみが気になる方に。明るく話しやすい雰囲気です。",
    height: "158cm", job: "セラピスト", work: "フリー（店舗所属なし）",
    links: [
      { type: "home", label: "公式プロフィール（外部）", url: "#" },
      { type: "blog", label: "写メ日記（外部）", url: "#" },
      { type: "sns", label: "SNS（外部）", url: "#" }
    ],
    diary: [
      { date: "2026-11-01", title: "11/1 週末のご案内（外部ページ）", url: "#" },
      { date: "2026-10-30", title: "10/30 ヘッドスパのすすめ", url: "#" },
      { date: "2026-10-28", title: "10/28 お客様の声まとめ", url: "#" }
    ],
    photos: ["images/p2-a.jpg", "images/p2-b.jpg"]
  },
  {
    id: 3, name: "さくら", area: "六本木", age: 28,
    tags: ["整体", "ストレッチ", "指圧"],
    stars: 5, likes: 203, views: 3120,
    updatedMin: 300, updatedLabel: "本日 10:20 更新",
    joinedDays: 45, openToday: false, mood: "🍵", streak: 2,
    shop: "サロン・セレッソ六本木（架空）",
    style: "整体とストレッチを組み合わせた施術。肩こり・腰の重さにしっかりアプローチします。",
    height: "165cm", job: "セラピスト", work: "フリー（店舗所属なし）",
    links: [
      { type: "home", label: "公式プロフィール（外部）", url: "#" },
      { type: "blog", label: "写メ日記（外部）", url: "#" },
      { type: "sns", label: "SNS（外部）", url: "#" }
    ],
    diary: [
      { date: "2026-11-01", title: "11/1 午前中の枠について（外部ページ）", url: "#" },
      { date: "2026-10-31", title: "10/31 10月ありがとうございました", url: "#" },
      { date: "2026-10-26", title: "10/26 ストレッチ講座の記録", url: "#" }
    ],
    photos: ["images/p3-a.jpg", "images/p3-b.jpg"]
  },
  {
    id: 4, name: "あかり", area: "池袋", age: 23,
    tags: ["アロマ", "ホットストーン"],
    stars: 4, likes: 57, views: 980,
    updatedMin: 1500, updatedLabel: "昨日 21:40 更新",
    joinedDays: 12, openToday: true, mood: "🌙", streak: 1,
    shop: "メゾンクレール池袋（架空）",
    style: "ホットストーンで深部から温めます。初めての方にも丁寧にご案内します。",
    height: "155cm", job: "セラピスト", work: "フリー（店舗所属なし）",
    links: [
      { type: "home", label: "公式プロフィール（外部）", url: "#" },
      { type: "blog", label: "写メ日記（外部）", url: "#" },
      { type: "sns", label: "SNS（外部）", url: "#" }
    ],
    diary: [
      { date: "2026-10-31", title: "10/31 夜の部スタート（外部ページ）", url: "#" },
      { date: "2026-10-29", title: "10/29 温活のすすめ", url: "#" },
      { date: "2026-10-25", title: "10/25 自己紹介を更新しました", url: "#" }
    ],
    photos: ["images/p4-a.jpg", "images/p4-b.jpg"]
  },
  {
    id: 5, name: "かえで", area: "渋谷", age: 27,
    tags: ["リフレクソロジー", "読書好き"],
    stars: 3, likes: 41, views: 760,
    updatedMin: 2900, updatedLabel: "10/30 18:15 更新",
    joinedDays: 60, openToday: false, mood: "📚", streak: 0,
    shop: "ミルフィーユ渋谷（架空）",
    style: "足裏から全身を整えるリフレクソロジー。静かな時間を過ごしたい方に。",
    height: "160cm", job: "セラピスト", work: "フリー（店舗所属なし）",
    links: [
      { type: "home", label: "公式プロフィール（外部）", url: "#" },
      { type: "blog", label: "写メ日記（外部）", url: "#" },
      { type: "sns", label: "SNS（外部）", url: "#" }
    ],
    diary: [
      { date: "2026-10-30", title: "10/30 カフェで読書（外部ページ）", url: "#" },
      { date: "2026-10-27", title: "10/27 足つぼ豆知識", url: "#" }
    ],
    photos: ["images/p5-a.jpg", "images/p5-b.jpg"]
  },
  {
    id: 6, name: "ゆき", area: "恵比寿", age: 25,
    tags: ["オイル", "夜型", "フェイシャル"],
    stars: 5, likes: 167, views: 2210,
    updatedMin: 75, updatedLabel: "本日 14:15 更新",
    joinedDays: 7, openToday: true, mood: "✨", streak: 4,
    shop: "サロン・ルーチェ恵比寿（架空）",
    style: "夜の時間帯を中心に活動中。フェイシャルとオイルの組み合わせが人気です。",
    height: "163cm", job: "セラピスト", work: "フリー（店舗所属なし）",
    links: [
      { type: "home", label: "公式プロフィール（外部）", url: "#" },
      { type: "blog", label: "写メ日記（外部）", url: "#" },
      { type: "sns", label: "SNS（外部）", url: "#" }
    ],
    diary: [
      { date: "2026-11-01", title: "11/1 今夜の空き状況（外部ページ）", url: "#" },
      { date: "2026-10-31", title: "10/31 夜景とフェイシャル", url: "#" },
      { date: "2026-10-28", title: "10/28 スキンケアの記録", url: "#" },
      { date: "2026-10-24", title: "10/24 恵比寿のお店めぐり", url: "#" }
    ],
    photos: ["images/p6-a.jpg", "images/p6-b.jpg"]
  }
];

// 掲載者ダッシュボード用モック数値（すべて架空・デモ表示用）
const ANALYTICS = {
  personId: 1,
  range: "直近30日間",
  views: 2480, viewsDelta: "+18%",
  likes: 94,
  favorites: 51,
  clicksTotal: 186, clicksDelta: "+12%",
  clicksByLink: [
    { label: "公式プロフィール（外部）", count: 82 },
    { label: "写メ日記（外部）", count: 71 },
    { label: "SNS（外部）", count: 33 }
  ]
};
