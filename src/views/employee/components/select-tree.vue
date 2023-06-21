<template>
  <!-- element-ui级联组件 -->
  <el-cascader
    :value="departmentId"
    size="mini"
    :options="treeData"
    :props="props"
    separator="-"
    @change="changeValue"
  />
</template>
<script>
import { getDepartment } from '@/api/department'
import { transListToTreeData } from '@/utils'
export default {
  name: 'SelectTree',
  props: {
    departmentId: {
      type: Number, // 存储的是部门的id  3 4 5
      default: null
    }
  },
  data() {
    return {
      // val: '',
      treeData: [], // 赋值给 级联组件的options
      props: {
        label: 'name', // 要展示的字段
        value: 'id', // 要存储的字段
        emitPath: false
      }
    }
  },
  created() {
    this.getDepartment()
  },
  methods: {
    async getDepartment() {
      this.treeData = transListToTreeData(await getDepartment(), 0) // 将组织架构的数据 转化树形赋值给treeData
    },
    changeValue(val) {
      this.$emit('update:department-id', val)
      console.log(val)
    }
  }
}
</script>
