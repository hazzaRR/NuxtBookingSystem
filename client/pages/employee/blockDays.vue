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


        <div>{{ blockedDays }}</div>

    <div v-if="blockedDays === null || blockedDays === []">
        currently no uncoming blocked days from your availability
    </div>

    <div v-else class="flex items-center justify-center">
        <div class="w-3/5">
        <table class="table">
        <thead>
            <tr>
            <th>Day</th>
            <th>Available</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(day, index) in blockedDays" :key="index">
            <td>
                <div class="relative mb-6">
                <p class="input input-bordered w-full max-w-xs flex items-center">{{ day.blockedDate }}</p>
                </div>
            </td>
            <td>
                <div class="relative mb-6">
                <button class="btn btn-error" @click="removeDate(day.blockedDate)">Delete</button>
                </div>
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

const blockedDays = ref(null);
const successMessage = ref(false);
const errorMessage = ref(false);
const serverMessage = ref('');
const csrf_token = ref(null);

onBeforeMount(async () => {
  csrf_token.value = await getCSRFToken();
  await getBlockedDays();
})

const getBlockedDays = async () => {

try {

  const response = await fetch(`${config.public.API_BASE_URL}/employee/block-days`, 
      {
      method: "GET",
      headers: {
              'Content-Type': 'application/json'
      },
      credentials: "include"
      });

      const data = await response.json();

      if (response.status === 200) {
        console.log(data.blockedDays);
        blockedDays.value = data.blockedDays;
      }
      else if (response.status === 409) {

      }
  
} catch (error) {
  console.log(error);
}


};


const removeDate = async () => {

    try {

        const response = await fetch(`${config.public.API_BASE_URL}/employee/block-day`, 
        {
        method: "DELETE",
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
        
    } catch (error) {
        console.log(error);
    }

};

</script>

<style lang="scss" scoped>

</style>