<script setup>
</script>

<template>
  <section class="content">
    <h1>Content</h1>

    <nav class="subnav">
      <router-link to="/content/page1">Page1</router-link>
      <span class="spacer">|</span>
      <router-link to="/content/page2">Page2</router-link>
      <span class="spacer">|</span>
      <router-link to="/content/page3">Page3</router-link>
    </nav>

    <div class="outlet">
      <router-view />
    </div>
  </section>
</template>

<style scoped>
.content {
  max-width: 840px;
  margin: 0 auto;
  padding: 1rem;
  text-align: center;
}
.subnav { display: flex; gap: 0.5rem; justify-content: center; margin: 1rem 0; }
.spacer { opacity: 0.5; }
.outlet { border-top: 1px solid #eee; margin-top: 1rem; padding-top: 1rem; }
</style>
