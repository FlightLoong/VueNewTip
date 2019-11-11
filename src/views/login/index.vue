<template>
  <div class="login-container">
    <div class="login-form-wrap">
      <div class="login-header">
        <img src="./logo_index.png" alt="黑马头条">
      </div>
      <div class="login-body">
        <el-form ref="form" :model="form">
          <el-form-item class="mobile">
            <el-input v-model="form.mobile"></el-input>
          </el-form-item>
          <el-form-item>
            <el-col :span="16">
              <el-input v-model="form.code"></el-input>
            </el-col>
            <el-col :span="4" :offset="1">
              <el-button @click="getCode">发送验证码</el-button>
            </el-col>
          </el-form-item>
          <el-form-item>
            <el-button class="login" type="primary" @click="onSubmit">立即创建</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import '@/vendors/gt.js'

export default {
  name: 'AppLogin',
  data () {
    return {
      form: {
        mobile: '18361261959',
        code: '',
        captchaObj: null // 通过 initGeetest 得到的极验验证码对象
      }
    }
  },
  methods: {
    onSubmit () {
      console.log('submit!')
    },

    // 获取验证码
    getCode: function () {
      const { mobile } = this.form

      if (this.captchaObj) {
        return this.captchaObj.verify()
      }

      axios({
        method: 'get',
        url: `http://ttapi.research.itcast.cn/mp/v1_0/captchas/${mobile}`
      }).then(res => {
        console.log(res.data)
        const data = res.data.data

        window.initGeetest({
          // 以下配置参数来自服务端 SDK
          gt: data.gt,
          challenge: data.challenge,
          offline: !data.success,
          new_captcha: data.new_captcha,
          product: 'bind' // 隐藏按钮式
        }, (captchaObj) => {
          this.captchaObj = captchaObj
          // 这里可以调用验证实例 captchaObj 的实例方法
          captchaObj.onReady(function () {
            captchaObj.verify()
          }).onSuccess(function () {
            console.log('验证成功了……')
          }).onError(function () {
            console.log('验证失败了……')
          })
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
  background-image: url("./login_bg.jpg");
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-form-wrap {
    background-color: #fff;
    border-radius: 10px;

    .login-header {
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 30px;

      img {
        width: 200px;
      }
    }
    .login-body {
      padding: 15px 50px 40px;

      .el-form-item.mobile {
        width: 382px;
      }

      .login {
        width: 100%;
      }
    }
  }
}
</style>
