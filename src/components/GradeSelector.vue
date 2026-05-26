<template>
  <div>
    <!-- 学段选择 -->
    <div class="mb-5">
      <label class="block text-sm font-semibold text-text-primary mb-3">选择学段</label>
      <div class="grid grid-cols-3 gap-3">
        <button v-for="level in gradeLevels" :key="level.id"
          @click="selectLevel(level.id)"
          :class="[
            'relative p-4 rounded-2xl border-2 text-center cursor-pointer transition-all duration-200 overflow-hidden group',
            currentLevel === level.id
              ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 -translate-y-0.5'
              : 'border-border-light bg-white hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5'
          ]">
          <div v-if="currentLevel === level.id"
            class="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50 pointer-events-none"></div>
          <div class="relative">
            <div class="text-2xl mb-1.5 transition-transform duration-200"
              :class="currentLevel === level.id ? 'scale-110' : 'group-hover:scale-105'">
              {{ level.icon }}
            </div>
            <div class="font-medium text-sm"
              :class="currentLevel === level.id ? 'text-primary' : 'text-text-secondary'">
              {{ level.label }}
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- 年级选择 -->
    <div v-if="currentLevel" class="mb-5">
      <label class="block text-sm font-semibold text-text-primary mb-3">选择年级</label>
      <div class="flex flex-wrap gap-2">
        <button v-for="grade in currentGrades" :key="grade.id"
          @click="selectGrade(grade.id)"
          :class="[
            'px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200',
            currentGrade === grade.id
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-white border border-border-light text-text-secondary hover:border-primary/30 hover:text-primary hover:shadow-sm'
          ]">
          {{ grade.label }}
        </button>
      </div>
    </div>

    <!-- 科目选择 -->
    <div v-if="currentLevel" class="mb-3">
      <label class="block text-sm font-semibold text-text-primary mb-3">选择科目</label>
      <div class="grid grid-cols-3 gap-2">
        <button v-for="subj in currentSubjects" :key="subj.id"
          @click="selectSubject(subj.id)"
          :class="[
            'relative p-3 rounded-xl border-2 text-center cursor-pointer transition-all duration-200 group',
            currentSubject === subj.id
              ? subj.type === 'science'
                ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10'
                : 'border-amber-500 bg-amber-50 shadow-md shadow-amber-500/10'
              : 'border-border-light bg-white hover:border-primary/30 hover:shadow-sm'
          ]">
          <div class="text-xl mb-1 transition-transform duration-200"
            :class="currentSubject === subj.id ? 'scale-110' : 'group-hover:scale-105'">
            {{ subj.icon }}
          </div>
          <div class="font-medium text-xs"
            :class="currentSubject === subj.id
              ? subj.type === 'science' ? 'text-blue-700' : 'text-amber-700'
              : 'text-text-secondary'">
            {{ subj.label }}
          </div>
          <div v-if="currentSubject === subj.id"
            class="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white"
            :class="subj.type === 'science' ? 'bg-blue-500' : 'bg-amber-500'">
            {{ subj.type === 'science' ? '理' : '文' }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { gradeLevels, subjectConfig } from '../data/subjects.js'

const props = defineProps({
  level: { type: String, default: '' },
  grade: { type: Number, default: null },
  subject: { type: String, default: '' }
})

const emit = defineEmits(['update:level', 'update:grade', 'update:subject', 'change'])

const currentLevel = ref(props.level)
const currentGrade = ref(props.grade)
const currentSubject = ref(props.subject)

const currentGrades = computed(() => {
  const level = gradeLevels.find(l => l.id === currentLevel.value)
  return level ? level.grades : []
})

const currentSubjects = computed(() => {
  return subjectConfig[currentLevel.value] || []
})

watch(() => props.level, (v) => { currentLevel.value = v })
watch(() => props.grade, (v) => { currentGrade.value = v })
watch(() => props.subject, (v) => { currentSubject.value = v })

function selectLevel(levelId) {
  currentLevel.value = levelId
  currentGrade.value = null
  currentSubject.value = ''
  emit('update:level', levelId)
  emit('update:grade', null)
  emit('update:subject', '')
  emit('change', { level: levelId, grade: null, subject: '' })
}

function selectGrade(gradeId) {
  currentGrade.value = gradeId
  emit('update:grade', gradeId)
  emit('change', { level: currentLevel.value, grade: gradeId, subject: currentSubject.value })
}

function selectSubject(subjectId) {
  currentSubject.value = subjectId
  emit('update:subject', subjectId)
  emit('change', { level: currentLevel.value, grade: currentGrade.value, subject: subjectId })
}
</script>
