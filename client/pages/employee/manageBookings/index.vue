<template>
  
    <div>

        <h1>Manage Bookings</h1>

        <div class="container mx-auto p-4">

        <FullCalendar :options="calendarOptions" :events="events"/>

        </div>


        
    </div>
</template>

<script setup>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

definePageMeta({
    middleware: "auth",
    layout: "employee-layout"
});


const calendarOptions = ref({
    plugins: [ dayGridPlugin, interactionPlugin, timeGridPlugin ],
    initialView: 'dayGridWeek',
    selectable: true,
      firstDay: 1,
      slotMinTime: '07:00',
      slotMaxTime: '21:00',
      slotDuration: '00:15',
      nowIndicator: true,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'addAppointmentBtn dayGridMonth,timeGridWeek,timeGridDay'
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

        navigateTo(`/employee/manageBookings/${info.event.id}`);
      },
      customButtons: {
        addAppointmentBtn: {
          text: 'New Appointment',
          click: function(info) {
            navigateTo('/appointment/createAppointment');
          }
        }
      }
});

const appointments = ref(null);
const events = ref([]);
const selectedAppID = ref(null);

const getAppointments = async () => {

    const response = await fetch('http://localhost:5000/employee/appointments', {
    credentials: "include",
    });

    const data = await response.json();

    if (response.status === 200) {

        console.log(data.appointments);
        appointments.value = data.appointments;
    };

    for (let i = 0; i < data.appointments.length; i++) {
        console.log(data.appointments[i].appdate.slice(0,10));

        const newEvent = {
        id: data.appointments[i].id,
        title: `${data.appointments[i].firstname} ${data.appointments[i].surname}`,
        start: `${data.appointments[i].appdate.slice(0,10)}T${data.appointments[i].starttime}`,
        end: `${data.appointments[i].appdate.slice(0,10)}T${data.appointments[i].endtime}`
        };

        calendarOptions.value.events.push(newEvent);

    };

}

onMounted(() => {
    getAppointments();
});


</script>

<style lang="scss" scoped>

</style>