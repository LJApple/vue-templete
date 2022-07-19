<!--
 * @Description: 地址
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-08-02 11:23:50
 * @LastEditors: zhaoyy
 * @LastEditTime: 2021-10-20 16:40:57
-->
<template>
  <div>
    <el-select
      remote
      filterable
      v-model="keyWord"
      :remote-method="remoteMethod"
      @change="selectChange"
      :disabled="disable"
      :loading="loading"
      :placeholder="$lang('请选择')"
      :loading-text="$lang('加载中')"
      :no-data-text="$lang('无数据')"
      class="base-address"
    >
      <template slot="prefix">
        <i class="iconfont icon-zujian_ico_chaxun"></i>
      </template>
      <el-option v-for="(item, index) in options" :key="index" :label="setProvCityArea(item)" :value="setProvCityArea(item)" @click.native="selectlist(item)">
        <span v-html="setProvCityAreaByName(item)"></span>
      </el-option>
    </el-select>
  </div>
</template>

<script>
import { sendDic } from "@/components/avuex/core/common/dic.js";
let queryKeyword = "";

export default {
  name: "BaseAddress",
  props: {
    url: {
      type: String,
      default: "yl-indonesia-vip/vip/common/search/address?",
    },
    provCityArea: {
      type: String,
      default: "",
    },
    rowData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    addressType: {
      type: Number,
      default: 2,
    },
    disable: {
      type: Boolean,
      default: false,
    },
    isSplit: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      keyWord: "", // 绑定值
      options: [], // 查询到的地址
      rowDataList: {},
      loading: false,
    };
  },
  computed: {
    // 合并省市区
    setProvCityArea() {
      return (obj) => {
        return `${obj.prov ? obj.prov : ""}${obj.city ? "/" + obj.city : ""}${obj.area ? "/" + obj.area : ""}`;
      };
    },
  },
  watch: {
    disable: {
      handler(nval) {
        if (nval) {
          this.keyWord = "";
          this.$emit("update:provCityArea", "");
        }
      },
      immediate: true,
    },
    rowData: {
      handler(newV, oldV) {
        if (this.isSplit) {
          this.rowData = newV;
          this.keyWord = this.setProvCityArea(this.rowData);
          this.$emit("update:provCityArea", this.setProvCityArea(this.rowData));
        }
      },
      deep: true,
    },
  },
  mounted() {
    // 设置初始地址
    if (this.disable) {
      this.keyWord = "";
      this.$emit("update:provCityArea", "");
    } else {
      this.keyWord = this.setProvCityArea(this.rowData);
      this.$emit("update:provCityArea", this.setProvCityArea(this.rowData));
      this.$emit("provCityAreaList", this.rowData);
    }
  },
  methods: {
    setProvCityAreaByName({prov = '', city = '', area = ''}) {
      const replaceReg = new RegExp(queryKeyword, "ig");
      // 高亮替换v-html值

      const replaceString = '<span class="el-option-red">' + queryKeyword.toUpperCase() + "</span>";
      return `${prov && prov.replace(replaceReg, replaceString)}${city ? "/" + city.replace(replaceReg, replaceString) : ''}${
        area ? "/" + area.replace(replaceReg, replaceString) : ''
      }`;
    },
    // 调用远程搜索
    async remoteMethod(query) {
      this.loading = true;
      queryKeyword = query;
      if (query !== "") {
        setTimeout(() => {
          sendDic({
            url: `${this.url}type=${this.addressType}&searchKey=${query.toUpperCase()}`,
            method: "get",
          })
            .then((res) => {
              this.options = res;
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
        }, 200);
      } else {
        this.options = [];
      }
      // this.loading = false
    },
    // 选择后更新父组件
    selectChange(params, item) {
      console.log("params传递出去的地址", params, item);
      this.$emit("update:provCityArea", params);
    },
    selectlist(params) {
      this.$emit("provCityAreaList", params);
    },
  },
};
</script>

<style lang="scss">
.base-address {
  .el-input__prefix {
    top: 10px;
    left: 12px;
    width: 12px;
    height: 13px;
    line-height: 13px;
    .iconfont {
      font-size: 14px;
      vertical-align: top;
    }
    .el-input__inner {
      padding-left: 34px;
    }
  }
}
</style>
