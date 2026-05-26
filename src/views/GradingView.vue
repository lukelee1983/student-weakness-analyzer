<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h2 class="text-2xl md:text-3xl font-extrabold text-text-primary mb-1">✏️ 智能批改</h2>
      <p class="text-text-secondary text-sm">上传试卷或作业照片，AI 模拟专业教师逐题批改</p>
    </div>

    <!-- OCR模式提示 -->
    <Transition name="fade" mode="out-in">
      <div v-if="isRealOCR" key="real"
        class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 rounded-2xl p-4 mb-6 shadow-sm">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center text-lg flex-shrink-0">✅</div>
          <div>
            <p class="font-semibold text-green-800 text-sm">双模式识别</p>
            <p class="text-xs text-green-700/80 mt-0.5">同时使用印刷体+手写体OCR，精准区分题目与作答内容，模拟教师批改流程。</p>
          </div>
        </div>
      </div>
      <div v-else key="demo"
        class="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60 rounded-2xl p-4 mb-6 shadow-sm">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-lg flex-shrink-0">💡</div>
          <div>
            <p class="font-semibold text-amber-800 text-sm">演示模式</p>
            <p class="text-xs text-amber-700/80 mt-0.5">使用模拟数据演示批改流程。配置百度OCR后可切换为真实识别模式。</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Step 1: 上传照片 -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-border-light mb-6 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light text-white text-sm flex items-center justify-center font-bold shadow-sm shadow-primary/20">1</div>
        <h3 class="font-semibold text-lg text-text-primary">上传试卷/作业照片</h3>
      </div>
      <ImageUploader v-model="images" />
      <div v-if="images.length > 0" class="mt-4 flex items-center justify-between">
        <span class="text-sm text-text-secondary">已选择 <span class="font-semibold text-primary">{{ images.length }}</span> 张图片</span>
        <button @click="images = []" class="text-danger hover:text-danger/80 hover:underline text-sm cursor-pointer transition-colors">清空重选</button>
      </div>
    </div>

    <!-- Step 2: 选择学段/年级/科目 -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-border-light mb-6 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light text-white text-sm flex items-center justify-center font-bold shadow-sm shadow-primary/20">2</div>
        <h3 class="font-semibold text-lg text-text-primary">选择学段与科目</h3>
      </div>
      <GradeSelector
        v-model:level="level"
        v-model:grade="grade"
        v-model:subject="subject"
      />
    </div>

    <!-- Step 3: 选择批改模式 -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-border-light mb-6 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light text-white text-sm flex items-center justify-center font-bold shadow-sm shadow-primary/20">3</div>
        <h3 class="font-semibold text-lg text-text-primary">选择批改模式</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button v-for="m in gradingModes" :key="m.id"
          @click="gradingMode = m.id"
          :class="[
            'relative p-4 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200 overflow-hidden group',
            gradingMode === m.id
              ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 -translate-y-0.5'
              : 'border-border-light bg-white hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5'
          ]">
          <div v-if="gradingMode === m.id"
            class="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50 pointer-events-none"></div>
          <div class="relative">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-xl">{{ m.icon }}</span>
              <span class="font-semibold text-sm" :class="gradingMode === m.id ? 'text-primary' : 'text-text-primary'">{{ m.label }}</span>
            </div>
            <p class="text-xs text-text-secondary leading-relaxed">{{ m.description }}</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Step 4: 开始批改 -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-border-light mb-6 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light text-white text-sm flex items-center justify-center font-bold shadow-sm shadow-primary/20">4</div>
        <h3 class="font-semibold text-lg text-text-primary">开始批改</h3>
      </div>
      <button @click="startGrading"
        :disabled="!canStartGrading || grading"
        :class="[
          'w-full py-3.5 rounded-xl font-semibold text-lg transition-all duration-200 cursor-pointer',
          !canStartGrading || grading
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:scale-[0.98] shadow-md shadow-primary/20'
        ]">
        <span v-if="!grading">✏️ 开始智能批改</span>
        <span v-else class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          正在批改中...
        </span>
      </button>
      <p v-if="!canStartGrading && !grading" class="text-xs text-text-light mt-2 text-center">
        请先完成以上步骤（上传照片 + 选择学段科目）
      </p>
    </div>

    <!-- 批改进度 -->
    <Transition name="slide-up">
      <div v-if="grading" class="bg-white rounded-2xl p-6 shadow-md border border-primary/20 mb-6">
        <AnalysisProgress :step="gradingStep" :message="gradingMessage" />
      </div>
    </Transition>

    <!-- 错误提示 -->
    <Transition name="slide-up">
      <div v-if="errorMsg" class="bg-red-50 border border-red-200/60 rounded-2xl p-5 mb-6 shadow-sm">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center text-lg flex-shrink-0">⚠️</div>
          <div class="flex-1">
            <p class="font-semibold text-red-700">批改失败</p>
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
import GradeSelector from '../components/GradeSelector.vue'
import { gradeHomework } from '../services/gradingService.js'
import { compressImage } from '../utils/imageUtils.js'
import { addGradingHistory } from '../utils/storage.js'
import { gradingModes } from '../data/subjects.js'
import { hasBaiduOCR } from '../services/deepseek.js'

const router = useRouter()
const images = ref([])
const level = ref('')
const grade = ref(null)
const subject = ref('')
const gradingMode = ref('detailed')
const grading = ref(false)
const gradingStep = ref(0)
const gradingMessage = ref('')
const errorMsg = ref('')

const isRealOCR = computed(() => hasBaiduOCR())

const canStartGrading = computed(() => {
  return images.value.length > 0 && level.value && grade.value && subject.value
})

async function startGrading() {
  if (!canStartGrading.value || grading.value) return

  grading.value = true
  errorMsg.value = ''

  try {
    // Step 1: 准备图片
    gradingStep.value = 1
    gradingMessage.value = isRealOCR.value
      ? '正在压缩图片并双模式识别文字...'
      : '演示模式：使用预设试卷内容...'

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
      throw new Error('所有图片处理失败，请重新上传清晰的试卷照片。')
    }

    const primaryImage = base64Images[0]

    // Step 2: AI 批改
    gradingStep.value = 2
    gradingMessage.value = isRealOCR.value
      ? 'OCR识别完成，正在 AI 逐题批改...'
      : '正在 AI 逐题批改...'

    const result = await gradeHomework(primaryImage, {
      level: level.value,
      grade: grade.value,
      subject: subject.value,
      mode: gradingMode.value
    }, !isRealOCR.value)

    // Step 3: 生成报告
    gradingStep.value = 3
    gradingMessage.value = '正在生成批改报告...'
    await new Promise(resolve => setTimeout(resolve, 500))

    const record = addGradingHistory({
      level: level.value,
      grade: grade.value,
      subject: subject.value,
      mode: gradingMode.value,
      result,
      imageCount: images.value.length,
      demoMode: !isRealOCR.value
    })

    router.push({ name: 'GradingReport', params: { id: record.id } })
  } catch (err) {
    console.error('Grading error:', err)
    errorMsg.value = err.message || '批改过程出现错误，请检查网络连接后重试。'
  } finally {
    grading.value = false
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
