<template>
    <div>
        <h1>Element Plus</h1>
        <NuxtLink to="/">
            <el-button>Back to Home</el-button>
        </NuxtLink>
    </div>
</template>

<script setup>
const form = ref({
    name: ''
})
</script>