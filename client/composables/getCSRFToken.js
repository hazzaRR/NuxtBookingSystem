//function that fetches csrf token and returns csrf token for session to be used in forms

export const getCSRFToken = async () => {
    const config = useRuntimeConfig();


    const response = await fetch(`${config.public.API_BASE_URL}/csrf-token`, {
        method: "GET",
        headers: { 
            "Content-Type": "application/json",
        },
        credentials: "include"
    });

    const data = await response.json();

    if (response.status === 200) {
        
        return data.csrf_token;
    }

    else {
        return;
    }


  }