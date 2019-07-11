<template>
  <div>
    <h3>用户列表组件</h3>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="beforeDialogClose">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 展示用户列表的表格 -->
    <el-table :data="userlist" boder stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="用户名" prop="username"></el-table-column>
      <el-table-column label="邮箱" prop="email"></el-table-column>
      <el-table-column label="手机号码" prop="mobile"></el-table-column>
      <el-table-column label="角色" prop="role_name"></el-table-column>
      <el-table-column label="状态" prop="mg_state">
        <template slot-scope="scope">
          <!-- {{scope.row}} -->
          <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <!-- 编辑按钮 -->
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="showEditDialog(scope.row.id)"
          ></el-button>
          <!-- 删除按钮 -->
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="removeUserById(scope.row.id)"
          ></el-button>
          <!-- 提示信息 -->
          <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
            <!-- 分配角色设置按钮 -->
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="showSetRoleDialog(scope.row)"
            ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[2, 3, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%">
      <!-- 弹窗主体 -->
      <p>用户名：{{userInfo.username}}</p>
      <p>当前角色：{{userInfo.role_name}}</p>
      <p>
        分配新角色：
        <el-select v-model="selectedId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </p>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //验证邮箱规则
    // var checkEmail=(rule,value,cb)=>{

    // }
    //验证手机号的规则
    // var checkMobile=(rule,value,cb)=>{

    // }

    return {
      //声明一个query对象用来保存用户查询列表时需要传递的参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      //声明一个数组保存请求回来的数据
      userlist: [],
      //用来保存总条数
      total: 0,
      //控制添加用户弹出窗隐藏或显示
      addDialogVisible: false,

      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户名在6~15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            // validator: checkEmail,
            message: '邮箱格式不正确，请重新输入',
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          {
            // validator: checkMobile,
            message: '手机号码不正确，请重新输入',
            trigger: 'blur'
          }
        ]
      },
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      //
      editForm: {},
      editFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            // validator: checkEmail,
            message: '邮箱格式不正确，请重新输入',
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          {
            // validator: checkMobile,
            message: '手机号码不正确，请重新输入',
            trigger: 'blur'
          }
        ]
      },
      // 保存需要分配角色的用户信息
      userInfo: {},
      //控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 用来保护角色的数组
      rolesList:[],
      // 用来保存下拉框选中的那项角色的id
      selectedId:''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      //发送请求获取用户列表数据
      const { data: res } = await this.$http.get('Users', {
        params: this.queryInfo
      })
      //判断一下获取是否成功
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      console.log(res)
      //获取数据成功 将获取的数据保存到data中
      this.userlist = res.data.users
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      //@size-change 事件是在选择每页多少条数据的下拉框时触发
      console.log('handleSizeChange' + newSize)

      //将用户点击的每页数据条数更改到pagesize中
      this.queryInfo.pagesize = newSize
      //根绝最新的参数数据来进行查询
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      //@current-change事件是在页码被点击改变是触发
      console.log('handleCurrentChange' + newPage)

      //将queryInfo中的页码改变用户点击的那个页码
      this.queryInfo.pagenum = newPage
      //根据最新的参数数据来进行查询
      this.getUserList()
    },
    // 用来根据用户点击开关更新用户状态的函数
    async userStateChanged(userinfo) {
      // console.log(userinfo);
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )

      //判断更新情况
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      }

      this.$message.success('更新用户状态成功')
    },
    beforeDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户
    addUser() {
      // addUser函数用来添加用户
      // 但是 添加用户之前必须要校验用户输入数据是否正确
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return

        // 数据没问题 就去做添加用户操作
        const { data: res } = await this.$http.post('users', this.addForm)

        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }

        this.$message.success('添加用户成功')
        //刷新页面
        this.getUserList()
        //重置弹窗的文本框内容
        this.$refs.addFormRef.resetFields()
        //关闭弹出窗
        this.addDialogVisible = false
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      // console.log(id);
      const { data: res } = await this.$http.get('users/' + id)

      if (res.meta.status !== 200) {
        this.$message.error('查询用户信息失败')
      }
      // console.log(res.data);

      this.editForm = res.data

      this.editDialogVisible = true
    },
    //重置修改用户表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 添加用户
    editUser() {
      // 但是 添加用户之前必须要校验用户输入数据是否正确
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return

        // 数据没问题 就去做添加用户操作
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          this.editForm
        )

        if (res.meta.status !== 200) {
          return this.$message.error('更新用户失败')
        }

        this.$message.success('修改用户成功')
        //刷新页面
        this.getUserList()
        //重置弹窗的文本框内容
        this.$refs.editFormRef.resetFields()
        //关闭弹出窗
        this.editDialogVisible = false
      })
    },
    //弹出确定取消窗询问用户是否删除
    async removeUserById(id) {
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
      const { data: res } = await this.$http.delete('users/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }

      this.$message.success('删除成功')
      //刷新页面
      this.getUserList()
    },
    // 展示分配角色按钮的对话框
    async showSetRoleDialog(row) {
      // 形参row传递的就是一个用户的信息 可以将信息保存到数据userInfo中
      this.userInfo = row
      //获取所有的角色 用下拉列表展示角色
      const { data: res } = await this.$http.get('roles')

      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败')
      }
      //将数据保存在data中的rolesList中
      this.rolesList = res.data
      // 让分配角色的对话框显示出来
      this.setRoleDialogVisible = true
    },
    //点击按钮 分配角色
    async saveRoleInfo(){
      if(!this.selectedId) return;
      //发送请求 将选择的新角色保存到数据库
      const {data:res} =await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectedId})

      if(res.meta.status !==200){
        return this.$message.error('更新用户角色失败')
      }

      this.$message.success('更新用户角色成功')
      this.getUserList();

      this.setRoleDialogVisible=false;
    },
    //监听分配角色的关闭事件
    setRoleDialogClosed(){
      this.selectedId=''
    }
  }
}
</script>

<style lang="less" scoped>
</style>

