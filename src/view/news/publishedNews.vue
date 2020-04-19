<template>
  <div>
    <Form :model="dataForm">
      <Row>
        <Col span="6">
          <FormItem label="资讯标题" prop="title">
            <Input v-model="dataForm.title" style="width:200px" placeholder="资讯标题" clearable/>
          </FormItem>
        </Col>
        <Col span="6">
          <FormItem label="不包含停用资讯" prop="withoutStop">
            <i-switch v-model="dataForm.withoutStop"/>
          </FormItem>
        </Col>
        <Col span="6">
          <FormItem label="资讯类别" prop="category">
            <Select v-model="dataForm.category" style="width:200px">
              <Option v-for="item in categoryList" :value="item.categoryId" :key="item.categoryId">{{item.categoryName}}
              </Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="6">
          <FormItem>
            <Button @click="getDataList()">查询</Button>
          </FormItem>
        </Col>
      </Row>
    </Form>
    <Table stripe :columns="columns" :data="dataList" :loading="dataListLoading"></Table>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <Page :total="totalUser" :current="pageIndex" show-sizer @on-change="changePage"
              @on-page-size-change="sizeChangeHandle"></Page>
      </div>
    </div>
    <Modal v-model="newsDisplay" width="800">
      <p slot="header" style="text-align:center">
        <span>{{news.newsTitle}}</span>
      </p>
      <div style="text-align:center">
        <span>作者：{{news.author}}</span><br/>
        <span v-html="news.newsContent"></span>
      </div>
    </Modal>
  </div>
</template>

<script>
  import axios from '@/libs/api.request'

  export default {
    data () {
      return {
        dataForm: {
          title: '',
          withoutStop: false,
          category: ''
        },
        categoryList: [],
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalUser: 0,
        dataListLoading: false,
        columns: [
          {
            title: 'ID',
            key: 'publishId',
            align: 'center',
            width: 50
          },
          {
            title: '资讯标题',
            key: 'newsTitle'
          },
          {
            title: '编辑时间',
            key: 'formatTime',
            align: 'center',
            width: 150
          },
          {
            title: '资讯分类',
            key: 'categoryName',
            align: 'center',
            width: 150
          },
          {
            title: '状态',
            key: 'status',
            align: 'center',
            width: 150,
            render: (h, params) => {
              function f () {
                if (!params.row.stop) {
                  return '正常'
                } else {
                  return '停用'
                }
              }

              return h('div', [
                h('Tag', {
                  props: {}
                }, f())
              ])
            }
          },
          {
            title: '操作',
            key: 'action',
            width: 250,
            align: 'center',
            render: (h, params) => {
              function f () {
                if (!params.row.stop) {
                  return '停用资讯'
                } else {
                  return '恢复资讯'
                }
              }

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
                      this.stopOrRepublishNews(params.index)
                    }
                  }
                }, f()),
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
        newsDisplay: false,
        newsEdit: {
          type: 0,
          editId: 0
        },
        news: [],
        disagreeValue: ''
      }
    },
    mounted () {
      this.getDataList()
      this.getCategoryList()
    },
    methods: {
      getDataList () {
        this.dataListLoading = true
        axios.request({
          url: `news/review/list/publish?page=${this.pageIndex}&limit=${this.pageSize}&newsTitle=${this.dataForm.title}&withoutStop=${this.dataForm.withoutStop}&type=${this.dataForm.category}`,
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
      getCategoryList () {
        axios.request({
          url: `common/category`,
          method: 'get'
        }).then(res => {
          this.categoryList = res.data.data
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
      showNews (index) {
        axios.request({
          url: `news/edit/details/${this.dataList[index].type}/${this.dataList[index].detailsId}`,
          method: 'get'
        }).then(res => {
          this.newsEdit.editId = this.dataList[index].editId
          this.news = res.data.data
          this.newsDisplay = true
        })
      },
      stopOrRepublishNews (index) {
        axios.request({
          url: `news/review/publish/${this.dataList[index].publishId}`,
          method: `${this.dataList[index].stop ? 'put' : 'delete'}`
        }).then(res => {
          if (res.data.code === 200) {
            this.$Message.success({
              title: '成功',
              content: `${this.dataList[index].stop ? '恢复成功' : '停用成功'}`
            })
          } else {
            this.$Message.error({
              title: '错误',
              content: res.data.errMsg
            })
          }
          this.getDataList()
        })
      }
    }
  }
</script>

<style scoped>

</style>
