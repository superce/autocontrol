<template>
    <div class="central-control">
        <div class="search">
            <div class="account">
                <span>账号:</span>
                <el-input v-model="name" placeholder="请输入内容"></el-input>
            </div>
            <el-button type="primary" @click="search">搜索</el-button>
            <el-button type="primary" @click="NewAddUser">新增</el-button>
        </div>
        <div class="control-box">
            <el-table :data="alarmList" stripe :loading='loading'>
                <el-table-column prop="ac.queueid" label="队列ID" width="100">
                </el-table-column>
                <el-table-column prop="ac.user_id" label="用户ID" width="100">
                </el-table-column>
                <el-table-column prop="ac.min_count" label="间隔时长(分钟)" width="120">
                </el-table-column>
                <el-table-column prop="ac.min_time" width="180" label="最小报警阈值"></el-table-column>
                <el-table-column prop="ac.ding_token" label="钉钉token">
                </el-table-column>
                <el-table-column label="状态" width="100">
                    <template slot-scope="{row}">
                        <el-tag :type="row.ac.status?'success':'danger'">{{row.ac.status?'启用':'禁用'}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="{row}">
                        <el-button @click="handleClick(row.ac)" type="text" size="small">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 编辑用户弹窗 -->
            <el-dialog :title="title" :visible.sync="dialogFormVisible">
                <el-form :model="alarmConfig">
                    <el-form-item label="队列ID" label-width="120">
                        <el-input v-model="alarmConfig.queueid" autocomplete="on"></el-input>
                    </el-form-item>
                    <el-form-item label="间隔时长" label-width="120">
                        <el-input v-model="alarmConfig.min_time" autocomplete="on"></el-input>
                    </el-form-item>
                    <el-form-item label="最小报警阈值" label-width="120">
                        <el-input v-model="alarmConfig.min_count" autocomplete="on"></el-input>
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
import {apiAlarmConfigList,apiAlarmConfigSave} from '@/request/api'
import {getLocal} from '@/utils/storage'
import {dateFormat} from '@/utils/common'
export default {
    name:'userMain',
    data(){
        return {
            alarmList:[],
            name:'',
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
    },
    methods:{
        // 状态
        NewAddUser(){
            this.dialogFormVisible=true
            this.title = '添加配置'
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
            let status = JSON.parse(row.status)
            apiAlarmConfigSave({
                id:row.id,
                userid:this.userId,
                queueid:row.queueid,
                min_time:row.min_time,
                min_count:row.min_count,
                status:status,
                ding_token:row.ding_token
            }).then(res =>{
                if(res.data.state==='error'){
                    this.$message.error(res.data.msg)
                    return false
                }
                this.getAlarmList(1)
                this.dialogFormVisible = false
                this.$message.success('保存成功')
            }).catch(err =>{
                console.log(err)
            })
        },
        search(){
            this.getAlarmList(1)
        },
        changePage(index){
            this.getAlarmList(index)
        },
        // 获取用户列表
        getAlarmList(index){
            apiAlarmConfigList({
                userid:this.userId,
                pageindex:index,
                pagesize:15,
            }).then(res =>{
                console.log(res)
                this.alarmList = res.data.data
                this.pages = res.data.total
            }).catch(err =>{

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
    .control-box .select{display: flex;flex-direction: column;align-items: flex-start}
    .control-box .form-height{height: 680px;}
    .paging{
        text-align: center;
        margin-top:20px;
    }
</style>