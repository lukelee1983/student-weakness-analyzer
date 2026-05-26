<template>
  <div>
    <!-- Upload Area -->
    <div v-if="fileList.length === 0"
      class="relative border-2 border-dashed border-primary/30 rounded-2xl p-8 md:p-12 text-center bg-gradient-to-br from-primary/5 to-accent/5 hover:border-primary/60 hover:from-primary/10 hover:to-accent/10 transition-all duration-200 cursor-pointer group"
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="{ 'border-primary bg-primary/5 scale-[1.01]': isDragging }">

      <!-- 拖拽时的覆盖层 -->
      <div v-if="isDragging" class="absolute inset-0 bg-primary/5 rounded-2xl flex items-center justify-center">
        <div class="text-center">
          <div class="text-5xl mb-2 animate-pulse">📥</div>
          <p class="text-primary font-medium">松开鼠标上传</p>
        </div>
      </div>

      <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">📷</div>
      <p class="font-semibold text-text-primary mb-1">点击上传作业照片</p>
      <p class="text-sm text-text-secondary">支持拍照或从相册选择，可一次上传多张</p>
      <p class="text-xs text-text-light mt-2 md:hidden">📱 点击后将打开相机或相册</p>
    </div>

    <!-- File List -->
    <div v-else class="space-y-3">
      <div v-for="(file, idx) in fileList" :key="idx"
        class="flex items-center gap-3 bg-white rounded-xl p-3 border border-border-light hover:border-primary/30 hover:shadow-sm transition-all duration-150 group">

        <!-- Thumbnail -->
        <div class="w-14 h-14 rounded-lg overflow-hidden bg-border flex-shrink-0 shadow-sm">
          <img :src="previewUrls[idx]" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-text-primary truncate">{{ file.name }}</p>
          <p class="text-xs text-text-secondary">{{ formatSize(file.size) }}</p>
        </div>

        <!-- Remove -->
        <button @click="removeFile(idx)"
          class="w-8 h-8 rounded-full hover:bg-danger/10 flex items-center justify-center text-text-light hover:text-danger transition-all cursor-pointer flex-shrink-0">
          ✕
        </button>
      </div>

      <!-- Add More -->
      <button @click="triggerFileInput"
        class="w-full py-3 border-2 border-dashed border-primary/30 rounded-xl text-primary font-medium hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 cursor-pointer text-sm">
        + 继续添加图片
      </button>
    </div>

    <!-- 单一隐藏的file input -->
    <input ref="fileInput" type="file" accept="image/*" multiple @change="handleFileChange" class="hidden" />
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({ modelValue: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const fileList = ref([])
const previewUrls = ref([])
const isDragging = ref(false)

watch(() => props.modelValue, (val) => {
  if (val !== fileList.value) {
    fileList.value = [...val]
    updatePreviews()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  previewUrls.value.forEach(url => URL.revokeObjectURL(url))
})

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(e) {
  const files = Array.from(e.target.files || [])
  if (files.length > 0) {
    addFiles(files)
  }
  e.target.value = ''
}

function handleDrop(e) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
  if (files.length > 0) {
    addFiles(files)
  }
}

function addFiles(files) {
  const newFiles = [...fileList.value, ...files]
  fileList.value = newFiles
  emit('update:modelValue', newFiles)
  updatePreviews()
}

function removeFile(idx) {
  if (previewUrls.value[idx]) {
    URL.revokeObjectURL(previewUrls.value[idx])
  }
  fileList.value.splice(idx, 1)
  previewUrls.value.splice(idx, 1)
  emit('update:modelValue', [...fileList.value])
}

function updatePreviews() {
  previewUrls.value.forEach(url => URL.revokeObjectURL(url))
  previewUrls.value = fileList.value.map(f => URL.createObjectURL(f))
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>
