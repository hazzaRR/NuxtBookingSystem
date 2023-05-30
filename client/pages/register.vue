<template>
    <div>

        <h1>Hello world</h1>

        <form>
            <input type="text" placeholder="email" class="input input-bordered w-full max-w-xs" v-model="email" />
            <input type="text" placeholder="username" class="input input-bordered w-full max-w-xs" v-model="username" />
            <input type="password" placeholder="password" class="input input-bordered w-full max-w-xs" v-model="password" />
            <button class="btn" @click="login">Button</button>      
        </form>


        <p>{{ email }}</p>

    </div>
</template>

<script setup>


const email = ref('');
const username = ref('')
const password = ref('')


const login = async (event) => {

    event.preventDefault();

    console.log(email.value);
    console.log(username.value);
    console.log(password.value);


    const { data, error } = await useFetch('http://localhost:5000/register', 
    {
        method: "POST",
        body: {
        email: email.value,
        username: username.value,
        password: password.value
    }});

    console.log(data);


    email.value = '';
    username.value = '';
    password.value = '';


}

</script>

<style lang="scss" scoped>

</style>