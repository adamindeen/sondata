const LOADER = document.getElementById('js-loader');
var loaded = false;
const DRAG_NOTICE = document.getElementById('js-drag-notice');
const colors = [
    {
        texture: 'https://i.ibb.co/M1zKN8r/Spectrogram-of-Bach-s-Chorales-for-Organ.jpg',
        size: [5, 5, 5],
        shininess: 60
    },
    {
        texture: 'https://i.ibb.co/QPZDptc/300px-The-Pattern-Emerges-log-spectrogram-from-50-Hz-to-3600-Hz-of-the-first-20-seconds.jpg',
        size: [5, 5, 5],
        shininess: 0
    },
    {
        texture: 'https://i.ibb.co/YWKWffT/Phaser-spectrogram.jpg',
        size: [5, 5, 5],
        shininess: 10
    },
    {
        texture: 'https://i.ibb.co/n0W1cv5/1024px-Human-voice-spectrogram.jpg',
        size: [5, 5, 5],
        shininess: 0
    },
    {
        texture: 'https://i.ibb.co/J3hmj8d/spectrogram-settings-auto-adjust-stft.png',
        size: [5, 5, 5],
        shininess: 0
    },
    {
        color: '131417'
    },
    {
        color: '374047'
    },
    {
        color: '5f6e78'
    },
    {
        color: '7f8a93'
    },
    {
        color: '97a1a7'
    },
    {
        color: 'acb4b9'
    },
    {
        color: 'DF9998',
    },
    {
        color: '7C6862'
    },
    {
        color: 'A3AB84'
    },
    {
        color: 'D6CCB1'
    },
    {
        color: 'F8D5C4'
    },
    {
        color: 'A3AE99'
    },
    {
        color: 'EFF2F2'
    },
    {
        color: 'B0C5C1'
    },
    {
        color: '8B8C8C'
    },
    {
        color: '565F59'
    },
    {
        color: 'CB304A'
    },
    {
        color: 'FED7C8'
    },
    {
        color: 'C7BDBD'
    },
    {
        color: '3DCBBE'
    },
    {
        color: '264B4F'
    },
    {
        color: '389389'
    },
    {
        color: '85BEAE'
    },
    {
        color: 'F2DABA'
    },
    {
        color: 'F2A97F'
    },
    {
        color: 'D85F52'
    },
    {
        color: 'D92E37'
    },
    {
        color: 'FC9736'
    },
    {
        color: 'F7BD69'
    },
    {
        color: 'A4D09C'
    },
    {
        color: '4C8A67'
    },
    {
        color: '25608A'
    },
    {
        color: '75C8C6'
    },
    {
        color: 'F5E4B7'
    },
    {
        color: 'E69041'
    },
    {
        color: 'E56013'
    },
    {
        color: '11101D'
    },
    {
        color: '630609'
    },
    {
        color: 'C9240E'
    },
    {
        color: 'EC4B17'
    },
    {
        color: '281A1C'
    },
    {
        color: '4F556F'
    },
    {
        color: '64739B'
    },
    {
        color: 'CDBAC7'
    },
    {
        color: '946F43'
    },
    {
        color: '66533C'
    },
    {
        color: '173A2F'
    },
    {
        color: '153944'
    },
    {
        color: '27548D'
    },
    {
        color: '438AAC'
    }
]

var activeOption = 'cushions';

const TRAY = document.getElementById('js-tray-slide');

var cameraFar = 5;
// Init the scene
var theModel;
const MODEL_PATH = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/chair.glb";
//const MODEL_PATH = "officechair.glb";
const BACKGROUND_COLOR = 0xf1f1f1;

const scene = new THREE.Scene();

scene.background = new THREE.Color(BACKGROUND_COLOR);
scene.fog = new THREE.Fog(BACKGROUND_COLOR, 20, 100);

const canvas = document.querySelector('#c');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = cameraFar;
camera.position.x = 0;

//init The object loader
const loader = new THREE.GLTFLoader();

