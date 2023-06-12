export default defineNuxtRouteMiddleware(async (to, from) => {

    const config = useRuntimeConfig();

    if (process.client) {  
        
        const {data, error} = await useFetch(`${config.public.API_BASE_URL}/auth-check`, 
        {      
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include",
        server: false
        });

    if (!data.value) {
        return
    }

    else if (data.value.user_type === 'client') {

        return navigateTo('/dashboard');
    }

    else if (!data.value && data.value.user_type === 'admin') {
        return navigateTo('/admin');
    }

    else if (!data.value && data.value.user_type === 'employee') {
        return navigateTo('/employee');
    }

} 
});