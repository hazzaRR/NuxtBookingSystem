<template>
    <div>

        <h1>Delete Employee</h1>

        <NuxtLink to="/admin">Dashboard</NuxtLink>
        <NuxtLink to="/admin/registerEmployee">Register Employee</NuxtLink>
        <NuxtLink to="/admin/deleteEmployee">Delete Employee</NuxtLink>

    </div>
</template>

<script setup>

definePageMeta({
    middleware: "auth"
});


</script>

<style lang="scss" scoped>

</style>