//Model Array
var ModelArray = ["https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/chair.glb","officechair.glb","officechair2.glb","officechair3.glb"];
var currentModelIndex = 0;
var currentOption = "0";
console.log("CurrentModelIndex: " + currentModelIndex + " currentOption: " + currentOption );
//Initial Material
const INITIAL_MTL = new THREE.MeshPhongMaterial({ color: 0xf1f1f1, shininess: 10 });

const INITIAL_MAP = [
    { childID: "back", mtl: INITIAL_MTL },
    { childID: "base", mtl: INITIAL_MTL },
    { childID: "cushions", mtl: INITIAL_MTL },
    { childID: "legs", mtl: INITIAL_MTL },
    { childID: "supports", mtl: INITIAL_MTL },
];
//Load model function

loader.load(ModelArray[currentModelIndex], function (gltf) {
    theModel = gltf.scene;

    theModel.traverse((o) => {
        if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
        }
    });

    //Set the models initial scale
    theModel.scale.set(2, 2, 2);

    theModel.rotation.y = Math.PI;

    //Offset the y position a bit
    theModel.position.y = -1;

    //Set initial textures
    for (let object of INITIAL_MAP) {
        initColor(theModel, object.childID, object.mtl);
    }

    //Add the model to the scene
    scene.add(theModel);
    // Remove the loader
    LOADER.remove();

}, undefined, function (error) {
    console.error(error)
});

//Funtion - Add the textures to the models
function initColor(parent, type, mtl) {
    parent.traverse((o) => {
        if (o.isMesh) {
            if (o.name.includes(type)) {
                o.material = mtl;
                o.nameID = type;
            }
        }
    });
}

//Add Lights
var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemiLight.position.set(0, 50, 0);
//Add hemisphere light to scene
scene.add(hemiLight);

var dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = true;
dirLight.castShadow.mapSize = new THREE.Vector2(1024, 1024);
//Add directional light to scene
scene.add(dirLight);

//Floor
var floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
var floorMaterial = new THREE.MeshPhongMaterial({
    color: 0xeeeeee,
    shininess: 0
});

var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -0.5 * Math.PI;
floor.receiveShadow = true;
floor.position.y = -1;
scene.add(floor);


//Add controls
var controls = new THREE.OrbitControls( camera, renderer.domElement );
//controls.maxPolarAngle = Math.PI / 2;
//controls.minPolarAngle = Math.PI / 3;
//controls.enableDampings = true;
//controls.dampingFactor = 0.1;
//controls.autoRotate = false;
//controls.autoRotateSpeed = 0.2;

function animate() {

    //controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    if (theModel != null && loaded == false) {
        initialRotation();
        DRAG_NOTICE.classList.add('start');
    }
}

animate();

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var canvasPixelWidth = canvas.width / window.devicePixelRatio;
    var canvasPixelHeight = canvas.height / window.devicePixelRatio;

    const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {

        renderer.setSize(width, height, false);
    }
    return needResize;
}

//Function - Build Colors
function buildColors(colors) {
    for (let [i, color] of colors.entries()) {
        let swatch = document.createElement('div');
        swatch.classList.add('tray__swatch');

        if (color.texture) {
            swatch.style.backgroundImage = "url(" + color.texture + ")";
        } else {
            swatch.style.background = "#" + color.color;
        }

        swatch.setAttribute('data-key', i);
        TRAY.append(swatch);
    }
}
buildColors(colors);

const options = document.querySelectorAll(".option");

for (const option of options) {
    option.addEventListener('click', selectOption);
}

function selectOption(e) {
    let option = e.target;
    activeOption = e.target.dataset.option;
    for (const otherOption of options) {
        otherOption.classList.remove('--is-active');
    }
    option.classList.add('--is-active');
}

const options2 = document.querySelectorAll(".option2");

for (const option of options2) {
    option.addEventListener('click',selectOption2);
}

