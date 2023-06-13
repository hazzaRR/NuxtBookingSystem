<template>
    <div>
        <NavBar :links="links" :logged-in="true"/>
        <slot />
    </div>
</template>

<script setup>

const links = [
    {name: "Dashboard", link: '/dashboard'},
    {name: "Book Appointment", link: '/dashboard/bookAppointment'},
    {name: "View Appointments", link: '/dashboard/viewAppointments'},
    {name: "Manage Account", link: '/dashboard/manageAccount'}
]

</script>

<style lang="scss" scoped>

</style>