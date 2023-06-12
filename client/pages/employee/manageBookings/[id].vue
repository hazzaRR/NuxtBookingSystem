<template>
    <div>

       <div v-if="loading" class="">
        <span class="loading loading-spinner loading-lg"></span>
       </div>

       <div v-else>

           <form class="grid place-items-center">
               <div class="relative mb-6">
                   <p class="input input-bordered w-full max-w-xs">{{ appointmentDetails.firstname + " " + appointmentDetails.surname }}</p>
                </div>
                <!-- <div class="relative mb-6">
                    <p class="input input-bordered w-full max-w-xs">{{ appointmentDetails.email }}</p>
                </div> -->
                <div class="relative mb-6">
                    <p class="input input-bordered w-full max-w-xs">{{ appointmentDetails.telephone }}</p>
                </div>
                <div class="relative mb-6">
                    <label for="fruit">Service:</label>
                    <select id="service" v-model="selectedService">
                    <option  v-for="(service, index) in services" :value="service.id" :key="index">{{ service.servicename }}</option>
                    </select>
                </div>
                
                <div class="relative mb-6">
                    <input type="date" class="input input-bordered w-full max-w-xs" v-model="appDate"/>
                </div>
                <div class="relative mb-6">
                    <input type="time" class="input input-bordered w-full max-w-xs" v-model="startTime"/>
                    <span>-</span>
                    <input type="time" class="input input-bordered w-full max-w-xs" v-model="endTime"/>
                </div>
                <div class="relative mb-6">
                    <button class="btn" @click="updateBooking">Update</button>
                    <button class="btn" @click="deleteBooking">Delete</button>
                </div>   
            </form>
        </div>
            
        </div>
    </template>

<script setup>

const route = useRoute()

definePageMeta({
    middleware: "auth",
    layout: "employee-layout"
});

const loading = ref(true);
const appointmentDetails = ref(null);
const appDate = ref(null);
const startTime = ref(null);
const endTime = ref(null);
const selectedService = ref(null);
const services = ref(null);

const getAppointment = async () => {

    const response = await fetch(`http://localhost:5000/employee/appointment?id=${route.params.id}`, {
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: "include",
    });

    const data = await response.json();

    if (response.status === 200) {

        console.log(data.appointment);

        appointmentDetails.value = data.appointment;
        appDate.value = data.appointment.appdate;
        startTime.value = data.appointment.starttime;
        endTime.value = data.appointment.endtime;
        selectedService.value = data.appointment.serviceid;

        loading.value = false;

    }

};

const getServices = async () => {

const response = await fetch(`http://localhost:5000/services`, {
headers: {
        'Content-Type': 'application/json'
    },
credentials: "include",
});

const data = await response.json();

if (response.status === 200) {

    services.value = data.services;
}

};

onBeforeMount(() => {
    getServices();
    getAppointment();
});


const updateBooking = async (event) => {

    event.preventDefault();

    console.log(selectedService.value)

    const response = await fetch(`http://localhost:5000/employee/appointment?id=${route.params.id}`, {
    method: "PUT",
    headers: {
            'Content-Type': 'application/json'
        },
    credentials: "include",
    body: JSON.stringify({
        appDate: appDate.value,
        startTime: startTime.value,
        endTime: endTime.value,
        serviceid: selectedService.value
    })
    });

    const data = await response.json();

    if (response.status === 200) {

        console.log(data.message);
    };

};




</script>

<style lang="scss" scoped>

</style>