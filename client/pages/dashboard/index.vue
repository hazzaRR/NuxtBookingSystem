<template>
    <div>

        <h1>welcome to the home page</h1>

        <button class="btn" @click="getToken">Button</button>  

    

    </div>
</template>

<script setup>

definePageMeta({
    middleware: "auth"
});



// const getToken = async (event) => {

//     const {data, error } = await useFetch('http://localhost:5000/set-cookie', 
//     {
//         method: "GET",        
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         credentials: "include"
//     });
        
        // console.log(isLoggedIn.value);
        // console.log(error.value);
        
// console.log(data.value);

// }

</script>

<style lang="scss" scoped>

</style>