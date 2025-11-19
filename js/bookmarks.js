/**
 * 收藏页面脚本 - 修复版
 * 盖茨比的世界 - 收藏管理
 */

// 页面数据映射 - 使用文件名作为键
const pageData = {
  'theme-intro.html': {
    title: '电影简介',
    icon: '📽️',
    paragraphs: [
      '1922年的春天,作家尼克满怀希望离开家乡,随淘金热潮来到纽约这个新兴的城市,虽然这里爵士乐流行,股票飞涨,但是贫富两极分化,人们沉沦在纸醉金迷中。尼克为了追寻美国梦,放弃写作而进入证券市场,并搬入纽约附近的海湾居住,成为了神秘富豪盖茨比的邻居。',
      '而海湾的对岸住着尼克的表妹黛西和她的贵族丈夫汤姆,尼克不仅被邀请去赴宴,之后汤姆还带着他去找情妇寻欢,尼克渐渐迷失在这个充满魅力,以及富豪编制的假象、爱与谎言的世界中。',
      '但是只有盖茨比最特别,他是唯一让尼克感到在这个迷失城市里充满希望的人。尼克被邀请参加了盖茨比豪宅中的盛宴,还发现盖茨比心中的秘密,原来他一直深爱着黛西,即使她没等到他战后归来,转而嫁给富豪汤姆,盖茨比一直深信他们的爱情矢志不渝。',
      '尼克作为盖茨比与黛西爱情的见证者,终于在盖茨比被谋杀之后,看清了这个上流社会的虚情寡义,决心远离喧嚣、冷漠、虚假的大都市,黯然回到故乡……'
    ]
  },
  'theme-plot.html': {
    title: '电影故事走向',
    icon: '🎬',
    paragraphs: [
      '主人公詹姆斯·盖茨比出身贫寒,却凭借惊人的野心与手段,在禁酒令时期靠贩卖私酒一夜暴富,买下长岛西卵的豪宅,每晚举办奢靡派对,只为吸引住在对岸的初恋黛西·布坎南注意。',
      '通过表弟尼克·卡拉威的牵线,盖茨比终于与黛西重逢。他向她展示财富与豪宅,试图让她相信"从未爱过丈夫汤姆",黛西一度动摇,两人关系迅速升温。',
      '汤姆识破盖茨比的"新钱"身份,当众羞辱他靠非法生意致富,并揭露黛西曾爱过自己。盖茨比仍逼黛西表态,黛西陷入崩溃。',
      '黛西驾驶盖茨比的车撞死汤姆的情妇威尔逊太太,盖茨比甘愿顶罪。威尔逊在汤姆误导下枪杀盖茨比后自尽。盖茨比的葬礼冷清凄凉,黛西与汤姆远走高飞,尼克看透"东卵"的虚伪,黯然返乡。'
    ]
  },
  'theme-insight.html': {
    title: '电影启迪',
    icon: '💡',
    paragraphs: [
      '盖茨比将"美国梦"简化为"财富+爱情",用金钱堆砌的派对与豪宅换来的却是黛西的退缩与背叛。电影警示:当梦想被物质异化,再华丽的幻象也会瞬间崩塌。',
      '无论盖茨比多富有,汤姆一句"我们不一样"便戳破"新钱"无法融入"老钱"的残酷现实。影片揭示:社会阶层不仅靠财富划分,更靠血统、教育与世代积累的特权。',
      '盖茨比把五年前的初恋黛西美化为"完美符号",拒绝接受她已变得世俗懦弱。电影提醒我们:过度美化的回忆会成为自我囚禁的牢笼,让人在虚幻中耗尽一生。',
      '汤姆与黛西"砸碎东西后退缩到金钱怀抱",尼克虽厌恶却未阻止悲剧。影片暗示:对虚伪的沉默纵容,会让整个社会沦为"灰烬之谷"般的道德荒原。',
      '结尾尼克凝视盖茨比曾眺望的绿灯,感叹"我们奋力前行,逆水行舟,直到回到往昔"。绿灯既是希望的召唤,也是无法抵达的彼岸——人类对理想的追逐,注定在得到与失去间永恒循环。'
    ]
  },
  'reviews': {
    title: '影评精选',
    icon: '💬',
    isReviews: true
  }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadBookmarks();
  initEventListeners();
  initProgress();
  initScrollAnimations();
  initCounterAnimation();
});

