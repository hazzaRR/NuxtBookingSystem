<template>
    <div>
        <NavBar :links="links" :logged-in="true"/>
        <slot />
    </div>
</template>

<script setup>

const links = [
    {name: "Bookings", link: '/employee'},
    {name: "Manage Availability", link: '/employee/manageAvailability'},
    {name: "Manage Blocked Days", link: '/employee/blockDays'},
    {name: "Adjusted Dates", link: '/employee/AdjustAvailability'},
    {name: "Manage Account", link: '/employee/manageAccount'}
]

</script>

<style lang="scss" scoped>

</style>