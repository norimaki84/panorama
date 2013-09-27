window.onload = function () {

	if(!Detector.webgl) Detector.addGetWebGLMessage();

	var renderer, scene, fov, camera, ambient, geometry, material, mesh, baseTime
	isUserInteracting = false,
	onMouseDownMouseX = 0, onMouseDownMouseY = 0,
	lon = 0, onMouseDownLon = 0,
	lat = 0, onMouseDownLat = 0,
	phi = 0, theta = 0;

	//レンダラの初期化
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	//                        色        α
	renderer.setClearColor(0x000000, 1);
	document.body.appendChild(renderer.domElement);

	//シーンの作成
	scene = new THREE.Scene();

	//カメラの作成

	fov = 72;

    //                                  　　　　　　　　 画角１A 　　　　　　　　　アスペクト比１A
	camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 10000);
	   
	camera.position = new THREE.Vector3(0, 1, -1);
	camera.target = new THREE.Vector3( 0, 0, 0 );
	camera.lookAt(camera.target);
	scene.add(camera);


	ambient = new THREE.AmbientLight(0xFFFFFF);
	scene.add(ambient);

	
	//npoint=[x:i,y:j,現在の向き];

	  


	// 表示する物体の作成
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
	scene.add(mesh01);

	mesh01.position.x=0;
	mesh01.position.y=0;
	mesh01.position.z=0;

//ボタン
	var yomicomi =document.getElementById("yomicomi");
		yomicomi.addEventListener("click" , a, true);
		
    function a(){
	 
		geometry02 = new THREE.SphereGeometry(
			radius,
			  segmentsWidth,
			  segmentsHeight,
			  phiStart,
			  phiLength,
			  thetaStart,
			  thetaLength
		);
		console.log("ああ");
		
		material02 = new THREE.MeshBasicMaterial({
			overdraw: true,
			
			map: THREE.ImageUtils.loadTexture('images/2222.jpg', new THREE.UVMapping(), function() { 
				material02.side = THREE.BackSide;
				mesh02 = new THREE.Mesh(geometry02, material02);

				mesh02.position.x=5;
				mesh02.position.y=0;
				mesh02.position.z=5;
	
				scene.add(mesh02);})
		});
	}
	
	//毎フレーム
	
	dy = point[1].y - point[0].y;
	dx = point[1].x - point[0].x;
	duration =3000;
	now =0;
	next = 1;
	t =0;
	毎フレームwhile(t < duration){
				x =( point[0].x + (point[1].x - point[0].x)) * t / duration;
				y =( point[0].y + (point[1].y - point[0].y)) * t / duration;
				t　+=1 /frameRate;
				//x,yの場所にカメラ移動して描画
			}
	
	
	//ポイント(カメラの位置、注視点)移動
	document.onkeydown = function(e) { 
		if (keychar == "x") {
			//
			var rad =  deg * (Math.PI / 180);
			//例；ｐ1＝(0、０、０)、ｐ２＝(５、０、５)
			//θの計算式
			var angle = Math.atan( (a2*y - a1*y) /  (b2*x - b1*x));
			
			
			
			
	} 
	
	
	
	
	//レンダリング
	baseTime = +new Date;

	function render() {
		requestAnimationFrame(render);
		//mesh.rotation.y = 0.3 * (+new Date - baseTime) / 1000;
		renderer.render(scene, camera);
	};

	render();

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
	      camera.updateProjectionMatrix();
	      renderer.setSize( window.innerWidth, window.innerHeight );
	};


	function onDocumentMouseDown( event ) {
		event.preventDefault();
	    	isUserInteracting = true;
	    	onPointerDownPointerX = event.clientX;
	    	onPointerDownPointerY = event.clientY;
	    	onPointerDownLon = lon;
	    	onPointerDownLat = lat;


	    	lat = Math.max( - 85, Math.min( 85, lat ) );
	    	phi = ( 90 - lat ) * Math.PI / 180;
	    	theta = lon * Math.PI / 180;
	    	camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
	    	camera.target.y = 500 * Math.cos( phi );
	    	camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );
	    	camera.lookAt( camera.target );
	};

	function onDocumentMouseMove( event ) {
		if ( isUserInteracting ) {
	      lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
	      lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
		}

	    	lat = Math.max( - 85, Math.min( 85, lat ) );
	    	phi = ( 90 - lat ) * Math.PI / 180;
	    	theta = lon * Math.PI / 180;
	    	camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
	    	camera.target.y = 500 * Math.cos( phi );
	    	camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );
	    	camera.lookAt( camera.target );
	};

	function onDocumentMouseUp( event ) {
		isUserInteracting = false;
	};


	/*
	function onDocumentMouseWheel( event ) {
		var fovMin = 0.1, fovMax = 150;
	    	// WebKit
	    	if ( event.wheelDeltaY ) {
	      	fov -= event.wheelDeltaY * 0.05;
	      // Opera / Explorer 9
	    	} else if ( event.wheelDelta ) {
	      	fov -= event.wheelDelta * 0.05;
	    	// Firefox
	    	} else if ( event.detail ) {
	      	fov += event.detail * 1.0;
	    	}
	    	if (fov < fovMin) {
	      	fov = fovMin;
	    	}
	    	if (fov > fovMax) {
	      	fov = fovMax;
	    	}
	    	camera.projectionMatrix.makePerspective( fov, window.innerWidth / window.innerHeight, 0.1, 10000 );
	    	render();
     };
	*/

	
	window.addEventListener( 'mousedown', onDocumentMouseDown, false );
	window.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'mouseup', onDocumentMouseUp, false );
	//window.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
	//window.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false);
	window.addEventListener( 'resize', onWindowResize, false );
};