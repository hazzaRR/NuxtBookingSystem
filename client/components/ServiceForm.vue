<template>
    <div>

        <div v-if="!availableServices">No Services currently available</div>
        <div v-else>
    <div
      v-for="(service, index) in availableServices"
      :key="index"
      @click="selectService(service.id, service.duration_minutes)"
      :class="['border', 'hover:bg-gray-100', isSelected(service.id) ? 'border-blue-500' : 'border-blue-100', isSelected(service.id) ? 'bg-gray-200' : 'bg-white', 'shadow', 'rounded-md', 'p-4', 'max-w-sm', 'w-full', 'mx-auto', 'my-4']">
      <p>{{ service.servicename }}</p>
      <p>{{ `£${service.price}` }}</p>
      <p>{{ `${service.duration_minutes} minutes` }}</p>
      
    </div>

        </div>

    </div>
</template>

<script setup>
const emits = defineEmits(['update:selectedServiceID', 'update:serviceDuration']);
const props = defineProps(['selectedServiceID']);
const config = useRuntimeConfig();


const selectedServiceID = ref(props.selectedServiceID);
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

const selectService = (serviceID, serviceDuration) => {
    selectedServiceID.value = serviceID;
    emits('update:selectedServiceID', serviceID);
    emits('update:serviceDuration', serviceDuration);
};

const isSelected = (serviceID) => {
      return selectedServiceID.value === serviceID;
};





</script>

<style lang="scss" scoped>

</style>