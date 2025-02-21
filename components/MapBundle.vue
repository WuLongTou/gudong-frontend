<template>
    <div id="map-container" class="h-full" />
</template>

<script setup lang="ts">
interface Props {
    location: MapLocation
    locationName: string
}
interface EmitProps {
    "update:location": [MapLocation]
    "update:locationName": [string]
}

import { onMounted } from 'vue';
import type { MapLocation } from '~/types';
const { $amap } = useNuxtApp()
const props = defineProps<Props>()
const currentLocation = toRef(props.location)
const emits = defineEmits<EmitProps>()

onMounted(async () => {
    watch(currentLocation, (newLocation) => {
        map.setCenter([currentLocation.value.longitude, currentLocation.value.latitude])
        marker.setPosition([currentLocation.value.longitude, currentLocation.value.latitude])
        AMap.plugin('AMap.Geocoder', function () {
            const geocoder = new $amap.Geocoder()
            geocoder.getAddress([newLocation.longitude, newLocation.latitude], (status: string, result: any) => {
                if (status === 'complete' && result.info === 'OK') {
                    emits('update:location', newLocation)
                    emits('update:locationName', result.regeocode.formattedAddress as string)
                }
            })
        })
    }, { deep: true })

    const location = await getCurrentLocation() as GeolocationPosition
    currentLocation.value = {
        longitude: location.coords.longitude,
        latitude: location.coords.latitude
    }
    const map = new $amap.Map('map-container', {
        zoom: 12,
        center: [currentLocation.value.longitude, currentLocation.value.latitude],
    })

    const marker = new $amap.Marker({
        position: [currentLocation.value.longitude, currentLocation.value.latitude],
        map: map,
        draggable: true,
    })
    marker.on('dragend', (e) => {
        currentLocation.value = {
            longitude: e.lnglat.lng,
            latitude: e.lnglat.lat
        }
    })
})
</script>