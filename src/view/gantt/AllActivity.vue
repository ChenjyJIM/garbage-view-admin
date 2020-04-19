<template>
  <div class="container">
    <Form :model="formInline">
      <Row>
        <Col span="4">
          <FormItem prop="borrowRecord">
            <Input type="text" v-model="formInline.name" placeholder="垃圾名称">
              <Icon type="ios-person-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
        </Col>
        <Col span="6">
          <FormItem label="垃圾类别" prop="category">
            <Select v-model="formInline.garbageType" clearable style="width:200px">
              <Option v-for="item in garbageTypeList" :value="item.id" :key="item.id">{{item.garbageName}}
              </Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="6">
          <FormItem>
            <Button type="primary" @click="handleSubmit()">查询</Button>
            <Button type="success" @click="handleAdd()">新增</Button>
          </FormItem>
        </Col>
      </Row>
    </Form>

    <Table border :columns="columns" :data="objectGarbageList">
    </Table>
    <Page :total="total" :page-size="10" @on-change="changePage"></Page>

    <Modal
      v-model="modal1"
      title="新增/修改垃圾分类"
      @on-ok="addGarbage"
      width="1000">
      <Form ref="activityData" :model="addGarbageData" :rules="ruleValidate" :label-width="80" :label-height="100">
        <Row>
          <Col span="8">
            <FormItem label="垃圾名称：" prop="name">
              <Input v-model="addGarbageData.name" value="addGarbageData.name"></Input>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="8">
            <FormItem label="垃圾类别：" prop="garbageType">
              <Select v-model="addGarbageData.garbageType" filterable clearable>
                <Option v-for="item in garbageTypeList" :value="item.id" :key="item.id">{{ item.garbageName}}</Option>
              </Select>
            </FormItem>
          </Col>

        </Row>
      </Form>
    </Modal>
  </div>
</template>
<script>
  import axios from '@/libs/api.request'

  export default {
    name: 'AllInstitute',
    data() {
      return {
        ruleValidate: {
          name: [
            { required: true, message: '垃圾名称不能为空！', trigger: 'blur' }
          ],
          garbageType: [
            { required: true, message: '垃圾类别不能为空！', trigger: 'blur' }
          ]
        },
        value1: false,
        value2: false,
        showPanel: '0',
        lists: [],
        pStyle: {
          fontSize: '16px',
          color: 'rgba(0,0,0,0.85)',
          lineHeight: '24px',
          display: 'block',
          marginBottom: '16px'
        },
        modal1: false,
        isEdit: false,
        total: '',
        condi: '',
        currIndex: 0, // 最近被点击添加编号副本的图书编号
        garbageTypeList: [],
        formInline: {
          name: '',
          garbageType: ''
        },
        addGarbageData: {
          id: '',
          name: '',
          garbageType: ''
        },
        columns: [
          {
            title: 'id',
            key: 'id',
            width: 100,
          },
          {
            title: '垃圾名称',
            key: 'name'
          },
          {
            title: '所属类别',
            key: 'garbageName'
          },
          {
            title: '类别描述',
            width: 500,
            key: 'garbageDetail'
          },
          {
            title: '操作',
            key: 'action',
            width: 300,
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
                      this.show(params.index)
                    }
                  }
                }, '详情'),
                h('Button', {
                  props: {
                    type: 'info',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.modifyGarbage(params.index)
                    }
                  }
                }, '编辑'),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.removeObjectGarbage(params.index)
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        objectGarbageList: [],
        dataFromInterface: []
      }
    },
    mounted() {
      this.request(1)
      this.getGarbageTypeList()
    },
    methods: {
      addGarbage() {
        let that = this
        let isEdit = that.isEdit;
        axios.request({
          url: '/garbage/objectGarbage',
          method: `${isEdit ? 'put' : 'post'}`,
          data: {
            id: isEdit ? that.addGarbageData.id : null,
            name: that.addGarbageData.name != '' ? that.addGarbageData.name : null,
            garbageType: that.addGarbageData.garbageType != '' ? that.addGarbageData.garbageType : null,
          }
        }).then(function (res) {
          if (res.data.success) {
            that.$Message.success('操作成功！')
            this.addGarbageData.name = ''
            this.addGarbageData.garbageType = ''
            this.request(1)
            this.modal1 = false;
            this.isEdit = false;
          } else {
            this.modal1 = false;
            this.isEdit = false;
            alert(response.data.errMsg)
          }
        })
      },
      modifyGarbage(index) {
        this.addGarbageData.id = this.objectGarbageList[index].id
        this.addGarbageData.name = this.objectGarbageList[index].name
        this.addGarbageData.garbageType = this.objectGarbageList[index].garbageType
        this.modal1 = true;
        this.isEdit = true;
      },
      getGarbageTypeList() {
        axios.request({
          url: `common/getGarbageType`,
          method: 'get'
        }).then(res => {
          this.garbageTypeList = res.data.data
        })
      },
      dateFormat(timestamp, format) {
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
      handleSubmit() {
        this.request(1)
      },
      handleAdd() {
        this.modal1 = true;
      },
      show(index) {
        this.$Modal.info({
          title: '详细信息',
          content: `<h2>名称:${this.objectGarbageList[index].garbageName}</h2><br>
                    <img width='200px' height="200px" src="${this.objectGarbageList[index].img}"><br>
                    <h3>${this.objectGarbageList[index].garbageDetail}</h3> `,
          width: 700,
          onOk: () => {
          },
          onCancel: () => {
          }
        })
      },
      request(currentPage) {
        let that = this

        axios.request({
          url: '/garbage/getAllObjects',
          method: 'post',
          data: {
            name: that.formInline.name != '' ? that.formInline.name : null,
            garbageType: that.formInline.garbageType != '' ? that.formInline.garbageType : null,
            page: currentPage
          }
        }).then(function (res) {
          if (res.data.success) {
            that.total = res.data.data.total
            that.dataFromInterface = res.data.data.items
            that.objectGarbageList = []
            that.dataFromInterface.forEach((data) => {
              let obj = {}
              obj.id = data.id
              obj.name = data.name
              obj.garbageName = data.garbageName
              obj.garbageDetail = data.garbageDetail
              obj.img = data.img
              that.objectGarbageList.push(obj)
            })
          } else {
            alert(response.data.errMsg)
          }
        }).catch(function (error) {
          that.$Message.error('服务器出小差了')
        })
      },
      changePage: function (page) {
        this.request(page)
      },
      removeObjectGarbage (index) {
        this.$Modal.confirm({
          title: '警告',
          content: '你确定要删除吗？',
          onOk: () => {
            this.loading = true
            axios.request({
              url: `garbage/deleteObjectGarbage/${this.objectGarbageList[index].id}`,
              method: 'delete'
            }).then(
              this.request(1)
            );
          }
        })
      }
    }
  }
</script>

<style>
  .container {
    height: 600px;
    width: 100%;
  }

  .demo-drawer-profile {
    font-size: 14px;
  }

  .demo-drawer-profile .ivu-col {
    margin-bottom: 12px;
  }
</style>
