/**
 * localStorage 历史记录管理
 * 支持三种记录类型：薄弱项分析、智能批改、试卷切题
 */

// 存储键
const STORAGE_KEYS = {
  weakness: 'weakness_analyzer_history',
  grading: 'grading_analyzer_history',
  split: 'split_analyzer_history'
}

// ─── 通用函数 ──────────────────────────────────────────────────

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

function getRecords(key) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveRecords(key, records) {
  localStorage.setItem(key, JSON.stringify(records))
}

// ─── 薄弱项分析记录 ──────────────────────────────────────────

export function getHistory() {
  return getRecords(STORAGE_KEYS.weakness)
}

export function addHistory(record) {
  const history = getRecords(STORAGE_KEYS.weakness)
  record.id = generateId()
  record.createdAt = new Date().toISOString()
  record.type = 'weakness'
  history.unshift(record)
  if (history.length > 50) history.length = 50
  saveRecords(STORAGE_KEYS.weakness, history)
  return record
}

export function getHistoryById(id) {
  return getRecords(STORAGE_KEYS.weakness).find(item => item.id === id) || null
}

export function deleteHistory(id) {
  const history = getRecords(STORAGE_KEYS.weakness).filter(item => item.id !== id)
  saveRecords(STORAGE_KEYS.weakness, history)
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEYS.weakness)
}

// ─── 智能批改记录 ──────────────────────────────────────────

export function getGradingHistory() {
  return getRecords(STORAGE_KEYS.grading)
}

export function addGradingHistory(record) {
  const history = getRecords(STORAGE_KEYS.grading)
  record.id = generateId()
  record.createdAt = new Date().toISOString()
  record.type = 'grading'
  history.unshift(record)
  if (history.length > 50) history.length = 50
  saveRecords(STORAGE_KEYS.grading, history)
  return record
}

export function getGradingHistoryById(id) {
  return getRecords(STORAGE_KEYS.grading).find(item => item.id === id) || null
}

export function deleteGradingHistory(id) {
  const history = getRecords(STORAGE_KEYS.grading).filter(item => item.id !== id)
  saveRecords(STORAGE_KEYS.grading, history)
}

// ─── 试卷切题记录 ──────────────────────────────────────────

export function getSplitHistory() {
  return getRecords(STORAGE_KEYS.split)
}

export function addSplitHistory(record) {
  const history = getRecords(STORAGE_KEYS.split)
  record.id = generateId()
  record.createdAt = new Date().toISOString()
  record.type = 'split'
  history.unshift(record)
  if (history.length > 50) history.length = 50
  saveRecords(STORAGE_KEYS.split, history)
  return record
}

export function getSplitHistoryById(id) {
  return getRecords(STORAGE_KEYS.split).find(item => item.id === id) || null
}

export function deleteSplitHistory(id) {
  const history = getRecords(STORAGE_KEYS.split).filter(item => item.id !== id)
  saveRecords(STORAGE_KEYS.split, history)
}
