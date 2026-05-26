/**
 * 智能批改服务
 * 覆盖小学至高中全学段，模拟专业教师批改流程
 * 
 * 工作流程：
 * 1. 百度OCR双模式识别（印刷体+手写体）
 * 2. DeepSeek AI 逐题批改分析
 * 3. 结果解析与格式化
 */

const API_URL = 'https://api.deepseek.com/v1/chat/completions'
const API_KEY = 'sk-89aeac8aa26a47f2a72d6ba18e5d8027'

const BAIDU_OCR_API_KEY = 'VvqNH3GGcdpKWNhA8Se2PV41'
const BAIDU_OCR_SECRET_KEY = 'BShEletHk0FdjqSq52jiqOWFRhQkVZKS'

/**
 * 获取百度OCR Access Token
 */
async function getBaiduAccessToken() {
  const url = `/api/baidu-token?grant_type=client_credentials&client_id=${BAIDU_OCR_API_KEY}&client_secret=${BAIDU_OCR_SECRET_KEY}`
  const res = await fetch(url)
  const data = await res.json()
  if (!data.access_token) {
    throw new Error(`百度OCR认证失败: ${data.error_description || data.error || '未知错误'}`)
  }
  return data.access_token
}

/**
 * 百度OCR高精度印刷体识别
 */
async function accurateOCRRecognize(base64Image, accessToken) {
  const url = `/api/baidu-ocr?mode=accurate&access_token=${accessToken}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `image=${encodeURIComponent(base64Image)}&detect_direction=true&probability=true&language_type=auto_detect&detect_language=true`
  })
  return response.json()
}

/**
 * 百度OCR手写体识别
 */
async function handwritingOCRRecognize(base64Image, accessToken) {
  const url = `/api/baidu-ocr?mode=handwriting&access_token=${accessToken}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `image=${encodeURIComponent(base64Image)}&detect_direction=true&probability=true&language_type=auto_detect`
  })
  return response.json()
}

/**
 * 双模式OCR识别（印刷体+手写体合并）
 * @param {string} base64Image - 图片base64（不含前缀）
 * @returns {object} 合并后的OCR结果
 */
async function dualModeOCRRecognize(base64Image) {
  const accessToken = await getBaiduAccessToken()
  
  // 并行调用两种OCR模式
  const [printResult, handResult] = await Promise.allSettled([
    accurateOCRRecognize(base64Image, accessToken),
    handwritingOCRRecognize(base64Image, accessToken)
  ])
  
  const printData = printResult.status === 'fulfilled' ? printResult.value : null
  const handData = handResult.status === 'fulfilled' ? handResult.value : null
  
  // 合并OCR结果
  const printWords = (printData && !printData.error_code && printData.words_result) || []
  const handWords = (handData && !handData.error_code && handData.words_result) || []
  
  // 印刷体文本（题干、选项等）
  const printText = printWords.map(w => w.words).join('\n')
  // 手写体文本（学生作答）
  const handText = handWords.map(w => w.words).join('\n')
  
  // 合并所有文字，带来源标记
  let combinedText = ''
  if (printText.trim()) {
    combinedText += `【印刷体内容（题干/选项/题目要求）】\n${printText}`
  }
  if (handText.trim()) {
    if (combinedText) combinedText += '\n\n'
    combinedText += `【手写体内容（学生作答）】\n${handText}`
  }
  
  // 如果都没识别到
  if (!combinedText.trim()) {
    combinedText = '（未能识别到文字内容，可能图片中无文字或照片不清晰）'
  }
  
  return {
    combinedText,
    printText,
    handText,
    printWordCount: printWords.length,
    handWordCount: handWords.length,
    lowConfidenceWords: [
      ...printWords.filter(w => w.probability && w.probability.average < 0.7).map(w => w.words),
      ...handWords.filter(w => w.probability && w.probability.average < 0.6).map(w => w.words)
    ]
  }
}

/**
 * 模拟OCR结果（演示模式）
 */
