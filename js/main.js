document.addEventListener("DOMContentLoaded", () => {
  const enterExperienceButton = document.getElementById("enterExperienceButton");
  const videoOverlay = document.getElementById("videoOverlay");
  const gatsbyExperienceVideo = document.getElementById("gatsbyExperienceVideo");
  const skipHotspot = document.getElementById("skipHotspot");
  const skipHint = document.getElementById("skipHint");
  const themesPageUrl = "themes.html";
  let skipPromptActive = false;

  if (!enterExperienceButton || !videoOverlay || !gatsbyExperienceVideo || !skipHotspot || !skipHint) {
    return;
  }

  gatsbyExperienceVideo.removeAttribute("controls");
  gatsbyExperienceVideo.setAttribute("controlsList", "nodownload noremoteplayback nofullscreen");

  // ========== 涟漪效果 ==========
  function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }

  // 为所有按钮添加涟漪效果
  document.querySelectorAll('.cta-button, .panel-link, .nav-link').forEach(btn => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.addEventListener('click', createRipple);
  });

  // ========== 3D卡片倾斜效果 ==========
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.addEventListener('mousemove', (e) => {
      const rect = heroContent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 25;
      const rotateY = (centerX - x) / 25;
      
      heroContent.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    heroContent.addEventListener('mouseleave', () => {
      heroContent.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  }

  // ========== 自定义光标 ==========
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);
  document.body.classList.add('has-custom-cursor');

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  const speed = 0.15;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.classList.add('active');
  });

  document.addEventListener('mouseleave', () => {
    cursor.classList.remove('active');
  });

  // 平滑跟随
  function animateCursor() {
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // 交互元素悬浮效果
  document.querySelectorAll('a, button, .nav-link, .cta-button').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  document.addEventListener('mousedown', () => cursor.classList.add('click'));
  document.addEventListener('mouseup', () => cursor.classList.remove('click'));

  // ========== 视差滚动效果 ==========
  const starlightField = document.querySelector('.starlight-field');
  if (starlightField) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      starlightField.style.transform = `translateY(${scrolled * 0.5}px)`;
    });
  }

  // ========== 粒子爆发增强效果 ==========
  const particlesContainer = document.querySelector('.particles-container');
  const ctaButton = document.querySelector('.cta-button');
  
  if (particlesContainer && ctaButton) {
    // 按钮悬停触发粒子爆发
    ctaButton.addEventListener('mouseenter', () => {
      particlesContainer.classList.add('particle-burst');
    });
    
    ctaButton.addEventListener('mouseleave', () => {
      particlesContainer.classList.remove('particle-burst');
    });
    
    // hero-content 悬停也触发粒子增强
    if (heroContent) {
      heroContent.addEventListener('mouseenter', () => {
        particlesContainer.classList.add('particle-enhanced');
      });
      
      heroContent.addEventListener('mouseleave', () => {
        particlesContainer.classList.remove('particle-enhanced');
      });
    }
  }

  function showSkipHint() {
    skipPromptActive = true;
    skipHint.setAttribute("aria-hidden", "false");
    skipHint.classList.add("visible");
  }

  function hideSkipHint() {
    skipPromptActive = false;
    skipHint.setAttribute("aria-hidden", "true");
    skipHint.classList.remove("visible");
  }

  function skipImmediately() {
    showSkipHint();
    window.setTimeout(() => {
      exitToThemes();
    }, 260);
  }

  function activateVideoOverlay() {
    videoOverlay.classList.add("active");
    videoOverlay.classList.remove("interaction-required");
    videoOverlay.setAttribute("aria-hidden", "false");
    gatsbyExperienceVideo.currentTime = 0;
    hideSkipHint();
    startCaptionAnimation();

    const playPromise = gatsbyExperienceVideo.play();
    if (playPromise instanceof Promise) {
      playPromise.catch(() => {
        videoOverlay.classList.add("interaction-required");
        gatsbyExperienceVideo.addEventListener(
          "click",
          () => {
            gatsbyExperienceVideo.play();
            videoOverlay.classList.remove("interaction-required");
          },
          { once: true }
        );
      });
    }
  }

  function exitToThemes() {
    resetOverlay();
    window.location.href = themesPageUrl;
  }

  function resetOverlay() {
    videoOverlay.classList.remove("active");
    videoOverlay.setAttribute("aria-hidden", "true");
    gatsbyExperienceVideo.pause();
    gatsbyExperienceVideo.currentTime = 0;
    stopCaptionAnimation();
    hideSkipHint();
  }

  skipHotspot.addEventListener("click", (event) => {
    event.stopPropagation();
    skipImmediately();
  });

  videoOverlay.addEventListener("click", (event) => {
    if (event.target === skipHotspot) {
      return;
    }
    const { clientX, clientY } = event;
    const hotspotRect = skipHotspot.getBoundingClientRect();
    if (clientX >= hotspotRect.left && clientX <= hotspotRect.right && clientY >= hotspotRect.top && clientY <= hotspotRect.bottom) {
      skipImmediately();
    }
  });

  gatsbyExperienceVideo.addEventListener("ended", exitToThemes);

  enterExperienceButton.addEventListener("click", activateVideoOverlay);

  const captionEllipsis = document.querySelector(".caption-ellipsis");
  let ellipsisIntervalId = null;

  function startCaptionAnimation() {
    if (!captionEllipsis) {
      return;
    }
    stopCaptionAnimation();
    let dotCount = 0;
    ellipsisIntervalId = window.setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      captionEllipsis.textContent = ".".repeat(dotCount);
    }, 480);
  }

  function stopCaptionAnimation() {
    if (!captionEllipsis) {
      return;
    }
    window.clearInterval(ellipsisIntervalId ?? undefined);
    captionEllipsis.textContent = "";
    ellipsisIntervalId = null;
  }
});
