<template>
    <div class="central-control">
        <div class="search">
            <el-button type="primary" @click="NewAddUser">新增</el-button>
        </div>
        <div class="control-box">
            <el-table :data="alarmList" stripe :loading='loading'>
                <el-table-column prop="q_name" label="队列名称" width="100">
                </el-table-column>
                <el-table-column prop="u_name" label="用户账号" width="100">
                </el-table-column>
                <el-table-column prop="ac.min_time" label="间隔时长(分钟)" width="120">
                </el-table-column>
                <el-table-column prop="ac.min_count" width="180" label="最小报警阈值"></el-table-column>
                <el-table-column prop="ac.ding_token" label="钉钉token">
                </el-table-column>
                <el-table-column label="状态" width="100">
                    <template slot-scope="{row}">
                        <el-tag :type="row.ac.status?'success':'danger'">{{row.ac.status?'启用':'禁用'}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="{row}">
                        <el-button @click="handleClick(row.ac)" :disabled="row.ac.queueid===0" type="primary" size="small">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 编辑用户弹窗 -->
            <el-dialog :title="title" :visible.sync="dialogFormVisible">
                <el-form :model="alarmConfig" class="alarm">
                    <el-form-item label="队列" label-width="120">
                        <el-select v-model="alarmConfig.queueid" placeholder="请选择队列">
                            <el-option v-for="item in queueList" :label="item.title" :value="item.id" :key="item.id+'i'"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="间隔时长" label-width="120">
                        <el-input v-model="alarmConfig.min_time" type="number" autocomplete="on"></el-input>
                    </el-form-item>
                    <el-form-item label="最小报警阈值" label-width="120">
                        <el-input v-model="alarmConfig.min_count" type="number" autocomplete="on"></el-input>
                    </el-form-item>
                    <el-form-item label="钉钉token" label-width="120">
                        <el-input v-model="alarmConfig.ding_token" autocomplete="on"></el-input>
                    </el-form-item>
                    <el-form-item label="状态" label-width="120" class="select">
                        <el-select v-model="alarmConfig.status" placeholder="请选择状态">
                            <el-option label="启用" value="true"></el-option>
                            <el-option label="禁用" value="false"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">取 消</el-button>
                    <el-button type="primary" @click="confirmSave">确 定</el-button>
                </div>
            </el-dialog>
            <div class="paging">
                <el-pagination
                    background
                    layout="prev, pager, next"
                    :page-count="pages"
                    :current-page.sync='currentPage'
                    @current-change="changePage(currentPage)"
                    >
                </el-pagination>
            </div>
        </div>
    </div>
</template>
<script>
import {apiAlarmConfigList,apiAlarmConfigSave,apiGetQueneList} from '@/request/api'
import {getLocal} from '@/utils/storage'
import {dateFormat} from '@/utils/common'
export default {
    name:'userMain',
    data(){
        return {
            alarmList:[],
            queueid:'',
            alarmConfig:{
                id:'',
                min_count:'',
                queueid:'',
                min_time:'',
                ding_token:'',
                status:''
            },
            dialogFormVisible:false,
            title:'',
            pages:0,
            currentPage:1,//当前页
            loading:false,
            queueList:[] // 队列列表
        }
    },
    computed:{
        userId(){
            return this.$store.state.userId || getLocal('userId') || ''
        }
    },
    watch:{
        dialogFormVisible(val){
            if(!val){
                this.alarmConfig = {
                    id:'',
                    min_count:'',
                    queueid:'',
                    min_time:'',
                    ding_token:'',
                    status:''
                }
            }
        },
    },
    created(){
        this.getAlarmList(1)
        this.getQueueList() //获取队列列表
    },
    methods:{
        // 状态
        NewAddUser(){
            this.dialogFormVisible=true
            this.title = '添加配置'
            this.getQueueList()
        },
        confirmSave(){
            this.userSave(this.alarmConfig)
        },
        handleClick(row){
            this.dialogFormVisible=true
            this.title = '编辑配置'
            let s = row.status.toString()
            this.alarmConfig = {
                id:row.id,
                min_count:row.min_count,
                queueid:row.queueid,
                min_time:row.min_time,
                ding_token:row.ding_token,
                status:s
            }
        },
        // 保存编辑api
        userSave(row){
            let id = row.id?row.id:-1;
            let status = JSON.parse(row.status)
            let minTime = typeof row.min_time==='string'?Number(row.min_time):row.min_time
            let minCount = typeof row.min_count==='string'?Number(row.min_count):row.min_count
            apiAlarmConfigSave({
                id:id,
                userid:this.userId,
                queueid:row.queueid,
                min_time:minTime,
                min_count:minCount,
                status:status,
                ding_token:row.ding_token
            }).then(res =>{
                if(!res.data.state){
                    this.$message.error('添加失败')
                    return false
                }
                this.getAlarmList(this.currentPage)
                this.dialogFormVisible = false
                this.$message.success('保存成功')
            }).catch(err =>{
                console.log(err)
            })
        },
        // 选择队列ID
        getQueueList(){
            apiGetQueneList({
                page_index:1,
                page_size:20000,
                user_id:this.userId
            }).then(res =>{
                this.queueList = res.data
            })
        },
        changePage(index){
            this.getAlarmList(index)
        },
        // 获取用户列表
        getAlarmList (index){
            apiAlarmConfigList({
                userid:this.userId,
                pageindex:index,
                pagesize:15,
            }).then(res =>{
                if(res.data.state){
                    this.alarmList = res.data.data
                    this.pages = res.data.total
                }else{
                    this.$message.error(res.data.msg)
                }
            }).catch(err =>{
                this.$message.error('网络卡壳')
            })
        },
        // 格式化时间
        dateFormat(date){
            return dateFormat(date)
        }
    },
}
</script>
<style scoped>
    .central-control .table{width: 900px;margin: 10px auto 0}
    .control-box .form-height{height: 680px;}
    .paging{
        text-align: center;
        margin-top:20px;
    }
</style>