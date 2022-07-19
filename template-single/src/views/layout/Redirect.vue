<script>
export default {
  created() {
    const { params } = this.$route
    const { path } = params
    this.$router.replace({ path: '/' + path })
  },
  render: function(h) {
    return h()
  }
}
</script>
