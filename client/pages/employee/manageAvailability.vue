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

    <div class="flex items-center justify-center">
    <div class="w-3/5">
    <table class="table">
      <thead>
        <tr>
          <th>Day</th>
          <th>Available</th>
          <th>Start Time</th>
          <th>End Time</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(day, index) in availability" :key="index">
          <td>
            <div class="relative mb-6">
            <p type="time" class="input input-bordered w-full max-w-xs flex items-center">{{ day.dayofweek }}</p>
            </div>
          </td>
          <td>
            <div class="relative mb-6">
              <input type="checkbox" class="toggle toggle-primary flex items-center" v-model="day.available"/>
            </div>
          </td>
          <td>
            <div class="relative mb-6">
            <input type="time" step="900" v-model="day.starttime" class="input input-bordered w-full max-w-xs flex items-center" :disabled="!day.available"/>
            </div>
          </td>
          <td >
            <div class="relative mb-6">
            <input type="time" step="900" v-model="day.endtime" class="input input-bordered w-full max-w-xs flex items-center" :disabled="!day.available"/>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="3">
            <button @click="updateAvailability" class="btn btn-accent">Update</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
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
const availability = ref(null);
const csrf_token = ref(null);

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
          console.log(data.availability);
          availability.value = data.availability;
        }
        else if (response.status === 409) {

        }
    
  } catch (error) {
    console.log(error);
  }


};


onBeforeMount(async () => {
  csrf_token.value = await getCSRFToken();
  getAvailability();
})

const updateAvailability = async (event) => {
    const employeeAvailability = {
      availability: availability.value,
    };

    console.log(availability.value);


      const response = await fetch(`${config.public.API_BASE_URL}/employee/update-availability`, 
        {
        method: "PUT",
        headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrf_token.value

        },
        credentials: "include",
        body: JSON.stringify(employeeAvailability)
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


};





</script>

<style lang="scss" scoped>

</style>