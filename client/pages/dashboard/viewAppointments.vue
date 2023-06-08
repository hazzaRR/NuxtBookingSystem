<template>
    <div>

        <h1>View your Appointments</h1>

        <NuxtLink to="/dashboard">Dashboard</NuxtLink>
        <NuxtLink to="/dashboard/bookAppointment">Book an Appointment</NuxtLink>
        <NuxtLink to="/dashboard/viewAppointments">View Appoinments</NuxtLink>



    </div>
</template>

<script setup>

definePageMeta({
    middleware: "auth",
    layout: "client-layout"
});

</script>

<style lang="scss" scoped>

</style>