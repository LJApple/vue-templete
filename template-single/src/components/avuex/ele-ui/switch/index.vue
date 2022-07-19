<template>
  <div>
    <el-switch v-model="text"
      @change="handleChange"
      @click.native="handleClick"
      :active-value="active[valueKey] || 1"
      :inactive-value="inactive[valueKey] || 2"
      :disabled="disabled"
      :readonly="readonly"
      active-color="#e60012"
      inactive-color="#9499A3"
      :size="size"
      class="avue-switch"></el-switch>
  </div>
</template>

<script>
import create from '../../core/create';
import props from '../../core/common/props.js';
import event from '../../core/common/event.js';
export default create({
  name: 'switch',
  mixins: [props(), event()],
  props: {
    value: {}
  },
  data() {
    return {};
  },
  watch: {},
  created() {},
  mounted() {},
  computed: {
    active() {
      return (this.dic || []).find((currentValue, index, arr) => {
        return currentValue[this.valueKey] === 1
      }) || this.dic[1] || {};
    },
    inactive() {
      return (this.dic || []).find((currentValue, index, arr) => {
        return currentValue[this.valueKey] !== 1
      }) || this.dic[0] || {};
    }
  },
  methods: {}
});
</script>

<style lang="scss">
.avue-switch{
  .el-switch__core{
    width: 36px !important;
    height: 18px !important;
  }
  .el-switch__core::after{
    width: 14px;
    height: 14px;
  }
}
.avue-switch.is-checked .el-switch__core::after{
  margin-left: -15px;
}
</style>
