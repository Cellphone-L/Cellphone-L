/**
 * 主题页面交互增强脚本
 * 盖茨比的世界 - 沉浸式体验
 */

// ========================================
// 1. 阅读进度条
// ========================================
function initReadingProgress() {
  const progressBar = document.getElementById('readingProgress');
  if (!progressBar) return;

  let ticking = false;
  
  function updateProgress() {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateProgress);
      ticking = true;
    }
  });
}

// ========================================
// 2. 段落视差效果(高级滚动交互)
// ========================================
function initParallaxParagraphs() {
  const paragraphs = document.querySelectorAll(
    '.intro-paragraph, .plot-section, .insight-section'
  );
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  paragraphs.forEach(p => {
    p.style.opacity = '0';
    p.style.transform = 'translateY(30px)';
    p.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(p);
  });
}

// ========================================
// 3. 鼠标跟随光标特效
// ========================================
function initCursorGlow() {
  // 仅在桌面端启用
  if (window.innerWidth < 768) return;

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor-glow';
  cursor.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(247, 192, 92, 0.15), transparent 70%);
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    opacity: 0;
    mix-blend-mode: screen;
  `;
  document.body.appendChild(cursor);

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  // 平滑跟随动画
  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.1;
    cursorY += (mouseY - cursorY) * 0.1;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
}

// ========================================
// 4. 段落高亮书签功能
// ========================================
function initParagraphBookmark() {
  const paragraphs = document.querySelectorAll(
    '.intro-paragraph, .plot-paragraph, .insight-paragraph'
  );

  paragraphs.forEach((p, index) => {
    // 添加书签按钮
    const bookmark = document.createElement('button');
    bookmark.className = 'paragraph-bookmark';
    bookmark.innerHTML = '🔖';
    bookmark.title = '标记此段落';
    bookmark.style.cssText = `
      position: absolute;
      right: 12px;
      top: 12px;
      background: rgba(247, 192, 92, 0.2);
      border: 1px solid rgba(247, 192, 92, 0.4);
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
      opacity: 0;
      transition: all 0.3s ease;
      font-size: 16px;
      z-index: 10;
    `;

    p.style.position = 'relative';
    p.appendChild(bookmark);

    // 悬停显示
    p.addEventListener('mouseenter', () => {
      bookmark.style.opacity = '0.6';
    });
    p.addEventListener('mouseleave', () => {
      if (!bookmark.classList.contains('bookmarked')) {
        bookmark.style.opacity = '0';
      }
    });

    // 点击收藏
    bookmark.addEventListener('click', (e) => {
      e.stopPropagation();
      bookmark.classList.toggle('bookmarked');
      
      // 获取当前页面的文件名(不含路径)
      const pageName = window.location.pathname.split('/').pop() || 
                       window.location.pathname.split('\\').pop() ||
                       'unknown.html';
      
      if (bookmark.classList.contains('bookmarked')) {
        bookmark.style.opacity = '1';
        bookmark.style.background = 'rgba(247, 192, 92, 0.4)';
        bookmark.style.transform = 'scale(1.2)';
        
        // 保存到 localStorage - 使用统一格式
        const key = `bookmark_${pageName}_${index}`;
        localStorage.setItem(key, 'true');
        
        // 显示提示
        showToast('已收藏此段落 ✨');
      } else {
        bookmark.style.opacity = '0.6';
        bookmark.style.background = 'rgba(247, 192, 92, 0.2)';
        bookmark.style.transform = 'scale(1)';
        
        const key = `bookmark_${pageName}_${index}`;
        localStorage.removeItem(key);
        
        // 显示取消收藏提示
        showToast('已取消收藏该段落 ❌');
      }
    });

    // 恢复收藏状态
    const pageName = window.location.pathname.split('/').pop() || 
                     window.location.pathname.split('\\').pop() ||
                     'unknown.html';
    const key = `bookmark_${pageName}_${index}`;
    if (localStorage.getItem(key)) {
      bookmark.classList.add('bookmarked');
      bookmark.style.opacity = '1';
      bookmark.style.background = 'rgba(247, 192, 92, 0.4)';
    }
  });
}

// ========================================
// 5. 复制文本提示
// ========================================
function initCopyNotification() {
  document.addEventListener('copy', () => {
    showToast('文本已复制 📋');
  });
}

// ========================================
// 6. 音效反馈(可选)
// ========================================
function initAudioFeedback() {
  // 创建音频上下文(需要用户交互触发)
  let audioCtx = null;
  
  function playTone(frequency, duration) {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration);
  }

  // 为导航链接添加音效
  document.querySelectorAll('.theme-page-nav a, .panel-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
      playTone(800, 0.1);
    });
  });
}

// ========================================
// 7. 键盘快捷键
// ========================================
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + H: 返回首页
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
      e.preventDefault();
      window.location.href = 'index.html';
    }
    
    // Ctrl/Cmd + M: 返回主题选择
    if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
      e.preventDefault();
      window.location.href = 'themes.html';
    }
    
    // 上下方向键平滑滚动
    if (e.key === 'ArrowDown' && e.shiftKey) {
      e.preventDefault();
      window.scrollBy({ top: 300, behavior: 'smooth' });
    }
    if (e.key === 'ArrowUp' && e.shiftKey) {
      e.preventDefault();
      window.scrollBy({ top: -300, behavior: 'smooth' });
    }
  });
}

// ========================================
// 8. 回到顶部按钮
// ========================================
function initBackToTop() {
  const button = document.createElement('button');
  button.className = 'back-to-top';
  button.innerHTML = '↑';
  button.title = '回到顶部 (Shift+Home)';
  button.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 40px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, rgba(247, 192, 92, 0.9), rgba(247, 231, 173, 0.9));
    border: 2px solid rgba(247, 192, 92, 0.6);
    border-radius: 50%;
    cursor: pointer;
    font-size: 24px;
    color: #1a1207;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    z-index: 1000;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    pointer-events: none;
  `;
  document.body.appendChild(button);

  // 滚动显示/隐藏
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      button.style.opacity = '1';
      button.style.transform = 'translateY(0)';
      button.style.pointerEvents = 'auto';
    } else {
      button.style.opacity = '0';
      button.style.transform = 'translateY(20px)';
      button.style.pointerEvents = 'none';
    }
  });

  // 点击滚动到顶部
  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 悬停效果
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-4px) scale(1.1)';
    button.style.boxShadow = '0 12px 36px rgba(247, 192, 92, 0.5)';
  });
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0) scale(1)';
    button.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
  });
}

