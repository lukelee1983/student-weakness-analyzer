// Netlify Function: 统一代理百度OCR识别
// 通过 mode 参数区分 handwriting(手写体) / accurate(高精度印刷体)
// 解决前端直接调用百度OCR接口的CORS问题

exports.handler = async (event) => {
  // 处理CORS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const params = event.queryStringParameters || {};
    const mode = params.mode || 'handwriting';
    const accessToken = params.access_token;

    if (!accessToken) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing access_token' })
      };
    }

    // 根据mode选择百度OCR端点
    let ocrUrl;
    if (mode === 'accurate') {
      // 高精度印刷体识别
      ocrUrl = `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${accessToken}`;
    } else {
      // 手写体识别（默认）
      ocrUrl = `https://aip.baidubce.com/rest/2.0/ocr/v1/handwriting?access_token=${accessToken}`;
    }

    // 解析请求body（可能是JSON或form-data）
    let body = event.body;
    let contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';

    let fetchOptions = {
      method: 'POST',
      headers: {}
    };

    if (contentType.includes('application/json')) {
      // 前端发送JSON格式
      const jsonData = JSON.parse(body);
      const formBody = Object.entries(jsonData)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      fetchOptions.body = formBody;
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      fetchOptions.body = body;
    } else {
      // 默认当作form-urlencoded
      fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      fetchOptions.body = body;
    }

    const response = await fetch(ocrUrl, fetchOptions);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
