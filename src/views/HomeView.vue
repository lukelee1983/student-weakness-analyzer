<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-20 -right-20 w-80 h-80 bg-primary/8 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-20 -left-20 w-96 h-96 bg-accent/8 rounded-full blur-3xl"></div>
      <div class="absolute top-1/3 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-float"></div>
      <div class="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-accent/30 rounded-full animate-float" style="animation-delay: 1.5s;"></div>
    </div>

    <div class="relative z-10 text-center max-w-3xl w-full">
      <!-- Logo + 标题 -->
      <div class="mb-10">
        <div class="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary to-primary-light text-white flex items-center justify-center text-4xl shadow-lg animate-float">
          📚
        </div>
        <h1 class="text-4xl md:text-5xl font-extrabold text-text-primary mb-3 tracking-tight">
          学习<span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">小助手</span>
        </h1>
        <p class="text-lg text-text-secondary max-w-lg mx-auto leading-relaxed">
          AI 赋能教育，覆盖小学至高中全学段，陪伴孩子学业成长
        </p>
      </div>

      <!-- 三大功能入口 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl w-full mb-10">
        <!-- 薄弱项分析 -->
        <router-link to="/analyze"
          class="group bg-white rounded-2xl p-6 shadow-sm border border-border-light hover:shadow-xl hover:-translate-y-1.5 hover:border-primary/20 transition-all duration-300 no-underline text-left">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-sm shadow-primary/10">
            🔍
          </div>
          <h3 class="font-bold text-text-primary mb-1.5 text-base">薄弱项分析</h3>
          <p class="text-xs text-text-secondary leading-relaxed mb-4">上传作业照片，AI 精准定位知识薄弱点，给出针对性改进建议</p>
          <span class="inline-flex items-center gap-1 text-primary text-sm font-semibold group-hover:gap-2 transition-all">
            立即使用 <span class="group-hover:translate-x-0.5 transition-transform">→</span>
          </span>
        </router-link>

        <!-- 智能批改 -->
        <router-link to="/grading"
          class="group bg-white rounded-2xl p-6 shadow-sm border border-border-light hover:shadow-xl hover:-translate-y-1.5 hover:border-success/20 transition-all duration-300 no-underline text-left">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-success/10 to-success/5 text-success flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-sm shadow-success/10">
            ✏️
          </div>
          <h3 class="font-bold text-text-primary mb-1.5 text-base">智能批改</h3>
          <p class="text-xs text-text-secondary leading-relaxed mb-4">覆盖全学段，理综精准批改+解析，文科基础知识点精准批改</p>
          <span class="inline-flex items-center gap-1 text-success text-sm font-semibold group-hover:gap-2 transition-all">
            立即使用 <span class="group-hover:translate-x-0.5 transition-transform">→</span>
          </span>
        </router-link>

        <!-- 试卷切题 -->
        <router-link to="/split"
          class="group bg-white rounded-2xl p-6 shadow-sm border border-border-light hover:shadow-xl hover:-translate-y-1.5 hover:border-accent/20 transition-all duration-300 no-underline text-left">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 text-accent flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-sm shadow-accent/10">
            ✂️
          </div>
          <h3 class="font-bold text-text-primary mb-1.5 text-base">试卷切题</h3>
          <p class="text-xs text-text-secondary leading-relaxed mb-4">整页试卷自动切分题目，精准区分题干/选项/答案，兼容印刷手写体</p>
          <span class="inline-flex items-center gap-1 text-accent text-sm font-semibold group-hover:gap-2 transition-all">
            立即使用 <span class="group-hover:translate-x-0.5 transition-transform">→</span>
          </span>
        </router-link>
      </div>

      <!-- Feature Highlights -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl w-full mb-8">
        <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 border border-border-light/50">
          <span class="text-base">🎒</span>
          <span class="text-xs text-text-secondary font-medium">小学至高中</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 border border-border-light/50">
          <span class="text-base">🔤</span>
          <span class="text-xs text-text-secondary font-medium">中英文混合</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 border border-border-light/50">
          <span class="text-base">✍️</span>
          <span class="text-xs text-text-secondary font-medium">印刷+手写体</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 border border-border-light/50">
          <span class="text-base">🤖</span>
          <span class="text-xs text-text-secondary font-medium">AI 精准识别</span>
        </div>
      </div>

      <!-- Supported Subjects -->
      <div class="flex items-center justify-center gap-4 text-text-light text-xs">
        <span>数学</span><span>·</span>
        <span>语文</span><span>·</span>
        <span>英语</span><span>·</span>
        <span>物理</span><span>·</span>
        <span>化学</span><span>·</span>
        <span>生物</span><span>·</span>
        <span>更多学科</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