function simulateGradingOCR(subject, grade) {
  const mockData = {
    math: {
      combinedText: `【印刷体内容（题干/选项/题目要求）】
一、选择题（每题5分）
1. 下列哪个是质数？
   A. 4    B. 7    C. 9    D. 15
2. 计算：(-3)² = ?
   A. -9    B. 9    C. -6    D. 6

二、计算题（每题10分）
3. 解方程：2x + 5 = 13
4. 计算：3/4 + 1/6 = ?

三、应用题（15分）
5. 一个长方形的长是8cm，宽是5cm，求面积和周长。

【手写体内容（学生作答）】
1. B
2. B
3. 2x = 13 - 5 = 8, x = 4
4. 3/4 + 1/6 = 9/12 + 2/12 = 11/12
5. 面积 = 8 × 5 = 40(cm²)
   周长 = (8 + 5) × 2 = 24(cm)`,
      printText: '选择题、计算题、应用题题目内容',
      handText: '学生答案',
      printWordCount: 30,
      handWordCount: 20,
      lowConfidenceWords: []
    },
    chinese: {
      combinedText: `【印刷体内容（题干/选项/题目要求）】
一、选择题（每题3分）
1. 下列词语中，没有错别字的一项是：
   A. 震耳欲聋  B. 走头无路  C. 再接再厉  D. 谈笑风声
2. "但愿人长久，千里共婵娟"的作者是：
   A. 李白  B. 杜甫  C. 苏轼  D. 辛弃疾

二、默写填空（每空2分）
3. 海内存知己，____________。
4. 落红不是无情物，____________。

三、阅读理解（10分）
阅读《春》片段，回答问题。
5. 文中"小草偷偷地从土里钻出来"一句中，"偷偷地"和"钻"表现了什么？

【手写体内容（学生作答）】
1. A
2. C
3. 天涯若比邻
4. 化作春泥更护花
5. 表现了春天小草旺盛的生命力，"偷偷地"写出小草不经意间长出，"钻"写出小草破土而出的力量。`,
      printText: '选择题、默写填空、阅读理解题目内容',
      handText: '学生答案',
      printWordCount: 25,
      handWordCount: 15,
      lowConfidenceWords: []
    },
    english: {
      combinedText: `【印刷体内容（题干/选项/题目要求）】
I. Multiple Choice (5 points each)
1. She ___ to school every day.
   A. go    B. goes    C. going    D. went
2. The book is ___ the table.
   A. in    B. on    C. at    D. to

II. Fill in the blanks (5 points each)
3. My mother _____ (cook) dinner when I got home.
4. If it _____ (rain) tomorrow, we will stay at home.

III. Reading Comprehension (10 points)
Read the passage and answer:
5. What did Tom do last weekend?

【手写体内容（学生作答）】
1. B
2. B
3. was cooking
4. rains
5. Tom went to the park last weekend. He played football with his friends.`,
      printText: 'Multiple choice, fill in blanks, reading comprehension',
      handText: 'Student answers',
      printWordCount: 20,
      handWordCount: 12,
      lowConfidenceWords: []
    }
  }
  
  return mockData[subject] || mockData.math
}

/**
 * 智能批改主入口
 * @param {string} base64Image - 图片base64
 * @param {object} options - 批改选项
 * @param {string} options.level - 学段 (primary/middle/high)
 * @param {number} options.grade - 年级
 * @param {string} options.subject - 科目
 * @param {string} options.mode - 批改模式 (detailed/mark/score)
 * @param {boolean} demoMode - 是否演示模式
 * @returns {object} 批改结果
 */
export async function gradeHomework(base64Image, options, demoMode = false) {
  const { level, grade, subject, mode } = options
  
  const levelLabel = getLevelLabel(level)
  const gradeLabel = getGradeLabel(level, grade)
  const subjectLabel = getSubjectLabel(subject)
  const subjectType = getSubjectType(level, subject)
  const modeLabel = getModeLabel(mode)
  
  // Step 1: OCR双模式识别
  let ocrResult
  if (demoMode) {
    ocrResult = simulateGradingOCR(subject, grade)
  } else {
    const pureBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '')
    ocrResult = await dualModeOCRRecognize(pureBase64)
  }
  
  // Step 2: DeepSeek批改分析
  const prompt = buildGradingPrompt({
    ocrResult,
    levelLabel,
    gradeLabel,
    subjectLabel,
    subjectType,
    mode,
    modeLabel
  })
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.2
    })
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API 请求失败 (${response.status}): ${error}`)
  }
  
  const data = await response.json()
  const content = data.choices[0].message.content
  
  return parseGradingResult(content, { levelLabel, gradeLabel, subjectLabel, subjectType, mode, ocrResult })
}

/**
 * 构建批改Prompt
 */
function buildGradingPrompt({ ocrResult, levelLabel, gradeLabel, subjectLabel, subjectType, mode, modeLabel }) {
  const isScience = subjectType === 'science'
  
  let modeInstruction = ''
  if (mode === 'detailed') {
    modeInstruction = `请对每道题目进行详细批改，包括：
- 判断对错
- 给出正确答案和详细解题步骤/解析
- 对于计算题，逐步检查解题过程
- 标注错误原因`
  } else if (mode === 'mark') {
    modeInstruction = `请对每道题目标记对错，给出正确答案即可，不需要详细解析。`
  } else {
    modeInstruction = `请对每道题目判断对错，并计算总分和正确率。给出正确答案即可。`
  }
  
  const scienceExtra = isScience ? `
特别注意：
- 对于${subjectLabel}等理综学科，要仔细检查计算过程和步骤
- 识别解题步骤是否完整、逻辑是否正确
- 对于公式使用、单位换算等细节要特别注意
- 如果解题过程有误但结果碰巧正确，仍应指出过程问题` : ''

  return `你是一位经验丰富的${levelLabel}${subjectLabel}教师，正在批改学生的作业/试卷。

