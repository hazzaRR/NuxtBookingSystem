<template>
    <div>

        <h1>Manage Bookings</h1>

        <NuxtLink to="/employee">Dashboard</NuxtLink>
        <NuxtLink to="/employee/manageAccount">Manage Account</NuxtLink>
        <NuxtLink to="/employee/addAvailability">Add Availability</NuxtLink>
        <NuxtLink to="/employee/manageBookings">Manage Bookings</NuxtLink>

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