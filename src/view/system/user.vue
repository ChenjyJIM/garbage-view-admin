<template>
    <div>
      <Form :model="dataForm" inline>
        <FormItem>
          <Input v-model="dataForm.userName" placeholder="用户名" clearable />
        </FormItem>
        <FormItem>
          <Button @click="getDataList()">查询</Button>
          <Button type="primary" @click="addOrUpdateHandle()">新增</Button>
          <Button type="error" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量停用</Button>
        </FormItem>
      </Form>
      <Table stripe :columns="columns" :data="dataList" @on-selection-change="selectChangeHandle" :loading="dataListLoading"></Table>
      <div style="margin: 10px;overflow: hidden">
        <div style="float: right;">
          <Page :total="totalUser" :current="pageIndex" show-sizer @on-change="changePage" @on-page-size-change="sizeChangeHandle"></Page>
        </div>
      </div>
      <Drawer
        :title="formData.id ? '修改' : '新增'"
        v-model="addOrUpdateVisible"
        width="720"
        :mask-closable="false"
        :styles="styles"
      >
        <Form ref="formData" :model="formData" :rules="ruleValidate">
          <p :style="pStyle">账号信息</p>
          <div class="demo-drawer-profile">
            <FormItem label="账号：" prop="loginName">
              <Input v-model="formData.loginName" placeholder="填入账号，用于登录使用，请牢记"></Input>
            </FormItem>
            <FormItem label="密码" prop="loginPassword">
              <Input type="password" v-model="formData.loginPassword"></Input>
            </FormItem>
            <FormItem label="确认密码" prop="passwdCheck">
              <Input type="password" v-model="formData.passwdCheck"></Input>
            </FormItem>
            <FormItem label="角色：" prop="roleId">
              <Select v-model="formData.roleId" placeholder="选择账号角色">
                <Option v-for="item in roleList" :value="item.roleId" :key="item.roleId">{{item.roleName}}</Option>
              </Select>
            </FormItem>
          </div>
          <Divider />
          <p :style="pStyle">用户信息</p>
          <div class="demo-drawer-profile">
            <Row>
            <Col span="8">
              <FormItem label="姓名：" prop="name">
                <Input v-model="formData.name" placeholder="填入您的姓名"></Input>
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem label="性别：" prop="sex">
                <RadioGroup v-model="formData.sex">
                  <Radio label="男">男</Radio>
                  <Radio label="女">女</Radio>
                </RadioGroup>
              </FormItem>
            </Col>
          </Row>
            <Row>
              <Col span="12">
                <FormItem label="生日：">
                  <FormItem prop="formatBirthday">
                    <DatePicker type="date" confirm format="yyyy年M月d日" value="yyyy-MM-dd" placeholder="选择您的生日" v-model="formData.formatBirthday"></DatePicker>
                  </FormItem>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="12">
                <FormItem label="邮箱：" prop="mail">
                  <Input v-model="formData.mail" placeholder="填入您的邮箱"></Input>
                </FormItem>
              </Col>
              <Col span="12">
                <FormItem label="qq：">
                  <Input v-model="formData.qq" placeholder="填入您的qq（可选）"></Input>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="12">
                <FormItem label="微信：">
                  <Input v-model="formData.wechat" placeholder="填入您的微信（可选）"></Input>
                </FormItem>
              </Col>
              <Col span="12">
                <FormItem label="电话：" prop="phone1">
                  <Input v-model="formData.phone1" placeholder="填入您的电话"></Input>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="12">
                <FormItem label="备用电话：" prop="phone2">
                  <Input v-model="formData.phone2" placeholder="填入您的备用电话（可选）"></Input>
                </FormItem>
              </Col>
              <Col span="12">
                <FormItem label="其他联系方式：">
                  <Input v-model="formData.others" placeholder="其他联系方式（可选）"></Input>
                </FormItem>
              </Col>
            </Row>
            <FormItem label="备注" prop="memo">
              <Input v-model="formData.memo" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="随便说点什么呗"></Input>
            </FormItem>
          </div>
        </Form>
        <div class="demo-drawer-footer">
          <Button style="margin-right: 8px" @click="cancel('formData')">取消</Button>
          <Button type="primary" @click="postUser('formData')">提交</Button>
        </div>
      </Drawer>
    </div>
