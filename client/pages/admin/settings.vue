<template>
    <div>
        <p v-if="error">{{ message.value }}</p>
        <!-- <p v-if="success">{{  }}</p> -->

        <form>

            <input type="password" v-model="password" placeholder="password"/>
            <input type="password" v-model="newPassword" placeholder="new password"/>
            <input type="password" v-model="reEnteredNewPassword" placeholder="confirm new password"/>

            <button @click="changePassword">Submit Password</button>

        </form>
        



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
const error = ref(false);
const message = ref('');


const changePassword = async (event) => {
    event.preventDefault();

    console.log(password.value)

    if (password.value == '' || newPassword.value == '' || reEnteredNewPassword.value =='') {
        error.value = true;
        message.value = "not boxes can be left empty"
        return;
    }

    if (newPassword.value !== reEnteredNewPassword.value) {
        error.value = true;
        message.value = "New passwords do not match"
        return;
    }

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

    console.log(data)

    };

</script>

<style lang="scss" scoped>

</style>