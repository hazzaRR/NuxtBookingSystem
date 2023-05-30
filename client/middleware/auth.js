export default defineNuxtRouteMiddleware(async (to, from) => {

    const {data, error} = await useFetch('http://localhost:5000/auth-check', 
    {
        method: "GET",        
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
    });

    console.log(data.value)

    // console.log(from);
    // console.log(to);

    if (!data.value) {
        return navigateTo('/login');
        // return navigateTo(to.fullPath);
    }
    // else {
    //     console.log("not here")
    //     return navigateTo('/login');
    // }

});