<template>
    <div>

        <div v-if="successMessage" class="alert alert-success max-w-sm m-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{serverMessage}}</span>
        </div>
        <div v-if="errorMessage" class="alert alert-error max-w-sm m-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{serverMessage}}</span>
        </div>


        <ul class="menu bg-base-200 w-56 rounded-box">
            <li class="menu-title">Account Settings</li>
            <li><a @click="showForm" id="updateEmail">Update Email</a></li>
            <li><a @click="showForm" id="updatePassword">Update Password</a></li>
            <li><a @click="showForm" id="updatePersonalDetails">Update Personal Details</a></li>
        </ul>


        <div v-if="setting === 'updateEmail'">
            <ChangeEmail :currentEmail="email" route="employee" :csrfToken="csrf_token"/>
        </div>
        <div v-else-if="setting === 'updatePassword'">
            <ChangePassword  route="employee" :csrfToken="csrf_token"  @update:successMessage="successMessage = $event" @update:errorMessage="errorMessage = $event" @update:serverMessage="serverMessage = $event"/>
        </div>
        <div v-else-if="setting === 'updatePersonalDetails'">
            <UpdatePersonalDetails :currentFirstname="firstname" :currentSurname="surname" :currentTelephone="telephone" route="employee" :csrfToken="csrf_token"/>
        </div>

    </div>
</template>

<script setup>

const config = useRuntimeConfig();

definePageMeta({
    middleware: "auth",
    layout: "employee-layout"
});


let setting = ref('updatePassword');

const email = ref('');
const firstname = ref('');
const surname = ref('');
const telephone = ref('');
const csrf_token = ref(null);
const successMessage = ref(false);
const errorMessage = ref(false);
const serverMessage = ref('');


const getAccountDetails = async () => {
    const response = await fetch(`${config.public.API_BASE_URL}/employee/account-details`, {
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

onMounted(async () => {
    await getAccountDetails();
    csrf_token.value = await getCSRFToken();
});


const showForm = (event) => {

    const targetId = event.currentTarget.id;
    console.log(targetId);

    setting.value = targetId;
}

</script>

<style lang="scss" scoped>

</style>