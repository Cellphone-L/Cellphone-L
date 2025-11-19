// 影评页面交互脚本

// 影评数据存储
const reviewsData = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initReviewsData();
  initBookmarks();
  initUserComments();
  initQuickNav();
});

// 初始化用户评论功能
function initUserComments() {
  const addCommentBtn = document.getElementById('addCommentBtn');
  const commentModal = document.getElementById('commentModal');
  const closeModal = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const submitBtn = document.getElementById('submitBtn');
  const commentContent = document.getElementById('commentContent');
  const charCount = document.getElementById('charCount');
  
  // 加载已有评论
  loadUserComments();
  
  // 打开弹窗
  addCommentBtn.addEventListener('click', () => {
    commentModal.classList.add('show');
    document.body.style.overflow = 'hidden';
  });
  
  // 关闭弹窗
  const closeModalFunc = () => {
    commentModal.classList.remove('show');
    document.body.style.overflow = 'auto';
    clearCommentForm();
  };
  
  closeModal.addEventListener('click', closeModalFunc);
  cancelBtn.addEventListener('click', closeModalFunc);
  
  // 点击背景关闭
  commentModal.addEventListener('click', (e) => {
    if (e.target === commentModal) {
      closeModalFunc();
    }
  });
  
  // 字数统计
  commentContent.addEventListener('input', () => {
    const count = commentContent.value.length;
    charCount.textContent = count;
    
    if (count > 1000) {
      charCount.style.color = '#ff6b6b';
    } else {
      charCount.style.color = 'var(--color-accent, #f7c05c)';
    }
  });
  
  // 提交评论
  submitBtn.addEventListener('click', () => {
    submitUserComment();
  });
  
  // 回车键提交(Ctrl+Enter)
  commentContent.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      submitUserComment();
    }
  });
}

// 加载用户评论
function loadUserComments() {
  const commentsList = document.getElementById('commentsList');
  const emptyComments = document.getElementById('emptyComments');
  const commentsCount = document.getElementById('commentsCount');
  
  const comments = getUserComments();
  
  if (comments.length === 0) {
    commentsList.style.display = 'none';
    emptyComments.style.display = 'block';
    commentsCount.textContent = '(0)';
    updateMyCommentBadge(0);
    return;
  }
  
  commentsList.style.display = 'grid';
  emptyComments.style.display = 'none';
  commentsCount.textContent = `(${comments.length})`;
  updateMyCommentBadge(comments.length);
  
  commentsList.innerHTML = '';
  
  // 按时间倒序排列
  comments.sort((a, b) => b.timestamp - a.timestamp);
  
  comments.forEach(comment => {
    const card = createUserCommentCard(comment);
    commentsList.appendChild(card);
  });
}

// 创建用户评论卡片
function createUserCommentCard(comment) {
  const card = document.createElement('div');
  card.className = 'user-comment-card';
  card.dataset.commentId = comment.id;
  
  const timeStr = formatTime(comment.timestamp);
  const isBookmarked = isUserCommentBookmarked(comment.id);
  const bookmarkClass = isBookmarked ? 'bookmarked' : '';
  
  card.innerHTML = `
    <div class="user-comment-header">
      <div class="user-comment-info">
        <div class="user-comment-author">${escapeHtml(comment.author)}</div>
        <div class="user-comment-time">${timeStr}</div>
      </div>
      <div class="user-comment-actions">
        <button class="user-bookmark-btn ${bookmarkClass}" data-comment-id="${comment.id}" title="收藏这条评论">
          <span class="bookmark-icon">🔖</span>
        </button>
        <button class="comment-action-btn edit" data-id="${comment.id}">编辑</button>
        <button class="comment-action-btn delete" data-id="${comment.id}">删除</button>
      </div>
    </div>
    <div class="user-comment-content">${escapeHtml(comment.content)}</div>
  `;
  
  // 绑定收藏、编辑和删除事件
  const bookmarkBtn = card.querySelector('.user-bookmark-btn');
  const editBtn = card.querySelector('.edit');
  const deleteBtn = card.querySelector('.delete');
  
  bookmarkBtn.addEventListener('click', () => toggleUserCommentBookmark(comment, bookmarkBtn));
  editBtn.addEventListener('click', () => editUserComment(comment.id));
  deleteBtn.addEventListener('click', () => deleteUserComment(comment.id));
  
  return card;
}

// 获取用户评论
function getUserComments() {
  const comments = localStorage.getItem('user_comments');
  return comments ? JSON.parse(comments) : [];
}

