<template>
  <div>
    <h3>商品分类</h3>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 数据表格
        :data="cateList" :设置数据来源
        :columns="columns" ：配置每列需要显示的数据
        :selection-type="false" :将每行数据配置为没有复选框
        :expand-type="false" ：每行数据无需扩展
        show-index :添加索引列
        index-text="#" ：设置索引列的列头
        :show-row-hover="false" ：设置鼠标悬停不要变色
      -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-error" style="color:red" v-if="scope.row.cat_deleted"></i>
          <i class="el-icon-success" style="color:green" v-else></i>
        </template>

        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level==0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level==1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页导航 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%">
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            expand-trigger="hover"
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentChanged"
            change-on-select
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //商品分类的数据列表
    return {
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //用来保存商品分类的数组
      cateList: [],
      //总数量
      total: 0,
      //为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          //表示当前列定义为模板列
          type: 'template',
          //表示当前列使用模板的名称
          template: 'isok'
        },
        {
          label: '排序',
          //表示当前列定义为模板列
          type: 'template',
          //表示当前列使用模板的名称
          template: 'order'
        },
        {
          label: '操作',
          //表示当前列定义为模板列
          type: 'template',
          //表示当前列使用模板的名称
          template: 'opt'
        }
      ],
      //控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      //添加分类的表单数据对象
      addCateForm: {
        //   将要添加分类的名称
        cat_name: '',
        //父级分类id
        cat_pid: 0,
        //分类的等级默认要添加的是一级分类
        cat_level: 0
      },
      //添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      //父级分类的列表
      parentCateList: [],
      //指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //选中的父级分类的id数组
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 发送请求获取商品分类数据
    async getCateList() {
      // 发送请求获取商品分类数据
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      console.log(res)

      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败！')
      }
      this.$message.success('获取分类列表成功！')

      this.cateList = res.data.result
      //   console.log(res.data.result);

      this.total = res.data.total
    },
    //监听pagesize的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      // 按照最新的size来获取数据
      this.getCateList()
    },
    // 监听pagenum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      // 按照最新的页码获取数据
      this.getCateList()
    },
    //在点击添加分类按钮时 显示添加分类对话框
    showAddCateDialog() {
      //先获取父级分类的数据列表
      this.getParentCateList()
      //在弹出对话框
      this.addCateDialogVisible = true
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      // this.$message.success('获取父级分类数据成功！')
      console.log(res.data)
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentChanged() {
      console.log(this.selectedKeys)
      //在级联选择器框中已经选择了一个 分类的情况下
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
      console.log(this.addCateForm)
    },
    // 点击添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        //发送请求 完成分类的添加
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )

        if (res.meta.status !== 201) {
          this.$message.error('添加分类失败')
        }

        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
</style>