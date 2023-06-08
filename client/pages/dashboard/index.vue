<template>
    <div>

        <h1>welcome to the home page</h1>

    </div>
</template>

<script setup>

definePageMeta({
    middleware: "auth",
    layout: "client-layout"
});

</script>

<style lang="scss" scoped>

</style>