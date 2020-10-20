<template>
    <el-dialog :visible.sync="dialogFormControl" title="分配中控">
          <div style="text-align: center">
            <el-transfer
            style="text-align: left; display: inline-block;"
            v-model="value"
            filterable
            :left-default-checked="[]"
            :right-default-checked="[]"
            :render-content="renderFunc"
            :titles="['未分配', '已分配']"
            :button-texts="['取消分配', '分配中控']"
            @change="handleChange"
            :data="data">
            </el-transfer>
        </div>
    </el-dialog>
</template>
<script>
import {apiDistrControl,apiDisControl} from '@/request/api'
import {getLocal} from '@/utils/storage'
export default {
    props:['rowId','type','taskId'],
    name:'disControl',
    data(){
        return {
            SelectionChange:[], // 选择的列表id
            unIds:[],
            selectQueueId:'',
            dialogFormControl:false,
            controlList:[],
            index:0,
            data: [],//this.generateData(),
            value: [],
            renderFunc(h, option) {
                return <span>{ `${option.label}${option.remark}` }</span>;
            }
        }
    },
    computed:{
        userId(){
            return this.$store.state.userId || getLocal('userId') || '' 
        },
        isSuper(){
            return this.$store.state.isSuper || getLocal('isSuper') || ''
        }
    },
    methods:{
        // 穿梭框数据
        generateData(){
            const data = [];
            for (let i = 1; i <= this.controlList.length; i++) {
                let ip = '***'
                let labelName = this.controlList[i-1].name;
                if(this.controlList[i-1].ip){
                    ip = this.controlList[i-1].ip
                    labelName = `${this.controlList[i-1].name}(${this.controlList[i-1].ip})`
                }
                let item = {
                    ip:ip,
                    key: this.controlList[i-1].id,
                    label: labelName,
                    remark:''
                }
                if(this.isSuper==1){
                    let remark = this.controlList[i-1].remark?this.controlList[i-1].remark:'无备注'
                    item.remark = `(${remark})`
                }
                data.push(item);
            }
            this.data = data
            //return data
        },
        leftChange(sa,d){
            // console.log(sa,d)
        },
        // 左右分配按钮
        handleChange(value, direction, movedKeys) {
            if(direction === 'left'){ // 取消分配
                this.confirmSaveControl(movedKeys,2)
                // console.log(id)
            }
            if(direction === 'right'){ // 分配中控
                // console.log(id)
                this.confirmSaveControl(movedKeys,1)
            }
        },
        // 选择多个中控
        handleSelectionChange(val){
            // console.log(val)
            this.SelectionChange = []
            val.forEach(item =>{
                this.SelectionChange.push(item.id)                
            })
        },
        // 确认分配
        confirmSaveControl(id,state){
            let t = {
                userid:this.userId,
                ids:id,//this.SelectionChange,
                type:3,
                state:state,

            }
            if(this.type === 'user'){
                t.disid=this.rowId
                t.type=1
            }
            if(this.type === 'quene'){
                t.type = 2
                t.task_queue_id = this.rowId
            }
            if(this.type === 'server'){
                t.type = 3
                t.server_type_id = this.rowId
            }
            if(this.type === 'queneTag'){
                t.type = 4
                t.queue_tag_id=this.rowId
                t.task_queue_id = this.taskId
            }
            apiDistrControl(t).then(res =>{
                if(res.data.state=='success'){
                }else{
                    this.$message.error(res.data.msg)
                }
            }).catch(err =>{
                console.log(err)
            })
        },
        // 中控列表
        getControlList() {
            let _this = this;
            // this.index++
            apiDisControl({
                userid: this.userId,
                page_index: 1,
                page_size: 9999,
            }).then(res => {
                let newData = []
                res.data.forEach(item => {
                    if(_this.type === 'user'){
                        if(item.user_id === _this.rowId || !item.user_id){
                            if(item.user_id !==0){
                                this.value.push(item.id)
                            }
                            newData.push(item)
                        }
                    }
                    if(_this.type === 'quene'){
                        if(item.task_queue_id === _this.rowId||!item.task_queue_id){
                            if(item.task_queue_id !==0){
                                this.value.push(item.id)
                            }
                            newData.push(item)
                        }
                    }
                    if(_this.type === 'queneTag'){
                        if(item.queue_tag_id === _this.rowId||!item.task_queue_id){
                            if(item.queue_tag_id !==0){
                                this.value.push(item.id)
                            }
                            newData.push(item)
                        }
                    }
                });
                _this.controlList=newData //= newData;
                _this.dialogFormControl = true
                _this.generateData()
            }).catch(err => {
              console.log(err)  
            });
            
        },
        // 格式化时间
        dateFormat(date) {
            if(date){
                let time = date.split('T')
                let year = time[0]
                let day = time[1]
                return `${day}`   
            }
        }
    },
    filters:{
        controlStatus(status){
            switch(status){
                case '0':
                return '启用';
                case '-1':
                return '停用'
            }
        }
    }
}
</script>
<style scoped>
    .demo-table-expand{display: flex;flex-direction: column}
</style>