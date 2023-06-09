<template>
    <div>

        <h1>Manage Bookings</h1>

        <Calendar />

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