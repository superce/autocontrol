import Vue from 'vue'
import VueRouter from 'vue-router'

const routerPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error=> error)
}

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'login',
    meta: {title: '登录'},
    component: () => import('@/views/login/index.vue') //登录
  },
  {
    path:'/',
    name:'centralControl',
    meta:{title:'中控管理'},
    component:() => import('@/views/centralControl/index.vue')
  },
  {
    path:'/task_quene',
    name:'taskQuene',
    meta:{title:'队列标识管理'},
    component:()=>import('@/views/taskQuene/index.vue')
  },
  {
    path:'/task_quene/tag',
    name:'tag',
    mete:{title:'队列标识管理'},
    component:()=>import('@/views/taskQuene/tag.vue')
  },
  {
    path:'/contorl_type',
    name:'controlType',
    meta:{title:'中控类型'},
    component:()=>import('@/views/controlType/index.vue')
  },
  {
    path: '/task_list',
    name: 'taskList',
    meta: {title: '任务列表'},
    component: () => import('@/views/taskList/index.vue') 
  },
  {
    path: '/task_config',
    name: 'taskConfig',
    meta: {title: '任务配置'},
    component: () => import('@/views/taskConfig/index.vue') 
  },
  {
    path: '/system_config',
    name: 'systemConfig',
    meta: { title: '任务命令' },
    component: () => import('@/views/system/index.vue'),
    redirect: '/system_config/admin',
    children:[
      {
        path:'admin',
        name:'admin',
        component: () => import('@/views/system/admin.vue'),
      },
      {
        path: 'task',
        name: 'task',
        component: () => import('@/views/system/task.vue')
      }
    ]
  },
  {
    path: '/config_manage',
    name: 'configManage',
    meta: { title: '配置管理' },
    component: () => import('@/views/alarmConfig/index.vue'),
    redirect: '/config_manage/user_main',
    children:[
      {
        path:'user_main',
        name:'userMain',
        meta:{title:'用户管理'},
        component: () => import('@/views/alarmConfig/userMain.vue'),
      },
      {
        path: 'alarm_config',
        name: 'alarmConfig',
        meta: {title: '报警配置'},
        component: () => import('@/views/alarmConfig/alarmConfig.vue') 
      }
    ]
  },
  {
    path:'/report',
    name:"Report",
    meta:{title:"报警统计"},
    component:()=>import('@/views/report/index.vue')
  },
  {
    path:'*',
    component:() => import('@/views/404/404.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
