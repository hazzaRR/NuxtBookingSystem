<template>
<div>
<div v-if="successMessage" class="alert alert-success max-w-sm">
<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
<span>{{serverMessage}}</span>
</div>
<div v-if="errorMessage" class="alert alert-error max-w-sm">
<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
<span>{{serverMessage}}</span>
</div>
    <label>Date:</label>
    <div class="relative mb-6">
    <input type="date" v-model="selectedDate" class="input input-bordered w-full max-w-xs"/>
    </div>
    <label>Time slot length:</label>
    <div class="relative mb-6">
    <input type="number" v-model="defaultSlotLength" class="input input-bordered w-full max-w-xs"/>
    </div>


    <div v-if="!currentSetAvailability">
      <h1>No availability for this date</h1>
    </div>

    <div v-else class="overflow-x-auto">
            <table class="table">
                <thead>
                    <tr>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Available</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(availabilitySlot, index) in currentSetAvailability" :key="index" class="hover">
                    <td>
                    {{availabilitySlot.starttime}}
                    </td>
                    <td>
                    {{availabilitySlot.endtime}}
                    </td>
                    <td>
                    {{availabilitySlot.available}}
                    </td>
                    </tr>
                </tbody>
            </table>
        </div>

    <div class="overflow-x-auto">
    <table class="table">
      <thead>
        <tr>
          <th>Start Time</th>
          <th>End Time</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(slot, index) in timeSlots" :key="index">
          <td>
            <div class="relative mb-6">
            <input type="time" v-model="slot.startTime" class="input input-bordered w-full max-w-xs" @input="updateEndTime(index)" />
            </div>
          </td>
          <td >
            <div class="relative mb-6">
            <input type="time" v-model="slot.endTime" class="input input-bordered w-full max-w-xs" />
            </div>
          </td>
          <td>
            <button @click="removeTimeSlot(index)" class="btn btn-error">Remove</button>
          </td>
        </tr>
        <tr>
          <td colspan="3">
            <button @click="addTimeSlot" class="btn btn-accent">Add Time Slot</button>
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="submitAvailablity" class="btn btn-primary">Submit</button>

  </div>

    </div>
</template>

<script setup>

const config = useRuntimeConfig();

definePageMeta({
    middleware: "auth",
    layout: "employee-layout"
});

const selectedDate = ref(new Date().toISOString().slice(0,10));
const defaultSlotLength = ref(30);
const successMessage = ref(false);
const errorMessage = ref(false);
const serverMessage = ref('');
const currentSetAvailability = ref(null);

const timeSlots = ref([
  { startTime: '09:00', endTime: '09:30' }
])


const getAvailability = async () => {

  try {

    const response = await fetch(`${config.public.API_BASE_URL}/employee/availability?date=${selectedDate.value}`, 
        {
        method: "GET",
        headers: {
                'Content-Type': 'application/json'
        },
        credentials: "include"
        });

        const data = await response.json();

        if (response.status === 200) {
          console.log(data.availability)
          currentSetAvailability.value = data.availability;
        }
        else if (response.status === 409) {

        }
    
  } catch (error) {
    console.log(error);
  }


};


onBeforeMount(() => {

  getAvailability();
})

const addTimeSlot = () => {
      timeSlots.value.push({ startTime: '00:00', endTime: '00:30' });
};

const removeTimeSlot = (index) => {
      timeSlots.value.splice(index, 1);
};

const updateEndTime = (index) => {
      const startTime = new Date(`2000-01-01T${timeSlots.value[index].startTime}`);
      const endTime = new Date(startTime.getTime() + defaultSlotLength.value * 60000); // 30 minutes in milliseconds
      const formattedEndTime = endTime.toTimeString().slice(0, 5);

      timeSlots.value[index].endTime = formattedEndTime;

}


const submitAvailablity = async (event) => {
    const slotData = {
        date: selectedDate.value,
        slots: timeSlots.value
    };


      const response = await fetch(`${config.public.API_BASE_URL}/employee/add-availability`, 
        {
        method: "POST",
        headers: {
                'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify(slotData)
        });

        const data = await response.json();

        if (response.status === 200) {
          successMessage.value = true;
            errorMessage.value = false;
            serverMessage.value = data.message;
        }
        else if (response.status === 409) {
          successMessage.value = false;
            errorMessage.value = true;
            serverMessage.value = data.message;
        }


        timeSlots.value = [{ startTime: '09:00', endTime: '09:30' }]

};





</script>

<style lang="scss" scoped>

</style>