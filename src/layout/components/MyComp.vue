<template>
  <div
    v-if="visible"
    class="my-box"
    @click="$emit('update:visible', false)"
  >
    <h1>123</h1>
  </div>
</template>

<script>
export default {
  props: {
    visible: Boolean
  }
}
</script>

<style>
.my-box {
  position: fixed;
  z-index: 2023;
  width: 200px;
  height: 200px;
  background-color: skyblue;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>

