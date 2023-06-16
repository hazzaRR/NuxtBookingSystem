<template>
    <div>

        <h1>Book an Appointment</h1>


        <button class="btn" @click="prevStage">Back</button>
        <button class="btn" @click="nextStage">Next Stage</button>


        <div v-if="!availableServices">No Services currently available</div>
        <div v-else>

            <div v-for="(service, index) in availableServices" :key="index" @click="selectService(service.id)">
                <p>{{ service.servicename }}</p>
                <p>{{ service.price }}</p>
            </div>

        </div>

        <div class="border border-blue-300 shadow rounded-md p-4 max-w-sm w-full mx-auto">
  <div class="animate-pulse flex space-x-4">
    <div class="rounded-full bg-slate-200 h-10 w-10"></div>
    <div class="flex-1 space-y-6 py-1">
      <!-- <div class="h-2 bg-slate-200 rounded"></div> -->
      <!-- <div class="space-y-3">
        <div class="grid grid-cols-3 gap-4">
          <div class="h-2 bg-slate-200 rounded col-span-2">Hello</div>
          <div class="h-2 bg-slate-200 rounded col-span-1"></div>
        </div> -->
        <!-- <div class="h-2 bg-slate-200 rounded"></div> -->
      </div>
    </div>
  </div>
</div>

    </div>
</template>

<script setup>
const config = useRuntimeConfig();


definePageMeta({
    middleware: "auth",
    layout: "client-layout"
});

const selectedService = ref(null);
const step = ref(1);
const selectedDate = ref(null);
const selectedEmployee = ref(null);
const selectedSlot = ref(null);
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

const getEmployees = async () => {

try {

    const response = await fetch(`${config.public.API_BASE_URL}/employees?date${selectedDate}`, {
    credentials: "include",
    });

    const data = await response.json();

    if (response === 200) {
        availableServices.value = data.services;
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

const nextStage = () => {
    step.value++;
}

const prevStage = () => {
    step.value--;
}


</script>

<style lang="scss" scoped>

</style>