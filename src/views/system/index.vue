<template>
  <div class="system">
      <el-row class="tac" :style="{height:height}">
        <el-col>
          <el-menu
            :default-active="defaultActive"
            class="el-menu-vertical-demo"
            background-color="#545c64"
            text-color="#fff"
            >
            <el-menu-item index="admin" @click="toAdmin">
              <!-- <i class="el-icon-menu"></i> -->
              <span slot="title">命令管理</span>
            </el-menu-item> 
            <el-menu-item index="task" @click="toTask">
              <!-- <i class="el-icon-setting"></i> -->
              <span slot="title">命令任务</span>
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
export default {
  name:'systemConfig',
  data(){
    return {
      defaultActive:'admin',
      height:0
    }
  },
  created(){
    this.defaultActive = this.$route.name
    this.height = (document.body.clientHeight-60)+'px'
  },
  methods: {
    toAdmin(){
      this.$router.push({
        name:"admin"
      })
    },
    toTask(){
      this.$router.push({
        name:"task"
      })
    }
  },
}
</script>
<style scoped>
  .system{margin-top: 60px;}
  .system .tac{position: fixed;left: 0;width: min-content;background: rgb(84, 92, 100)}
  .system .site-content{margin-left: 110px}
</style>