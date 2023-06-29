<template>
    <div>
        <NavBar :links="links" :logged-in="true"/>
        <slot />
    </div>
</template>

<script setup>

const links = [
    {name: "Dashboard", link: '/admin'},
    {name: "Register Employee", link: '/admin/registerEmployee'},
    {name: "Delete Employee", link: '/admin/deleteEmployee'},
    {name: "Services", link: '/admin/manageService'},
    {name: "Settings", link: '/admin/settings'}
]


</script>

<style lang="scss" scoped>

</style>