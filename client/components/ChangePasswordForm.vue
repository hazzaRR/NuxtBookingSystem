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
import { dA } from "@fullcalendar/core/internal-common";


const password = ref('');
const newPassword = ref('');
const reEnteredNewPassword = ref('');


const UpdatePassword = async (event) => {

    event.preventDefault();

    const response = await fetch('http://localhost:5000/employee/change-password', {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            password,
            newPassword,
            reEnteredNewPassword
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