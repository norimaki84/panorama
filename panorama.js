/*jslint browser:true */
/*global Detector, THREE, frameRate, keychar, requestAnimationFrame */
var point = {},
	start = 0,
	now = 0,
	next = 0;

window.onload = function () {
	'use strict';

	if (!Detector.webgl) { Detector.addGetWebGLMessage(); }

	var renderer, scene, fov, camera, ambient,
		// baseTime,
		isUserInteracting = false,
		lon = 0,
		lat = 0,
		radius, segmentsWidth, segmentsHeight, phiStart, phiLength, thetaStart, thetaLength,
		geometry01, material01, mesh01,
		geometry02, material02, mesh02,
		creategeometry,
		phi = 0, theta = 0,
		loadingFlag, moveFlag, rightmoveFlag = false, leftmoveFlag = false,
		// flag01,
		t,
		// x, y,
		create = false,
		onPointerDownPointerX, onPointerDownPointerY, onPointerDownLat, onPointerDownLon,
		// dx, dy,
		duration;

	//レンダラの初期化
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);

	// 色 α
	renderer.setClearColor(0x000000, 1);
	document.body.appendChild(renderer.domElement);

	//シーンの作成
	scene = new THREE.Scene();

	//カメラの作成
	fov = 72;
	// 画角１A アスペクト比１A
	camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 10000);

	camera.position = new THREE.Vector3(0, 1, -1);   //カメラの初期位置
	camera.target = new THREE.Vector3(0, 0, 0); //カメラの注視点
	camera.lookAt(camera.target);
	scene.add(camera);

	ambient = new THREE.AmbientLight(0xFFFFFF);
	scene.add(ambient);

	// 初期位置の物体の作成
	radius = 1;
	segmentsWidth = 32;
	segmentsHeight = 16;
	phiStart = 0;
	phiLength = 2 * Math.PI;
	thetaStart = 1;
	thetaLength = Math.PI - 2 * thetaStart;

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
		map: THREE.ImageUtils.loadTexture('images/4444.jpg')
	});

	material01.side = THREE.BackSide;
	mesh01 = new THREE.Mesh(geometry01, material01);

	mesh01.position.x = point[start].x;
	mesh01.position.y = point[start].y;
	mesh01.position.z = point[start].z;

	scene.add(mesh01);

	//移動先の物体生成
	creategeometry = function () {
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
			map: THREE.ImageUtils.loadTexture('images/2222.jpg', new THREE.UVMapping(), function () {
				material02.side = THREE.BackSide;
				mesh02 = new THREE.Mesh(geometry02, material02);

				mesh02.position.x = point[next].x;
				mesh02.position.y = point[next].y;
				mesh02.position.z = point[next].z;

				scene.add(mesh02);
				loadingFlag = false;
				moveFlag = true;
			})
		});
	};


	if(translateFlag === ture){
		 移動処理
		 if(移動が完了){
		 	translateFlag === ture;
		 }
	}else if (rotaetFlag = false){
		回転移動処理
		if(MouseUpみたいな){
			rotaetFlag = false;
		}
	}else 
		if(クリック許可　|| keyDown){
			平行移動初期化
			rotaetFlag = true;
		}else if (mouseDown){
			回転移動の初期化
			rotaetFlag = ture;
		} 
	}
	//毎フレームwhile
	// dy = point[next].y - point[now].y;
	// dx = point[next].x - point[now].x;
	duration = 3000;
	now = 0;
	next = 1;
	t = 0;

	while (t < duration) {
		// x = (point[now].x + (point[next].x - point[now].x)) * t / duration;
		// y = (point[now].y + (point[next].y - point[now].y)) * t / duration;
		t += 1 / frameRate;
		//x,yの場所にカメラ移動して描画
	}
	if (t > duration) {
		// flag01 = false;
		t = 0;
	}

	//ポイント(カメラの位置、注視点)移動
	document.onkeydown = function () {
		if (keychar === "x") { //キーを押したとき
			if (moveFlag === false && loadingFlag === false) {
				if (create === true) {
					loadingFlag = true;
					//物体生成
					creategeometry();
					if (rightmoveFlag === true && leftmoveFlag === true) {
						loadingFlag = false;
						moveFlag = false;
					}
				}
			}
		}
	};

	//レンダリング
	// baseTime = new Date();

	function render() {
		requestAnimationFrame(render);
		renderer.render(scene, camera);
	}

	render();

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function onDocumentMouseDown(event) {
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

		if(MouseDownFlag === ture){
			MouseMovelag = true; 
		}
		if(MouseUpFlag === ture){
			MouseMovelag = false;	
		}

	}

	function onDocumentMouseUp() {
		isUserInteracting = false;
	}

	window.addEventListener('mousedown', onDocumentMouseDown, false);
	window.addEventListener('mousemove', onDocumentMouseMove, false);
	window.addEventListener('mouseup', onDocumentMouseUp, false);
	window.addEventListener('resize', onWindowResize, false);
};
