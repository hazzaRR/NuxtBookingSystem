<template>
    <div>

        <div v-if="successMessage" class="alert alert-success max-w-sm my-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{serverMessage}}</span>
        </div>
        <div v-if="errorMessage" class="alert alert-error max-w-sm my-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{serverMessage}}</span>
        </div>
        <h1>Delete Employee</h1>
        <div class="flex items-center justify-center">
            <div class="w-1/2">
            <table class="table">
                <thead>
                    <tr>
                    <th>First Name</th>
                    <th>Surname</th>
                    <th>Telephone</th>
                    <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(employee, index) in employees" :key="index" class="hover">
                    <td>
                    {{employee.firstname}}
                    </td>
                    <td>
                    {{employee.surname}}
                    </td>
                    <td>
                    {{employee.telephone}}
                    </td>
                    <td>
                    <button class="btn btn-error" @click="deleteEmployee(employee.id, index)">Delete</button>
                    </td>
                    </tr>
                </tbody>
            </table>
        </div>
        </div>
            
    </div>
</template>

<script setup>
const config = useRuntimeConfig();

definePageMeta({
    middleware: "auth",
    layout: "admin-layout"
});

const employees = ref([]);
const successMessage = ref(false);
const errorMessage = ref(false);
const serverMessage = ref('');

const getEmployees = async () => {
    const data = await $fetch(`${config.public.API_BASE_URL}/admin/employees`, {
    credentials: "include",
    });

    console.log(data)

    employees.value = data.employees;

};

onBeforeMount(() => {
    getEmployees();
});


const deleteEmployee = async (employeeId, index) => {

    if(confirm("Are you sure you want to delete this ueser?")) {

        try {
            
            const response = await fetch(`${config.public.API_BASE_URL}/admin/delete-employee`, 
            {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: "include",
                body: JSON.stringify({
                employeeId
            })
        });

        const data = await response.json();
        
        if (response.status == 200) {
            employees.value.splice(index, 1);
            successMessage.value = true;
            errorMessage.value = false;
            serverMessage.value = data.message;
        }
        
        if (response.status == 409) {
            successMessage.value = false;
            errorMessage.value = true;
            serverMessage.value = data.message;
        }
    } catch (error) {
        successMessage.value = false;
        errorMessage.value = true;
        serverMessage.value = "Error communicating with the server";
    }
    };
      
};


</script>

<style lang="scss" scoped>

</style>