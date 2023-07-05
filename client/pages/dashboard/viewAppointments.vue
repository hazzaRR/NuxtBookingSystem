<template>
    <div>

        <h1>View your upcoming appointments</h1>

        <div v-if="successMessage" class="alert alert-success max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{serverMessage}}</span>
        </div>
        <div v-if="errorMessage" class="alert alert-error max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{serverMessage}}</span>
        </div>

        <div class="join">
            <input class="join-item btn" type="radio" name="options" aria-label="Upcoming" />
            <input class="join-item btn" type="radio" name="options" aria-label="Previous" />
        </div>

        <div class="overflow-x-auto p-10">
            <table class="table">
                <thead>
                    <tr>
                    <th>Employee</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Cost</th>
                    <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(appointment, index) in appointments" :key="index" class="hover">
                    <td>
                    {{appointment.firstname + " " + appointment.surname}}
                    </td>
                    <td>
                    {{appointment.servicename}}
                    </td>
                    <td>
                    {{new Date(appointment.appdate).toLocaleDateString()}}
                    </td>
                    <td>
                    {{appointment.starttime.slice(0,5)}}
                    </td>
                    <td>
                    {{appointment.endtime.slice(0,5)}}
                    </td>
                    <td>
                    {{`£${appointment.price}`}}
                    </td>
                    <td>
                    <button class="btn btn-warning" @click="cancelBooking(appointment.id, index)">Cancel</button>
                    </td>
                    </tr>
                </tbody>
            </table>



        </div>
    </div>
</template>

<script setup>

const config = useRuntimeConfig();

definePageMeta({
    middleware: "auth",
    layout: "client-layout"
});

const appointments = ref([]);
const successMessage = ref(false);
const errorMessage = ref(false);
const serverMessage = ref('');

const getAppointments = async () => {
    const response = await fetch(`${config.public.API_BASE_URL}/client/appointments`, {
    credentials: "include",
    });

    const data = await response.json();
    console.log(data);

    if (response.status === 200) {
        appointments.value = data.appointments;
    }

};

onMounted(() => {
    getAppointments();
});


const cancelBooking = async (appointmentId, index) => {

    try {

        const response = await fetch(`${config.public.API_BASE_URL}/client/appointment?id=${appointmentId}`, {
        method: "DELETE",
        headers: {
                'Content-Type': 'application/json'
        },
        credentials: "include",
        });

        const data = await response.json();
        console.log(data);

        if (response.status === 200) {
            successMessage.value = true;
            errorMessage.value = false;
            serverMessage.value = data.message;

            getAppointments();
        }
        
    } catch (error) {
        console.log(error);
    }

    console.log(appointmentId);
};

</script>

<style lang="scss" scoped>

</style>