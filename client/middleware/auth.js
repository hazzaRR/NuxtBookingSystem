export default defineNuxtRouteMiddleware(async (to, from) => {

    if (process.client) {  
        
        let authenticated = false;

        const response = await fetch('http://localhost:5000/auth-check', 
        {      
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
        });


        const data = await response.json();

        console.log(response.status);


        const path = to.path.split('/');

        if (path[1] === "admin" && data.user_type !== 'admin') {
            authenticated = false;
        }
        
        else if (path[1] === "employee" && data.user_type !== 'employee') {
            authenticated = false;
        }

        else if (path[1] === "dashboard" && data.user_type !== 'client') {
            authenticated = false;
        }
        else if (response.status === 403 || response.status === 401) {
            authenticated = false
            
        }
        else if (response.status === 200) {
                authenticated = true
        }
        
    console.log(data);
    console.log(authenticated);
    if (!authenticated) {
        // return abortNavigation();
        return navigateTo('/');
    }
}
});