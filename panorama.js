/*jslint browser:true */
/*global Deferred, Detector, THREE, frameRate, keychar, requestAnimationFrame, jQuery, console */
var maps, points, links, date, next, modals, mapsFile, linksFile, pointsFile, dateFile, modalsFile,
    renderer, scene, camera,
    initPanorama,
    detectSupportWebGL,
    initRenderer,
    createScene,
    createLight,
    createCamera,
    createSourceObject,
    createDestinationObject,
    createKeyEvent,
    moveFlag,
    rightMoveFlag,
    leftMoveFlag,
    loadingFlag,
    create = true,
    isUserInteracting = false;

var detectSupportWebGL = function () {
    'use strict';

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }
};

var initRenderer = function () {
    'use strict';
    //レンダラの初期化
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 色 α
    renderer.setClearColor(0x000000, 1);
    document.body.appendChild(renderer.domElement);
};

var createScene = function () {
    'use strict';
    scene = new THREE.Scene();
};

var createLight = function () {
    'use strict';
    var ambient = new THREE.AmbientLight(0xFFFFFF);
    scene.add(ambient);
};

var createCamera = function () {
    'use strict';
    var fov;

    //カメラの作成
    fov = 72;
    // 画角１A アスペクト比１A
    camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 10000);
    //カメラ初期化
    camera.position = new THREE.Vector3(0, 1, -1);//カメラの初期位置
    camera.target = new THREE.Vector3(0, 0, 0);//カメラの注視点
    camera.lookAt(camera.target);
    scene.add(camera);
};

var createSourceObject = function () {
    'use strict';
    // 初期位置の物体の作成
    var radius = 1,
        segmentsWidth = 32,
        segmentsHeight = 16,
        phiStart = 0,
        phiLength = 2 * Math.PI,
        thetaStart = 1,
        thetaLength = Math.PI - 2 * thetaStart,
        geometry01,
        material01,
        mesh01;

    geometry01 = new THREE.SphereGeometry(
        radius,
        segmentsWidth,
        segmentsHeight,
        phiStart,
        phiLength,
        thetaStart,
        thetaLength
    );

    material01 = new THREE.MeshBasicMaterial({
        overdraw: true,
        map: THREE.ImageUtils.loadTexture(points[1].img)
    });

    material01.side = THREE.BackSide;
    mesh01 = new THREE.Mesh(geometry01, material01);

    mesh01.position.x = points[1].x;
    mesh01.position.y = points[1].y;
    //mesh01.position.z = point[start].z;
    console.log(mesh01.position.x);
    console.log(mesh01.position.y);
    console.log(mesh01.position.z);

    scene.add(mesh01);
};

var createDestinationObject = function () {
    'use strict';
    var radius = 1,
        segmentsWidth = 32,
        segmentsHeight = 16,
        phiStart = 0,
        phiLength = 2 * Math.PI,
        thetaStart = 1,
        thetaLength = Math.PI - 2 * thetaStart,
        geometry02,
        material02,
        mesh02;

    //移動先の物体生成
    geometry02 = new THREE.SphereGeometry(
        radius,
        segmentsWidth,
        segmentsHeight,
        phiStart,
        phiLength,
        thetaStart,
        thetaLength
    );

    material02 = new THREE.MeshBasicMaterial({
        overdraw: true,
        map: THREE.ImageUtils.loadTexture(points[2].img)
    });

    material02.side = THREE.BackSide;
    mesh02 = new THREE.Mesh(geometry02, material02);

    mesh02.position.x = points[2].x;
    mesh02.position.y = points[2].y;
    //mesh02.position.z = point[next].z;

    scene.add(mesh02);

};

var createKeyEvent = function () {
    'use strict';
    //ポイント(カメラの位置、注視点)移動
    document.onkeydown = function () {
        if (keychar === "x") { //キーを押したとき
            if (moveFlag === false && loadingFlag === false) {
                if (create === true) {
                    loadingFlag = true;
                    //物体生成
                    createDestinationObject();
                    loadingFlag = false;
                    moveFlag = true;
                    if (rightMoveFlag === true && leftMoveFlag === true) {
                        loadingFlag = false;
                        moveFlag = false;
                    }
                }
            }
        }
    };
};


