<template>
  <div class="admin central-control">
    <div class="search fiexd-nav">
        <div>
          <span>排序方式:</span>
          <el-select v-model="SortDate" placeholder="请选择">
              <el-option value="addtime" label="添加时间"></el-option>
              <el-option value="acctime" label='执行时间'></el-option>
          </el-select>
        </div>
        <div>
          <span>状态:</span>
          <el-select v-model="status" placeholder="请选择">
              <el-option value="-1" label="全部"></el-option>
              <el-option value="0" label='未执行'></el-option>
              <el-option value="1" label='执行失败'></el-option>
              <el-option value="2" label='执行成功'></el-option>
          </el-select>
        </div>
        <div class="block">
          <span class="demonstration">开始时间</span>
          <el-date-picker v-model="start_date" type="date" placeholder="选择日期"></el-date-picker>
        </div>
        <div class="block">
          <span class="demonstration">结束时间</span>
          <el-date-picker v-model="end_date" type="date" placeholder="选择日期"></el-date-picker>
        </div>
        <div>
            <el-button type="primary" @click="search">搜索</el-button>
        </div>
    </div>
    <!-- 列表 -->
    <div class="el-row task-el-row">
      <el-table :data="taskList" stripe style="width: 100%" v-loading='loading'>
          <el-table-column prop="server_name" label="中控名称">
          </el-table-column>
          <el-table-column prop="cmd_name" label="命令名称"></el-table-column>
          <el-table-column prop="statusname" label="状态">
            <template slot-scope="{row}">
              <el-tag :type="row.status==2?'success':'danger'" size='small'>
                  {{row.statusname}}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="addtime" label="添加时间">
            <template slot-scope="{row}">
                {{dateFormats(row.addtime)}}  
            </template>
          </el-table-column>
          <el-table-column prop="" label="执行时间" width="180">
              <template slot-scope="{row}">
                  {{dateFormats(row.acctime)}} 
              </template>
          </el-table-column>
      </el-table>
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
  </div>
</template>
<script>
import {apiGetCmdTaskList} from '@/request/api'
import { dateFormat,repliceDate } from "@/utils/common"
export default {
  name:'Task',
  data(){
    return {
      SortDate:'addtime',
      status:'-1',
      name:'',
      start_date:'',
      end_date:"",
      taskList:[],
      loading:false,
      currentPage:1,
      total:1
    }
  },
  created(){
    this.getCmdTaskList(1)
  },
  methods:{
    search(){
      this.getCmdTaskList(1)
    },
    // 列表
    getCmdTaskList(i){
      let startDate = this.replice(this.start_date)
      let endDate = this.replice(this.end_date)
      if(startDate&&endDate){
        if(startDate>=endDate){
          this.$message.error('开始时间不能大于结束时间')
          this.loading = false
          return false
        }
      }
      if(startDate&&!endDate){
        this.$message.error('请选择结束时间')
        this.loading = false
        return false
      }
      if(!startDate&&endDate){
        this.$message.error('请选择开始时间')
        this.loading = false
        return false
      }
      let status = Number(this.status)
      this.loading = true
      apiGetCmdTaskList({
        pageindex:i,
        pagesize:20,
        order:this.SortDate,
        status:status,
        startdate:startDate,
        enddate:endDate
      }).then(res=>{
        this.taskList = res.data
        this.total = res.total
      }).catch(err =>{

      }).finally(()=>{
        this.loading=false
      })
      
    },
    nextpage(i){
      this.getCmdTaskList(i)
    },
    replice(data){
     return repliceDate(data)
    },
    dateFormats(data){
      return dateFormat(data)
    }
  }
}
</script>
<style scoped>
.admin .task-el-row{margin-top: 120px;}
.admin.central-control{margin: 60px auto 0}
.admin .fiexd-nav{left: 100px!important;}
</style>