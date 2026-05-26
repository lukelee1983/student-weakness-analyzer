<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-20">
      <svg class="animate-spin h-10 w-10 text-primary mx-auto mb-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      <p class="text-text-secondary">加载分析报告中...</p>
    </div>

    <!-- Not Found -->
    <div v-else-if="!report" class="text-center py-20">
      <div class="text-5xl mb-4">😢</div>
      <h2 class="text-xl font-semibold text-text-primary mb-2">未找到分析记录</h2>
      <p class="text-text-secondary mb-6">该记录可能已被删除</p>
      <router-link to="/analyze" class="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full no-underline hover:bg-primary-dark">
        🔍 重新分析
      </router-link>
    </div>

    <!-- Report -->
    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <button @click="router.push('/')" class="text-text-secondary hover:text-primary mb-2 text-sm flex items-center gap-1 cursor-pointer group">
            <span class="group-hover:-translate-x-0.5 transition-transform">←</span> 返回首页
          </button>
          <h2 class="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">📊 分析报告</h2>
          <p class="text-sm text-text-secondary mt-1 flex items-center gap-2 flex-wrap">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{{ report.subject }}</span>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-border-light text-text-secondary text-xs">{{ report.grade }}</span>
            <span class="text-text-light text-xs">{{ formatDate }}</span>
          </p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button @click="shareAsImage" class="px-4 py-2 rounded-xl border border-border bg-white text-text-secondary hover:bg-bg hover:border-primary/30 hover:text-primary transition-all cursor-pointer text-sm shadow-sm hover:shadow-md">
            🖼️ 分享图片
          </button>
          <button @click="copyReport" class="px-4 py-2 rounded-xl border border-border bg-white text-text-secondary hover:bg-bg hover:border-accent/30 hover:text-accent transition-all cursor-pointer text-sm shadow-sm hover:shadow-md">
            📋 复制文字
          </button>
          <button @click="printReport" class="px-4 py-2 rounded-xl border border-border bg-white text-text-secondary hover:bg-bg hover:border-primary/30 hover:text-primary transition-all cursor-pointer text-sm shadow-sm hover:shadow-md">
            🖨️ 打印
          </button>
        </div>
      </div>

      <!-- Overall -->
      <div v-if="report.overall" class="bg-gradient-to-r from-accent/10 to-emerald-50 border border-accent/20 rounded-2xl p-5 mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-accent/20 text-accent flex items-center justify-center text-lg flex-shrink-0 shadow-sm shadow-accent/10">🌟</div>
          <div>
            <p class="font-semibold text-accent-dark text-sm">整体评价</p>
            <p class="text-text-secondary mt-1 leading-relaxed">{{ report.overall }}</p>
          </div>
        </div>
      </div>

      <!-- Weaknesses -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-border-light mb-6 hover:shadow-md transition-shadow duration-200">
        <h3 class="font-semibold text-lg mb-5 flex items-center gap-2">
          <span class="w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center text-sm">📊</span>
          薄弱项分析
          <span class="text-sm font-normal text-text-light ml-1">（共 {{ report.weaknesses.length }} 项）</span>
        </h3>

        <!-- No Weaknesses -->
        <div v-if="report.weaknesses.length === 0" class="text-center py-10">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center text-3xl">🎉</div>
          <p class="font-semibold text-success text-lg">太棒了！</p>
          <p class="text-text-secondary text-sm mt-1">本次作业没有发现明显薄弱项，继续保持！</p>
        </div>

        <!-- Weakness Cards -->
        <div v-else class="space-y-3">
          <div v-for="(w, idx) in report.weaknesses" :key="idx"
            class="rounded-xl border p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            :class="severityClass(w.severity)">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="severity-badge" :class="severityBadgeClass(w.severity)">{{ w.severity }}</span>
                <span class="error-type-tag">{{ w.errorType }}</span>
              </div>
              <span class="text-xs text-text-light bg-border-light px-2 py-0.5 rounded-full">#{{ idx + 1 }}</span>
            </div>
            <h4 class="font-semibold text-text-primary mb-1">{{ w.topic }}</h4>
            <p v-if="w.question" class="text-sm text-text-secondary mb-1">📋 {{ w.question }}</p>
            <p class="text-sm text-text-secondary leading-relaxed">{{ w.description }}</p>
          </div>
        </div>
      </div>

      <!-- Unreadable Text -->
      <div v-if="report.unreadableText" class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-5 mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-lg flex-shrink-0 shadow-sm shadow-amber-500/10">✏️</div>
          <div>
            <p class="font-semibold text-amber-800">书写提示</p>
            <p class="text-text-secondary mt-1 leading-relaxed">{{ report.unreadableText }}</p>
            <p class="text-xs text-amber-600/80 mt-2">💡 建议：练习书写工整，注意字形结构和笔画顺序。</p>
          </div>
        </div>
      </div>

      <!-- Suggestions -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-border-light mb-6 hover:shadow-md transition-shadow duration-200">
        <h3 class="font-semibold text-lg mb-5 flex items-center gap-2">
          <span class="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-sm">💡</span>
          改进建议
          <span class="text-sm font-normal text-text-light ml-1">（{{ report.suggestions.length }} 条）</span>
        </h3>

        <div class="space-y-3">
          <div v-for="(s, idx) in report.suggestions" :key="idx" class="flex gap-4 p-3 rounded-xl hover:bg-bg transition-colors duration-150">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-light text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm shadow-accent/20">
              {{ idx + 1 }}
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-text-primary mb-0.5">{{ s.title }}</h4>
              <p class="text-text-secondary text-sm leading-relaxed">{{ s.content }}</p>
              <div v-if="s.relatedTopics && s.relatedTopics.length" class="flex flex-wrap gap-1.5 mt-2">
                <span v-for="t in s.relatedTopics" :key="t"
                  class="px-2 py-0.5 rounded-full bg-primary/10 text-primary-dark text-xs font-medium">
                  {{ t }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- OCR Text (collapsible) -->
      <div class="bg-white rounded-2xl shadow-sm border border-border-light overflow-hidden mb-6 hover:shadow-md transition-shadow duration-200">
        <button @click="showOcr = !showOcr" class="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-bg transition-colors">
          <span class="font-semibold text-text-secondary flex items-center gap-2">
            <span class="w-7 h-7 rounded-lg bg-border-light flex items-center justify-center text-sm">📄</span>
            OCR 识别原文
          </span>
          <span :class="['transition-transform text-text-light', showOcr ? 'rotate-180' : '']">▼</span>
        </button>
        <div v-if="showOcr" class="px-4 pb-4 border-t border-border-light">
          <pre class="mt-3 text-sm text-text-secondary whitespace-pre-wrap leading-relaxed bg-bg/50 p-3 rounded-lg">{{ report.ocrText }}</pre>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 mb-10">
        <router-link to="/analyze" class="flex-1 text-center py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-semibold no-underline hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200">
          🔍 继续分析
        </router-link>
        <router-link to="/history" class="flex-1 text-center py-3 rounded-xl border border-border bg-white text-text-secondary font-semibold no-underline hover:bg-bg hover:border-primary/30 hover:shadow-md transition-all duration-200">
          📋 查看历史
        </router-link>
      </div>
    </template>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show" class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-lg text-sm z-50 flex items-center gap-2">
        <span>{{ toast.icon }}</span> {{ toast.message }}
      </div>
    </Transition>

    <!-- Share Image Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showShareModal" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40" @click="showShareModal = false"></div>
          <div class="relative bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 class="text-lg font-semibold mb-4">🖼️ 分享分析报告</h3>
            <p class="text-sm text-text-secondary mb-4">将分析报告生成为图片，可保存后分享给老师或家长</p>
            <div class="flex gap-3">
              <button @click="showShareModal = false" class="flex-1 py-2 rounded-xl border border-border text-text-secondary hover:bg-bg cursor-pointer text-sm">
                取消
              </button>
              <button @click="generateShareImage" class="flex-1 py-2 rounded-xl bg-primary text-white hover:bg-primary-dark cursor-pointer text-sm font-semibold">
                生成图片
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Hidden canvas for image generation -->
    <canvas ref="shareCanvas" style="display:none;"></canvas>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getHistoryById } from '../utils/storage.js'

