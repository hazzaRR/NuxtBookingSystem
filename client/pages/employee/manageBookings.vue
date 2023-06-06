<template>
    <div>

        <h1>Employee dashboard</h1>

        <Calendar />

    </div>
</template>

<script setup>
definePageMeta({
    middleware: "auth"
});

</script>

<style lang="scss" scoped>

</style>