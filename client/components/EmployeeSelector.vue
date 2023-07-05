<template>
    <div>

    <div v-if="!availableEmployees">No Employees currently available on that day</div>
    <div v-else>
        <div
            v-for="(employee, index) in availableEmployees"
            :key="index"
            @click="selectEmployee(employee)"
            :class="['border', 'hover:bg-gray-100', isSelected(employee.id) ? 'border-blue-500' : 'border-blue-100', isSelected(employee.id) ? 'bg-gray-200' : 'bg-white', 'shadow', 'rounded-md', 'p-4', 'max-w-sm', 'w-full', 'mx-auto', 'm-2']">
            <p>{{ `${employee.firstname} ${employee.surname}` }}</p>
        </div>

    </div>

</div>
</template>

<script setup>

const emits = defineEmits(['update:selectedEmployeeID', 'update:employeeName']);
const props = defineProps(['selectedDate', 'selectedEmployeeID'])
const config = useRuntimeConfig();

const availableEmployees = ref(null);
const selectedEmployeeID = ref(props.selectedEmployeeID);

const getEmployees = async () => {

try {

    console.log(props.selectedDate);

    const response = await fetch(`${config.public.API_BASE_URL}/available-employees?date=${props.selectedDate}`, {
    credentials: "include",
    });

    const data = await response.json();

    if (response.status === 200) {
        console.log(data.employees)
        availableEmployees.value = data.employees;
    };
    
} catch (error) {
    console.log(error);
}
};

onBeforeMount(() => {
    getEmployees();
})

const selectEmployee = (employee) => {
    selectedEmployeeID.value = employee.id;
    emits('update:selectedEmployeeID', employee.id);
    emits('update:employeeName', `${employee.firstname} ${employee.surname}`);
};

const isSelected = (employeeId) => {
      return selectedEmployeeID.value === employeeId;
};

</script>

<style lang="scss" scoped>

</style>