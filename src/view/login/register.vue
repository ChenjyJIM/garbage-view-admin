<template>
  <Form ref="formdata" :model="formdata" :rules="ruleValidate" :label-width="80">
    <h1 align="center">填写注册信息</h1>
    <FormItem label="姓名：" prop="name">
      <Input v-model="formdata.name" placeholder="填入您的姓名"></Input>
    </FormItem>
    <FormItem label="账号：" prop="loginName">
      <Input v-model="formdata.loginName" placeholder="填入账号，用于登录使用，请牢记"></Input>
    </FormItem>
    <FormItem label="密码" prop="passwd">
      <Input type="password" v-model="formdata.passwd"></Input>
    </FormItem>
    <FormItem label="确认密码" prop="passwdCheck">
      <Input type="password" v-model="formdata.passwdCheck"></Input>
    </FormItem>
    <FormItem label="邮箱：" prop="mail">
      <Input v-model="formdata.mail" placeholder="填入您的邮箱"></Input>
    </FormItem>
    <FormItem label="电话：" prop="phone">
      <Input v-model="formdata.phone" placeholder="填入您的电话"></Input>
    </FormItem>
    <FormItem label="性别：" prop="sex">
      <Row>
        <Col span="2">
          <RadioGroup v-model="formdata.sex">
            <Radio label="男">男</Radio>
            <Radio label="女">女</Radio>
          </RadioGroup>
        </Col>
      </Row>
    </FormItem>
    <FormItem label="备注" prop="memo">
      <Input v-model="formdata.memo" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="随便说点什么呗"></Input>
    </FormItem>
    <FormItem>
      <Button type="primary" @click="handleSubmit('formdata')">注册</Button>
      <Button @click="handleReset('formdata')" style="margin-left: 8px">重置</Button>
    </FormItem>
  </Form>
</template>
<script>
  import axios from '@/libs/api.request'

  export default {
    data () {
      const validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'))
        } else {
          if (this.formdata.passwdCheck !== '') {
            // 对第二个密码框单独验证
            this.$refs.formdata.validateField('passwdCheck')
          }
          callback()
        }
      }
      const validatePassCheck = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== this.formdata.passwd) {
          callback(new Error('两次密码不匹配!'))
        } else {
          callback()
        }
      }
      return {
        formdata: {
          msg: '',
          name: '',
          loginName: '',
          mail: '',
          passwd: '',
          passwdCheck: '',
          phone: '',
          sex: '',
          time: '',
          memo: ''
        },
        ruleValidate: {
          name: [
            { required: true, message: '名字不能为空！', trigger: 'blur' }
          ],
          loginName: [
            {
              required: true, message: '账号不能为空！', trigger: 'blur'
            }
          ],
          mail: [
            { required: true, message: '邮箱不能为空！', trigger: 'blur' },
            { type: 'email', message: '邮箱格式不正确！请检查！', trigger: 'blur' }
          ],
          phone: [
            { required: true, message: '电话不能为空！', trigger: 'blur' },
            { type: 'string', min: 11, max: 11, message: '电话号码为11位！请校验', trigger: 'blur' }
          ],
          sex: [
            { required: true, message: '请选择你的性别！', trigger: 'change' }
          ],
          passwd: [
            { validator: validatePass, trigger: 'blur' }, {
              type: 'string',
              min: 3,
              message: '密码长度不能小于6位',
              trigger: 'blur'
            }
          ],
          passwdCheck: [
            { validator: validatePassCheck, trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      // 该方法用来等待操作
      sleep (time) {
        return new Promise((resolve) => setTimeout(resolve, time))
      },
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          let that = this
          if (valid) {
            axios.request({
              url: 'authentication/guest/register',
              method: 'post',
              data: {
                loginName: that.formdata.loginName,
                loginPassword: that.formdata.passwd,
                name: that.formdata.name,
                sex: that.formdata.sex,
                mail: that.formdata.mail,
                phone1: that.formdata.phone,
                memo: that.formdata.memo,
                // '2' 表示注册类型为访客注册
                type: 2
              }
            }).then(res => {
              if (res.data.success) {
                that.$Message.success('注册成功!请记住您的账号：' + that.formdata.loginName + '\n即将跳转登录页面～')
                that.sleep(2000).then(() => {
                  // 这里写sleep之后需要去做的事情
                  that.$router.replace({path: 'login'})
                })
              } else {
                that.loading = false
                alert(res.data.errMsg)
              }
            }).catch(function (error) {
              that.$Message.error(error.code)
            })
          } else {
            that.$Message.error('注册失败，请检查!')
          }
        })
      },
      handleReset (name) {
        this.$refs[name].resetFields()
      }
    }
  }
</script>
