// =========================================
// LIFE LOG Factory 製品・アプリ一覧
// -----------------------------------------
// 新しい製品やアプリを追加するときは、この配列に
// オブジェクトを1つ追加するだけでよい（shop.html側の
// 修正は不要）。各項目の意味は以下の通り。
//
//   id          : 一意なID（英数字）
//   name        : 表示名
//   type        : 'physical'（物販） | 'app'（アプリ/Webアプリ）
//   price       : 税込価格（円）。無料なら 0
//   image       : カード用の画像パス
//   description : 1〜2文の説明
//   detailUrl   : サイト内の紹介ページ（任意、無ければ null）
//   status      : 'available'（購入/入手可能） | 'coming-soon'（準備中）
//   buyUrl      : physical用。BOOTH/BASE等の商品ページURL。
//                 準備中は null にしておくと「準備中」表示になる
//   appUrl      : app用。実際に開く/インストールするページのURL
// =========================================

const PRODUCTS = [
    {
        id: 'kazoo',
        name: 'Kazoo',
        type: 'physical',
        price: 500,
        image: 'assets/img/Projects/Kazoo/Kazoo.png',
        description: '分解して丸洗いできる、オリジナル膜鳴楽器。3Dプリンターで製作したパーツを自分で組み立てます。',
        detailUrl: 'kazoo.html',
        status: 'coming-soon',
        buyUrl: null
    },
    {
        id: 'bremons',
        name: 'BREMONS',
        type: 'app',
        price: 0,
        image: 'bremons/nightgame/BREMONS.png',
        description: '息を吹いてモンスターを育てる、呼吸機能トレーニングゲーム。スマホのホーム画面に追加してアプリのように使えます。',
        detailUrl: 'bremons.html',
        status: 'available',
        appUrl: 'bremons/'
    }
];
