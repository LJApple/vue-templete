<!--
 * @Author: jinmiao
 * @Date: 2021-07-21 16:22:09
 * @Description: file content
 * @LastEditTime: 2021-10-28 18:00:00
-->
<template>
  <div class="dialogbox">
    <el-dialog
      :title="$lang(title)"
      :visible.sync="addressShow"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="closeDialogOut"
      :append-to-body="true"
      width="835px"
      custom-class="dialogbox"
    >
      <div class="addresscontent">
        <div class="content_top">
          <el-input v-model="input" :placeholder="$lang('请输入姓名/地址/联系方式')" size="medium" maxlength="50" @keyup.enter.native="searchList">
            <el-button slot="append" @click="searchList">
              <i class="iconfont icon-zujian_ico_chaxun"></i>
            </el-button>
          </el-input>
          <el-button v-if="titleMsg === 'sender'? saveFlag1 : saveFlag2" type="primary" @click="addNewAddress('new')" class="content_center">
            <i class="iconfont icon-zujian_ico_xinzeng"></i>
            <span v-if="titleMsg === 'sender'">{{ $lang("新增我的寄件人") }}</span>
            <span v-if="titleMsg === 'reciver'">{{ $lang("新增我的收件人") }}</span>
          </el-button>
        </div>
        <div class="content_bottom">
          <div class="hasDate" v-loading="loading" v-if="fakeList && fakeList.length > 0">
            <!-- 每个地址 -->
            <div class="contentlist" v-for="(item, index) in fakeList" :key="index" :class="{ 'list-check': item.radiocheck }" @click="checkradio(item)">
              <!-- 地址左布局 -->
              <div class="contentLeft">
                <!-- <el-radio-group class="contentLeft_radio"  v-model="item.radiocheck"  @change="checkradio(item)" >
                    <el-radio :label="item.id">&nbsp;</el-radio>
                  </el-radio-group> -->
                <div class="contentLeft_rBox">
                  <div class="contentLeft_rBoxTop">
                    <el-popover placement="top-start" popper-class="popover-rBoxTopname" width="160" trigger="hover" :content="$lang(item.name)">
                      <span class="contentLeft_rBoxTop_name" slot="reference">{{ $lang(item.name) }}</span>
                    </el-popover>
                    <span class="contentLeft_rBoxTop_tel">{{ $lang(item.tel) }}</span>
                  </div>
                  <div class="contentLeft_rBox_address">
                    <el-popover
                      placement="bottom-start"
                      popper-class="popover-rBoxTopname"
                      width="300"
                      trigger="hover"
                      :content="`${item.prov ? item.prov + ' , ' :''}${item.city ? item.city + ' , ' :''}${item.area ? item.area + ' , ' :''}${item.address}`"
                    >
                      <span class="contentLeft_rBoxTop_name" slot="reference">{{ `${item.prov ? item.prov + ' , ' :''}${item.city ? item.city + ' , ' :''}${item.area ? item.area + ' , ' :''}${item.address}` }}</span>
                    </el-popover>
                  </div>
                </div>
              </div>
              <!-- 地址右编辑 -->
              <div class="contentRight">
                <div class="contentRight_bottom">
                  <span v-if="titleMsg === 'sender'? editFlag1 : editFlag2" @click="addNewAddress('edit', item)"><i class="iconfont icon-icon_bianji"></i></span>
                  <span v-if="titleMsg === 'sender'? deleteFlag1 : deleteFlag2" @click="deleteAddressBefore(item)"><i class="iconfont icon-icon_shanchu"></i></span>
                </div>
                <div class="contentRight_top" v-if="titleMsg === 'sender'? editFlag1 : editFlag2">
                  <el-switch v-model="item.defaultaddress" @change="chooseDefaultaddress(item)" active-value="1" inactive-value="0" active-color="#e60012" inactive-color="#9499A3">
                  </el-switch>
                  <span v-if="titleMsg === 'sender'">{{ $lang("默认寄件人") }}</span>
                  <span v-if="titleMsg === 'reciver'">{{ $lang("默认收件人") }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 无数据 -->
          <div class="nodata" v-if="fakeList.length === 0 && nodata && !loading">
            <template>
              <img src="~@/assets/images/empty.png" alt="" />
              <span>{{ $lang("暂无数据") }}</span>
            </template>
          </div>
          <div class="nodata" v-if="fakeList.length === 0 && loading">
            <img src="~@/assets/images/loading.gif" alt="" />
          </div>
          <el-pagination
            class="addressPagination"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-size="size"
            layout="prev, pager, next, jumper"
            :total="total"
            v-if="fakeList"
          >
          </el-pagination>
        </div>
      </div>
      <span slot="footer" class="bottom-wrap">
        <el-button @click="addressShow = false" class="btn">{{ $lang("取消") }}</el-button>
        <el-button type="primary dialogBtn" class="btn red" @click="chooseAddress()">{{ $lang("确定") }}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="$lang(addAddressTitle)"
      :visible.sync="addAddress"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :append-to-body="true"
      @close="closeDialog"
      class="address-dialog"
      width="720px"
    >
      <div class="addaddress">
        <el-form ref="formData" :model="formData" :rules="rules">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item :label="$lang('姓名') + '：'" prop="name">
                <el-input size="medium" v-model="formData.name" :placeholder="$lang('请输入')" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$lang('联系方式') + '：'" prop="mobilePhone">
                <el-input
                  size="medium"
                  v-model="formData.mobilePhone"
                  :placeholder="$lang('请输入')"
                  :onkeyup="(formData.mobilePhone = formData.mobilePhone.replace(/[^\d+]/g, ''))"
                  maxlength="17"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="16">
              <el-form-item :label="titleMsg === 'sender' ? $lang('始发地') : $lang('目的地') + '：'" prop="provenance">
                <BaseAddress
                  :provCityArea.sync="formData.provenance"
                  :addressType="titleMsg === 'sender' ? 1 : 2"
                  ref="BaseAddress"
                  :rowData="rowData"
                  class="BaseAddress"
                  @provCityAreaList="provCityAreaList"
                ></BaseAddress>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item :label="$lang('详细地址') + '：'" prop="detailAddress">
                <el-input size="medium" type="textarea" rows="1" v-model="formData.detailAddress" :placeholder="$lang('请输入')" clearable></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item :label="$lang('设为默认') + '：'" style="margin-bottom: 10px">
                <div>
                  <el-switch class="addaddressswitch" style="width: 100%" v-model="formData.defaultaddress" active-value="1" inactive-value="0" active-color="#e60012" inactive-color="#9499A3"> </el-switch>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <span slot="footer" class="bottom-wrap bottom-wrap_footer">
        <el-button @click="backaddAddress" class="btn">{{ $lang("返回") }}</el-button>
        <el-button type="primary" class="btn red" @click="saveAddress">{{ $lang("保存") }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { RESPONSE_SUCCESS } from "@public/utils/const";
import BaseAddress from "@/components/base/BaseAddress";
import { RULES } from "@public/utils/rules";
import { SenderAddressController, ReceiveAddressController } from "@/api";
export default {
  name: "AddressList",
  components: {
    BaseAddress,
  },
  data() {
    return {
      COM_HTTP: this.titleMsg === "sender" ? SenderAddressController : ReceiveAddressController,
      title: this.titleMsg === "sender" ? this.$lang("寄件人地址薄") : this.$lang("收件人地址薄"),
      input: "", // 搜索条件
      addressShow: false,
      saveOrderflag: true,
      fakeListAll: [],
      fakeList: [],
      addAddress: false,
      saveFlag1: false,
      editFlag1: false,
      deleteFlag1: false,
      saveFlag2: false,
      editFlag2: false,
      deleteFlag2: false,
      formData: {
        name: "", // 姓名
        mobilePhone: "", // 联系电话
        provenance: "", // 始发地
        detailAddress: "", // 详细地址
        defaultaddress: "0", // 是否默认
      },
      rules: {
        mobilePhone: [RULES.required, RULES.idnPhone, RULES.idnOnlyNumber],
        name: [RULES.required],
        provenance: [RULES.required],
        detailAddress: [RULES.required],
      },
      rules2: {
        mobilePhone: [RULES.required, RULES.idnPhone, RULES.idnOnlyNumber],
        name: [RULES.required],
      },
      addAddressTitle: this.$lang("新增"),
      current: 1,
      size: 10,
      total: 0,
      loading: false,
      entrust: false,
      currentPage: 1,
      chooseId: "",
      rowData: {
        prov: "",
        city: "",
        area: "",
      },
      nodata: false,
    };
  },
  props: {
    titleMsg: {
      type: String,
      default: "sender",
    },
  },
  computed: {},
  watch: {},
  created() {
    const meunStr = localStorage.getItem('MENU') || ''
    console.log('meunList111', meunStr.length)
    this.saveFlag1 = (meunStr.indexOf("/vip/sender/address/save") != -1)
    this.editFlag1 = (meunStr.indexOf("/vip/sender/address/update") != -1)
    this.deleteFlag1 = (meunStr.indexOf("/vip/sender/address/delete") != -1)
    this.saveFlag2 = (meunStr.indexOf("/vip/receive/address/save") != -1)
    this.editFlag2 = (meunStr.indexOf("/vip/receive/address/update") != -1)
    this.deleteFlag2 = (meunStr.indexOf("/vip/receive/address/delete") != -1)
  },
  methods: {
    // 初始化参数
    initParams() {
      this.current = 1;
      this.size = 10;
      this.input = "";
      this.formData = {
        name: "", // 姓名
        mobilePhone: "", // 联系电话
        provenance: "", // 始发地
        detailAddress: "", // 详细地址
        defaultaddress: "0", // 是否默认
        area: "",
        city: "",
        prov: "",
      };
      this.rowData = {
        prov: "",
        city: "",
        area: "",
      };
    },
    provCityAreaList(item) {
      const { area, city, prov } = item;
      Object.assign(this.formData, area, city, prov);
    },
    checkradio(val) {
      const list = this.fakeList;
      list.forEach((item) => {
        item.radiocheck = false;
        if (item.id === val.id) {
          item.radiocheck = item.id;
          this.chooseId = item.id;
          this.$nextTick(() => {
            this.fakeList = list;
          });
        }
      });
    },
    dialogShow() {
      this.addressShow = true;
      this.current = 1;
      this.getList();
    },
    async searchList() {
      this.getList();
    },
    // 当前页
    handleCurrentChange(val) {
      this.current = val;
      this.getList();
    },
    addNewAddress(val, item) {
      // this.addressShow = false
      if (val === "edit") {
        this.addAddressTitle = this.$lang("编辑");
        this.$nextTick(() => {
          this.formData = {
            id: item.id,
            name: item.name, // 姓名
            mobilePhone: item.tel, // 联系电话
            provenance: `${item.prov ? item.prov : ""}${item.city ? "/" + item.city : ""}${item.area ? "/" + item.area : ""}`, // 始发地
            detailAddress: item.address, // 详细地址
            defaultaddress: item.defaultaddress, // 是否默认
            entrust: 0,
          };
          this.$nextTick(function () {
            this.rowData = {
              prov: item.prov,
              city: item.city,
              area: item.area,
            };
          });
        });
      } else {
        this.addAddressTitle = this.$lang("新增");
        this.formData = {
          name: "", // 姓名
          mobilePhone: "", // 联系电话
          provenance: "", // 始发地
          detailAddress: "", // 详细地址
          defaultaddress: "0", // 是否默认
          area: "",
          city: "",
          prov: "",
        };
        this.rowData = {
          prov: "",
          city: "",
          area: "",
        };
      }
      this.addAddress = !this.addAddress;
    },
    // 请求列表
    async getList() {
      this.fakeList = [];
      this.loading = true;
      const param = {
        size: this.size,
        current: this.current,
        type: 1,
        keyword: this.input,
        entrust: 0,
      };
      const { code, msg, data } = await this.COM_HTTP.reqList(param);
      if (code === RESPONSE_SUCCESS) {
        this.fakeListAll = data.records;
        this.total = data.total;
        if (data.records && data.records.length > 0) {
          data.records.map((item) => {
            this.fakeList.push({
              id: item.id,
              name: item.name,
              tel: item.contacts,
              address: item.address,
              radiocheck: false,
              defaultaddress: item.defaultaddress,
              entrust: "0",
              prov: item.prov ? item.prov : "",
              city: item.city ? item.city : "",
              area: item.area ? item.area : "",
            });
          });
        } else {
          this.nodata = true;
        }
        this.loading = false;
      } else {
        this.$message.warning(this.$lang(msg));
      }
    },
    // 新增地址
    saveAddress() {
      this.$refs["formData"].validate((valid) => {
        if (valid) {
          const { name, mobilePhone, provenance, detailAddress, defaultaddress, id } = this.formData;
          const list = {
            name: name, // string寄件区
            address: detailAddress,
            contacts: mobilePhone,
            defaultaddress, // 是否默认 1是，0否
            entrust: 0, // 是否被委托 1 是； 0否
            provCityArea: provenance,
          };
          if (this.addAddressTitle === this.$lang("编辑")) {
            list.id = id;
            this.updateAddress(list);
          } else {
            this.addAddressList(list);
          }
          this.addAddress = false;
        } else {
          this.$message.warning(this.$lang("请填写完整信息"));
        }
      });
    },
    async addAddressList(param) {
      const { code, msg } = await this.COM_HTTP.addAddressList(param);
      if (code === RESPONSE_SUCCESS) {
        this.$message.success(this.$lang("新增地址成功！"));
        this.getList();
      } else {
        this.$message.warning(this.$lang(msg));
      }
    },
    async updateAddress(param) {
      const { code, msg } = await this.COM_HTTP.updateAddress(param);
      if (code === RESPONSE_SUCCESS) {
        this.$message.success(this.$lang("修改地址成功！"));
        this.getList();
        return true;
      } else {
        this.$message.warning(this.$lang(msg));
        return false;
      }
    },
    async deleteAddress(params) {
      const { name, tel, provenance, address, id, defaultaddress } = params;
      const list = {
        id,
        name, // string寄件区
        address: address,
        contacts: tel,
        defaultaddress, // 是否默认 1是，0否
        entrust: 0, // 是否被委托 1 是； 0否
        provCityArea: provenance,
      };
      const { code, msg } = await this.COM_HTTP.deleteAddress(list);
      if (code === RESPONSE_SUCCESS) {
        this.$message.success(this.$lang("删除地址成功！"));
        this.getList();
      } else {
        this.$message.warning(this.$lang(msg));
      }
    },
    chooseAddress() {
      let list = {};
      this.fakeListAll.map((item) => {
        if (this.chooseId === item.id) {
          list = item;
        }
      });
      this.$emit("chooseList", list);
      this.addressShow = !this.addressShow;
    },
    async chooseDefaultaddress(item) {
      const { name, tel, provenance, address, defaultaddress, id, prov, city, area } = item;
      const list = {
        name, // string寄件区
        address,
        contacts: tel,
        defaultaddress, // 是否默认 1是，0否
        entrust: 0, // 是否被委托 1 是； 0否
        provCityArea: provenance || `${prov || ""}${city ? "/" + city : ""}${area ? "/" + area : ""}`,
        id,
      };
      const isSuc = await this.updateAddress(list);
      if (!isSuc) {
        // 设置失败 还原选项按钮
        item.defaultaddress = item.defaultaddress === "1" ? "0" : "1";
      }
    },
    closeDialog() {
      this.addAddress = false;
      this.$refs.formData.resetFields();
    },
    closeDialogOut() {
      this.initParams();
    },
    backaddAddress() {
      this.$confirm(this.$lang("您确定要取消保存此数据吗？"), this.$lang("温馨提示"), {
        confirmButtonText: this.$lang("确定"),
        cancelButtonText: this.$lang("取消"),
        closeOnClickModal: false,
        customClass: "common-confirm__topbar",
        confirmButtonClass: "comfirm-btn",
      })
        .then(() => {
          this.addAddress = false;
        })
        .catch(() => {
          this.addAddress = true;
        });
    },
    deleteAddressBefore(item) {
      this.$confirm(this.$lang("确认删除该条信息？"), this.$lang("温馨提示"), {
        confirmButtonText: this.$lang("确定"),
        cancelButtonText: this.$lang("取消"),
        closeOnClickModal: false,
        customClass: "common-confirm__topbar",
        confirmButtonClass: "comfirm-btn",
      })
        .then(() => {
          this.deleteAddress(item);
        })
        .catch(() => {
          console.log(this.$lang("取消删除"));
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.dialogbox {
  ::v-deep.el-dialog__body {
    padding: 0 !important;
  }
  .addresscontent {
    // margin: 0 20px;
    .content_top {
      display: flex;
      justify-content: space-between;
      .el-input {
        // width: 655px;
        margin-right: 16px;
      }
      .content_top_btn {
        height: 36px;
        border: 1px solid #e60012;
        border-radius: 4px;
        font-size: 14px;
        text-align: center;
        color: #e60012;
        line-height: 18px;
      }
      ::v-deep.el-input-group__append {
        background: #e60012 !important;
        color: #fff;
        padding: 0 12px;
        border-color: #e60012 !important;
      }
    }
    .content_center {
      // margin-top: 20px;
      // width: 755px;
      // height: 40px;
      // border: 1px dashed #cccccc;
      // border-radius: 8px;
      // text-align: center;
      line-height: 15px;
      span {
        // color: #61666d;
        margin-left: 8px;
      }
    }
    .content_bottom {
      margin-top: 20px;
      // height: 394px;
      .hasDate {
        height: 420px;
        overflow-y: scroll;
        margin-right: -26px;
        padding-right: 18px;
      }
      ::-webkit-scrollbar {
        width: 8px;
      }
      .contentlist {
        padding: 9px 16px;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        height: 80px;
        margin-bottom: 10px;
        .contentLeft {
          display: flex;
          justify-content: flex-start;
          flex: 1;
          align-items: center;
          .contentLeft_radio {
            display: flex;
            align-items: center;
            margin-right: 16px;
          }
          .contentLeft_rBox {
            .contentLeft_rBoxTop {
              display: flex;
              span {
                color: #4c4d57;
                line-height: 18px;
                // margin: 5px 0;
                font-size: 14px;
                font-weight: 500;
                max-width: 363px;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .contentLeft_rBoxTop_name {
                max-width: 350px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .contentLeft_rBoxTop_tel {
                margin-left: 35px;
              }
            }
            .contentLeft_rBox_address {
              color: #9499a3;
              line-height: 18px;
              font-size: 12px;
              margin-top: 8px;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
              overflow: hidden;
            }
          }
        }
        .contentRight {
          display: flex;
          // flex-direction: column;
          justify-content: space-between;
          align-items: center;
          margin-left: 30px;
          min-width: 120px;
          max-width: 215px;
          color: #e60012;
          // line-height: 46px;
          cursor: pointer;
          .contentRight_top {
            span {
              margin-left: 6px;
              color: #61666d;
              line-height: 20px;
              margin-top: 10px;
            }
          }
          .contentRight_bottom {
            span {
              margin-right: 22px;
            }
          }
        }
      }
      .contentlist.list-check {
        // box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.30);
        background: #fef2f3;
        border-color: #f9c1c6;
      }
      .contentlist:hover {
        border-color: #9499a3;
      }
    }
  }
  .bottom-wrap {
    //  border-radius: 12px;
    background-color: #ffffff;
    // padding: 20px;
    margin: 0 auto;
    display: block;
    text-align: center;
    .btn {
      width: 120px;
      background: #ffffff;
      border: 1px solid #e60012;
      border-radius: 4px;
      font-size: 14px;
      color: #e60012;
      line-height: 16px;
    }
    .red {
      background: #e60012;
      color: #ffffff;
      margin-left: 20px;
    }
  }
  .addressPagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    ::v-deep .el-pager li {
      background: #ffffff;
      border: 1px solid #b0b3b6;
      border-radius: 4px;
      margin: 0 5px;
      color: #61666d;
    }
    ::v-deep.el-pager li.active {
      color: #fff;
      background: #e60012;
      border: none;
    }
    ::v-deep.btn-prev {
      background: #f4f4f4;
      border: 1px solid #c4c8cc;
      border-radius: 4px;
      padding-right: 6px;
    }
    ::v-deep.btn-next {
      border: 1px solid #b0b3b6;
      border-radius: 4px;
      padding-left: 6px;
    }
  }
  .nodata {
    width: 362px;
    height: 342px;
    margin: 54px auto;
    position: relative;
    text-align: center;
    span {
      color: #bebebe;
      line-height: 16px;
      text-align: center;
      position: absolute;
      top: 70%;
      left: 40%;
    }
    img {
      width: 216px;
      margin-top: 50%;
      transform: translateY(-50%);
    }
  }
  .addaddressswitch {
    display: inline-block;
    width: 100%;
  }
  .bottom-wrap_footer {
    display: flex;
    justify-content: flex-end;
  }
}
.addresscontent {
  ::v-deep.el-input__inner {
    height: 32px !important;
    line-height: 32px !important;
  }
  ::v-deep.el-switch__core {
    width: 36px !important;
    height: 18px;
  }
  ::v-deep.el-switch__core::after {
    width: 14px;
    height: 14px;
  }
  .el-switch.is-checked ::v-deep.el-switch__core::after {
    margin-left: -15px;
  }
}
</style>

<style lang="scss">
.popover-rBoxTopname {
  background: #242628 !important;
  padding: 8px 12px;
  font-size: 12px;
  color: #ffffff !important;
  line-height: 16px;
  opacity: 0.8;
  .el-popper[x-placement^="top"] .popper__arrow::after {
    border-top-color: #242628 !important;
  }
  .el-popper[x-placement^="bottom"] .popper__arrow::after {
    border-bottom-color: #242628 !important;
  }
  .el-popper[x-placement^="bottom"] .popper__arrow {
    border-bottom-color: #242628 !important;
  }
}
.addaddress {
  .el-input--medium .el-input__inner,
  .el-input__inner {
    height: 32px;
  }
  .el-form-item {
    margin-bottom: 24px;
  }
  .el-form-item__content {
    line-height: 32px;
  }
  .el-form-item__label {
    line-height: 16px;
    margin-bottom: 2px;
  }
  .el-select {
    width: 100%;
  }
  .el-switch__core {
    width: 36px !important;
    height: 18px;
  }
  .el-switch__core::after {
    width: 14px;
    height: 14px;
  }
  .el-switch.is-checked .el-switch__core::after {
    margin-left: -15px;
  }
}
.dialogbox {
  ::v-deep.el-dialog__body {
    padding: 0 !important;
  }
}
.address-dialog {
  .el-dialog__body {
    padding-bottom: 0;
  }
  .el-dialog__footer {
    padding-top: 0;
    text-align: center;
    .el-button {
      width: 120px;
      line-height: 16px;
    }
  }
  .el-button + .el-button {
    margin-left: 16px;
  }
}
</style>
