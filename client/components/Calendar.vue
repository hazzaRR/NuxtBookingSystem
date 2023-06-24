<template>
    <div>

        <FullCalendar :options="calendarOptions" />

    </div>
</template>

<script setup>

import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

const calendarOptions = {
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
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
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
        navigateTo(`/appointment/viewAppointment?id=${info.event.id}`);
      }
      }

</script>

<style lang="scss" scoped>

</style>