const props = defineProps({ id: String })
const router = useRouter()
const route = useRoute()
const report = ref(null)
const loading = ref(true)
const showOcr = ref(false)
const showShareModal = ref(false)
const shareCanvas = ref(null)
const toast = ref({ show: false, message: '', icon: '✅' })

const formatDate = computed(() => {
  if (!report.value) return ''
  const d = new Date()
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
})

onMounted(async () => {
  const record = getHistoryById(route.params.id)
  if (record) {
    report.value = record.result
  }
  loading.value = false
})

function showToast(message, icon = '✅') {
  toast.value = { show: true, message, icon }
  setTimeout(() => { toast.value.show = false }, 2500)
}

function severityClass(severity) {
  const map = {
    '高': 'border-danger/30 bg-danger/5',
    '中': 'border-secondary/50 bg-secondary/5',
    '低': 'border-info/20 bg-info/5'
  }
  return map[severity] || 'border-border bg-white'
}

function severityBadgeClass(severity) {
  const map = {
    '高': 'bg-danger text-white',
    '中': 'bg-secondary text-primary-dark',
    '低': 'bg-info/10 text-info'
  }
  return map[severity] || 'bg-border text-text-secondary'
}

function printReport() {
  window.print()
}

// ─── 复制报告（增强版） ──────────────────────────────────────────
function copyReport() {
  if (!report.value) return
  const r = report.value
  const line = '━'.repeat(28)
  const thinLine = '─'.repeat(28)

  let text = ''
  text += '📚 学习薄弱项分析报告\n'
  text += `${line}\n`
  text += `📌 科目：${r.subject}   年级：${r.grade}\n`
  text += `📅 日期：${formatDate.value}\n`
  text += `\n`

  if (r.overall) {
    text += `🌟 整体评价\n${thinLine}\n`
    text += `  ${r.overall}\n\n`
  }

  if (r.weaknesses.length > 0) {
    text += `📊 薄弱项分析（共 ${r.weaknesses.length} 项）\n${thinLine}\n`
    r.weaknesses.forEach((w, i) => {
      const icon = w.severity === '高' ? '🔴' : w.severity === '中' ? '🟡' : '🟢'
      text += `\n  ${i + 1}. ${icon} [${w.severity}] ${w.topic}\n`
      text += `     类型：${w.errorType}\n`
      if (w.question) text += `     题目：${w.question}\n`
      text += `     说明：${w.description}\n`
    })
    text += `\n`
  } else {
    text += `🎉 薄弱项分析\n${thinLine}\n`
    text += `  太棒了！本次作业没有发现明显薄弱项！\n\n`
  }

  if (r.unreadableText) {
    text += `✏️ 书写提示\n${thinLine}\n`
    text += `  ${r.unreadableText}\n\n`
  }

  text += `💡 改进建议（共 ${r.suggestions.length} 条）\n${thinLine}\n`
  r.suggestions.forEach((s, i) => {
    text += `\n  ${i + 1}. ${s.title}\n`
    text += `     ${s.content}\n`
    if (s.relatedTopics && s.relatedTopics.length) {
      text += `     相关知识点：${s.relatedTopics.join('、')}\n`
    }
  })

  text += `\n${line}\n`
  text += `📱 由「学习薄弱项分析助手」生成\n`

  navigator.clipboard.writeText(text).then(() => {
    showToast('报告已复制到剪贴板！', '📋')
  }).catch(() => {
    // fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showToast('报告已复制到剪贴板！', '📋')
  })
}

