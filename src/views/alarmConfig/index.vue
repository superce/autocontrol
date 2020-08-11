<template>
  <div class="system">
      <el-row class="tac" :style="{height:height}">
        <el-col>
          <el-menu
            :default-active="defaultActive"
            class="el-menu-vertical-demo"
            text-color="#fff"
            >
            <el-menu-item index="userMain" @click="toUserMain" v-if="isSuper===1&&isSuper">
              <span slot="title">用户管理</span>
            </el-menu-item> 
            <el-menu-item index="alarmConfig" @click="toAlarmConfig">
              <span slot="title">报警配置</span>
            </el-menu-item>
          </el-menu>
        </el-col>
      </el-row>
      <div class="site-content">
        <router-view></router-view>
      </div>
  </div>
</template>
<script>
import {getLocal} from '@/utils/storage'
export default {
  name:'systemConfig',
  data(){
    return {
      defaultActive:'userMain',
      height:0
    }
  },
  created(){
    this.defaultActive = this.$route.name
    this.height = (document.body.clientHeight-60)+'px'
  },
  computed:{
    isSuper(){
        return this.$store.state.isSuper || getLocal('isSuper') || ''
      }
  },
  methods: {
    toUserMain(){
      this.$router.push({
        name:"userMain"
      })
    },
    toAlarmConfig(){
      this.$router.push({
        name:"alarmConfig"
      })
    }
  },
}
</script>
<style scoped>
  .system{margin-top: 60px;}
  .system .tac{position: fixed;left: 0;top:60px;width: min-content;box-shadow: 0 0 4px #999;}
  .system .site-content{margin-left: 110px}
  .system .tac .el-col-24{width:101%!important}
  .el-menu{background: none;border: none;}
  .el-menu li span{color:#409eff}
  .el-menu-item.is-active{background: rgb(179, 216, 255);}
</style>