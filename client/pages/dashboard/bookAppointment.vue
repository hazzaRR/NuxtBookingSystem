<template>
    <div>

        <h1>Book an Appointment</h1>

        <div v-if="successMessage" class="alert alert-success max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{serverMessage}}</span>
        </div>
        <div v-if="errorMessage" class="alert alert-error max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{serverMessage}}</span>
        </div>


      <div class="w-10/12 border rounded-md mx-auto border-blue-100">
        
        
        <button class="btn mx-1 my-4" :disabled="stage === 1" @click="prevStage"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
</svg>
</button>
        <button class="btn mx-1 my-4" :disabled="!isStageCompleted" @click="nextStage"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
</svg>
</button>
        
        <div v-if="stage === 1">
            <ServiceForm @update:selectedServiceID="selectedServiceID = $event" @update:serviceDuration="duration = $event" :selectedServiceID='selectedServiceID'/>
        </div>

        <div v-else-if="stage === 2">
          <label>Date:</label>
          <div class="mx-auto">
            <input type="date" v-model="selectedDate" :min="new Date().toISOString().slice(0,10)" class="input input-bordered w-full max-w-xs"/>
          </div>
        </div>
        
        <div v-else-if="stage === 3">
          <EmployeeSelector :selectedDate="selectedDate" @update:selectedEmployeeID="selectedEmployeeID = $event" :selectedEmployeeID="selectedEmployeeID"/>
        </div>
        
        <div v-else>
          <SlotSelector :selectedDate="selectedDate" :selectedEmployeeID="selectedEmployeeID" :selectedServiceID="selectedServiceID" :duration="duration"/>
        </div>
        
      </div>
    
    <!-- <div class="border border-blue-300 shadow rounded-md p-4 max-w-sm w-full mx-auto ease-in-out duration-300">
      <div class="animate-pulse flex space-x-4">
        <div class="rounded-full bg-slate-200 h-10 w-10"></div>
        <div class="flex-1 space-y-6 py-1">
          <div class="h-2 bg-slate-200 rounded"></div>
          <div class="space-y-3">
            <div class="grid grid-cols-3 gap-4">
          <div class="h-2 bg-slate-200 rounded col-span-2">Hello</div>
          <div class="h-2 bg-slate-200 rounded col-span-1">Time</div>
        </div>
        <div class="h-2 bg-slate-200 rounded">Name</div>
      </div>
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
const duration = ref(null);
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