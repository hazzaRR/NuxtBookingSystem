<template>
    <div>

        <h1>Delete Employee</h1>
        <nav>
            <NuxtLink to="/admin" class="p-6">Dashboard</NuxtLink>
            <NuxtLink to="/admin/registerEmployee">Register Employee</NuxtLink>
            <NuxtLink to="/admin/deleteEmployee">Delete Employee</NuxtLink>
            <NuxtLink to="/admin/settings">Settings</NuxtLink>
        </nav>

        <div>

            <table>
                <thead>
                    <tr>
                    <th>First Name</th>
                    <th>Surname</th>
                    <th>Telephone</th>
                    <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(employee, index) in employees" :key="index">
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
                    <button @click="deleteEmployee(employee.id, index)">Delete</button>
                    </td>
                    </tr>
                </tbody>
            </table>



        </div>
            
    </div>
</template>

<script setup>

definePageMeta({
    middleware: "auth"
});

const employees = ref([]);

const getEmployees = async () => {
    const data = await $fetch('http://localhost:5000/admin/employees', {
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

        
        const response = await fetch('http://localhost:5000/admin/delete-employee', 
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

        
        if (response.status == 200) {
            employees.value.splice(index, 1);
        }
        
        if (response.status == 409) {
            registerError.value = true;
            errorMessage.value = "An account with this email already exists";
        }
    };
      
};


</script>

<style lang="scss" scoped>

</style>