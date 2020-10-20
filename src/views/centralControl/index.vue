<template>
  <div class="central-control">
    <!-- 搜索 -->
    <div class="fiexd-nav">
      <div class="search">
        <div>
          <span>中控名称:</span>
          <el-input v-model="params.name" placeholder="请输入内容"></el-input>
        </div>
        <div>
          <span>队列标识:</span>
          <el-input v-model="params.queue_title" placeholder="请输入内容"></el-input>
        </div>
        <div>
          <span>中控状态:</span>
          <el-select v-model="params.status" placeholder="请选择">
            <el-option
              v-for="(item,index) in status"
              :key="index+'status'"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </div>
        <div>
          <span>网络状态:</span>
          <el-select v-model="params.netState" placeholder="请选择">
            <el-option
              v-for="(item,index) in netStatus"
              :key="index+'netStatus'"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </div>
        <div>
          <span>显示方式:</span>
          <el-select v-model="displayMode" @change="getMode" placeholder="请选择">
            <el-option label="网格" value="1"></el-option>
            <el-option label="列表" value="2"></el-option>
          </el-select>
        </div>
        <div>
          <span>使用人:</span>
          <!-- <el-input v-model="params.userName" placeholder="请输入内容"></el-input> -->
          <el-select v-model="params.userName" placeholder="请选择">
            <el-option
              v-for="(item,index) in userNameList"
              :key="index+'userNameList'"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </div>
        <!-- <div class="block">
          <span class="demonstration">开始时间</span>
          <el-date-picker v-model="params.start_date" type="date" placeholder="选择日期"></el-date-picker>
        </div>
        <div class="block">
          <span class="demonstration">结束时间</span>
          <el-date-picker v-model="params.end_date" type="date" placeholder="选择日期"></el-date-picker>
        </div> -->
        <el-button type="primary" @click="search">搜索</el-button>
      </div>
      <div class="margin">
        <el-button type="primary" :loading="editLoading" @click="edit">编辑</el-button>
        <el-button type="primary" @click="CmdTask" v-if="isSuper === 1" :loading="CmdLoading">CMD任务</el-button>
        <el-button type="primary" @click="group" v-if="isSuper !== 1">分组</el-button>
        <el-button type="primary" @click="removeControl" v-if="isSuper !== 1">从分组移除中控</el-button>
      </div>
    </div>
    <div class="control-box">
      <!-- cmd任务弹窗 -->
      <el-dialog :visible.sync="cmdDialog" title='CMD任务列表' class="admin-dialog">
        <div class='select'>
          <el-select v-model="adminNameId" v-loadmore='loadMore' placeholder="请选择">
            <el-option
              v-for="item in adminList"
              :label="item.name"
              :value="item.id"
              :key="item.name+'name'"
              >
            </el-option>
          </el-select>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="cmdDialog = false">取消</el-button>
          <el-button type="primary" :loading="editLoading" @click="confirmCmd">确定</el-button>
        </div>
      </el-dialog>
      <!-- 编辑 -->
      <el-dialog width="500px" :visible.sync="dialogEdit" :title="editGroup=='edit'?'修改中控配置':'创建分组'">
			<!-- 4G拨号设置格式 -->
        <div v-show="editGroup=='edit'">
          <el-form label-width="150px">
            <el-form-item v-show="editIds.length<2" label="中控名称" class="input-item">
              <el-input v-model="isEditName"></el-input>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="isSelectStatus" placeholder="请选择">
                <el-option label="启用" value="0"></el-option>
                <el-option label="停用" value="-1"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="窗口数量" class="input-item">
              <el-input v-model="wCount"></el-input>
            </el-form-item>
            <el-form-item label="是否是测试机">
              <el-radio v-model="isTestRadio" label="1">是</el-radio>
              <el-radio v-model="isTestRadio" label="0">否</el-radio>
            </el-form-item>
            <el-form-item v-if="isSuper===1" label="备注" class="input-item">
              <el-input v-model="remark"></el-input>
            </el-form-item>
            <el-form-item label="4G网络设置">
              <el-select v-model="site4g.mode" placeholder="请选择" @change="changeModle">
                <el-option label="不换IP" value="-1"></el-option>
                <el-option label="间隔时间" value="0"></el-option>
                <el-option label="间隔次数" value="1"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <div v-show="site4g.mode !=='-1'&&site4g.mode!==''">
            <el-form label-width="150px" :model="site4g" :rules="rules" ref="ruleForm">
              <!-- <h3>4G拨号设置格式</h3> -->
              <el-form-item label="修改运营商" v-if="isSuper===1" class="input-item">
                <el-select v-model="site4g.iptype" @change="changeIptype" placeholder="请选择运营商">
                  <el-option value="9" label="请选择运营商"></el-option>
                  <el-option value="0" label="台湾中华电信"></el-option>
                  <el-option value="1" label="香港移动大陆卡"></el-option>
                  <el-option value="2" label="香港csl"></el-option>
                  <el-option value="3" label="香港数码通（smartone）"></el-option>
                  <el-option value="4" label="香港3hk"></el-option>
                  <el-option value="5" label="台湾远传"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="连接类型" v-if="isSuper===1" prop="con_type">
                <el-select v-model="site4g.con_type" placeholder="选择连接类型">
                  <el-option value="0" label="Api"></el-option>
                  <el-option value="1" label="ApiSsl"></el-option>
                  <el-option value="2" label="Api_v2"></el-option>
                  <el-option value="3" label="ApiSsl_v2"></el-option>
                  <el-option value="4" label="Ssh"></el-option>
                  <el-option value="5" label="Telnet"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="用户名" v-if="isSuper===1" class="input-item" prop="username">
                <el-input v-model="site4g.username"></el-input>
              </el-form-item>
              <el-form-item label="密码" v-if="isSuper===1" class="input-item" prop="password">
                <el-input v-model="site4g.password"></el-input>
              </el-form-item>
              <el-form-item :label="editModle || '间隔'" class="input-item" prop="interval">
                <el-input v-model="site4g.interval" :disabled="site4g.mode==='-1'"></el-input>
              </el-form-item>
            </el-form>
          </div>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" :loading="editLoading" @click="saveEdit('ruleForm')">保存</el-button>
          </div>
        </div>
        <!-- 分组 -->
        <div v-show='editGroup=="group"'>
          <el-form :inline="true" class="demo-form-inline" @submit.native.prevent>
            <el-form-item label="分组名称">
              <el-input v-model="groupName" placeholder="小组名" @keyup.enter.native="submitGroup"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitGroup">创建分组</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-dialog>
      <!-- 网格显示 -->
      <div v-show="displayMode==='1'" :class="['el-row',{'super-admin':isSuper==1}]">
          <el-card shadow="hover" class="box-card" v-for="(items,index) in list" :key="index">
            <div slot="header" class="clearfix">
              <span>{{items.title}}</span>
              <el-button v-if="items.server_type_id !== 0&&isSuper!==1" type="primary" style="float: right; padding: 4px 10px" @click="dissGroup(items.server_type_id)">解散分组</el-button>
            </div>
            <div class="item-content">
              <div v-for="(item,index) in items.itemList" :key="index+'item'" class="text item control" :class="item.isSelect?'is-select':'no-select'">
                <el-checkbox  v-model="item.isSelect" class="select-checkbox"></el-checkbox>
                <div class="left">
                  <img :src="`http://api.okaymw.com/api/screen?uid=${item.uid}&tag=small`|defaultImg('contorl')" @click="enlarge(item.uid)" />
                  <p v-if="isSecondsFormat(item)" :class="item.net_state==0?'normal':'abnormal'">网络{{item.net_state | netState}}</p>
                  <p v-else class="error-nomal">网络--</p>
                  <div class="left-name">
                    <!-- <p><span>窗口数量:</span>{{item.w_count}}</p> -->
                    <!-- <em><span>状态:</span><em :class="item.status=='0'?'normal':'abnormal'">{{item.status | controlStatus}}</em></p> -->
                  </div>
                </div>
                <div class="right">
                  <p><span>中控名称：</span>{{item.name}}</p>
                  <p><span>队列标识：</span>{{item.tag_name}}<i v-if="item.tag_name">/</i>{{item.queue_title}}</p>
                  <p v-if="isSuper == 1"><span>备注：</span>{{item.remark||'--'}}</p>
                  <p v-if="isSuper == 1"><span>版本号：</span>{{item.version||'--'}}</p>
                  <p><span>窗口数量:</span>{{item.w_count}}</p>
                  <p>
                    <span>状态:</span><em :class="item.status=='0'?'normal':'abnormal'">{{item.status | controlStatus}}</em>
                    <span class="btn-span">
                      <el-button type="primary" class="mini" @click='toTagList(item)'>积压</el-button>
                      <el-button type="primary" class="mini" @click="toTaskList(item)">历史</el-button>
                      <el-button type="primary" class="mini" @click="getUseTime(item)">{{userTime(item)}}</el-button>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </el-card>
      </div>
      <!-- 列表显示 -->
      <div v-show="displayMode==='2'" class="el-mode-table">
        <el-collapse v-model="activeNames" @change="handleChange">
          <el-collapse-item v-for="(items,index) in list" :key="index+'item'" :name="index+1" >
              <template slot="title">
                  <div class="queue-title">
                      {{items.title}}
                      <el-button v-if="items.server_type_id !== 0&&isSuper!==1" type="primary" style="float: right; padding: 4px 10px" @click="dissGroup(items.server_type_id)">解散分组</el-button>
                  </div>
              </template>
              <el-table ref="multipleTable" :data="items.itemList" stripe style="width: 100%" @selection-change="handleSelectionChange">
                  <el-table-column type="selection" width="55"></el-table-column>
                  <el-table-column prop="name" label="中控名称">
                    <template slot-scope="{row}">
                      {{row.name}}<span class="remark">({{row.remark}})</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="tag_name" label="队列标识">
                    <template slot-scope="{row}">
                      {{row.tag_name}}<i v-if="row.tag_name"> / </i>{{row.queue_title}}
                    </template>
                  </el-table-column>
                  <el-table-column prop='w_count' label="窗口数量" width="180"></el-table-column>
                  <el-table-column prop='use_time' label="使用率" width="180">
                    <template slot-scope="{row}">
                      {{userTime(row)}}
                    </template>
                  </el-table-column>
                  <el-table-column v-if="isSuper == 1" prop="remark" label="版本号" width="180">
                    <template slot-scope="{row}">
                      {{row.version||'--'}}
                    </template>
                  </el-table-column>
                  <el-table-column label="网络状态" width="180">
                    <template slot-scope="{row}">
                      <el-tag v-if="isSecondsFormat(row)" :type="row.net_state==0?'success':'danger'" size='small'>
                        网络{{row.net_state | netState}}
                      </el-tag>
                      <el-tag v-else type='info' size="small">网络--</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="中控状态" width="180">
                    <template slot-scope="{row}">
                      <el-tag :type="row.status==0?'success':'danger'" size='small'>
                        {{row.status|controlStatus}}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" prop="addtime">
                      <template slot-scope="{row}">
                          <el-button type="primary" size="mini" @click="toTagList(row)">积压</el-button>
                          <el-button type="primary" size="mini" @click="toTaskList(row)">历史</el-button>
                          <el-button type="primary" size="mini" @click="enlarge(row.uid)">查看截图</el-button>
                          <el-button type="primary" size="mini" @click="getUseTime(row)">使用时间</el-button>
                      </template>
                  </el-table-column>
              </el-table>
          </el-collapse-item>
        </el-collapse>
      </div>
	  <div class="big-img">
		  <el-dialog width='1240px' :visible.sync="dialogTableVisible">
			  <img :src="bigImg" alt="">
		  </el-dialog>
	  </div>
    <!-- 积压任务弹窗 -->
    <will-task ref="task"></will-task>
    <!-- 使用时间 -->
    <use-time ref="usetime"></use-time>
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
  </div>
