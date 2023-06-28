<template>
  
    <div>

        <h1>Manage Bookings</h1>

        <dialog id="editBookingDetails" class="modal modal-bottom sm:modal-middle">
        <form method="dialog" class="modal-box">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          <EditBookingForm v-if="selectedID" :id="selectedID" :csrfToken="csrf_token" />
        </form>
        </dialog>

        <div class="flex items-center justify-center">

          <div class="w-3/4">
            <FullCalendar :options="calendarOptions" :events="events"/>
            
          </div>
        </div>


        
    </div>
</template>

<script setup>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import EditBookingForm from '~/components/EditBookingForm.vue';

const config = useRuntimeConfig();

definePageMeta({
    middleware: "auth",
    layout: "employee-layout"
});


const calendarOptions = ref({
    plugins: [ dayGridPlugin, interactionPlugin, timeGridPlugin ],
    initialView: 'timeGridWeek',
    selectable: true,
      firstDay: 1,
      slotMinTime: '07:00',
      slotMaxTime: '21:00',
      slotDuration: '00:15',
      nowIndicator: true,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: [
        ],
      eventTimeFormat: {
        hour: 'numeric',
        minute: '2-digit',
        meridiem: 'short'
      },
      dateClick: function(info) {
        date = info.dateStr;
        console.log(date);
        calendar.changeView('timeGridDay', date);
      },
      //redirects the page to show the details of the appointment you have selected
      eventClick: function(info) {

        selectedID.value = info.event.id;

        editBookingDetails.showModal();

        // navigateTo(`/employee/manageBookings/${info.event.id}`);
      }
});

const appointments = ref(null);
const events = ref([]);
const selectedID = ref(null);
const csrf_token = ref(null);

const getAppointments = async () => {

    const response = await fetch(`${config.public.API_BASE_URL}/employee/appointments`, {
    credentials: "include",
    });

    const data = await response.json();

    if (response.status === 200) {

        console.log(data.appointments);
        appointments.value = data.appointments;
    };

    for (let i = 0; i < data.appointments.length; i++) {

        const newEvent = {
        id: data.appointments[i].id,
        title: `${data.appointments[i].firstname} ${data.appointments[i].surname}`,
        start: `${data.appointments[i].appdate}T${data.appointments[i].starttime}`,
        end: `${data.appointments[i].appdate}T${data.appointments[i].endtime}`
        };

        calendarOptions.value.events.push(newEvent);

    };

}

onMounted(async () => {
    await getAppointments();
    csrf_token.value = await getCSRFToken();
});


</script>

<style lang="scss" scoped>

</style>