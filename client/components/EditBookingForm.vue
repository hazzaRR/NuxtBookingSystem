<template>
    <div>

       <div v-if="loading">
        <span class="loading loading-spinner loading-lg"></span>
       </div>

       <div v-else>

           <form class="grid place-items-center" @submit.prevent>
                <div class="form-control w-full max-w-xs">
                <label class="label">
                <span class="label-text">Customer Name</span>
                </label>
                <p class="input input-bordered w-full max-w-xs flex items-center input-disabled input-sm lg:input-lg"> {{ appointmentDetails.firstname + " " + appointmentDetails.surname }}</p>
                </div>
                <!-- <div class="relative mb-6">
                    <p class="input input-bordered w-full max-w-xs">{{ appointmentDetails.email }}</p>
                </div> -->
                <div class="form-control w-full max-w-xs">
                <label class="label">
                <span class="label-text">Phone Number</span>
                </label>
                <p class="input input-bordered w-full max-w-xs flex items-center input-disabled input-sm lg:input-lg"> {{ appointmentDetails.telephone }}</p>
                </div>
                <div class="form-control w-full max-w-xs">
                <label class="label">
                <span class="label-text">Service</span>
                </label>
                    <select class="input input-bordered w-full max-w-xs select-sm lg:select-lg" id="service" v-model="selectedService">
                    <option  v-for="(service, index) in services" :value="service.id" :key="index">{{ service.servicename }}</option>
                    </select>
                </div>
                
                <div class="form-control w-full max-w-xs">
                <label class="label">
                <span class="label-text">Date</span>
                </label>
                    <input type="date" class="input input-bordered w-full max-w-xs input-sm lg:input-lg" v-model="appDate"/>
                </div>
                <div class="form-control w-full max-w-xs">
                <label class="label">
                <span class="label-text">Time Slot</span>
                </label>
                <div class="flex space-x-2">
                    <input type="time" class="input input-bordered w-1/2 max-w-xs input-sm lg:input-lg" v-model="startTime"/>
                    <span class="flex items-center">-</span>
                    <input type="time" class="input input-bordered w-1/2 max-w-xs input-sm lg:input-lg" v-model="endTime"/>
                </div>
                </div>
                <div class="relative mb-6">
                    <button class="btn btn-warning m-2" @click="updateBooking">Update</button>
                    <button class="btn btn-error m-2" @click="deleteBooking">Delete</button>
                </div>   
            </form>
        </div>
            
        </div>
    </template>

<script setup>
const config = useRuntimeConfig();

const props = defineProps(['id', 'csrfToken']);

const loading = ref(true);
const appointmentDetails = ref(null);
const appDate = ref(null);
const startTime = ref(null);
const endTime = ref(null);
const selectedService = ref(null);
const services = ref(null);

const getAppointment = async () => {

    const response = await fetch(`${config.public.API_BASE_URL}/employee/appointment?id=${props.id}`, {
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

    const response = await fetch(`${config.public.API_BASE_URL}/services`, {
    headers: {
            'Content-Type': 'application/json',
        },
    credentials: "include",
    });

    const data = await response.json();

    if (response.status === 200) {

        services.value = data.services;
    }

};

onBeforeMount(() => {
    getAppointment();
    getServices();
});


const updateBooking = async () => {

    try {
        
        
        const response = await fetch(`${config.public.API_BASE_URL}/employee/appointment?id=${props.id}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': props.csrfToken
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
            window.location.reload(true);
        };

    } catch (error) {
        console.log(error);
    }
        
};

const deleteBooking = async () => {

    try {

        const response = await fetch(`${config.public.API_BASE_URL}/employee/appointment?id=${props.id}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': props.csrfToken
            },
            credentials: "include",
        });
        
        const data = await response.json();

        if (response.status === 200) {
            console.log(data.message);
            window.location.reload(true);
        };
        
    } catch (error) {
        
    }



};
    
</script>

<style lang="scss" scoped>

</style>