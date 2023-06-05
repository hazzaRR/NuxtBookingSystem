export default defineNuxtRouteMiddleware(async (to, from) => {

    if (process.client) {  

    const {data, error } = await useFetch('http://localhost:5000/auth-check', 
    {      
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include",
        server: false
    });
    
    const path = to.path.split('/')

    console.log(data.value.user_type !== 'admin');
    
    if (path[1] === "admin" && data.value.user_type !== 'admin') {

        return abortNavigation(
            createError({
                statusCode: 403,
                message: 'Forbidden access to this route',
              })
        )
    }
    
    if (path[1] === "employee" && data.value.user_type !== 'employee') {
        return abortNavigation(
            createError({
                statusCode: 403,
                message: 'Forbidden access to this route',
              })
        )
    }
    console.log(from) 
    
    if (!data) {
        return navigateTo('/login');
    };
    
}

});