</template>

<script>
  import axios from '@/libs/api.request'

  export default {
    data () {
      const validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'))
        } else {
          if (this.formData.passwdCheck !== '') {
            // 对第二个密码框单独验证
            this.$refs.formData.validateField('passwdCheck')
          }
          callback()
        }
      }
      const validatePassCheck = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== this.formData.loginPassword) {
          callback(new Error('两次密码不匹配!'))
        } else {
          callback()
        }
      }
      return {
        dataForm: {
          userName: ''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalUser: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        columns: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: 'ID',
            key: 'loginId'
          },
          {
            title: '用户名',
            key: 'loginName'
          },
          {
            title: '角色',
            key: 'roleName',
            align: 'center',
          },
          {
            title: '状态',
            key: 'stop',
            align: 'center',
            render: (h, params) => {
              function f () {
                if (params.row.stop===0){
                  return '正常'
                } else if (params.row.stop===1){
                  return '停用'
                }
              }
              return h('div', [
                h('Tag', {
                  props: {

                  }
                },f())
              ])
            }
          },
          {
            title: '操作',
            key: 'action',
            width: 150,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.addOrUpdateHandle(params.row.loginId)
                    }
                  }
                }, '修改'),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.deleteHandle(params.row.loginId)
                    }
                  }
                }, '停用')
              ])
            }
          }
        ],
        formData: {
          id: '',
          loginName: '',
          loginPassword: '',
          passwdCheck: '',
          roleId: '',
          name: '',
          mail: '',
          phone1: '',
          phone2: '',
          qq: '',
          wechat: '',
          others: '',
          instId: '',
          educationId: '',
          personPublicDuty: '',
          personAwards: '',
          sex: '',
          ethnic: '',
          partisan: '',
          formatBirthday: '',
          memo: ''
        },
        ruleValidate: {
          loginName: [
            { required: true, message: '账号不能为空！', trigger: 'blur' }
          ],
          name: [
            { required: true, message: '名字不能为空！', trigger: 'blur' }
          ],
          mail: [
            { required: true, message: '邮箱不能为空！', trigger: 'blur' },
            { type: 'email', message: '邮箱格式不正确！请检查！', trigger: 'blur' }
          ],
          phone1: [
            { required: true, message: '电话不能为空！', trigger: 'blur' },
            { type: 'string', min: 11, max: 11, message: '电话号码为11位！请校验', trigger: 'blur' }
          ],
          sex: [
            { required: true, message: '请选择你的性别！', trigger: 'change' }
          ],
          formatBirthday: [
            { required: true, type: 'date', message: '请选择生日！', trigger: 'change' }
          ],
          loginPassword: [
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
        },
        pStyle: {
          fontSize: '16px',
          color: 'rgba(0,0,0,0.85)',
          lineHeight: '24px',
          display: 'block',
          marginBottom: '16px'
        },
        styles: {
          height: 'calc(100% - 55px)',
          overflow: 'auto',
          paddingBottom: '53px',
          position: 'static'
        },
        instList: [],
        educationList: [],
        roleList: []
      }
    },
    mounted () {
      this.getDataList()
    },
    methods: {
      getDataList () {
        this.dataListLoading = true
        axios.request({
          url: `authentication/user/list?page=${this.pageIndex}&limit=${this.pageSize}&loginName=${this.dataForm.userName}`,
          method: 'get'
        }).then(res => {
          if (res.data && res.data.code === 200) {
            this.dataList = res.data.data.list
            this.totalUser = res.data.data.totalCount
          } else {
            this.dataList = []
            this.totalUser = 0
          }
          this.dataListLoading = false
        })
      },
      // 每页数
      sizeChangeHandle (val) {
        this.pageSize = val
        this.pageIndex = 1
        this.getDataList()
      },
      changePage (val) {
        this.pageIndex = val
        this.getDataList()
      },
      // 多选
      selectChangeHandle(val) {
        this.dataListSelections = val
      },
      // 新增 / 修改
      addOrUpdateHandle (id) {
        this.formData.id = id || 0
        //获取学历列表
        axios.request({
          url: 'common/getAllEducation',
          method: 'get'
        }).then(res => {
          this.educationList = res.data.data
        }).then(() => {
          //获取角色列表
          axios.request({
            url: 'common/getAllRole',
            method: 'get'
          }).then(res => {
            this.roleList = res.data.data
          }).then(() => {
            //如果是更新，获取用户的信息
            if (this.formData.id) {
              axios.request({
                url: `authentication/user/${this.formData.id}`,
                method: 'get'
              }).then(res => {
                this.formData.id = res.data.data.id
                this.formData.roleId = res.data.data.roleId
                this.formData.loginName = res.data.data.loginName
                this.formData.instId = res.data.data.instId
                this.formData.name = res.data.data.name
                this.formData.sex = res.data.data.sex
                this.formData.formatBirthday = res.data.data.formatBirthday
                this.formData.ethnic = res.data.data.ethnic
                this.formData.partisan = res.data.data.partisan
                this.formData.mail = res.data.data.mail
                this.formData.phone1 = res.data.data.phone1
                this.formData.phone2 = res.data.data.phone2
                this.formData.qq = res.data.data.qq
                this.formData.wechat = res.data.data.wechat
                this.formData.others = res.data.data.others
                this.formData.personPublicDuty = res.data.data.personPublicDuty
                this.formData.personAwards = res.data.data.personAwards
                this.formData.educationId = res.data.data.educationId
                this.formData.memo = res.data.data.memo
                this.addOrUpdateVisible = true
              })
            }
            this.addOrUpdateVisible = true
          })
        })
      },
      cancel (name) {
        this.$refs[name].resetFields();
        this.addOrUpdateVisible=false
      },
      postUser (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            axios.request({
              url: `authentication/user`,
              method: `${this.formData.id ? 'put' : 'post'}`,
              data: this.formData
            }).then(res => {
              if (res.data.code === 200) {
                this.$Message.success({
                  title: '成功',
                  content: `${this.formData.id ? '更新成功' : '新增成功'}`
                })
              } else {
                this.$Message.error({
                  title: '错误',
                  content: res.data.errMsg
                })
              }
              this.getDataList()
              this.cancel(name)
            })
          } else {
            this.$Message.error('注册失败，请检查!')
          }
        })
      },
      deleteHandle(id) {
        var userIds = id ? [id] : this.dataListSelections.map(item => {
          return item.loginId
        })
        this.$Modal.confirm({
          title: '警告',
          content: `确定对[id=${userIds.join(',')}]进行[${id ? '停用' : '批量停用'}]操作?`,
          onOk: () => {
            axios.request({
              url: `authentication/user`,
              method: 'delete',
              data: userIds
            }).then(res => {
              if (res.data.code === 200) {
                this.$Modal.success({
                  title: '成功',
                  content: '停用成功'
                })
                this.getDataList()
              } else {
                this.$Modal.error({
                  title: '错误',
                  content: res.data.errMsg
                })
              }
            })
          }
        })
      }
    }

  }
</script>

<style scoped>
  .demo-drawer-footer {
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: right;
    background: #fff;
  }
  .demo-drawer-profile{
    font-size: 14px;
  }
  .demo-drawer-profile .ivu-col{
    margin-bottom: 12px;
  }
</style>