// 加载所有收藏
function loadBookmarks() {
  const bookmarksList = document.getElementById('bookmarksList');
  const emptyState = document.getElementById('emptyState');
  
  let totalCount = 0;
  let introCount = 0;
  let plotCount = 0;
  let insightCount = 0;
  let reviewsCount = 0;
  let userCommentsCount = 0;

  bookmarksList.innerHTML = '';

  // 遍历所有页面
  Object.keys(pageData).forEach(pagePath => {
    const pageInfo = pageData[pagePath];
    
    if (pageInfo.isReviews) {
      // 处理影评收藏
      const reviewBookmarks = getReviewBookmarks();
      if (reviewBookmarks.length > 0) {
        const group = createReviewBookmarkGroup(reviewBookmarks);
        bookmarksList.appendChild(group);
        totalCount += reviewBookmarks.length;
        reviewsCount = reviewBookmarks.length;
      }
    } else {
      // 处理普通页面收藏
      const bookmarks = getPageBookmarks(pagePath);
      
      if (bookmarks.length > 0) {
        // 创建分组
        const group = createBookmarkGroup(pagePath, pageInfo, bookmarks);
        bookmarksList.appendChild(group);
        
        // 更新计数
        totalCount += bookmarks.length;
        if (pagePath.includes('intro')) introCount = bookmarks.length;
        if (pagePath.includes('plot')) plotCount = bookmarks.length;
        if (pagePath.includes('insight')) insightCount = bookmarks.length;
      }
    }
  });

  // 处理用户评论收藏
  const userCommentBookmarks = getUserCommentBookmarks();
  if (userCommentBookmarks.length > 0) {
    const group = createUserCommentBookmarkGroup(userCommentBookmarks);
    bookmarksList.appendChild(group);
    totalCount += userCommentBookmarks.length;
    userCommentsCount = userCommentBookmarks.length;
  }

  // 更新统计数据
  document.getElementById('totalBookmarks').textContent = totalCount;
  document.getElementById('introCount').textContent = introCount;
  document.getElementById('plotCount').textContent = plotCount;
  document.getElementById('insightCount').textContent = insightCount;
  document.getElementById('reviewsCount').textContent = reviewsCount;
  document.getElementById('userCommentsCount').textContent = userCommentsCount;

  // 显示空状态
  if (totalCount === 0) {
    emptyState.style.display = 'block';
    bookmarksList.style.display = 'none';
  } else {
    emptyState.style.display = 'none';
    bookmarksList.style.display = 'flex';
  }
}

// 获取影评收藏
function getReviewBookmarks() {
  const bookmarks = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('bookmark_review_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        bookmarks.push(data);
      } catch (e) {
        console.error('解析影评收藏失败:', e);
      }
    }
  }
  
  return bookmarks;
}

// 创建影评收藏分组
function createReviewBookmarkGroup(bookmarks) {
  const group = document.createElement('div');
  group.className = 'bookmark-group';
  group.setAttribute('data-page', 'reviews');
  
  const header = document.createElement('div');
  header.className = 'group-header';
  header.innerHTML = `
    <h2 class="group-title">
      <span class="group-icon">💬</span>
      影评精选
      <span class="group-count">(${bookmarks.length})</span>
    </h2>
    <button class="clear-group-btn" data-page="reviews">清空此页</button>
  `;
  
  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'bookmark-items';
  
  bookmarks.forEach(review => {
    const item = createReviewBookmarkItem(review);
    itemsContainer.appendChild(item);
  });
  
  group.appendChild(header);
  group.appendChild(itemsContainer);
  
  return group;
}

// 获取用户评论收藏
function getUserCommentBookmarks() {
  const bookmarks = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('bookmark_user_comment_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        bookmarks.push(data);
      } catch (e) {
        console.error('解析用户评论收藏失败:', e);
      }
    }
  }
  
  // 按收藏时间倒序排列
  bookmarks.sort((a, b) => (b.bookmarkedAt || 0) - (a.bookmarkedAt || 0));
  
  return bookmarks;
}

// 创建用户评论收藏分组
function createUserCommentBookmarkGroup(bookmarks) {
  const group = document.createElement('div');
  group.className = 'bookmark-group';
  group.setAttribute('data-page', 'user-comments');
  
  const header = document.createElement('div');
  header.className = 'group-header';
  header.innerHTML = `
    <h2 class="group-title">
      <span class="group-icon">✍️</span>
      我的评论
      <span class="group-count">(${bookmarks.length})</span>
    </h2>
    <button class="clear-group-btn" data-page="user-comments">清空此页</button>
  `;
  
  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'bookmark-items';
  
  bookmarks.forEach(comment => {
    const item = createUserCommentBookmarkItem(comment);
    itemsContainer.appendChild(item);
  });
  
  group.appendChild(header);
  group.appendChild(itemsContainer);
  
  return group;
}

