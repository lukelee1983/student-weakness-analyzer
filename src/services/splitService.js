/**
 * 试卷切题识别服务
 * 基于先进算法实现题目自动切分，精准区分题干、选项、答案等模块
 * 
 * 工作流程：
 * 1. 百度OCR双模式识别（印刷体+手写体），获取文字块位置信息
 * 2. DeepSeek AI 题目切分分析
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
 * 百度OCR高精度印刷体识别（带位置信息）
 */
async function accurateOCRWithLocation(base64Image, accessToken) {
  const url = `/api/baidu-ocr?mode=accurate&access_token=${accessToken}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `image=${encodeURIComponent(base64Image)}&detect_direction=true&probability=true&language_type=auto_detect&paragraph=true&vertex_location=true`
  })
  return response.json()
}

/**
 * 百度OCR手写体识别（带位置信息）
 */
async function handwritingOCRWithLocation(base64Image, accessToken) {
  const url = `/api/baidu-ocr?mode=handwriting&access_token=${accessToken}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `image=${encodeURIComponent(base64Image)}&detect_direction=true&probability=true&language_type=auto_detect&location=true`
  })
  return response.json()
}

/**
 * 双模式OCR识别（带位置信息）
 * @param {string} base64Image - 图片base64（不含前缀）
 * @returns {object} OCR结果，包含文字块位置信息
 */
async function dualModeOCRWithLocation(base64Image) {
  const accessToken = await getBaiduAccessToken()
  
  const [printResult, handResult] = await Promise.allSettled([
    accurateOCRWithLocation(base64Image, accessToken),
    handwritingOCRWithLocation(base64Image, accessToken)
  ])
  
  const printData = printResult.status === 'fulfilled' ? printResult.value : null
  const handData = handResult.status === 'fulfilled' ? handResult.value : null
  
  const printWords = (printData && !printData.error_code && printData.words_result) || []
  const handWords = (handData && !handData.error_code && handData.words_result) || []
  
  // 构建带位置信息的文本描述
  let structuredText = ''
  let printText = ''
  let handText = ''
  
  // 印刷体文字（带位置）
  if (printWords.length > 0) {
    const lines = printWords.map((w, i) => {
      const loc = w.location || {}
      const pos = loc.top ? `[位置:行${loc.top},列${loc.left}]` : ''
      return `${pos} ${w.words}`
    })
    printText = lines.join('\n')
    structuredText += `【印刷体内容】\n${printText}`
  }
  
  // 手写体文字（带位置）
  if (handWords.length > 0) {
    const lines = handWords.map((w, i) => {
      const loc = w.location || {}
      const pos = loc.top ? `[位置:行${loc.top},列${loc.left}]` : ''
      return `${pos} ${w.words}`
    })
    handText = lines.join('\n')
    if (structuredText) structuredText += '\n\n'
    structuredText += `【手写体内容】\n${handText}`
  }
  
  if (!structuredText.trim()) {
    structuredText = '（未能识别到文字内容）'
  }
  
  return {
    structuredText,
    printText,
    handText,
    printWordCount: printWords.length,
    handWordCount: handWords.length
  }
}

/**
 * 模拟切题OCR结果（演示模式）
 */
function simulateSplitOCR() {
  return {
    structuredText: `【印刷体内容】
[位置:行50,列30] 一、选择题（每题5分，共20分）
[位置:行80,列30] 1. 下列哪个分数最大？
[位置:行110,列50] A. 1/2    B. 2/3    C. 3/4    D. 4/5
[位置:行140,列30] 2. 一个三角形的三个内角之和为：
[位置:行170,列50] A. 90°    B. 180°    C. 270°    D. 360°
[位置:行200,列30] 3. 如果 x + 3 = 7，那么 x 等于：
[位置:行230,列50] A. 3    B. 4    C. 5    D. 10
[位置:行260,col30] 4. 下列哪组数是互质数？
[位置:行290,列50] A. 6和8    B. 9和12    C. 7和11    D. 15和20

[位置:行340,列30] 二、填空题（每空3分，共12分）
[位置:行370,列30] 5. 3 × 7 = ______
[位置:行400,列30] 6. 56 ÷ 8 = ______
[位置:行430,列30] 7. 长方形的面积公式是 ______
[位置:行460,列30] 8. 1米 = ______ 厘米

[位置:行510,列30] 三、计算题（每题8分，共16分）
[位置:行540,列30] 9. 计算：125 + 378 = ？
[位置:行570,列30] 10. 计算：45 × 6 = ？

[位置:行620,列30] 四、应用题（12分）
[位置:行650,列30] 11. 小明有45元，买了一本书花去18元，又买了一支笔花去5元，还剩多少元？

【手写体内容】
[位置:行110,列200] B
[位置:行170,列200] B
[位置:行230,列200] B
[位置:行290,列200] C
[位置:行370,列150] 21
[位置:行400,列150] 7
[位置:行430,列150] 长×宽
[位置:行460,列150] 100
[位置:行540,列200] 503
[位置:行570,列200] 270
[位置:行650,列200] 45-18-5=22（元）`,
    printText: '印刷体题目内容',
    handText: '手写作答内容',
    printWordCount: 30,
    handWordCount: 12
  }
}