// 保存用户评论
function saveUserComments(comments) {
  localStorage.setItem('user_comments', JSON.stringify(comments));
}

// 提交评论
function submitUserComment() {
  const authorInput = document.getElementById('commentAuthor');
  const contentInput = document.getElementById('commentContent');
  
  const author = authorInput.value.trim();
  const content = contentInput.value.trim();
  
  if (!author) {
    showToast('请输入昵称 ⚠️');
    authorInput.focus();
    return;
  }
  
  if (!content) {
    showToast('请输入影评内容 ⚠️');
    contentInput.focus();
    return;
  }
  
  if (content.length > 1000) {
    showToast('影评内容不能超过1000字 ⚠️');
    return;
  }
  
  const comments = getUserComments();
  
  // 检查是否是编辑模式
  const editingId = document.getElementById('submitBtn').dataset.editingId;
  
  if (editingId) {
    // 编辑现有评论
    const index = comments.findIndex(c => c.id === editingId);
    if (index !== -1) {
      comments[index].author = author;
      comments[index].content = content;
      comments[index].timestamp = Date.now();
      showToast('影评已更新 ✅');
    }
    delete document.getElementById('submitBtn').dataset.editingId;
  } else {
    // 添加新评论
    const newComment = {
      id: Date.now().toString(),
      author: author,
      content: content,
      timestamp: Date.now()
    };
    comments.push(newComment);
    showToast('影评发表成功 🎉');
  }
  
  saveUserComments(comments);
  loadUserComments();
  
  // 关闭弹窗
  document.getElementById('commentModal').classList.remove('show');
  document.body.style.overflow = 'auto';
  clearCommentForm();
}

// 编辑评论
function editUserComment(commentId) {
  const comments = getUserComments();
  const comment = comments.find(c => c.id === commentId);
  
  if (!comment) return;
  
  // 填充表单
  document.getElementById('commentAuthor').value = comment.author;
  document.getElementById('commentContent').value = comment.content;
  document.getElementById('charCount').textContent = comment.content.length;
  
  // 标记为编辑模式
  document.getElementById('submitBtn').dataset.editingId = commentId;
  document.querySelector('.modal-title').innerHTML = `
    <span class="modal-icon">✏️</span>
    编辑影评
  `;
  
  // 打开弹窗
  document.getElementById('commentModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

// 删除评论
function deleteUserComment(commentId) {
  if (!confirm('确定要删除这条影评吗?')) {
    return;
  }
  
  const comments = getUserComments();
  const filtered = comments.filter(c => c.id !== commentId);
  
  saveUserComments(filtered);
  loadUserComments();
  showToast('影评已删除 🗑️');
}

// 清空表单
function clearCommentForm() {
  document.getElementById('commentAuthor').value = '';
  document.getElementById('commentContent').value = '';
  document.getElementById('charCount').textContent = '0';
  delete document.getElementById('submitBtn').dataset.editingId;
  document.querySelector('.modal-title').innerHTML = `
    <span class="modal-icon">✍️</span>
    发表影评
  `;
}

// 格式化时间
function formatTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const date = new Date(timestamp);
  
  // 1分钟内
  if (diff < 60000) {
    return '刚刚';
  }
  
  // 1小时内
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分钟前`;
  }
  
  // 24小时内
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}小时前`;
  }
  
  // 7天内
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}天前`;
  }
  
  // 显示完整日期
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

// HTML转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 初始化影评数据
function initReviewsData() {
  const reviewCards = document.querySelectorAll('.review-card');
  reviewCards.forEach((card) => {
    const reviewId = card.dataset.reviewId;
    const platform = card.dataset.platform;
    const author = card.querySelector('.author-name').textContent;
    const content = card.querySelector('.review-content').textContent.trim();
    
    reviewsData[reviewId] = {
      id: reviewId,
      platform: platform,
      author: author,
      content: content
    };
  });
}

// 初始化收藏功能
function initBookmarks() {
  const bookmarkButtons = document.querySelectorAll('.bookmark-btn');
  
  // 检查并更新收藏状态
  bookmarkButtons.forEach(btn => {
    const reviewId = btn.dataset.reviewId;
    const storageKey = `bookmark_review_${reviewId}`;
    
    if (localStorage.getItem(storageKey)) {
      btn.classList.add('bookmarked');
    }
    
    // 添加点击事件
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleBookmark(reviewId, btn);
    });
  });
}

// 切换收藏状态
function toggleBookmark(reviewId, button) {
  const storageKey = `bookmark_review_${reviewId}`;
  
  if (button.classList.contains('bookmarked')) {
    // 取消收藏
    localStorage.removeItem(storageKey);
    button.classList.remove('bookmarked');
    showToast('已取消收藏 ❌');
  } else {
    // 添加收藏
    const reviewData = reviewsData[reviewId];
    localStorage.setItem(storageKey, JSON.stringify(reviewData));
    button.classList.add('bookmarked');
    showToast('已收藏 🔖');
  }
}

// Toast提示
function showToast(message, duration = 2000) {
  // 移除已存在的toast
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translateX(-50%) translateY(-20px);
    background: linear-gradient(135deg, rgba(247, 192, 92, 0.95), rgba(247, 192, 92, 0.85));
    color: rgba(6, 7, 10, 0.95);
    padding: 16px 32px;
    border-radius: 999px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.05em;
    z-index: 10000;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 40px rgba(247, 192, 92, 0.4);
    pointer-events: none;
  `;
  
  document.body.appendChild(toast);
  
  // 显示动画
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);
  
  // 隐藏动画
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// 返回顶部按钮
const backToTopButton = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTopButton.classList.add('visible');
  } else {
    backToTopButton.classList.remove('visible');
  }
});

