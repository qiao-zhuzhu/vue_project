<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 选择商品分类的级联选择框 -->
              <el-cascader
                expandTrigger="hover"
                :options="cateList"
                :props="cateProps"
                v-model="addForm.goods_cat"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTabData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="subItem"
                  border
                  v-for="(subItem,index) in item.attr_vals"
                  :key="index"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTabData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action :用来设置文件上传的接口地址
                         :on-preview="handlePreview" ： 图片预览时会触发执行
                         :on-remove="handleRemove" ： 当删除图片时会触发执行
            list-type="picture" ：设置图片的展示方式-->
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" @click="addProduct">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <el-dialog title="提示" :visible.sync="previewVisible" width="50%">
      <img :src="imgPath" alt class="previewImg" />
    </el-dialog>
  </div>
</template>
<script>
//导入lodash
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '0',
      // 添加商品的数据表单
      addForm: {
        goods_name: 0,
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        //上传图片数组
        pics: [],
        //
        goods_introduce: ''
      },
      // 添加商品的校验规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品分类', trigger: 'blur' }
        ]
      },
      //   保存分类列表数据
      cateList: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      //   保存动态参数列表数据
      manyTabData: [],
      //   保存静态属性列表数据
      onlyTabData: [],
      //图片上传组件的header是请求头对象
      //把令牌保存到这个对象中
      headerObj: {
        Authorization: sessionStorage.getItem('token')
      },
      //控制预览图片弹出窗的显示与隐藏
      previewVisible: false,
      // 保存需要预览的图片路径地址
      imgPath: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 3 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取动态参数列表失败')
      }
      // 获取成功就保存
      this.cateList = res.data
    },
    handleChange() {
      //如果用户选择的不是三级分类
      if (this.addForm.goods_cat.length !== 3) {
        // 就将数组清空
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      //限制用户必须从一个tab栏去切换到下一个tab栏
      if (activeName - oldActiveName !== 1 && activeName > oldActiveName) {
        this.$message.error(
          '请一步一步的添加商品的步骤操作，不要跳过某些步骤，导致商品信息填写不完整'
        )
        return false
      }

      //   在用户从第一页去到别的页面时
      // 需要验证用户是否有正常输入第一页数据
      if (oldActiveName === '0') {
        //必须要选择三级分类
        if (this.addForm.goods_cat.length !== 3) {
          this.$message.error('请选择商品分类！')
          return false
        }
        let validateRes = true

        this.$refs.addFormRef.validate(valid => {
          if (!valid) {
            this.$message.error('请选择商品分类！')
            validateRes = false
          }
        })
        //判断validateRes是否为假 为假就
        if (!validateRes) {
          return false
        }
      }
    },
    async tabClicked() {
      //当用户点击商品参数选项卡的时候 要发送请求获取商品信息
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类失败')
        }

        //
        //
        res.data.forEach(item => {
          if (item.attr_vals === '') {
            item.attr_vals = []
          } else {
            item.attr_vals = item.attr_vals.split(' ')
          }
        })
        // 获取成功 保存数据到data中
        this.manyTabData = res.data
        // console.log(this.manyTabData)
      } else if (this.activeIndex === '2') {
        //点击的事商品属性 获取静态属性
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败')
        }

        console.log(res.data)

        // 获取成功 保存数据到data中
        this.onlyTabData = res.data
      }
    },
    //处理图片预览效果
    handlePreview(file) {
      console.log(file)
      this.imgPath = file.response.data.url
      this.previewVisible = true
    },
    // 处理移出图片操作
    handleRemove(file) {
      console.log(file)
      //1 获取将要删除的图片的临时路径
      let Path = file.response.data.tem_path
      //2 从pics数组中 找到这个图片对应的索引值
      let index = this.addForm.pics.findIndex(item => item.pic === Path)
      //3 调用数组的splice 方法 把图片信息对象 从pics数组中移出
      this.addForm.pics.splice(index, 1)
    },
    //监听图片上传成功事件
    handleSuccess(response) {
      // 在上传成功之后进行调用
      // 第一个形参就是第一个上传之后的结果
      console.log(response)
      //创建一个图片对象
      const picInfo = { pic: response.data.tmp_path }
      //将对象添加到pics数组中
      this.addForm.pics.push(picInfo)

      console.log(this.addForm.pics)
    },
    //点击添加商品
    addProduct() {
      // 校验表单数据是否正确
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入商品信息，信息有误')

        // 校验成功 添加商品
        //如果想要将goods_cat从数组转换成字符串
        // 如果将转换之后的字符串直接重新赋值 给addform里的goods_cat
        // 直接处理并赋值的形式 级联选择器会报错
        // 解决方案：将addform深拷贝一个全新的对象出来

        const form = _.cloneDeep(this.addForm)

        form.goods_cat = form.goods_cat.join(',')

        // 处理动态参数
        this.manyTabData.forEach(item => {
          this.addForm.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          })
        })
        
        this.onlyTabData.forEach(item => {
          this.addForm.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          })
        })

        form.attrs = this.addForm.attrs

        console.log(form)

        const { data: res } = await this.$http.post(
          'goods',form)

        if (res.meta.status !== 200) {
          return this.$message.error('添加商品失败')
        }

          return this.$message.success('添加商品失败')

          this.$router.push("/goods")
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        //   是三级分类就返回分类id
        return this.addForm.goods_cat[2]
      }
      //   不是就返回 null
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.previewImg {
  width: 100%;
}
</style>
