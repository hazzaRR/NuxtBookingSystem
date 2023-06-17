<template>
    <div>

        <div v-if="!availableServices">No Services currently available</div>
        <div v-else>

            <div v-for="(service, index) in availableServices" :key="index" @click="selectService(service.id)">
                <p>{{ service.servicename }}</p>
                <p>{{ service.price }}</p>
            </div>

        </div>

    </div>
</template>

<script setup>
const config = useRuntimeConfig();

const selectedService = ref(null);
const availableServices = ref(null);

const getServices = async () => {

try {

    const response = await fetch(`${config.public.API_BASE_URL}/services`, {
    credentials: "include",
    });

    const data = await response.json();
    console.log(response.status);

    if (response.status === 200) {
        availableServices.value = data.services;
        console.log(availableServices.value);
    };
    
} catch (error) {
    console.log(error);
}
};

onBeforeMount(() => {
    getServices();
})

const selectService = (serviceID) => {
    selectedService.value = serviceID;
};





</script>

<style lang="scss" scoped>

</style>