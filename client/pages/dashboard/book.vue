<template>
    <div>

    <div class="w-10/12 border rounded-md mx-auto border-blue-100">


      <div class="w-full flex border rounded-md border-blue-100">

        
        <button class="btn mx-1 my-4 btn-accent" :disabled="stage === 1" @click="prevStage"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
        </svg>
      </button>
      <button class="btn mx-1 my-4 btn-accent" :disabled="!isStageCompleted" @click="nextStage"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
      </svg>
    </button>
    
    <ul class="steps steps-horizontal mx-auto flex-auto items-center">
      <li :class="['step', {'step-primary': stage >= 1}]">Service</li>
      <li :class="['step', {'step-primary': stage >= 2}]">Date</li>
      <li :class="['step', {'step-primary': stage >= 3}]">Employee</li>
      <li :class="['step', {'step-primary': stage >= 4}]">Time</li>
      <li :class="['step', {'step-primary': stage >= 5}]">Review</li>
    </ul>
    </div>
        <div v-if="stage === 1">
            <ServiceForm @update:selectedServiceID="selectedServiceID = $event" @update:serviceDuration="duration = $event" @update:serviceName="serviceName = $event" :selectedServiceID='selectedServiceID'/>
        </div>

        <div v-else-if="stage === 2">
          <label>Date:</label>
          <div class="flex items-center">
            <input type="date" v-model="selectedDate" :min="new Date().toISOString().slice(0,10)" class="input input-bordered w-full max-w-xs mx-auto mb-6"/>
          </div>
        </div>
        
        <div v-else-if="stage === 3">
          <EmployeeSelector :selectedDate="selectedDate" @update:employeeName="employeeName = $event" @update:selectedEmployeeID="selectedEmployeeID = $event" :selectedEmployeeID="selectedEmployeeID"/>
        </div>
        
        <div v-else-if="stage === 4">
          <SlotSelector :selectedDate="selectedDate" :selectedEmployeeID="selectedEmployeeID" :duration="duration" :selectedSlot="selectedSlot" @update:selectedSlot="selectedSlot = $event"/>
        </div>

        <div v-else-if="stage === 5">
          <ReviewBooking :selectedDate="selectedDate" :selectedEmployeeID="selectedEmployeeID" :employeeName="employeeName" :selectedServiceID="selectedServiceID" :serviceName="serviceName" :duration="duration" :selectedSlot="selectedSlot" @update:bookingstatus="bookingStatus = $event" @update:serverMessage="serverMessage = $event"/>
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

    <Alert v-if="bookingStatus !== null" :messageType="bookingStatus" :message="serverMessage" @closeAlert="refreshPage()"/>

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
const serviceName = ref(null);
const selectedDate = ref(new Date().toISOString().slice(0,10));
const selectedEmployeeID = ref(null);
const employeeName = ref(null);
const selectedSlot = ref(null);
const bookingStatus = ref(null);
const serverMessage = ref(null);

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


const refreshPage = () => {

  stage.value = 1;
  selectedServiceID.value = null;
  duration.value = ref(null);
  selectedDate.value = new Date().toISOString().slice(0,10);
  selectedEmployeeID.value = null;
  selectedSlot.value = null;
  bookingStatus.value = null;
  serverMessage.value = null;

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