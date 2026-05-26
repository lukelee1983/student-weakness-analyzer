<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h2 class="text-2xl md:text-3xl font-extrabold text-text-primary mb-1">开始分析</h2>
      <p class="text-text-secondary text-sm">上传作业照片，AI 帮你找出知识薄弱点</p>
    </div>

    <!-- 演示/真实模式提示 -->
    <Transition name="fade" mode="out-in">
      <div v-if="isRealOCR" key="real"
        class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 rounded-2xl p-4 mb-6 shadow-sm">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center text-lg flex-shrink-0 shadow-sm shadow-green-500/10">
            ✅
          </div>
          <div>
            <p class="font-semibold text-green-800 text-sm">真实识别模式</p>
            <p class="text-xs text-green-700/80 mt-0.5">
              已配置百度OCR，上传的作业照片将通过手写体OCR识别文字，再由 DeepSeek AI 分析薄弱项。
            </p>
          </div>
        </div>
      </div>
      <div v-else key="demo"
        class="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60 rounded-2xl p-4 mb-6 shadow-sm">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-lg flex-shrink-0 shadow-sm shadow-amber-500/10">
            💡
          </div>
          <div>
            <p class="font-semibold text-amber-800 text-sm">演示模式</p>
            <p class="text-xs text-amber-700/80 mt-0.5">
              当前未配置百度OCR，将使用模拟数据演示分析流程。配置 API Key 后可切换为真实识别模式。
            </p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Step 1: 上传照片 -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-border-light mb-6 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light text-white text-sm flex items-center justify-center font-bold shadow-sm shadow-primary/20">
          1
        </div>
        <h3 class="font-semibold text-lg text-text-primary">上传作业照片</h3>
      </div>
      <ImageUploader v-model="images" />
      <div v-if="images.length > 0" class="mt-4 flex items-center justify-between">
        <span class="text-sm text-text-secondary">已选择 <span class="font-semibold text-primary">{{ images.length }}</span> 张图片</span>
        <button @click="images = []" class="text-danger hover:text-danger/80 hover:underline text-sm cursor-pointer transition-colors">清空重选</button>
      </div>
    </div>

    <!-- Step 2: 选择科目 -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-border-light mb-6 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light text-white text-sm flex items-center justify-center font-bold shadow-sm shadow-primary/20">
          2
        </div>
        <h3 class="font-semibold text-lg text-text-primary">选择科目</h3>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button v-for="option in subjectOptions" :key="option.value"
          @click="subject = option.value"
          :class="[
            'relative p-5 rounded-2xl border-2 text-center cursor-pointer transition-all duration-200 overflow-hidden group',
            subject === option.value
              ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 -translate-y-0.5'
              : 'border-border-light bg-white hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5'
          ]">
          <!-- 选中时的背景光晕 -->
          <div v-if="subject === option.value"
            class="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50 pointer-events-none"></div>
          <div class="relative">
            <div class="text-3xl mb-2 transition-transform duration-200"
              :class="subject === option.value ? 'scale-110' : 'group-hover:scale-105'">
              {{ option.icon }}
            </div>
            <div class="font-medium text-sm"
              :class="subject === option.value ? 'text-primary' : 'text-text-secondary'">
              {{ option.label }}
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Step 3: 开始分析 -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-border-light mb-6 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light text-white text-sm flex items-center justify-center font-bold shadow-sm shadow-primary/20">
          3
        </div>
        <h3 class="font-semibold text-lg text-text-primary">开始分析</h3>
      </div>
      <button @click="startAnalysis"
        :disabled="images.length === 0 || analyzing"
        :class="[
          'w-full py-3.5 rounded-xl font-semibold text-lg transition-all duration-200 cursor-pointer',
          images.length === 0 || analyzing
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:scale-[0.98] shadow-md shadow-primary/20'
        ]">
        <span v-if="!analyzing">🔍 开始 AI 分析</span>
        <span v-else class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          正在分析中...
        </span>
      </button>
    </div>

    <!-- 分析进度 -->
    <Transition name="slide-up">
      <div v-if="analyzing" class="bg-white rounded-2xl p-6 shadow-md border border-primary/20 mb-6">
        <AnalysisProgress :step="analysisStep" :message="analysisMessage" />
      </div>
    </Transition>

    <!-- 错误提示 -->
    <Transition name="slide-up">
      <div v-if="errorMsg" class="bg-red-50 border border-red-200/60 rounded-2xl p-5 mb-6 shadow-sm">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center text-lg flex-shrink-0">⚠️</div>
          <div class="flex-1">
            <p class="font-semibold text-red-700">分析失败</p>
            <p class="text-sm text-red-600/80 mt-0.5">{{ errorMsg }}</p>
            <button @click="errorMsg = ''" class="text-sm text-red-500 hover:text-red-700 underline mt-2 cursor-pointer transition-colors">关闭提示</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ImageUploader from '../components/ImageUploader.vue'
