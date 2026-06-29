import { createRouter, createWebHistory } from 'vue-router'
import AnalyzeView from '../views/AnalyzeView.vue'
import ScoreView from '../views/ScoreView.vue'
import ArchiveView from '../views/ArchiveView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'analyze', component: AnalyzeView },
    { path: '/score/:id', name: 'score', component: ScoreView },
    { path: '/archive', name: 'archive', component: ArchiveView },
  ],
})

export default router
