/**
 * Vercel Serverless Function: 百度OCR代理
 * 统一处理 handwriting 和 accurate_basic 两种模式
 * 
 * 路由：
 * /api/baidu-ocr?mode=handwriting  → 百度手写体识别
 * /api/baidu-ocr?mode=accurate     → 百度高精度印刷体识别
 */
export default async function handler(req, res) {
  // CORS预检
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  try {
    const { access_token, mode, ...ocrParams } = req.query;

    // 根据mode选择百度OCR接口
    const baiduEndpoint = mode === 'accurate'
      ? 'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic'
      : 'https://aip.baidubce.com/rest/2.0/ocr/v1/handwriting';

    const params = new URLSearchParams({
      access_token: access_token || '',
      ...ocrParams
    });

    const response = await fetch(`${baiduEndpoint}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data);
  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: error.message });
  }
}
