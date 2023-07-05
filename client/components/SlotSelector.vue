<template>
    <div>
    <div v-if="!availableSlots">No Slots currently available on that day</div>
    <div v-else>
        <div class="grid grid-rows-6 grid-flow-col gap-4">

            <div
            v-for="(slot, index) in availableSlots"
            :key="index"
            @click="selectSlot(slot)"
            :class="['border', 'hover:bg-gray-100', isSelected(slot) ? 'border-blue-500' : 'border-blue-100', isSelected(slot) ? 'bg-gray-200' : 'bg-white', 'shadow', 'rounded-md', 'p-4', 'max-w-sm', 'w-5/6', 'mx-auto', 'm-2', 'text-center']">
            <p>{{ `${slot.startTime.slice(0,5)}` }}</p>
        </div>
        </div>
    </div>

</div>
</template>

<script setup>

const emits = defineEmits(['update:selectedSlot', 'update:selectedEmployeeID', 'update:bookingstatus', 'update:serverMessage']);
const props = defineProps(['selectedDate', 'selectedEmployeeID', 'selectedServiceID', 'duration', 'selectedSlot'])
const config = useRuntimeConfig();

const availableSlots = ref(null);
const selectedSlot = ref(props.selectedSlot);
const csrf_token = ref(null);

const getSlot = async () => {

try {
    const response = await fetch(`${config.public.API_BASE_URL}/available-slots?date=${props.selectedDate}&id=${props.selectedEmployeeID}&duration=${props.duration}`, {
    credentials: "include",
    });

    const data = await response.json();

    if (response.status === 200) {
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
    selectedSlot.value = slot.startTime;
    emits('update:selectedSlot', slot.startTime);
};

const isSelected = (slot) => {
      return selectedSlot.value === slot.startTime;
};

</script>

<style lang="scss" scoped>

</style>