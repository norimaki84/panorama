/*jslint browser:true */
/*global Deferred, Detector, THREE, frameRate, keychar, requestAnimationFrame, jQuery, console */

var maps, points, links, date, next, modals, mapsFile, linksFile, pointsFile, dateFile, modalsFile,
    renderer, scene, camera,
    initPanorama, detectSupportWebGL, initRenderer, createScene, createLight,
    setCamera, createCamera, createSphere, addEvents, render,
    isRotating = false,
    isTranslating = false,
    duration,
    tick = duration,
    t = 0,
    isZooming = false,
    direction,
    index = 0,
    material, currentMesh, nextMesh;

detectSupportWebGL = function () {
    'use strict';

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }
};

initRenderer = function () {
    'use strict';
    //レンダラの初期化
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 色 α
    renderer.setClearColor(0x000000, 1);
    document.body.appendChild(renderer.domElement);
};

createScene = function () {
    'use strict';
    scene = new THREE.Scene();
};

createLight = function () {
    'use strict';
    var ambient = new THREE.AmbientLight(0xFFFFFF);
    scene.add(ambient);
};

setCamera = function (i) {
    'use strict';
    var lookAt;

    if (arguments.length === 1) {
        console.log('index:' + i);
        index = i;
        camera.position = new THREE.Vector3(
            parseFloat(points[i].x, 10),
            parseFloat(points[i].y, 10),
            parseFloat(points[i].z, 10)
        );
    }

    lookAt = new THREE.Vector3(
        camera.position.x + camera.direction.x,
        camera.position.y + camera.direction.y,
        camera.position.z + camera.direction.z
    );
    // console.log(camera.position);
    // console.log(camera.direction);
    // console.log(lookAt);

    camera.lookAt(lookAt);
};

createCamera = function () {
    'use strict';
    var fov;

    //カメラの作成
    fov = 50;

    // 画角１A アスペクト比１A
    //カメラ初期化
    camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.direction = new THREE.Vector3(1, 0, 0);
    // console.log(index);
    setCamera(index);
    scene.add(camera);
};

createSphere = function (index) {
    'use strict';
    // 物体の作成
    var geometry, material, mesh,
        url, mapping, onLoad, onError, map,
        radius = 1,
        widthSegments = 32,
        heightSegments = 16,
        phiStart = 0,
        phiLength = 2 * Math.PI,
        thetaStart = 0,
        thetaLength = Math.PI;

    url = points[index].img;
    mapping = undefined;

    onLoad = function () {
        // console.log('loading: ' + url);
        // console.log('width: ' + map.image.width);
        // console.log('height: ' + map.image.height);

        thetaLength = 2 * map.image.height / map.image.width * Math.PI;
        if (thetaLength > Math.PI) {
            thetaLength = Math.PI;
        }

        thetaStart = (Math.PI - thetaLength) / 2;

        material = new THREE.MeshBasicMaterial({
            overdraw: true,
            //opacity: 0.3,
            transparent: true,
            map: map,
            side: THREE.DoubleSide
        });


        geometry = new THREE.SphereGeometry(
            radius,
            widthSegments,
            heightSegments,
            phiStart,
            phiLength,
            thetaStart,
            thetaLength
        );


        mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = parseFloat(points[index].x, 10);
        mesh.position.y = parseFloat(points[index].y, 10);
        mesh.position.z = parseFloat(points[index].z, 10);
        currentMesh = nextMesh;
        nextMesh = mesh;

        console.log(mesh);

        scene.add(mesh);
    };

    onError = function () {
        console.log('loading error: ' + url);
    };

    map = THREE.ImageUtils.loadTexture(url, mapping, onLoad, onError);
};

addEvents = function () {
    'use strict';
//    var isMoving, isTranslating, isRotating, tryTranslatingOn, tryRotatingtingOn,
    var isMoving, tryTranslatingOn, tryRotatingtingOn,
        resize, keyup, keydown, mouseup, mousedown, mousemove, blured, mouseWheel,
        onPointerDownLon = 0,
        onPointerDownLat = 0,
        onPointerDownPointerX = 0,
        onPointerDownPointerY = 0,
        lon = 0,
        lat = 0;

//    isRotating = false;
//    isTranslating = false;

    isMoving = function () {
        var result;
        if (isRotating === true || isTranslating === true) {
            result = true;
        } else {
            result = false;
        }
        return result;
    };

    tryTranslatingOn = function () {
        if (!isMoving()) {
            isTranslating = true;
            t = 0;
            //currentMesh.material.opacity = 1;
            nextMesh.material.opacity = 0;
        }
    };

    tryRotatingtingOn = function () {
        if (!isMoving()) {
            isRotating = true;
        }
    };

    resize = function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    keyup = function () {
        event.preventDefault();
        //isTranslating = false;
    };

    keydown = function (event) {
        //event.preventDefault();
        switch (event.keyCode) {
        case 37:
            //isTranslating = true;
            tryTranslatingOn();
            direction = 'left';
            console.log('left');
            break;
        case 38:
            setCamera(1);
            console.log('forward');
            break;
        case 39:
            setCamera(2);
            console.log('right');
            break;
        case 40:
            // console.log('backward');
            break;
        default:
            console.log('other key');
            break;

        }
    };

    mouseup = function (event) {
        event.preventDefault();
        isRotating = false;
    };

    mousedown = function (event) {
        event.preventDefault();
        tryRotatingtingOn();

        if (isRotating === true) {
            onPointerDownPointerX = event.clientX;
            onPointerDownPointerY = event.clientY;
            onPointerDownLon = lon;
            onPointerDownLat = lat;

            setCamera();
        }
    };

    mousemove = function (event) {
        var phi, theta;
        event.preventDefault();
        if (isRotating === true) {
            lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
            lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
            lat = Math.max(-85, Math.min(85, lat));
            phi = (90 - lat) * Math.PI / 180;
            theta = lon * Math.PI / 180;
            camera.direction.x = Math.sin(phi) * Math.cos(theta);
            camera.direction.y = Math.cos(phi);
            camera.direction.z = Math.sin(phi) * Math.sin(theta);
            setCamera();
        }
    };

    blured = function () {
        isRotating = false;
    };

    mouseWheel = function (event) {
        var fov, fovMin = 20, fovMax = 150;
        fov = camera.fov;

        // WebKit
        if (event.wheelDeltaY) {
            fov -= event.wheelDeltaY * 0.05;
        // Opera / Explorer 9
        } else if (event.wheelDelta) {
            fov -= event.wheelDelta * 0.05;
        // Firefox
        } else if (event.detail) {
            fov += event.detail;
        }

        if (fov < fovMin) {
            fov = fovMin;
        }
        if (fov > fovMax) {
            fov = fovMax;
        }

        camera.fov = fov;
        camera.updateProjectionMatrix();
    };

    jQuery(window).bind('resize', function (event) { resize(event); });
    jQuery(window).bind('keyup', function (event) { keyup(event); });
    jQuery(window).bind('keydown', function (event) { keydown(event); });
    jQuery(window).bind('mousedown', function (event) { mousedown(event); });
    jQuery(window).bind('mouseup', function (event) { mouseup(event); });
    jQuery(window).bind('mousemove', function (event) { mousemove(event); });
    jQuery(window).bind('blur', function (event) { blured(event); });
    window.addEventListener('mousewheel', mouseWheel, false);
    window.addEventListener('DOMMouseScroll', mouseWheel, false);
};

