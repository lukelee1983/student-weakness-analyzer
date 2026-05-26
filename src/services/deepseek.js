/**
 * DeepSeek API 调用封装
 * 使用文本模型分析作业内容，识别薄弱项并给出建议
 * 
 * 工作流程：
 * - 百度OCR Key 已配置 → 先调用百度OCR识别图片文字 → 再传给DeepSeek分析
 * - 百度OCR Key 未配置 → 使用模拟OCR数据演示流程
 */

const API_URL = 'https://api.deepseek.com/v1/chat/completions'
const API_KEY = 'sk-89aeac8aa26a47f2a72d6ba18e5d8027'

// 百度OCR配置
const BAIDU_OCR_API_KEY = 'VvqNH3GGcdpKWNhA8Se2PV41'
const BAIDU_OCR_SECRET_KEY = 'BShEletHk0FdjqSq52jiqOWFRhQkVZKS'

/**
 * 检查是否配置了百度OCR
 */
export function hasBaiduOCR() {
  return BAIDU_OCR_API_KEY.length > 0 && BAIDU_OCR_SECRET_KEY.length > 0
}

/**
 * 获取百度OCR Access Token
 * 通过Vite代理转发，解决百度Token端点无CORS头的问题
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
 * 调用百度OCR识别图片文字
 * @param {string} base64Image - 图片base64（不含data:前缀）
 * @returns {object} OCR识别结果
 */
async function baiduOCRRecognize(base64Image) {
  const accessToken = await getBaiduAccessToken()
  const url = `/api/baidu-ocr?mode=handwriting&access_token=${accessToken}`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `image=${encodeURIComponent(base64Image)}&detect_direction=true&probability=true&language_type=auto_detect`
  })
  
  const data = await response.json()
  
  if (data.error_code) {
    throw new Error(`百度OCR错误: ${data.error_msg}`)
  }
  
  // 整理OCR结果
  const words = data.words_result || []
  const ocrText = words.map(w => w.words).join('\n')
  
  // 如果OCR没有识别到任何文字
  if (!ocrText.trim()) {
    return {
      ocrText: '（未能识别到文字内容，可能图片中无手写文字或照片不清晰）',
      lowConfidenceWords: [],
      totalWords: 0,
      direction: data.direction,
      unreadableText: '照片中未能识别出文字，可能是照片模糊、光线不足或无手写内容。'
    }
  }
  
  const lowConfidenceWords = words
    .filter(w => w.probability && w.probability.average < 0.7)
    .map(w => w.words)
  
  return {
    ocrText,
    lowConfidenceWords,
    totalWords: words.length,
    direction: data.direction,
    unreadableText: lowConfidenceWords.length > 0
      ? `以下文字识别置信度低，可能书写不工整：${lowConfidenceWords.join('；')}`
      : ''
  }
}

/**
 * 模拟OCR识别结果（用于演示模式）
 * @param {string} subject - 科目
 * @returns {object} 模拟的OCR结果
 */
function simulateOCRResult(subject) {
  const mockData = {
    math: {
      ocrText: `一、口算题
36+28=64   54-27=27   7×8=56   6×9=45   4×7=28
3×9=27    8×5=40    9×6=54    7×7=47    5×8=40

二、竖式计算
  46       83       57
+37      -28      +26
----     ----     ----
  73       55       83

三、应用题
1. 小明有35颗糖，给了小红18颗，还剩多少颗？
   35-18=17（颗）
   答：还剩17颗糖。

2. 一支铅笔5角，买8支需要多少钱？
   5×8=40（角）=4（元）
   答：需要4元。

3. 妈妈买了3袋苹果，每袋9个，一共多少个？
   3+9=12（个）
   答：一共12个。`,
      unreadableText: '第8行第3题的竖式部分字迹较潦草，难以确认数字'
    },
    chinese: {
      ocrText: `一、看拼音写词语
hǎi yáng（海洋）   zǔ guó（祖国）   mín zú（民族）
kè kǔ（刻苦）     yōng bào（拥抱）   zhōng yāng（中央）

二、组词
湾（海湾）   优（优秀）   纱（纱布）
弯（弯曲）   忧（忧愁）   沙（沙子）

三、选词填空
1. 我们要（保  宝）护小动物。
2. 妈妈给我买了一个（保  宝）贝。
3. 老师和同学们互相（关  观）心。

四、照样子写句子
例：小河是鱼儿的家。
________是________的家。

五、阅读理解
秋天来了，树叶黄了，一片片叶子从树上落下来。天空那么蓝，那么高。
1. 这段话一共有几句话？
2. 天空是什么样子的？`,
      unreadableText: '第4大题的照样子写句子部分字迹模糊'
    },
    english: {
      ocrText: `一、选择题
1. This is ____ father.
   A. I    B. my    C. me
   答案：A

2. Who is ____? She is my sister.
   A. he    B. she    C. it
   答案：B

3. ____ is a boy.
   A. She    B. He    C. It
   答案：B

二、连线题
father — 爸爸    mother — 妈妈
brother — 姐姐    sister — 哥哥

三、看图写单词
1. [图片] f_mily
2. [图片] m_ther
3. [图片] br_ther

四、情景选择
1. 你想介绍你的妈妈，应该说：
   A. This is my mother.  ✓
   B. This is my father.`,
      unreadableText: '连线题部分书写不够清晰，第3题的看图写单词字迹潦草'
    },
    auto: {
      ocrText: `综合练习

数学：8×6=42   9×7=63   45+38=83
语文：祖（祖国）  族（民族）  洋（海洋）
英语：family  mother  brother

应用题：
一本故事书有90页，小明已经看了45页，还剩多少页？
90-45=45（页）`,
      unreadableText: '部分数字书写不够清晰'
    }
  }
  
  return mockData[subject] || mockData.auto
}

