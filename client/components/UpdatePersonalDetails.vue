<template>
    <div>

        <form class="grid place-items-center">
        <div class="relative mb-6">
            <input type="text" placeholder="firstname" class="input input-bordered w-full max-w-xs" v-model="firstname" required/>
        </div>
        <div class="relative mb-6">
            <input type="text" placeholder="surname" class="input input-bordered w-full max-w-xs" v-model="surname" required/>
        </div>
        <div class="relative mb-6">
            <input type="text" placeholder="telephone" class="input input-bordered w-full max-w-xs" v-model="telephone" required/>
        </div>
        <div class="relative mb-6">
        <button class="btn" @click="updateDetails">Update Details</button>
        </div>   
        </form>


    </div>
</template>

<script setup>

const config = useRuntimeConfig();
const props = defineProps(['currentFirstname', 'currentSurname', 'currentTelephone', 'route', 'csrfToken']);
const emits = defineEmits(['update:successMessage', 'update:errorMessage', 'update:serverMessage']);

const firstname = ref('');
const surname = ref('');
const telephone = ref('');

onBeforeMount(() => {
    firstname.value = props.currentFirstname;
    surname.value = props.currentSurname;
    telephone.value = props.currentTelephone;
});


const updateDetails = async (event) => {
    event.preventDefault();

    const updatedAccountDetails = {
        firstname: firstname.value,
        surname: surname.value,
        telephone: telephone.value
    };

    const response = await fetch(`${config.public.API_BASE_URL}/${props.route}/update-account`, {
        method: 'PUT',
        headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': props.csrfToken
        },
        credentials: 'include',
        body: JSON.stringify(updatedAccountDetails)
    });

    const data = await response.json();

    if (response.status === 200) {
        console.log(data.message)
        emits('update:successMessage', true);
        emits('update:errorMessage', false);
        emits('update:serverMessage', data.message);
    }
    else {
        emits('update:successMessage', false);
        emits('update:errorMessage', true);
        emits('update:serverMessage', data.message);
    }
};

</script>

<style lang="scss" scoped>

</style>