// ========================================
// 9. Toast 提示组件
// ========================================
function showToast(message, duration = 2000) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    padding: 12px 24px;
    background: rgba(6, 7, 10, 0.9);
    border: 1px solid rgba(247, 192, 92, 0.6);
    border-radius: 999px;
    color: rgba(247, 231, 173, 0.98);
    font-size: 14px;
    letter-spacing: 0.08em;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    z-index: 10000;
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: none;
  `;
  document.body.appendChild(toast);

  // 淡入
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);

  // 淡出
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ========================================
// 10. 页面可见性检测(暂停/恢复动画)
// ========================================
function initVisibilityControl() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // 页面隐藏时暂停动画
      document.body.style.animationPlayState = 'paused';
    } else {
      // 页面可见时恢复动画
      document.body.style.animationPlayState = 'running';
    }
  });
}

// ========================================
// 初始化所有功能
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  initReadingProgress();
  initParallaxParagraphs();
  initCursorGlow();
  initParagraphBookmark();
  initCopyNotification();
  // initAudioFeedback(); // 可选:取消注释启用音效
  initKeyboardShortcuts();
  initBackToTop();
  initVisibilityControl();

  // 显示快捷键提示(首次访问)
  if (!localStorage.getItem('shortcut_tip_shown')) {
    setTimeout(() => {
      showToast('提示: Ctrl+H 返回首页 | Ctrl+M 返回主题', 4000);
      localStorage.setItem('shortcut_tip_shown', 'true');
    }, 2000);
  }
});

// ========================================
// 导出(如果需要在其他脚本中使用)
// ========================================
window.ThemeInteractions = {
  showToast
};
