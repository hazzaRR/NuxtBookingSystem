export default defineNuxtRouteMiddleware(async (to, from) => {

    if (process.client) {  
        
        const {data, error} = await useFetch('http://localhost:5000/auth-check', 
        {      
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include",
        server: false,

        onResponse({ request, response, options }) {

            if (response.status == 403 || response.status == 401 ) {
                clearError({ redirect: '/login' })
            }

            const path = to.path.split('/')
    
            if (path[1] === "admin" && response._data.user_type !== 'admin') {
                throw createError({ statusCode: 403, statusMessage: 'Restricted Access to this page', data: response._data})
            }
            
            else if (path[1] === "employee" && response._data.user_type !== 'employee') {
                throw createError({ statusCode: 403, statusMessage: 'Restricted Access to this page', data: response._data})
            }

            else if (path[1] === "dashboard" && response._data.user_type !== 'client') {
                return abortNavigation(
                    createError({
                        statusCode: 403,
                        message: 'Forbidden access to this route',
                      })
                )
            }
        }
        });

    if (!data.value && error._object[error._key].statusCode === 403) {

        return navigateTo('/');

        // clearError({ redirect: '/' })
        // return abortNavigation( 
        // createError({
        //     statusCode: 403,
        //     message: 'Forbidden access to this route',
        //   }));
    }
}
});