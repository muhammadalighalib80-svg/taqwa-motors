/**
 * Taqwa Motors - Automotive Blog & News Engine
 * Handles article listing, category filtering, search, slug routing, reading view, and social sharing.
 */

let allBlogPosts = [];
let activeCategory = 'all';
let searchKeyword = '';

// Load Blog Posts from localStorage or initial dataset
function loadBlogPosts() {
  try {
    const local = localStorage.getItem('taqwa_blog_posts');
    if (local) {
      allBlogPosts = JSON.parse(local);
    }
  } catch (e) {
    console.warn("Could not load from localStorage:", e);
  }

  if (!allBlogPosts || allBlogPosts.length === 0) {
    allBlogPosts = window.INITIAL_BLOG_POSTS || [];
    try {
      localStorage.setItem('taqwa_blog_posts', JSON.stringify(allBlogPosts));
    } catch (e) {}
  }

  // Check URL parameters for direct article slug or hash
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug') || (window.location.hash.startsWith('#post=') ? window.location.hash.replace('#post=', '') : null);

  renderBlogCategories();
  renderBlogList();

  if (slug) {
    setTimeout(() => {
      openArticleBySlug(slug);
    }, 150);
  }
}

// Render Category Filter Buttons
function renderBlogCategories() {
  const container = document.getElementById('blogCategoryTabs');
  if (!container) return;

  const categories = ['all', ...Array.from(new Set(allBlogPosts.map(p => p.category).filter(Boolean)))];

  container.innerHTML = categories.map(cat => {
    const label = cat === 'all' ? 'All News & Guides' : cat;
    const count = cat === 'all' 
      ? allBlogPosts.filter(p => p.is_published !== false).length 
      : allBlogPosts.filter(p => p.category === cat && p.is_published !== false).length;

    return `
      <button 
        type="button" 
        class="tab-btn ${activeCategory === cat ? 'active' : ''}" 
        onclick="filterBlogByCategory('${cat}')"
      >
        ${label} (${count})
      </button>
    `;
  }).join('');
}

function filterBlogByCategory(cat) {
  activeCategory = cat;
  renderBlogCategories();
  renderBlogList();
}
window.filterBlogByCategory = filterBlogByCategory;

