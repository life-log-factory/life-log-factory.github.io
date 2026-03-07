// =========================================
// 共通ヘッダー・フッターの自動読み込み
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    // ヘッダーを配達してはめ込む
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            const headerPl = document.getElementById('header-placeholder');
            if (headerPl) {
                headerPl.innerHTML = data;
                
                // メニューボタンを押した時のアニメーション処理
                const menuBtn = document.getElementById('menu-btn');
                const headerNav = document.getElementById('header-nav');
                
                if (menuBtn && headerNav) {
                    menuBtn.addEventListener('click', () => {
                        menuBtn.classList.toggle('open'); // 三本線を「×」にする
                        headerNav.classList.toggle('open'); // メニューを上から降ろす
                    });
                }
            }
        });

    // フッターを配達してはめ込む
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            const footerPl = document.getElementById('footer-placeholder');
            if (footerPl) footerPl.innerHTML = data;
        });
});

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
    const gasUrl = 'https://script.google.com/macros/s/AKfycby5fofJ_EMAWnpYDXLFLfQQD89Ta7gb0ZajMTjx9HeFeAIohgQDOg_k8JvXb3VVCsOz/exec?type=json';

    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth(); 
    let allEvents = [];

    // --- ローディングアニメーション ---
    const newsListElement = document.getElementById('news-list');
    const calendarBody = document.getElementById('calendar-body');
    const loadingHtml = `<div class="loading-wrapper"><div class="spinner"></div>Loading...</div>`;
    if (newsListElement) newsListElement.innerHTML = `<li style="list-style:none; border:none;">${loadingHtml}</li>`;
    if (calendarBody) calendarBody.innerHTML = `<tr><td colspan="7" style="border:none; height:150px;">${loadingHtml}</td></tr>`;

    fetch(gasUrl)
        .then(response => response.json())
        .then(data => {
            allEvents = data;
            renderNewsList(allEvents);
            renderCalendar(currentYear, currentMonth, allEvents);
            // ▼ 画像スライダーを描画する関数を呼び出し
            renderImageSlider(allEvents);
            setupFilterTabs(allEvents);
        })
        .catch(error => {
            console.error('データの読み込みに失敗しました:', error);
            const detailsArea = document.getElementById('calendar-details');
            if(detailsArea) detailsArea.innerHTML = `<p style="color:red; text-align:center;">データの読み込みに失敗しました。</p>`;
        });

    // -----------------------------------------
    // 1. NEWS欄を描画する関数（クラス制御に修正）
    // -----------------------------------------
    function renderNewsList(data) {
        const newsListElement = document.getElementById('news-list');
        if (!newsListElement) return;

        newsListElement.style.textAlign = 'left';

        const sortedData = [...data].sort((a, b) => new Date(String(b.date)) - new Date(String(a.date)));
        const newsData = sortedData.filter(item => String(item.type).trim().toUpperCase() === 'NEWS');

        const isNewsPage = window.location.pathname.includes('news.html');
        const displayNews = isNewsPage ? newsData : newsData.slice(0, 5);

        newsListElement.innerHTML = ''; 
        displayNews.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'news-item';
            li.style.display = 'flex';
            li.style.flexDirection = 'column';
            li.style.alignItems = 'flex-start';

            const formattedDate = String(item.date).replace(/-/g, '/').substring(0, 10);
            const hasDetails = item.imageUrl || item.content;

            let titleHtml = '';
            let detailHtml = '';

            if (hasDetails) {
                titleHtml = `<span class="news-link" style="color: #333; font-weight: bold; cursor: pointer; text-decoration: underline;" onclick="const d = document.getElementById('news-detail-${index}'); d.style.display = d.style.display === 'none' ? 'block' : 'none';">${item.title}</span>`;

                let imgHtml = '';
                if (item.imageUrl) {
                    const imgTag = `<img src="${item.imageUrl}" style="max-width: 100%; max-height: 250px; object-fit: contain; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin: 10px auto; display: block; transition: 0.3s;" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">`;
                    imgHtml = item.link ? `<a href="${item.link}" target="_blank">${imgTag}</a>` : imgTag;
                }

                let contentHtml = item.content ? `<div style="margin-top: 12px; font-size: 14px; color: #444; white-space: pre-wrap; line-height: 1.6;">${item.content}</div>` : '';
                let urlHtml = (item.link && !item.imageUrl) ? `<div style="margin-top:12px;"><a href="${item.link}" target="_blank" style="color:#007bff; font-weight:bold; text-decoration:underline;">&gt;&gt; 詳細リンクを開く</a></div>` : '';

                detailHtml = `
                    <div id="news-detail-${index}" style="display: none; width: 100%; padding: 15px; background-color: #f4f7f6; border-radius: 8px; margin-top: 10px; box-sizing: border-box; border-left: 4px solid #007bff;">
                        ${imgHtml}
                        ${contentHtml}
                        ${urlHtml}
                    </div>
                `;
            } else {
                titleHtml = item.link 
                    ? `<a href="${item.link}" class="news-link" target="_blank" style="font-weight:bold;">${item.title}</a>` 
                    : `<span class="news-link" style="color: #333; font-weight:bold; cursor: default;">${item.title}</span>`;
            }

            // ▼ インラインスタイルをやめて、CSSのクラスに置き換えました
            li.innerHTML = `
                <div class="news-header-row">
                    <time class="news-date news-date-span" datetime="${item.date}">${formattedDate}</time>
                    ${titleHtml}
                </div>
                ${detailHtml}
            `;
            newsListElement.appendChild(li);
        });
    }

    // -----------------------------------------
    // 追加：画像スライダーを描画する関数
    // -----------------------------------------
    function renderImageSlider(data) {
        const track = document.getElementById('image-slider-track');
        if (!track) return;

        // データの中から画像URLがあるものだけを抽出
        const images = data.filter(e => e.imageUrl).map(e => e.imageUrl);
        
        // 画像が1枚もない場合は、親枠ごと非表示にする
        if (images.length === 0) {
            track.parentElement.style.display = 'none';
            return;
        }

        // 画面を埋めるために、画像を20枚分生成するロジック
        let sliderImages = [];
        let lastImg = null;

        for (let i = 0; i < 20; i++) {
            // 画像が1種類しかない場合はそれを連続させるしかない
            if (images.length === 1) {
                sliderImages.push(images[0]);
            } else {
                // 直前の画像とは違う画像をランダムに選ぶ
                let availableImages = images.filter(img => img !== lastImg);
                let randomImg = availableImages[Math.floor(Math.random() * availableImages.length)];
                sliderImages.push(randomImg);
                lastImg = randomImg;
            }
        }

        // HTMLのimgタグを生成
        let html = '';
        sliderImages.forEach(url => {
            html += `<img src="${url}" class="slider-img">`;
        });

        // CSSアニメーション（無限ループ）のために、全く同じものをもう1セット繋げる
        track.innerHTML = html + html; 
    }

    // -----------------------------------------
    // 2. カレンダーを描画する関数（背景画像対応）
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

                        // ▼ 画像がある予定を探して、セルの背景に設定する処理
                        const eventWithImage = dayEvents.find(e => e.imageUrl);
                        if (eventWithImage) {
                            // 文字が読みやすいように、白い半透明のフィルターを画像に被せる
                            cell.style.backgroundImage = `linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.8)), url('${eventWithImage.imageUrl}')`;
                            cell.style.backgroundSize = 'cover';
                            cell.style.backgroundPosition = 'center';
                        }

                        const markerContainer = document.createElement('div');
                        markerContainer.className = 'event-markers';
                        
                        dayEvents.forEach(e => {
                            const marker = document.createElement('div');
                            const typeStr = String(e.type).trim().toUpperCase();
                            
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
    // 3. クリックした日付の詳細を表示（画像差し込み対応）
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
            
            let typeClass = 'detail-type-other';
            let typeLabel = 'OTHER';
            if (typeStr === 'NEWS') { typeClass = 'detail-type-news'; typeLabel = 'NEWS'; }
            else if (typeStr === 'EVENT') { typeClass = 'detail-type-event'; typeLabel = 'EVENT'; }
            else if (typeStr === 'ACTIVITY') { typeClass = 'detail-type-activity'; typeLabel = 'ACTIVITY'; }

            const linkHtml = e.link 
                ? `<a href="${e.link}" target="_blank" style="color:#007bff; text-decoration:underline; font-weight:bold; font-size:15px;">${e.title}</a>` 
                : `<span style="font-weight:bold; font-size:15px; color:#333;">${e.title}</span>`;
            
            let timeHtml = '';
            if (e.startTime) {
                let endStr = e.endTime ? ` ～ ${e.endTime}` : '';
                timeHtml = `<span class="detail-time">Time: ${e.startTime}${endStr}</span>`;
            }

            // ▼ 画像の表示（タイトルと内容の間に挟む）
            let imageHtml = '';
            if (e.imageUrl) {
                const imgTag = `<img src="${e.imageUrl}" style="max-width: 100%; max-height: 250px; object-fit: cover; border-radius: 8px; margin: 12px auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: block;">`;
                // URLがある場合は画像をクリックでリンク先に飛ばす
                imageHtml = e.link ? `<a href="${e.link}" target="_blank">${imgTag}</a>` : imgTag;
            }

            let contentHtml = '';
            if (e.content) {
                contentHtml = `<div class="detail-content">${e.content}</div>`;
            }
            
            // 順番： バッジ＆時間 ＞ タイトル ＞ 画像 ＞ 内容
            html += `
                <div class="detail-item">
                    <div style="display:flex; align-items:center; flex-wrap:wrap; margin-bottom:8px;">
                        <span class="detail-type-badge ${typeClass}">${typeLabel}</span>
                        ${timeHtml}
                    </div>
                    <div>${linkHtml}</div>
                    ${imageHtml}
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

    // -----------------------------------------
    // フィルター付き一覧タブを描画する関数
    // -----------------------------------------
    function setupFilterTabs(data) {
        const tabs = document.querySelectorAll('.filter-tab');
        const listContainer = document.getElementById('filtered-event-list');
        if (!listContainer || tabs.length === 0) return;

        function renderFilteredList(typeFilter) {
            listContainer.style.textAlign = 'left';
            let filteredData = data;
            
            if (typeFilter !== 'ALL') {
                filteredData = data.filter(item => String(item.type).trim().toUpperCase() === typeFilter);
            }
            
            // 日付が新しい順に並び替え
            const sortedData = [...filteredData].sort((a, b) => new Date(String(b.date)) - new Date(String(a.date)));
            
            listContainer.innerHTML = '';
            
            if (sortedData.length === 0) {
                listContainer.innerHTML = '<p style="text-align:center; color:#888; padding: 20px;">この種類の予定・履歴はありません。</p>';
                return;
            }

            sortedData.forEach((item, index) => {
                const li = document.createElement('li');
                li.className = 'news-item';
                li.style.display = 'flex';
                li.style.flexDirection = 'column';
                li.style.alignItems = 'flex-start';

                const formattedDate = String(item.date).replace(/-/g, '/').substring(0, 10);
                const hasDetails = item.imageUrl || item.content;
                const typeStr = String(item.type).trim().toUpperCase();

                // タグの色設定
                let typeColor = '#6c757d'; // OTHER
                if (typeStr === 'NEWS') typeColor = '#007bff';
                else if (typeStr === 'EVENT') typeColor = '#dc3545';
                else if (typeStr === 'ACTIVITY') typeColor = '#e65100';

                const badgeHtml = `<span style="font-size:11px; font-weight:bold; color:${typeColor}; border:1px solid ${typeColor}; padding:2px 6px; border-radius:3px; margin-right:10px;">${typeStr}</span>`;

                let titleHtml = '';
                let detailHtml = '';

                // NEWSと同じアコーディオン（開閉）の仕組み
                if (hasDetails) {
                    titleHtml = `<span class="news-link" style="color: #333; font-weight: bold; cursor: pointer; text-decoration: underline;" onclick="const d = document.getElementById('filter-detail-${index}'); d.style.display = d.style.display === 'none' ? 'block' : 'none';">${item.title}</span>`;

                    let imgHtml = '';
                    if (item.imageUrl) {
                        const imgTag = `<img src="${item.imageUrl}" style="max-width: 100%; max-height: 250px; object-fit: contain; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin: 10px auto; display: block;">`;
                        imgHtml = item.link ? `<a href="${item.link}" target="_blank">${imgTag}</a>` : imgTag;
                    }
                    let contentHtml = item.content ? `<div style="margin-top: 12px; font-size: 14px; color: #444; white-space: pre-wrap; line-height: 1.6;">${item.content}</div>` : '';
                    let urlHtml = (item.link && !item.imageUrl) ? `<div style="margin-top:12px;"><a href="${item.link}" target="_blank" style="color:#007bff; font-weight:bold; text-decoration:underline;">&gt;&gt; 詳細リンクを開く</a></div>` : '';

                    detailHtml = `
                        <div id="filter-detail-${index}" style="display: none; width: 100%; padding: 15px; background-color: #f4f7f6; border-radius: 8px; margin-top: 10px; box-sizing: border-box; border-left: 4px solid ${typeColor};">
                            ${imgHtml}
                            ${contentHtml}
                            ${urlHtml}
                        </div>
                    `;
                } else {
                    titleHtml = item.link 
                        ? `<a href="${item.link}" class="news-link" target="_blank" style="font-weight:bold;">${item.title}</a>` 
                        : `<span class="news-link" style="color: #333; font-weight:bold; cursor: default;">${item.title}</span>`;
                }

                li.innerHTML = `
                    <div class="news-header-row">
                        <time class="news-date news-date-span" datetime="${item.date}">${formattedDate}</time>
                        <div style="display:flex; align-items:baseline; flex-wrap:wrap; margin-bottom:4px;">
                            ${badgeHtml} ${titleHtml}
                        </div>
                    </div>
                    ${detailHtml}
                `;
                listContainer.appendChild(li);
            });
        }

        // タブクリック時の挙動
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const clickedTab = e.target;
                const type = clickedTab.dataset.type;

                // もし「すでに選択されているタブ」を押したなら、閉じる（非表示に戻す）
                if (clickedTab.classList.contains('active')) {
                    clickedTab.classList.remove('active');
                    listContainer.innerHTML = '<p style="text-align:center; color:#888; padding: 20px; font-weight:bold;">上のボタンを押すと、過去の履歴が表示されます。</p>';
                } 
                // そうでない（新しいタブを押した）なら、開いて表示する
                else {
                    tabs.forEach(t => t.classList.remove('active'));
                    clickedTab.classList.add('active');
                    renderFilteredList(type);
                }
            });
        });

        // 初期状態はリストを空にして案内テキストを置いておく
        listContainer.innerHTML = '<p style="text-align:center; color:#888; padding: 20px; font-weight:bold;">上のボタンを押すと、過去の履歴が表示されます。</p>';
    }
});