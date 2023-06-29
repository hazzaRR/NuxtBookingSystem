<template>
    <div  class="fixed inset-0 flex items-center justify-center z-50">
  <div class="bg-black bg-opacity-50 absolute inset-0"></div>
  <div class="bg-white rounded-lg p-6 shadow-lg z-10">
    <div class="text-xl font-bold mb-4">{{ props.messageType }}</div>
    <p class="text-gray-700"> {{ props.message }} </p>
    <div class="mt-6 flex justify-end">
      <button @click="$emit('closeAlert')" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none">
        Close
      </button>
    </div>
  </div>
</div>
</template>

<script setup>

const props = defineProps(['messageType', 'message'])

</script>

<style lang="scss" scoped>

</style>