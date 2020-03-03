<template>
  <div class="admin central-control">
    <div class="search fiexd-nav">
        <div>
          <span>命令名称:</span>
          <el-input v-model="name" placeholder="请输入内容"></el-input>
        </div>
        <!-- <div>
            <span>命令内容:</span>
            <el-input v-model="cmdText" placeholder="请输入内容"></el-input>
        </div> -->
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
    <div class="addAdmin">
      <el-button type="primary" class="btn" @click="addNewAdmin">新增</el-button>
    </div>
    <!-- 新增 -->
      <el-dialog :title="title" :visible.sync="dialogFormVisible">
        <el-form :model="addAdmin">
            <el-form-item label="命令名称" label-width="120">
                <el-input v-model="addAdmin.name" autocomplete="on"></el-input>
            </el-form-item>
            <el-form-item label="命令内容" label-width="120">
                <el-input v-model="addAdmin.cmd_text" autocomplete="on"></el-input>
            </el-form-item>
            <el-form-item label="备注" label-width="120" class="select">
                <el-input v-model="addAdmin.remark" autocomplete="on"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveCmd()">确 定</el-button>
        </div>
    </el-dialog>
    <div class="el-row">
      <el-table :data="adminList" stripe style="width: 100%" v-loading='loading'>
          <el-table-column prop="name" label="任务名称">
              <!-- <template slot-scope="{row}">
                  <el-tag :type="row.state==3?'success':'danger'" size='small'>
                      {{row.state|state}}
                  </el-tag>
              </template> -->
          </el-table-column>
          <el-table-column prop="cmd_text" label="命令内容"></el-table-column>
          <el-table-column prop="remark" label="备注"></el-table-column>
          <el-table-column prop="addtime" label="时间">
            <template slot-scope="{row}">
                {{dateFormats(row.addtime)}}  
            </template>
          </el-table-column>
          <!-- <el-table-column prop="cmd_text" label="命令内容"></el-table-column>
          <el-table-column prop="cmd_text" label="命令内容"></el-table-column> -->
      </el-table>
    </div>
    <div class="pages">
      <el-pagination
        background
        hide-on-single-page
        layout="prev, pager, next"
        :current-page.sync='currentPage'
        :page-count='pages'
        @current-change='goPage(currentPage)'>
      </el-pagination>
    </div>
  </div>
</template>
<script>
import {apiGetAddCmdTask,apiGetCmdTaskList,apiGetCmdList,apiSaveCmd,apiDeleteCmd} from '@/request/api'
import { dateFormat } from "@/utils/common";
export default {
  name:"admin",
  data(){
    return{
      adminList:[],
      loading:true,
      dialogFormVisible:false,
      title:'新增',
      addAdmin:{
        name:'',
        cmd_text:'',
        remark:''
      },
      name:"",
      cmdText:'',
      start_date:"",
      end_date:'',
      currentPage:1,//当前页
      pages: 0, //分页
    }
  },
  created(){
    // this.getCmdTaskList()
    this.currentPage = 1
    let i = this.currentPage
    this.getCmdList(i)
  },
  methods:{
    // getCmdTaskList(){
    //   apiGetCmdTaskList({
    //     pageindex:'1',
    //     pagesize:'20',
    //     order:'addtime',
    //     status:-1,
    //     startdate:start_date,
    //     enddate:'2020-2-26'
    //   }).then(res=>{
    //     console.log(res)
    //   })
    // },
    getCmdList(i){
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
      apiGetCmdList({
        pageindex:i,
        pagesize:20,
        name:this.name,
        startdate:startDate,
        enddate:endDate
      }).then(res =>{
        this.adminList = res.data
      }).catch(err =>{

      }).finally(()=>{
        this.loading = false
      })
    },
    search(){
      this.currentPage = 1
      let i = this.currentPage
      this.getCmdList(i)
    },
    replice(data){
      if(data){
        let time8 = 1000*60*(8*60)
        let newData = data.getTime()+time8
        data = new Date(newData)
        data = data.toISOString().split('T')[0]
      }else{
        data = ''
      }
      return data
    },
    goPage(i) {
      this.getCmdList(i);
    },
    addNewAdmin(){
      this.addAdmin = {
        name:"",
        cmd_text:"",
        remark:""
      }
      this.dialogFormVisible = true
    },
    saveCmd(id){
      id = id?id:0
      console.log(id)
      apiSaveCmd({
        id:id,
        name:this.addAdmin.name,
        cmd_text:this.addAdmin.cmd_text,
        remark:this.addAdmin.remark
      }).then(res =>{
        console.log(res)
        if(res.data.state){
          this.$message.success('新增成功')
          this.dialogFormVisible = false
          this.getCmdList(1)
        }else{
          this.$message.error('新增失败')
        }
      }).catch(err =>{
        this.$message.error('新增失败')
      }).finally(()=>{

      })
    },
    dateFormats(data){
      return dateFormat(data)
    }
  }
}
</script>
<style scoped>
  .admin.central-control{margin: 60px auto 0}
  .admin .fiexd-nav{left: 100px!important;}
  .admin .addAdmin .btn{margin-top: 64px}
  .pages{text-align: center;margin-top: 10px;}
</style>