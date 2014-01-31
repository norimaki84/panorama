/*jslint browser:true, devel:true */
/*global Deferred, next, Detector, THREE, requestAnimationFrame, jQuery, google */

var renderer, scene, camera, currentMesh, nextMesh, nextMeshInitialPosition,
    // データ
    maps, points, links, date, modals,
    // メソッド
    detectSupportWebGL, createMesh, setNextMeshPosition, removeMesh, initRealityWalker, render,
    createArrow, removeArrow, getAngle, createArrows,
    //オブシェクトを格納
    targetList = [],
    // フラグ
    isRotating = false,
    isTranslating = false,
    isLoading = false,
    debug = false, // デバッグ表示しない
    // debug = "centerview", // デバッグ表示: カメラを中心に
    // debug = "birdview", // デバッグ表示: カメラを鳥瞰に
    // パラメータ
    lat, lon,
    duration = 60,
    tick = 0;

// WebGLへの対応のチェック
detectSupportWebGL = function () {
    'use strict';
    var result;
    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
        result = false;
    } else {
        result = true;
    }
    return result;
};

// 次のメッシュの位置座標を設定する
setNextMeshPosition = function (index) {
    'use strict';
    var currentPosition, nextPosition, direction;

    // 次のメッシュを2倍以上に拡大する
    nextMesh.scale.set(2.1, 2.1, 2.1);

    // 現在の位置座標を取得
    currentPosition = new THREE.Vector3(
        parseFloat(points[currentMesh.index].x, 10),
        parseFloat(points[currentMesh.index].y, 10),
        parseFloat(points[currentMesh.index].z, 10)
    );

    // 次の位置座標を取得
    nextPosition = new THREE.Vector3(
        parseFloat(points[index].x, 10),
        parseFloat(points[index].y, 10),
        parseFloat(points[index].z, 10)
    );

    // 次のメッシュの位置を計算
    direction = new THREE.Vector3();
    direction.subVectors(nextPosition, currentPosition);
    direction.normalize();

    // 次のメッシュの位置を設定
    nextMesh.position = direction;
    nextMeshInitialPosition = direction;
};

// メッシュを削除
removeMesh = function (mesh) {
    'use strict';
    scene.remove(mesh);
};

//リンク先ポインタ表示(矢印)
createArrow = function (angle) {
    'use strict';

   // console.log(angle);

    var geometry01, geometry02,
        material01, material02,
        mesh01, mesh02,
        cube01, cube02,
        scene,
        r = 0.8,
        group;

    geometry01 = new THREE.CubeGeometry(0.03, 0.02, 0.09); // 立方体作成01
    material01 = new THREE.MeshBasicMaterial({color: 0x0000aa}); // 材質作成
    mesh01     = new THREE.Mesh(geometry01, material01); // 立方体01と材質を結びつけてメッシュ作成
    mesh01.position = new THREE.Vector3(-0.03, 0, 0);
    cube01 = mesh01;

    geometry02 = new THREE.CubeGeometry(0.09, 0.02, 0.03); // 立方体作成02
    material02 = new THREE.MeshBasicMaterial({color: 0x0000aa}); // 材質作成
    mesh02     = new THREE.Mesh(geometry02, material02); // 立方体02と材質を結びつけてメッシュ作成
    mesh02.position = new THREE.Vector3(0, 0, -0.03);
    cube02 = mesh02;

    scene = new THREE.Scene(); // シーン作成
    group = new THREE.Object3D();
    group.add(cube01);
    group.add(cube02);

    group.position = new THREE.Vector3(r * Math.cos(angle / 180 * Math.PI), -0.2, r * Math.sin(angle / 180 * Math.PI));　//ポインタの座標
    group.rotation.set(0, (225 - angle) / 180, 0); //ｙ軸を中心に180度か移転

    scene.add(group); // シーンにメッシュ追加
};

//リンク先ポインタ削除
removeArrow = function (arrow) {
    'use strict';
    scene.remove(arrow);
};

