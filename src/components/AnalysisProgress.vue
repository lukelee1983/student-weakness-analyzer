<template>
  <div class="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-5">
    <!-- 步骤指示器 -->
    <div class="flex items-center justify-center gap-1 mb-6">
      <div v-for="(s, idx) in steps" :key="idx" class="flex items-center gap-1">
        <!-- 步骤圆圈 -->
        <div class="relative flex flex-col items-center">
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
            :class="getStepClass(idx)"
          >
            <span v-if="step > idx" class="text-white">✓</span>
            <span v-else :class="step === idx ? 'animate-pulse text-white' : 'text-text-light'">
              {{ idx + 1 }}
            </span>
          </div>
          <!-- 步骤标签 -->
          <span
            class="text-xs mt-1 font-medium whitespace-nowrap"
            :class="step >= idx ? 'text-primary' : 'text-text-light'"
          >
            {{ s }}
          </span>
        </div>
        <!-- 连接线 -->
        <span v-if="idx < steps.length - 1" class="text-border mx-0.5" :class="step > idx ? 'text-accent' : ''">
          ●●●●
        </span>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="w-full h-1.5 bg-border-light rounded-full overflow-hidden mb-3">
      <div
        class="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
        :style="{ width: progressPercent + '%' }"
      ></div>
    </div>

    <!-- 状态文字 -->
    <p class="text-center text-sm text-text-secondary animate-pulse">
      {{ message || defaultMessage }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  step: { type: Number, default: 0 },
  message: { type: String, default: '' }
})

const steps = ['图片压缩', 'AI 分析', '生成报告']

const progressPercent = computed(() => {
  if (props.step === 0) return 5
  return Math.min((props.step / 3) * 100 + 10, 100)
})

const defaultMessage = computed(() => {
  if (props.step === 0) return '准备中...'
  if (props.step === 1) return '正在识别图片文字...'
  if (props.step === 2) return 'AI 正在分析薄弱项...'
  if (props.step === 3) return '正在生成报告...'
  return '处理中...'
})

function getStepClass(idx) {
  if (props.step > idx) return 'bg-accent shadow-sm shadow-accent/20'
  if (props.step === idx) return 'bg-primary shadow-md shadow-primary/30 scale-110'
  return 'bg-border-light'
}
</script>
