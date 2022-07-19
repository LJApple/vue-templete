<template>
  <div id="google_root"></div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  props: ["sitekey"], // 所要传的秘钥
  mounted() {
    const language = this.lang === "EN" ? "en" : "zh";
    var script = document.createElement("script");
    script.src =
      "https://www.recaptcha.net/recaptcha/api.js?render=explicit&hl=" +
      language;
    document.head.appendChild(script);
    setTimeout(() => {
      this.onloaded();
    }, 500);
  },
  computed: {
    ...mapGetters(["lang"]),
  },
  methods: {
    onloaded() {
      if (window.grecaptcha) {
        window.grecaptcha.render("google_root", {
          sitekey: this.sitekey, // 公钥
          theme: "light", // 主题颜色，有light与dark两个值可选
          badge: "inline",
          size: "normal", // 尺寸规则，有normal与compact两个值可选
          callback: this.successCallback, // 验证成功回调
          "expired-callback": this.expiredCallback, // 验证过期回调
          "error-callback": this.errorCallback, // 验证错误回调
        });
      }
    },
    successCallback() {
      this.$emit("googleValidate", true);
    },
    errorCallback() {
      this.$emit("googleValidate", false);
    },
    expiredCallback() {
      this.$emit("googleValidate", false);
    },
  },
};
</script>
<style lang="scss" scoped>
.grecaptcha-badge {
  visibility: hidden;
}
</style>
