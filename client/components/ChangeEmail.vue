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

const props = defineProps(['currentEmail']);

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


    const response = await fetch(`${config.public.API_BASE_URL}/employee/update-email`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
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
    }
    else {
        console.log("error");
    }
};


</script>

<style lang="scss" scoped>

</style>