// ─── 分享为图片 ──────────────────────────────────────────────────
function shareAsImage() {
  showShareModal.value = true
}

async function generateShareImage() {
  showShareModal.value = false
  showToast('正在生成图片，请稍候...', '⏳')

  // 等待 toast 显示
  await new Promise(resolve => setTimeout(resolve, 100))

  try {
    const canvas = shareCanvas.value
    if (!canvas) {
      throw new Error('Canvas not found')
    }
    const ctx = canvas.getContext('2d')

    const r = report.value
    const W = 750
    const PADDING = 32

    // ── 测量内容高度 ──
    const lineHeight = 28
    const titleSize = 22
    const bodySize = 15
    const badgeSize = 13

    let totalH = PADDING * 2 + 60 // header
    if (r.overall) totalH += 60
    totalH += 50 // weaknesses title
    totalH += r.weaknesses.length * 100
    if (r.unreadableText) totalH += 80
    totalH += 50 // suggestions title
    totalH += r.suggestions.length * 90
    totalH += 60 // footer

    canvas.width = W
    canvas.height = totalH

    // ── 背景 ──
    ctx.fillStyle = '#F8F9FE'
    ctx.fillRect(0, 0, W, totalH)

    // ── 顶部装饰条 ──
    const grad = ctx.createLinearGradient(0, 0, W, 0)
    grad.addColorStop(0, '#6366F1')
    grad.addColorStop(1, '#8B5CF6')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, 6)

    // ── 白色卡片背景 ──
    ctx.fillStyle = '#FFFFFF'
    roundRect(ctx, 16, 16, W - 32, totalH - 32, 16)
    ctx.fill()
    ctx.shadowColor = 'transparent'

    let y = PADDING + 20

    // ── 标题区 ──
    ctx.fillStyle = '#1E1B4B'
    ctx.font = `bold ${titleSize}px "PingFang SC", "Microsoft YaHei", sans-serif`
    ctx.fillText('📚 学习薄弱项分析报告', PADDING, y)
    y += 30

    ctx.fillStyle = '#6B7280'
    ctx.font = `${bodySize - 2}px "PingFang SC", sans-serif`
    ctx.fillText(`科目：${r.subject}  年级：${r.grade}  日期：${formatDate.value}`, PADDING, y)
    y += 40

    // ── 整体评价 ──
    if (r.overall) {
      drawSectionTitle(ctx, '🌟 整体评价', PADDING, y)
      y += 32
      ctx.fillStyle = '#4B5563'
      ctx.font = `${bodySize}px "PingFang SC", sans-serif`
      wrapText(ctx, r.overall, PADDING + 8, y, W - PADDING * 2 - 16, lineHeight)
      y += lineHeight * Math.ceil(r.overall.length / 30) + 16
    }

    // ── 薄弱项 ──
    drawSectionTitle(ctx, `📊 薄弱项分析（${r.weaknesses.length}项）`, PADDING, y)
    y += 36

    if (r.weaknesses.length === 0) {
      ctx.fillStyle = '#10B981'
      ctx.font = `bold ${bodySize}px "PingFang SC", sans-serif`
      ctx.fillText('🎉 太棒了！本次作业没有发现明显薄弱项！', PADDING + 8, y)
      y += 40
    } else {
      r.weaknesses.forEach((w, i) => {
        const badgeColor = w.severity === '高' ? '#EF4444' : w.severity === '中' ? '#F59E0B' : '#10B981'
        const bgColor = w.severity === '高' ? '#FEF2F2' : w.severity === '中' ? '#FFFBEB' : '#F0FDF4'

        // 卡片背景
        ctx.fillStyle = bgColor
        roundRect(ctx, PADDING + 4, y - 16, W - PADDING * 2 - 8, 80, 8)
        ctx.fill()

        // 严重程度 badge
        ctx.fillStyle = badgeColor
        roundRect(ctx, PADDING + 12, y - 12, 36, 20, 4)
        ctx.fill()
        ctx.fillStyle = '#FFFFFF'
        ctx.font = `bold ${badgeSize}px sans-serif`
        ctx.fillText(w.severity, PADDING + 16, y + 2)

        // 标题
        ctx.fillStyle = '#1E1B4B'
        ctx.font = `bold ${bodySize}px "PingFang SC", sans-serif`
        ctx.fillText(`${i + 1}. ${w.topic}`, PADDING + 56, y)

        // 描述
        ctx.fillStyle = '#6B7280'
        ctx.font = `${bodySize - 1}px "PingFang SC", sans-serif`
        const desc = w.description.length > 36 ? w.description.slice(0, 36) + '…' : w.description
        ctx.fillText(desc, PADDING + 12, y + 22)

        y += 92
      })
    }

    // ── 书写提示 ──
    if (r.unreadableText) {
      y += 8
      ctx.fillStyle = '#EDE9FE'
      roundRect(ctx, PADDING + 4, y - 16, W - PADDING * 2 - 8, 60, 8)
      ctx.fill()
      ctx.fillStyle = '#7C3AED'
      ctx.font = `bold ${bodySize}px "PingFang SC", sans-serif`
      ctx.fillText('✏️ 书写提示', PADDING + 12, y)
      ctx.fillStyle = '#6B7280'
      ctx.font = `${bodySize - 1}px "PingFang SC", sans-serif`
      const ut = r.unreadableText.length > 34 ? r.unreadableText.slice(0, 34) + '…' : r.unreadableText
      ctx.fillText(ut, PADDING + 12, y + 22)
      y += 72
    }

    // ── 改进建议 ──
    drawSectionTitle(ctx, `💡 改进建议（${r.suggestions.length}条）`, PADDING, y)
    y += 36

    r.suggestions.forEach((s, i) => {
      ctx.fillStyle = '#EDE9FE'
      ctx.beginPath()
      ctx.arc(PADDING + 14, y + 4, 12, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#7C3AED'
      ctx.font = `bold ${bodySize}px sans-serif`
      ctx.fillText(String(i + 1), PADDING + 10, y + 9)

      ctx.fillStyle = '#1E1B4B'
      ctx.font = `bold ${bodySize}px "PingFang SC", sans-serif`
      ctx.fillText(s.title, PADDING + 34, y + 8)

      ctx.fillStyle = '#6B7280'
      ctx.font = `${bodySize - 1}px "PingFang SC", sans-serif`
      const content = s.content.length > 34 ? s.content.slice(0, 34) + '…' : s.content
      ctx.fillText(content, PADDING + 34, y + 28)

      y += 44
    })

    // ── 底部 ──
    y += 16
    ctx.fillStyle = '#E5E7EB'
    ctx.fillRect(PADDING, y, W - PADDING * 2, 1)
    y += 20
    ctx.fillStyle = '#9CA3AF'
    ctx.font = `${badgeSize}px "PingFang SC", sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('📱 由「学习薄弱项分析助手」生成', W / 2, y)
    ctx.textAlign = 'left'

    // ── 导出 ──
    canvas.toBlob((blob) => {
      if (!blob) {
        showToast('图片生成失败，请重试', '❌')
        return
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `学习分析报告_${r.subject}_${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('图片已保存！可分享给老师或家长', '🖼️')
    }, 'image/png')
  } catch (err) {
    console.error('Share image error:', err)
    showToast('图片生成失败：' + err.message, '❌')
  }
}

// ─── Canvas 辅助函数 ──────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = String(text)
  let line = ''
  let ty = y
  for (let i = 0; i < chars.length; i++) {
    const test = line + chars[i]
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, ty)
      line = chars[i]
      ty += lineHeight
    } else {
      line = test
    }
  }
  ctx.fillText(line, x, ty)
}

function drawSectionTitle(ctx, text, x, y) {
  // 左侧竖线装饰
  ctx.fillStyle = '#6366F1'
  ctx.fillRect(x, y - 16, 4, 22)

  ctx.fillStyle = '#1E1B4B'
  ctx.font = `bold 16px "PingFang SC", "Microsoft YaHei", sans-serif`
  ctx.fillText(text, x + 12, y)
}
</script>

<style scoped>
.severity-badge {
  display: inline-block;
  padding: 1px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.error-type-tag {
  display: inline-block;
  padding: 1px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  background: #f0f0f0;
  color: #636e72;
}

/* Toast 动画 */
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}

/* Modal 动画 */
.modal-enter-active, .modal-leave-active {
  transition: all 0.25s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.95);
  opacity: 0;
}

@media print {
  nav, footer, .no-print { display: none !important; }
}
</style>
