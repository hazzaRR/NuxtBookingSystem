<template>
<div>
    <div class="flex items-center justify-start flex-col">
      <h2 class="input input-bordered w-full max-w-xs m-2 flex items-center">Date: {{ new Date(props.selectedDate).toLocaleDateString() }}</h2>
      <h2 class="input input-bordered w-full max-w-xs m-2 flex items-center">EmployeeID: {{ props.employeeName }}</h2>
      <h2 class="input input-bordered w-full max-w-xs m-2 flex items-center">Service: {{ props.serviceName }}</h2>
      <h2 class="input input-bordered w-full max-w-xs m-2 flex items-center">Duration: {{ props.duration }} minutes</h2>
      <h2 class="input input-bordered w-full max-w-xs m-2 flex items-center">Time: {{ props.selectedSlot.slice(0, 5) }}</h2>
      <button class="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg btn-primary my-4" :disabled="!props.selectedSlot" @click="BookSlot">Book</button>
    </div>

</div>
</template>

<script setup>

const emits = defineEmits(['update:bookingstatus', 'update:serverMessage']);
const props = defineProps(['selectedDate', 'selectedEmployeeID', 'selectedServiceID', 'duration', 'selectedSlot', 'serviceName', 'employeeName'])
const config = useRuntimeConfig();

const csrf_token = ref(null);

onBeforeMount(async () => {
    csrf_token.value = await getCSRFToken();
})


const BookSlot = async () => {

    console.log("hey");

    const response = await fetch(`${config.public.API_BASE_URL}/client/book-slot`, 
    {
        method: "POST",
        headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrf_token.value
        },
        credentials: "include",
        body: JSON.stringify({
            date: props.selectedDate,
            employeeID: props.selectedEmployeeID,
            serviceID: props.selectedServiceID,
            slot: props.selectedSlot,
            duration: props.duration
        })
    });

    const data = await response.json();

        if (response.status === 200) {
            emits('update:bookingstatus', 'Booking Confirmation');
            emits('update:serverMessage', `Your booking has been successfully confirmed for the ${data.booking.starttime.slice(0,5)} on the ${new Date(data.booking.appdate).toLocaleDateString()}`);
        }
};

</script>

<style lang="scss" scoped>

</style>