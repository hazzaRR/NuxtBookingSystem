<template>
    <div>
        <form class="grid place-items-center mx-auto my-60 border">
        <div class="relative mb-6">
            <input type="text" placeholder="email" class="input input-bordered w-full max-w-xs" v-model="email"  required/>
        </div>
        <div class="relative mb-6">
        <input type="password" placeholder="password" class="input input-bordered w-full max-w-xs" v-model="password"  required/>
        </div>
        <div class="relative mb-6">
        <button class="btn" @click="login">Login</button>
        </div>   
        </form>
    </div>
</template>

<script setup>

const config = useRuntimeConfig();


const email = ref('');
const password = ref('');

const login = async (event ) => {
    event.preventDefault();
    
    console.log(email.value);
    console.log(password.value);
 
    const response = await fetch(`${config.public.API_BASE_URL}/login`, 
    {
        method: "POST",
        headers: {
                'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify({
            email: email.value,
            password: password.value
        })
    });

    const data = await response.json();

        if (response.status === 200) {


            if (data.user_type === 'admin') {
                navigateTo('/admin');
            }
            else if (data.user_type === 'employee') {
                navigateTo('/employee');
            }
            else {
                navigateTo('/dashboard');
            }
            // navigateTo('/dashboard');
        }
        else {
            console.log(data.message);
            alert("Incorrect username or password");
        }
        
        
        email.value = '';
        password.value = '';
        
    }
        
        
</script>
    
<style lang="scss" scoped>

</style>