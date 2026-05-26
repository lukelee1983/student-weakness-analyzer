/**
 * 全学段科目配置
 * 覆盖小学至高中，陪伴孩子学业成长
 */

// 学段配置
export const gradeLevels = [
  { id: 'primary', label: '小学', icon: '🎒', grades: [
    { id: 1, label: '一年级' }, { id: 2, label: '二年级' }, { id: 3, label: '三年级' },
    { id: 4, label: '四年级' }, { id: 5, label: '五年级' }, { id: 6, label: '六年级' }
  ]},
  { id: 'middle', label: '初中', icon: '📖', grades: [
    { id: 7, label: '初一' }, { id: 8, label: '初二' }, { id: 9, label: '初三' }
  ]},
  { id: 'high', label: '高中', icon: '🎓', grades: [
    { id: 10, label: '高一' }, { id: 11, label: '高二' }, { id: 12, label: '高三' }
  ]}
]

// 科目类型：science=理综, liberal=文科
export const subjectTypeLabels = {
  science: '理综',
  liberal: '文科'
}

// 各学段科目配置
export const subjectConfig = {
  primary: [
    { id: 'math', label: '数学', icon: '🔢', type: 'science',
      description: '计算、几何、应用题等' },
    { id: 'chinese', label: '语文', icon: '📝', type: 'liberal',
      description: '字词、阅读、写作等' },
    { id: 'english', label: '英语', icon: '🔤', type: 'liberal',
      description: '单词、语法、阅读等' }
  ],
  middle: [
    { id: 'math', label: '数学', icon: '🔢', type: 'science',
      description: '代数、几何、函数等' },
    { id: 'chinese', label: '语文', icon: '📝', type: 'liberal',
      description: '阅读、写作、文言文等' },
    { id: 'english', label: '英语', icon: '🔤', type: 'liberal',
      description: '语法、阅读、写作等' },
    { id: 'physics', label: '物理', icon: '⚡', type: 'science',
      description: '力学、电学、光学等' },
    { id: 'chemistry', label: '化学', icon: '🧪', type: 'science',
      description: '元素、反应、实验等' },
    { id: 'biology', label: '生物', icon: '🌱', type: 'science',
      description: '细胞、遗传、生态等' },
    { id: 'politics', label: '道法', icon: '📖', type: 'liberal',
      description: '道德、法治、国情等' },
    { id: 'history', label: '历史', icon: '🏛️', type: 'liberal',
      description: '中国史、世界史等' },
    { id: 'geography', label: '地理', icon: '🌍', type: 'liberal',
      description: '自然地理、人文地理等' }
  ],
  high: [
    { id: 'math', label: '数学', icon: '🔢', type: 'science',
      description: '函数、导数、概率等' },
    { id: 'chinese', label: '语文', icon: '📝', type: 'liberal',
      description: '阅读、写作、古文等' },
    { id: 'english', label: '英语', icon: '🔤', type: 'liberal',
      description: '语法、阅读、写作等' },
    { id: 'physics', label: '物理', icon: '⚡', type: 'science',
      description: '力学、电磁、热学等' },
    { id: 'chemistry', label: '化学', icon: '🧪', type: 'science',
      description: '有机、无机、实验等' },
    { id: 'biology', label: '生物', icon: '🌱', type: 'science',
      description: '分子、遗传、生态等' },
    { id: 'politics', label: '政治', icon: '📖', type: 'liberal',
      description: '经济、哲学、政治等' },
    { id: 'history', label: '历史', icon: '🏛️', type: 'liberal',
      description: '中国史、世界史等' },
    { id: 'geography', label: '地理', icon: '🌍', type: 'liberal',
      description: '自然、人文、区域等' }
  ]
}

// 批改模式配置
export const gradingModes = [
  { id: 'detailed', label: '详细解析', icon: '📋',
    description: '逐题批改并给出详细解题过程和解析' },
  { id: 'mark', label: '标记对错', icon: '✅',
    description: '仅标记每题对错，不展开解析' },
  { id: 'score', label: '自动判分', icon: '💯',
    description: '自动评分，给出总分和正确率' }
]

// 试卷内容类型
export const contentTypes = [
  { id: 'exam', label: '试卷', icon: '📄',
    description: '正式考试试卷，结构规范' },
  { id: 'workbook', label: '习题册', icon: '📕',
    description: '练习册或教辅资料' },
  { id: 'textbook', label: '课本', icon: '📗',
    description: '教材中的课后习题' },
  { id: 'worksheet', label: '作业单', icon: '📝',
    description: '打印或手写的作业练习' }
]

// 题型标签映射
export const questionTypes = {
  choice: { label: '选择题', color: 'blue' },
  fill: { label: '填空题', color: 'green' },
  judge: { label: '判断题', color: 'yellow' },
  calculation: { label: '计算题', color: 'purple' },
  short_answer: { label: '简答题', color: 'orange' },
  essay: { label: '作文题', color: 'red' },
  reading: { label: '阅读理解', color: 'teal' },
  proof: { label: '证明题', color: 'indigo' },
  experiment: { label: '实验题', color: 'pink' },
  translation: { label: '翻译题', color: 'cyan' },
  unknown: { label: '其他', color: 'gray' }
}

/**
 * 根据学段ID获取科目列表
 */
export function getSubjectsByLevel(levelId) {
  return subjectConfig[levelId] || []
}

/**
 * 根据学段和科目ID获取科目信息
 */
export function getSubjectInfo(levelId, subjectId) {
  const subjects = subjectConfig[levelId] || []
  return subjects.find(s => s.id === subjectId) || null
}

/**
 * 获取学段标签
 */
export function getGradeLevelLabel(levelId) {
  const level = gradeLevels.find(l => l.id === levelId)
  return level ? level.label : ''
}

/**
 * 获取年级标签
 */
export function getGradeLabel(levelId, gradeId) {
  const level = gradeLevels.find(l => l.id === levelId)
  if (!level) return ''
  const grade = level.grades.find(g => g.id === gradeId)
  return grade ? grade.label : ''
}

/**
 * 获取完整学段年级描述
 */
export function getFullGradeLabel(levelId, gradeId) {
  const levelLabel = getGradeLevelLabel(levelId)
  const gradeLabel = getGradeLabel(levelId, gradeId)
  return gradeLabel ? `${gradeLabel}` : levelLabel
}
