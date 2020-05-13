<template>
    <div class="will-task">
        <el-dialog :visible.sync="isWillTask">
            <el-table :data="tableData" stripe style="width: 100%">
                <el-table-column prop="name" label="中控名称">
                </el-table-column>
                <el-table-column prop="date" label="使用时间(小时)">
                    <template slot-scope="{row}">
                        {{useTime(row.use_time/60)}}
                    </template>
                </el-table-column>
                <el-table-column prop="date" label="使用率(%)">
                    <template slot-scope="{row}">
                        {{useTimePencent(row.use_time/60)}}
                    </template>
                </el-table-column>
                <el-table-column prop="date" label="添加时间">
                    <template slot-scope="{row}">
                        {{dateFormats(row.adddate)}}
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>   

<script>
import {apiGetZkUserTime} from '@/request/api'
import { dateFormat } from "@/utils/common";
export default {
    data(){
        return {
            isWillTask:false, // 积压任务弹窗
            tableData:[], //积压任务列表弹窗
        }
    },
    methods:{
        getZkUserTime(id,name,remark){
            apiGetZkUserTime({
                id:id
            }).then(res =>{
                if(res.data.state){
                    this.isWillTask = true
                    res.data.data.forEach(el => {
                        el.name = name
                        el.remark = remark
                    });
                    this.tableData=res.data.data
                }else{
                    this.$messege.error('')
                }
            }).catch(e =>{
                this.$messege.error(e)
            })
        },
        useTime(t){
            return t.toFixed(2)
        },
        useTimePencent(t){
            let g = t/24*100
            g = Math.ceil(g)
            return g+'%'
        },
        dateFormats(date){
            return dateFormat(date)
        },
    }
}
</script>