getAngle = function (srcIndex, destIndex) {
    'use strict';

    var srcLat, srcLng, srcLatLng,
        destLat,　destLng,
        destLatLng;



    srcLat = parseFloat(points[srcIndex].lat, 10);
    srcLng = parseFloat(points[srcIndex].lng, 10);
    srcLatLng = new google.maps.LatLng(srcLat, srcLng);

    console.log(srcLatLng);

    destLat = parseFloat(points[destIndex].lat, 10);
    destLng = parseFloat(points[destIndex].lng, 10);
    destLatLng = new google.maps.LatLng(destLat, destLng);

    return google.maps.geometry.spherical.computeHeading(srcLatLng, destLatLng);
};

createArrows = function ()　{
    'use strict';

    console.log("createArrows");

    var index, i, id, dest, angle, j;

    index = currentMesh.index;
    console.log(points);

    id = points[index].id;
    console.log(points[index].id);

    for (i = 0; i < links.length; i += 1) {
        console.log('for01');
        console.log(links[i].from);
        //console.log(id);
        if (links[i].from === id) {
            console.log('if01');
            dest = links[i].to;
            for (j = 0; j < points.length; j += 1) {
                if (points[j].id === dest) {
                    angle = getAngle(index, j);
                    createArrow(angle);
                    break;
                }
            }
        } else if (links[i].to === id) {
            dest = links[i].from;
            for (j = 0; j < points.length; j += 1) {
                if (points[j].id === dest) {
                    angle = getAngle(index, j);
                    createArrow(angle);
                    break;
                }
            }
        }
    }

};

// メッシュの生成
createMesh = function (order, index) {
    'use strict';

    var geometry, material, mesh,
        url, mapping, onLoad, onError, map,
        radius = 1,
        widthSegments = 32,
        heightSegments = 16,
        phiStart = 0,
        phiLength = 2 * Math.PI,
        thetaStart = 0,
        thetaLength = Math.PI,
        matrix;

    if (order === 'next') {
        isLoading = true;
    }

    url = points[index].img;
    phiStart = (parseFloat(points[index].phiStart, 10) - 180) / 360 * 2 * Math.PI;
    mapping = undefined;

    onLoad = function () {
        // テクスチャーのサイズから幾何を計算
        thetaLength = 2 * map.image.height / map.image.width * Math.PI;
        if (thetaLength > Math.PI) {
            thetaLength = Math.PI;
        }

        thetaStart = (Math.PI - thetaLength) / 2;

        // 材質を生成
        material = new THREE.MeshBasicMaterial({
            transparent: true,
            map: map,
            side: THREE.DoubleSide
        });

        // 形状を生成
        geometry = new THREE.SphereGeometry(
            radius,
            widthSegments,
            heightSegments,
            phiStart,
            phiLength,
            thetaStart,
            thetaLength
        );

        // 球体の内側と外側を反転
        matrix = new THREE.Matrix4().makeScale(1, 1, -1);
        geometry.applyMatrix(matrix);

        // メッシュを生成
        mesh = new THREE.Mesh(geometry, material);

        // メッシュのインデックスを設定
        mesh.index = index;

        if (order === 'current') {
            mesh.name = 'current';
            currentMesh = mesh;
            createArrows();
        } else if (order === 'next') {
            mesh.name = 'next';
            nextMesh = mesh;
            setNextMeshPosition(index);
            isLoading = 'finished';
        }

        //scene.add(mesh);
    };

    onError = function () {
        console.log('loading error: ' + url);
    };

    map = THREE.ImageUtils.loadTexture(url, mapping, onLoad, onError);
};

