<template>
    <div>
        <h1 v-if="registerError">{{errorMessage}}</h1>

        <div class="hero min-h-screen bg-base-200">
            <div class="hero-content flex-col lg:flex-row-reverse">
                <div class="text-center lg:text-left">
                <h1 class="text-5xl font-bold">Register Today!</h1>
                <p class="py-6">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
                </div>
                <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                <div class="card-body">
                    <div class="form-control">
                    <label class="label">
                        <span class="label-text">Email</span>
                    </label>
                        <input type="email" placeholder="email" class="input input-bordered w-full max-w-xs" v-model="email" required/>
                    </div>
                    <div class="form-control">
                    <label class="label">
                        <span class="label-text">Password</span>
                    </label>
                    <div class="join">
                        <input :type="inputType" placeholder="password" class="input input-bordered w-full max-w-xs join-item" v-model="password" pattern='^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,25}$' required/>
                        <a @click="togglePassword" class="btn join-item">
                            <svg xmlns="http://www.w3.org/2000/svg" :class="{ 'hidden': isPasswordVisible }" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" :class="{ 'hidden': !isPasswordVisible }" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                        </a>
                    </div>
                    </div>
                    <div class="form-control">
                    <label class="label">
                        <span class="label-text">Firstname</span>
                    </label>
                    <input type="text" placeholder="firstname" class="input input-bordered w-full max-w-xs" v-model="firstname" required/>
                    </div>
                    <div class="form-control">
                    <label class="label">
                        <span class="label-text">Surname</span>
                    </label>
                    <input type="text" placeholder="surname" class="input input-bordered w-full max-w-xs" v-model="surname" required/>
                    </div>
                    <div class="form-control">
                    <label class="label">
                        <span class="label-text">Telephone</span>
                    </label>
                    <input type="text" placeholder="telephone" class="input input-bordered w-full max-w-xs" v-model="telephone" required />
                    </div>
                    <div class="form-control mt-6">
                        <button class="btn btn-primary" @click="register">Register</button> 
                    </div>
                </div>
                </div>
            </div>
            </div>

    </div>

    
</template>

<script setup>

const config = useRuntimeConfig();

const registerError = ref(false);
const errorMessage = ref('');
const email = ref('');
const firstname = ref('');
const surname = ref('');
const password = ref('');
const telephone = ref('');
const inputType = ref('password')
const isPasswordVisible = ref(false);

const togglePassword = () => {
    inputType.value = inputType.value === 'password' ? 'text' : 'password';
    isPasswordVisible.value = !isPasswordVisible.value;
};


const register = async (event) => {

    event.preventDefault();

    console.log(email.value);
    console.log(firstname.value);
    console.log(surname.value);
    console.log(telephone.value);
    console.log(password.value);


    const response = await fetch(`${config.public.API_BASE_URL}/register`, 
    {
        method: "POST",
        headers: {
                'Content-Type': 'application/json'
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


        navigateTo('/dashboard');

    }

    else if (response.status == 409) {
        registerError.value = true;
        errorMessage.value = "An account with this email already exists";
    }

}

</script>

<style lang="scss" scoped>

</style>