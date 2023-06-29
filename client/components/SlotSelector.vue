<template>
    <div>

    <div v-if="!availableSlots">No Slots currently available on that day</div>
    <div v-else>
        <div
            v-for="(slot, index) in availableSlots"
            :key="index"
            @click="selectSlot(slot)"
            :class="['border', 'hover:bg-gray-100', isSelected(slot) ? 'border-blue-500' : 'border-blue-100', isSelected(slot) ? 'bg-gray-200' : 'bg-white', 'shadow', 'rounded-md', 'p-4', 'max-w-sm', 'w-full', 'mx-auto', 'm-2', 'text-center']">
            <p>{{ `${slot.startTime.slice(0,5)}` }}</p>
        </div>


        <button class="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg btn-primary" :disabled="!selectedSlot" @click="BookSlot">Book</button>

    </div>

</div>
</template>

<script setup>

// const emits = defineEmits(['update:selectedSlot']);
const props = defineProps(['selectedDate', 'selectedEmployeeID', 'selectedServiceID', 'duration'])
const config = useRuntimeConfig();

const availableSlots = ref(null);
const selectedSlot = ref(null);
const csrf_token = ref(null);

const getSlot = async () => {

try {
    const response = await fetch(`${config.public.API_BASE_URL}/available-slots?date=${props.selectedDate}&id=${props.selectedEmployeeID}&duration=${props.duration}`, {
    credentials: "include",
    });

    const data = await response.json();

    if (response.status === 200) {
        console.log(data.availability);
        availableSlots.value = data.availability;
    };
    
} catch (error) {
    console.log(error);
}
};

onBeforeMount(async () => {
    getSlot();
    csrf_token.value = await getCSRFToken();
})

const selectSlot = (slot) => {
    selectedSlot.value = slot;
    // emits('update:selectedSlot', slot);
};

const isSelected = (slot) => {
      return selectedSlot.value === slot;
};

const BookSlot = async () => {

    const response = await fetch(`${config.public.API_BASE_URL}/client/book-slot`, 
    {
        method: "POST",
        headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrf_token.value
        },
        credentials: "include",
        body: JSON.stringify({
            date: props.selectedDate,
            employeeID: props.selectedEmployeeID,
            serviceID: props.selectedServiceID,
            slot: selectedSlot.value
        })
    });

    const data = await response.json();

        if (response.status === 200) {

            console.log("hello")

        }
};

</script>

<style lang="scss" scoped>

</style>