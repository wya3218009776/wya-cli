<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  version: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <section class="card">
    <h1>{{ title }}</h1>
    <p>Vue3 模板创建成功</p>
    <p>当前版本：{{ version }}</p>
    <p>你现在可以开始开发自己的项目了。</p>
  </section>
</template>

<style scoped>
.card {
  width: min(720px, calc(100% - 32px));
  padding: 40px 32px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
}

h1 {
  margin: 0 0 16px;
  color: #42b883;
}

p {
  margin: 12px 0;
  color: #475569;
}
</style>
