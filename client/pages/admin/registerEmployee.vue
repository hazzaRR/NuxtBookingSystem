<template>
    <div>

        <div v-if="successMessage" class="alert alert-success max-w-sm my-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{serverMessage}}</span>
        </div>
        <div v-if="errorMessage" class="alert alert-error max-w-sm my-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{serverMessage}}</span>
        </div>



    <form class="container" @submit.prevent>
        <input type="text" placeholder="email" class="input input-bordered w-full max-w-xs" v-model="email" required/>
        <br>
        <input type="password" placeholder="password" class="input input-bordered w-full max-w-xs" v-model="password"  required/>
        <input type="text" placeholder="firstname" class="input input-bordered w-full max-w-xs" v-model="firstname" required/>
        <input type="text" placeholder="surname" class="input input-bordered w-full max-w-xs" v-model="surname" required/>
        <input type="text" placeholder="telephone" class="input input-bordered w-full max-w-xs" v-model="telephone" required />
        <button class="btn btn-primary" @click="register">Button</button>      
    </form>


    </div>
</template>

<script setup>
import { checkPassword } from '~/composables/checkPassword';

const config = useRuntimeConfig();

definePageMeta({
    middleware: "auth",
    layout: "admin-layout"
});

const csrf_token = ref(null);
const successMessage = ref(false);
const errorMessage = ref(false);
const serverMessage = ref('');
const email = ref('');
const firstname = ref('');
const surname = ref('');
const password = ref('');
const telephone = ref('');

onMounted(async () => {
    csrf_token.value = await getCSRFToken();
});

const register = async () => {


    if (!checkPassword(password.value)) {
        console.log("passwords doesn't meet requirements");
        return;
    }

    try {

        
        const response = await fetch(`${config.public.API_BASE_URL}/admin/register-employee`, 
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrf_token.value
            },
            credentials: "include",
            body: JSON.stringify({
                email: email.value,
                firstname: firstname.value,
                surname: surname.value,
                password: password.value,
                telephone: telephone.value
            })
        });

        const data = await response.json();
        
        if (response.status == 200) {
            email.value = '';
            firstname.value = '';
            surname.value = '';
            password.value = '';
            telephone.value = '';
            
            successMessage.value = true;
            errorMessage.value = false;
            serverMessage.value = data.message;
            
            
        }
        
        if (response.status == 409) {
            console.log("hello")
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



}

</script>

<style lang="scss" scoped>

</style>