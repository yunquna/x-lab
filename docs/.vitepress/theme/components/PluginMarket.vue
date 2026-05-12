<template>
  <div class="plugin-market">
    <!-- 头部 -->
    <div class="market-header">
      <div class="market-title">
        <span class="market-icon">🔌</span>
        <div>
          <h2>插件市场</h2>
          <p class="market-subtitle">内部工具、脚本与浏览器插件集中分发平台</p>
        </div>
      </div>
      <div class="market-stats">
        <span class="stat-badge">{{ plugins.length }} 个插件</span>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-group">
        <button
          v-for="f in filters"
          :key="f.key"
          :class="['filter-btn', { active: activeFilter === f.key }]"
          @click="activeFilter = f.key"
        >
          {{ f.label }}
        </button>
      </div>
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索插件名称..."
          class="search-input"
        />
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredPlugins.length === 0" class="empty-state">
      <p>暂无匹配的插件</p>
    </div>

    <!-- 插件卡片网格 -->
    <div v-else class="plugin-grid">
      <div
        v-for="plugin in filteredPlugins"
        :key="plugin.id"
        class="plugin-card"
      >
        <div class="card-header">
          <div class="card-icon">
            <img
              v-if="plugin.icon"
              :src="plugin.icon"
              :alt="plugin.name"
              class="plugin-icon"
              @error="onIconError($event)"
            />
            <span v-else class="icon-placeholder">{{ plugin.name.charAt(0) }}</span>
          </div>
          <div class="card-meta-top">
            <span :class="['status-badge', plugin.status]">
              {{ statusLabel(plugin.status) }}
            </span>
            <span :class="['type-badge', plugin.type]">
              {{ typeLabel(plugin.type) }}
            </span>
          </div>
        </div>

        <div class="card-body">
          <h3 class="plugin-name">{{ plugin.name }}</h3>
          <p class="plugin-desc">{{ plugin.description }}</p>

          <!-- 预览缩略图 -->
          <div
            v-if="plugin.preview"
            class="preview-thumb"
            @click="openPreview(plugin)"
          >
            <img :src="plugin.preview" :alt="plugin.name + ' 预览'" />
            <span class="preview-overlay">🖼 点击放大</span>
          </div>
        </div>

        <div class="card-footer">
          <div class="card-meta">
            <span class="meta-item version">v{{ plugin.version }}</span>
            <span class="meta-item date">{{ plugin.updated }}</span>
            <span class="meta-item author">{{ plugin.author }}</span>
          </div>

          <a
            v-if="plugin.type === 'tampermonkey'"
            :href="plugin.download_url"
            class="install-btn tampermonkey"
          >
            ⚡ 一键安装
          </a>
          <a
            v-else
            :href="plugin.download_url"
            class="install-btn download"
            download
          >
            ⬇ 下载 ZIP
          </a>
        </div>

        <!-- 安装指引折叠 -->
        <details class="install-guide">
          <summary>📖 安装说明</summary>
          <p>{{ plugin.install_guide }}</p>
        </details>

        <div class="card-tags">
          <span v-for="tag in plugin.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
    </div>

    <!-- 预览放大 Lightbox -->
    <div v-if="previewPlugin" class="lightbox-overlay" @click.self="closePreview">
      <div class="lightbox-content">
        <button class="lightbox-close" @click="closePreview">✕</button>
        <img :src="previewPlugin.preview" :alt="previewPlugin.name + ' 预览'" />
        <p class="lightbox-caption">{{ previewPlugin.name }} - 预览截图</p>
      </div>
    </div>

    <!-- 新增插件指引 -->
    <div class="add-plugin-guide">
      <details>
        <summary>📝 如何新增一个插件？</summary>
        <div class="guide-content">
          <p><strong>你只需三步：</strong></p>
          <ol>
            <li>在 <code>docs/public/plugins/</code> 下新建一个文件夹（如 <code>my-plugin/</code>）</li>
            <li>放入 ZIP 压缩包和图标文件（可选），如有截图请命名为 <code>preview.png</code></li>
            <li>编辑 <code>docs/public/plugins/plugins.json</code>，添加一条插件记录，预览图字段为 <code>"preview": "/plugins/插件名/preview.png"</code></li>
          </ol>
          <p>提交到 GitHub 的 <code>main</code> 分支后，CI/CD 会自动构建部署，约 2 分钟内上线。</p>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const plugins = ref([])
const loading = ref(true)
const activeFilter = ref('all')
const searchQuery = ref('')
const previewPlugin = ref(null)

const filters = [
  { key: 'all', label: '📋 全部' },
  { key: 'stable', label: '✅ 正式版' },
  { key: 'beta', label: '🧪 内测版' },
  { key: 'chrome-extension', label: '🧩 Chrome 扩展' },
  { key: 'tampermonkey', label: '🐒 Tampermonkey' },
]

