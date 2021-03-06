import {post,get} from '../http'

// 登录
export const postLogin = p =>post('/api/login',p)

// 中控列表
export const apiGetControlList = p =>post('/api/zk/list',p)

// 分配中控
export const apiDisControl = p => post('/zk/list',p)

// 获取普通管理员、任务队列、服务器类型列表
export const apiGetZkUserList = () =>get('/api/zk/together')

// 中控管理批量编辑
export const apiEditZkUpdate = p =>post('/api/zk/update',p)

// 用户维护---用户列表
export const apiGetUserList = p =>post('/api/user/list',p)

// 新增用户
export const apiSaveUser = p => post('/api/user/save',p)

// 分配中控
export const apiDistrControl = p =>post('/api/zk/add',p)

// 队列标识列表
export const apiGetQueneList = p =>post('/api/queue/list',p)

// 新增队列标识
export const apiCreateQuene = p => post('/api/queue/save',p)

//中控类型列表
export const apiGetServerList = p =>post('api/servertype/list',p)

// 任务列表
export const apiGetTaskList = p =>get('/api/mongo_queue_list',p)

// 修改任务
export const updateTask = p =>get('api/reset_task_state',p)

//中控分组
export const setControlGroup = p =>post('api/zk/group',p)

// 队列标识分组
export const setQueueGroup = p =>post('api/queue/group',p)

// 解散中控
export const dissControlGroup = p =>post('/api/zk/dissolve',p)

// 解散队列标识分组
export const diffQueueGroup = p =>post('/api/queue/dissolve',p)

// 移除中控
export const removeContorlItem = p => post('/api/zk/dissolve_other',p)

// 移除队列标识
export const removeQueueItem = p =>post('api/queue/dissolve_other',p)

// 队列标签列表
export const getQueueTagList = p =>post('/api/queuetag/list',p)

// 队列标签的新增或修改
export const apiSaveQueueTag = p =>post('/api/queuetag/save',p)

// 队列标签的删除
export const apiDeleteQueueTag = p =>post('/api/queuetag/delete',p)

// 判断是否删除队列标签
export const apiIsDeleteQueueTag = p =>post('/api/queuetag/isdelete',p)

// 获取队列标签
export const apiGetTagList = p =>post('/api/taglist',p)

// 积压任务
export const apiGetWillDoTask = p =>get('api/get_will_do_task',p)

// 删除积压任务
export const apiDeleteWillDoTask = p =>get('/api/delete_will_do_task',p)

// 获取备注
export const apiGetRemark = p => get('/api/zk/partinfo',p)

export const apiGetAddCmdTask = p => post('/api/addcmdtask',p)

// 命令任务
export const apiGetCmdTaskList = p => post('/api/cmdtask/list',p)

// 命令列表
export const apiGetCmdList = p => post('/api/cmd/list',p)

// 编辑命令 （新增和修改）
export const apiSaveCmd = p => post('/api/cmd/save',p)

//删除命令
export const apiDeleteCmd = p => post('/api/cmd/delete',p)

// 任务配置列表
export const apiTaskConfigList = p =>post('/api/taskrule/list',p)

// 新增任务配置
export const apiSaveTaskConfig = p =>post('/api/taskrule/save',p)

// 删除任务配置
export const apiDeleteTaskConfig = p =>post('/api/taskrule/delete',p)

// 去最近中控使用时间
export const apiGetZkUserTime = p =>post('/api/zk/usetime',p)

// 报警配置查询
export const apiAlarmConfigList = p =>post('/alarm/config/list',p)

// 报警配置保存
export const apiAlarmConfigSave = p =>post('/api/alarmconfig/save',p)

export const apiAlarmStaList = p =>post('/alarm/stat',p)

// 任务队列总数量
export const apiGetQueneAllCount = p => get('/api/get_queue_all_task',p)