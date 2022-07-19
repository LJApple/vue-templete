
export default {
  data(){
    return {
      months: {
        '01': this.$lang('一月'),
        '02': this.$lang('二月'),
        '03': this.$lang('三月'),
        '04': this.$lang('四月'),
        '05': this.$lang('五月'),
        '06': this.$lang('六月'),
        '07': this.$lang('七月'),
        '08': this.$lang('八月'),
        '09': this.$lang('九月'),
        '10': this.$lang('十月'),
        '11': this.$lang('十一月'),
        '12': this.$lang('十二月'),
      }
    }
  },
  methods: {
    // 千分位处理
    generatingThousandthPers(num) {
      num += '';
      const num1 = num.split('.')[0];
      const num2 = num.split('.')[1];
      const c = num1.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
      return num.toString().indexOf('.') !== -1 ? c + ('.') + num2 : c;
    },
    // 月份处理
    monthChange(month) {
      if(!month) {
        return ''
      }
      // 传入进来的是 0000-00的时间格式
      // 先切割,切割好去数组的第二个元素，及月份
      const months = month.split('-')
      return this.months[months[1]] || ''
    }
  },
}
