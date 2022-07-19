<template>
  <div class="radio-date">
    <el-radio-group v-model="dateType" :size="size" @change="radioChange" :disabled="disabled" class="radio">
      <el-radio v-for="(item,index) in dic"
                :label="item.prop"
                :readonly="readonly"
                :disabled="item[disabledKey]"
                :key="index">{{item[labelKey]}}</el-radio>
    </el-radio-group>
    <div class="daterange">
      <div class="date">
        <el-date-picker
          ref="start"
          v-model="text.start"
          type="datetime"
          default-time="23:59:59"
          @change="changeStart"
          :placeholder="$lang(startPlaceholder)">
        </el-date-picker>
      </div>
      <div class="date end">
        <el-date-picker
          ref="end"
          v-model="text.end"
          type="datetime"
          default-time="12:59:59"
          :picker-options="pickerOptionsEnd"
          :placeholder="$lang(endPlaceholder)">
        </el-date-picker>
      </div>
    </div>
  </div>
</template>

<script>
import create from '../../core/create'
import { GetDateStr } from '../../utils/date.js'
import props from '../../core/common/props.js'
import event from '../../core/common/event.js'
import dayjs from 'dayjs';
export default create({
  name: 'radio-date',
  mixins: [props(), event()],
  data() {
    return {
      text: { start: '', end: '' },
      dateType: '',
      datetime: [GetDateStr(0), GetDateStr(30)]
    }
  },
  props: {
    default: {
      type: Boolean,
      default: false
    },
    value: {},
    startPlaceholder: {
      type: String,
      default: '开始日期'
    },
    endPlaceholder: {
      type: String,
      default: '结束日期'
    },
    defaultTime: {
      type: [Array, String]
    },
    pickerOptions: {
      type: Object,
      default: () => {}
    },
    valueFormat: {
      type: String,
      default: 'yyyy-MM-dd HH:mm:ss'
    }
  },
  computed: {
    // demoType === 1 结束时间的配置
    pickerOptionsEnd() {
      return {
        disabledDate: (time) => {
          const selectTime = time.getTime()
          const valTime = this.text.start && new Date(this.text.start) || ''
          if (!valTime) return ''
          return selectTime < valTime
        }
      }
    }
  },
  watch: {
    datetime() {
      this.text = ''
      this.setCurrent((this.datetime || []).join(','))
    }
  },
  created() {
    if (this.isDategroup) {
      this.init()
    }
  },
  mounted() {
    this.dateType = this.dic[0].prop
  },
  methods: {
    // handleChange(val) {
    //   this.setCurrent(val);
    // },
    setCurrent(val) {
      this.$emit('input', val)
      this.$emit('change', val)
    },
    radioChange(prop) {
      console.log(prop);
    },
    changeStart(val) {
      const endTime = this.endTime
      if (val && !endTime || val > endTime) {
        // 结束时间处理成 23::59:59
        const time = dayjs(new Date(val)).format('YYYY-MM-DD') + ' 23:59:59'
        // 更新结束时间
        this.text.end = time
        this.$refs.end.focus()
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.radio-date{
  width: 420px;
  .radio{
    margin-bottom: 3px;
  }
  .daterange{
    display: flex;
    justify-content: space-between;
    .date{
      flex: 1 auto;
    }
    .end{
      margin-left: 20px;
    }
  }
}
</style>
