<template>
  <div>
    <Form :model="dataForm">
      <Row>
        <Col span="6">
          <FormItem label="资讯标题" prop="title">
            <Input v-model="dataForm.title" style="width:200px" placeholder="资讯标题" clearable />
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
          <FormItem label="资讯状态" prop="status">
            <Select v-model="dataForm.status" style="width:200px">
              <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
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
        <Page :total="totalUser" :current="pageIndex" show-sizer @on-change="changePage" @on-page-size-change="sizeChangeHandle"></Page>
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
      <div slot="footer" v-if="newsEdit.status!==1">
        <Button type="error" size="large" @click="handleDisagree">不通过</Button>
        <Button type="success" size="large" @click="handleOK">发布</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import axios from '@/libs/api.request'

  export default {
    data() {
      return {
        dataForm: {
          title: '',
          category: '',
          status: ''
        },
        categoryList: [],
        statusList: [
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
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalUser: 0,
        dataListLoading: false,
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
                if (params.row.status===0){
                  return '待审核'
                } else if (params.row.status===1){
                  return '已发布'
                } else if (params.row.status===2){
                  return '审核不通过'
                } else if (params.row.status===3){
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
                      this.showNews(params.index)
                    }
                  }
                }, '查看')
              ])
            }
          }
        ],
        newsDisplay: false,
        newsEdit: {
          status: 0,
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
          url: `news/review/list?page=${this.pageIndex}&limit=${this.pageSize}&newsTitle=${this.dataForm.title}&type=${this.dataForm.category}&status=${this.dataForm.status}`,
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
          this.newsEdit.status = this.dataList[index].status
          this.news = res.data.data
          this.newsDisplay = true
        })
      },
      handleOK () {
        this.agreeNews()
      },
      handleDisagree () {
        this.$Modal.confirm({
          render: (h) => {
            return h('Input', {
              props: {
                value: this.disagreeValue,
                autofocus: true,
                placeholder: '请输入拒绝原因，方便编辑者修改！'
              },
              on: {
                input: (val) => {
                  this.disagreeValue = val;
                }
              }
            })
          },
          onOk: () => {
            this.disagreeNews()
          }
        })
      },
      agreeNews () {
        axios.request({
          url: `news/review/${this.newsEdit.editId}`,
          method: 'post'
        }).then(res => {
          this.$Message.info(res.data.data);
          this.getDataList()
          this.newsDisplay = false
        })
      },
      disagreeNews () {
        axios.request({
          url: `news/review/${this.newsEdit.editId}/${this.disagreeValue}`,
          method: 'delete'
        }).then(res => {
          this.$Message.info(res.data.data);
          this.getDataList()
          this.newsDisplay = false
        })
      }
    }
  }
</script>

<style scoped>

</style>