function statusLabel(status) {
  const map = { stable: '✅ 正式版', beta: '🧪 内测版', deprecated: '🔴 已归档' }
  return map[status] || status
}

function typeLabel(type) {
  const map = { 'chrome-extension': '🧩 扩展', tampermonkey: '🐒 脚本' }
  return map[type] || type
}

function onIconError(e) {
  e.target.style.display = 'none'
  e.target.nextElementSibling?.style.setProperty('display', 'flex')
}

function openPreview(plugin) {
  previewPlugin.value = plugin
  document.body.style.overflow = 'hidden'
}

function closePreview() {
  previewPlugin.value = null
  document.body.style.overflow = ''
}

const filteredPlugins = computed(() => {
  let list = plugins.value

  if (activeFilter.value !== 'all') {
    if (activeFilter.value === 'stable' || activeFilter.value === 'beta') {
      list = list.filter(p => p.status === activeFilter.value)
    } else {
      list = list.filter(p => p.type === activeFilter.value)
    }
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(
      p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags?.some(t => t.includes(q))
    )
  }

  return list
})

onMounted(async () => {
  try {
    const res = await fetch('/x-lab/plugins/plugins.json')
    const data = await res.json()
    plugins.value = data.plugins
  } catch (err) {
    console.error('加载插件列表失败:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.plugin-market {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 0 40px;
}

/* Header */
.market-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--vp-c-divider);
}
.market-title {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.market-icon {
  font-size: 32px;
  line-height: 1;
}
.market-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.market-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
}
.stat-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  font-size: 12px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

/* Filter bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.filter-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.filter-btn {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.filter-btn.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.search-icon {
  font-size: 13px;
}
.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: var(--vp-c-text-1);
  width: 160px;
}
.search-input::placeholder {
  color: var(--vp-c-text-3);
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 60px 0;
  color: var(--vp-c-text-2);
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--vp-c-text-3);
  font-size: 14px;
}

/* Grid */
.plugin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

/* Card */
.plugin-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.plugin-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.plugin-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.icon-placeholder {
  display: none;
  font-size: 20px;
  font-weight: 700;
  color: var(--vp-c-text-3);
}

.card-meta-top {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-left: 8px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.status-badge.stable {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
}
.status-badge.beta {
  background: rgba(251, 146, 60, 0.15);
  color: #fb923c;
}
.status-badge.deprecated {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.type-badge.chrome-extension {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}
.type-badge.tampermonkey {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
}

/* Card body */
.card-body {
  margin-bottom: 12px;
}
.plugin-name {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.plugin-desc {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

/* Preview thumbnail */
.preview-thumb {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--vp-c-divider);
  line-height: 0;
}
.preview-thumb img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}
.preview-thumb:hover img {
  transform: scale(1.03);
}
.preview-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px 10px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: #fff;
  font-size: 11px;
  text-align: center;
  pointer-events: none;
}

/* Card footer */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--vp-c-divider);
}
.card-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.meta-item {
  font-size: 11px;
  color: var(--vp-c-text-3);
}
.meta-item.version {
  font-family: monospace;
  color: var(--vp-c-text-2);
  font-weight: 500;
}
.meta-item.author {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.install-btn {
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;
}
.install-btn.tampermonkey {
  background: rgba(168, 85, 247, 0.12);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.3);
}
.install-btn.tampermonkey:hover {
  background: rgba(168, 85, 247, 0.25);
  text-decoration: none;
}
.install-btn.download {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}
.install-btn.download:hover {
  background: rgba(59, 130, 246, 0.25);
  text-decoration: none;
}

/* Install guide */
.install-guide {
  margin-top: 10px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}
.install-guide summary {
  cursor: pointer;
  opacity: 0.7;
  font-size: 12px;
}
.install-guide summary:hover {
  opacity: 1;
}
.install-guide p {
  margin: 8px 0 0;
  padding: 8px 12px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  line-height: 1.6;
  font-size: 12px;
}

/* Tags */
.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.tag {
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--vp-c-bg);
  font-size: 10px;
  color: var(--vp-c-text-3);
  border: 1px solid var(--vp-c-divider);
}

/* Lightbox */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  animation: fadeIn 0.2s;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.lightbox-content img {
  max-width: 100%;
  max-height: 80vh;
  border-radius: 8px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
}
.lightbox-caption {
  margin-top: 10px;
  font-size: 13px;
  color: #ccc;
}
.lightbox-close {
  position: absolute;
  top: -36px;
  right: 0;
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.lightbox-close:hover {
  opacity: 1;
}

/* Add plugin guide */
.add-plugin-guide {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 13px;
}
.add-plugin-guide summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  font-size: 14px;
}
.guide-content {
  margin-top: 12px;
  padding: 16px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  line-height: 1.8;
}
.guide-content code {
  background: var(--vp-c-bg);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.guide-content ol {
  margin: 8px 0;
  padding-left: 20px;
}
.guide-content li {
  margin-bottom: 4px;
}
</style>