function selectOption2(e) {
    console.log("CurrentOption " + currentOption + " DatasetOption: " + e.target.dataset.option);
    
    let option2 = e.target;
    currentOption = e.target.dataset.option;
    for(const otherOption2 of options2) {
        otherOption2.classList.remove('--is-active');
    }
    option2.classList.add('--is-active');

    if (parseInt(currentOption) != currentModelIndex) {
        
        scene.remove(theModel);
        currentModelIndex = parseInt(currentOption);
        loader.load(ModelArray[currentModelIndex], function (gltf) {
            theModel = gltf.scene;
        
            theModel.traverse((o) => {
                if (o.isMesh) {
                    o.castShadow = true;
                    o.receiveShadow = true;
                }
            });
        
            //Set the models initial scale
            theModel.scale.set(2, 2, 2);
        
            theModel.rotation.y = Math.PI;
        
            //Offset the y position a bit
            theModel.position.y = -1;
        
            //Set initial textures
            for (let object of INITIAL_MAP) {
                initColor(theModel, object.childID, object.mtl);
            }
        
            //Add the model to the scene
            scene.add(theModel);
            // Remove the loader
            //LOADER.remove();
        
        }, undefined, function (error) {
            console.error(error)
        });
    }


}


// Swatches
const swatches = document.querySelectorAll(".tray__swatch");

for (const swatch of swatches) {
    swatch.addEventListener('click', selectSwatch);
}

function selectSwatch(e) {
    let color = colors[parseInt(e.target.dataset.key)];
    let new_mtl;

    if (color.texture) {

        let txt = new THREE.TextureLoader().load(color.texture);

        txt.repeat.set(color.size[0], color.size[1], color.size[2]);
        txt.wrapS = THREE.RepeatWrapping;
        txt.wrapT = THREE.RepeatWrapping;

        new_mtl = new THREE.MeshPhongMaterial({
            map: txt,
            shininess: color.shininess ? color.shininess : 10
        });
    }
    else {
        new_mtl = new THREE.MeshPhongMaterial({
            color: parseInt('0x' + color.color),
            shininess: color.shininess ? color.shininess : 10

        });
    }

    setMaterial(theModel, activeOption, new_mtl);
}

function setMaterial(parent, type, mtl) {
    parent.traverse((o) => {
        if (o.isMesh && o.nameID != null) {
            if (o.nameID == type) {
                o.material = mtl;
            }
        }
    });
}
// Function - Opening rotate
let initRotate = 0;

function initialRotation() {
    initRotate++;
    if (initRotate <= 120) {
        theModel.rotation.y += Math.PI / 60;
    } else {
        loaded = true;
    }
}
var slider = document.getElementById('js-tray'), sliderItems = document.getElementById('js-tray-slide'), difference;

function slide(wrapper, items) {
    var posX1 = 0,
        posX2 = 0,
        posInitial,
        threshold = 20,
        posFinal,
        slides = items.getElementsByClassName('tray__swatch');

    // Mouse events
    items.onmousedown = dragStart;

    // Touch events
    items.addEventListener('touchstart', dragStart);
    items.addEventListener('touchend', dragEnd);
    items.addEventListener('touchmove', dragAction);


    function dragStart(e) {
        e = e || window.event;
        posInitial = items.offsetLeft;
        difference = sliderItems.offsetWidth - slider.offsetWidth;
        difference = difference * -1;

        if (e.type == 'touchstart') {
            posX1 = e.touches[0].clientX;
        } else {
            posX1 = e.clientX;
            document.onmouseup = dragEnd;
            document.onmousemove = dragAction;
        }
    }

    function dragAction(e) {
        e = e || window.event;

        if (e.type == 'touchmove') {
            posX2 = posX1 - e.touches[0].clientX;
            posX1 = e.touches[0].clientX;
        } else {
            posX2 = posX1 - e.clientX;
            posX1 = e.clientX;
        }

        if (items.offsetLeft - posX2 <= 0 && items.offsetLeft - posX2 >= difference) {
            items.style.left = (items.offsetLeft - posX2) + "px";
        }
    }

    function dragEnd(e) {
        posFinal = items.offsetLeft;
        if (posFinal - posInitial < -threshold) { } else if (posFinal - posInitial > threshold) {

        } else {
            items.style.left = (posInitial) + "px";
        }

        document.onmouseup = null;
        document.onmousemove = null;
    }

}

slide(slider, sliderItems);
