<template>
  <div>
    <h3>商品列表</h3>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>

        <el-col :span="4">
          <el-button type="primary"  @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="goodsList" broder stripe>
        <el-table-column type="expand"></el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格（元）" width="95px"></el-table-column>
        <el-table-column prop="goods_number" label="商品数量" width="70px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="140px">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="125px">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" type="primary" size="mini"></el-button>
            <el-button
              icon="el-icon-delete"
              type="danger"
              size="mini"
              @click="delGoodsById(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[20, 30, 50, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //商品列表数据
      goodsList: [],
      // 总数量
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    //获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }

      this.$message.success('获取商品列表成功')
      console.log(res)

      //将查询到的数据保存到data中
      this.goodsList = res.data.goods
      console.log(this.goodsList)

      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      console.log(newSize)
      //更改查询条件中的每页数据条数
      this.queryInfo.pagesize = newSize
      //根绝最新的size来查询数据
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      console.log(newPage)
      //更改查询条件中的每页数据条数
      this.queryInfo.pagenum = newPage
      //根绝最新的num来查询数据
      this.getGoodsList()
    },
    async delGoodsById(row) {
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
        //用户点的是确定 所以删除
        console.log(row.goods_id);
        
      }

      // 当用户点击按钮 删除对应权限
      const { data: res } = await this.$http.delete(`goods/${row.goods_id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败！')
      }
      this.$message.success('删除成功！')
      this.getGoodsList();
    },
    goAddpage(){
      //跳转到/goods/add路径来完成商品
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
</style>