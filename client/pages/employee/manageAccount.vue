<template>
    <div>


        <ul class="menu bg-base-200 w-56 rounded-box">
            <li class="menu-title">Account Settings</li>
            <li><a @click="showForm">Update Email</a></li>
            <li><a>Update Password</a></li>
            <li><a>Update Personal Details</a></li>
        </ul>

        <form class="grid place-items-center mt-32">
        <div class="relative mb-6">
            <input type="text" placeholder="email" class="input input-bordered w-full max-w-xs" v-model="email"  required/>
        </div>
        <div class="relative mb-6">
            <input type="text" placeholder="firstname" class="input input-bordered w-full max-w-xs" v-model="firstname"  required/>
        </div>
        <div class="relative mb-6">
            <input type="text" placeholder="surname" class="input input-bordered w-full max-w-xs" v-model="surname"  required/>
        </div>
        <div class="relative mb-6">
            <input type="text" placeholder="telephone" class="input input-bordered w-full max-w-xs" v-model="telephone"  required/>
        </div>
        <div class="relative mb-6">
        <button class="btn" @click="updateDetails">Update Details</button>
        </div>   
        </form>


        <form>


        </form>
    </div>
</template>

<script setup>

definePageMeta({
    middleware: "auth",
    layout: "employee-layout"
});


const account = ref(null)
const email = ref('');
const firstname = ref('');
const surname = ref('');
const telephone = ref('');


const getAccountDetails = async () => {
    const response = await fetch('http://localhost:5000/employee/account-details', {
    credentials: "include",
    });

    console.log(response);
    const data = await response.json();
    console.log(data.account);

    if (response.status === 200) {
        account.value = data.account;
        email.value = data.account.email;
        firstname.value = data.account.firstname;
        surname.value = data.account.surname;
        telephone.value = data.account.telephone;
    }

};

onBeforeMount(() => {
    getAccountDetails();
});


const updateDetails = async (event) => {
    event.preventDefault();

    const updatedAccountDetails = {
        email: email.value,
        firstname: firstname.value,
        surname: surname.value,
        telephone: telephone.value
    };

    const response = await fetch('http://localhost:5000/employee/update-account', {
        method: 'PUT',
        headers: {
                'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updatedAccountDetails)
    });

    const data = await response.json();

    if (response.status === 200) {
        console.log(data.message)
    }
};

const showForm = () => {

    console.log("link pressed");
}

</script>

<style lang="scss" scoped>

</style>