/**
 * initialize the viewer
 * scene, camera, orbit controls, lights
 */
 function init() {
    //set up of the viewer
    viewer.scene.name = "root scene";
    const object3D = new THREE.Object3D();
    object3D.name = "sceneObject"
    viewer.scene.add(object3D); 
    viewer.sceneObject = viewer.scene.children[0];
    viewer.camera.name = "perspectiveCamera";
    
    //#region lights
    viewer.camera.aspect = viewer.width / viewer.height;
    viewer.renderer.setSize(viewer.width, viewer.height);
    viewer.camera.updateProjectionMatrix();
    viewer.defaultAmbientLight.intensity = 8;
    viewer.camera.position.set(5, 5, 5);
    viewer.scene.add(viewer.defaultAmbientLight);
    viewer.defaultSpotLight.intensity = 3;
    viewer.defaultSpotLight.position.set(0, 0, 1);
    viewer.defaultSpotLight.target = viewer.camera;
    viewer.camera.add(viewer.defaultSpotLight);
    viewer.camera.updateProjectionMatrix();
    //#endregion

    viewer.renderer.setSize(viewer.width, viewer.height);
    document.body.appendChild(viewer.renderer.domElement);
    viewer.controls = new THREE.OrbitControls(viewer.camera, viewer.renderer.domElement);
    viewer.controls.update();
    viewer.scene.background = new THREE.Color(viewer.backgroundColor);

    viewer.raycaster.params.Line.threshold = 0.1;

    //#region global events
    window.addEventListener("mousedown", onPointerDoubleClick);
    window.addEventListener('resize', onWindowResize, false);

    //#endregion
}

/**
 * 
 * @param {*} event
 * on double click highlights the parts in the model 
 */
function onPointerDoubleClick(event) {
    viewer.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    viewer.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    const intersects = viewer.raycaster.intersectObjects(viewer.sceneObject.children);
    const divPartNames = document.getElementById("idPartNames");
    
    const color = new THREE.Color("#ff007f");
    for(let i = 0; i < divPartNames?.childNodes.length;++i){
        if(intersects[0]?.object.name === divPartNames.childNodes[i].textContent){
            if(!intersects[0]?.object.userData){
                intersects[0].object.userData = {};
            }
            if(!intersects[0]?.object.material.color.equals(color)){
                intersects[0].object.userData.originalColor = intersects[0]?.object.material.color.clone();
            }
            intersects[0].object.material.color.set(0xff007f);
            intersects[0].object.material.needsUpdate = true;
            divPartNames.childNodes[i].style.color = "#ff007f";
            intersects[0].object.userData.highlight = true;
            viewer.highlighted = true;
        }
        if(intersects[0] === undefined || intersects.length === 0 && viewer.highlighted){
            viewer.sceneObject.traverse(function(part){
                if( part instanceof THREE.Mesh && part.userData?.highlight){
                    part.material.color.set(part.userData.originalColor?.clone());
                    part.userData.highlight = false;
                    viewer.highlighted = false;
                }
            });
            divPartNames.childNodes[i].style.color = "#000000";
        }
    }
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    viewer.camera.aspect = width / height;
    viewer.renderer.setSize(width, height);
    viewer.camera.updateProjectionMatrix();
}

/**
 * Loads glb model and actions take place after loading the model
 */
function loadModel(){
    viewer.modelPath = "./assets/glb/FormalShoe.glb";
    const glbLoader = new THREE.GLTFLoader();
    glbLoader.load(
        viewer.modelPath,
        function ( gltf ) {

            viewer.sceneObject.add( gltf.scene );
    
            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
            displayPartNames();
            generateTextDiv();
        },
        // called while loading is progressing
        function ( xhr ) {
            const loaded = xhr.loaded / xhr.total * 100;
            console.log( ( loaded ) + '% loaded' );    
        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened' );
        }
    );
}

/**
 * 
 * @param {*} textToDisplay 
 * @param {*} color 
 */
function loadFonts(textToDisplay, color = 0xff0000) {
    if(viewer.oldText){
        viewer.sceneObject.remove(viewer.oldText);
        viewer.oldText = null;
    }
    const loader = new THREE.FontLoader();
    
    loader.load( 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {
        
        const textParams = {
            font: font,
            size: 0.1,
            height: 0.0,
            curveSegments: 1,
            bevelThickness: 0.2,
            bevelSize: 0.5,
            bevelEnabled: false
        }

        var textGeo = new THREE.TextGeometry( textToDisplay, textParams);

        var textMaterial = new THREE.MeshPhongMaterial( { color: color } );

        var mesh = new THREE.Mesh( textGeo, textMaterial );
        mesh.position.set( -0.2, 0.1, 0.7 );

        const group = new THREE.Group();
        group.add(mesh);
        viewer.oldText = group;
        viewer.sceneObject.add(group);

    } );
}

/**
 * adding a div in canvas to display all part names
 */
