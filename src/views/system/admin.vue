<template>
  <div class="admin central-control">
    <div class="search fiexd-nav">
        <div>
          <span>命令名称:</span>
          <el-input v-model="name" placeholder="请输入内容"></el-input>
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
    <div class="addAdmin">
      <el-button type="primary" class="btn" @click="addNewAdmin">新增</el-button>
    </div>
    <!-- 新增 -->
      <el-dialog :title="title" :visible.sync="dialogFormVisible">
        <el-form :model="addAdmin" :rules="rules" ref="ruleForm">
            <el-form-item prop="name" label="命令名称" label-width="120">
                <el-input v-model="addAdmin.name" autocomplete="on"></el-input>
            </el-form-item>
            <el-form-item prop="cmd_text" label="命令内容" label-width="120">
                <el-input v-model="addAdmin.cmd_text" autocomplete="on"></el-input>
            </el-form-item>
            <el-form-item label="命令说明" label-width="120" class="select">
                <el-input v-model="addAdmin.remark" autocomplete="on"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveCmdRule('ruleForm')">确 定</el-button>
        </div>
    </el-dialog>
    <!-- 列表 -->
    <div class="el-row">
      <el-table :data="adminList" stripe style="width: 100%" v-loading='loading'>
          <el-table-column prop="name" label="命令名称">
          </el-table-column>
          <el-table-column prop="cmd_text" label="命令内容"></el-table-column>
          <el-table-column prop="remark" label="命令说明"></el-table-column>
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
import {apiGetCmdList,apiSaveCmd,apiDeleteCmd} from '@/request/api'
import { dateFormat,repliceDate } from "@/utils/common";
export default {
  name:"admin",
  data(){
    return{
      rules: {
        name: [
          { required: true, message: '请输入命令名称', trigger: 'blur' },
        ],
        cmd_text: [
          { required: true, message: '请输入命令内容', trigger: 'blur' },
        ]
      },
      adminList:[],
      loading:true,
      dialogFormVisible:false,
      title:'新增',
      addAdmin:{
        id:0,
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
    this.currentPage = 1
    let i = this.currentPage
    this.getCmdList(i)
  },
  methods:{
    // 获取列表
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
     return repliceDate(data)
    },
    goPage(i) {
      this.getCmdList(i);
    },
    addNewAdmin(){
      this.title = '新增'
      this.addAdmin = {
        id:0,
        name:"",
        cmd_text:"",
        remark:""
      }
      this.dialogFormVisible = true
    },
    // 新增
    saveCmdRule(ruleForm){
      this.$refs[ruleForm].validate((valid) => {
          if (valid) {
            this.saveCmd(0)
          } else {
            return false;
          }
        });
    },
    saveCmd(){
      apiSaveCmd({
        id:this.addAdmin.id,
        name:this.addAdmin.name,
        cmd_text:this.addAdmin.cmd_text,
        remark:this.addAdmin.remark
      }).then(res =>{
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
    // 编辑
    editAdmin(row){
      this.title = '编辑'
      this.dialogFormVisible = true
      this.addAdmin = {
        id:row.id,
        name:row.name,
        cmd_text:row.cmd_text,
        remark:row.remark
      }
    },
    // 删除
    deleteAdmin(row){
      this.$confirm('确认删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.apiDeleteAdmin(row)
        }).catch(() => {       
        });
    },
    apiDeleteAdmin(row){  
      apiDeleteCmd({
        id:row.id
      }).then(res =>{
        if(res.data.state){
          this.getCmdList(1)
          this.$message.success('删除成功')
        }else{
          this.$message.error('删除失败')
        }
      }).catch(err =>{
        this.$message.error('删除失败')
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