<template>
  <div>
    <Button @click="categoryInfo(false)" type="success">新增</Button>
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
            key: 'categoryId'
          },
          {
            title: '资讯类别名称',
            key: 'categoryName'
          },
          {
            title: '状态',
            key: 'stop',
            align: 'center',
            render: (h, params) => {
              function f () {
                if (params.row.stop){
                  return '停用'
                } else {
                  return '正常'
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
                      this.updateCategory(params.index)
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
                      this.removeCategory(params.index)
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        dataList: [],
        loading: false,
        category: {
          categoryName: '',
          categoryId: 0
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
          url: 'news/category',
          method: 'get'
        }).then(res => {
          this.dataList = res.data.data
          this.loading = false
        })
      },
      categoryInfo (isUpdate) {
        this.$Modal.confirm({
          render: (h) => {
            return h('div', [
              h('h2', {
                props: {
                }
              },'资讯类别信息'),
              h('p', {
                props: {}
              },'资讯分类名称:'),
              h('Input', {
                props: {
                  value: this.category.categoryName,
                  autofocus: true,
                  placeholder: '请输入资讯分类名称'
                },
                on: {
                  input: (val) => {
                    this.category.categoryName = val
                  }
                }
              })
            ])
          },
          onOk: () => {
            axios.request({
              url: 'news/category',
              method: `${isUpdate ? 'put' : 'post'}`,
              data: this.category
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
              this.category.categoryName = ''
              this.category.categoryId = 0
              this.getDataList()
            }).catch(function (error) {
              this.$Message.error({
                title: '错误',
                content: error.message
              })
            })
          },
          onCancel: () => {
            this.category.categoryName = ''
            this.category.categoryId = 0
          }
        })
      },
      updateCategory (index) {
        this.category.categoryName = this.dataList[index].categoryName
        this.category.categoryId = this.dataList[index].categoryId
        this.categoryInfo(true)
      },
      removeCategory (index) {
        this.$Modal.confirm({
          title: '警告',
          content: '你确定要停用吗？',
          onOk: () => {
            this.loading = true
            axios.request({
              url: `news/category/${this.dataList[index].categoryId}`,
              method: 'delete'
            }).then(
              this.getDataList
            )
          }
        })

      }
    }
  }
</script>

<style scoped>

</style>
