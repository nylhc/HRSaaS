<template>
  <div>
    <!-- 放置一个弹层 用来编辑新增节点 -->
    <el-dialog :title="`${showText}权限点`" :visible="showDialog" @close="btnCancel">
      <!-- 表单 -->
      <el-form ref="perForm" :model="formData" :rules="rules" label-width="120px">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="formData.name" style="width:90%" />
        </el-form-item>
        <el-form-item label="权限标识" prop="code">
          <el-input v-model="formData.code" style="width:90%" />
        </el-form-item>
        <el-form-item label="权限描述">
          <el-input v-model="formData.description" style="width:90%" />
        </el-form-item>
        <el-form-item label="开启">
          <el-switch
            v-model="formData.enVisible"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="6">
          <el-button size="small" type="primary" @click="btnOK">确定</el-button>
          <el-button size="small" @click="btnCancel">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog></div>
</template>

<script>
import { updatePermission, addPermission, getPermissionDetail } from '@/api/permission'
export default {
  name: 'PDialog',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: {
        name: '', // 名称
        code: '', // 标识
        description: '', // 描述
        type: '', // 类型 该类型 不需要显示 因为点击添加的时候已经知道类型了
        pid: '', // 因为做的是树 需要知道添加到哪个节点下了
        enVisible: '0' // 默认关闭
      },
      rules: {
        name: [{ required: true, message: '权限名称不能为空', trigger: 'blur' },
          {
            validator: async(rule, value, callback) => {
              this.$emit('getPermissionList')
              const allPer = this.$parent.list
              console.log(allPer)
              let filterPer = allPer.filter(item => item.pid === this.formData.pid)
              if (this.formData.id) {
                filterPer = filterPer.filter(item => item.id !== this.formData.id)
              }
              const isRepect = filterPer.some(item => item.name === value)
              isRepect ? callback(new Error(`已存在同名${value}权限点`)) : callback()
            }, trigger: 'blur'
          }],
        code: [{ required: true, message: '权限标识不能为空', trigger: 'blur' },
          { validator: (rule, value, callback) => {
            this.$emit('getPermissionList')
            let allPer = this.$parent.list
            if (this.formData.id) {
              allPer = allPer.filter(item => item.id !== this.formData.id)
            }
            allPer.some(item => item.code === value) ? callback(new Error(`已存在同名${value}标识`)) : callback()
          }, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    showText() {
      return this.formData.id ? '编辑' : '新增'
    }
  },
  methods: {
    async btnOK() {
      await this.$refs.perForm.validate()
      if (this.formData.id) {
        await updatePermission(this.formData)
      } else {
        await addPermission(this.formData)
      }
      this.$message.success(this.formData.id ? '修改成功' : '新增成功')
      this.$emit('getPermissionList')
      this.btnCancel()
    },
    // 获取权限详情
    async getPermissionDetail(id) {
      this.formData = await getPermissionDetail(id)
    },
    btnCancel() {
      this.formData = {
        name: '', // 名称
        code: '', // 标识
        description: '', // 描述
        type: '', // 类型 该类型 不需要显示 因为点击添加的时候已经知道类型了
        pid: '', // 因为做的是树 需要知道添加到哪个节点下了
        enVisible: '0' // 默认关闭
      }
      this.$refs.perForm.resetFields()
      this.$emit('update:show-dialog', false)
    }
  }
}
</script>

<style>

</style>
