<template>
    <div>

        <h1>View your Appointments</h1>
    </div>
</template>

<script setup>

const config = useRuntimeConfig();

definePageMeta({
    middleware: "auth",
    layout: "client-layout"
});

const getAppointments = async () => {
    const response = await fetch(`${config.public.API_BASE_URL}/client/appointments`, {
    credentials: "include",
    });

    const data = await response.json();
    console.log(data);

    if (response.status === 200) {

    }

};

onMounted(() => {
    getAppointments();
});

</script>

<style lang="scss" scoped>

</style>