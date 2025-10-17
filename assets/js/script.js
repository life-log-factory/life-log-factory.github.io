document.addEventListener('DOMContentLoaded', function() {
const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let width, height;
  let speed = 0; // 星の速度
  let phase = 0; // 0=静止, 1=加速, 2=ハイパースペース, 3=減速

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // 星の初期化
  function initStars(count) {
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * width,
      });
    }
  }
  initStars(1000);

  function drawStars() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'white';
    for (let star of stars) {
      star.z -= speed;
      if (star.z <= 0) star.z = width;

      let k = 128.0 / star.z;
      let px = star.x * k + width / 2;
      let py = star.y * k + height / 2;

      // 星の線を描画
      if (px >= 0 && px <= width && py >= 0 && py <= height) {
        let size = (1 - star.z / width) * 3;
        ctx.beginPath();

        if (speed > 20) {
          const centerX = width / 2;
          const centerY = height / 2;

          // 星の移動方向（中心から見たベクトル）
          const dx = px - centerX;
          const dy = py - centerY;

          // 方向ベクトルを延ばして「線」を描く
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + dx * 0.4, py + dy * 0.4); // ← この倍率で線の長さ調整
          ctx.lineWidth = 1.3;
          ctx.strokeStyle = 'white';
          ctx.stroke();
          } else {
          // 通常時 → 点
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
          }
        }
      }
    }

  let frame = 0;
  function animate() {
    frame++;

    // フェーズ制御
    if (frame < 60) {
      phase = 0; // 静止
      speed = 0.5;
    } else if (frame < 120) {
      phase = 1; // 加速
      speed += 0.8;
    } else if (frame < 300) {
      phase = 2; // ハイパースペース
      speed = 50;
    } else if (frame < 360) {
      phase = 3; // 減速
      speed *= 0.92;
    } else if (frame === 360) {
      document.getElementById('logo').classList.add('show');
    }

    drawStars();
    requestAnimationFrame(animate);
  }

  animate();

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
