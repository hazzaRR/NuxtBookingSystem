<template>
    <div>
        <NavBar :links="links" :logged-in="true"/>
        <slot />
    </div>
</template>

<script setup>

const links = [
    {name: "Dashboard", link: '/employee'},
    {name: "Manage Availability", link: '/employee/manageAvailability'},
    {name: "Manage Blocked Days", link: '/employee/blockDays'},
    {name: "Adjusted Dates", link: '/employee/AdjustAvailability'},
    {name: "Manage Bookings", link: '/employee/manageBookings'},
    {name: "Manage Account", link: '/employee/manageAccount'}
]

</script>

<style lang="scss" scoped>

</style>