//レンダリング

render = function () {
    'use strict';
    requestAnimationFrame(render);

    var duration = 3000,
        now = 0,
        next = 1,
        //t = 0,
        dx = 0,
        dz = 0,
        frameRate = 60;

    //console.log('isTranslating=' + isTranslating);
    //console.log("currentMaterial.opacity=" + currentMaterial.opacity);
    //console.log("nextMaterial.opacity=" + nextMaterial.opacity);
    //カメラ移動を計算
    if (isTranslating === true) {
        dx = parseFloat(points[next].x, 10) - parseFloat(points[now].x, 10);
        dz = parseFloat(points[next].z, 10) - parseFloat(points[now].z, 10);

        if (t < duration) {
            //カメラの移動先の位置を計算
            camera.position.x = parseFloat(points[now].x, 10) + dx * t / duration;
            camera.position.z = parseFloat(points[now].z, 10) + dz * t / duration;

/*
            camera.direction.x = -1;
            camera.direction.y = 0;
            camera.direction.z = 0;
*/
/*
            camera.position.x = 4;
            camera.position.z = 4;
            camera.position.y = 5;
            camera.direction.x = -camera.position.x;
            camera.direction.y = -camera.position.y;
            camera.direction.z = -camera.position.z;
            console.log(points[now]);
            console.log(points[next]);
*/
            console.log('t:' + t);
            //console.log("nextMaterial.opacity=" + nextMaterial.opacity);
            console.log('opacity:' + (t/duration));
            nextMesh.material.transparent = true;
            currentMesh.material.transparent = true;
            var opacity = t / duration;
            if (opacity > 1) {
                opacity = 1;
            } else if (opacity < 0) {
                opacity = 0;
            }
            nextMesh.material.opacity = opacity;
            currentMesh.material.opacity = 1 - opacity;
/*
            //x,yの場所にカメラを移動
            if (tick < duration) {
                nextMesh.material.opacity = tick / duration;
                currentMesh.material.opacity = 1 - nextMesh.material.opacity;
                console.log('opacity:' + currentMesh.material.opacity);
                tick += 1;
            }
*/
            setCamera();
            t += 1000 / frameRate;
        } else {
            isTranslating = false;
        }
        console.log("x=" + camera.position.x + ", z=" + camera.position.z);
    }

    //console.log(t);
    renderer.render(scene, camera);
};

initPanorama = function () {
    'use strict';

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
    createSphere(0);

    console.log('phase 7');
    createSphere(1);

    console.log('phase 8');
    //createSphere(2);

    console.log('phase 9');
    addEvents();

    console.log('phase 10');
};


jQuery(document).ready(function () {
    'use strict';

    mapsFile = 'maps.json';
    linksFile = 'links.json';
    pointsFile = 'points.json';
    dateFile = 'date.json';
    modalsFile = 'modals.json';

    Deferred.define();

    next(function () {
        return jQuery.getJSON(mapsFile, { format: 'json' }, function (json) {
            maps = json;
        });
    }).error(function () {
        window.alert("エラー");
    }).next(function () {
        return jQuery.getJSON(pointsFile, { format: 'json' }, function (json) {
            points = json;
        });
    }).error(function () {
        window.alert("エラー");
    }).next(function () {
        return jQuery.getJSON(linksFile, { format: 'json' }, function (json) {
            links = json;
        });
    }).error(function () {
        window.alert("エラー");
    }).next(function () {
        return jQuery.getJSON(dateFile, { format: 'json' }, function (json) {
            date = json;
        });
    }).error(function () {
        window.alert("エラー");
    }).next(function () {
        return jQuery.getJSON(mapsFile, { format: 'json' }, function (json) {
            modals = json;
        });
    }).error(function () {
        window.alert("エラー");
    }).next(function () {
        console.log('finish loading');
        initPanorama();
        render();
    });
});