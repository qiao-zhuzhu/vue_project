<template>
  <div>
    <h3>分类参数</h3>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警戒区域 -->
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>
      <!-- 级联选择器 -->
      <el-row>
        <el-col>
          请选择分类：
          <el-cascader
            expand-trigger="hover"
            :options="cateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="cascaderChanged"
            change-on-select
            clearable
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible= true"
          >添加参数</el-button>

          <!-- 展示动态参数数据的表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else      
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >添加参数</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="动态参数"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  icon="el-icon-edit"
                  type="primary"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  icon="el-icon-delete"
                  type="danger"
                  @click="delParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >添加属性</el-button>

          <!-- 展示静态属性数据的表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="动态参数"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  icon="el-icon-edit"
                  type="primary"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  icon="el-icon-delete"
                  type="danger"
                  @click="delParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 弹窗主体 -->
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="参数名称" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 弹窗主体 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="参数名称" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //获取用户选择的级联选择器中的数据
      selectedKeys: [],
      //用来保存分类数据的数组
      cateList: [],
      //配置级联选择器中的内容要如何展示
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //保存的是name属性值
      activeName: 'many',
      //用来保存动态参数的数据
      manyTableData: [],
      //用来保存静态属性的数据
      onlyTableData: [],
      //保存需要添加的参数信息
      addForm: {
        attr_name: '',
        attr_sel: ''
      },
      //验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      //控制添加参数的显示与隐藏
      addDialogVisible: false,
      //控制修改参数的显示与隐藏
      editDialogVisible: false,
      //
      editForm: {},

      inputValue: '',

      inputVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      // 发送请求获取商品分类数据
      const { data: res } = await this.$http.get('categories')
      // console.log(res)
      this.cateList = res.data
    },
    async cascaderChanged() {
      this.getParamsData()
    },
    handleTabClick() {
      console.log(this.activeName)
      this.getParamsData()
    },
    async getParamsData() {
      //因为只能跟三级分类去添加动态参数和静态属性
      if (this.selectedKeys.length !== 3) {
        //
        this.selectedKeys = []
        //清空表格
        this.manyTableData=[]
        this.onlyTableData=[]
        return
      }
      console.log(this.selectedKeys)
      //获取三级分类id
      let cateId = this.selectedKeys[2]
      //发送请求获取三级分类对应的动态参数
      const { data: res } = await this.$http.get(
        `categories/${cateId}/attributes`,
        { params: { sel: this.activeName } }
      )
      if (res.meta.status !== 200) {
        this.$messages.error('获取参数信息失败')
      }

      //将参数信息字符串转换为数组
      res.data.forEach(item => {
        if (item.attr_vals.trim() === 0) {
          item.attr_vals = []
        } else {
          item.attr_vals = item.attr_vals.split(' ')
        }
        //
        item.inputVisible = false
        item.inputValue = ''
      })

      console.log(res.data)
      // 判断当前是动态参数还是静态属性 根据情况将数据挂载到不同的data中
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听添加对话框的关闭事件
    addDialogClosed() {
      //对话框关闭之后要将对话框中的表单重置
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮 添加参数
    addParams() {
      // 对表单进行预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return

        //如果校验成功，需要添加参数
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        console.log(res)

        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.getParamsData()

        this.addDialogVisible = false
      })
    },
    // 重置修改的表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮 展示修改的对话框
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        { params: { attr_sel: this.activeName } }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }

      this.editForm = res.data

      this.editDialogVisible = true
    },
    //点击按钮 修改参数信息
    editParams() {
      //
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        //
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_sel: this.activeName,
            attr_name: this.editForm.attr_name
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('获取参数信息失败')
        }

        this.$message.success('更新参数信息成功')
        this.getParamsData()

        this.editDialogVisible = false
      })
    },
    // 删除操作
    async delParams(attr_id) {
      //弹出确定取消窗询问用户是否删除
      const result = await this.$confirm(
        '此操作将永久删除该用户，是否继续？',
        '提示',
        {
          confirmButtonText: ' 确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      //如果用户点击的是取消
      if (result === 'cancel') {
        //用户点击的是取消
        return this.$message.info('取消了删除操作')
      }
      //点击确认 真的删除
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )

      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }

      this.$message.success('删除成功')
      //刷新页面
      this.getParamsData()

      this.editDialogVisible = false
    },
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //假如文本框中有正常内容
      // 要将用户输入在文本框的内容添加到attr_vals中
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = ''
      row.inputVisible = false
      //应该要发送请求 添加参数
      this.saveAttrVals(row)
     
    },
    handleClose(index,row){

      row.attr_vals.splice(index,1);

      this.saveAttrVals(row)

    },
    async saveAttrVals(row){
       const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,{
          attr_name:row.attr_name,
          attr_sel:row.attr_sel,
          attr_vals:row.attr_vals.join(" ")
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('更新参数信息失败')
      }

      this.$message.success('更新成功')
    }
  },
  computed: {
    //分类id很常用 可以定义计算属性
    cateId() {
      if (this.selectedKeys.length === 3) {
        //   是三级分类就返回分类id
        return this.selectedKeys[2]
      }
      //   不是就返回 null
      return null
    },
    //按钮是否可用
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>
<style lang="less" scoped>
.el-col {
  padding: 15px;
}
.el-tag {
  margin: 10px;
}
.el-input {
  width: 100px;
}
</style>
