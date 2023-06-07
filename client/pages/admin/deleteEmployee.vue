<template>
    <div>

        <nav>
            <h1>Delete Employee</h1>
            <NuxtLink to="/admin">Dashboard</NuxtLink>
            <NuxtLink to="/admin/registerEmployee">Register Employee</NuxtLink>
            <NuxtLink to="/admin/deleteEmployee">Delete Employee</NuxtLink>
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
                    <button @click="deleteEmployee(employee.id)">Delete</button>
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


const { data } = await useFetch('http://localhost:5000/admin/employees', {
    credentials: "include",
});


console.log(data.value);


const deleteEmployee = async (employeeId) => {

    await useFetch('http://localhost:5000/admin/delete-employee', 
    {
        method: "DELETE",
        headers: {
                'Content-Type': 'application/json'
        },
        credentials: "include",
        body: {
            employeeId
        },

        onResponse({ request, response, options }) {

            if (response.status == 200) {
                employees.value.splice(index, 1);
            }

            if (response.status == 409) {
                console.log("hello")
                registerError.value = true;
                errorMessage.value = "An account with this email already exists";
            }

         }
    });



}


</script>

<style lang="scss" scoped>

</style>