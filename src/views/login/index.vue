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

export default {
  name: 'AppLogin',
  data () {
    return {
      form: {
        mobile: '18361261959',
        code: ''
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

      axios({
        method: 'get',
        url: `http://ttapi.research.itcast.cn/mp/v1_0/captchas/${mobile}`
      }).then(res => {
        console.log(res.data)
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
