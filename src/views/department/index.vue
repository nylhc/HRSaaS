<template>
  <div class="container">
    <div v-loading="loading" class="app-container">
      <el-tree
        default-expand-all
        :data="depts"
        :props="defaultProps"
        :expand-on-click-node="false"
      >
        <!-- 节点结构 -->
        <!-- v-slot="{ node, data }" 只能作用在template -->
        <template v-slot="{ data }">
          <el-row
            style="width:100%;height:40px"
            type="flex"
            justify="space-between"
            align="middle"
          >
            <el-col>{{ data.name }}</el-col>
            <el-col :span="6">
              <span class="tree-manager">{{ data.managerName }}</span>
              <!-- $event 实参 表示类型 -->
              <el-dropdown @command="operateDept($event, data.id)">
                <!-- 显示区域内容 -->
                <span class="el-dropdown-link">
                  操作<i class="el-icon-arrow-down el-icon--right" />
                </span>
                <!-- 下拉菜单选项 -->
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="add">添加子部门</el-dropdown-item>
                  <el-dropdown-item command="edit">编辑部门</el-dropdown-item>
                  <el-dropdown-item command="del">删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </el-col>
          </el-row>
        </template>
      </el-tree>
    </div>
    <!-- <add-dept
      :show-dialog="showDialog"
      @update:showDialog="showDialog = $event"
    /> -->
    <add-dept
      ref="addDept"
      :show-dialog.sync="showDialog"
      :current-node-id="currentNodeId"
      @add-success="getDepartment"
      @show-loading="loading = $event"
    />
  </div>
</template>

<script>
import { getDepartment, delDepartment } from '@/api/department'
import { transListToTreeData } from '@/utils/index'
import addDept from './components/add-dept.vue'
export default {
  name: 'Department',
  components: { addDept },
  data() {
    return {
      showDialog: false,
      currentNodeId: null, // 存储当前点击的id
      depts: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      loading: false
    }
  },
  created() {
    this.getDepartment()
  },
  methods: {
    async getDepartment() {
      const result = await getDepartment()
      this.depts = transListToTreeData(result, 0)
    },
    async operateDept(type, id) {
      if (type === 'add') {
        // this.loading = true
        // 添加
        this.currentNodeId = id
        this.showDialog = true
      } else if (type === 'edit') {
        // this.loading = true
        // 编辑
        // 父组件调用子组件的方法来获取数据
        await this.$refs.addDept.getDepartmentDetail(id) // this.$refs.addDept等同于子组件的this
        // this.$nextTick(() => {
        //   this.$refs.addDept.getDepartmentDetail()
        // })
        this.showDialog = true
      } else {
        // 删除
        try {
          await this.$confirm('您确认要删除该部门吗')
          await delDepartment(id)
          // 提示消息
          this.$message.success('删除部门成功')
          this.getDepartment()
        } catch (error) {
          return
        }
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 30px 140px;
  font-size: 14px;
}
.tree-manager {
  width: 50px;
  display: inline-block;
  margin: 10px;
}
</style>
