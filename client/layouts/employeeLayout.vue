<template>
    <div>
        <NavBar :links="links" />
        <slot />
    </div>
</template>

<script setup>

const links = [
    {name: "Dashboard", link: '/employee'},
    {name: "Add Availability", link: '/employee/addAvailability'},
    {name: "Manage Bookings", link: '/employee/manageBookings'},
    {name: "Manage Account", link: '/employee/manageAccount'}
]

</script>

<style lang="scss" scoped>

</style>