// RealityWalkerの初期化
initRealityWalker = function () {
    'use strict';

    var createRenderer, createScene, createCamera, addEventHandlers;

    // レンダラーの生成
    createRenderer = function () {
        //レンダラの初期化
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        // 色とα
        renderer.setClearColor(0x000000, 1);
        document.body.appendChild(renderer.domElement);
    };

    // シーンの生成
    createScene = function () {
        scene = new THREE.Scene();
    };

    // カメラの生成
    createCamera = function () {
        var fov = 50,
            aspect = window.innerWidth / window.innerHeight,
            near = 0.1,
            far = 1000,
            phi,
            theta;

        camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

        lat = 0;
        lon = 0;

        // 緯度経度からθφを導出
        phi   = (90 - lat) * Math.PI / 180;
        theta = lon * Math.PI / 180;

        camera.lookAt({
            x: Math.sin(phi) * Math.cos(theta),
            y: Math.cos(phi),
            z: Math.sin(phi) * Math.sin(theta)
        });

        scene.add(camera);
    };


    // イベントの追加
    addEventHandlers = function () {
        var isMoving, tryTranslatingOn, tryRotatingtingOn,
            resize, keyup, keydown, mouseup, mousedown, mousemove, blured, mouseWheel,
            // 座標関係パラメータ
            onPointerDownLon = 0,
            onPointerDownLat = 0,
            onPointerDownPointerX = 0,
            onPointerDownPointerY = 0;

        // 移動中か否かの判定
        isMoving = function () {
            var result;
            if (isRotating === true || isTranslating === true || isLoading === true) {
                result = true;
            } else {
                result = false;
            }
            return result;
        };

        // 並行移動への移行を試行
        tryTranslatingOn = function (index) {
            // 移動中でなく、並行移動先が現在と同じ場所でなければ
            if (!isMoving()) {
                if (currentMesh.index !== index) {
                    if (points.hasOwnProperty(index)) {
                        createMesh('next', index);
                    } else {
                        console.log('no index: ' + index);
                    }
                } else {
                    console.log('same index: ' + index);
                }
            }
        };

        // 回転への移行を試行
        tryRotatingtingOn = function () {
            if (!isMoving()) {
                isRotating = true;
            }
        };

        // ウィンドウサイズの変更
        resize = function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        // キーをはなしたとき
        keyup = function (event) {
            event.preventDefault();
        };

        // キーを押したとき
        keydown = function (event) {
            event.preventDefault();
            switch (event.keyCode) {
            case 37:
                console.log('left');
                tryTranslatingOn(0);
                break;
            case 38:
                console.log('forward');
                tryTranslatingOn(1);
                break;
            case 39:
                console.log('right');
                tryTranslatingOn(2);
                break;
            case 40:
                console.log('backward');
                break;
            default:
                console.log('other key');
                break;
            }
        };

        // マウスボタンをはなしたら
        mouseup = function (event) {
            event.preventDefault();
            isRotating = false;
        };

        // マウスボタンを押したら
        mousedown = function (event) {
            event.preventDefault();
            tryRotatingtingOn();

            // 回転モードに入ったら
            if (isRotating === true) {
                // 現在のマウスの位置を記録
                onPointerDownPointerX = event.clientX;
                onPointerDownPointerY = event.clientY;
                // 現在の注視点の方向を記録
                onPointerDownLon = lon;
                onPointerDownLat = lat;
            }
        };

        mousemove = function (event) {
            var phi, theta;
            event.preventDefault();

            // 回転モードだったら
            if (isRotating === true) {
                // 緯度経度を計算
                lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
                lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
                lat = Math.max(-85, Math.min(85, lat));

                // φとθを計算
                phi = (90 - lat) * Math.PI / 180;
                theta = lon * Math.PI / 180;

                // カメラの注視点を設定
                camera.lookAt({
                    x: Math.sin(phi) * Math.cos(theta),
                    y: Math.cos(phi),
                    z: Math.sin(phi) * Math.sin(theta)
                });
            }
        };

        // マウスが画面外に出たら
        blured = function () {
            isRotating = false;
        };

        // マウスホイールの回転
        mouseWheel = function (event) {
            var fov = camera.fov, fovMin = 20, fovMax = 150;
            if (!isMoving()) {
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
            }
        };
/*
        //マウスクリックの取得(リンク先ポインタをクリックした時)
        mouseclick = function (event){
            var projector = new THREE.Projector();

            if (ev.target == renderer.domElement) { 

                var recr, ray, obj;

                //マウス座標2D変換
                rect = ev.target.getBoundingClientRect();    
                mouse.x =  ev.clientX - rect.left;
                mouse.y =  ev.clientY - rect.top;
                
                //マウス座標3D変換 width（横）やheight（縦）は画面サイズ
                mouse.x =  (mouse.x / width) * 2 - 1;           
                mouse.y = -(mouse.y / height) * 2 + 1;
                
                // マウスベクトル
                var vector = new THREE.Vector3( mouse.x, mouse.y ,1);

               // vector はスクリーン座標系なので, オブジェクトの座標系に変換
                projector.unprojectVector( vector, camera );

                // 始点, 向きベクトルを渡してレイを作成
                ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
                
                 // クリック判定
                obj = ray.intersectObjects( targetList );
                
                 // クリックしていたら、alertを表示  
                if ( obj.length > 0 ){                       
                  
                  alert("click!!")
                  
                } 

            }
        }; 
*/
        // イベントハンドラの登録
        jQuery(window).bind('resize',    function (event) { resize(event); });
        jQuery(window).bind('keyup',     function (event) { keyup(event); });
        jQuery(window).bind('keydown',   function (event) { keydown(event); });
        jQuery(window).bind('mousedown', function (event) { mousedown(event); });
        jQuery(window).bind('mouseup',   function (event) { mouseup(event); });
        jQuery(window).bind('mousemove', function (event) { mousemove(event); });
        jQuery(window).bind('blur',      function (event) { blured(event); });

        window.addEventListener('mousewheel', mouseWheel, false);
        window.addEventListener('DOMMouseScroll', mouseWheel, false);
    };

    // メインプログラム
    createRenderer();
    createScene();
    createCamera();
    createMesh('current', 0);
    addEventHandlers();
    render();
};

