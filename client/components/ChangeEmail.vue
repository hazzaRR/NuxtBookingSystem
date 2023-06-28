<template>
    <div>

        <form class="grid place-items-center ">
        <div class="relative mb-6">
            <input type="email" placeholder="email" class="input input-bordered w-full max-w-xs" v-model="email" required/>
        </div>
        <div class="relative mb-6">
        <input type="password" placeholder="password" class="input input-bordered w-full max-w-xs" v-model="password"  required/>
        </div>
        <div class="relative mb-6">
        <button class="btn" @click="UpdateEmail">Update Email</button>
        </div>   
        </form>

    </div>
</template>

<script setup>

const config = useRuntimeConfig();

const props = defineProps(['currentEmail', 'route', 'csrfToken']);
const emits = defineEmits(['update:successMessage', 'update:errorMessage', 'update:serverMessage']);

const email = ref();
const password = ref('');

onBeforeMount(() => {
    email.value = props.currentEmail;
});



const UpdateEmail = async (event) => {

    event.preventDefault();

    if (props.currentEmail === email.value) {
        console.log("Email the same as old email");
        return;
    }

    const response = await fetch(`${config.public.API_BASE_URL}/${props.route}/update-email`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': props.csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({
            email: email.value,
            password: password.value
        })
    });

    const data = await response.json();

    if ( response.status === 200) {
        console.log(data.message)
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