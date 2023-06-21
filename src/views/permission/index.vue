<template>
  <div class="container">
    <div class="app-container">
      <el-button class="btn-add" size="mini" type="primary" @click="addPermission(0, 1)">添加权限</el-button>
      <el-table default-expand-all :data="list" row-key="id">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="code" label="标识" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作">
          <template v-slot="{ row }">
            <el-button v-if="row.type === 1" size="mini" type="text" @click="addPermission(row.id, 2)">添加</el-button>
            <el-button type="text" size="mini" @click="editPermission(row.id)">编辑</el-button>
            <el-button type="text" size="mini" @click="delPermission(row.id)"> 删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <permission-dialog
      ref="PermissionDialog"
      :show-dialog.sync="showDialog"
      @getPermissionList="getPermissionList"
    />
  </div>
</template>

<script>
import { getPermissionList, delPermission } from '@/api/permission'
import { transListToTreeData } from '@/utils'
import PermissionDialog from './components/PermissionDialog.vue'
export default {
  name: 'Permission',
  components: { PermissionDialog },
  data() {
    return {
      list: [],
      showDialog: false
    }
  },
  created() {
    this.getPermissionList()
  },
  methods: {
    async  getPermissionList() {
      this.list = transListToTreeData(await getPermissionList(), 0)
    },
    // 添加权限
    addPermission(pid, type) {
      this.$refs.PermissionDialog.formData.pid = pid
      this.$refs.PermissionDialog.formData.type = type
      this.showDialog = true
    },
    // 修改权限
    async editPermission(id) {
      await this.$refs.PermissionDialog.getPermissionDetail(id)
      this.$refs.PermissionDialog.formData.id = id
      this.showDialog = true
    },
    // 删除操作
    async delPermission(id) {
      try {
        await this.$confirm('确定要删除该数据吗')
        await delPermission(id)
        this.getPermissionList()
        this.$message.success('删除成功')
      } catch (error) {
        this.$message.error(error)
      }
    }
  }

}
</script>

<style>
.btn-add {
  margin: 10px;
}
</style>
