/**
 * Taqwa Motors - Admin Blog CMS Controller
 * Handles article creation, editing, status toggles, deletion and dual synchronization.
 */

let allArticles = [];
let currentBlogFilters = {
  search: '',
  category: '',
  status: ''
};

const LOCAL_STORAGE_BLOG_KEY = 'taqwa_blog_posts';

document.addEventListener('DOMContentLoaded', async () => {
  const auth = await window.checkAdminAuth();
  if (auth) {
    initBlogFilters();
    loadBlogArticles();
  }
});

function initBlogFilters() {
  const searchInput = document.getElementById('blogSearchInput');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentBlogFilters.search = e.target.value.trim().toLowerCase();
        renderFilteredArticles();
      }, 300);
    });
  }

  const categoryFilter = document.getElementById('filterBlogCategory');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      currentBlogFilters.category = categoryFilter.value;
      renderFilteredArticles();
    });
  }

  const statusFilter = document.getElementById('filterBlogStatus');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      currentBlogFilters.status = statusFilter.value;
      renderFilteredArticles();
    });
  }

  const resetBtn = document.getElementById('resetBlogFiltersBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentBlogFilters = { search: '', category: '', status: '' };
      const form = document.getElementById('blogFilterForm');
      if (form) form.reset();
      if (searchInput) searchInput.value = '';
      renderFilteredArticles();
    });
  }
}

async function loadBlogArticles() {
  const tableBody = document.getElementById('blogTableBody');
  if (tableBody) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--admin-text-muted); padding: 3rem;">Loading articles...</td></tr>`;
  }

  // 1. Try to load from Supabase
  let remoteArticles = null;
  const supabase = window.getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        remoteArticles = data;
      }
    } catch (e) {
      console.warn('Supabase blog_posts table query fallback:', e);
    }
  }

  // 2. Load from LocalStorage or INITIAL_BLOG_POSTS
  let localArticles = [];
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_BLOG_KEY);
    if (stored) {
      localArticles = JSON.parse(stored);
    } else if (typeof INITIAL_BLOG_POSTS !== 'undefined') {
      localArticles = [...INITIAL_BLOG_POSTS];
      localStorage.setItem(LOCAL_STORAGE_BLOG_KEY, JSON.stringify(localArticles));
    }
  } catch (e) {
    console.error('LocalStorage blog read error:', e);
    localArticles = typeof INITIAL_BLOG_POSTS !== 'undefined' ? [...INITIAL_BLOG_POSTS] : [];
  }

  allArticles = remoteArticles && remoteArticles.length > 0 ? remoteArticles : localArticles;
  updateKPIs();
  renderFilteredArticles();
}

function updateKPIs() {
  const total = allArticles.length;
  const published = allArticles.filter(a => a.status === 'published').length;
  const drafts = allArticles.filter(a => a.status === 'draft').length;
  const uniqueCategories = new Set(allArticles.map(a => a.category)).size;

  const totalEl = document.getElementById('kpiTotalArticles');
  const publishedEl = document.getElementById('kpiPublishedArticles');
  const draftsEl = document.getElementById('kpiDraftArticles');
  const catEl = document.getElementById('kpiCategoriesCount');
  const countBadge = document.getElementById('articleCountBadge');

  if (totalEl) totalEl.textContent = total;
  if (publishedEl) publishedEl.textContent = published;
  if (draftsEl) draftsEl.textContent = drafts;
  if (catEl) catEl.textContent = uniqueCategories || 5;
  if (countBadge) countBadge.textContent = `${total} Articles`;
}

