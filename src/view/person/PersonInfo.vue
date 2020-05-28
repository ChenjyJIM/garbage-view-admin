<template>
  <div class="container">
    <Form ref="formInline" inline>
      <FormItem prop="account">
        <h1>个人信息</h1>

      </FormItem>
    </Form>
    <Form ref="formdata" :model="formdata" :rules="ruleValidate" :label-width="80" :label-height="100">
      <FormItem label="您的姓名：" prop="name">
        <Input v-model="formdata.name" value="formdata.name"></Input>
      </FormItem>
      <!--<FormItem label="您的账号：" prop="loginName" >-->
        <!--<Input v-model="formdata.loginName" disabled=""></Input>-->
      <!--</FormItem>-->
      <FormItem label="您的邮箱：" prop="mail">
        <Input v-model="formdata.mail"></Input>

      </FormItem>
      <!--<FormItem label="您加入的学会：" prop="instId">-->
        <!--<Input v-model="formdata.instId"disabled=""></Input>-->

      <!--</FormItem>-->
      <FormItem label="您的电话：" prop="phone">
        <Input v-model="formdata.phone"></Input>

      </FormItem>
      <FormItem label="您的性别：" prop="sex">
        <Row>
          <Col span="2">
            <RadioGroup v-model="formdata.sex" value="formdata.sex">
              <!--<Radio label="男" v-if="formdata.sex == '女'" disabled="">男</Radio>-->

              <Radio label="女">女</Radio>

              <Radio label="男">男</Radio>
            </RadioGroup>
          </Col>
        </Row>
      </FormItem>
      <!--<FormItem label="生日：">-->
        <!--<Row>-->
          <!--<Col span="3">-->
            <!--<FormItem prop="birthday">-->
              <!--<DatePicker type="date" confirm format="yyyy年M月d日" :value="formdata.birthday"  v-model="formdata.birthday" v-if="show === false" disabled=""></DatePicker>-->
              <!--<DatePicker type="date" confirm format="yyyy年M月d日" :value="formdata.birthday"  v-model="formdata.birthday" v-if="show === true"></DatePicker>-->
            <!--</FormItem>-->
          <!--</Col>-->
        <!--</Row>-->
      <!--</FormItem>-->
      <!--<FormItem label="您的名族：" prop="ethnic">-->
        <!--<Input v-model="formdata.ethnic" v-if="show === false" disabled=""></Input>-->
        <!--<Input v-model="formdata.ethnic" v-if="show === true"></Input>-->

      <!--</FormItem>-->
      <!--<FormItem label="您的党派：" prop="partisan">-->
        <!--<Input v-model="formdata.partisan" v-if="show === false" disabled=""></Input>-->
        <!--<Input v-model="formdata.partisan" v-if="show === true"></Input>-->

      <!--</FormItem>-->
      <!--<FormItem label="您的qq：" prop="qq">-->
        <!--<Input v-model="formdata.qq" v-if="show === false" disabled=""></Input>-->
        <!--<Input v-model="formdata.qq" v-if="show === true"></Input>-->

      <!--</FormItem>-->
      <!--<FormItem label="您的微信：" prop="wechat">-->
        <!--<Input v-model="formdata.wechat" v-if="show === false" disabled=""></Input>-->
        <!--<Input v-model="formdata.wechat" v-if="show === true"></Input>-->

      <!--</FormItem>-->
      <FormItem label="您的备注" prop="memo">
        <Input v-model="formdata.memo" type="textarea" :autosize="{minRows: 2,maxRows: 5}"></Input>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="infoModified('formdata')">修改</Button>
        <!--<Button @click="handleReset('formdata')" style="margin-left: 8px">取消</Button>-->
      </FormItem>
    </Form>
  </div>
