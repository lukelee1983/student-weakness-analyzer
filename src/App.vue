<template>
  <div class="min-h-screen flex flex-col bg-bg">
    <!-- 顶部导航栏 -->
    <nav class="nav-top relative z-50">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2 no-underline group">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light text-white flex items-center justify-center text-lg shadow-md group-hover:scale-110 transition-transform">
            📚
          </div>
          <span class="font-bold text-lg text-text-primary">学习小助手</span>
        </router-link>
        
        <!-- 桌面端导航 -->
        <div class="hidden md:flex items-center gap-1.5">
          <router-link to="/analyze" class="nav-link" active-class="nav-link-active">
            <span>🔍</span><span>分析</span>
          </router-link>
          <router-link to="/grading" class="nav-link" active-class="nav-link-active">
            <span>✏️</span><span>批改</span>
          </router-link>
          <router-link to="/split" class="nav-link" active-class="nav-link-active">
            <span>✂️</span><span>切题</span>
          </router-link>
          <router-link to="/history" class="nav-link-secondary" active-class="nav-link-secondary-active">
            <span>📋</span><span>历史</span>
          </router-link>
        </div>
      </div>
    </nav>

    <main class="flex-1 pb-20 md:pb-0">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 桌面端 Footer -->
    <footer class="hidden md:block text-center py-5 text-sm text-text-light border-t border-border-light bg-white/50">
      <div class="flex items-center justify-center gap-1">
        <span>📚</span>
        <span>学习小助手</span>
        <span class="mx-1">·</span>
        <span>AI 赋能教育，陪伴学业成长</span>
      </div>
    </footer>

    <!-- 移动端底部 Tab Bar -->
    <div class="md:hidden fixed bottom-0 left-0 right-0 z-50 mobile-tab-bar">
      <div class="flex items-center justify-around py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
        <router-link to="/" class="mobile-tab-item" active-class="mobile-tab-item-active">
          <span class="mobile-tab-icon">🏠</span>
          <span class="mobile-tab-label">首页</span>
        </router-link>
        <router-link to="/analyze" class="mobile-tab-item" active-class="mobile-tab-item-active">
          <span class="mobile-tab-icon">🔍</span>
          <span class="mobile-tab-label">分析</span>
        </router-link>
        <router-link to="/grading" class="mobile-tab-item" active-class="mobile-tab-item-active">
          <span class="mobile-tab-icon">✏️</span>
          <span class="mobile-tab-label">批改</span>
        </router-link>
        <router-link to="/split" class="mobile-tab-item" active-class="mobile-tab-item-active">
          <span class="mobile-tab-icon">✂️</span>
          <span class="mobile-tab-label">切题</span>
        </router-link>
        <router-link to="/history" class="mobile-tab-item" active-class="mobile-tab-item-active">
          <span class="mobile-tab-icon">📋</span>
          <span class="mobile-tab-label">历史</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
/* ── 顶部导航 ──────────────────────────── */
.nav-top {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(229,231,235,0.6);
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

/* 桌面端功能导航链接 */
.nav-link {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.nav-link:hover {
  background: var(--color-bg);
  border-color: var(--color-border-light);
  color: var(--color-primary);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.nav-link-active {
  background: var(--color-primary);
  color: white !important;
  border-color: var(--color-primary);
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
}
.nav-link-active:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}

/* 次要导航（历史记录） */
.nav-link-secondary {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  border: 1px solid var(--color-border-light);
  background: white/80;
  transition: all 0.2s;
}
.nav-link-secondary:hover {
  background: var(--color-bg);
  border-color: rgba(79, 70, 229, 0.3);
  color: var(--color-primary);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.nav-link-secondary-active {
  background: var(--color-primary);
  color: white !important;
  border-color: var(--color-primary);
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
}

/* ── 移动端底部 Tab Bar ─────────────────── */
.mobile-tab-bar {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(229, 231, 235, 0.5);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.04);
}

.mobile-tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 12px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
  color: var(--color-text-light);
  min-width: 56px;
}
.mobile-tab-item:active {
  transform: scale(0.92);
}

.mobile-tab-icon {
  font-size: 1.25rem;
  line-height: 1;
  transition: transform 0.2s;
}

.mobile-tab-label {
  font-size: 0.625rem;
  font-weight: 500;
  line-height: 1;
}

.mobile-tab-item-active {
  color: var(--color-primary);
}
.mobile-tab-item-active .mobile-tab-icon {
  transform: scale(1.15);
}

/* ── 页面过渡 ──────────────────────────── */
.page-enter-active,
.page-leave-active {
  transition: all 0.25s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
