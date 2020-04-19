<template>
  <div>
    <Button @click="addGarbageType(false)" type="success">新增</Button>
    <Table stripe border :loading="loading" :height="500" :columns="columns" :data="dataList"></Table>
  </div>
</template>

<script>
  import axios from '@/libs/api.request'

  export default {
    data () {
      return {
        columns: [
          {
            title: 'ID',
            key: 'id',
            align: 'center',
            width: 50
          },
          {
            title: '垃圾种类名称',
            align: 'center',
            key: 'garbageName'
          },
          {
            title: '垃圾种类描述',
            align: 'center',
            key: 'garbageDetail'
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
                      this.updateGarbageType(params.index)
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
                      this.removeGarbageType(params.index)
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        dataList: [],
        loading: false,
        garbageTypeInfo: {
          name: '',
          detail: '',
          img: 0
        }
      }
    },
    created () {
      this.getDataList()
    },
    methods: {
      getDataList () {
        this.loading = true
        axios.request({
          url: 'common/getGarbageType',
          method: 'get'
        }).then(res => {
          this.dataList = res.data.data
          this.loading = false
        })
      },
      addGarbageType (isUpdate) {
        this.$Modal.confirm({
          render: (h) => {
            return h('div', [
              h('h2', {
                props: {
                }
              },'新增/修改垃圾类别'),
              h('p', {
                props: {}
              },'类别名称:'),
              h('Input', {
                props: {
                  value: this.garbageTypeInfo.name,
                  autofocus: true,
                  placeholder: '请输入类别名称'
                },
                on: {
                  input: (val) => {
                    this.garbageTypeInfo.name = val
                  }
                }
              }),
              h('p', {
                props: {}
              },'类别详情:'),
              h('Input', {
                props: {
                  value: this.garbageTypeInfo.detail,
                  autofocus: true,
                  placeholder: '请输入类别详情'
                },
                on: {
                  input: (val) => {
                    this.garbageTypeInfo.detail = val
                  }
                }
              }),
              h('p', {
                props: {}
              },'icon:'),
              h('Input', {
                props: {
                  value: this.garbageTypeInfo.img,
                  autofocus: true,
                  placeholder: '请输入icon地址'
                },
                on: {
                  input: (val) => {
                    this.garbageTypeInfo.img = val
                  }
                }
              })

            ])
          },
          onOk: () => {
            axios.request({
              url: 'garbage/garbageType',
              method: `${isUpdate ? 'put' : 'post'}`,
              data: this.garbageTypeInfo
            }).then(res => {
              if (res.data.code === 200) {
                this.$Message.success({
                  title: '成功',
                  content: `${isUpdate ? '更新成功' : '添加成功'}`
                })
              } else {
                this.$Message.error({
                  title: '错误',
                  content: res.data.errMsg
                })
              }
              this.garbageTypeInfo.name = ''
              this.garbageTypeInfo.detail = ''
              this.garbageTypeInfo.img = ''
              this.getDataList()
            }).catch(function (error) {
              this.$Message.error({
                title: '错误',
                content: error.message
              })
            })
          },
          onCancel: () => {
            this.garbageTypeInfo.name = ''
            this.garbageTypeInfo.detail = ''
            this.garbageTypeInfo.img = ''
          }
        })
      },
      updateGarbageType (index) {
        this.garbageTypeInfo.name= this.dataList[index].garbageName
        this.garbageTypeInfo.id= this.dataList[index].id
        this.garbageTypeInfo.detail = this.dataList[index].garbageDetail
        this.garbageTypeInfo.img = this.dataList[index].img
        this.addGarbageType(true)
      },
      removeGarbageType (index) {
        this.$Modal.confirm({
          title: '警告',
          content: '你确定要删除吗？',
          onOk: () => {
            this.loading = true
            axios.request({
              url: `garbage/delete/${this.dataList[index].id}`,
              method: 'delete'
            }).then(
              this.getDataList()
            );
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
