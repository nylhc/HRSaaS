<template>
  <div class="login-container">
    <div class="logo" />
    <div class="form">
      <h1>登录</h1>
      <el-card
        shadow="never"
        class="login-card"
      >
        <!--登录表单-->
        <!-- el-form 表单校验的步骤 -->
        <!-- 1, 为 form 绑定俩属性 model rules -->
        <!-- 2, 为每一个 el-form-item 指定一个 prop 属性，值和双向绑定的字段名一致 -->
        <!-- 3，为每一个表单元素双向绑定 -->

        <!-- ref 俩作用 -->
        <!-- 1，如果绑定到了html标签上，得到的是原生的DOM元素 -->
        <!-- 2，如果绑定到了组件上，得到的是组件的实例对象 -->
        <!-- （进而可以访问组件内的数据和方法了） -->
        <el-form
          ref="loginForm"
          :model="formData"
          :rules="formRules"
        >
          <el-form-item prop="mobile">
            <el-input
              v-model="formData.mobile"
              placeholder="请输入手机号"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="formData.password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
          <el-form-item prop="isAgree">
            <el-checkbox v-model="formData.isAgree">用户平台使用协议</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button
              style="width: 350px"
              type="primary"
              @click="onSubmit"
            >登录</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>
<script>
import { mapActions } from 'vuex'
export default {
  name: 'Login',
  data() {
    return {
      formData: {
        mobile: process.env.NODE_ENV === 'development' ? '13800000002' : '',
        password: process.env.NODE_ENV === 'development' ? 'hm#qd@23!' : '',
        isAgree: process.env.NODE_ENV === 'development'
      },
      formRules: {
        mobile: [
          {
            required: true,
            message: '手机号不能为空',
            trigger: 'blur' // change
          }, {
            pattern: /1[3-9]\d{9}/,
            message: '手机号格式不正确',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '密码不能为空',
            trigger: 'blur' // change
          }, {
            min: 6,
            max: 16,
            message: '密码字符在6-16位之间',
            trigger: 'blur'
          }
        ],
        // required只能检查 null "" undefined
        // 不能检查值为 true 或者 false的情况
        isAgree: [
          {
            // 自定义校验规则
            validator(rule, value, cb) {
              // 如果选中了，即 value === true
              // 校验才算通过，cb()
              // 否则，校验不通过，cb(new Error(错误原因))
              value ? cb() : cb(new Error('您必须勾选用户的使用协议'))
            }
          }
        ]
      }
    }
  },
  methods: {
    ...mapActions('user', ['login']),
    async onSubmit() {
      // this.$refs.loginForm.validate(async (isOk) => {
      //   // 只有全部校验通过，isOK 才为true，否则为false
      //   // console.log('isOk', isOk)
      //   if (isOk) {
      //     // 一旦promise内部出了错误，程序将中止
      //     await this.login(this.formData)
      //     // 既然完成了登录，接下来跳到首页中
      //     this.$router.push('/')
      //   }
      // })

      await this.$refs.loginForm.validate()

      // 一旦promise内部出了错误，程序将中止
      await this.login(this.formData)
      // 既然完成了登录，接下来跳到首页中
      this.$router.push('/')
    }
  }
}
</script>
<style lang="scss">
.login-container {
  display: flex;
  align-items: stretch;
  height: 100vh;
  .logo {
    flex: 3;
    background: rgba(38, 72, 176) url(../../assets/common/login_back.png)
      no-repeat center / cover;
    border-top-right-radius: 60px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    padding: 0 100px;
    .icon {
      background: url(../../assets/common/logo.png) no-repeat 70px center /
        contain;
      width: 300px;
      height: 50px;
      margin-bottom: 50px;
    }
    p {
      color: #fff;
      font-size: 18px;
      margin-top: 20px;
      width: 300px;
      text-align: center;
    }
  }
  .form {
    flex: 2;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 176px;
    .el-card {
      border: none;
      padding: 0;
    }
    h1 {
      padding-left: 20px;
      font-size: 24px;
    }
    .el-input {
      width: 350px;
      height: 44px;
      .el-input__inner {
        background: #f4f5fb;
      }
    }
    .el-checkbox {
      color: #606266;
    }
  }
}
</style>
