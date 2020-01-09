<template>
    <div class="central-control">
        <div class="search" :class="isScroll?'fiexd-nav':''">
            <div>
                <span>队列标识:</span>
                <el-select v-model="taskTitle" @change='search' filterable placeholder="请选择">
                    <el-option
                        v-for="(item,index) in queueList"
                        :key="index+'u'"
                        :label="item.title"
                        :value="item.id"
                        >
                    </el-option>
                </el-select>
            </div>
            <div>
                <span>状态:</span>
                <el-select v-model="searchState" @change='search' placeholder="请选择">
                    <el-option label="全部" value=""></el-option>
                    <el-option label="已完成" value="3"></el-option>
                    <el-option label="执行中" value="2"></el-option>
                    <el-option label="已取走" value="1"></el-option>
                    <el-option label="失败" value="-1"></el-option>
                    <el-option label="执行超时" value="-2"></el-option>
                    <el-option label="未执行" value="0"></el-option>
                </el-select>
            </div>
            <div>
                <span>队列标签:</span>
                <el-select v-model="taskTagId" :disabled='tagList.length===0'  @change='searchTag' filterable placeholder="请选择">
                    <el-option label="全部" value=""></el-option>
                    <el-option
                        v-for="(item,index) in tagList"
                        :key="index+'tag'"
                        :label="item.tag_name"
                        :value="item.id"
                        >
                    </el-option>
                </el-select>
            </div>
            <!-- <el-button type="primary" @click="search">搜索</el-button> -->
        </div>
        <div class="control-box">
            <div class="el-row">
                <el-table :data="taskList" stripe style="width: 100%" v-loading='loading'>
                    <el-table-column prop="taskID" label="任务id" width='400'></el-table-column>
                    <el-table-column prop="name" label="任务名称"></el-table-column>
                    <!-- <el-table-column prop="pageurl" label="页面地址"></el-table-column> -->
                    <el-table-column prop="state" label="状态" width="100">
                        <template slot-scope="{row}">
                            <el-tag :type="row.state==3?'success':'danger'" size='small'>
                                {{row.state|state}}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="jsLink" label="JavaScript"></el-table-column>
                    <el-table-column prop="machineID" label="中控"></el-table-column>
                    <el-table-column prop="tagName" label="队列标签" width="150">
                        <template slot-scope="{row}">
                            <!-- {{contrastQunen()}} -->
                            {{filterTag(row.tag)}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="timeout" label="沉默时间(s)" width="150"></el-table-column>
                    <el-table-column prop="addDate" label="添加时间" width="180">
                        <template slot-scope="{row}">
                            {{dateFormats(row.addDate)}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="pubDate" label="执行时间" width="180">
                        <template slot-scope="{row}">
                            {{dateFormats(row.pubDate)}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="" label="操作" width="180">
                        <template slot-scope="{row}">
                            <el-button :type="row.state==0?'info':'primary'" @click="editTask(row)">重置</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 分页 -->
            <div class="page" v-if="taskList.length>0">
                <el-pagination
                    background
                    layout="prev, pager, next"
                    :current-page.sync='currentPage'
                    @current-change='nextpage(currentPage)'
                    hide-on-single-page
                    :page-count="total">
                </el-pagination>
            </div>
        </div>
    </div>
</template>
<script>
import {apiGetTaskList,apiGetQueneList,updateTask,apiGetTagList} from '@/request/api'
import {getLocal} from '@/utils/storage'
import { dateFormat } from "@/utils/common";
export default {
    props:['isScroll'],
    name:'taskList',
    data(){
        return {
            taskList:[],
            taskTagId:'', // 搜索tagId
            queueList:[],
            formTask:{
                pageurl:'',
                state:'',
                js:''
            },
            options:[
                {label:'已执行',value:1},
                {label:'未执行',value:0}
            ],
            // dialogTaskList:false,
            total:1,
            pagesize:20,
            currentPage:1,
            loading:false,
            taskTitle:'', // 搜索条件队列id
            searchState:'',
            tagList:[] //标签列表
        }
    },
    created(){
        this.getquneneList()
    },
    computed:{
        userId(){
            return this.$store.state.userId || getLocal('userId') || ''
        }
    },
    methods:{
        search(){
            this.currentPage = 1
            this.getTaskList(this.currentPage,this.taskTitle)
        },
        // 通过标签队列
        searchTag(val){
            this.currentPage = 1
            this.getTaskList(this.currentPage,this.taskTitle,val)
        },
        nextpage(i){ // 翻页
            this.getTaskList(i,this.taskTitle)
        },
        //获取任务列表
        getTaskList(i,id,tag){ 
            this.loading = true
            apiGetTaskList({
                page:i,
                pagesize:15,
                queueid:id,
                state:this.searchState,
                tag:tag
            }).then(res =>{
                this.taskList = res.data
                this.total = res.pagecount
                this.getTagList(id)
            }).catch(err =>{
                console.log(err)
            }).finally(()=>{
                this.loading = false
            })
        },
        // 对比队列标识列表,取队列标题
        // contrastQunen(id){
        //     let queue = this.taskTitle
        //     this.queueList.forEach(item =>{
        //         if(item.id === this.taskTitle){
        //             queue = item.title
        //         }
        //     })
        //     return queue
        // },
        // 队列标识列表
        getquneneList(){
            apiGetQueneList({
                page_index:1,
                page_size:20000,
                user_id:this.userId
            }).then(res =>{
                if(res.data.state === 'error'){
                    this.$message.error(res.data.msg)
                }else{
                    this.queueList = res.data
                    let one = res.data[0].id
                    this.taskTitle = one
                    this.getTaskList(1,one)
                }
            }).catch(err =>{

            })
        },
        // 获取tag列表
        getTagList(queueid){
            apiGetTagList({
                task_queue_id:queueid
            }).then(res=>{
                if(res.state){
                    this.tagList = res.taglist
                }else{
                    this.tagList=[]
                }
            }).catch(err =>{
                console.log(err)
            })
        },
        editTask(row){ // 编辑
            if(row.state === 0){
                this.$message.error('任务状态未执行,不可重置')
                return false
            }
            this.$confirm('重置后任务状态改为未执行，任务将被重新执行', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.onSubmit(row)
                }).catch(() => {
          
                });
            // this.dialogTaskList = true
        },
        onSubmit(row){
            let form = this.formTask
            updateTask({
                tag:row.tag,
                queueid:this.taskTitle,
                taskid:row.taskID,
                accountid:row.accountID
            }).then(res =>{
                this.getTaskList(this.currentPage,this.taskTitle)
                this.$message.success('修改成功')
            }).catch(err =>{
                console.log(err)
            })
        },
        dateFormats(date){
            let da = dateFormat(date)
            if(da.indexOf('.')!==-1){
                da = da.split('.')[0]
            }
            return da
        },
        // 对比添加标签
        filterTag(id){
            let tagName = this.tagList.find(tag =>{
                return id === tag.id
            }) 
            let name = '--'
            if(tagName){
                name = tagName.tag_name
            }
            return name
        }

    },
    filters:{
        state(val){
            switch(val){
                case 0:
                    return '未执行';
                case 1:
                    return '已取走';
                case 2:
                    return '执行中';
                case 3:
                    return '已完成'
                case -1:
                    return '失败';
                case -2:
                    return '执行超时';
                case -3:
                    return '执行超时';
            }
        }
    }
}
</script>
<style scoped>
.dialog-edit{width: 500px;margin: 0 auto}
.page{text-align: center;margin: 10px 0}
.form-item{display: flex}
</style>