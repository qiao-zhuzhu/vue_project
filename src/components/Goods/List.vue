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
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>

        <el-col :span="4">
          <el-button type="primary">添加商品</el-button>
        </el-col>
      </el-row>
        <el-table :data="goodsList" broder stripe>
          <el-table-column type="expand"></el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="goods_name" label="商品名称"></el-table-column>
          <el-table-column prop="goods_price" label="商品价格（元）" width="98px"></el-table-column>
          <el-table-column prop="goods_number" label="商品数量" width="98px"></el-table-column>
          <el-table-column prop="add_time" label="商品时间" width="98px"></el-table-column>
          <el-table-column label="操作">
              <template slot-scope="scope">
                  <el-button icon="el-icon-edit" type="primary" size="mini">编辑</el-button>
            <el-button icon="el-icon-delete" type="danger" size="mini">删除</el-button>
              </template>
          </el-table-column>
      </el-table>
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
      console.log(this.goodsList);
      
      this.total = res.data.total
    }
  }
}
</script>

<style lang="less" scoped>
</style>