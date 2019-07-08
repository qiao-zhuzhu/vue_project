import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/user/Users.vue'

Vue.use(Router)

const router = new Router({
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', component: Login },
        { path: '/home', component: Home, redirect: '/welcome', children: [{ path: '/welcome', component: Welcome }, { path: '/users', component: Users }] }
    ]
})

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
    // to 表示将要访问的路径
    // from 表示从哪个路径跳转来
    // next 是一个函数 表示放行 下一个要做的操作
    // next（） 放行 next('/login')
    if (to.path === '/login') {
        return next();
    }

    //其他路由都需要权限 获取token
    const tokenStr = window.sessionStorage.getItem('token');

    // 判断token是否存在，如果存在，登录过，直接放行，如果不存在，表示用户没登录，强制用户去登录
    if (!tokenStr) {
        return next('/login');
    } else {
        return next();
    }
})

// 暴露路由对象
export default router;