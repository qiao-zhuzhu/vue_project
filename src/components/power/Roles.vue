<template>
  <div>
    <h3>角色列表</h3>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',index1 === 0 ? 'bdtop' : '','vcenter']"
              v-for="(item1,index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 第一个el-col渲染的是第一季资源 -->
              <el-col :span="5">
                <el-tag closable
                      @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 第二个el-col渲染的是二三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 渲染二级权限 -->
                <el-row
                  :class="[index2 === 0 ? '' : 'bdtop','vcenter']"
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag type="success" closable
                      @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3,index3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" type="primary" size="mini">编辑</el-button>
            <el-button icon="el-icon-delete" type="danger" size="mini">删除</el-button>
            <el-button icon="el-icon-setting" type="warning" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分配权限对话框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%" @close="setRightDialogClosed"
      >
        <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defkeys"></el-tree>
  
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      // 显示与隐藏分配权限对话框
      setRightDialogVisible: false,
      // 保存树形结构的权限列表
      rightsList: [],
      treeProps:{
        children: 'children',
        label: 'authName'
      },
      // 所有三级权限的ID，用设置分配权限的默认选中项
      defkeys:[]
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')

      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }

      this.rolesList = res.data
    },
    //根据id删除对应权限
    async removeRightById(row, id) {
      // 弹框提示用户是否要删除
      const result = await this.$confirm(
        '此操作将永久删除该用户，是否继续？',
        '提示',
        {
          confirmButtonText: ' 确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (result !== 'confirm') {
        return this.$message.info('取消了删除！')
      }

      // 当用户点击按钮 删除对应权限
      const { data: res } = await this.$http.delete(
        `roles/${row.id}/rights/${id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败！')
      }
        this.$message.success('删除成功！')
        
      row.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(node) {
      // 获取树形结构的权限列表
      const { data: res } = await this.$http.get('rights/tree');
      if(res.meta.status !==200){
        return this.$message.error('获取角色权限数失败')
      }
      this.rightsList = res.data      
      // console.log(node);
      this.getLeafKeys(node,this.defkeys)
      console.log(this.defkeys);
      
      this.setRightDialogVisible = true
    },
    // 递归
    getLeafKeys(node,arr){
      // 如果当前node节点不包含children属性，则是三级节点
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item => {
          this.getLeafKeys(item,arr)
      });
    },
    setRightDialogClosed(){
      this.defkeys=[];
    },
    allotRights(){
      const ids =[
          
      ]
    }
  }
}
</script>
  
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdbottom {
  border-bottom: 1px sold #eee;
}
.bdtop {
  border-bottom: 1px sold #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