//レンダリング
render = function () {
    'use strict';
    var ratio, // 比率
        nextMeshPosition; // 次のメッシュの位置

    requestAnimationFrame(render);

    // テクスチャーのロードが終わったら
    if (isLoading === 'finished') {
        isTranslating = true;
        isLoading = false;
        tick = 0;
    }

    // 並行移動
    if (isTranslating === true) {
        tick += 1;

        if (tick >= duration) {
            //リンク先ポインタを削除
            removeArrow();

            // メッシュを削除
            removeMesh(currentMesh);
            removeMesh(nextMesh);

            // 次のメッシュの形状と材質から現在のメッシュを生成
            currentMesh = new THREE.Mesh(nextMesh.geometry, nextMesh.material);

            currentMesh.index = nextMesh.index;
            currentMesh.opacity = 1;
            currentMesh.name = 'current';

            scene.add(currentMesh);

            //リンク先ポインタを新たに生成
            createArrows();

            isTranslating = false;
        } else {
            ratio = tick / duration;

            // 現在のメッシュの不透明度
            currentMesh.material.opacity = 1 - ratio;

            // 次のメッシュの最終移動位置
            nextMeshPosition = nextMeshInitialPosition.clone();

            // 次のメッシュの位置をずらす
            nextMesh.position = nextMeshPosition.multiplyScalar(1 - ratio);
        }
    }

    // デバッグ時のカメラの設定
    if (debug === "birdview") {
        // 鳥瞰モード
        camera.position = new THREE.Vector3(-5, 10, -5);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    } else if (debug === "centerview") {
        // 中心表示モード
        camera.position = new THREE.Vector3(0, 0, 0);
        camera.lookAt(new THREE.Vector3(1, 0, 0));
    }

    renderer.render(scene, camera);
};

jQuery(document).ready(function () {
    'use strict';
    // データファイルの指定
    var pointsFile = 'points.json',
        mapsFile = 'maps.json',
        linksFile = 'links.json',
        dateFile = 'date.json',
        modalsFile = 'modals.json';

    // WebGLのサポートのチェック
    if (detectSupportWebGL()) {
        // データファイルのロード
        Deferred.define();

        next(function () {
            return jQuery.getJSON(mapsFile, { format: 'json' }, function (json) {
                maps = json;
            });
        }).error(function () {
            window.alert("エラー: maps.json");
        }).next(function () {
            return jQuery.getJSON(pointsFile, { format: 'json' }, function (json) {
                points = json;
            });
        }).error(function () {
            window.alert("エラー: points.json");
        }).next(function () {
            return jQuery.getJSON(linksFile, { format: 'json' }, function (json) {
                links = json;
            });
        }).error(function () {
            window.alert("エラー: links.json");
        }).next(function () {
            return jQuery.getJSON(dateFile, { format: 'json' }, function (json) {
                date = json;
            });
        }).error(function () {
            window.alert("エラー: date.json");
        }).next(function () {
            return jQuery.getJSON(modalsFile, { format: 'json' }, function (json) {
                modals = json;
            });
        }).error(function () {
            window.alert("エラー: modals.json");
        }).next(function () {
            // データファイルのロードが成功
            initRealityWalker();
        });

    }
});
