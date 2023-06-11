<template>
    <div>

        <form class="grid place-items-center">
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


    </div>
</template>

<script setup>

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

</script>

<style lang="scss" scoped>

</style>