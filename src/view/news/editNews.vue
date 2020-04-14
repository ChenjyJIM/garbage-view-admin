<template>
  <div>
    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
      <Row>
        <Col span="8">
          <FormItem label="资讯类别" prop="category">
            <Select v-model="category" style="width:250px">
              <Option v-for="item in categoryList" :value="item.categoryId" :key="item.categoryId">{{item.categoryName}}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="资讯标题" prop="newsTitle" style="width:600px">
            <Input v-model="formValidate.newsTitle" placeholder="请输入资讯标题"></Input>
          </FormItem>
        </Col>
        <Col span="8" offset="6">
          <div style="background:#eee;padding: 20px">
            <Card :bordered="false">
              <p slot="title">温馨提醒</p>
              <p>发布的资讯要通过系统审核通过后才可以在app上看到哦！</p>
            </Card>
          </div>
        </Col>
      </Row>
      <FormItem label="资讯作者" prop="author" style="width:600px">
        <Input v-model="formValidate.author" placeholder="请输入文章作者"></Input>
      </FormItem>
      <FormItem label="资讯图片" prop="cover" v-if="category===1" style="width:600px">
        <Input v-model="formValidate.cover" placeholder="请输入资讯图片"></Input>
      </FormItem>
      <FormItem label="资讯内容" prop="newsContent">
        <editor ref="editor" :value="formValidate.newsContent" @on-change="handleChange"/>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="handleSubmit('formValidate')">提交</Button>
        <Button @click="handleReset('formValidate')" style="margin-left: 8px">重置</Button>
      </FormItem>
    </Form>
  </div>
</template>

<script>
  import Editor from '_c/editor'
  import axios from '@/libs/api.request'

  export default {
    components: {
      Editor
    },
    data () {
      return {
        category: 0,
        categoryList: [],
        formValidate: {
          newsTitle: '',
          author: '',
          newsContent: '',
          cover: ''
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
    mounted () {
      this.resetContent()
      this.getCategoryList()
    },
    methods: {
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            if (this.category===0) {
              this.$Message.error('请选择资讯类别!')
            } else {
              axios.request({
                url: `news/edit/details/${this.category}`,
                method: 'post',
                data: this.formValidate
              }).then(res => {
                if (res.data.code === 200) {
                  this.$Message.success({
                    title: '成功',
                    content: res.data.data
                  })
                  this.resetContent()
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
      handleReset (name) {
        this.$refs[name].resetFields()
        this.resetContent()
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
</style>