## 任务
请对以下${gradeLabel}${subjectLabel}作业进行专业批改。批改模式：${modeLabel}。

## OCR识别的内容
${ocrResult.combinedText}

${ocrResult.lowConfidenceWords && ocrResult.lowConfidenceWords.length > 0 
  ? `## 识别存疑的文字\n以下文字识别置信度较低：${ocrResult.lowConfidenceWords.join('；')}\n请在批改时注明。` : ''}

## 批改要求
${modeInstruction}
${scienceExtra}

## 输出格式（严格返回纯 JSON 字符串，不要用 markdown 代码块包裹，不要输出任何其他文字）
{
  "level": "${levelLabel}",
  "grade": "${gradeLabel}",
  "subject": "${subjectLabel}",
  "subjectType": "${subjectType}",
  "mode": "${mode}",
  "ocrText": "识别到的完整文字内容",
  "questions": [
    {
      "index": 1,
      "type": "题型（选择题/填空题/计算题/解答题/应用题/默写题/阅读理解/作文/判断题/证明题/实验题/翻译题/其他）",
      "stem": "题目内容/题干",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "studentAnswer": "学生作答内容",
      "correctAnswer": "正确答案",
      "isCorrect": true,
      "score": 5,
      "fullScore": 5,
      "analysis": "详细解析（批改模式为detailed时提供，否则为空字符串）",
      "errorType": "错误类型（计算错误/概念错误/审题不清/书写错误/格式不规范/无，正确时填'无'）",
      "uncertainOCR": false
    }
  ],
  "totalScore": 85,
  "totalFullScore": 100,
  "accuracy": 0.85,
  "wrongCount": 3,
  "totalCount": 10,
  "weakPoints": [
    {
      "topic": "知识点名称",
      "description": "薄弱点描述",
      "questions": [1, 3]
    }
  ],
  "suggestions": [
    {
      "title": "建议标题",
      "content": "具体可操作的改进建议"
    }
  ],
  "overallComment": "整体评语，鼓励性语言"
}

注意：
- questions 数组中每道题都必须有以上字段
- options 如无选项则为空数组 []
- isCorrect 为布尔值
- score 和 fullScore 为数字
- accuracy 为正确率（0-1之间的小数）
- 识别存疑的题目 uncertainOCR 设为 true
- 如果学生作答字迹潦草无法辨认，在 studentAnswer 中标注"（字迹难以辨认）"，errorType 为"书写错误"
- suggestions 给出 2-3 条最有针对性的建议`
}

/**
 * 解析批改结果
 */
function parseGradingResult(content, context) {
  try {
    return JSON.parse(content.trim())
  } catch {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[1].trim()) } catch {}
    }
    const braceMatch = content.match(/\{[\s\S]*\}/)
    if (braceMatch) {
      try { return JSON.parse(braceMatch[0]) } catch {}
    }
    // 兜底
    return {
      level: context.levelLabel,
      grade: context.gradeLabel,
      subject: context.subjectLabel,
      subjectType: context.subjectType,
      mode: context.mode,
      ocrText: context.ocrResult.combinedText.substring(0, 500),
      questions: [],
      totalScore: 0,
      totalFullScore: 0,
      accuracy: 0,
      wrongCount: 0,
      totalCount: 0,
      weakPoints: [],
      suggestions: [{
        title: '请重试',
        content: 'AI 批改结果格式异常，请重新上传清晰的试卷照片。'
      }],
      overallComment: '批改未能完成，请确保照片清晰可见。'
    }
  }
}

// ─── 辅助函数 ──────────────────────────────────────────────────

function getLevelLabel(level) {
  const map = { primary: '小学', middle: '初中', high: '高中' }
  return map[level] || '未知'
}

function getGradeLabel(level, grade) {
  const grades = {
    primary: { 1: '一年级', 2: '二年级', 3: '三年级', 4: '四年级', 5: '五年级', 6: '六年级' },
    middle: { 7: '初一', 8: '初二', 9: '初三' },
    high: { 10: '高一', 11: '高二', 12: '高三' }
  }
  return (grades[level] && grades[level][grade]) || ''
}

function getSubjectLabel(subject) {
  const map = {
    math: '数学', chinese: '语文', english: '英语',
    physics: '物理', chemistry: '化学', biology: '生物',
    politics: '道法', history: '历史', geography: '地理'
  }
  return map[subject] || subject
}

function getSubjectType(level, subject) {
  const scienceSubjects = ['math', 'physics', 'chemistry', 'biology']
  return scienceSubjects.includes(subject) ? 'science' : 'liberal'
}

function getModeLabel(mode) {
  const map = { detailed: '详细解析', mark: '标记对错', score: '自动判分' }
  return map[mode] || '详细解析'
}

export default { gradeHomework }
