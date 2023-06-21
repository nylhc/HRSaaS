<template>
  <div class="container">
    <div class="app-container">
      <!-- 角色管理内容 -->
      <div class="role-operate">
        <el-button size="mini" type="primary" @click="showDialog = true">添加角色</el-button>
      </div>
      <!-- 放置table组件 -->
      <el-table :data="list">
        <!-- 放置列 -->
        <el-table-column prop="name" align="center" width="200" label="角色">
          <template v-slot="{ row }">
            <!-- 条件判断 -->
            <el-input v-if="row.isEdit" v-model="row.cacheEdit.name" size="mini" />
            <span v-else>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="state" align="center" width="200" label="启用">
          <!-- 自定义列结构 -->
          <template v-slot="{ row }">
            <el-switch v-if="row.isEdit" v-model="row.cacheEdit.state" :active-value="1" :inactive-value="0" />
            <span v-else>  {{ row.state | formatState }} </span>
          </template>
        </el-table-column>
        <el-table-column prop="description" align="center" label="描述">
          <template v-slot="{ row }">
            <el-input v-if="row.isEdit" v-model="row.cacheEdit.description" type="textarea" />
            <span v-else>{{ row.description }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template v-slot="{ row }">
            <template v-if="row.isEdit">
              <!-- 编辑状态 -->
              <el-button type="primary" size="mini" @click="btnEditOK(row)">确定</el-button>
              <el-button size="mini" @click="row.isEdit = false">取消</el-button>
            </template>
            <template v-else>
              <!-- 非编辑状态 -->
              <el-button size="mini" type="text" @click="btnPermission(row.id)">分配权限</el-button>
              <el-button size="mini" type="text" @click="btnEditRow(row)">编辑</el-button>
              <el-popconfirm title="这是一段内容确定删除吗？" @onConfirm="confirmDel(row.id)">
                <el-button slot="reference" style="margin-left:10px" size="mini" type="text">删除</el-button>
              </el-popconfirm>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <!-- 放置分页组件 -->
      <el-row type="flex" style="height:60px" align="middle" justify="end">
        <!-- 放置分页组件 -->
        <el-pagination
          :page-size="pageParams.pagesize"
          :current-page.sync="pageParams.page"
          :total="pageParams.total"
          layout="prev, pager, next"
          @current-change="getRoleList"
        />
        <!-- @current-change="changePage" -->
      </el-row>
    </div>

    <!-- 放置权限弹层 -->
    <el-dialog :visible.sync="showPermissionDialog" title="分配权限">
      <!-- 放置权限数据 -->
      <el-tree
        ref="permTree"
        node-key="id"
        :data="permissionData"
        :props="{ label: 'name' }"
        show-checkbox
        default-expand-all
        :default-checked-keys="permIds"
        check-strictly
      />
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="6">
          <el-button type="primary" size="mini" @click="btnPermissionOK">确定</el-button>
          <el-button size="mini" @click="showPermissionDialog = false">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>

    <el-dialog width="500px" title="新增角色" :visible.sync="showDialog" @close="btnCancel">
      <!-- 表单内容 -->
      <el-form ref="roleForm" :model="roleForm" :rules="rules" label-width="120px">
        <el-form-item prop="name" label="角色名称">
          <el-input v-model="roleForm.name" style="width:300px" size="mini" />
        </el-form-item>
        <el-form-item label="启用">
          <!-- 如果不需要校验 就不需要写 prop属性 -->
          <el-switch v-model="roleForm.state" :inactive-value="0" :active-value="1" size="mini" />
        </el-form-item>
        <el-form-item prop="description" label="角色描述">
          <el-input v-model="roleForm.description" type="textarea" :rows="3" style="width:300px" size="mini" />
        </el-form-item>
        <el-form-item>
          <el-row type="flex" justify="center">
            <el-col :span="12">
              <el-button type="primary" size="mini" @click="btnOK">确定</el-button>
              <el-button size="mini" @click="showDialog = false">取消</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { getRoleList, addRole, updateRole, delRole, getRoleDetail, assignPerm } from '@/api/role'
import { getPermissionList } from '@/api/permission'
import { transListToTreeData } from '@/utils/index'
export default {
  name: 'Role',
  filters: {
    formatState(val) {
      return val ? '启用' : '未启用'
    }
  },
  data() {
    return {
      list: [],
      showDialog: false,
      pageParams: {
        page: 1, // 第几页
        pagesize: 10, // 每页多少条
        total: 0
      },
      roleForm: {
        name: '',
        description: '',
        state: 0 // 默认未1启用 关闭 0 打开1
      },
      rules: {
        name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
        description: [{ required: true, message: '角色描述不能为空', trigger: 'blur' }]
      },
      showPermissionDialog: false,
      permissionData: [],
      currentRoleId: null,
      permIds: []
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    async getRoleList() {
      const { rows, total } = await getRoleList(this.pageParams)
      this.pageParams.total = total
      rows.forEach(item => {
        item.isEdit = false
        item.cacheEdit = {
          name: item.name,
          state: item.state,
          description: item.description
        }
      })
      this.list = rows // 赋值数据
    },
    // 切换分页时 请求新的数据
    // changePage(newPage) {
    //   this.pageParams.page = newPage // 赋值当前页码
    //   this.getRoleList()
    // }
    async btnOK() {
      await this.$refs.roleForm.validate()
      await addRole(this.roleForm)
      this.$message.success('新增角色成功')
      this.getRoleList()
      this.showDialog = false // 关闭弹层
    },
    btnCancel() {
      this.$refs.roleForm.resetFields() // 重置表单数据
      this.roleForm.state = 0
    },
    // 点击编辑行
    btnEditRow(row) {
      row.isEdit = true // 改变行的编辑状态
      // 更新缓存数据
      row.cacheEdit.name = row.name
      row.cacheEdit.state = row.state
      row.cacheEdit.description = row.description
    },
    // 点击确定修改时触发
    async  btnEditOK(row) {
      if (!row.cacheEdit.name && !row.cacheEdit.description) return this.$message.warning('角色和描述不能为空')
      await updateRole({ ...row.cacheEdit, id: row.id })
      // 更新成功
      this.$message.success('更新角色成功')
      // 更新显示数据  退出编辑状态
      // row.name = row.editRow.name // eslint的一校验 误判
      // Object.assign(target, source)
      Object.assign(row, {
        ...row.cacheEdit,
        isEdit: false // 退出编辑模式
      }) // 规避eslint的误判
    },
    async  confirmDel(id) {
      await delRole(id)
      this.$message.success('删除角色成功')
      // 删除的如果是最后一个
      if (this.list.length === 1) this.pageParams.page--
      this.getRoleList()
    },

    // 分配权限
    async btnPermission(id) {
      this.currentRoleId = id
      const [{ permIds }, res] = await Promise.all([getRoleDetail(id), getPermissionList()])
      // const { permIds } = await getRoleDetail(id)
      this.permIds = permIds
      // this.permissionData = transListToTreeData(await getPermissionList(), 0)
      this.permissionData = transListToTreeData(res, 0)
      this.showPermissionDialog = true
    },
    // 点击确定时触发
    async btnPermissionOK() {
      await assignPerm({
        id: this.currentRoleId,
        permIds: this.$refs.permTree.getCheckedKeys()
      })
      this.$message.success('角色分配权限成功')
      this.showPermissionDialog = false
    }
  }
}
</script>

<style scoped>
.role-operate {
  padding: 10px;
}
</style>
