<template>
    <div>

    <h1 v-if="registerSucessful">Employee Created Successfully</h1>
    <h1 v-if="registerError">{{errorMessage}}</h1>



    <form class="container">
        <input type="text" placeholder="email" class="input input-bordered w-full max-w-xs" v-model="email" required/>
        <br>
        <input type="password" placeholder="password" class="input input-bordered w-full max-w-xs" v-model="password"  required/>
        <input type="text" placeholder="firstname" class="input input-bordered w-full max-w-xs" v-model="firstname" required/>
        <input type="text" placeholder="surname" class="input input-bordered w-full max-w-xs" v-model="surname" required/>
        <input type="text" placeholder="telephone" class="input input-bordered w-full max-w-xs" v-model="telephone" required />
        <button class="btn" @click="register">Button</button>      
    </form>


    </div>
</template>

<script setup>
const config = useRuntimeConfig();

definePageMeta({
    middleware: "auth",
    layout: "admin-layout"
});

const csrf_token = ref(null);
const registerSucessful = ref(false);
const registerError = ref(false);
const errorMessage = ref('');
const email = ref('');
const firstname = ref('');
const surname = ref('');
const password = ref('');
const telephone = ref('');

onMounted(async () => {
    csrf_token.value = await getCSRFToken();
});

const register = async (event) => {

    event.preventDefault();

    console.log(email.value);
    console.log(firstname.value);
    console.log(surname.value);
    console.log(password.value);


    const response = await fetch(`${config.public.API_BASE_URL}/admin/register-employee`, 
    {
        method: "POST",
        headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrf_token.value
        },
        credentials: "include",
        body: JSON.stringify({
        email: email.value,
        firstname: firstname.value,
        surname: surname.value,
        password: password.value,
        telephone: telephone.value
        })
    });

    if (response.status == 200) {
        email.value = '';
        firstname.value = '';
        surname.value = '';
        password.value = '';
        telephone.value = '';

        registerSucessful.value = true;

    }

    if (response.status == 409) {
        console.log("hello")
        registerError.value = true;
        errorMessage.value = "An account with this email already exists";
    }



}

</script>

<style lang="scss" scoped>

</style>