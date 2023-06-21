<template>
  <el-dialog
    :title="showTitle"
    :visible="showDialog"
    @close="close"
  >
    <el-form
      ref="addDept"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item
        prop="name"
        label="部门名称"
      >
        <el-input
          v-model="formData.name"
          placeholder="2-10个字符"
          style="width: 80%"
          size="mini"
        />
      </el-form-item>
      <el-form-item
        prop="code"
        label="部门编码"
      >
        <el-input
          v-model="formData.code"
          placeholder="2-10个字符"
          style="width: 80%"
          size="mini"
        />
      </el-form-item>
      <el-form-item
        prop="managerId"
        label="部门负责人"
      >
        <el-select
          v-model="formData.managerId"
          placeholder="请选择负责人"
          style="width: 80%"
          size="mini"
          clearable
        >
          <el-option
            v-for="item in managerList"
            :key="item.id"
            :label="item.username"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        prop="introduce"
        label="部门介绍"
      >
        <el-input
          v-model="formData.introduce"
          placeholder="1-100个字符"
          type="textarea"
          size="mini"
          :rows="4"
          style="width: 80%"
        />
      </el-form-item>
      <el-form-item>
        <!-- 按钮 -->
        <el-row
          type="flex"
          justify="center"
        >
          <el-col :span="12">
            <el-button
              size="mini"
              type="primary"
              @click="btnOK"
            >确定</el-button>
            <el-button
              size="mini"
              @click="close"
            >取消</el-button>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script>
import { getDepartment, getManagerList, addDepartment, getDepartmentDetail, updateDepartment } from '@/api/department'
export default {
  name: 'AddDept',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    currentNodeId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      managerList: [], // 存储负责人列表
      formData: {
        name: '', // 部门名称
        code: '', // 部门编码
        managerId: '', // 部门负责人id
        introduce: '', // 部门介绍
        pid: '' // 父级部门的id
      },
      rules: {
        // 部门名称
        name: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }, {
          min: 2, max: 10, message: '部门名称的长度为2-10个字符', trigger: 'blur'
        }, {
          trigger: 'blur',
          // 自定义校验模式
          validator: async(rule, value, callback) => {
            // value就是输入的编码
            let result = await getDepartment()
            // 判断是否是编辑模式
            if (this.formData.id) {
              // 编辑场景下排除自身
              result = result.filter(item => item.id !== this.formData.id)
            }
            // result数组中是否存在 value值
            result.some(item => item.name === value) ? callback(new Error('已存在该部门')) : callback()
          }
        }],
        // 部门编码
        code: [{ required: true, message: '部门编码不能为空', trigger: 'blur' }, {
          min: 2, max: 10, message: '部门编码的长度为2-10个字符', trigger: 'blur'
        }, {
          trigger: 'blur',
          // 自定义校验模式
          validator: async(rule, value, callback) => {
            // value就是输入的编码
            let result = await getDepartment()
            // 判断是否是编辑模式
            if (this.formData.id) {
              // 编辑场景下排除自身
              result = result.filter(item => item.id !== this.formData.id)
            }
            // result数组中是否存在 value值
            if (result.some(item => item.code === value)) {
              callback(new Error('部门已存在该编码'))
            } else {
              callback()
            }
          }
        }],
        // 部门负责人id
        managerId: [{ required: true, message: '部门负责人不能为空', trigger: 'change' }],
        // 部门介绍
        introduce: [{ required: true, message: '部门介绍不能为空', trigger: 'blur' }, {
          min: 1, max: 100, message: '部门介绍的长度为1-100个字符', trigger: 'blur'
        }]
        // pid: '' // 父级部门的id 不需要做校验
      }
    }
  },
  computed: {
    showTitle() {
      return this.formData.id ? '编辑部门' : '新增部门'
    }
  },
  created() {
    this.getManagerList()
  },
  methods: {
    close() {
      // 修改父组件的值 子传父
      this.$emit('update:showDialog', false)
      // resetFields 只能重置在模板中绑定的数据
      this.formData = {
        code: '', // 部门编码
        introduce: '', // 部门介绍
        managerId: '', // 部门负责人id
        name: '', // 部门名称
        pid: '' // 父级部门的id
      }
      this.$refs.addDept.resetFields() // 重置表单
      this.$emit('show-loading', false)
      // this.loading = false
    },
    async getManagerList() {
      this.managerList = await getManagerList()
    },
    // 获取组织的详情
    async getDepartmentDetail(id) {
      this.formData = await getDepartmentDetail(id)
      this.$emit('show-loading', false)
    },
    // 点击确定时调用
    btnOK() {
      // this.loading = true
      this.$refs.addDept.validate(async isOK => {
        if (isOK) {
          if (this.formData.id) {
            // 修改
            await updateDepartment(this.formData)
          } else {
            // 添加
            await addDepartment({ ...this.formData, pid: this.currentNodeId })
          }

          // 通知父组件更新
          this.$emit('add-success')
          // 提示消息
          this.$message.success(`${this.formData.id ? '修改' : '新增'}部门成功`)
          this.close()
        }
      })
    }
  }
}
</script>
