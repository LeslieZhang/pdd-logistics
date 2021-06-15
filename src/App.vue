<template>
  <div id="app">
    <!-- 总数据 -->
    <div class="total data-li">
      <p class="title">上传总的物流excel(.xls,.xls)</p>
      <input
        type="file"
        ref="totalUpload"
        accept=".xls,.xlsx"
        class="outputlist_upload"
        v-show="totalData.length == 0"
      />
      <div v-show="totalData.length != 0">
        <p>读取成功！</p>
        <p class="num">总数<span>{{ totalData.length }}</span>件</p>
        <p class="num">总金额<span>{{ totalAmount }}</span>元</p>
      </div>
    </div>
    <!-- zf数据 -->
    <div class="total data-li">
      <p class="title">上传张拂的拼多多导出的订单excel(.csv)</p>
      <input
        type="file"
        ref="zfUpload"
        accept=".csv"
        class="outputlist_upload"
        v-show="zfData.length == 0"
      />
      <div v-show="zfData.length != 0">
        <p>读取成功！</p>
        <p class="num">读取的总数<span>{{ zfData.length }}</span>件</p>
        <!-- <p class="num">总金额<span>{{ zfAmount }}</span>元</p> -->
      </div>
    </div>
    <p @click="count" class="count-button">计算</p>
    <p class="num">张拂的新疆/西藏物流单号数：<span>{{zfCollectionData.length}}</span>件</p>
    <p class="num">张拂的新疆/西藏物流总金额：<span>{{ zfCollectionAmount }}</span>元</p>
    <div v-if="zfCollectionData">
      <p v-for="value in zfCollectionData" :key="value['运单编号']">
        <span>运单编号:{{value['运单编号']}}</span>
        <span>金额:{{value['__EMPTY_1']}}</span>
      </p>
    </div>
    
  </div>
</template>

<script>
import XLSX from "xlsx";
export default {
  name: "App",
  data() {
    return {
      totalData: [], // 总计的数据
      totalWaybillNumber: [], // 总的运单号
      totalAmount: 0, // 总金额
      zfData:[],// zf上传的数据
      zfAmount: 0, // zf金额
      zfWaybillNumber: [], // zf上传的总运单号
      zfCollectionData: [], // zf所属的物流运单号
      zfCollectionAmount: 0, // zf所属的物流金额
    };
  },
  mounted() {
    this.$refs.totalUpload.addEventListener("change", (e) => {
      //绑定监听表格导入事件
      this.readTotalExcel(e, "total");
    });
    this.$refs.zfUpload.addEventListener("change", (e) => {
      //绑定监听表格导入事件
      this.readBranchExcel(e, "zf");
    });
  },
  methods: {
    //xsl表格导入的总数据
    readTotalExcel(e) {
      var that = this;
      const files = e.target.files;
      console.log(files);
      if (files.length <= 0) {
        //如果没有文件名
        return false;
      } else if (!/\.(xls|xlsx|csv)$/.test(files[0].name.toLowerCase())) {
        alert("上传格式不正确，请上传xls或者xlsx格式");
        return false;
      }
      const fileReader = new FileReader();
      fileReader.onload = (ev) => {
        try {
          const data = ev.target.result;
          const workbook = XLSX.read(data, {
            type: "binary",
          });
          const wsname = workbook.SheetNames[0]; //取第一张表
          const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]); //生成json表格内容
          console.log("ws", ws);
          let data1 = [] // 数据
          let moneyAmount = 0 // 金额
          let waybillNumber = [] // 运单号
          ws.map((v)=>{
            // 过滤不是运单的
            if((v['__EMPTY_1'] && v['运单编号']) || typeof(v['运单编号']) == "number"){
              v['运单编号'] = v['运单编号'].toString()
              data1.push(v)
              moneyAmount = that.NumberAdd(Number(v['__EMPTY_1']) ,Number(moneyAmount))
              waybillNumber.push(v['运单编号'])
            }
          })
          console.log("总金额---", moneyAmount,"运单编号---",waybillNumber);
          that.totalData = data1;
          that.totalAmount = moneyAmount;
          console.log("生成totalData", that.totalData);
          this.$refs.upload.value = "";
        } catch (e) {
          return false;
        }
      };
      fileReader.readAsBinaryString(files[0]);
    },
    // csv,分支的数据
    readBranchExcel(e) {
      var that = this;
      const files = e.target.files;
      console.log(files);
      if (files.length <= 0) {
        //如果没有文件名
        return false;
      } else if (!/\.(xls|xlsx|csv)$/.test(files[0].name.toLowerCase())) {
        alert("上传格式不正确，请上传xls或者xlsx格式");
        return false;
      }
      const fileReader = new FileReader();
      fileReader.onload = (ev) => {
        try {
          const data = ev.target.result;
          const workbook = XLSX.read(data, {
            type: "binary",
          });
          const wsname = workbook.SheetNames[0]; //取第一张表
          const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]); //生成json表格内容
          console.log("ws", ws);
          let data1 = [] // 数据
          let waybillNumber = [] // 运单号
          ws.map((v)=>{
            v['快递单号'] = v['快递单号'].toString()
            // 过滤不是运单的
            if(v['快递单号'] && v['快递单号'].length>10){
              v['快递单号'] = v['快递单号'].toString()
              data1.push(v)
              waybillNumber.push(v['快递单号'])
            }
          })
          that.zfData = data1;
          that.zfWaybillNumber = waybillNumber
          console.log("快递单号zfWaybillNumber---",that.zfWaybillNumber);
          console.log("生成zfData", that.zfData);
          this.$refs.upload.value = "";
        } catch (e) {
          return false;
        }
      };
      fileReader.readAsBinaryString(files[0]);
    },
    count(){
      this.zfCollectionData = []
      this.zfCollectionAmount = 0
      // 获取属于zf的运单编号数据
      this.zfCollectionData = this.totalData.filter(item => 
        this.zfWaybillNumber.indexOf(item['运单编号']) > -1
      )
      this.zfCollectionData.map((v)=>{
        this.zfCollectionAmount = this.NumberAdd(Number(v['__EMPTY_1']) ,Number(this.zfCollectionAmount))
      })
      console.log("this.zfCollectionData---",this.zfCollectionData)
    }
  },
};
</script>

<style lang="scss" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  font-size: 16px;
}
.count-button{
  width: 200px;
  height: 50px;
  line-height: 50px;
  display: inline-block;
  border-radius: 5px;
  color: #fff;
  background-color: #409EFF;
  font-size: 24px;
}
.data-li{
  padding: 50px 50px 50px 50px;
  border-bottom: 2px dashed #dddd;
}
.total {
  text-align: left;
  .title {
  }

}
.num {
  span{
    color: red;
    font-size: 18px;
    padding: 0 3px;
  }
}
</style>
