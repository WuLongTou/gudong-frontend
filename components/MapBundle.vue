<template>
    <div id="map-container" class="h-full" />
</template>

<script setup lang="ts">
interface Props {
    location: [number, number]
    locationName: string
}
interface EmitProps {
    location: [number, number]
    locationName: string
}

import { onMounted } from 'vue';
const { $amap } = useNuxtApp()
const props = defineProps<Props>()
const currentLocation = ref(props.location)
const currentLocationName = ref(props.locationName)
const emits = defineEmits<EmitProps>()

onMounted(async () => {
    watch(currentLocation, (newLocation) => {
        const geocoder = new $amap.Geocoder()
        console.log("geocoder: ", geocoder)
        console.log("newLocation: ", newLocation)
        geocoder.getAddress(newLocation, (status, result) => {
            if (status === 'complete' && result.info === 'OK') {
                console.log('result: ', result)
                currentLocationName.value = result.regeocode.formattedAddress
            }
        })
        emits('update:location', newLocation)
        emits('update:locationName', currentLocationName.value)
    })

    const location = await getCurrentLocation()
    currentLocation.value = [location.coords.longitude, location.coords.latitude]

    const map = new $amap.Map('map-container', {
        zoom: 12,
        center: currentLocation.value,
    })
    const marker = new $amap.Marker({
        position: currentLocation.value,
        map: map,
        draggable: true,
    })
    marker.on('dragend', (e) => {
        currentLocation.value = [e.lnglat.lng, e.lnglat.lat]
        console.log("from dragend lnglat: ", e.lnglat)
        console.log("from dragend currentLocation: ", currentLocation.value)
    })
})
</script>