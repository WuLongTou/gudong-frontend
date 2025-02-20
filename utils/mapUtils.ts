function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}

function getAddress(amap: any, location: [number, number]) {
    return new Promise((resolve, reject) => {
        const geocoder = new amap.Geocoder()
        geocoder.getAddress(location, (status, result) => {
            if (status === 'complete' && result.info === 'OK') {
                return result.regeocode.formattedAddress
            }
        })
    })
}
export { getCurrentLocation, getAddress }