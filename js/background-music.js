/**
 * 全局背景音乐控制系统
 * 功能：
 * 1. 在除首页和视频播放外的所有页面循环播放音乐
 * 2. 可拖拽的音乐控制按钮
 * 3. 可隐藏/显示按钮
 * 4. 播放/暂停切换
 * 5. 跨页面状态保持
 */

(function() {
  'use strict';

  // 配置
  const CONFIG = {
    musicUrl: 'assets/music/Lana Del Rey - Young And Beautiful(1).flac', // 音乐文件路径
    excludePages: ['index.html', ''], // 排除的页面(首页)
    storageKeys: {
      isPlaying: 'bgm_is_playing',
      volume: 'bgm_volume',
      buttonPosition: 'bgm_button_position',
      isMinimized: 'bgm_is_minimized',
      currentTime: 'bgm_current_time',
      lastUpdate: 'bgm_last_update'
    }
  };

  // 全局状态
  let audio = null;
  let musicButton = null;
  let isDragging = false;
  let hasDragged = false; // 新增: 标记是否发生了实际拖动
  let dragOffset = { x: 0, y: 0 };
  let isVideoPlaying = false;

  // 检查当前页面是否应该播放音乐
  function shouldPlayMusic() {
    const currentPage = window.location.pathname.split('/').pop();
    return !CONFIG.excludePages.includes(currentPage) && !isVideoPlaying;
  }

  // 初始化音频
  function initAudio() {
    if (audio) return audio;

    audio = new Audio(CONFIG.musicUrl);
    audio.loop = true;
    audio.volume = parseFloat(localStorage.getItem(CONFIG.storageKeys.volume) || '0.3');
    
    // 音频加载完成后恢复播放进度
    audio.addEventListener('loadedmetadata', () => {
      const savedTime = localStorage.getItem(CONFIG.storageKeys.currentTime);
      const lastUpdate = localStorage.getItem(CONFIG.storageKeys.lastUpdate);
      if (savedTime && lastUpdate) {
        const elapsed = (Date.now() - parseInt(lastUpdate)) / 1000;
        const targetTime = parseFloat(savedTime) + elapsed;
        // 确保时间在有效范围内
        if (targetTime < audio.duration) {
          audio.currentTime = targetTime;
        } else {
          // 如果超过时长,使用循环后的时间
          audio.currentTime = targetTime % audio.duration;
        }
      }
    });
    
    // 定期保存播放进度
    setInterval(() => {
      if (audio && !audio.paused) {
        localStorage.setItem(CONFIG.storageKeys.currentTime, audio.currentTime.toString());
        localStorage.setItem(CONFIG.storageKeys.lastUpdate, Date.now().toString());
      }
    }, 1000); // 每秒保存一次
    
    // 音频加载错误处理
    audio.addEventListener('error', (e) => {
      console.warn('背景音乐加载失败:', e);
    });

    // 音频可以播放时
    audio.addEventListener('canplay', () => {
      console.log('背景音乐已加载');
    });

    return audio;
  }

  // 创建音乐控制按钮
  function createMusicButton() {
    if (musicButton || !shouldPlayMusic()) return;

    const button = document.createElement('div');
    button.className = 'music-control-btn';
    button.innerHTML = `
      <div class="music-btn-content">
        <div class="music-icon">
          <svg class="icon-playing" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
          <svg class="icon-paused" viewBox="0 0 24 24" width="24" height="24" style="display:none;">
            <path fill="currentColor" d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <div class="music-label">音乐</div>
      </div>
      <button class="music-minimize-btn" title="最小化">−</button>
    `;

    // 恢复上次的位置
    const savedPosition = localStorage.getItem(CONFIG.storageKeys.buttonPosition);
    if (savedPosition) {
      const pos = JSON.parse(savedPosition);
      button.style.left = pos.x + 'px';
      button.style.top = pos.y + 'px';
      button.style.right = 'auto';
      button.style.bottom = 'auto';
    }

    // 恢复最小化状态
    const isMinimized = localStorage.getItem(CONFIG.storageKeys.isMinimized) === 'true';
    if (isMinimized) {
      button.classList.add('minimized');
    }

    document.body.appendChild(button);
    musicButton = button;

    // 绑定事件
    bindButtonEvents();
    updateButtonState();
  }

  // 绑定按钮事件
  function bindButtonEvents() {
    if (!musicButton) return;

    const content = musicButton.querySelector('.music-btn-content');
    const minimizeBtn = musicButton.querySelector('.music-minimize-btn');

    // 播放/暂停切换 - 使用 mouseup 而不是 click
    content.addEventListener('mouseup', (e) => {
      // 只有在没有拖动的情况下才触发点击
      if (!hasDragged) {
        toggleMusic();
      }
    });

    // 最小化/展开
    minimizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMinimize();
    });

    // 拖拽功能
    content.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);

    // 触摸支持
    content.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', drag);
    content.addEventListener('touchend', (e) => {
      stopDrag();
      // 触摸时也要检查是否拖动
      if (!hasDragged) {
        toggleMusic();
      }
    });
  }

  // 开始拖拽
  function startDrag(e) {
    if (e.target.closest('.music-minimize-btn')) return;
    
    isDragging = true;
    hasDragged = false; // 重置拖动标记
    musicButton.classList.add('dragging');

    const rect = musicButton.getBoundingClientRect();
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    dragOffset.x = clientX - rect.left;
    dragOffset.y = clientY - rect.top;

    e.preventDefault();
  }

  // 拖拽中
  function drag(e) {
    if (!isDragging) return;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (!clientX || !clientY) return;

    let x = clientX - dragOffset.x;
    let y = clientY - dragOffset.y;

    // 边界限制
    const maxX = window.innerWidth - musicButton.offsetWidth;
    const maxY = window.innerHeight - musicButton.offsetHeight;

    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    musicButton.style.left = x + 'px';
    musicButton.style.top = y + 'px';
    musicButton.style.right = 'auto';
    musicButton.style.bottom = 'auto';

    // 标记已经发生了拖动
    hasDragged = true;

    e.preventDefault();
  }

  // 停止拖拽
  function stopDrag() {
    if (!isDragging) return;

    isDragging = false;
    musicButton.classList.remove('dragging');

    // 保存位置
    const rect = musicButton.getBoundingClientRect();
    localStorage.setItem(CONFIG.storageKeys.buttonPosition, JSON.stringify({
      x: rect.left,
      y: rect.top
    }));
  }

  // 切换播放/暂停
  function toggleMusic() {
    if (!audio) return;

    if (audio.paused) {
      playMusic();
    } else {
      pauseMusic();
    }
  }

  // 播放音乐
  function playMusic() {
    if (!audio || !shouldPlayMusic()) return;

    audio.play().then(() => {
      localStorage.setItem(CONFIG.storageKeys.isPlaying, 'true');
      updateButtonState();
    }).catch(err => {
      console.warn('音乐播放失败:', err);
    });
  }

  // 暂停音乐
  function pauseMusic() {
    if (!audio) return;

    audio.pause();
    localStorage.setItem(CONFIG.storageKeys.isPlaying, 'false');
    // 保存当前播放进度
    localStorage.setItem(CONFIG.storageKeys.currentTime, audio.currentTime.toString());
    localStorage.setItem(CONFIG.storageKeys.lastUpdate, Date.now().toString());
    updateButtonState();
  }

  // 停止音乐(用于页面切换) - 不重置播放进度
  function stopMusic() {
    if (!audio) return;
    // 只暂停,不重置进度
    audio.pause();
    // 保存当前播放进度
    localStorage.setItem(CONFIG.storageKeys.currentTime, audio.currentTime.toString());
    localStorage.setItem(CONFIG.storageKeys.lastUpdate, Date.now().toString());
  }

  // 更新按钮状态
  function updateButtonState() {
    if (!musicButton || !audio) return;

    const isPlaying = !audio.paused;
    const playingIcon = musicButton.querySelector('.icon-playing');
    const pausedIcon = musicButton.querySelector('.icon-paused');

    if (isPlaying) {
      musicButton.classList.add('playing');
      playingIcon.style.display = 'block';
      pausedIcon.style.display = 'none';
    } else {
      musicButton.classList.remove('playing');
      playingIcon.style.display = 'none';
      pausedIcon.style.display = 'block';
    }
  }

  // 切换最小化
  function toggleMinimize() {
    if (!musicButton) return;

    const isMinimized = musicButton.classList.toggle('minimized');
    localStorage.setItem(CONFIG.storageKeys.isMinimized, isMinimized);

    const minimizeBtn = musicButton.querySelector('.music-minimize-btn');
    minimizeBtn.textContent = isMinimized ? '+' : '−';
    minimizeBtn.title = isMinimized ? '展开' : '最小化';
  }

  // 监听视频播放状态
  function setupVideoListener() {
    // 监听视频覆盖层
    const videoOverlay = document.getElementById('videoOverlay');
    if (videoOverlay) {
      const video = videoOverlay.querySelector('video');
      if (video) {
        video.addEventListener('play', () => {
          isVideoPlaying = true;
          pauseMusic();
          if (musicButton) {
            musicButton.style.display = 'none';
          }
        });

        video.addEventListener('ended', () => {
          isVideoPlaying = false;
        });

        video.addEventListener('pause', () => {
          isVideoPlaying = false;
        });
      }

      // 监听覆盖层的显示/隐藏
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'style') {
            const isVisible = window.getComputedStyle(videoOverlay).display !== 'none';
            isVideoPlaying = isVisible;
            
            if (!isVisible && shouldPlayMusic()) {
              // 视频结束后恢复音乐
              setTimeout(() => {
                if (musicButton) {
                  musicButton.style.display = 'flex';
                }
                const wasPlaying = localStorage.getItem(CONFIG.storageKeys.isPlaying) === 'true';
                if (wasPlaying) {
                  playMusic();
                }
              }, 500);
            }
          }
        });
      });

      observer.observe(videoOverlay, { attributes: true });
    }
  }

  // 页面卸载时保存状态
  function saveState() {
    if (audio) {
      localStorage.setItem(CONFIG.storageKeys.isPlaying, audio.paused ? 'false' : 'true');
      localStorage.setItem(CONFIG.storageKeys.volume, audio.volume);
    }
  }

  // 初始化
  function init() {
    // 如果不应该播放音乐,直接返回
    if (!shouldPlayMusic()) {
      return;
    }

    // 初始化音频
    initAudio();

    // 创建控制按钮
    createMusicButton();

    // 监听视频播放
    setupVideoListener();

    // 恢复上次的播放状态
    const wasPlaying = localStorage.getItem(CONFIG.storageKeys.isPlaying);
    if (wasPlaying === 'true' || wasPlaying === null) {
      // 默认自动播放,或恢复上次播放状态
      playMusic();
    }

    // 页面卸载时保存状态
    window.addEventListener('beforeunload', saveState);

    // 页面隐藏时暂停,显示时恢复
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (audio && !audio.paused) {
          audio.pause();
        }
      } else {
        const wasPlaying = localStorage.getItem(CONFIG.storageKeys.isPlaying) === 'true';
        if (wasPlaying && shouldPlayMusic()) {
          playMusic();
        }
      }
    });
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 导出到全局(用于调试)
  window.BackgroundMusic = {
    play: playMusic,
    pause: pauseMusic,
    stop: stopMusic,
    toggle: toggleMusic,
    getAudio: () => audio
  };

})();
