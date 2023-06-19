<template>
    <div>

        <h1>welcome to the home page</h1>

        <p v-if="csrf_token">{{ csrf_token }}</p>

    </div>
</template>

<script setup>

const csrf_token = ref(null);

onMounted(async () => {
    csrf_token.value = await getCSRFToken();
    console.log(csrf_token.value);
});

definePageMeta({
    middleware: "auth",
    layout: "client-layout"
});

</script>

<style lang="scss" scoped>

</style>