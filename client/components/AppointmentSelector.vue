<template>
    <div>

    <div v-if="!availableAppointments">No Slots currently available on that day</div>
    <div v-else>
        <div
            v-for="(slot, index) in availableSlots"
            :key="index"
            @click="selectSlot(slot)"
            :class="['border', 'hover:bg-gray-100', isSelected(slot.id) ? 'border-blue-500' : 'border-blue-100', isSelected(slot.id) ? 'bg-gray-200' : 'bg-white', 'shadow', 'rounded-md', 'p-4', 'max-w-sm', 'w-full', 'mx-auto', 'm-2']">
            <p>{{ `${slot.starttime} ${slot.endtime}` }}</p>
        </div>

    </div>

</div>
</template>

<script setup>

const emits = defineEmits(['update:selectedSlot']);
const props = defineProps(['selectedDate', 'selectedEmployeeID'])
const config = useRuntimeConfig();

const availableSlots = ref(null);
const selectedSlot = ref(null);

const getSlot = async () => {

try {


    const response = await fetch(`${config.public.API_BASE_URL}/available-slots?date=${props.selectedDate}&id=${props.selectedEmployeeID}`, {
    credentials: "include",
    });

    const data = await response.json();

    if (response.status === 200) {
        console.log(data.slots);
        availableSlots.value = data.slots;
    };
    
} catch (error) {
    console.log(error);
}
};

onBeforeMount(() => {
    getSlot();
})

const selectSlot = (slot) => {
    selectedSlot.value = slot;
    emits('update:selectedSlot', slot);
};

const isSelected = (slot) => {
      return selectedSlot.value === slot;
};

</script>

<style lang="scss" scoped>

</style>