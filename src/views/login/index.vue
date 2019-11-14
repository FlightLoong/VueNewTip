<template>
  <div class="login-container">
    <div class="login-form-wrap">
      <div class="login-header">
        <img src="./logo_index.png" alt="黑马头条">
      </div>
      <div class="login-body">
        <el-form :model="form" :rules="rules" ref="ruleForm">
          <el-form-item class="mobile" prop="mobile">
            <el-input v-model="form.mobile"></el-input>
          </el-form-item>
          <el-form-item prop="code">
            <el-col :span="16">
              <el-input v-model="form.code"></el-input>
            </el-col>
            <el-col :span="4" :offset="1">
              <el-button
                @click="getCode"
                :disabled="!!codeTimer || codeLoding"
              >{{codeTimer ? `剩余${codeSecond}秒` : `发送验证码`}}</el-button>
            </el-col>
          </el-form-item>
          <el-form-item prop="agree">
            <el-checkbox v-model="form.agree"/>
            <span class="loginAgree">
              我已阅读并同意
              <a href="">用户协议</a>和
              <a href="">隐私条款</a>
            </span>
          </el-form-item>
          <el-form-item>
            <el-button
              class="login"
              :loading="loginLoading"
              type="primary"
              @click="handleLogin"
            >立即登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import '@/vendors/gt.js'
const initCodeSeconds = 60

export default {
  name: 'AppLogin',
  data () {
    return {
      form: {
        mobile: '18361261959',
        code: '',
        agree: ''
      },
      captchaObj: null, // 通过 initGeetest 得到的极验验证码对象
      rules: {
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { len: 11, message: '手机号码错误', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '验证码错误', trigger: 'blur' }
        ],
        agree: [
          { required: true, message: '请同意用户协议', trigger: 'change' },
          { pattern: /true/, message: '请同意用户协议', trigger: 'change' }
        ]
      },
      loginLoading: false,
      codeTimer: null, // 每秒倒计时时间
      codeSecond: initCodeSeconds, // 倒计时时间
      secondMobile: '',
      codeLoding: false
    }
  },
  methods: {
    handleLogin () {
      this.loginLoading = true
      // 对表单进行验证
      this.$refs['ruleForm'].validate((valid) => {
        if (!valid) {
          this.loginLoading = false
          return
        }

        // 验证通过，执行登录
        this.login()
      })
    },

    // 登录的逻辑方法
    login () {
      axios({
        method: 'post',
        url: `http://ttapi.research.itcast.cn/mp/v1_0/authorizations`,
        data: this.form
      }).then(res => {
        this.$message({
          message: '登录成功',
          type: 'success'
        })

        this.$router.push({
          name: 'home'
        })

        this.loginLoading = false
      }).catch(err => {
        if (err.response.status === 400) {
          this.$message.error('登录失败，手机或验证码错误')
          this.loginLoading = false
        }
      })
    },

    // 获取验证码
    getCode: function () {
      // 对单个属性进行校验，验证手机号是否正确
      this.$refs['ruleForm'].validateField('mobile', errorMessage => {
        if (errorMessage.trim().length > 0) {
          return
        }

        // 如果手机号正确，初始化验证码操作
        if (this.captchaObj) {
          // 如果用户输入的手机号和之前的手机号不一致，需要基于最新的手机号重新初始化
          // 否则，就直接 verify 显示
          if (this.form.mobile !== this.secondMobile) {
            // 重新初始化验证码插件
            document.body.removeChild(document.querySelector('.geetest_panel'))
            this.showGeetest()
          } else {
            // 两次输入手机一致，直接显示
            this.captchaObj.verify()
          }
        } else {
          // 第一次初始化验证码插件
          this.showGeetest()
        }
      })
    },

    // 获取验证码逻辑方法
    showGeetest () {
      const { mobile } = this.form

      // 初始化验证码期间，禁用按钮，防止多次触发
      this.codeLoding = true

      // if (this.captchaObj) {
      //   return this.captchaObj.verify()
      // }

      // 第一步：获取验证参数
      axios({
        method: 'get',
        url: `http://ttapi.research.itcast.cn/mp/v1_0/captchas/${this.form.mobile}`
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
          captchaObj.onReady(() => {
            this.secondMobile = this.form.mobile
            // 第二步：验证预判定，由客户端完成，实现初步预检测
            captchaObj.verify()
            this.codeLoding = false
          }).onSuccess(() => {
            // 第三步：核心验证过程
            const {
              geetest_challenge: challenge,
              geetest_seccode: seccode,
              geetest_validate: validate
            } = captchaObj.getValidate()

            // 第四步：调用获取短信验证码 (极验 API2) 接口，发送短信到手机
            axios({
              method: 'get',
              url: `http://ttapi.research.itcast.cn/mp/v1_0/sms/codes/${mobile}`,
              params: {
                challenge,
                seccode,
                validate
              }
            }).then((res) => {
              console.log(res.data)
              this.codeCountDown()
            })
          }).onError(function () {
            console.log('验证失败了……')
          })
        })
      })
    },

    // 倒计时
    codeCountDown () {
      this.codeTimer = window.setInterval(() => {
        this.codeSecond--
        if (this.codeSecond <= 0) {
          this.codeSecond = initCodeSeconds
          this.codeTimer = null
          window.clearInterval(this.codeTimer)
        }
      }, 1000)
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

      .loginAgree {
        color: #999;
        margin-left: 8px;

        a {
          color: #409eff;
        }
      }
    }
  }
}
</style>
