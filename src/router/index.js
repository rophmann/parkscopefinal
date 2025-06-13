import { createRouter, createWebHistory } from 'vue-router'


const routes = [
   {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue')
   },
   {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue')
   },
   {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue')
   },
  
]
const router = createRouter({
   routes,
   history: createWebHistory()
})

export default router


// {
//    path: '/home',
//    name: 'home',
//    component: () => import('@/views/Home.vue')
// },
// {
//    path: '/reservations',
//    name: 'reservations',
//    component: () => import('@/views/Reservations.vue')
// },
// {
//    path: '/favorites',
//    name: 'favorites',
//    component: () => import('@/views/Favorites.vue')
// },
// {
//    path: '/profile',
//    name: 'profile',
//    component: () => import('@/views/Profile.vue')
// },