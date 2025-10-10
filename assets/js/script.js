document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let width, height;
  let speed = 0; // 星の速度

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

      // 星の線を描画（常に線で描画）
      if (px >= 0 && px <= width && py >= 0 && py <= height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const dx = px - centerX;
        const dy = py - centerY;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + dx * 0.4, py + dy * 0.4);
        ctx.lineWidth = 1.3;
        ctx.strokeStyle = 'white';
        ctx.stroke();
      }
    }
  }

  let frame = 0;
  function animate() {
    frame++;

    speed = 5; // 常に点が動くように速度を一定にする

    if (frame === 60) { // 60フレーム後にロゴを表示
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
