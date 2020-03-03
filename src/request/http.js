import axios from 'axios';
import router from '../router'
import {Message} from 'element-ui';
import {getLocal} from "../utils/storage/local";
// 环境切换
let base_url = 'http://botdemoapi.anyelse.com'//'http://api.okaymw.com' //'http://api.okaymw.com/'
if (process.env.NODE_ENV === 'production') {
    if (process.env.VUE_APP_BASE_URL) {
        base_url = process.env.VUE_APP_BASE_URL
    } else {
        base_url = 'http://botapi.anyelse.com';
    }
}
// create an axios instance
const service = axios.create({
    baseURL: base_url, // api 的 base_url
    timeout: 10000 // request timeout
});
// 请求头
service.defaults.headers.post['Content-Type'] = 'application/json';
service.defaults.headers.post['cache-control'] = 'no-cache';
// 请求拦截器
service.interceptors.request.use(
    config => {
        let mongoApi = ['/api/mongo_queue_list','api/mongo_taskinfo','api/check_lock_state','api/get_will_do_task','api/delete_will_do_task','api/delete_no_get_task','api/gettask','api/update_task_state']
        if(mongoApi.includes(config.url)){
            config.baseURL = 'http://botapi.anyelse.com'
        }else{
            config.baseURL = 'http://botdemoapi.anyelse.com' //'http://api.okaymw.com'
        }
        let apiUrl = ['/api/mongo_queue_list','/api/zk/list','/api/queuetag/list']
        if(apiUrl.includes(config.url)){
            window.scrollTo(0, 0)
        }
        // return new Promise(resolve => {
            let userId = getLocal('userId')
            let path = ['/login']
            let _path = router.currentRoute.path
            if(path.indexOf(_path) === -1){
                if(userId){
                    return config
                }else{
                   router.replace({
                       path:'/login'
                   })
                }
            }else{
                return config
            }
        // });
    },
    error => {
        return Promise.error(error);
    }
);
// 响应拦截器
service.interceptors.response.use(
    (response) => {
        if (response.status === 200) {
            return Promise.resolve(response);
        } else {
            return Promise.reject(response);
        }
    },
    // 服务器状态码不是200的情况
    (error) => {
        Message({
            message:error,
            type:'error'
        })
        // return Promise.reject(error);
    }
);

/**
 * get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function get(url, params) {

    return new Promise((resolve, reject) => {
        service.get(url, {
            params: params
        }).then(res => {
            resolve(res.data);
        }).catch(err => {
            reject(err.data)
        })
    });
}

/**
 * post方法，对应post请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function post(url, params) {
    return new Promise((resolve, reject) => {
        service.post(url, JSON.stringify(params))
            .then(res => {
                resolve(res.data);
            }).catch(err => {
                reject(err.data)
            })
    });
}
