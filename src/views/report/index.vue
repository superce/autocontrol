<template>
    <div class="central-control">
        <div class="search fiexd-nav">
            <div>
                <span>统计方式:</span>
                <el-select v-model="stat" @change='search' placeholder="请选择">
                    <el-option value="1" label="队列"></el-option>
                    <el-option value="2" label='标签'></el-option>
                    <el-option value="3" label='中控'></el-option>
                </el-select>
            </div>
        </div>
        <div class="control-box">
            <div class="el-row">
                <el-table :data="staList.data" stripe v-loading='loading'>
                    <el-table-column prop="queue_name" label="队列名称"></el-table-column>
                    <el-table-column v-if="stat==='2'" prop="tag_name" label="标签名称"></el-table-column>
                    <el-table-column v-if="stat==='3'" prop="server_name" label="中控名称"></el-table-column>
                    <el-table-column prop="count" label="报警数量"></el-table-column>
                    <el-table-column prop="max_add_time" label="最后报警时间">
                        <template slot-scope="{row}">
                            {{dateFormats(row.max_add_time)}}
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <!-- 分页 -->
            <div class="pages">
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
import {apiAlarmStaList} from '@/request/api'
import {getLocal} from '@/utils/storage'
import { dateFormat } from "@/utils/common";
export default {
    name:"Report",
    data(){
        return{
            staList:[],
            stat:'1',
            currentPage:1,
            pages:0,
            loading:false
        }
    },
    created(){
        this.getAlarmStaList(1)
    },
    computed:{
        userId(){
            return this.$store.state.userId || getLocal('userId') || ''
        }
    },
    methods:{
        search(){
            this.getAlarmStaList(1)
            this.currentPage = 1
        },
        changePage(i){
            this.getAlarmStaList(i)
        },
        getAlarmStaList(pageIndex){
            this.loading = true
            let dimen = Number(this.stat)
            apiAlarmStaList({
                userid:this.userId,
                pageindex:pageIndex,
                pagesize:20,
                dimension:dimen
            }).then(res =>{
                if(res.data.state){
                    this.staList = res.data
                    this.pages = res.data.total
                }else{
                    this.$message.error(res.data.msg)
                }
            }).catch(err =>{
                this.$message.error('网络卡壳')
            }).finally(()=>{
                this.loading = false
            })
        },
        dateFormats(date){
            return dateFormat(date)
        }
    }
}
</script>
<style scoped>
.control-box{margin-top: 120px;}
</style>