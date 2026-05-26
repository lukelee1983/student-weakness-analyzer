<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-20">
      <svg class="animate-spin h-10 w-10 text-primary mx-auto mb-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      <p class="text-text-secondary">加载切题结果中...</p>
    </div>

    <!-- Not Found -->
    <div v-else-if="!result" class="text-center py-20">
      <div class="text-5xl mb-4">😢</div>
      <h2 class="text-xl font-semibold text-text-primary mb-2">未找到切题记录</h2>
      <p class="text-text-secondary mb-6">该记录可能已被删除</p>
      <router-link to="/split" class="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full no-underline hover:bg-primary-dark">
        ✂️ 重新切题
      </router-link>
    </div>

    <!-- Result -->
    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <button @click="router.push('/')" class="text-text-secondary hover:text-primary mb-2 text-sm flex items-center gap-1 cursor-pointer group">
            <span class="group-hover:-translate-x-0.5 transition-transform">←</span> 返回首页
          </button>
          <h2 class="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">✂️ 切题结果</h2>
          <p class="text-sm text-text-secondary mt-1 flex items-center gap-2 flex-wrap">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{{ result.contentType }}</span>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-border-light text-text-secondary text-xs">共 {{ result.totalQuestions }} 题</span>
            <span v-if="result.sections && result.sections.length" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
              {{ result.sections.length }} 个大题
            </span>
          </p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button @click="exportText" class="px-4 py-2 rounded-xl border border-border bg-white text-text-secondary hover:bg-bg hover:border-primary/30 hover:text-primary transition-all cursor-pointer text-sm shadow-sm hover:shadow-md">
            📄 导出文本
          </button>
          <button @click="copyAll" class="px-4 py-2 rounded-xl border border-border bg-white text-text-secondary hover:bg-bg hover:border-accent/30 hover:text-accent transition-all cursor-pointer text-sm shadow-sm hover:shadow-md">
            📋 复制全部
          </button>
        </div>
      </div>

      <!-- Sections Overview -->
      <div v-if="result.sections && result.sections.length > 0" class="bg-white rounded-2xl p-5 shadow-sm border border-border-light mb-6 hover:shadow-md transition-shadow duration-200">
        <h3 class="font-semibold text-sm text-text-primary mb-3 flex items-center gap-2">
          <span class="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs">📑</span>
          试卷结构
        </h3>
        <div class="flex flex-wrap gap-2">
          <span v-for="(sec, idx) in result.sections" :key="idx"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-xs font-medium text-primary">
            {{ sec.title }}
            <span class="text-text-light">（第{{ sec.startIndex }}-{{ sec.endIndex }}题）</span>
          </span>
        </div>
      </div>

      <!-- Questions List -->
      <div class="space-y-4 mb-8">
        <div v-for="(q, idx) in result.questions" :key="idx"
          class="bg-white rounded-2xl shadow-sm border border-border-light overflow-hidden hover:shadow-md transition-shadow duration-200">
          
          <!-- Question Header -->
          <div class="p-4 flex items-center justify-between border-b border-border-light/50">
            <div class="flex items-center gap-2">
              <span class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                {{ q.index }}
              </span>
              <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="questionTypeClass(q.type)">
                {{ q.type }}
              </span>
              <span v-if="q.section" class="text-xs text-text-light">{{ q.section }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span v-if="q.fullScore" class="text-xs text-text-light bg-border-light px-2 py-0.5 rounded-full">
                {{ q.fullScore }}分
              </span>
              <button @click="toggleEdit(idx)"
                class="w-7 h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-text-light hover:text-primary transition-all cursor-pointer text-xs">
                ✏️
              </button>
            </div>
          </div>

          <!-- Question Content -->
          <div class="p-4">
            <!-- View Mode -->
            <template v-if="!editingQuestions.includes(idx)">
              <!-- Stem -->
              <p class="text-sm text-text-primary leading-relaxed mb-3">{{ q.stem }}</p>

              <!-- Options -->
              <div v-if="q.options && q.options.length" class="grid grid-cols-2 gap-2 mb-3">
                <div v-for="(opt, oi) in q.options" :key="oi"
                  class="px-3 py-2 rounded-lg bg-bg border border-border-light text-sm text-text-secondary">
                  {{ opt }}
                </div>
              </div>

              <!-- Answer -->
              <div v-if="q.answer && q.answer.trim()" class="p-3 rounded-lg bg-accent/5 border border-accent/10">
                <span class="text-xs font-medium text-accent">📝 学生作答：</span>
                <span class="text-sm text-text-secondary">{{ q.answer }}</span>
              </div>

              <!-- Sub-questions -->
              <div v-if="q.subQuestions && q.subQuestions.length" class="mt-3 pl-4 border-l-2 border-primary/20 space-y-2">
                <div v-for="(sq, si) in q.subQuestions" :key="si" class="p-2 rounded-lg bg-bg/50">
                  <p class="text-xs text-text-primary"><span class="font-medium text-primary">({{ si + 1 }})</span> {{ sq.stem }}</p>
                  <p v-if="sq.answer" class="text-xs text-text-secondary mt-1">作答：{{ sq.answer }}</p>
                </div>
              </div>
            </template>

            <!-- Edit Mode -->
            <template v-else>
              <div class="space-y-3">
                <div>
                  <label class="text-xs font-medium text-text-secondary mb-1 block">题干</label>
                  <textarea v-model="editData[idx].stem" rows="3"
                    class="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-y"></textarea>
                </div>
                <div>
                  <label class="text-xs font-medium text-text-secondary mb-1 block">答案</label>
                  <textarea v-model="editData[idx].answer" rows="2"
                    class="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-y"></textarea>
                </div>
                <div class="flex gap-2 justify-end">
                  <button @click="cancelEdit(idx)" class="px-3 py-1.5 rounded-lg text-xs border border-border text-text-secondary hover:bg-bg cursor-pointer transition-colors">取消</button>
                  <button @click="saveEdit(idx)" class="px-3 py-1.5 rounded-lg text-xs bg-primary text-white hover:bg-primary-dark cursor-pointer transition-colors font-medium">保存</button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- No Questions -->
      <div v-if="!result.questions || result.questions.length === 0" class="text-center py-16">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-border-light flex items-center justify-center text-3xl">📭</div>
        <p class="font-semibold text-text-primary">未识别到题目</p>
        <p class="text-text-secondary text-sm mt-1">请尝试上传更清晰的试卷照片</p>
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
          <pre class="mt-3 text-sm text-text-secondary whitespace-pre-wrap leading-relaxed bg-bg/50 p-3 rounded-lg">{{ result.ocrText }}</pre>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 mb-10">
        <router-link to="/split" class="flex-1 text-center py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-semibold no-underline hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200">
          ✂️ 继续切题
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getSplitHistoryById } from '../utils/storage.js'

