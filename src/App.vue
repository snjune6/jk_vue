<script setup>
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <nav class="wrapper">
      <router-link to="/">Home</router-link>
      <span class="spacer">|</span>
      <router-link to="/excel">Excel</router-link>
      <span class="spacer">|</span>
      <router-link to="/content">Content</router-link>
    </nav>
  </header>

  <main>
    <router-view />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

.wrapper {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.spacer {
  opacity: 0.5;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
