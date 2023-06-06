<template>
    <div>

        <h1>Hello world</h1>

        <form>
        <input type="text" placeholder="email" class="input input-bordered w-full max-w-xs" v-model="email" />
        <input type="password" placeholder="password" class="input input-bordered w-full max-w-xs" v-model="password" />
        <button class="btn" @click="login">Button</button>      
        </form>

    </div>
</template>

<script setup>


const email = ref('');
const password = ref('');



const login = async (event ) => {
    event.preventDefault();
    
    console.log(email.value);
    console.log(password.value);
    
    
    const { data, error } = await useFetch('http://localhost:5000/login', 
    {
        method: "POST",
        headers: {
                'Content-Type': 'application/json'
        },
        credentials: "include",
        body: {
            email: email.value,
            password: password.value
        }});


        if (data.value) {

            if (data.value.user_type === 'admin') {
                navigateTo('/admin');
            }
            else if (data.value.user_type === 'employee') {
                navigateTo('/employee');
            }
            else {
                navigateTo('/dashboard');
            }
            // navigateTo('/dashboard');
        }
        else {
            console.log(error.value);
            alert("Incorrect username or password");
        }
        
        
        email.value = '';
        password.value = '';
        
    }
        
        
    </script>
    
<style lang="scss" scoped>

</style>