/**
 * 试卷切题主入口
 * @param {string} base64Image - 图片base64
 * @param {object} options - 切题选项
 * @param {string} options.contentType - 内容类型 (exam/workbook/textbook/worksheet)
 * @param {boolean} demoMode - 是否演示模式
 * @returns {object} 切题结果
 */
export async function splitExam(base64Image, options = {}, demoMode = false) {
  const { contentType = 'exam' } = options
  const contentLabel = getContentLabel(contentType)
  
  // Step 1: OCR双模式识别
  let ocrResult
  if (demoMode) {
    ocrResult = simulateSplitOCR()
  } else {
    const pureBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '')
    ocrResult = await dualModeOCRWithLocation(pureBase64)
  }
  
  // Step 2: DeepSeek切题分析
  const prompt = buildSplitPrompt({
    ocrResult,
    contentLabel,
    contentType
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
      temperature: 0.15
    })
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API 请求失败 (${response.status}): ${error}`)
  }
  
  const data = await response.json()
  const content = data.choices[0].message.content
  
  return parseSplitResult(content, { contentLabel, contentType, ocrResult })
}

/**
 * 构建切题Prompt
 */
function buildSplitPrompt({ ocrResult, contentLabel, contentType }) {
  return `你是一位专业的试卷分析和切题专家。你的任务是将一整页${contentLabel}的内容，自动切分为独立的题目，精准区分题干、选项、答案等模块，完整保留题目逻辑与结构。

## OCR识别的原始内容（含位置信息）
${ocrResult.structuredText}

## 切题要求
1. **自动切分**：将整页内容按题目为单位切分，每题独立
2. **精准区分**：区分以下模块：
   - 题干（题目要求和具体问题）
   - 选项（如有，如A/B/C/D选项）
   - 答案区域（学生作答的内容，通常为手写体）
3. **保留结构**：保持题目的逻辑关系和编号
4. **兼容混合**：同时处理印刷体和手写体内容
5. **题型识别**：判断每题的题型

## 输出格式（严格返回纯 JSON 字符串，不要用 markdown 代码块包裹，不要输出任何其他文字）
{
  "contentType": "${contentLabel}",
  "totalQuestions": 11,
  "sections": [
    {
      "title": "一、选择题",
      "startIndex": 1,
      "endIndex": 4
    }
  ],
  "questions": [
    {
      "index": 1,
      "type": "题型（选择题/填空题/计算题/解答题/应用题/判断题/证明题/实验题/翻译题/阅读理解/作文题/其他）",
      "section": "所属大题标题",
      "stem": "完整的题目内容/题干",
      "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
      "answer": "学生的作答内容（如有手写作答），无则填空字符串",
      "fullScore": 5,
      "subQuestions": []
    }
  ],
  "ocrText": "原始OCR识别的完整文字"
}

注意：
- questions 数组按题号顺序排列
- options 如无选项则为空数组 []
- subQuestions 用于嵌套题目（如阅读理解下的小题），无嵌套则为空数组
- subQuestions 格式同 questions，但不含 section 字段
- fullScore 如无法确定则为 0
- answer 字段记录学生手写作答内容，帮助区分题目和作答
- 如果某些文字无法归类到任何题目，放入最后一个 question 的 stem 中`
}

/**
 * 解析切题结果
 */
function parseSplitResult(content, context) {
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
    return {
      contentType: context.contentLabel,
      totalQuestions: 0,
      sections: [],
      questions: [],
      ocrText: context.ocrResult.structuredText.substring(0, 500)
    }
  }
}

function getContentLabel(type) {
  const map = {
    exam: '试卷',
    workbook: '习题册',
    textbook: '课本',
    worksheet: '作业单'
  }
  return map[type] || '教学材料'
}

export default { splitExam }
