<script setup>
import WelcomeCard from './components/WelcomeCard.vue';

const appName = '<%= projectName %>';
const appVersion = '<%= projectVersion %>';
</script>

<template>
  <main class="app">
    <WelcomeCard :title="appName" :version="appVersion" />
  </main>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}
</style>