backToTopButton.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// 平台筛选功能
const filterButtons = document.querySelectorAll('.filter-btn');
const reviewCards = document.querySelectorAll('.review-card');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const platform = button.dataset.platform;
    
    // 更新按钮状态
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // 筛选卡片
    reviewCards.forEach((card, index) => {
      if (platform === 'all' || card.dataset.platform === platform) {
        card.style.display = 'block';
        // 重新触发动画
        card.style.animation = 'none';
        setTimeout(() => {
          card.style.animation = '';
        }, 10);
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// 卡片滚动动画
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'cardFadeIn 0.6s ease-out forwards';
    }
  });
}, observerOptions);

reviewCards.forEach(card => {
  observer.observe(card);
});

// 统计显示
const totalReviews = reviewCards.length;
const platforms = {
  '豆瓣': document.querySelectorAll('[data-platform="豆瓣"]').length,
  'b站': document.querySelectorAll('[data-platform="b站"]').length,
  '爱奇艺': document.querySelectorAll('[data-platform="爱奇艺"]').length,
  '腾讯视频': document.querySelectorAll('[data-platform="腾讯视频"]').length
};

console.log(`总影评数: ${totalReviews}`);
console.log('各平台影评分布:', platforms);

// 初始化快速导航
function initQuickNav() {
  const scrollToMyCommentsBtn = document.getElementById('scrollToMyComments');
  
  if (scrollToMyCommentsBtn) {
    scrollToMyCommentsBtn.addEventListener('click', () => {
      const commentsSection = document.querySelector('.user-comments-section');
      if (commentsSection) {
        const offsetTop = commentsSection.offsetTop - 100; // 减去导航栏高度
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
        
        // 显示一个提示动画
        commentsSection.style.animation = 'none';
        setTimeout(() => {
          commentsSection.style.animation = 'highlightSection 1.5s ease-out';
        }, 10);
      }
    });
  }
}

// 更新我的评论徽章
function updateMyCommentBadge(count) {
  const badge = document.getElementById('myCommentBadge');
  if (badge) {
    badge.textContent = count;
  }
}

// 检查用户评论是否已收藏
function isUserCommentBookmarked(commentId) {
  const storageKey = `bookmark_user_comment_${commentId}`;
  return localStorage.getItem(storageKey) !== null;
}

// 切换用户评论收藏状态
function toggleUserCommentBookmark(comment, button) {
  const storageKey = `bookmark_user_comment_${comment.id}`;
  
  if (button.classList.contains('bookmarked')) {
    // 取消收藏
    localStorage.removeItem(storageKey);
    button.classList.remove('bookmarked');
    showToast('已取消收藏 ❌');
  } else {
    // 添加收藏
    const bookmarkData = {
      id: comment.id,
      type: 'user_comment',
      author: comment.author,
      content: comment.content,
      timestamp: comment.timestamp,
      bookmarkedAt: Date.now()
    };
    localStorage.setItem(storageKey, JSON.stringify(bookmarkData));
    button.classList.add('bookmarked');
    showToast('已收藏 🔖');
  }
}
