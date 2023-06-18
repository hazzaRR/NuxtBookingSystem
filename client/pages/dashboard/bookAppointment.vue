<template>
    <div>

        <h1>Book an Appointment</h1>

        <p v-if="selectedServiceID">{{ selectedServiceID }}</p>
        <p v-if="selectedEmployeeID">{{ selectedEmployeeID }}</p>

        <button class="btn" :disabled="stage === 1" @click="prevStage">Back</button>
        <button class="btn" :disabled="!isStageCompleted" @click="nextStage">Next Stage</button>

    <div v-if="stage === 1">
      <ServiceForm @update:selectedServiceID="selectedServiceID = $event"/>
    </div>

    <div v-else-if="stage === 2">
      <label>Date:</label>
    <div class="relative mb-6">
    <input type="date" v-model="selectedDate" class="input input-bordered w-full max-w-xs"/>
    </div>
    </div>

    <div v-else-if="stage === 3">
      <EmployeeSelector :selectedDate="selectedDate" @update:selectedEmployeeID="selectedEmployeeID = $event" />
    </div>

    <div v-else>
      <AppointmentSelector />
    </div>


        <!-- <div class="border border-blue-300 shadow rounded-md p-4 max-w-sm w-full mx-auto ease-in-out duration-300">
  <div class="animate-pulse flex space-x-4">
    <div class="rounded-full bg-slate-200 h-10 w-10"></div>
    <div class="flex-1 space-y-6 py-1">
      <div class="h-2 bg-slate-200 rounded"></div>
      <div class="space-y-3">
        <div class="grid grid-cols-3 gap-4">
          <div class="h-2 bg-slate-200 rounded col-span-2">Hello</div>
          <div class="h-2 bg-slate-200 rounded col-span-1"></div>
        </div>
        <div class="h-2 bg-slate-200 rounded"></div>
      </div>
    </div>
  </div> -->


    </div>
</template>

<script setup>
const config = useRuntimeConfig();


definePageMeta({
    middleware: "auth",
    layout: "client-layout"
});

const stage = ref(1);
const selectedServiceID = ref(null);
const selectedDate = ref(new Date().toISOString().slice(0,10));
const selectedEmployeeID = ref(null);
const selectedSlot = ref(null);

const isStageCompleted = computed(() => {
  switch (stage.value) {
    case 1:
      return !!selectedServiceID.value;
    case 2:
      return !!selectedDate.value;
    case 3:
      return !!selectedEmployeeID.value;
    case 4:
      return !!selectedSlot.value;
    default:
      return false;
  }
});



const getEmployees = async () => {

try {

    const response = await fetch(`${config.public.API_BASE_URL}/employees?date=${selectedDate}`, {
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

const nextStage = () => {
    stage.value++;
}

const prevStage = () => {
    stage.value--;
}


</script>

<style lang="scss" scoped>

</style>