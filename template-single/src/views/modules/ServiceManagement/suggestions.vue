<!--
 * @Description: 投诉建议
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-07-14 15:31:41
 * @LastEditors: zhaoyy
 * @LastEditTime: 2021-10-18 18:39:35
-->
<template>
  <div class="suggestions_main">
    <div class="suggestions-content">
      <el-form :model="suggestionsForm" size="medium" :rules="rules" ref="suggestionsForm">
        <el-row :gutter="30">
          <el-col :span="12">
            <el-form-item :label="$lang('主题') + '：'" required prop="title">
              <el-input v-model="suggestionsForm.title" maxlength="200" :placeholder="$lang('请输入')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$lang('运单号') + '：'" prop="billcode">
              <el-input v-model="suggestionsForm.billcode" maxlength="20" :placeholder="$lang('请输入')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$lang('内容') + '：'" required prop="content">
              <el-input v-model="suggestionsForm.content" type="textarea" rows="6" maxlength="500" :placeholder="$lang('请输入')" show-word-limit></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="suggestions-buttons">
      <el-button type="primary" @click="commit" :disabled="commitDisabled">{{ $lang("提交") }}</el-button>
    </div>
  </div>
</template>

<script>
import mixin from "@/mixins/mixin";
import { RULES } from "@/@public/utils/rules.js";
import { Suggestions } from "@/api/index.js";
import { RESPONSE_CODE } from "@public/http/config";
export default {
  name: "Suggestions",
  mixins: [mixin],
  data() {
    return {
      COM_HTTP: Suggestions,
      suggestionsForm: {},
      isShowFirst: false,
      rules: {
        title: [RULES.required],
        billcode: [RULES.required],
        content: [RULES.required],
      },
    };
  },
  computed: {
    commitDisabled() {
      return !(this.suggestionsForm.title && this.suggestionsForm.content && this.suggestionsForm.billcode);
    },
  },
  methods: {
    // 提交方法
    async commit() {
      this.$refs.suggestionsForm.validate(async (valid) => {
        if (valid) {
          const params = this.suggestionsForm;
          const { data, code, msg } = await Suggestions.saveSuggestions(params);
          if (code === RESPONSE_CODE.SUCCESS) {
            console.log(data, "================");
            this.$message.success(msg);
            this.suggestionsForm = {};
          } else {
            this.$message.error(msg);
          }
        } else {
          return false;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.suggestions_main {
  background: #fff;
  border-radius: 0 4px 4px 4px;
  padding: 16px;
}
.el-button.is-disabled, .el-button.is-disabled:focus, .el-button.is-disabled:hover {
    color: #fff;
    cursor: not-allowed;
    background-image: none;
    background-color: #C0C4CC;
    border-color: #EBEEF5;
}
.suggestions-content,
.suggestions-buttons {
  width: 736px;
}
.suggestions-buttons {
  // margin-top: 20px;
  text-align: center;
}
</style>
<style lang="scss">
.suggestions_main {
  .el-form-item {
    margin-bottom: 24px;
  }
  .el-form-item__label {
    font-size: 12px;
    line-height: 16px;
  }
  .el-input,
  .el-textarea {
    margin-top: 2px;
    font-size: 12px;
    .el-input__count {
      background-color: #00000000;
    }
  }
  .el-input__inner {
    height: 32px;
    line-height: 32px;
  }
  .el-button {
    padding: 11px 63px;
  }
}
</style>
