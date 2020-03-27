<template>
  <div class="central-control">
    <div class="search">
      <div>
        <span>任务配置名称:</span>
        <el-input v-model="taskName" placeholder="请输入内容"></el-input>
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
      <div>
        <el-button type="primary" @click="newAdd">新增</el-button>
      </div>
    </div>
    <div class="control-box">
      <div class="el-row">
        <el-table :data="taskConfigList" style="width: 100%" v-loading='loading'>
          <el-table-column prop="name" label="任务配置名称"></el-table-column>
          <el-table-column prop="interval" label="任务周期(S)"></el-table-column>
          <el-table-column prop="jslink" label="脚本地址"></el-table-column>
          <el-table-column prop="name" label="状态">
            <template slot-scope="{row}">
              <!-- {{row.state | state}} -->
              <el-tag :type="row.state===1?'success':'danger'" size="small">{{row.state|state}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop label="时间">
            <template slot-scope="{row}">{{dateFormats(row.lasttime)}}</template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row}">
              <el-button type="primary" @click="editConfig(row)">编辑</el-button>
              <el-button type="primary" @click="deleteConfig(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 新增弹窗 -->
    <el-dialog width="500px" :visible.sync="dialogAddTaskConfig" title="任务配置">
      <el-form class="demo-form-inline" :model="addTaskConfig" :rules="rules" ref="ruleForm">
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="addTaskConfig.name" placeholder="配置名称"></el-input>
        </el-form-item>
        <el-form-item label="脚本地址" prop="jslink">
          <el-input v-model="addTaskConfig.jslink" placeholder="脚本地址"></el-input>
        </el-form-item>
        <el-form-item label="任务周期(s)" prop="interval">
          <el-input type="number" v-model="addTaskConfig.interval" placeholder="任务周期"></el-input>
        </el-form-item>
        <el-form-item label="状态" v-show="isShowState">
          <el-radio-group v-model="addTaskConfig.state">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item class="task-config-button">
          <el-button type="primary" @click="submitForm('ruleForm')">保存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 分页 -->
    <div class="pagination-page">
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
</template>
<script>
import {
  apiTaskConfigList,
  apiSaveTaskConfig,
  apiDeleteTaskConfig
} from "@/request/api";
import { getLocal } from "@/utils/storage";
import { dateFormat,repliceDate } from "@/utils/common";
export default {
  name: "taskConfig",
  data() {
      var interval = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入周期'));
        }
        if (value < 300) {
            callback(new Error('周期不能小于300'));
        } else {
            callback();
        }
      };
    return {
      taskName: "",
      start_date: "",
      end_date: "",
      isState: true,
      taskConfigList: [],
      dialogAddTaskConfig: false,
      addTaskConfig: {
        id: 0,
        name: "",
        interval: 300,
        jslink: "",
        state: "1"
      },
      isShowState: false,
      rules: {
        name: [{ required: true, message: "请输入配置名称", trigger: "blur" }],
        interval: [
          { validator: interval, trigger: "blur" }
        ],
        jslink: [
          {required: true,message: "请输入脚本地址",trigger: "blur"}
        ]
      },
      loading:false,
      currentPage:1, // 當前頁
      total:0 // 分頁
    };
  },
  created() {
    this.getTaskConfigList(1);
  },
  computed: {
    userID() {
      return this.$store.state.userId || getLocal("userId") || "";
    }
  },
  methods: {
    nextpage(i){ // 翻页
        this.getTaskConfigList(i)
    },
    search(){
        this.getTaskConfigList(1)
    },
    dateFormats(data) {
      return dateFormat(data);
    },
    getTaskConfigList(pageIndex) {
        this.loading = true
        let startDate = this.repliceDates(this.start_date)
        let endDate = this.repliceDates(this.end_date)
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
      pageIndex = pageIndex?pageIndex:1
      apiTaskConfigList({
        userid: this.userID,
        pageindex: pageIndex,
        pagesize: 20,
        name: this.taskName,
        startdate: startDate,
        enddate: endDate
      }).then(res => {
          if(res.data.state){
            this.taskConfigList = res.data.data;
            this.total = res.data.total
          }
      }).catch(err =>{

      }).finally(()=>{
          this.loading = false
      });
    },
    deleteConfig(id) {
      this.$confirm("确认删除此配置", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
          this.delete(id);
        }).catch(() => {});
    },
    delete(id) {
      apiDeleteTaskConfig({
        id: id
      }).then(res => {
          if (res.data.state) {
            this.$message.success("刪除成功");
            this.getTaskConfigList();
          } else {
            this.$message.error(res.data.msg);
          }
        }).catch(err => {
          //this.$message.error(err)
        });
    },
    newAdd() {
      this.addTaskConfig = {
        id: 0,
        interval: 300,
        jslink: "",
        state: "",
        name: ""
      };
      this.isShowState = false;
      this.dialogAddTaskConfig = true;
    },
    add() {
      let state = Number(this.addTaskConfig.state);
      let interval = Number(this.addTaskConfig.interval);
      apiSaveTaskConfig({
        id: this.addTaskConfig.id,
        userid: this.userID,
        name: this.addTaskConfig.name,
        jslink: this.addTaskConfig.jslink,
        interval: interval,
        state: state
      }).then(res => {
          if (res.data.state) {
            this.dialogAddTaskConfig = false;
            this.$message.success(res.data.msg);
            this.getTaskConfigList();
          } else {
            this.$message.error(res.data.msg);
          }
        }).catch(err => {});
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.add();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    editConfig(item) {
      this.isShowState = true;
      let state = item.state.toString();
      let interval = item.interval.toString();
      this.addTaskConfig = {
        id: item.id,
        name: item.name,
        interval: interval,
        jslink: item.jslink,
        state: state
      };
      this.dialogAddTaskConfig = true;
    },
    repliceDates(data){
        return repliceDate(data)
    }
  },
  filters: {
    state(state) {
      switch (state) {
        case 0:
          return "禁用";
        case 1:
          return "启用";
      }
    }
  }
};
</script>