/**
 * 分析作业内容（主入口）
 * @param {string} base64Image - 图片base64数据
 * @param {string} subject - 科目
 * @param {object} knowledgeBase - 知识点库
 * @param {boolean} demoMode - 是否演示模式
 * @returns {object} 分析结果
 */
export async function analyzeHomework(base64Image, subject, knowledgeBase, demoMode = false) {
  const subjectLabel = getSubjectLabel(subject)
  
  // Step 1: OCR识别
  let ocrResult
  if (demoMode || !hasBaiduOCR()) {
    // 演示模式：使用模拟OCR结果
    ocrResult = simulateOCRResult(subject)
  } else {
    // 真实模式：调用百度OCR
    const pureBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '')
    ocrResult = await baiduOCRRecognize(pureBase64)
  }
  
  // Step 2: DeepSeek文本分析
  const knowledgeText = formatKnowledgeBase(subject, knowledgeBase)
  
  const prompt = `你是一位经验丰富的小学教育专家，专门分析学生的学习薄弱点。

## 任务
请分析以下${subjectLabel}作业内容，识别学生的知识薄弱点并给出改进建议。

## OCR识别的作业内容
${ocrResult.ocrText}

${ocrResult.unreadableText ? `## 书写问题\n${ocrResult.unreadableText}` : ''}

## 二年级${subjectLabel}知识点库（供参考）
${knowledgeText}

## 分析要求
1. **答案判断**：逐题检查答案是否正确，注意：
   - 计算过程和结果是否正确
   - 书写格式是否规范（如竖式对齐、答语完整等）
   - 字词书写是否正确
2. **薄弱点分析**：对于做错的题目，分析涉及的知识点，判断薄弱原因
3. **书写评估**：如果存在书写不工整、格式不规范的情况，也列为薄弱点
4. **分类归纳**：将同类错误归为一个薄弱点

## 输出格式（严格返回纯 JSON 字符串，不要用 markdown 代码块包裹，不要输出任何其他文字）
{
  "subject": "${subjectLabel}",
  "grade": "二年级",
  "ocrText": "识别到的完整文字内容",
  "unreadableText": "无法识别的文字描述（如无则填空字符串）",
  "weaknesses": [
    {
      "topic": "知识点名称",
      "question": "涉及的具体题目",
      "errorType": "错误类型（知识点不牢/计算错误/书写不工整/格式不规范/审题不清）",
      "severity": "严重程度（高/中/低）",
      "description": "具体问题描述"
    }
  ],
  "suggestions": [
    {
      "title": "建议标题",
      "content": "具体的改进建议，要可操作、有针对性",
      "relatedTopics": ["相关知识点1", "相关知识点2"]
    }
  ],
  "overall": "整体评价，鼓励性语言"
}

注意：
- weaknesses 数量不限，根据实际发现的问题列出
- suggestions 给出 1-3 条最有价值的建议
- 如果作业全部正确且书写工整，weaknesses 为空数组，suggestions 给出鼓励和下一步学习建议
- severity 判断标准：高=同类错误多次出现或核心知识点；中=偶尔出错的知识点；低=小问题或格式问题`

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API 请求失败 (${response.status}): ${error}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content

  // 解析 JSON 结果
  return parseAnalysisResult(content)
}

/**
 * 解析 AI 返回的分析结果
 */
function parseAnalysisResult(content) {
  try {
    return JSON.parse(content.trim())
  } catch {
    // 尝试从 markdown 代码块中提取 JSON
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim())
      } catch {
        // 继续尝试
      }
    }

    // 尝试提取 JSON 对象（最外层 {} 包裹）
    const braceMatch = content.match(/\{[\s\S]*\}/)
    if (braceMatch) {
      try {
        return JSON.parse(braceMatch[0])
      } catch {
        // 解析失败
      }
    }

    // 返回兜底结构
    return {
      subject: '未知',
      grade: '二年级',
      ocrText: content.substring(0, 500),
      unreadableText: '',
      weaknesses: [],
      suggestions: [
        {
          title: '请重试',
          content: 'AI 分析结果格式异常，请重新上传清晰的作业照片。',
          relatedTopics: []
        }
      ],
      overall: '分析未能完成，请确保照片清晰可见。'
    }
  }
}

/**
 * 获取科目中文名
 */
function getSubjectLabel(subject) {
  const labels = {
    math: '数学',
    chinese: '语文',
    english: '英语',
    auto: '综合'
  }
  return labels[subject] || '综合'
}

/**
 * 格式化知识点库为文本
 */
function formatKnowledgeBase(subject, knowledgeBase) {
  if (!knowledgeBase || !knowledgeBase.chapters) return '暂无预设知识点，请根据二年级教材内容自行分析。'

  let text = ''
  knowledgeBase.chapters.forEach(chapter => {
    text += `\n### ${chapter.name}\n`
    if (chapter.topics) {
      chapter.topics.forEach(topic => {
        text += `- ${topic.name}`
        if (topic.keywords && topic.keywords.length > 0) text += `（关键词：${topic.keywords.join('、')}）`
        text += '\n'
      })
    }
    if (chapter.words) {
      text += `- 重点词语：${chapter.words.slice(0, 20).join('、')}\n`
    }
    if (chapter.sentences) {
      text += `- 重点句型：${chapter.sentences.slice(0, 10).join('；')}\n`
    }
  })
  return text
}

export default { analyzeHomework, hasBaiduOCR }