// 创建用户评论收藏项
function createUserCommentBookmarkItem(comment) {
  const item = document.createElement('div');
  item.className = 'bookmark-item';
  item.setAttribute('data-page', 'user-comments');
  item.setAttribute('data-comment-id', comment.id);
  
  // 截取内容预览
  let preview = comment.content;
  if (preview.length > 200) {
    preview = preview.substring(0, 200) + '...';
  }
  
  // 格式化时间
  const timeStr = formatBookmarkTime(comment.timestamp);
  
  item.innerHTML = `
    <p class="bookmark-content">${escapeHtml(preview)}</p>
    <div class="bookmark-meta">
      <span class="bookmark-source">作者: ${escapeHtml(comment.author)} · ${timeStr}</span>
      <div class="bookmark-actions">
        <a href="reviews.html#user-comments" class="mini-btn">查看原文</a>
        <button class="mini-btn remove" data-page="user-comments" data-comment-id="${comment.id}">移除</button>
      </div>
    </div>
  `;
  
  return item;
}

// 格式化收藏时间
function formatBookmarkTime(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// HTML转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}


// 创建单个影评收藏项
function createReviewBookmarkItem(review) {
  const item = document.createElement('div');
  item.className = 'bookmark-item';
  item.setAttribute('data-page', 'reviews');
  item.setAttribute('data-review-id', review.id);
  
  // 截取内容预览
  let preview = review.content;
  if (preview.length > 200) {
    preview = preview.substring(0, 200) + '...';
  }
  
  item.innerHTML = `
    <p class="bookmark-content">${preview}</p>
    <div class="bookmark-meta">
      <span class="bookmark-source">来源: ${review.platform} · ${review.author}</span>
      <div class="bookmark-actions">
        <a href="reviews.html" class="mini-btn">查看原文</a>
        <button class="mini-btn remove" data-page="reviews" data-review-id="${review.id}">移除</button>
      </div>
    </div>
  `;
  
  return item;
}

// 获取单个页面的收藏 - 增强版,兼容多种路径格式
function getPageBookmarks(pagePath) {
  const bookmarks = [];
  const paragraphs = pageData[pagePath].paragraphs;
  
  paragraphs.forEach((content, index) => {
    // 尝试多种可能的键名格式
    const possibleKeys = [
      `bookmark_${pagePath}_${index}`,                    // 标准格式: bookmark_theme-intro.html_0
      `bookmark_/${pagePath}_${index}`,                   // 带斜杠: bookmark_/theme-intro.html_0
    ];
    
    // 还要检查localStorage中所有以bookmark_开头且包含页面名的键
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('bookmark_') && 
          key.includes(pagePath.replace('.html', '')) && 
          key.endsWith(`_${index}`)) {
        possibleKeys.push(key);
      }
    }
    
    // 检查任一格式是否存在
    const found = possibleKeys.some(key => localStorage.getItem(key));
    if (found) {
      bookmarks.push({ index, content });
    }
  });
  
  return bookmarks;
}

// 创建收藏分组
function createBookmarkGroup(pagePath, pageInfo, bookmarks) {
  const group = document.createElement('div');
  group.className = 'bookmark-group';
  group.setAttribute('data-page', pagePath);
  
  const header = document.createElement('div');
  header.className = 'group-header';
  header.innerHTML = `
    <h2 class="group-title">
      <span class="group-icon">${pageInfo.icon}</span>
      ${pageInfo.title}
      <span class="group-count">(${bookmarks.length})</span>
    </h2>
    <button class="clear-group-btn" data-page="${pagePath}">清空此页</button>
  `;
  
  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'bookmark-items';
  
  bookmarks.forEach(bookmark => {
    const item = createBookmarkItem(pagePath, bookmark);
    itemsContainer.appendChild(item);
  });
  
  group.appendChild(header);
  group.appendChild(itemsContainer);
  
  return group;
}

// 获取用户评论收藏
function getUserCommentBookmarks() {
  const bookmarks = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('bookmark_user_comment_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        bookmarks.push(data);
      } catch (e) {
        console.error('解析用户评论收藏失败:', e);
      }
    }
  }
  
  // 按收藏时间倒序排列
  bookmarks.sort((a, b) => (b.bookmarkedAt || 0) - (a.bookmarkedAt || 0));
  
  return bookmarks;
}