const props = defineProps({ id: String })
const router = useRouter()
const route = useRoute()
const result = ref(null)
const loading = ref(true)
const showOcr = ref(false)
const editingQuestions = ref([])
const editData = reactive({})
const toast = ref({ show: false, message: '', icon: '✅' })

onMounted(async () => {
  const record = getSplitHistoryById(route.params.id)
  if (record) {
    result.value = record.result
  }
  loading.value = false
})

function questionTypeClass(type) {
  const map = {
    '选择题': 'bg-blue-100 text-blue-700',
    '填空题': 'bg-green-100 text-green-700',
    '计算题': 'bg-purple-100 text-purple-700',
    '解答题': 'bg-orange-100 text-orange-700',
    '应用题': 'bg-indigo-100 text-indigo-700',
    '判断题': 'bg-yellow-100 text-yellow-700',
    '证明题': 'bg-indigo-100 text-indigo-700',
    '实验题': 'bg-pink-100 text-pink-700',
    '翻译题': 'bg-cyan-100 text-cyan-700',
    '阅读理解': 'bg-teal-100 text-teal-700',
    '作文题': 'bg-red-100 text-red-700'
  }
  return map[type] || 'bg-gray-100 text-gray-700'
}

function toggleEdit(idx) {
  if (editingQuestions.value.includes(idx)) {
    editingQuestions.value = editingQuestions.value.filter(i => i !== idx)
  } else {
    // 初始化编辑数据
    const q = result.value.questions[idx]
    editData[idx] = { stem: q.stem, answer: q.answer || '' }
    editingQuestions.value.push(idx)
  }
}

function cancelEdit(idx) {
  editingQuestions.value = editingQuestions.value.filter(i => i !== idx)
  delete editData[idx]
}

function saveEdit(idx) {
  const q = result.value.questions[idx]
  q.stem = editData[idx].stem
  q.answer = editData[idx].answer
  editingQuestions.value = editingQuestions.value.filter(i => i !== idx)
  delete editData[idx]
  showToast('题目已更新', '✅')
}

function showToast(message, icon = '✅') {
  toast.value = { show: true, message, icon }
  setTimeout(() => { toast.value.show = false }, 2500)
}

function copyAll() {
  if (!result.value) return
  const r = result.value
  let text = `✂️ 试卷切题结果\n${'━'.repeat(28)}\n`
  text += `类型：${r.contentType}   共 ${r.totalQuestions} 题\n\n`
  
  r.questions.forEach(q => {
    text += `${q.index}. [${q.type}] ${q.stem}\n`
    if (q.options && q.options.length) {
      q.options.forEach(opt => { text += `   ${opt}\n` })
    }
    if (q.answer && q.answer.trim()) {
      text += `   答案：${q.answer}\n`
    }
    if (q.subQuestions && q.subQuestions.length) {
      q.subQuestions.forEach((sq, si) => {
        text += `   (${si + 1}) ${sq.stem}\n`
        if (sq.answer) text += `       答案：${sq.answer}\n`
      })
    }
    text += '\n'
  })
  
  text += `${'━'.repeat(28)}\n📱 由「学习小助手·试卷切题」生成\n`
  
  navigator.clipboard.writeText(text).then(() => {
    showToast('切题结果已复制！', '📋')
  }).catch(() => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showToast('切题结果已复制！', '📋')
  })
}

function exportText() {
  if (!result.value) return
  const r = result.value
  let text = `${r.contentType}\n\n`
  
  if (r.sections && r.sections.length) {
    r.sections.forEach(sec => {
      text += `${sec.title}\n\n`
      const sectionQuestions = r.questions.filter(q => q.section === sec.title)
      sectionQuestions.forEach(q => {
        text += `${q.index}. ${q.stem}\n`
        if (q.options && q.options.length) {
          q.options.forEach(opt => { text += `   ${opt}\n` })
        }
        text += '\n'
      })
    })
  } else {
    r.questions.forEach(q => {
      text += `${q.index}. ${q.stem}\n`
      if (q.options && q.options.length) {
        q.options.forEach(opt => { text += `   ${opt}\n` })
      }
      text += '\n'
    })
  }
  
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `切题结果_${Date.now()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  showToast('已导出为文本文件', '📄')
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 20px); }

@media print {
  nav, footer, .no-print { display: none !important; }
}
</style>
