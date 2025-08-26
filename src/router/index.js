import { createRouter, createWebHistory } from 'vue-router'

// Simple views using existing components to keep changes minimal
import TheWelcome from '../components/TheWelcome.vue'
import HelloWorld from '../components/HelloWorld.vue'
import ContentView from '../views/ContentView.vue'
import Page1 from '../views/content/Page1.vue'
import Page2 from '../views/content/Page2.vue'
import Page3 from '../views/content/Page3.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: TheWelcome,
  },
  {
    path: '/excel',
    name: 'excel',
    component: () => import('../views/Excel.vue'),
  },
  {
    path: '/content',
    name: 'content',
    component: ContentView,
    redirect: '/content/page1',
    children: [
      { path: 'page1', name: 'content-page1', component: Page1 },
      { path: 'page2', name: 'content-page2', component: Page2 },
      { path: 'page3', name: 'content-page3', component: Page3 },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
