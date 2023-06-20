<template>
   <div>

<h1>Manage Services</h1>

<div v-if="successMessage" class="alert alert-success max-w-sm">
<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
<span>{{serverMessage}}</span>
</div>
<div v-if="errorMessage" class="alert alert-error max-w-sm">
<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
<span>{{serverMessage}}</span>
</div>

<div class="overflow-x-auto p-10">
    <table class="table">
        <thead>
            <tr>
            <th>Service Name</th>
            <th>Price</th>
            <th></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(service, index) in services" :key="index" class="hover">
            <td>
            {{service.servicename}}
            </td>
            <td>
            {{`£${service.price}`}}
            </td>
            <td>
            <button class="btn btn-warning mx-2" @click="editService(service.id, index)">Edit</button>
            <button class="btn btn-error mx-2" @click="deleteService(service.id, index)">Delete</button>
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
    layout: "admin-layout"
});

const services = ref([]);
const successMessage = ref(false);
const errorMessage = ref(false);
const serverMessage = ref('');

onMounted(async () => {

    const response = await fetch(`${config.public.API_BASE_URL}/services`, {
    credentials: "include",
    });

    const data = await response.json();
    console.log(data);

    if (response.status === 200) {
        services.value = data.services;
    }
});

const editService = (serviceID, index) => {


};

const deleteService = (serviceID, index) => {


};

</script>

<style lang="scss" scoped>

</style>