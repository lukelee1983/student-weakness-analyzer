<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl md:text-3xl font-extrabold text-text-primary mb-1">📋 历史记录</h2>
        <p class="text-text-secondary text-sm">查看所有分析、批改、切题记录</p>
      </div>
      <button v-if="currentRecords.length > 0" @click="confirmClear"
        class="px-4 py-2 rounded-xl border border-danger/30 text-danger hover:bg-danger/5 hover:shadow-sm transition-all cursor-pointer text-sm">
        🗑️ 清空
      </button>
    </div>

    <!-- Tab 切换 -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-1">
      <button v-for="tab in tabs" :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer',
          activeTab === tab.id
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'bg-white border border-border-light text-text-secondary hover:border-primary/30 hover:text-primary hover:shadow-sm'
        ]">
        <span>{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
        <span v-if="tab.count > 0"
          :class="[
            'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold',
            activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
          ]">
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Empty -->
    <div v-if="currentRecords.length === 0" class="text-center py-16">
      <div class="w-20 h-20 mx-auto mb-5 rounded-full bg-border-light flex items-center justify-center text-4xl">
        {{ activeTab === 'weakness' ? '🔍' : activeTab === 'grading' ? '✏️' : '✂️' }}
      </div>
      <p class="text-text-secondary mb-6">{{ emptyMessage }}</p>
      <router-link :to="emptyLink"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white rounded-full no-underline hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
        {{ emptyAction }}
      </router-link>
    </div>

    <!-- Records List -->
    <div v-else class="space-y-3">
      <div v-for="record in currentRecords" :key="record.id"
        @click="goToDetail(record)"
        class="group bg-white rounded-2xl p-5 shadow-sm border border-border-light hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm"
              :class="getRecordBg(record)">
              {{ getRecordIcon(record) }}
            </div>
            <div>
              <h3 class="font-semibold text-text-primary group-hover:text-primary transition-colors text-sm">
                {{ getRecordTitle(record) }}
              </h3>
              <p class="text-xs text-text-secondary mt-0.5">{{ formatDate(record.createdAt) }}</p>
            </div>
          </div>
          <div class="text-right">
            <div v-if="record.type === 'weakness' && record.result && record.result.weaknesses">
              <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                :class="record.result.weaknesses.length > 0 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'">
                {{ record.result.weaknesses.length }} 个薄弱项
              </span>
            </div>
            <div v-else-if="record.type === 'grading' && record.result" class="flex items-center gap-2 justify-end">
              <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                :class="getAccuracyClass(record.result.accuracy)">
                {{ Math.round(record.result.accuracy * 100) }}%
              </span>
              <span class="text-xs text-text-light">{{ record.result.totalScore }}/{{ record.result.totalFullScore }}分</span>
            </div>
            <div v-else-if="record.type === 'split' && record.result" class="flex items-center gap-2 justify-end">
              <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {{ record.result.questions ? record.result.questions.length : 0 }} 题
              </span>
            </div>
            <p class="text-xs text-text-light mt-1">{{ record.imageCount || 1 }} 张图片 · {{ record.demoMode ? '演示' : '真实' }}</p>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="getRecordTags(record).length > 0" class="mt-3 pt-3 border-t border-border-light">
          <div class="flex flex-wrap gap-1.5">
            <span v-for="(tag, i) in getRecordTags(record)" :key="i"
              class="px-2 py-0.5 rounded-full bg-bg text-text-secondary text-xs">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Clear Confirm Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showClearModal" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showClearModal = false"></div>
          <div class="relative bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div class="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center text-xl mb-4">⚠️</div>
            <h3 class="text-lg font-semibold mb-2">确认清空</h3>
            <p class="text-text-secondary text-sm mb-5">确定要清空{{ activeTabLabel }}的所有记录吗？此操作不可撤销。</p>
            <div class="flex gap-3">
              <button @click="showClearModal = false" class="flex-1 py-2.5 rounded-xl border border-border text-text-secondary hover:bg-bg transition-colors cursor-pointer text-sm font-medium">
                取消
              </button>
              <button @click="doClear" class="flex-1 py-2.5 rounded-xl bg-danger text-white hover:bg-danger/90 transition-colors cursor-pointer text-sm font-medium">
                确认清空
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getHistory, clearHistory as clearWeaknessHistory, deleteHistory as deleteWeaknessHistory } from '../utils/storage.js'
import { getGradingHistory, deleteGradingHistory, getSplitHistory, deleteSplitHistory } from '../utils/storage.js'

const router = useRouter()
const activeTab = ref('weakness')
const showClearModal = ref(false)

const weaknessList = ref([])
const gradingList = ref([])
const splitList = ref([])

onMounted(() => {
  weaknessList.value = getHistory()
  gradingList.value = getGradingHistory()
  splitList.value = getSplitHistory()
})