// Render List of Published Blog Posts
function renderBlogList() {
  const container = document.getElementById('blogPostsGrid');
  const countBadge = document.getElementById('blogPostCount');
  if (!container) return;

  let filtered = allBlogPosts.filter(p => p.is_published !== false);

  if (activeCategory !== 'all') {
    filtered = filtered.filter(p => p.category === activeCategory);
  }

  if (searchKeyword) {
    const q = searchKeyword.toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(q) ||
      (p.summary && p.summary.toLowerCase().includes(q)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }

  if (countBadge) {
    countBadge.textContent = `${filtered.length} Article${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; grid-column: 1/-1; padding: 48px 20px;">
        <div style="font-size: 2.5rem; margin-bottom: 12px;">🔍</div>
        <h3 style="color: var(--text-dark); margin-bottom: 8px;">No Articles Found</h3>
        <p style="color: var(--text-dark-muted); max-width: 420px; margin: 0 auto 20px;">Try adjusting your search terms or select another category.</p>
        <button class="btn btn-primary btn-sm" onclick="resetBlogSearch()">View All News</button>
      </div>
    `;
    return;
  }

// Strict HTML Sanitizer to prevent stored XSS
function sanitizeHtml(html) {
  if (!html) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const allowedTags = ['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'IMG', 'DIV', 'SPAN', 'HR'];

    function cleanNode(node) {
      const children = Array.from(node.childNodes);
      for (const child of children) {
        if (child.nodeType === 1) { // Element node
          if (!allowedTags.includes(child.nodeName)) {
            child.remove();
            continue;
          }
          // Remove on* event handlers and dangerous attributes
          const attrs = Array.from(child.attributes);
          for (const attr of attrs) {
            const name = attr.name.toLowerCase();
            if (name.startsWith('on') || name === 'formaction' || name === 'srcdoc') {
              child.removeAttribute(attr.name);
            }
          }
          // Sanitize <a> tags
          if (child.nodeName === 'A') {
            const href = child.getAttribute('href') || '';
            if (href.trim().toLowerCase().startsWith('javascript:') || href.trim().toLowerCase().startsWith('data:')) {
              child.removeAttribute('href');
            } else {
              child.setAttribute('target', '_blank');
              child.setAttribute('rel', 'noopener noreferrer');
            }
          }
          // Sanitize <img> tags
          if (child.nodeName === 'IMG') {
            const src = child.getAttribute('src') || '';
            if (src.trim().toLowerCase().startsWith('javascript:')) {
              child.removeAttribute('src');
            }
          }
          cleanNode(child);
        }
      }
    }

    cleanNode(doc.body);
    return doc.body.innerHTML;
  } catch (e) {
    console.error('HTML sanitization error:', e);
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
}

  container.innerHTML = filtered.map(post => {
    const postDate = new Date(post.created_at).toLocaleDateString('en-PK', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return `
      <article class="blog-card reveal-on-scroll" onclick="openArticleBySlug('${post.slug}')">
        <div class="blog-card-img-wrap">
          <img src="${post.featured_image}" alt="${post.title}" class="blog-card-img" loading="lazy" onerror="this.src='assets/cars/fortuner_legender.jpg'">
          <span class="blog-card-category">${post.category || 'Automotive'}</span>
        </div>
        <div class="blog-card-body">
          <div class="blog-card-date">${postDate} • By ${post.author || 'Taqwa Motors'}</div>
          <h2 class="blog-card-title">${post.title}</h2>
          <p class="blog-card-summary">${post.summary}</p>
          <div class="blog-card-footer">
            <span>Read Article</span>
            <span>→</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function resetBlogSearch() {
  searchKeyword = '';
  activeCategory = 'all';
  const input = document.getElementById('blogSearchInput');
  if (input) input.value = '';
  renderBlogCategories();
  renderBlogList();
}
window.resetBlogSearch = resetBlogSearch;

// Open Full Article Reader View
function openArticleBySlug(slug) {
  const post = allBlogPosts.find(p => p.slug === slug);
  if (!post) return;

  const modal = document.getElementById('articleModal');
  const container = document.getElementById('articleModalContent');
  if (!modal || !container) return;

  // Increment view counter
  post.views = (post.views || 0) + 1;
  try {
    localStorage.setItem('taqwa_blog_posts', JSON.stringify(allBlogPosts));
  } catch (e) {}

  // Update Page Title and URL Hash
  document.title = `${post.seo_title || post.title} | Taqwa Motors`;
  history.pushState(null, '', `blog.html?slug=${encodeURIComponent(post.slug)}`);

  const postDate = new Date(post.created_at).toLocaleDateString('en-PK', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const articleUrl = window.location.href;
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(post.title);

  // Related posts
  const related = allBlogPosts
    .filter(p => p.id !== post.id && p.is_published !== false)
    .slice(0, 2);

  const relatedHtml = related.length > 0 ? `
    <div style="margin-top: 48px; padding-top: 36px; border-top: 2px solid var(--border-light);">
      <h3 style="font-size: 1.3rem; margin-bottom: 20px; color: var(--text-dark);">Related Articles</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px;">
        ${related.map(r => `
          <div style="background: var(--bg-light); padding: 16px; border-radius: 8px; border: 1px solid var(--border-light); cursor: pointer;" onclick="openArticleBySlug('${r.slug}')">
            <span style="font-size: 0.72rem; color: var(--primary-red); font-weight: 700; text-transform: uppercase;">${r.category}</span>
            <h4 style="font-size: 0.98rem; margin: 6px 0; color: var(--text-dark);">${r.title}</h4>
            <span style="font-size: 0.8rem; color: var(--text-dark-muted);">Read Guide →</span>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  container.innerHTML = `
    <div class="article-detail-container">
      <div class="article-header">
        <div class="article-badge-row">
          <span class="section-tag tag-blue" style="margin: 0;">${post.category || 'Automotive News'}</span>
          <span style="font-size: 0.82rem; color: var(--text-dark-muted); font-weight: 600;">👁️ ${(post.views || 1)} views</span>
        </div>

        <h1 class="article-title">${post.title}</h1>

        <div class="article-meta-bar">
          <div><strong>Published:</strong> ${postDate}</div>
          <div><strong>Author:</strong> ${post.author || 'Taqwa Motors Editorial'}</div>
        </div>
      </div>

      <img src="${post.featured_image}" alt="${post.title}" class="article-featured-img" onerror="this.src='assets/cars/fortuner_legender.jpg'">

      <div class="article-body">
        ${sanitizeHtml(post.content)}
      </div>

      <!-- Article Social Share Drawer -->
      <div class="article-share-box">
        <div>
          <h4 style="font-size: 0.95rem; margin-bottom: 2px;">Share this Guide:</h4>
          <p style="font-size: 0.8rem; color: var(--text-dark-muted); margin: 0;">Help your friends & family stay informed on automotive policies</p>
        </div>
        <div class="share-buttons-group">
          <a href="https://wa.me/?text=${encodedTitle}%20-%20${encodedUrl}" target="_blank" rel="noopener noreferrer" class="btn-share btn-share-whatsapp" title="Share via WhatsApp">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
            <span>WhatsApp</span>
          </a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener noreferrer" class="btn-share btn-share-facebook" title="Share on Facebook">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2v3.98h2v8.01z"/></svg>
            <span>Facebook</span>
          </a>
          <button type="button" class="btn-share btn-share-copy" onclick="copyArticleLink('${articleUrl}')" title="Copy Link">
            📋 Copy Link
          </button>
        </div>
      </div>

      <!-- Showroom Help Desk CTA -->
      <div style="margin-top: 32px; background: #0B0E14; color: #FFFFFF; border-radius: 12px; padding: 28px; text-align: center;">
        <h3 style="color: #FFFFFF; font-size: 1.35rem; margin-bottom: 8px;">Have Questions Regarding Vehicle Transfer or Import?</h3>
        <p style="color: #CBD5E1; font-size: 0.95rem; max-width: 580px; margin: 0 auto 20px;">Our dedicated sales and documentation desk is ready to assist you 7 days a week at Range Road Chowk, Rawalpindi.</p>
        <a href="https://wa.me/923335406173?text=Assalam-o-Alaikum%20Taqwa%20Motors,%20I%20read%20your%20article%20'${encodedTitle}'%20and%20need%20assistance." target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
          <span>Ask Our Documentation Desk on WhatsApp</span>
        </a>
      </div>

      ${relatedHtml}
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
window.openArticleBySlug = openArticleBySlug;

function closeArticleModal() {
  const modal = document.getElementById('articleModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = 'auto';
  document.title = "Automotive News & Policy Guides | Taqwa Motors Rawalpindi";
  history.pushState(null, '', 'blog.html');
}
window.closeArticleModal = closeArticleModal;

function copyArticleLink(url) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      alert("Article link copied to clipboard!");
    });
  } else {
    prompt("Copy this article link:", url);
  }
}
window.copyArticleLink = copyArticleLink;

// Search listener
document.addEventListener('DOMContentLoaded', () => {
  loadBlogPosts();

  const searchInput = document.getElementById('blogSearchInput');
  if (searchInput) {
    let timer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        searchKeyword = e.target.value.trim();
        renderBlogList();
      }, 250);
    });
  }
});
