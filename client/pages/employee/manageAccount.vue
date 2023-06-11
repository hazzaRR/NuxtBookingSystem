<template>
    <div>


        <ul class="menu bg-base-200 w-56 rounded-box">
            <li class="menu-title">Account Settings</li>
            <li><a @click="showForm" id="updateEmail">Update Email</a></li>
            <li><a @click="showForm" id="updatePassword">Update Password</a></li>
            <li><a @click="showForm" id="updatePersonalDetails">Update Personal Details</a></li>
        </ul>


        <div v-if="setting === 'updateEmail'">
            <ChangeEmail :currentEmail="email"/>
        </div>
        <div v-else-if="setting === 'updatePassword'">
            <ChangePassword />
        </div>
        <div v-else-if="setting === 'updatePersonalDetails'">
            <UpdatePersonalDetails :currentFirstname="firstname" :currentSurname="surname" :currentTelephone="telephone"/>
        </div>

    </div>
</template>

<script setup>

definePageMeta({
    middleware: "auth",
    layout: "employee-layout"
});


let setting = ref('updatePassword');

const email = ref('');
const firstname = ref('');
const surname = ref('');
const telephone = ref('');


const getAccountDetails = async () => {
    const response = await fetch('http://localhost:5000/employee/account-details', {
    credentials: "include",
    });

    const data = await response.json();
    console.log(data.account);

    if (response.status === 200) {
        email.value = data.account.email;
        firstname.value = data.account.firstname;
        surname.value = data.account.surname;
        telephone.value = data.account.telephone;
    }

};

onMounted(() => {
    getAccountDetails();
});


const showForm = (event) => {

    const targetId = event.currentTarget.id;
    console.log(targetId);

    setting.value = targetId;
}

</script>

<style lang="scss" scoped>

</style>