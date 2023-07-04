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
            <th>Options</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(day, index) in adjusted_availability" :key="index">
            <td>
                <div class="relative mb-6">
                <p class="input input-bordered w-full max-w-xs flex items-center">{{new Date(day.adjusteddate).toLocaleDateString()}}</p>
                </div>
            </td>
            <td>
                <div class="relative mb-6">
                <p class="input input-bordered w-full max-w-xs flex items-center">{{day.starttime.slice(0,5)}}</p>
                </div>
            </td>
            <td>
                <div class="relative mb-6">
                <p class="input input-bordered w-full max-w-xs flex items-center">{{day.endtime.slice(0,5)}}</p>
                </div>
            </td>
            <td>
                <div class="relative mb-6">

                    <button class="btn btn-warning mx-2 btn-square" @click="openEditDayModal(day)"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                    </button>
                    <button class="btn btn-error mx-2 btn-square" @click="removeDate(day.adjusteddate, index)"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
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

        <dialog id="editDayModal" class="modal modal-bottom sm:modal-middle">
    <form method="dialog" class="modal-box">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <div class="form-control w-full max-w-xs">
        <label class="label">
        <span class="label-text">Date:</span>
        </label>
        <input class="input input-bordered w-full max-w-xs m-2" type="date" v-model= "date">
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
        <a class="btn btn-primary m-2" @click="editDate()">Confirm Changes</a>
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
const id = ref(null);
const date = ref(new Date().toISOString().slice(0,10))
const starttime = ref(null)
const endtime = ref(null)

onBeforeMount(async () => {
  csrf_token.value = await getCSRFToken();
  await getAdjustedDays();
})

const isEmpty = computed(() => adjusted_availability.value.length === 0);

const openEditDayModal = (day) => {
    id.value = day.id;
    date.value = day.adjusteddate;
    starttime.value = day.starttime;
    endtime.value = day.endtime;
    editDayModal.showModal();

};

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

const editDate = async () => {

try {

    const response = await fetch(`${config.public.API_BASE_URL}/employee/adjust-day`, 
    {
    method: "PUT",
    headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrf_token.value

    },
    credentials: "include",
    body: JSON.stringify({
        id: id.value,
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
        date.value = null;
        starttime.value = null;
        endtime.value = null;
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
        date.value = null;
        starttime.value = null;
        endtime.value = null;
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