const tabs = computed(() => [
  { id: 'weakness', icon: '🔍', label: '薄弱项分析', count: weaknessList.value.length },
  { id: 'grading', icon: '✏️', label: '智能批改', count: gradingList.value.length },
  { id: 'split', icon: '✂️', label: '试卷切题', count: splitList.value.length }
])

const activeTabLabel = computed(() => {
  const t = tabs.value.find(t => t.id === activeTab.value)
  return t ? t.label : ''
})

const currentRecords = computed(() => {
  switch (activeTab.value) {
    case 'weakness': return weaknessList.value
    case 'grading': return gradingList.value
    case 'split': return splitList.value
    default: return []
  }
})

const emptyMessage = computed(() => {
  const map = {
    weakness: '还没有分析记录，快去分析第一张作业吧！',
    grading: '还没有批改记录，快去批改第一份试卷吧！',
    split: '还没有切题记录，快去切分第一份试卷吧！'
  }
  return map[activeTab.value]
})

const emptyLink = computed(() => {
  const map = { weakness: '/analyze', grading: '/grading', split: '/split' }
  return map[activeTab.value]
})

const emptyAction = computed(() => {
  const map = { weakness: '🔍 开始分析', grading: '✏️ 开始批改', split: '✂️ 开始切题' }
  return map[activeTab.value]
})

function goToDetail(record) {
  switch (record.type) {
    case 'weakness':
      router.push({ name: 'Report', params: { id: record.id } })
      break
    case 'grading':
      router.push({ name: 'GradingReport', params: { id: record.id } })
      break
    case 'split':
      router.push({ name: 'SplitResult', params: { id: record.id } })
      break
  }
}

function getRecordIcon(record) {
  if (record.type === 'weakness') {
    const icons = { math: '📐', chinese: '📝', english: '🔤', auto: '🤖' }
    return icons[record.subject] || '📚'
  }
  if (record.type === 'grading') {
    const icons = { math: '📐', chinese: '📝', english: '🔤', physics: '⚡', chemistry: '🧪', biology: '🧬', politics: '📖', history: '🏛️', geography: '🌍' }
    return icons[record.subject] || '✏️'
  }
  if (record.type === 'split') return '✂️'
  return '📋'
}

function getRecordBg(record) {
  if (record.type === 'weakness') {
    const map = { math: 'bg-primary/10', chinese: 'bg-accent/10', english: 'bg-info/10', auto: 'bg-success/10' }
    return map[record.subject] || 'bg-bg'
  }
  if (record.type === 'grading') {
    return record.result && record.result.accuracy >= 0.8 ? 'bg-success/10' : record.result && record.result.accuracy >= 0.6 ? 'bg-accent/10' : 'bg-danger/10'
  }
  return 'bg-primary/10'
}

function getRecordTitle(record) {
  if (record.type === 'weakness') {
    const labels = { math: '数学', chinese: '语文', english: '英语', auto: '综合' }
    return `${labels[record.subject] || '综合'}薄弱项分析`
  }
  if (record.type === 'grading') {
    return `${record.result?.grade || ''}${record.result?.subject || ''}批改`
  }
  if (record.type === 'split') {
    const ctLabels = { exam: '试卷', workbook: '习题册', textbook: '课本', worksheet: '作业单' }
    return `${ctLabels[record.contentType] || '试卷'}切题`
  }
  return '记录'
}

function getAccuracyClass(accuracy) {
  if (accuracy >= 0.8) return 'bg-success/10 text-success'
  if (accuracy >= 0.6) return 'bg-accent/10 text-accent'
  return 'bg-danger/10 text-danger'
}

function getRecordTags(record) {
  if (record.type === 'weakness' && record.result && record.result.weaknesses) {
    const tags = record.result.weaknesses.slice(0, 3).map(w => w.topic)
    if (record.result.weaknesses.length > 3) tags.push(`+${record.result.weaknesses.length - 3} 更多`)
    return tags
  }
  if (record.type === 'grading' && record.result && record.result.weakPoints) {
    const tags = record.result.weakPoints.slice(0, 3).map(w => w.topic)
    if (record.result.weakPoints.length > 3) tags.push(`+${record.result.weakPoints.length - 3} 更多`)
    return tags
  }
  if (record.type === 'split' && record.result && record.result.questions) {
    const types = [...new Set(record.result.questions.map(q => q.type).filter(Boolean))]
    return types.slice(0, 4)
  }
  return []
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('zh-CN', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function confirmClear() {
  showClearModal.value = true
}

function doClear() {
  switch (activeTab.value) {
    case 'weakness':
      clearWeaknessHistory()
      weaknessList.value = []
      break
    case 'grading':
      localStorage.removeItem('grading_analyzer_history')
      gradingList.value = []
      break
    case 'split':
      localStorage.removeItem('split_analyzer_history')
      splitList.value = []
      break
  }
  showClearModal.value = false
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .relative, .modal-leave-to .relative { transform: scale(0.95); }
</style>