import AnalysisProgress from '../components/AnalysisProgress.vue'
import { analyzeHomework, hasBaiduOCR } from '../services/deepseek.js'
import { compressImage } from '../utils/imageUtils.js'
import { addHistory } from '../utils/storage.js'
import mathData from '../data/math.js'
import chineseData from '../data/chinese.js'
import englishData from '../data/english.js'

const router = useRouter()
const images = ref([])
const subject = ref('math')
const analyzing = ref(false)
const analysisStep = ref(0)
const analysisMessage = ref('')
const errorMsg = ref('')

const isRealOCR = computed(() => hasBaiduOCR())

const subjectOptions = [
  { value: 'math', label: '数学', icon: '🔢' },
  { value: 'chinese', label: '语文', icon: '📝' },
  { value: 'english', label: '英语', icon: '🔤' },
  { value: 'auto', label: '自动识别', icon: '🤖' }
]

const subjectLabelMap = {
  math: '数学',
  chinese: '语文',
  english: '英语',
  auto: '综合'
}

const knowledgeMap = {
  math: mathData,
  chinese: chineseData,
  english: englishData,
  auto: null
}

async function startAnalysis() {
  if (images.value.length === 0 || analyzing.value) return

  analyzing.value = true
  errorMsg.value = ''

  try {
    // Step 1: 准备图片数据
    analysisStep.value = 1
    analysisMessage.value = isRealOCR.value
      ? '正在压缩图片并识别文字...'
      : '演示模式：使用预设作业内容...'

    const base64Images = []
    for (const file of images.value) {
      try {
        const base64 = await compressImage(file)
        base64Images.push(base64)
      } catch (err) {
        console.warn('图片压缩失败，跳过:', file.name, err)
      }
    }

    if (base64Images.length === 0) {
      throw new Error('所有图片处理失败，请重新上传清晰的作业照片。')
    }

    const primaryImage = base64Images[0]

    // Step 2: AI 分析
    analysisStep.value = 2
    analysisMessage.value = isRealOCR.value
      ? '百度OCR识别完成，正在调用 AI 分析薄弱项...'
      : '正在调用 AI 分析薄弱项...'

    const result = await analyzeHomework(primaryImage, subject.value, knowledgeMap[subject.value], !isRealOCR.value)

    // Step 3: 生成报告
    analysisStep.value = 3
    analysisMessage.value = '正在生成分析报告...'
    await new Promise(resolve => setTimeout(resolve, 500))

    const record = addHistory({
      subject: subject.value,
      result: result,
      imageCount: images.value.length,
      demoMode: !isRealOCR.value
    })

    router.push({ name: 'Report', params: { id: record.id } })
  } catch (err) {
    console.error('Analysis error:', err)
    errorMsg.value = err.message || '分析过程出现错误，请检查网络连接后重试。'
  } finally {
    analyzing.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }

.slide-up-enter-active { transition: all 0.3s ease-out; }
.slide-up-leave-active { transition: all 0.2s ease-in; }
.slide-up-enter-from { opacity: 0; transform: translateY(12px); }
.slide-up-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