</template>

<script>
import {
  apiGetControlList,
  apiGetZkUserList,
  apiEditZkUpdate,
  setControlGroup,
  dissControlGroup,
  removeContorlItem,
  apiGetAddCmdTask,
  apiGetCmdList,
  apiGetUserList
} from "@/request/api";
import { getLocal,setLocal } from "@/utils/storage";
import { dateFormat } from "@/utils/common";
import willTask from '@/components/willTask'
import useTime from './useTime/index'
export default {
  components:{willTask,useTime},
  data() {
    return {
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
        ],
        con_type:[
          { required: true, message: '请选择连接类型', trigger: 'blur' },
        ],
        password:[
          { required: true, message: '请输入密码', trigger: 'blur' },
        ],
        interval:[
          { required: true, message: '请输入间隔', trigger: 'blur' },
        ],
        mode:[
          { required: true, message: '请选择连模式', trigger: 'blur' },
        ]
      },
      dialogEdit:false, //编辑弹窗
      dialogTableVisible:false, //大图弹窗
      bigImg:'', //大图
      params: {
        userid: "",
        name: "",
        queue_title: "",
        status: "",
        netState:'',
        username: 0,
        server_title: "",
        // start_date: "",
        // end_date: ""
      },
      status: [
        { name: "全部", id: "" },
        { name: "正常", id: 0 },
        { name: "停用", id: -1 }
      ],
      netStatus:[
        {name:"全部",id:''},
        {name:"网络正常",id:0},
        {name:'网络异常',id:-1},
        {name:'心跳异常',id:9999}
      ],
      site4g: {
        con_type: "",
        username: "",
        password: "",
        interval: "",
        mode: "",
        iptype:'9'
      },
      editModle: "", // 选择模式
      con_typeId: "",
      editIds: [],
      list: [], // 取到的数据
      contorl: {
        // 后台返回的数据
        userList: "", //用户列表
        serverList: "", //服务器类型列表
        queueList: "" //d队列列表
      },
      pages: 0, //分页
      currentPage:1,//当前页
      timer: false,
      editRobot: [],
      disabled: true,
      editGroup:'', // 判断是分组还是编辑
      groupName:'', //分组名称
      isEditName:'',
      isSelectIp:'', //是否换ip
      isSelectStatus:'', //启用停用状态
      wCount:'', // 窗口数量
      isShow4G:false, // 是否多选中控4g配置
      remark:'',//备注
      editLoading:false, // 编辑按钮的状态||保存按钮
      cmdDialog:false, //cmd弹窗
      adminList:[], // 命令任务列表
      adminNameId:'', //选择的任务名称
      CmdLoading:false,
      pageIndex:1, // 命令任务页数
      total:1,
      isTestRadio:'0', // 是否是测试机 1:测试机
      displayMode:'1', // 页面显示形式
      activeNames:[], // 列表折叠
      userNameList:[{id:0,name:'全部'}], // 中控用户分类列表
    };
  },
  created() {
    this.getList();
    this.getUserList()
    this.displayMode=this.showMode
  },
  computed: {
    userId() {
      return this.$store.state.userId || getLocal("userId") || "";
    },
    isSuper(){
      return this.$store.state.isSuper || getLocal('isSuper') || ''
    },
    // 页面显示方式
    showMode(){
      let mode = getLocal('mode')||0
      mode = mode.toString()
      mode = mode==='0'?'1':mode
      return mode
    }
  },
  // 自定义指令
  directives: {
    loadmore:{
      bind(el, binding) {
        // 获取element-ui定义好的scroll盒子
        const SELECTWRAP_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap')
        SELECTWRAP_DOM.addEventListener('scroll', function () {
          const CONDITION = this.scrollHeight - this.scrollTop <= this.clientHeight+50
          if (CONDITION) {
            binding.value()
          }
        })
      }
    }
  },
  methods: {
    handleChange(){

    },
    userTime(item){
      let percent = item.use_time/60/24*100
      return Math.ceil(percent)+'%'
    },
    getUseTime(item){
      console.log(item)
      this.$refs.usetime.getZkUserTime(item.id,item.name,item.remark||'--')
    },
    getUserList(){
        apiGetUserList({
            id:this.userId,
            page_index:1,
            page_size:999,
            name:''
        }).then(res =>{
          // res.data.unshift(obj)
          this.userNameList = this.userNameList.concat(res.data)
        }).catch(err =>{

        })
    },
    // 显示方式从缓存中取值
    getMode(mode){
      console.log(typeof mode)
      setLocal('mode',mode)
    },
    handleSelectionChange(val){
      val.forEach(item =>{
        item.isSelect = true
      })
    },
    // CMD任务
    CmdTask(){
      let result = false
      this.list.forEach(items => {
        items.itemList.forEach(item =>{
          if (item.isSelect) {
            result = true
            this.editIds.push(item.id)
          }
        })
      })
      if(!result){
        this.$message.error('请选择中控')
        return false
      }
      this.CmdLoading = true
      this.pageIndex = 1
      this.getCmdList(1)
      this.cmdDialog = true
    },
    loadMore(){
      this.pageIndex++
      if(this.pageIndex<=this.total){
        this.getCmdList(this.pageIndex)
      }
    },
    getCmdList(i){
      apiGetCmdList({
        pageindex:i,
        pagesize:10,
        name:'',
        startdate:'',
        enddate:''
      }).then(res =>{
        this.adminList=this.adminList.concat(res.data) 
        this.total = res.total
      }).catch(err =>{

      }).finally(()=>{
        this.CmdLoading = false
      })
    },
    // 确定选择命令
    confirmCmd(){
      apiGetAddCmdTask({
        ids:this.editIds,
        cmd_id:this.adminNameId
      }).then(res =>{
        if(res.data.state){
          this.$message.success(res.data.msg)
          this.cmdDialog = false
        }else{
          this.$message.error(res.data.msg)
        }
      }).catch(err =>{
        this.$message.error(res.data.msg)
      })
    },
    // 解散分组
    dissGroup(id){
      this.$confirm('确认解散分组?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.dissGroupApi(id)
        }).catch(() => {       
        });
    },
    dissGroupApi(id){
      dissControlGroup({
        server_type_id:id
      }).then(res =>{
        this.$message.success('解散分组成功')
        this.currentPage=1
        this.getControlList('','',this.currentPage)
      }).catch(err =>{
        console.log(err)
      })
    },
    // 创建分组
    submitGroup(){
      if(!this.groupName){
        this.$message.error('分组名称不能为空')
        return false
      }
      setControlGroup({
        ids:this.editIds,
        server_title:this.groupName
      }).then(res =>{
        if(res.data.state=='success'){
          this.currentPage=1
          this.getControlList('','',this.currentPage)
          this.dialogEdit = false
          this.$message.success('分组成功')
        }else{
          this.$message.error(res.data.msg)
        }
      }).catch(err =>{
        console.log(err)
      })
      this.groupName = ''
    },
    // 分组
    group(){
      this.editGroup = 'group'
      let result = false;
      this.disabled = false;
      this.list.forEach(items => {
        items.itemList.forEach(item =>{
          if (item.isSelect) {
            result = true;
            this.editIds.push(item.id);
          }
        })
      });
      if(!result){
        this.$message.error('请选择中控')
        return false
      }
      this.dialogEdit=true
    },
    enlarge(img) {
      this.dialogTableVisible = true
      this.bigImg = `http://api.okaymw.com/api/screen?uid=${img}`
    },
    changeModle(val) {
      // 监控选择的模式
      switch (val) {
        case "-1":
          return this.editModle = '停用'
        case "0":
          return (this.editModle = "间隔时间");
        case "1":
          return (this.editModle = "间隔次数");
      }
    },
    // 监控选择的ip
    changeIptype(val){
      console.log(val)
    },
    edit() {
      this.editGroup = 'edit'
      //点编辑按钮之前判断有没有选择中控
      let result = false;
      this.disabled = false;
      let g4Index = false
      let copySite4g = []
      this.list.forEach(items => {
        items.itemList.forEach(item =>{
          if (item.isSelect) {
            result = true;
            this.editIds.push(item.id);
            copySite4g.push(item.g4)
            // }
            if(item.g4){
              let mode = JSON.parse(item.g4)
              if(mode.mode == -1){ //mode -1:不换ip
                g4Index = true
              }
            }else{
              g4Index = true
            }
          }
          
        })
      });
      if (result) {
        // 不换ip
        // this.isSelectIp=['1']   
        this.isSelectIp='1'
        // 选择一个中控的时候
        if(this.editIds.length === 1){
          this.list.forEach(items =>{
            items.itemList.forEach(item =>{
              if(this.editIds[0]===item.id){
                this.remark=item.remark
                this.isEditName = item.name
                this.isSelectStatus = item.status
                this.wCount = item.w_count
                this.isTestRadio = item.istest.toString()
              }
            })
          })
          // 换ip
          if(copySite4g.length>0&&copySite4g[0]){
            let copySite4g_1 = JSON.parse(copySite4g[0])
              copySite4g_1.mode = copySite4g_1.mode.toString()
              copySite4g_1.con_type = copySite4g_1.con_type.toString()
              copySite4g_1.interval = copySite4g_1.interval.toString()
              copySite4g_1.iptype = copySite4g_1.iptype.toString()
              this.site4g = {
                con_type: copySite4g_1.con_type,
                username: copySite4g_1.username,
                password: copySite4g_1.password,
                interval: copySite4g_1.interval,
                mode: copySite4g_1.mode,
                iptype:copySite4g_1.iptype
              }
            if(g4Index){
              console.log('不换IP',g4Index) //g4Index 为true  不换ip
              this.site4g.mode='-1'
            }else{
              console.log('换IP')
            }
          }else{
            this.site4g.mode='-1'
          }
        }else{
          this.remark=''
          this.isTestRadio = '0'
          // 多选中控的时候,取数据第一条不为空的配置
          for(var i = 0;i<copySite4g.length;i++){
            if(copySite4g[i]){
              let a = JSON.parse(copySite4g[i])
              a.mode = a.mode.toString()
              if(a.username){
                this.isShow4G=true
                this.isSelectIp='2'
                this.site4g ={
                  con_type: a.con_type,
                  username: a.username,
                  password: a.password,
                  interval: a.interval,
                  mode: a.mode,
                  iptype:a.iptype
                }
                break;
              }
            }
          }
          // this.isSelectIp = '1'
        }
        this.editContorl();
      } else {
        this.disabled = true;
        this.$message({
          message: "请选择中控",
          type: "error"
        });
        return false;
      }
    },
    // 移除中控
    removeControl(){
      this.list.forEach(items =>{
        items.itemList.forEach(item =>{
          if (item.isSelect) {
            this.editIds.push(item.id);
          }
        })
      })
      if(this.editIds.length===0){
        this.$message.error('请选择中控')
        return false
      }
      this.$confirm('确认移除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeContorlItem({
        ids:this.editIds
      }).then(res =>{
        if(res.data.state==='success'){
          this.getList()
          this.editIds=[]
          this.$message.success('移除中控成功')
        }else{
          this.$message.error(res.data.msg)
        }
      })
      }).catch(() => {  
          this.editIds=[]
      });
    },
    // 保存修改内容
    saveEdit(formName) {
      let name = this.isEditName
      let w_count = this.wCount
      let status = this.isSelectStatus
      let params = {
        json4g:'',
        name:name,
        w_count:w_count,
        status:status,
        settingtype:0
      }
      // 不换IP
      let site4g = this.site4g;
      if(!site4g.iptype){
        site4g.iptype = '9'
      }
      let site4gNumber = {
        con_type: Number(site4g.con_type),
        username: site4g.username,
        password: site4g.password,
        interval: Number(site4g.interval),
        mode: Number(site4g.mode),
        iptype:Number(site4g.iptype),
      }
      let json4g = JSON.stringify(site4gNumber);
      params.json4g=json4g
      if(this.site4g.mode=='-1'){ 
        this.saveEditApi(params)
      }else{ // 换IP
          this.$refs[formName].validate((valid) => {
            if (valid) {
              this.saveEditApi(params)
            } else {
              console.log('error submit!!');
              return false;
            }
          });
      }
    },
    // 保存api
    saveEditApi(p){
      this.editLoading=true
      let type = '2'
      let modeType = p.json4g
      modeType = JSON.parse(modeType)
      if(modeType.mode===-1){
        type = '1'
      }
      let istest = Number(this.isTestRadio)
      apiEditZkUpdate({
        userid: this.userId,
        ids: this.editIds,
        g4: p.json4g,
        type:type,
        name:p.name,
        w_count:p.w_count,
        status:p.status,
        remark:this.remark,
        istest:istest
      }).then(res => {
        if(res.data.state === 'error'){
          this.$message.error(res.data.msg)
        }else{
          this.$message({
            message: res.data.msg,
            type: "success"
          });
          this.getList()
          this.dialogEdit = false
        }
      }).catch(err => {
        console.log(err);
      }).finally(()=>{this.editLoading=false});
    },
    // startTime() {
    //   if (this.params.start_date) {
    //     let data = this.params.start_date;
    //     return this.time(data);
    //   }
    // },
    // endTime() {
    //   if (this.params.end_date) {
    //     let data = this.params.end_date;
    //     return this.time(data);
    //   }
    // },
    time(data) {
      if (data) {
        let year = data.getFullYear();
        let mounth = data.getMonth() + 1;
        let day = data.getDate();
        this.changeTime(mounth);
        this.changeTime(day);
        let searchTime = `${year}-${this.changeTime(mounth)}-${this.changeTime(day)}`;
        return searchTime;
      }
    },
    search(){
      this.currentPage=1
      this.getList()
    },
    // 获取列表
    getList() {
      this.getControlList('', '', this.currentPage);
    },
    // 获取列表api
    getControlList(s, e, index) {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.5)'
      });
      let _this = this;
      apiGetControlList({
        userid: this.userId,
        page_index: index,
        page_size: 100,
        name: this.params.name,
        queue_title: this.params.queue_title,
        user_id: this.params.userName,
        server_title: this.params.server_title,
        ip: this.params.ip,
        uid: this.params.uid,
        start_date: s,
        end_date: e,
        status: this.params.status,
        net_state:this.params.netState
      }).then(res => {
        _this.list = []
        let newData = []
        let data1 = []
        let data2 = []
        let index = 0
        res.data.forEach(item =>{
          if(item.userid===0){
            data1 = data1.concat(item)
          }else{
            data2 = data2.concat(item)
          }
        })
        newData = data2.concat(data1)
        newData.forEach(item => {
          item.isSelect = false;
          item.isSeconds=false; //超时判断条件
          if(_this.isSuper==0){
            let p = _this.list.find(pro =>{
              return pro.server_type_id === item.server_type_id
            })
            if(p){
              p.itemList.push(item)
            }else{
              index++
              this.activeNames.push(index)
              let a= ''
              if(item.server_type_id === 0){
                a='未分组'
              }else{
                a=item.server_title
              }
              let controlItem ={
                server_type_id:item.server_type_id,
                isSelect:false,
                title:a,
                itemList:[item]
              }
              _this.list.push(controlItem)
            }
          }else{
            let p = _this.list.find(pro =>{
              return item.userid === pro.server_type_id
            })
            if(p){
              p.itemList.push(item)
            }else{
              index++
              this.activeNames.push(index)
              let a= ''
              if(item.userid === 0){
                a='暂无使用人'
              }else{
                a=item.username
              }
              let controlItem ={
                server_type_id:item.userid,
                isSelect:false,
                title:a,
                itemList:[item]
              }
              _this.list.push(controlItem)
            }
          }
        });
        _this.pages = res.total;
      }).catch(err => {

      }).finally(()=>{
        loading.close();
      });
    },
    // 分页
    goPage(i) {
      this.getControlList("", "", i);
    },
    // 编辑中控
    editContorl() {
      this.editLoading = true
      apiGetZkUserList().then(res => {
		  this.dialogEdit = true
          this.contorl = {
            userList: res.data.userList,
            queueList: res.data.queueList,
            serverList: res.data.serverTypes
          };
        }).catch(err => {
          console.log(err);
        }).finally(()=>{this.editLoading = false});
    },
    // 格式化时间
    changeTime(t) {
      if (t < 10) {
        t = "0" + t;
      }
      return t;
    },
    isSecondsFormat(item){
      let isSeconds = false
      let getTime = new Date(item.lastcore).getTime()
      let nowTime = new Date().getTime()
      let seconds5 = 1000*60*5
      if((nowTime-getTime)<=seconds5){
        item.isSeconds=true
        isSeconds = true
      }
      return isSeconds
    },
    // 格式化时间
    dateFormat(date,id) {
      let getTime = new Date(date).getTime()
      let nowTime = new Date().getTime()
      let seconds5 = 1000*60*5
      this.list.forEach(items =>{
        items.itemList.forEach(item =>{
          if(item.id === id){
            if((nowTime-getTime)<=seconds5){
              item.isSeconds=true
            }
          }
        })
      })
      if(date){
        let time = date.split('T')
        let year = time[0]
        let day = time[1]
        return `${day}`   
      }
    },
    // 积压任务跳转
    toTagList(item){
      this.$refs.task.willTask(item.task_queue_id,item.queue_tag_id)
    },
    toTaskList(item){
      this.$router.push({
        name:"taskList",
        query:{
          task_id:item.task_queue_id,
          tag_id:item.queue_tag_id
        }
      })
    }
    
  },

  watch: {
    dialogEdit(val){
      if(!val){
        let clearIndex = 0
        this.list.forEach((items,index) => {
          items.itemList.forEach(item =>{
            if(item.isSelect){
              clearIndex = index
            }
            item.isSelect = false;
          })
        });
        if(this.displayMode==='2'){
          this.$refs.multipleTable[clearIndex].clearSelection();
        }
        this.editIds = [];
        this.groupName = ''
        this.isEditName=''
        this.isSelectStatus = ''
        this.wCount=''
        this.isShow4G=false
        this.site4g = {
          con_type: "",
          username: "",
          password: "",
          interval: "",
          mode: "",
          iptype:''
        }
      }
    },
    cmdDialog(r){
      if(!r){
        this.adminNameId = ''
        this.editIds=[]
        this.adminList = []
        let clearIndex = 0
        this.list.forEach((items,index) => {
          items.itemList.forEach(item =>{
            if(item.isSelect){
              clearIndex = index
            }
            item.isSelect = false;
          })
        });
        if(this.displayMode==='2'){
          this.$refs.multipleTable[clearIndex].clearSelection();
        }
      }
    },
    dialogTableVisible(val){
      if(!val) this.bigImg = ''
    },
  },
  filters: {
    netState(state) {
      switch (state) {
        case '0':
          return "正常";
          break;
        default:
          return "异常";
      }
    },
    controlStatus(status){
      switch(status){
        case '0':
          return '启用';
        case '-1':
          return '停用'
      }
    }
  }
};
</script>
<style scoped>
.fiexd-nav{min-width: 1850px;}
.central-control .control-box{margin-top: 170px}
.central-control .control-box .toggle {
  margin-right: 10px;
}
.central-control .control-box .el-row .box-card {
  margin-top: 10px;
}
.central-control .control-box .el-row .box-card .item-content{
  display: flex;
  flex-wrap: wrap;
}
.central-control .control-box .el-row .box-card .item-content .item{
  margin: 5px;
  /* width: 314px; */
}
.central-control .control-box h3{text-align: center;margin-bottom:20px }
.central-control .control {
  display: flex;
  justify-content: space-around;
}
.central-control .control .left {
  width: 94px;
}
.central-control .control img {
  width: 100%;
  height: 70px;
  display: block;
}
.central-control .control .left p {
  text-align: center;
  color: #fff;
}
.central-control .control .left-name p{
  text-align: left;
  color:#333;
}
.central-control .control .left p.normal {
  background: rgb(30, 210, 90);
}
.central-control .control .left p.abnormal {
  background: rgba(235, 5, 5, 0.698);
}
.central-control .control .right p .normal{color:#409EFF}
.central-control .control .right p .abnormal{color: rgba(235, 5, 5, 0.698);}
.central-control .control > .right {
  flex-grow: 1;
  margin-left: 5px;
}
.central-control .control > .right p{
  width: 184px;
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
.central-control .control > .right p .btn-span{margin-left: 4px;}
.central-control .el-row .item {
  position: relative;
}
.central-control .el-row .item .select-checkbox {
  position: absolute;
  left: -2px;
  top: -3px;
}
.central-control .el-row p {
  font-size: 14px;
  color: #333;
  font-family: "Microsoft Yahei";
  line-height: 22px;
  margin-top: 2px;
}
.central-control .super-admin p{
  font-size: 12px;
  line-height: 12px;
}
/* .central-control .el-row p span {
  margin-right: 4px;
  padding: 1px 2px;
} */
.central-control .data {
  text-align: center;
}
.central-control .control-box .el-row .item{
  padding: 9px
}
.central-control .control-box .el-row .is-select {
  border: 1px solid #409eff;
}
.central-control .control-box .el-row .no-select{
  border: 1px solid #f4f4f4
}
.edit-temp {
  margin-right: 10px;
}
.edit-temp > button {
  margin-right: 10px;
}
.big-img .big-img-box{width:100%;}
.input-item .el-input{width: 217px}
.margin{margin-top: 20px;}
.dialog-footer{text-align: right}
.is-show-4g{font-size: 12px;line-height: 20px;color:rgba(235, 5, 5, 0.698)}
.seconds-15{color:rgba(235, 5, 5, 0.698)}
.error-nomal{background: #ccc}
.pages{text-align: center;margin-top: 10px;}
.control-box .select{text-align: center;}
.el-mode-table{position: relative;}
</style>