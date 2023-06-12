<template>
    <div>

        <h1>Employee dashboard</h1>

<!-- <label for="my_modal_6" class="btn">open modal</label>

<input type="checkbox" id="my_modal_6" class="modal-toggle" />
<div class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Hello!</h3>
    <p class="py-4">This modal works with a hidden checkbox!</p>
    <div class="modal-action">
      <label for="my_modal_6" class="btn">Close!</label>
    </div>
  </div>
</div> -->

<!-- Open the modal using ID.showModal() method -->
<button class="btn" onclick="my_modal_2.showModal()">open modal</button>
<dialog id="my_modal_2" class="modal">
  <form method="dialog" class="modal-box">
    <h3 class="font-bold text-lg">Hello!</h3>
    <p class="py-4">Press ESC key or click outside to close</p>
  </form>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

    </div>
</template>

<script setup>

definePageMeta({
    middleware: "auth",
    layout: "employee-layout"
});


</script>



<style lang="scss" scoped>

</style>