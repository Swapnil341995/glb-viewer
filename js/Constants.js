/**
 * viewer constants
 */
 const viewer = {
    canvas: document.createElement("canvas"),
    scene: new THREE.Scene(),
    sceneObject: null,
    width: window.innerWidth,
    height: window.innerHeight,
    fov: 45,
    aspect: this.width/this.height,
    near: 0.1,
    far: 20000,
    camera: new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far),
    renderer: new THREE.WebGLRenderer({canvas: this.canvas}),
    controls: null,
    backgroundColor: 0xf5f5f5,
    modelPath: null,
    defaultSpotLight: new THREE.SpotLight(0x404040),
    defaultAmbientLight: new THREE.AmbientLight(0x404040),
    raycaster: new THREE.Raycaster(),
    pointer: new THREE.Vector2(),
    arrParts: null,
    highlighted: null,
    textToDisplay: "Double click on model to select",
    oldText: null,
}