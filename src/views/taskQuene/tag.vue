<template>
    <div class="central-control">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/task_quene' }">队列标识管理</el-breadcrumb-item>
            <el-breadcrumb-item>标签列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 创建队列标识弹窗 -->
        <div class="create">
            <el-dialog :visible.sync="create" title="新增标签">
                <el-form label-width="100px" :model="createTag" :rules='rules' ref="createTag">
                    <el-form-item label="标签名称" prop="name">
                        <el-input v-model="createTag.name"></el-input>
                    </el-form-item>
                    <el-form-item label="备注">
                        <el-input v-model="createTag.remark"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="create = false">取消</el-button>
                        <el-button type="primary" @click="createTagSave('createTag')" @keyup.enter="createTagSave('createTag')">保存</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
        <!-- 列表 -->
        <div class="tag-list">
            <el-row>
                <el-button type="primary" @click="create=true">新增标签</el-button>
                <el-button :type="deleteTagId.length>0?'primary':'info'" @click="isDeleteTag">删除标签</el-button>
            </el-row>
            <el-table :data="tagList" stripe style="width: 100%" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="id" label="标签ID" width="70"></el-table-column>
                <el-table-column prop="tag_name" label="标签"></el-table-column>
                <el-table-column prop="queue_name" label="队列标识"></el-table-column>
                <el-table-column prop="remark" label="备注"></el-table-column>
                <el-table-column prop="addtime" label="时间">
                    <template slot-scope="{row}">
                        {{dateFormats(row.addtime)}}
                    </template>
                </el-table-column>
                <el-table-column prop="addtime" label="操作">
                    <template slot-scope="{row}">
                        <el-button type="primary" size="mini" @click="editControl(row)">修改</el-button>
                        <el-button type="primary" size="mini" @click="disControl(row)" :loading='row.loading'>分配中控</el-button>
                        <el-button type="primary" size="mini" @click="willTask(row.task_queue_id,row.id)">积压任务<span class="span-id">(id:{{row.id}})</span></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 积压任务弹窗 -->
        <div class="will-task">
            <el-dialog :visible.sync="isWillTask">
                <el-table :data="WillTaskList" style="width: 100%" height="550" ref='controlTable' stripe @selection-change="handleSelectionChange">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand"> 
                                <el-form-item label="ID:">
                                    <span>{{ props.row.id }}</span>
                                </el-form-item>
                                <br>
                                <el-form-item label="添加时间:">
                                    <span>{{ dateFormats(props.row.addDate) }}</span>
                                </el-form-item>
                                <br>
                                <el-form-item label="执行时间:">
                                    <span>{{ dateFormats(props.row.pubDate) }}</span>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column :label="'积压任务数量:' + tagCount" prop="name"></el-table-column>
                </el-table>
                <el-button :type="WillTaskList.length===0?'info':'primary'" class="delete-will-do" :disabled="WillTaskList.length===0" @click="deleteWillDoTask">删除积压任务</el-button>
            </el-dialog>
        </div>
        <!-- 分页 -->
        <div class="pagination-page">
            <el-pagination
                background
                layout="prev, pager, next"
                :current-page.sync='currentPage'
                @current-change='nextpage(currentPage)'
                :page-count="total"
                hide-on-single-page
                >
            </el-pagination>
        </div>
        <!-- 中控列表 -->
        <dis-control ref="clickChild" :rowId='disControlId' type='queneTag' :taskId='queueId'></dis-control>
    </div>