function renderFilteredArticles() {
  const tableBody = document.getElementById('blogTableBody');
  const emptyState = document.getElementById('blogEmptyState');
  if (!tableBody) return;

  let filtered = allArticles.filter(a => {
    if (currentBlogFilters.search) {
      const q = currentBlogFilters.search;
      const matchTitle = (a.title || '').toLowerCase().includes(q);
      const matchAuthor = (a.author || '').toLowerCase().includes(q);
      const matchTags = Array.isArray(a.tags) ? a.tags.join(' ').toLowerCase().includes(q) : false;
      if (!matchTitle && !matchAuthor && !matchTags) return false;
    }

    if (currentBlogFilters.category && a.category !== currentBlogFilters.category) {
      return false;
    }

    if (currentBlogFilters.status && a.status !== currentBlogFilters.status) {
      return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tableBody.innerHTML = filtered.map(a => {
    const isPublished = a.status === 'published';
    const cleanImg = a.image_url || '../assets/cars/fortuner_legender.jpg';
    const publishDate = a.publish_date || (a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : '2026-03-18');
    const readTime = a.read_time || '4 min read';

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <img src="${cleanImg.startsWith('assets') ? '../' + cleanImg : cleanImg}" alt="${a.title}" class="article-thumb-preview" onerror="this.src='../assets/cars/fortuner_legender.jpg'">
            <div>
              <div style="font-weight: 700; color: var(--admin-text-main); font-size: 0.92rem; line-height: 1.35; margin-bottom: 0.25rem;">
                ${a.title}
              </div>
              <div style="font-size: 0.78rem; color: var(--admin-text-muted); line-height: 1.3; max-width: 450px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${a.excerpt || ''}
              </div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge-category">${a.category || 'Industry News'}</span>
        </td>
        <td>
          <div style="font-size: 0.84rem; font-weight: 600; color: var(--admin-text-main);">${a.author || 'Taqwa Editorial'}</div>
        </td>
        <td>
          <div style="font-size: 0.82rem; color: var(--admin-text-main);">${publishDate}</div>
          <div style="font-size: 0.72rem; color: var(--admin-text-muted);">${readTime}</div>
        </td>
        <td>
          <button 
            type="button" 
            onclick="toggleArticleStatus('${a.id || a.slug}')"
            class="${isPublished ? 'badge-status-published' : 'badge-status-draft'}"
            style="border: none; cursor: pointer;"
            title="Click to toggle status"
          >
            ${isPublished ? '● Published' : '○ Draft'}
          </button>
        </td>
        <td>
          <div class="table-actions">
            <a href="../blog.html?slug=${encodeURIComponent(a.slug)}" target="_blank" class="action-btn-icon" title="View Article on Public Site">
              <i data-lucide="external-link" style="width: 16px; height: 16px;"></i>
            </a>
            <button type="button" class="action-btn-icon" title="Edit Article" onclick="openEditArticleModal('${a.id || a.slug}')">
              <i data-lucide="edit-3" style="width: 16px; height: 16px;"></i>
            </button>
            <button type="button" class="action-btn-icon delete" title="Delete Article" onclick="confirmDeleteArticle('${a.id || a.slug}', '${a.title.replace(/'/g, "\\'")}')">
              <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

function openCreateArticleModal() {
  document.getElementById('modalTitle').textContent = 'Create New Article';
  document.getElementById('articleForm').reset();
  document.getElementById('articleId').value = '';
  document.getElementById('articleAuthor').value = 'Taqwa Motors Editorial Desk';
  document.getElementById('articleReadTime').value = '4 min read';
  document.getElementById('articleImage').value = 'assets/cars/fortuner_legender.jpg';
  document.getElementById('articleStatus').value = 'published';

  const modal = document.getElementById('articleModal');
  if (modal) modal.style.display = 'flex';
  lucide.createIcons();
}

function openEditArticleModal(idOrSlug) {
  const article = allArticles.find(a => (a.id && a.id === idOrSlug) || a.slug === idOrSlug);
  if (!article) return;

  document.getElementById('modalTitle').textContent = 'Edit Article';
  document.getElementById('articleId').value = article.id || article.slug;
  document.getElementById('articleTitle').value = article.title || '';
  document.getElementById('articleSlug').value = article.slug || '';
  document.getElementById('articleCategory').value = article.category || 'Industry News';
  document.getElementById('articleAuthor').value = article.author || 'Taqwa Motors Editorial Desk';
  document.getElementById('articleReadTime').value = article.read_time || '4 min read';
  document.getElementById('articleImage').value = article.image_url || 'assets/cars/fortuner_legender.jpg';
  document.getElementById('articleTags').value = Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags || '');
  document.getElementById('articleExcerpt').value = article.excerpt || '';
  document.getElementById('articleContent').value = article.content || '';
  document.getElementById('articleSeoTitle').value = article.seo_title || '';
  document.getElementById('articleStatus').value = article.status || 'published';

  const modal = document.getElementById('articleModal');
  if (modal) modal.style.display = 'flex';
  lucide.createIcons();
}

function closeArticleModal() {
  const modal = document.getElementById('articleModal');
  if (modal) modal.style.display = 'none';
}

function generateSlugFromTitle() {
  const title = document.getElementById('articleTitle').value;
  const slugInput = document.getElementById('articleSlug');
  const isEditing = !!document.getElementById('articleId').value;
  if (!isEditing && slugInput) {
    slugInput.value = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

async function handleArticleFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('articleId').value;
  const title = document.getElementById('articleTitle').value.trim();
  const slug = document.getElementById('articleSlug').value.trim();
  const category = document.getElementById('articleCategory').value;
  const author = document.getElementById('articleAuthor').value.trim();
  const read_time = document.getElementById('articleReadTime').value.trim();
  const image_url = document.getElementById('articleImage').value.trim();
  const rawTags = document.getElementById('articleTags').value.trim();
  const tags = rawTags ? rawTags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const excerpt = document.getElementById('articleExcerpt').value.trim();
  const content = document.getElementById('articleContent').value.trim();
  const seo_title = document.getElementById('articleSeoTitle').value.trim();
  const status = document.getElementById('articleStatus').value;

  if (!title || !slug || !excerpt || !content) {
    alert('Please fill in Title, Slug, Summary Excerpt and Body Content.');
    return;
  }

  const newArticleObj = {
    id: id || ('blog_' + Date.now()),
    title,
    slug,
    category,
    author,
    read_time,
    image_url,
    tags,
    excerpt,
    content,
    seo_title: seo_title || title,
    status,
    publish_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };

  // 1. Try Supabase Insert/Update
  const supabase = window.getSupabaseClient();
  if (supabase) {
    try {
      if (id && !id.startsWith('blog_')) {
        await supabase.from('blog_posts').update(newArticleObj).eq('id', id);
      } else {
        await supabase.from('blog_posts').insert(newArticleObj);
      }
    } catch (err) {
      console.warn('Supabase article sync warning:', err);
    }
  }

  // 2. Update Local State & LocalStorage
  if (id) {
    const idx = allArticles.findIndex(a => (a.id && a.id === id) || a.slug === id);
    if (idx !== -1) {
      allArticles[idx] = { ...allArticles[idx], ...newArticleObj };
    } else {
      allArticles.unshift(newArticleObj);
    }
  } else {
    allArticles.unshift(newArticleObj);
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_BLOG_KEY, JSON.stringify(allArticles));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }

  closeArticleModal();
  updateKPIs();
  renderFilteredArticles();
  alert('Article successfully saved!');
}

async function toggleArticleStatus(idOrSlug) {
  const article = allArticles.find(a => (a.id && a.id === idOrSlug) || a.slug === idOrSlug);
  if (!article) return;

  const newStatus = article.status === 'published' ? 'draft' : 'published';
  article.status = newStatus;

  // Supabase update
  const supabase = window.getSupabaseClient();
  if (supabase && article.id && !article.id.startsWith('blog_')) {
    try {
      await supabase.from('blog_posts').update({ status: newStatus }).eq('id', article.id);
    } catch (e) {
      console.warn('Supabase status toggle warning:', e);
    }
  }

  // LocalStorage update
  try {
    localStorage.setItem(LOCAL_STORAGE_BLOG_KEY, JSON.stringify(allArticles));
  } catch (e) {
    console.error(e);
  }

  updateKPIs();
  renderFilteredArticles();
}

async function confirmDeleteArticle(idOrSlug, title) {
  const proceed = confirm(`Are you sure you want to delete the article:\n"${title}"?`);
  if (!proceed) return;

  // Supabase delete
  const supabase = window.getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('blog_posts').delete().eq('slug', idOrSlug);
      await supabase.from('blog_posts').delete().eq('id', idOrSlug);
    } catch (e) {
      console.warn('Supabase delete warning:', e);
    }
  }

  allArticles = allArticles.filter(a => (a.id !== idOrSlug) && (a.slug !== idOrSlug));
  try {
    localStorage.setItem(LOCAL_STORAGE_BLOG_KEY, JSON.stringify(allArticles));
  } catch (e) {
    console.error(e);
  }

  updateKPIs();
  renderFilteredArticles();
}

window.openCreateArticleModal = openCreateArticleModal;
window.openEditArticleModal = openEditArticleModal;
window.closeArticleModal = closeArticleModal;
window.generateSlugFromTitle = generateSlugFromTitle;
window.handleArticleFormSubmit = handleArticleFormSubmit;
window.toggleArticleStatus = toggleArticleStatus;
window.confirmDeleteArticle = confirmDeleteArticle;
