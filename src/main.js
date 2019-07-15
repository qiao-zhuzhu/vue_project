import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入字体图标
import './assets/fonts/iconfont.css'
//导入全局样式
import './assets/css/global.css'
//导入axios
import axios from 'axios'
//导入组件vue-table-with-tree-grid
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑的样式文件
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'


axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

//在请求拦截器中给每次发送请求的request添加令牌
axios.interceptors.request.use(function(config) {
    // console.log(config.url)
    //添加Authorization这个令牌字段
    config.headers.Authorization = sessionStorage.getItem("token");
    return config;
})


Vue.prototype.$http = axios


Vue.config.productionTip = false

//将TreeTable组件进行全局注册
Vue.component("tree-table", TreeTable);

Vue.use(VueQuillEditor);


//创建过滤器将秒数过滤为年月日，时分秒
Vue.filter('dateFormat', function(originVal) {
    const dt = new Date(originVal)
    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')

    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')

    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})


new Vue({
    router,
    render: h => h(App)
}).$mount('#app')