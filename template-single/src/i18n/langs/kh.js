// import lang from 'element-ui/lib/locale/lang/kh' // 引入element语言包-柬埔寨(暂无)
const lang = {
  el: {
    colorpicker: {
      confirm: 'កំណត់',
      clear: 'ទទេ'
    },
    datepicker: {
      now: 'នៅពេលនេះ',
      today: 'ថ្ងៃនេះ',
      cancel: 'បោះបង់',
      clear: 'ទទេ',
      confirm: 'កំណត់',
      selectDate: 'ជ្រើសរើសកាលបរិច្ឆេទ',
      selectTime: 'ជ្រើសរើសពេលវេលា',
      startDate: 'កាលបរិច្ឆេទចាប់ផ្តើម',
      startTime: 'ពេលវេលាចាប់ផ្តើម',
      endDate: 'កាលបរិច្ឆេទបញ្ចប់',
      endTime: 'ពេលវេលាបញ្ចប់',
      prevYear: 'នាំមុន',
      nextYear: 'ឆ្នាំបន្ទាប់',
      prevMonth: 'កាលពីខែមុន',
      nextMonth: 'ខែក្រោយ',
      year: 'ឆ្នាំ',
      month1: 'មករា',
      month2: 'ខែកុម្ភៈ',
      month3: 'មីនា',
      month4: 'ខែមេសា',
      month5: 'ឧសភា',
      month6: 'មិថុនា',
      month7: 'ខែកក្កដា',
      month8: 'សីហា',
      month9: 'ខែកញ្ញា',
      month10: 'តុលា',
      month11: 'វិច្ឆិកា',
      month12: 'ធ្នូ',
      // week: '周次',
      weeks: {
        sun: 'ថ្ងៃ',
        mon: 'មួយ',
        tue: 'ពីរ។',
        wed: 'បី',
        thu: 'បួន',
        fri: 'ប្រាំ',
        sat: 'ប្រាំមួយ'
      },
      months: {
        jan: 'មករា',
        feb: 'ខែកុម្ភៈ',
        mar: 'មីនា',
        apr: 'ខែមេសា',
        may: 'ឧសភា',
        jun: 'មិថុនា',
        jul: 'ខែកក្កដា',
        aug: 'សីហា',
        sep: 'ខែកញ្ញា',
        oct: 'តុលា',
        nov: 'វិច្ឆិកា',
        dec: 'ធ្នូ'
      }
    },
    select: {
      loading: 'កំពុងផ្ទុក',
      noMatch: 'មិនមានទិន្នន័យត្រូវគ្នា',
      noData: 'គ្មានទិន្នន័យ',
      placeholder: 'សូមជ្រើសរើស'
    },
    cascader: {
      noMatch: 'មិនមានទិន្នន័យត្រូវគ្នា',
      loading: 'កំពុងផ្ទុក',
      placeholder: 'សូមជ្រើសរើស',
      noData: 'មិនទាន់មានទិន្នន័យនៅឡើយទេ'
    },
    pagination: {
      goto: 'ទៅ',
      pagesize: 'មាត្រា/ទំព័រ',
      total: 'សរុប។ {total}',
      pageClassifier: 'ទំព័រ'
    },
    messagebox: {
      title: 'ប្រអប់បញ្ចូល',
      confirm: 'កំណត់',
      cancel: 'បោះបង់',
      error: 'ទិន្នន័យដែលបានបញ្ចូលមិនស្របច្បាប់ទេ!'
    },
    upload: {
      deleteTip: 'ចុចលុបដើម្បីលុប',
      delete: 'លុប',
      preview: 'មើលរូបភាព',
      continue: 'បន្តផ្ទុកឡើង'
    },
    table: {
      emptyText: 'មិនទាន់មានទិន្នន័យនៅឡើយទេ',
      confirmFilter: 'ការចាក់បញ្ចាំង',
      resetFilter: 'កំណត់ឡើងវិញ',
      clearFilter: 'ទាំងអស់',
      sumText: 'សរុប'
    },
    tree: {
      emptyText: 'មិនទាន់មានទិន្នន័យនៅឡើយទេ'
    },
    transfer: {
      noMatch: 'មិនមានទិន្នន័យត្រូវគ្នា',
      noData: 'គ្មានទិន្នន័យ',
      titles: ['បញ្ជី 1', 'បញ្ជី 2'],
      filterPlaceholder: 'សូមបញ្ចូលការស្វែងរករបស់អ្នក',
      noCheckedFormat: 'សរុប។ {total} ធាតុ',
      hasCheckedFormat: 'បានជ្រើសរើស {checked}/{total} ធាតុ'
    },
    image: {
      error: 'ការផ្ទុកបានបរាជ័យ'
    },
    pageHeader: {
      title: 'ត្រឡប់'
    }
  }
}

const messages = {
  message: {
    'text': 'Good good study, Day day up'
  },
  ...lang
}

export default messages
