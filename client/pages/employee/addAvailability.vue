<template>
    <div>

      <NuxtLink to="/employee">Dashboard</NuxtLink>
        <NuxtLink to="/employee/manageAccount">Manage Account</NuxtLink>
        <NuxtLink to="/employee/addAvailability">Add Availability</NuxtLink>
        <NuxtLink to="/employee/manageBookings">Manage Bookings</NuxtLink>

        <br />


        <label>Date:</label>
    <input type="date" v-model="selectedDate" />
    <input type="number" v-model="defaultSlotLength" />

    <table>
      <thead>
        <tr>
          <th>Start Time</th>
          <th>End Time</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(slot, index) in timeSlots" :key="index">
          <td>
            <input type="time" v-model="slot.startTime" @input="updateEndTime(index)" />
          </td>
          <td>
            <input type="time" v-model="slot.endTime" />
          </td>
          <td>
            <button @click="removeTimeSlot(index)">Remove</button>
          </td>
        </tr>
        <tr>
          <td colspan="3">
            <button @click="addTimeSlot">Add Time Slot</button>
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="submitAvailablity">Submit</button>

    </div>
</template>

<script setup>
// definePageMeta({
//     middleware: "auth"
// });

const selectedDate = ref();
const defaultSlotLength = ref(30);

const timeSlots = ref([
  { timeToStart: '09:00', endTime: '09:30' }
])

const addTimeSlot = () => {
      timeSlots.value.push({ startTime: '00:00', endTime: '00:30' });
};

const removeTimeSlot = (index) => {
      timeSlots.value.splice(index, 1);
};

const updateEndTime = (index) => {
      const startTime = new Date(`2000-01-01T${timeSlots.value[index].startTime}`);
      const endTime = new Date(startTime.getTime() + defaultSlotLength.value * 60000); // 30 minutes in milliseconds
      const formattedEndTime = endTime.toTimeString().slice(0, 5);

      timeSlots.value[index].endTime = formattedEndTime;

}


const submitAvailablity = async (e) => {
    const slotData = {
        date: selectedDate.value,
        slots: timeSlots.value
    };


      const response = await fetch('http://localhost:5000/employee/add-availability', 
        {
        method: "POST",
        headers: {
                'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify({slotData})
        });


        timeSlots.value = [
{ startTime: '00:00', endTime: '00:30' }
]




    

}





</script>

<style lang="scss" scoped>

</style>