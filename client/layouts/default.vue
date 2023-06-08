<template>
    <div>
        <NavBar :links="links" />
        <slot />
    </div>
</template>

<script setup>

const links = [
    {name: "Home", link: '/'},
    {name: "Register", link: '/register'},
    {name: "Login", link: '/login'},
]

</script>

<style lang="scss" scoped>

</style>