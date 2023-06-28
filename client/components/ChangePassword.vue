<template>
    <div>

        <form class="grid place-items-center ">
        <div class="relative mb-6">
            <input type="password" placeholder="current password" class="input input-bordered w-full max-w-xs" v-model="password"  required/>
        </div>
        <div class="relative mb-6">
        <input type="password" placeholder="new password" class="input input-bordered w-full max-w-xs" v-model="newPassword"  required/>
        </div>
        <div class="relative mb-6">
        <input type="password" placeholder="re-enter new Password" class="input input-bordered w-full max-w-xs" v-model="reEnteredNewPassword"  required/>
        </div>
        <div class="relative mb-6">
        <button class="btn" @click="UpdatePassword">Update Password</button>
        </div>   
        </form>

    </div>
</template>

<script setup>
const config = useRuntimeConfig();

const props = defineProps(['route', 'csrfToken']);
const emits = defineEmits(['update:successMessage', 'update:errorMessage', 'update:serverMessage']);


const password = ref('');
const newPassword = ref('');
const reEnteredNewPassword = ref('');


const UpdatePassword = async (event) => {

    event.preventDefault();

    if (newPassword.value !== reEnteredNewPassword.value) {
        console.log("passwords must match")
        return;
    }

    const response = await fetch(`${config.public.API_BASE_URL}/${props.route}/update-password`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': props.csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({
            password: password.value,
            newPassword: newPassword.value,
            reEnteredNewPassword: reEnteredNewPassword.value
        })
    });

    const data = await response.json();

    if ( response.status === 200) {
        console.log(data.message);
        password.value = '';
        newPassword.value = '';
        reEnteredNewPassword.value = '';
        emits('update:successMessage', true);
        emits('update:errorMessage', false);
        emits('update:serverMessage', data.message);
    }
    else {
        console.log(data.message);
        emits('update:successMessage', false);
        emits('update:errorMessage', true);
        emits('update:serverMessage', data.message);
    }
};


</script>

<style lang="scss" scoped>

</style>