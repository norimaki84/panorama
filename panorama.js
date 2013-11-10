/*jslint browser:true */
/*global Deferred, Detector, THREE, frameRate, keychar, requestAnimationFrame, jQuery, console */

var maps, points, links, date, next, modals, mapsFile, linksFile, pointsFile, dateFile, modalsFile,
    renderer, scene, camera,
    initPanorama, detectSupportWebGL, initRenderer, createScene, createLight,
    setCamera, createCamera, createSphere, addEvents, render,
    isRotating = false,
    isTranslating = false,
    index = 0;

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
            parseInt(points[i].x, 10),
            parseInt(points[i].y, 10),
            parseInt(points[i].z, 10)
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
            map: map,
            side: THREE.BackSide
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
        mesh.position.x = parseInt(points[index].x, 10);
        mesh.position.y = parseInt(points[index].y, 10);
        mesh.position.z = parseInt(points[index].z, 10);

        scene.add(mesh);
    };

    onError = function () {
        console.log('loading error: ' + url);
    };

    map = THREE.ImageUtils.loadTexture(url, mapping, onLoad, onError);
};

addEvents = function () {
    'use strict';
    var isMoving, isTranslating, isRotating, tryTranslatingOn, tryRotatingtingOn,
        resize, keyup, keydown, mouseup, mousedown, mousemove, blured, mouseWheel,
        onPointerDownLon = 0,
        onPointerDownLat = 0,
        onPointerDownPointerX = 0,
        onPointerDownPointerY = 0,
        lon = 0,
        lat = 0;

    isRotating = false;
    isTranslating = false;

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
        //event.preventDefault();
        isTranslating = false;
    };

    keydown = function (event) {
        //event.preventDefault();
        tryTranslatingOn();
        if (isTranslating === true) {
            switch (event.keyCode) {
            case 37:
                setCamera(0);
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

        }
    };

    mouseup = function (event) {
        event.preventDefault();
        isRotating = false;
    };

    mousedown = function (event) {
        var phi, theta;
        event.preventDefault();
        tryRotatingtingOn();

        if (isRotating === true) {
            onPointerDownPointerX = event.clientX;
            onPointerDownPointerY = event.clientY;
            onPointerDownLon = lon;
            onPointerDownLat = lat;

            lat = Math.max(-85, Math.min(85, lat));
            phi = (90 - lat) * Math.PI / 180;
            theta = lon * Math.PI / 180;
            camera.direction.x = Math.sin(phi) * Math.cos(theta);
            camera.direction.y = Math.cos(phi);
            camera.direction.z = Math.sin(phi) * Math.sin(theta);
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

    var dz,
        dx,
        duration,
        now,
        next,
        t,
        x,
        z;

    if (isTranslating === true) {
        //移動処理
        dz = points[next].z - points[now].z;
        dx = points[next].x - points[now].x;
        duration = 3000;
        now = 0;
        next = 1;
        t = 0;

        while (t < duration) {
            x = points[now].x + dx * t / duration;
            z = points[now].z + dz * t / duration;
            t += 1 / frameRate;
            //x,yの場所にカメラを移動
            //カメラの作成
            createCamera();
        }
        if (t === duration) {
            isTranslating = true;
        }
    } else if (isRotating === true) {
        //回転移動処理
        addEvents();
        if (mouseup()){
            isRotating = false;
        }
    } else if (keydownFlag === true) {
        //平行移動初期化
        dz = points[next].z - points[now].z;
        dx = points[next].x - points[now].x;
        duration = 3000;
        now = 0;
        next = 1;
        t = 0;

        isRotating = true;
    } else if (isRotating === true) {
        //回転移動の初期化
        isRotating = true;
    } 

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
    createSphere(2);

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