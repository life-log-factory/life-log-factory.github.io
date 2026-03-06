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
    if (frame < 30) {
      phase = 0; // 静止
      speed = 0.5;
    } else if (frame < 90) {
      phase = 1; // 加速
      speed += 0.8;
    } else if (frame < 180) {
      phase = 2; // ハイパースペース
      speed = 50;
    } else if (frame < 240) {
      phase = 3; // 減速
      speed *= 0.92;
    } else if (frame === 240) {
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

// =========================================
// スプレッドシート連携 ＆ オリジナルカレンダー
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    // ★末尾に ?type=json を追加して、サイト用のデータをもらう
    const gasUrl = 'https://script.google.com/macros/s/AKfycby5fofJ_EMAWnpYDXLFLfQQD89Ta7gb0ZajMTjx9HeFeAIohgQDOg_k8JvXb3VVCsOz/exec?type=json';

    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth(); 
    let allEvents = [];

    // --- ローディングアニメーションを表示 ---
    const newsListElement = document.getElementById('news-list');
    const calendarBody = document.getElementById('calendar-body');
    const loadingHtml = `<div class="loading-wrapper"><div class="spinner"></div>Loading...</div>`;
    if (newsListElement) newsListElement.innerHTML = `<li style="list-style:none; border:none;">${loadingHtml}</li>`;
    if (calendarBody) calendarBody.innerHTML = `<tr><td colspan="7" style="border:none; height:150px;">${loadingHtml}</td></tr>`;
    // ----------------------------------------

    fetch(gasUrl)
        .then(response => response.json())
        .then(data => {
            allEvents = data;
            renderNewsList(allEvents);
            renderCalendar(currentYear, currentMonth, allEvents);
        })
        .catch(error => {
            console.error('データの読み込みに失敗しました:', error);
            const detailsArea = document.getElementById('calendar-details');
            if(detailsArea) detailsArea.innerHTML = `<p style="color:red; text-align:center;">データの読み込みに失敗しました。</p>`;
        });

    // -----------------------------------------
    // 1. NEWS欄を描画する関数
    // -----------------------------------------
    function renderNewsList(data) {
        if (!newsListElement) return;

        const sortedData = [...data].sort((a, b) => new Date(String(b.date)) - new Date(String(a.date)));
        // 種類が NEWS のものだけを絞り込む
        const newsData = sortedData.filter(item => String(item.type).trim().toUpperCase() === 'NEWS');

        const isNewsPage = window.location.pathname.includes('news.html');
        const displayNews = isNewsPage ? newsData : newsData.slice(0, 5);

        newsListElement.innerHTML = ''; 
        displayNews.forEach(item => {
            const li = document.createElement('li');
            li.className = 'news-item';
            const formattedDate = String(item.date).replace(/-/g, '/').substring(0, 10);
            
            // プログラムの text を title に変更
            const linkHtml = item.link 
                ? `<a href="${item.link}" class="news-link" target="_blank">${item.title}</a>` 
                : `<span class="news-link" style="color: #333; cursor: default;">${item.title}</span>`;

            li.innerHTML = `<time class="news-date" datetime="${item.date}">${formattedDate}</time>${linkHtml}`;
            newsListElement.appendChild(li);
        });
    }

    // -----------------------------------------
    // 2. カレンダーを描画する関数
    // -----------------------------------------
    function renderCalendar(year, month, events) {
        if (!calendarBody) return;
        document.getElementById('calendar-month-year').textContent = `${year}年 ${month + 1}月`;
        calendarBody.innerHTML = ''; 

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let date = 1;
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                
                if (i === 0 && j < firstDay) {
                    cell.classList.add('cal-empty');
                } else if (date > daysInMonth) {
                    cell.classList.add('cal-empty');
                } else {
                    cell.innerHTML = `<div class="cal-date-num">${date}</div>`;
                    
                    const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                    const dayEvents = events.filter(e => {
                        const eventDateStr = String(e.date).replace(/\//g, '-').substring(0, 10);
                        return eventDateStr === currentDateStr;
                    });

                    if (dayEvents.length > 0) {
                        cell.classList.add('has-event'); 

                        const markerContainer = document.createElement('div');
                        markerContainer.className = 'event-markers';
                        
                        dayEvents.forEach(e => {
                            const marker = document.createElement('div');
                            const typeStr = String(e.type).trim().toUpperCase();
                            
                            // 種類によって色（クラス）を変える
                            let markerClass = 'marker-other';
                            if (typeStr === 'NEWS') markerClass = 'marker-news';
                            else if (typeStr === 'EVENT') markerClass = 'marker-event';
                            else if (typeStr === 'ACTIVITY') markerClass = 'marker-activity';
                            
                            marker.className = `marker ${markerClass}`;
                            marker.textContent = e.title;
                            markerContainer.appendChild(marker);
                        });
                        cell.appendChild(markerContainer);
                    }

                    const clickDateStr = `${year}年${month + 1}月${date}日`;
                    cell.addEventListener('click', () => {
                        showDetails(clickDateStr, dayEvents);
                    });

                    date++;
                }
                row.appendChild(cell);
            }
            calendarBody.appendChild(row);
            if (date > daysInMonth) break; 
        }
    }

    // -----------------------------------------
    // 3. クリックした日付の詳細を表示する関数
    // -----------------------------------------
    function showDetails(dateStr, dayEvents) {
        const detailsArea = document.getElementById('calendar-details');
        if (!detailsArea) return;

        if (dayEvents.length === 0) {
            detailsArea.innerHTML = `<p class="details-placeholder">${dateStr} の予定・ニュースはありません。</p>`;
            return;
        }

        let html = `<h4 style="margin-top:0; color:#0d1b3f; border-bottom:1px solid #ddd; padding-bottom:10px;">${dateStr} の詳細</h4>`;
        
        dayEvents.forEach(e => {
            const typeStr = String(e.type).trim().toUpperCase();
            
            // タグの表示設定
            let typeClass = 'detail-type-other';
            let typeLabel = 'OTHER';
            if (typeStr === 'NEWS') { typeClass = 'detail-type-news'; typeLabel = 'NEWS'; }
            else if (typeStr === 'EVENT') { typeClass = 'detail-type-event'; typeLabel = 'EVENT'; }
            else if (typeStr === 'ACTIVITY') { typeClass = 'detail-type-activity'; typeLabel = 'ACTIVITY'; }

            // リンクの有無でタイトルを切り替え
            const linkHtml = e.link 
                ? `<a href="${e.link}" target="_blank" style="color:#007bff; text-decoration:underline; font-weight:bold; font-size:15px;">${e.title}</a>` 
                : `<span style="font-weight:bold; font-size:15px; color:#333;">${e.title}</span>`;
            
            // 時間の表示組み立て（入力されている場合のみ表示）
            let timeHtml = '';
            if (e.startTime) {
                let endStr = e.endTime ? ` ～ ${e.endTime}` : '';
                timeHtml = `<span class="detail-time">Time: ${e.startTime}${endStr}</span>`;
            }

            // 内容の表示（入力されている場合のみ表示）
            let contentHtml = '';
            if (e.content) {
                contentHtml = `<div class="detail-content">${e.content}</div>`;
            }
            
            // 画面に組み立てて出力
            html += `
                <div class="detail-item">
                    <div style="display:flex; align-items:center; flex-wrap:wrap; margin-bottom:8px;">
                        <span class="detail-type-badge ${typeClass}">${typeLabel}</span>
                        ${timeHtml}
                    </div>
                    <div>${linkHtml}</div>
                    ${contentHtml}
                </div>
            `;
        });
        detailsArea.innerHTML = html;
    }

    // -----------------------------------------
    // 4. 「＜」「＞」ボタンで月を切り替える
    // -----------------------------------------
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) { currentMonth = 11; currentYear--; }
            renderCalendar(currentYear, currentMonth, allEvents);
        });
        
        nextBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) { currentMonth = 0; currentYear++; }
            renderCalendar(currentYear, currentMonth, allEvents);
        });
    }
});