// 创建用户评论收藏分组
function createUserCommentBookmarkGroup(bookmarks) {
  const group = document.createElement('div');
  group.className = 'bookmark-group';
  group.setAttribute('data-page', 'user-comments');
  
  const header = document.createElement('div');
  header.className = 'group-header';
  header.innerHTML = `
    <h2 class="group-title">
      <span class="group-icon">✍️</span>
      我的评论
      <span class="group-count">(${bookmarks.length})</span>
    </h2>
    <button class="clear-group-btn" data-page="user-comments">清空此页</button>
  `;
  
  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'bookmark-items';
  
  bookmarks.forEach(comment => {
    const item = createUserCommentBookmarkItem(comment);
    itemsContainer.appendChild(item);
  });
  
  group.appendChild(header);
  group.appendChild(itemsContainer);
  
  return group;
}

// 创建用户评论收藏项
function createUserCommentBookmarkItem(comment) {
  const item = document.createElement('div');
  item.className = 'bookmark-item';
  item.setAttribute('data-page', 'user-comments');
  item.setAttribute('data-comment-id', comment.id);
  
  // 截取内容预览
  let preview = comment.content;
  if (preview.length > 200) {
    preview = preview.substring(0, 200) + '...';
  }
  
  // 格式化时间
  const timeStr = formatBookmarkTime(comment.timestamp);
  
  item.innerHTML = `
    <p class="bookmark-content">${escapeHtml(preview)}</p>
    <div class="bookmark-meta">
      <span class="bookmark-source">作者: ${escapeHtml(comment.author)} · ${timeStr}</span>
      <div class="bookmark-actions">
        <a href="reviews.html#user-comments" class="mini-btn">查看原文</a>
        <button class="mini-btn remove" data-page="user-comments" data-comment-id="${comment.id}">移除</button>
      </div>
    </div>
  `;
  
  return item;
}

// 格式化收藏时间
function formatBookmarkTime(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// HTML转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}


// 创建单个收藏项
function createBookmarkItem(pagePath, bookmark) {
  const item = document.createElement('div');
  item.className = 'bookmark-item';
  item.setAttribute('data-page', pagePath);
  item.setAttribute('data-index', bookmark.index);
  
  // 截取内容预览(超过150字显示省略号)
  let preview = bookmark.content;
  if (preview.length > 150) {
    preview = preview.substring(0, 150) + '...';
  }
  
  item.innerHTML = `
    <p class="bookmark-content">${preview}</p>
    <div class="bookmark-meta">
      <span class="bookmark-source">来源: ${pageData[pagePath].title} - 第 ${bookmark.index + 1} 段</span>
      <div class="bookmark-actions">
        <a href="${pagePath}" class="mini-btn">查看原文</a>
        <button class="mini-btn remove" data-page="${pagePath}" data-index="${bookmark.index}">移除</button>
      </div>
    </div>
  `;
  
  return item;
}

// 事件监听
function initEventListeners() {
  // 清空全部收藏
  document.getElementById('clearAllBtn').addEventListener('click', () => {
    if (confirm('确定要清空所有收藏吗?此操作不可撤销!')) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('bookmark_')) {
          localStorage.removeItem(key);
        }
      });
      loadBookmarks();
      showToast('已清空所有收藏 🗑️');
    }
  });

  // 导出收藏
  document.getElementById('exportBtn').addEventListener('click', () => {
    exportBookmarks();
  });

  // 事件委托处理删除和清空分组
  document.addEventListener('click', (e) => {
    // 移除单个收藏
    if (e.target.classList.contains('remove')) {
      const page = e.target.dataset.page;
      
      if (page === 'reviews') {
        // 移除影评收藏
        const reviewId = e.target.dataset.reviewId;
        const storageKey = `bookmark_review_${reviewId}`;
        localStorage.removeItem(storageKey);
        loadBookmarks();
        showToast('已移除该影评收藏 ❌');
      } else if (page === 'user-comments') {
        // 移除用户评论收藏
        const commentId = e.target.dataset.commentId;
        const storageKey = `bookmark_user_comment_${commentId}`;
        localStorage.removeItem(storageKey);
        loadBookmarks();
        showToast('已移除该评论收藏 ❌');
      } else {
        // 移除普通页面收藏
        const index = e.target.dataset.index;
        
        // 移除所有可能的键名格式
        const possibleKeys = [
          `bookmark_${page}_${index}`,
          `bookmark_/${page}_${index}`,
        ];
        
        // 查找并移除所有匹配的键
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith('bookmark_') && 
              key.includes(page.replace('.html', '')) && 
              key.endsWith(`_${index}`)) {
            localStorage.removeItem(key);
          }
        }
        
        loadBookmarks();
        showToast('已移除该收藏 ❌');
      }
    }
    
    // 清空分组
    if (e.target.classList.contains('clear-group-btn')) {
      const page = e.target.dataset.page;
      
      if (page === 'reviews') {
        // 清空所有影评收藏
        if (confirm('确定要清空所有影评收藏吗?')) {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('bookmark_review_')) {
              localStorage.removeItem(key);
            }
          }
          loadBookmarks();
          showToast('已清空影评收藏 🗑️');
        }
      } else if (page === 'user-comments') {
        // 清空所有用户评论收藏
        if (confirm('确定要清空所有我的评论收藏吗?')) {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('bookmark_user_comment_')) {
              localStorage.removeItem(key);
            }
          }
          loadBookmarks();
          showToast('已清空我的评论收藏 🗑️');
        }
      } else {
        // 清空普通页面收藏
        if (confirm(`确定要清空"${pageData[page].title}"的所有收藏吗?`)) {
          const paragraphs = pageData[page].paragraphs;
          paragraphs.forEach((_, index) => {
            // 移除所有可能的键名格式
            for (let i = localStorage.length - 1; i >= 0; i--) {
              const key = localStorage.key(i);
              if (key && key.startsWith('bookmark_') && 
                  key.includes(page.replace('.html', '')) && 
                  key.endsWith(`_${index}`)) {
                localStorage.removeItem(key);
              }
            }
          });
          loadBookmarks();
          showToast(`已清空"${pageData[page].title}"的收藏 🗑️`);
        }
      }
    }
  });
}

