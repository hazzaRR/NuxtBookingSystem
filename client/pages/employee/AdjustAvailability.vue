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


    <button onclick="addAdjusted.showModal()" class="btn btn-accent">Add</button>


    <div v-if="isEmpty">
        currently no uncoming Adjusted availability dates
    </div>

    <div v-else class="flex items-center justify-center">
        <div class="w-3/5">
        <table class="table">
        <thead>
            <tr>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(day, index) in adjusted_availability" :key="index">
            <td>
                <div class="relative mb-6">
                <p class="input input-bordered w-full max-w-xs flex items-center">{{day.adjusteddate}}</p>
                </div>
            </td>
            <td>
                <div class="relative mb-6">
                <p class="input input-bordered w-full max-w-xs flex items-center">{{day.starttime}}</p>
                </div>
            </td>
            <td>
                <div class="relative mb-6">
                <p class="input input-bordered w-full max-w-xs flex items-center">{{day.endtime}}</p>
                </div>
            </td>
            <td>
                <div class="relative mb-6">
                <button class="btn btn-error" @click="removeDate(day.AdjustedDate, index)">Delete</button>
                </div>
            </td>
            </tr>
        </tbody>
        </table>
    </div>
  </div>

  <dialog id="addAdjusted" class="modal modal-bottom sm:modal-middle">
        <form method="dialog" class="modal-box">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          <div class="form-control w-full max-w-xs">
            <label class="label">
            <span class="label-text">Date to Block:</span>
            </label>
            <input type="date" class="input input-bordered w-full max-w-xs m-2" v-model="date">
            </div>
          <div class="form-control w-full max-w-xs">
            <label class="label">
            <span class="label-text">Start Time:</span>
            </label>
            <input type="time" class="input input-bordered w-full max-w-xs m-2" v-model="starttime">
            </div>
          <div class="form-control w-full max-w-xs">
            <label class="label">
            <span class="label-text">End Time:</span>
            </label>
            <input type="time" class="input input-bordered w-full max-w-xs m-2" v-model="endtime">
            </div>
            <a class="btn btn-primary m-2" @click="addDate()">Add</a>
        </form>
        </dialog>

    </div>
</template>

<script setup>

const config = useRuntimeConfig();

definePageMeta({
    middleware: "auth",
    layout: "employee-layout"
});

const adjusted_availability = ref([]);
const successMessage = ref(false);
const errorMessage = ref(false);
const serverMessage = ref('');
const csrf_token = ref(null);
const date = ref(new Date().toISOString().slice(0,10))
const starttime = ref(null)
const endtime = ref(null)

onBeforeMount(async () => {
  csrf_token.value = await getCSRFToken();
  await getAdjustedDays();
})

const isEmpty = computed(() => adjusted_availability.value.length === 0);

const getAdjustedDays = async () => {

try {

  const response = await fetch(`${config.public.API_BASE_URL}/employee/adjust-day`, 
      {
      method: "GET",
      headers: {
              'Content-Type': 'application/json',

      },
      credentials: "include"
      });

      const data = await response.json();

      if (response.status === 200) {
        console.log(data.adjusted_availability);
        adjusted_availability.value = data.adjusted_availability;
      }
      else if (response.status === 409) {

      }
  
} catch (error) {
  console.log(error);
}


};


const removeDate = async (dateToRemove, index) => {

    try {

        const response = await fetch(`${config.public.API_BASE_URL}/employee/adjust-day`, 
        {
        method: "DELETE",
        headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrf_token.value

        },
        credentials: "include",
        body: JSON.stringify({date: dateToRemove})
        });

        const data = await response.json();

        if (response.status === 200) {
            successMessage.value = true;
            errorMessage.value = false;
            serverMessage.value = data.message;
            adjusted_availability.value.splice(index, 1);
        }
        else if (response.status === 409) {
          successMessage.value = false;
            errorMessage.value = true;
            serverMessage.value = data.message;
        }
        
    } catch (error) {
        console.log(error);
    }

};

const addDate = async () => {

try {

    const response = await fetch(`${config.public.API_BASE_URL}/employee/adjust-day`, 
    {
    method: "POST",
    headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrf_token.value

    },
    credentials: "include",
    body: JSON.stringify({
        date: date.value,
        starttime: starttime.value,
        endtime: endtime.value
    })
    });

    const data = await response.json();

    if (response.status === 200) {
        successMessage.value = true;
        errorMessage.value = false;
        serverMessage.value = data.message;
        await getAdjustedDays();
    }
    else if (response.status === 409) {
      successMessage.value = false;
        errorMessage.value = true;
        serverMessage.value = data.message;
    }
    
} catch (error) {
    console.log(error);
}

};

</script>

<style lang="scss" scoped>

</style>