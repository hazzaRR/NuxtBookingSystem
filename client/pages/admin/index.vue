<template>
    <div>

        <h1>Admin dashboard</h1>

        <nav>
            <NuxtLink to="/admin">Dashboard</NuxtLink>
            <NuxtLink to="/admin/registerEmployee">Register Employee</NuxtLink>
            <NuxtLink to="/admin/deleteEmployee">Delete Employee</NuxtLink>
            <NuxtLink to="/admin/settings">Settings</NuxtLink>
        </nav>
            
    </div>
</template>

<script setup>

definePageMeta({
    middleware: "auth"
});


</script>

<style lang="scss" scoped>

</style>