</template>
<script>
// import dateFormat from '../../../build/util.js'
export default {
  data () {
    return {
      model1: '',
      docCatagory: '未选择',
      taskExecId: '1',
      show: false,
      ruleValidate: {
        name: [
          { required: true, message: '名字不能为空！', trigger: 'blur' }
        ],
        mail: [
          { type: 'email', message: '邮箱格式不正确！请检查！', trigger: 'blur' }
        ],
        phone: [
          { type: 'string', min: 11, max: 11, message: '电话号码为11位！请校验', trigger: 'blur' }
        ]
      },
      formdata: {
        msg: '',
        instId: '',
        name: '',
        loginName: '',
        mail: '',
        phone: '',
        sex: '',
        birthday: '',
        memo: '',
        ethnic: '',
        partisan: '',
        qq: '',
        wechat: '',
        others: ''

      }
    }
  },
  mounted () {
    this.fetchData()
  },
  methods: {

    selectSubEvent: function (value) {
      this.docCatagory = value
    },

    exportData: function () {
      let url = `//localhost:8081/upload/download?taskExecId=${this.taskExecId}`
      window.open(url)
    },

    dateFormat (timestamp, format) {
      var date = {
        'M+': timestamp.getMonth() + 1,
        'd+': timestamp.getDate(),
        'h+': timestamp.getHours(),
        'm+': timestamp.getMinutes(),
        's+': timestamp.getSeconds(),
        'q+': Math.floor((timestamp.getMonth() + 3) / 3),
        'S+': timestamp.getMilliseconds()
      }

      if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (timestamp.getFullYear() + '').substr(4 - RegExp.$1.length))
      }

      for (var k in date) {
        if (new RegExp('(' + k + ')').test(format)) {
          format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? date[k] : ('00' + date[k]).substr(('' + date[k]).length))
        }
      }

      return format
    },
    fetchData () {
      var that = this
      let instance = this.$ajax.create({
        // 用来将token放到header上
        headers: {'token': window.localStorage.getItem('token')}
      })
      instance.get(that.GLOBAL.serverPath + '/member/getCurrentUser', {})
        .then(function (response) {
          if (response.data.success) {
            that.formdata.loginName = window.localStorage.getItem('personId')
            that.formdata.name = response.data.data.name == null?response.data.data.guestName : response.data.data.name
            that.formdata.mail = response.data.data.mail == null?response.data.data.guestEmail: response.data.data.mail
            that.formdata.sex = response.data.data.sex == null?response.data.data.guestSex:response.data.data.sex
            that.formdata.phone = response.data.data.phone1 == null?response.data.data.guestPhone:response.data.data.phone1
            that.formdata.memo = response.data.data.memo
            that.formdata.ethnic = response.data.data.ethnic
            that.formdata.partisan = response.data.data.partisan
            that.formdata.qq = response.data.data.qq
            that.formdata.wechat = response.data.data.wechat
            that.formdata.others = response.data.data.others
            that.formdata.birthday = that.dateFormat(new Date(response.data.data.birthday * 1000), 'yyyy-MM-dd')
          } else {
            alert(response.data.errMsg)
          }
        })
        .catch(function (error) {
          console.log(error)
          alert('服务器开小差啦～～ \n' + error.message)
        })
    },
    infoModified (name) {
      this.$refs[name].validate((valid) => {
        let that = this

        let instance = this.$ajax.create({
          // 用来将token放到header上
          headers: {'token': window.localStorage.getItem('token')}
        })
        if (valid) {
          instance.post(that.GLOBAL.serverPath + '/member/infoModified', {
            name: that.formdata.name,
            sex: that.formdata.sex,
            birthday: that.formdata.birthday,
            ethnic: that.formdata.ethnic,
            partisan: that.formdata.partisan,
            mail: that.formdata.mail,
            phone1: that.formdata.phone,
            qq: that.formdata.qq,
            wechat: that.formdata.wechat,
            memo: that.formdata.memo
          })
            .then(function (response) {
              if (response.data.success) {
                console.log(response.data)
                alert('修改成功')
              } else {
                alert('修改失败：' + response.data.errMsg)
              }
            })
            .catch(function (error) {
              alert('服务器开小差啦～～ \n' + error.message)
            })
        } else {
          that.$Message.error('修改失败，请检查!')
        }
      })
    },
    // 该方法用来等待操作
    handleSubmit (name) {
      alert(window.localStorage.getItem('type'))
      this.show = true
    },
    enableEdit (name) {
      this.show = true
    },
    handleReset (name) {
      this.show = false
    }
  }
}
</script>
