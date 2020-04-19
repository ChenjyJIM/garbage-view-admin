<template>
  <div>
    <Table stripe border :loading="loading" :height="500" :columns="columns" :data="dataList"></Table>
    <Drawer
      title="修改资讯"
      v-model="newsUpdate"
      width="800"
      :mask-closable="false"
      :styles="styles"
    >
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
        <FormItem label="资讯类别" prop="category">
          <Select v-model="category" style="width:250px">
            <Option v-for="item in categoryList" :value="item.categoryId" :key="item.categoryId">{{item.categoryName}}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="资讯标题" prop="newsTitle" style="width:600px">
          <Input v-model="formValidate.newsTitle" placeholder="请输入资讯标题"></Input>
        </FormItem>
        <FormItem label="资讯作者" prop="author" style="width:600px">
          <Input v-model="formValidate.author" placeholder="请输入文章作者"></Input>
        </FormItem>
        <FormItem label="资讯图片" prop="cover" v-if="category===1" style="width:600px">
          <Input v-model="formValidate.cover" placeholder="请输入资讯图片"></Input>
        </FormItem>
        <FormItem label="资讯内容" prop="newsContent">
          <editor ref="editor" :value="formValidate.newsContent" @on-change="handleChange"/>
        </FormItem>
      </Form>
      <div class="demo-drawer-footer">
        <Button style="margin-right: 8px" @click="newsUpdate = false">取消</Button>
        <Button type="primary" @click="handleSubmit('formValidate')">提交</Button>
      </div>
    </Drawer>
  </div>
</template>

<script>
  import axios from '@/libs/api.request'
  import Editor from '_c/editor'

  export default {
    components: {
      Editor
    },
    data () {
      return {
        columns: [
          {
            title: 'ID',
            key: 'editId',
            align: 'center',
            width: 50
          },
          {
            title: '资讯标题',
            key: 'newsTitle'
          },
          {
            title: '编辑时间',
            key: 'formatTime'
          },
          {
            title: '资讯类别',
            key: 'categoryName'
          },
          {
            title: '状态',
            key: 'status',
            width: 150,
            align: 'center',
            render: (h, params) => {
              function f () {
                if (params.row.status===0){
                  return '待审核'
                } else if (params.row.status===1) {
                  return '已发布'
                } else if (params.row.status===2) {
                  return '审核不通过'
                } else if (params.row.status===3) {
                  return '发布后停用'
                }
              }
              return h('div', [
                h('Tag', {
                  props: {

                  }
                },f())
              ])
            },
            filters: [
              {
                label: '待审核',
                value: 0
              },
              {
                label: '已发布',
                value: 1
              },
              {
                label: '审核不通过',
                value: 2
              },
              {
                label: '发布后停用',
                value: 3
              }
            ],
            filterMethod (value, row) {
              if (value === 0) {
                return row.status === 0;
              } else if (value === 1) {
                return row.status === 1;
              } else if (value === 2) {
                return row.status === 2;
              } else if (value === 3) {
                return row.status === 3;
              }
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
                      this.updateNews(params.index)
                    }
                  }
                }, '修改'),
                h('Button', {
                  props: {
                    type: 'info',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.showNews(params.index)
                    }
                  }
                }, '查看详情')
              ])
            }
          }
        ],
        dataList: [],
        categoryList: [],
        loading: false,
        newsUpdate: false,
        styles: {
          height: 'calc(100% - 55px)',
          overflow: 'auto',
          paddingBottom: '53px',
          position: 'static'
        },
        category: 0,
        formValidate: {
          newsTitle: '',
          author: '',
          newsContent: '',
          cover: '',
          detailsId: 0
        },
        ruleValidate: {
          newsTitle: [
            {required: true, message: '资讯标题不能为空', trigger: 'blur'}
          ],
          author: [
            {required: true, message: '资讯作者不能为空', trigger: 'blur'}
          ],
          newsContent: [
            {required: true, message: '资讯正文不能为空', trigger: 'blur'}
          ]
        }
      }
    },
    created () {
      this.getDataList()
      this.getCategoryList()
    },
    methods: {
      getDataList () {
        this.loading = true
        axios.request({
          url: 'news/edit/list',
          method: 'get'
        }).then(res => {
          this.dataList = res.data.data
          this.loading = false
        })
      },
      updateNews (index) {
        this.resetContent()
        axios.request({
          url: `news/edit/details/${this.dataList[index].type}/${this.dataList[index].detailsId}`,
          method: 'get'
        }).then(res => {
          this.formValidate.detailsId = res.data.data.detailsId
          this.formValidate.newsTitle = res.data.data.newsTitle
          this.formValidate.newsContent = res.data.data.newsContent
          this.$refs.editor.setHtml(this.formValidate.newsContent)
          this.formValidate.author = res.data.data.author
          this.formValidate.cover = res.data.data.cover
          this.category = res.data.data.type
          this.newsUpdate = true
        })
      },
      showNews (index) {
        axios.request({
          url: `news/edit/details/${this.dataList[index].type}/${this.dataList[index].detailsId}`,
          method: 'get'
        }).then(res => {
          let news = res.data.data
          this.$Modal.info({
            title: news.newsTitle,
            content: `作者：${news.author}<br>${news.newsContent}`,
            width: 800
          })
        })
      },
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            if (this.category===0) {
              this.$Message.error('请选择资讯类别!')
            } else {
              axios.request({
                url: `news/edit/details/${this.category}`,
                method: 'put',
                data: this.formValidate
              }).then(res => {
                if (res.data.code === 200) {
                  this.$Message.success({
                    title: '成功',
                    content: res.data.data
                  })
                  this.resetContent()
                  this.getDataList()
                  this.newsUpdate = false
                } else {
                  this.$Message.error({
                    title: '错误',
                    content: res.data.errMsg
                  })
                }
              })
            }
          } else {
            this.$Message.error('提交失败，请检查后重新提交!')
          }
        })
      },
      resetContent () {
        this.$refs.editor.setHtml('')
      },
      handleChange (html, text) {
        this.formValidate.newsContent=html
      },
      getCategoryList () {
        axios.request({
          url: 'common/category',
          method: 'get'
        }).then(res => {
          this.categoryList = res.data.data
        })
      }
    }
  }
</script>

<style>
  .demo-drawer-footer{
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: right;
    background: #fff;
  }
</style>
