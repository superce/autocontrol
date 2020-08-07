<template>
    <div class="will-task">
        <el-dialog :visible.sync="isWillTask">
            <el-table :data="WillTaskList" style="width: 100%" height="550" ref='controlTable' stripe>
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
                <el-table-column :label="`积压任务数量: ${TaskCount}`" prop="name"></el-table-column>
            </el-table>
            <el-button :type="WillTaskList.length===0?'info':'primary'" class="delete-will-do" :disabled="WillTaskList.length===0" @click="deleteWillDoTask">删除积压任务</el-button>
        </el-dialog>
    </div>
</template>   

<script>
import {apiCreateQuene,setQueueGroup,diffQueueGroup,removeQueueItem,apiGetWillDoTask,apiDeleteWillDoTask} from '@/request/api'
import { dateFormat } from "@/utils/common";
export default {
    data(){
        return {
            isWillTask:false, // 积压任务弹窗
            WillTaskList:[], //积压任务列表弹窗
            TaskCount:0,
            queueid:0,
            tasktagId:0
        }
    },
    methods:{
        // 查看积压任务
        willTask(id,tagid){
            this.queueid = id
            this.tasktagId = tagid
            apiGetWillDoTask({
                queueid:id,
                tag:tagid
            }).then(res =>{
                if(res.state){
                    this.TaskCount = res.count
                    this.WillTaskList = res.data
                    this.isWillTask = true
                }
            }).catch(err =>{

            })
        },
        // 删除积压任务
        deleteWillDoTask(){
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
            return m>9?m:'0'+m
        },
        deleteApi(){
            let date = new Date()
            let year = date.getFullYear()
            let m = date.getMonth()+1
            let day = date.getDate()
            let time = `${year}-${this.timeAdd0(m)}-${this.timeAdd0(day)}`
            console.log(time)
            apiDeleteWillDoTask({
                queueid:this.queueid,
                tag:this.tasktagId,
                date:time
            }).then(res =>{
                if(res.state){
                    this.isWillTask = false
                }
            }).catch(err =>{
                this.$message.error(err.msg)
            })
        },
        dateFormats(date){
            return dateFormat(date)
        },
    }
}
</script>
<style scoped>
.delete-will-do{
    margin-top: 10px;
}
</style>