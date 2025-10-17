document.addEventListener('DOMContentLoaded', function() {
  // mask-imgアニメーション
  document.querySelectorAll('.mask-img').forEach(function(el) {
    setTimeout(function() {
      el.classList.add('anim');
    }, (parseFloat(el.dataset.delay) || 0) * 1000);
  });

  // テキスト処理
  const ids = ['a','b','c','d','e'];
  let tx = [];
  let txCount = [];
  const txSp = 50;  // テキスト表示速度
  const dly = 200;  // 次の文章までの待ち時間
  let count = 0;

  function countSet(){
    for(let n = 0; n < ids.length; n++){
      txCount[n] = 0;
    }
  }

  function kamikakushi(){
    for(let i = 0; i < ids.length; i++){
      ids[i] = document.getElementById(ids[i]);
      tx[i] = ids[i].textContent; // 初期の文字列
      ids[i].textContent = '';    // 消しておく
    }
  }

  setTimeout(function() {
    kamikakushi();
    countSet();
    itimozi(); // ← この関数の定義がまだ無いので後で追加が必要
  }, 800);

  // fade-inターゲット監視
  const targets = document.querySelectorAll('.fade-in-target');
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  });

  targets.forEach(target => observer.observe(target));
});
