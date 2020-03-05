<template>
  <div class="admin central-control">
    <div class="search fiexd-nav">
        <div>
          <span>排序方式:</span>
          <el-select v-model="SortDate" placeholder="请选择">
              <el-option value="" label="默认排序"></el-option>
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
    <div class="el-row">
      <el-table :data="taskList" stripe style="width: 100%" v-loading='loading'>
          <el-table-column prop="name" label="任务名称">
          </el-table-column>
          <el-table-column prop="cmd_text" label="命令内容"></el-table-column>
          <el-table-column prop="remark" label="备注"></el-table-column>
          <el-table-column prop="addtime" label="时间">
            <template slot-scope="{row}">
                {{dateFormats(row.addtime)}}  
            </template>
          </el-table-column>
          <el-table-column prop="" label="操作" width="180">
              <template slot-scope="{row}">
                  <el-button type="primary" size="mini" @click="editAdmin(row)">编辑</el-button>
                  <el-button type="primary" size="mini" @click="deleteAdmin(row)">删除</el-button>
              </template>
          </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import {apiGetCmdTaskList} from '@/request/api'
export default {
  name:'Task',
  data(){
    return {
      SortDate:'',
      status:'-1',
      name:'',
      start_date:'',
      end_date:"",
      taskList:[],
      loading:false
    }
  },
  created(){
    this.getCmdTaskList()
  },
  methods:{
    search(){

    },
    // 新增
    addCmdTask(){
      apiGetAddCmdTask({

      }).then(res =>{

      }).catch(err =>{

      })
    },
    // 列表
    getCmdTaskList(){
      this.loading = true
      apiGetCmdTaskList({
        pageindex:1,
        pagesize:20,
        order:'addtime',
        status:-1,
        startdate:'2020-2-20',
        enddate:'2020-2-26'
      }).then(res=>{
        console.log(res)
      }).catch(err =>{

      }).finally(()=>{
        this.loading=false
      })
      
    },
  }
}
</script>
<style scoped>
.admin.central-control{margin: 60px auto 0}
.admin .fiexd-nav{left: 100px!important;}
</style>