var createMouseEvent = function () {
    'use strict';
    var onPointerDownLon = 0,
        onPointerDownLat = 0,
        onPointerDownPointerX = 0,
        onPointerDownPointerY = 0,
        lon = 0,
        lat = 0;

    function onDocumentMouseDown(event) {
        var phi = 0,
            theta = 0;

        event.preventDefault();
        isUserInteracting = true;
        onPointerDownPointerX = event.clientX;
        onPointerDownPointerY = event.clientY;
        onPointerDownLon = lon;
        onPointerDownLat = lat;


        lat = Math.max(-85, Math.min(85, lat));
        phi = (90 - lat) * Math.PI / 180;
        theta = lon * Math.PI / 180;
        camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
        camera.target.y = 500 * Math.cos(phi);
        camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
        camera.lookAt(camera.target);
    }

    function onDocumentMouseMove(event) {
        var phi, theta;
        if (isUserInteracting) {
            lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
            lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
        }

        lat = Math.max(-85, Math.min(85, lat));
        phi = (90 - lat) * Math.PI / 180;
        theta = lon * Math.PI / 180;
        camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
        camera.target.y = 500 * Math.cos(phi);
        camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
        camera.lookAt(camera.target);
    }

    function onDocumentMouseUp() {
        isUserInteracting = false;
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('mousedown', onDocumentMouseDown, false);
    window.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('mouseup', onDocumentMouseUp, false);
    window.addEventListener('resize', onWindowResize, false);
};

var rotating = function () {
    'use strict';
    console.log('rotating');
};

//レンダリング

var render = function () {
    'use strict';
    /*var t,
        x,
        y,
        dx,
        dy,
        duration,
        translateFlag = false,
        rotateFlag = false,
        keydownFlag = false,
        mouseDownFlag = false,
        now,
        next,
        fov; */
    requestAnimationFrame(render);
    renderer.render(scene, camera);


/*
    if (translateFlag === true) {
        //移動処理
        dy = points[next].y - points[now].y;
        dx = points[next].x - points[now].x;
        duration = 3000;
        now = 0;
        next = 1;
        t = 0;

        while (t < duration) {
            x = points[now].x + dx * t / duration;
            y = points[now].y + dy * t / duration;
            t += 1 / frameRate;
            //x,yの場所にカメラを移動
            //カメラの作成
            fov = 72;
            // 画角１A アスペクト比１A
            camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 10000);

            camera.position = new THREE.Vector3(x, y, 0);   //カメラの移動後の位置
            camera.target = new THREE.Vector3(x, y, 0); //カメラの移動後の注視点
            camera.lookAt(camera.target);
            scene.add(camera);
        }
        if (t === duration) {
            translateFlag = true;
        }
    } else if (rotateFlag === true) {
        //回転移動処理
        rotating();

        if (isUserInteracting === false) {
            rotateFlag = false;
        }
    } else if (keydownFlag === true) {
        //平行移動初期化
        dy = points[next].y - points[now].y;
        dx = points[next].x - points[now].x;
        duration = 3000;
        now = 0;
        next = 1;
        t = 0;

        rotateFlag = true;
    } else if (mouseDownFlag === true) {
        //回転移動の初期化
        rotateFlag = true;
    }
*/
};

var initPanorama = function () {
    'use strict';
/*
    var renderer, ambient,
        radius, segmentsWidth, segmentsHeight, phiStart, phiLength, thetaStart, thetaLength,
        geometry01, material01, mesh01,
        geometry02, material02, mesh02,
        creategeometry,
        loadingFlag, moveFlag, rightmoveFlag = false, leftmoveFlag = false,
        create = false;
*/

    console.log('phase 1');
    detectSupportWebGL();
    console.log('phase 2');
    initRenderer();
    console.log('phase 3');
    createScene();
    console.log('phase 4');
    createLight();
    console.log('phase 5');
    createCamera();
    console.log('phase 6');
    createSourceObject();
    console.log('phase 7');
    //createDestinationObject();
    console.log('phase 8');
    createKeyEvent();
    console.log('phase 9');
    createMouseEvent();

};