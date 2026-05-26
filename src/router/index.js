import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AnalyzeView from '../views/AnalyzeView.vue'
import ReportView from '../views/ReportView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  // 薄弱项分析（原有功能）
  { path: '/analyze', name: 'Analyze', component: AnalyzeView },
  { path: '/report/:id', name: 'Report', component: ReportView, props: true },
  { path: '/history', name: 'History', component: () => import('../views/HistoryView.vue') },
  // 智能批改（新功能）
  { path: '/grading', name: 'Grading', component: () => import('../views/GradingView.vue') },
  { path: '/grading/report/:id', name: 'GradingReport', component: () => import('../views/GradingReportView.vue'), props: true },
  // 试卷切题（新功能）
  { path: '/split', name: 'Split', component: () => import('../views/SplitView.vue') },
  { path: '/split/result/:id', name: 'SplitResult', component: () => import('../views/SplitResultView.vue'), props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