</template>
<script>
import {getQueueTagList,apiSaveQueueTag,apiIsDeleteQueueTag,apiDeleteQueueTag,apiGetWillDoTask,apiDeleteWillDoTask} from '@/request/api'
import { dateFormat } from "@/utils/common";
import disControl from '@/components/disControl'
export default {
    components:{disControl},
    data(){
        return {
            tagList:[],
            create:false,
            createTag:{
                name:'',
                remark:''
            },
            rules:{
                name: [
                    { required: true, message: '队列标识不能为空', trigger: 'blur' },
                ],
            },
            tagId:0,
            deleteTagId:[],
            disControlId:'',
            total:0, //总页数
            currentPage:1, //当前页数
            isWillTask:false,
            WillTaskList:[],
            taskqueueid:0,
            tasktagId:0,
            tagCount:0 // 积压任务数量
        }
    },
    computed:{
        queueId(){
            return this.$route.query.id
        }
    },
    watch:{
        create(val){
            if(!val){
                this.createTag={
                    name:'',
                    remark:''
                }
                this.tagId=0
            }
        }
    },
    created(){
        this.getList()
    },
    methods:{
        nextpage(i){
            this.getList(i)
        },
        getList(i){
            const loading = this.$loading({
                lock: true,
                text: 'Loading',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.5)'
            });
            i = i?i:1
            console.log(i)
            getQueueTagList({
                page_index:i,
                page_size:20,
                task_queue_id:this.queueId,
                title:'',
                tag_name:''
            }).then(res =>{
                if(res.state){
                    let items = []
                    res.data.forEach(item =>{
                        item.loading = false
                        items.push(item)
                    })
                    this.tagList=items//res.data
                    this.total = res.total
                }
            }).catch(err =>{
                console.log(err)
            }).finally(()=>{loading.close()})
        },
        disControl(item){
            item.loading=true
            this.disControlId=item.id
            this.$refs.clickChild.getControlList()
        },
        // 保存标签
        createTagSave(){
            this.$refs.createTag.validate((valid) =>{
                if(valid){
                    let c = this.createTag
                    let queueId = this.queueId
                    queueId = Number(queueId)
                    apiSaveQueueTag({
                        id:this.tagId,
                        task_queue_id:queueId,
                        tag_name:c.name,
                        remark:c.remark
                    }).then(res =>{ 
                        if(res.data.state){ 
                            this.$message.success(res.data.msg)
                            this.create=false
                            this.getList()
                        }else{
                            this.$message.error(res.data.msg)
                        }
                    }).catch(err =>{
                        console.log(err)
                    })
                }
            })
        },
        // 判断是否删除标签
        isDeleteTag(){
            if(this.deleteTagId.length==0){
                this.$message.error('请选择标签')
            }else{
                let _this = this
                apiIsDeleteQueueTag({
                    ids:this.deleteTagId
                }).then(res =>{
                    if(res.data.state){
                        this.$confirm(res.data.msg, '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                            }).then(() => {
                                _this.deleteTag()
                            }).catch(() => {
                                
                            });
                    }else{
                        _this.deleteTag()
                    }
                }).catch(err =>{

                })
            }
        },
        deleteTag(){
            apiDeleteQueueTag({
                ids:this.deleteTagId
            }).then(res =>{
                if(res.data.state){
                    this.$message.success('删除成功')
                    this.getList()
                }
            }).catch(err =>{

            })
        },
         // 查看积压任务
        willTask(queueid,tagid){
            this.taskqueueid = queueid
            this.tasktagId = tagid
            apiGetWillDoTask({
                queueid:queueid,
                tag:tagid
            }).then(res =>{
                if(res.state){
                    this.tagCount = res.count
                    this.WillTaskList = res.data
                    this.isWillTask = true
                }
            }).catch(err =>{

            })
        },
         // 删除积压任务
        deleteWillDoTask(){
            if(this.WillTaskList.length===0){
                this.$message.error('任务为空')
                return false
            }
            this.$confirm('确认删除?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).then(() => {
                    this.deleteApi()
                }).catch(() => {
         
                });
        },
        timeAdd0(m){
            return m>10?m:'0'+m
        },
        deleteApi(){
            let date = new Date()
            let year = date.getFullYear()
            let m = date.getMonth()+1
            let day = date.getDate()
            let time = `${year}-${this.timeAdd0(m)}-${this.timeAdd0(day)}`
            console.log(time)
            apiDeleteWillDoTask({
                queueid:this.taskqueueid,
                tag:this.tasktagId,
                date:time
            }).then(res =>{
                if(res.state){
                    this.isWillTask = false
                }else{
                    this.$message.error(res.msg)
                }
            }).catch(err =>{
                this.$message.error(err.msg)
            })
        },
        // 选择中控
        handleSelectionChange(val){
            this.deleteTagId=[]
            val.forEach(item =>{
                this.deleteTagId.push(item.id)
            })
        },
        // 修改中控
        editControl(row){
            this.create=true
            this.createTag={
                name:row.tag_name,
                remark:row.remark
            }
            this.tagId=row.id
        },
        dateFormats(date){
            return dateFormat(date)
        },
    }   
}
</script>
<style scoped>
.tag-list{margin-top: 10px;}
.pagination-page{text-align: center;margin-top: 20px;}
.will-task .delete-will-do{margin-top: 10px;}
.tag-list .span-id{color: #000}
</style>