// 导出收藏为文本
function exportBookmarks() {
  let exportText = '《了不起的盖茨比》- 我的收藏\n';
  exportText += '='.repeat(50) + '\n\n';
  
  Object.keys(pageData).forEach(pagePath => {
    const pageInfo = pageData[pagePath];
    
    if (pageInfo.isReviews) {
      // 导出影评收藏
      const reviewBookmarks = getReviewBookmarks();
      if (reviewBookmarks.length > 0) {
        exportText += `【${pageInfo.title}】\n\n`;
        reviewBookmarks.forEach((review, idx) => {
          exportText += `${idx + 1}. ${review.platform} · ${review.author}\n${review.content}\n\n`;
        });
        exportText += '-'.repeat(50) + '\n\n';
      }
    } else {
      // 导出普通页面收藏
      const bookmarks = getPageBookmarks(pagePath);
      
      if (bookmarks.length > 0) {
        exportText += `【${pageInfo.title}】\n\n`;
        bookmarks.forEach((bookmark, idx) => {
          exportText += `${idx + 1}. ${bookmark.content}\n\n`;
        });
        exportText += '-'.repeat(50) + '\n\n';
      }
    }
  });
  
  exportText += `导出时间: ${new Date().toLocaleString('zh-CN')}\n`;
  
  // 创建下载
  const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `盖茨比收藏_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('收藏已导出 📥');
}

// 进度条
function initProgress() {
  const progressBar = document.getElementById('readingProgress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
  });
}

// Toast提示
function showToast(message, duration = 2000) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification show';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// 数字计数动画
function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat-number');
  
  const animateCounter = (element, target) => {
    const duration = 1500;
    const start = 0;
    const startTime = performance.now();
    
    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 缓动函数
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * target);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };
    
    requestAnimationFrame(updateCounter);
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        const target = parseInt(entry.target.textContent) || 0;
        entry.target.dataset.animated = 'true';
        animateCounter(entry.target, target);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => observer.observe(counter));
}

// 滚动动画
function initScrollAnimations() {
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
  
  // 观察所有收藏项
  setTimeout(() => {
    document.querySelectorAll('.bookmark-item').forEach(item => {
      observer.observe(item);
    });
  }, 100);
}

// 鼠标跟随光晕效果(桌面端)
if (window.innerWidth > 768) {
  document.addEventListener('mousemove', (e) => {
    const groups = document.querySelectorAll('.bookmark-group');
    groups.forEach(group => {
      const rect = group.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        group.style.setProperty('--mouse-x', `${x}px`);
        group.style.setProperty('--mouse-y', `${y}px`);
      }
    });
  });
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + H 返回首页
  if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
    e.preventDefault();
    window.location.href = 'index.html';
  }
  
  // Ctrl/Cmd + M 返回主题页
  if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
    e.preventDefault();
    window.location.href = 'themes.html';
  }
  
  // Ctrl/Cmd + E 导出收藏
  if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
    e.preventDefault();
    exportBookmarks();
  }
});

// 回到顶部按钮
const backToTopBtn = document.getElementById('backToTop');

if (backToTopBtn) {
  // 显示/隐藏按钮
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  // 点击回到顶部
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
