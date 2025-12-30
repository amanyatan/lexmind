export { }

declare global {
    namespace JSX {
        interface IntrinsicElements {
            mesh: any
            group: any
            sphereGeometry: any
            meshStandardMaterial: any
            boxGeometry: any
            planeGeometry: any
            cylinderGeometry: any
            ambientLight: any
            pointLight: any
        }
    }
}
