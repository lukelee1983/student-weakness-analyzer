<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-20">
      <svg class="animate-spin h-10 w-10 text-primary mx-auto mb-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      <p class="text-text-secondary">加载批改报告中...</p>
    </div>

    <!-- Not Found -->
    <div v-else-if="!report" class="text-center py-20">
      <div class="text-5xl mb-4">😢</div>
      <h2 class="text-xl font-semibold text-text-primary mb-2">未找到批改记录</h2>
      <p class="text-text-secondary mb-6">该记录可能已被删除</p>
      <router-link to="/grading" class="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full no-underline hover:bg-primary-dark">
        ✏️ 重新批改
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
          <h2 class="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">📊 批改报告</h2>
          <p class="text-sm text-text-secondary mt-1 flex items-center gap-2 flex-wrap">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{{ report.subject }}</span>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-border-light text-text-secondary text-xs">{{ report.grade }}</span>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              :class="report.subjectType === 'science' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'">
              {{ report.subjectType === 'science' ? '理综' : '文科' }}
            </span>
            <span class="text-text-light text-xs">{{ formatDate }}</span>
          </p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button @click="copyReport" class="px-4 py-2 rounded-xl border border-border bg-white text-text-secondary hover:bg-bg hover:border-accent/30 hover:text-accent transition-all cursor-pointer text-sm shadow-sm hover:shadow-md">
            📋 复制文字
          </button>
          <button @click="printReport" class="px-4 py-2 rounded-xl border border-border bg-white text-text-secondary hover:bg-bg hover:border-primary/30 hover:text-primary transition-all cursor-pointer text-sm shadow-sm hover:shadow-md">
            🖨️ 打印
          </button>
        </div>
      </div>

      <!-- Score Summary -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-border-light mb-6 hover:shadow-md transition-shadow duration-200">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <!-- Score Circle -->
          <div class="relative w-32 h-32 flex-shrink-0">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" stroke-width="10" fill="none" class="stroke-border-light" />
              <circle cx="60" cy="60" r="50" stroke-width="10" fill="none" stroke-linecap="round"
                :class="accuracyColor"
                :stroke-dasharray="accuracyDash" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-2xl font-extrabold" :class="accuracyTextColor">{{ report.totalScore }}</span>
              <span class="text-xs text-text-light">/ {{ report.totalFullScore }}分</span>
            </div>
          </div>
          <!-- Stats -->
          <div class="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div class="text-center p-3 rounded-xl bg-green-50">
              <p class="text-2xl font-bold text-success">{{ report.totalCount - report.wrongCount }}</p>
              <p class="text-xs text-text-secondary">正确题数</p>
            </div>
            <div class="text-center p-3 rounded-xl bg-red-50">
              <p class="text-2xl font-bold text-danger">{{ report.wrongCount }}</p>
              <p class="text-xs text-text-secondary">错误题数</p>
            </div>
            <div class="text-center p-3 rounded-xl bg-primary/5">
              <p class="text-2xl font-bold text-primary">{{ report.totalCount }}</p>
              <p class="text-xs text-text-secondary">总题数</p>
            </div>
            <div class="text-center p-3 rounded-xl bg-accent/5">
              <p class="text-2xl font-bold text-accent">{{ accuracyPercent }}%</p>
              <p class="text-xs text-text-secondary">正确率</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Overall Comment -->
      <div v-if="report.overallComment" class="bg-gradient-to-r from-accent/10 to-emerald-50 border border-accent/20 rounded-2xl p-5 mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-accent/20 text-accent flex items-center justify-center text-lg flex-shrink-0">🌟</div>
          <div>
            <p class="font-semibold text-accent-dark text-sm">教师评语</p>
            <p class="text-text-secondary mt-1 leading-relaxed">{{ report.overallComment }}</p>
          </div>
        </div>
      </div>

      <!-- Questions Detail -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-border-light mb-6 hover:shadow-md transition-shadow duration-200">
        <h3 class="font-semibold text-lg mb-5 flex items-center gap-2">
          <span class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">📝</span>
          逐题批改
          <span class="text-sm font-normal text-text-light ml-1">（共 {{ report.questions.length }} 题）</span>
        </h3>

        <div v-if="report.questions.length === 0" class="text-center py-10">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-border-light flex items-center justify-center text-3xl">📭</div>
          <p class="text-text-secondary">未能识别到题目内容</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="(q, idx) in report.questions" :key="idx"
            class="rounded-xl border p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            :class="q.isCorrect ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'">
            <!-- Question Header -->
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                  :class="q.isCorrect ? 'bg-success' : 'bg-danger'">
                  {{ q.isCorrect ? '✓ 正确' : '✗ 错误' }}
                </span>
                <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="questionTypeClass(q.type)">
                  {{ q.type }}
                </span>
                <span class="text-xs text-text-light">#{{ q.index }}</span>
              </div>
              <span class="text-sm font-semibold" :class="q.isCorrect ? 'text-success' : 'text-danger'">
                {{ q.score }}/{{ q.fullScore }}分
              </span>
            </div>

            <!-- Question Content -->
            <div class="mb-2">
              <p class="text-sm font-medium text-text-primary">{{ q.stem }}</p>
              <div v-if="q.options && q.options.length" class="flex flex-wrap gap-2 mt-1.5">
                <span v-for="(opt, oi) in q.options" :key="oi"
                  class="px-2 py-0.5 rounded text-xs bg-white border border-border-light text-text-secondary">
                  {{ opt }}
                </span>
              </div>
            </div>

            <!-- Student Answer & Correct Answer -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div class="p-2 rounded-lg" :class="q.isCorrect ? 'bg-success/10' : 'bg-danger/10'">
                <span class="text-xs font-medium" :class="q.isCorrect ? 'text-success' : 'text-danger'">学生答案：</span>
                <span :class="q.isCorrect ? 'text-success' : 'text-danger'">{{ q.studentAnswer || '（未作答）' }}</span>
              </div>
              <div v-if="!q.isCorrect" class="p-2 rounded-lg bg-success/10">
                <span class="text-xs font-medium text-success">正确答案：</span>
                <span class="text-success">{{ q.correctAnswer }}</span>
              </div>
            </div>

            <!-- Error Type -->
            <div v-if="!q.isCorrect && q.errorType && q.errorType !== '无'" class="mt-2 flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">
                {{ q.errorType }}
              </span>
              <span v-if="q.uncertainOCR" class="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 font-medium">
                识别存疑
              </span>
            </div>

            <!-- Analysis (collapsible) -->
            <div v-if="q.analysis && q.analysis.trim()">
              <button @click="toggleAnalysis(idx)"
                class="mt-2 text-xs text-primary hover:text-primary-dark cursor-pointer flex items-center gap-1 transition-colors">
                <span :class="expandedQuestions.includes(idx) ? 'rotate-90' : ''" class="transition-transform inline-block">▶</span>
                {{ expandedQuestions.includes(idx) ? '收起解析' : '查看详细解析' }}
              </button>
              <div v-if="expandedQuestions.includes(idx)" class="mt-2 p-3 rounded-lg bg-white border border-primary/10 text-sm text-text-secondary leading-relaxed">
                {{ q.analysis }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Weak Points -->
      <div v-if="report.weakPoints && report.weakPoints.length > 0" class="bg-white rounded-2xl p-6 shadow-sm border border-border-light mb-6 hover:shadow-md transition-shadow duration-200">
        <h3 class="font-semibold text-lg mb-5 flex items-center gap-2">
          <span class="w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center text-sm">📊</span>
          知识薄弱点
          <span class="text-sm font-normal text-text-light ml-1">（{{ report.weakPoints.length }} 项）</span>
        </h3>
        <div class="space-y-2">
          <div v-for="(wp, idx) in report.weakPoints" :key="idx"
            class="flex items-start gap-3 p-3 rounded-xl border border-danger/20 bg-danger/5 hover:shadow-sm transition-shadow">
            <div class="w-7 h-7 rounded-full bg-danger/10 text-danger flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              {{ idx + 1 }}
            </div>
            <div>
              <p class="font-semibold text-text-primary text-sm">{{ wp.topic }}</p>
              <p class="text-text-secondary text-xs mt-0.5">{{ wp.description }}</p>
              <div v-if="wp.questions && wp.questions.length" class="flex flex-wrap gap-1 mt-1">
                <span v-for="qi in wp.questions" :key="qi"
                  class="px-1.5 py-0.5 rounded text-[10px] bg-danger/10 text-danger font-medium">
                  第{{ qi }}题
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Suggestions -->
      <div v-if="report.suggestions && report.suggestions.length > 0" class="bg-white rounded-2xl p-6 shadow-sm border border-border-light mb-6 hover:shadow-md transition-shadow duration-200">
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
        <router-link to="/grading" class="flex-1 text-center py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-semibold no-underline hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200">
          ✏️ 继续批改
        </router-link>
        <router-link to="/" class="flex-1 text-center py-3 rounded-xl border border-border bg-white text-text-secondary font-semibold no-underline hover:bg-bg hover:border-primary/30 hover:shadow-md transition-all duration-200">
          🏠 返回首页
        </router-link>
      </div>
    </template>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-lg text-sm z-50 flex items-center gap-2">
        <span>{{ toast.icon }}</span> {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getGradingHistoryById } from '../utils/storage.js'

const props = defineProps({ id: String })
const router = useRouter()
const route = useRoute()
const report = ref(null)
const loading = ref(true)
const showOcr = ref(false)
const expandedQuestions = ref([])
const toast = ref({ show: false, message: '', icon: '✅' })

const formatDate = computed(() => {
  if (!report.value) return ''
  const d = new Date()
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
})

const accuracyPercent = computed(() => {
  if (!report.value) return 0
  return Math.round(report.value.accuracy * 100)
})

const accuracyDash = computed(() => {
  const pct = report.value ? report.value.accuracy : 0
  const circumference = 2 * Math.PI * 50
  return `${circumference * pct} ${circumference * (1 - pct)}`
})

const accuracyColor = computed(() => {
  const pct = accuracyPercent.value
  if (pct >= 80) return 'stroke-success'
  if (pct >= 60) return 'stroke-accent'
  return 'stroke-danger'
})

const accuracyTextColor = computed(() => {
  const pct = accuracyPercent.value
  if (pct >= 80) return 'text-success'
  if (pct >= 60) return 'text-accent'
  return 'text-danger'
})

onMounted(async () => {
  const record = getGradingHistoryById(route.params.id)
  if (record) {
    report.value = record.result
  }
  loading.value = false
})

function toggleAnalysis(idx) {
  const i = expandedQuestions.value.indexOf(idx)
  if (i === -1) {
    expandedQuestions.value.push(idx)
  } else {
    expandedQuestions.value.splice(i, 1)
  }
}

function questionTypeClass(type) {
  const map = {
    '选择题': 'bg-blue-100 text-blue-700',
    '填空题': 'bg-green-100 text-green-700',
    '计算题': 'bg-purple-100 text-purple-700',
    '解答题': 'bg-orange-100 text-orange-700',
    '应用题': 'bg-indigo-100 text-indigo-700',
    '判断题': 'bg-yellow-100 text-yellow-700',
    '默写题': 'bg-teal-100 text-teal-700',
    '阅读理解': 'bg-cyan-100 text-cyan-700',
    '作文题': 'bg-red-100 text-red-700',
    '证明题': 'bg-indigo-100 text-indigo-700',
    '实验题': 'bg-pink-100 text-pink-700',
    '翻译题': 'bg-cyan-100 text-cyan-700'
  }
  return map[type] || 'bg-gray-100 text-gray-700'
}

function showToast(message, icon = '✅') {
  toast.value = { show: true, message, icon }
  setTimeout(() => { toast.value.show = false }, 2500)
}

function printReport() {
  window.print()
}

function copyReport() {
  if (!report.value) return
  const r = report.value
  const line = '━'.repeat(28)
  const thinLine = '─'.repeat(28)

  let text = ''
  text += `📊 智能批改报告\n${line}\n`
  text += `📌 科目：${r.subject}   年级：${r.grade}\n`
  text += `📈 得分：${r.totalScore}/${r.totalFullScore}   正确率：${accuracyPercent.value}%\n\n`

  if (r.overallComment) {
    text += `🌟 教师评语\n${thinLine}\n  ${r.overallComment}\n\n`
  }

  if (r.questions && r.questions.length > 0) {
    text += `📝 逐题批改\n${thinLine}\n`
    r.questions.forEach(q => {
      const icon = q.isCorrect ? '✓' : '✗'
      text += `\n  ${icon} 第${q.index}题 [${q.type}] ${q.score}/${q.fullScore}分\n`
      text += `     题干：${q.stem}\n`
      text += `     学生答案：${q.studentAnswer || '（未作答）'}\n`
      if (!q.isCorrect) {
        text += `     正确答案：${q.correctAnswer}\n`
        if (q.errorType && q.errorType !== '无') text += `     错误类型：${q.errorType}\n`
      }
      if (q.analysis) text += `     解析：${q.analysis}\n`
    })
    text += '\n'
  }

  if (r.weakPoints && r.weakPoints.length > 0) {
    text += `📊 知识薄弱点\n${thinLine}\n`
    r.weakPoints.forEach((wp, i) => {
      text += `  ${i + 1}. ${wp.topic}：${wp.description}\n`
    })
    text += '\n'
  }

  if (r.suggestions && r.suggestions.length > 0) {
    text += `💡 改进建议\n${thinLine}\n`
    r.suggestions.forEach((s, i) => {
      text += `\n  ${i + 1}. ${s.title}\n     ${s.content}\n`
    })
  }

  text += `\n${line}\n📱 由「学习小助手·智能批改」生成\n`

  navigator.clipboard.writeText(text).then(() => {
    showToast('批改报告已复制！', '📋')
  }).catch(() => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showToast('批改报告已复制！', '📋')
  })
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 20px); }

@media print {
  nav, footer, .no-print { display: none !important; }
}
</style>
