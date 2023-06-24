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

        <div class="flex items-center justify-center mt-32">
            <div class="w-1/2 border">
                <form @submit.prevent>
                    <div class="flex items-center justify-center">
                        <input class="input input-bordered w-full max-w-xs m-2" type="password" v-model="password" placeholder="password"/>
                    </div>
                    <div class="flex items-center justify-center">
                        <input  class="input input-bordered w-full max-w-xs m-2" type="password" v-model="newPassword" placeholder="new password"/>
                    </div>
                    <div class="flex items-center justify-center">
                        <input  class="input input-bordered w-full max-w-xs m-2" type="password" v-model="reEnteredNewPassword" placeholder="confirm new password"/>  
                    </div>
                    <div class="flex items-center justify-center">
                        <button class="btn btn-primary  m-2" @click="changePassword">Submit Password</button>
                    </div>
                    
                </form>
                
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

const password = ref('');
const newPassword = ref('');
const reEnteredNewPassword = ref('');
const successMessage = ref(false);
const errorMessage = ref(false);
const serverMessage = ref('');


const changePassword = async () => {

    if (password.value == '' || newPassword.value == '' || reEnteredNewPassword.value =='') {
        successMessage.value = false;
        errorMessage.value = true;
        serverMessage.value ="All input boxes must be filled out";
        return;
    }

    if (newPassword.value !== reEnteredNewPassword.value) {
        successMessage.value = false;
        errorMessage.value = true;
        serverMessage.value = "New passwords do not match";
        return;
    }

    try {
        
        
        const response = await fetch(`${config.public.API_BASE_URL}/admin/change-password`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
        body: JSON.stringify({
            password: password.value,
            newPassword: newPassword.value,
            reEnteredNewPassword: reEnteredNewPassword.value
        })
    });
    
    const data = await response.json();
    
    if (response.status === 200) {
        successMessage.value = true;
        errorMessage.value = false;
        serverMessage.value = data.message;
    }
    else {
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

</script>

<style lang="scss" scoped>

</style>