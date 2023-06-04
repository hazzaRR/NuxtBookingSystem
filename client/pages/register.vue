<template>
    <div>

        <h1>Hello world</h1>

        <form>
            <input type="text" placeholder="email" class="input input-bordered w-full max-w-xs" v-model="email" required/>
            <input type="password" placeholder="password" class="input input-bordered w-full max-w-xs" v-model="password"  required/>
            <input type="text" placeholder="firstname" class="input input-bordered w-full max-w-xs" v-model="firstname" required/>
            <input type="text" placeholder="surname" class="input input-bordered w-full max-w-xs" v-model="surname" required/>
            <input type="text" placeholder="telephone" class="input input-bordered w-full max-w-xs" v-model="telephone" required />
            <button class="btn" @click="login">Button</button>      
        </form>


        <p>{{ email }}</p>

    </div>
</template>

<script setup>


const email = ref('');
const firstname = ref('');
const surname = ref('');
const password = ref('');
const telephone = ref('');


const login = async (event) => {

    event.preventDefault();

    console.log(email.value);
    console.log(firstname.value);
    console.log(surname.value);
    console.log(telephone.value);
    console.log(password.value);


    const { data, error } = await useFetch('http://localhost:5000/register', 
    {
        method: "POST",
        headers: {
                'Content-Type': 'application/json'
        },
        credentials: "include",
        body: {
        email: email.value,
        firstname: firstname.value,
        surname: firstname.value,
        password: password.value,
        telephone: telephone.value
    }});

    console.log(data);


    email.value = '';
    firstname.value = '';
    surname.value = '';
    telephone.value = '';
    password.value = '';

    navigateTo('/dashboard');


}

</script>

<style lang="scss" scoped>

</style>