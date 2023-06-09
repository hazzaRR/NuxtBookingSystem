<template>
    <div>

        <h1>Employee dashboard</h1>

    </div>
</template>

<script setup>

definePageMeta({
    middleware: "auth",
    layout: "employee-layout"
});
</script>

<style lang="scss" scoped>

</style>