function displayPartNames(){
    const nameDiv = document.createElement("div");
    nameDiv.id = "idPartNames";
    const sideBar = document.getElementById("idSideBar");
    const names = getListOfPartNames();
    for(let i = 0; i < names.length; ++i){
        const div = document.createElement("div");
        div.textContent = names[i];
        div.style.cursor = "pointer";
        div.addEventListener("mousedown", () => {
            if(div.textHighlighlighted){
                div.style.backgroundColor = "#f7d6d6fb";
                div.textHighlighlighted = false;
                removeHighlightPart(div);
            }
            else{
                div.style.backgroundColor = "#ff007f";
                div.textHighlighlighted = true;
                highlightPart(div);
            }
        })
        nameDiv.appendChild(div);
    }
    sideBar.appendChild(nameDiv);
}

/**
 * 
 * @param {div element} div to highlight
 */
function highlightPart(div){
    viewer.sceneObject.traverse((part) => {
        if(part instanceof THREE.Mesh){
            if(div.textContent === part.name){
                if(!part.userData){
                    part.userData = {};
                }
                part.userData.originalColor = part.material.color.clone();
                part.material.color = new THREE.Color(0xff007f);
                part.material.needsUpdate = true;
            }
        }
    });
}

/**
 * 
 * @param {div element} div to highlight 
 */
function removeHighlightPart(div){
    viewer.sceneObject.traverse((part) => {
        if(part instanceof THREE.Mesh){
            if(div.textContent === part.name){
                part.material.color = part.userData.originalColor?.clone();
            }
        }
    });
}

/**
 * get all part names
 */
function getListOfPartNames(){
    const arrPartNames = [];
    viewer.arrParts = [];
    viewer.sceneObject.traverse(function(part){
        if(part instanceof THREE.Mesh){
            arrPartNames.push(part.name);
            viewer.arrParts.push(part);
        }
    });
    return arrPartNames;
}

/**
 * generates div to update text after model load
 */
function generateTextDiv() {
    const sideBarText = document.getElementById("idSideBarText");
    const inputElem = document.createElement("input");
    inputElem.id = "idInpText";
    inputElem.type = "text";
    inputElem.placeholder = "input the text";
    inputElem.required = "required";
    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.innerHTML = "Update Text";
    submitBtn.onclick = (e) => {
        const inputElem = document.getElementById("idInpText");
        viewer.textToDisplay = inputElem.value;
        const inpColElem = document.getElementById("idInpColElem");
        const color = inpColElem.value;
        loadFonts(viewer.textToDisplay, color);
        inputElem.value = "";
    }
    sideBarText.appendChild(inputElem);

    const inputColElem = document.createElement("input");
    inputColElem.id = "idInpColElem";
    inputColElem.type = "color";
    inputColElem.value = "#ff0000";

    sideBarText.appendChild(inputColElem);
    sideBarText.appendChild(document.createElement("br"));
    sideBarText.appendChild(submitBtn);
    
    const inputRangHeigthElem = document.createElement("input");
    inputRangHeigthElem.id = "idInpRangElem";
    inputRangHeigthElem.type = "range";
    inputRangHeigthElem.min = "1";
    inputRangHeigthElem.max = "5";
    inputRangHeigthElem.value = "1";

    inputRangHeigthElem.onclick = (e) => {
        let inpRangeValue = e.target.value;
        viewer.sceneObject.traverse((part) => {
            if(part instanceof THREE.Mesh && part.geometry.type === "TextGeometry"){
                part.scale.y = inpRangeValue;
            }
        });
    }

    const inputRangWidthElem = document.createElement("input");
    inputRangWidthElem.id = "idInpRangElem";
    inputRangWidthElem.type = "range";
    inputRangWidthElem.min = "1";
    inputRangWidthElem.max = "5";
    inputRangWidthElem.value = "1";

    inputRangWidthElem.onclick = (e) => {
        let inpRangeValue = e.target.value;
        viewer.sceneObject.traverse((part) => {
            if(part instanceof THREE.Mesh && part.geometry.type === "TextGeometry"){
                part.scale.x = inpRangeValue;
            }
        });
    }

    sideBarText.appendChild(document.createElement("br"));
    sideBarText.appendChild(document.createElement("br"));
    sideBarText.appendChild(document.createElement("br"));
    const para = document.createElement("para");
    para.innerHTML = "Text Height";
    para.style.fontWeight = "bold";
    sideBarText.appendChild(para);
    sideBarText.appendChild(inputRangHeigthElem);
    const paraW = document.createElement("para");
    paraW.innerHTML = "Text Width";
    paraW.style.fontWeight = "bold";
    sideBarText.appendChild(document.createElement("br"));
    sideBarText.appendChild(document.createElement("br"));
    sideBarText.appendChild(paraW);
    sideBarText.appendChild(inputRangWidthElem);
}

function animate() {
    requestAnimationFrame( animate );
    // update the picking ray with the camera and pointer position
	viewer.raycaster.setFromCamera( viewer.pointer, viewer.camera );
    viewer.controls.update();
    viewer.renderer.render( viewer.scene, viewer.camera );
};

init();
animate();
loadFonts(viewer.textToDisplay);
loadModel();