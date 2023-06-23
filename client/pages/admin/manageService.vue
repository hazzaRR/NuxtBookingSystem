<template>
   <div>

<h1>Manage Services</h1>

<div v-if="successMessage" class="alert alert-success max-w-sm my-2">
<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
<span>{{serverMessage}}</span>
</div>
<div v-if="errorMessage" class="alert alert-error max-w-sm my-2">
<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
<span>{{serverMessage}}</span>
</div>

<dialog id="editServiceModal" class="modal modal-bottom sm:modal-middle">
  <form method="dialog" class="modal-box">
    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    <div class="form-control w-full max-w-xs">
    <label class="label">
    <span class="label-text">Service Name</span>
    </label>
    <input class="input input-bordered w-full max-w-xs m-2" type="text" v-model= "editServiceName">
    </div>
    <div class="form-control w-full max-w-xs">
    <label class="label">
    <span class="label-text">Price</span>
    </label>
    <input type="number" class="input input-bordered w-full max-w-xs m-2" v-model="editprice">
    </div>
    <a class="btn btn-primary m-2" @click="editService()">Confirm Changes</a>
</form>
</dialog>

<div class="flex items-center justify-center">
<form class="container w-1/2" @submit.prevent>
        <input type="text" placeholder="Service Name" class="input input-bordered w-full max-w-xs m-2" v-model= "serviceName" required/>
        <input type="number" placeholder="0.00" class="input input-bordered w-full max-w-xs m-2" v-model="price" required/>
        <button class="btn btn-primary" @click="createService">Create</button>      
    </form>
</div>

<div class="flex items-center justify-center">
    <div class="w-1/2">
    <table class="table">
        <thead>
            <tr>
            <th>Service Name</th>
            <th>editPrice</th>
            <th>Actions</th>
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
            <button class="btn btn-warning mx-2 btn-square" @click="openEditServiceModal(service)"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
            </button>
            <button class="btn btn-error mx-2 btn-square" @click="deleteService(service.id, index)"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            </button>
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
    layout: "admin-layout"
});

const services = ref([]);
const successMessage = ref(false);
const errorMessage = ref(false);
const serverMessage = ref('');
const csrf_token = ref(null);

const serviceID = ref(null);
const editServiceName = ref(null);
const editprice = ref(null);
const serviceName = ref(null);
const price = ref(null);

const getServices = async () => {

    const response = await fetch(`${config.public.API_BASE_URL}/services`, {
    credentials: "include",
    });

    const data = await response.json();

    if (response.status === 200) {
        services.value = data.services;
    }

};

onMounted(async () => {
    await getServices();
    csrf_token.value = await getCSRFToken();
});

const openEditServiceModal = (service) => {
    serviceID.value = service.id;
    editServiceName.value = service.servicename;
    editprice.value = service.price;
    editServiceModal.showModal();

};

const deleteService = async (serviceID, index) => {

    try {
        
        const response = await fetch(`${config.public.API_BASE_URL}/admin/delete-service`, 
        {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({id: serviceID})
        });

        const data = await response.json();
        
        if (response.status === 200) {
            services.value.splice(index, 1);
            successMessage.value = true;
            errorMessage.value = false;
            serverMessage.value = data.message;
        }
        else if (response.status === 500) {
            successMessage.value = false;
            errorMessage.value = true;
            serverMessage.value = data.message;
        }
        
    } catch (error) {
        successMessage.value = false;
        errorMessage.value = true;
        serverMessage.value = "Error communicating with the server";
        
    }
        
};

const editService = async () => {

    try {
        
        const response = await fetch(`${config.public.API_BASE_URL}/admin/update-service`, 
        {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify(
                {
                    id: serviceID.value,
                    servicename: editServiceName.value,
                    price: editprice.value
                })
        });

        const data = await response.json();
        
        if (response.status === 200) {
         editServiceName.value = '';
            editprice.value = '';
            editServiceModal.close();
            await getServices();


            successMessage.value = true;
            errorMessage.value = false;
            serverMessage.value = data.message;

        }
        else if (response.status === 500) {
            successMessage.value = false;
            errorMessage.value = true;
            serverMessage.value = data.message;
        }
        
    } catch (error) {
        console.log(error)
        successMessage.value = false;
        errorMessage.value = true;
        serverMessage.value = "Error communicating with the server";
        
    }


};

const createService = async () => {

    try {
        
        const response = await fetch(`${config.public.API_BASE_URL}/admin/add-service`, 
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrf_token.value
            },
            credentials: "include",
            body: JSON.stringify(
                {
                    servicename: serviceName.value,
                    price: price.value
                })
        });

        const data = await response.json();
        
        if (response.status === 200) {
            serviceName.value = '';
            price.value = '';
            await getServices();


            successMessage.value = true;
            errorMessage.value = false;
            serverMessage.value = data.message;

        }
        else if (response.status === 500) {
            successMessage.value = false;
            errorMessage.value = true;
            serverMessage.value = data.message;
        }
        
    } catch (error) {
        console.log(error)
        successMessage.value = false;
        errorMessage.value = true;
        serverMessage.value = "Error communicating with the server";    
    }
};

</script>

<style lang="scss" scoped>

</style>