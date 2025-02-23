declare global {
    interface Window {
        AMap: typeof AMap;
    }
    namespace AMap {
        class Geocoder {
            getAddress(
                lnglat: [number, number],
                callback: (status: string, result: any) => void
            ): void;
        }
        class Geolocation extends AMap.Control {
            constructor(options: {
                enableHighAccuracy?: boolean
                showButton?: boolean
                buttonPosition?: string
                showMarker?: boolean
                showCircle?: boolean
                panToLocation?: boolean
                zoomToAccuracy?: boolean
            })
        }
    }
}