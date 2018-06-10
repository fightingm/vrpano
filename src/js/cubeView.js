// import {Scene, AmbientLight, PerspectiveCamera, CSS3DRenderer}
import StatsView from './stats';
import utils from './utils';
import CorrectRotation from './correctRotation';
import ManulRotation from './manulRotation';

const stats = new StatsView();

export default class VrViewer {
  constructor(el) {
    // vr全景图的渲染dom
    this.container = el;
    // 记录当前场景的旋转角度
    this.correctRotation = new CorrectRotation(0, 0, 0);
    this.manulRotation = new ManulRotation(180, 0, 0);
    // 横轴锁定
    this.lockX = false;
    this.lockY = false;
    // overlays
    this.overlays = [];

    this.hasInterval = true;

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseWheel = this.handleMouseWheel.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);

    this.init();
  }
  init() {
    // 添加场景
    this.scene = new THREE.Scene();

    // 添加光源
    const light = new THREE.AmbientLight( 0xffffff );
    this.scene.add( light );

    // 设置相机
    const width = this.container.clientWidth,
          height = this.container.clientHeight,
          fov = 90;
    // 创建相机
    let camera = new THREE.PerspectiveCamera( fov, width / height, 1, 1000 );

    this.camera = camera;

    // 创建渲染器
    let renderer = new THREE.CSS3DRenderer();
    renderer.setSize( width, height );
    this.renderer = renderer;

    // 渲染
    this.container.appendChild(renderer.domElement);

    // 初始化陀螺仪
    this.devices = new THREE.DeviceOrientationControls(this.camera);


    // 双屏效果
    this.VRRenderer = new THREE.StereoEffect(this.renderer);

    this.curRenderer = renderer;

    // 添加绑定事件
    this.bindEvents();
  }
  // 每次切换场景的时候要执行的操作
  resetScene(opt) {
    // 先设置相机角度，然后再贴图
    this.setInitRotation(opt);
    // 先把之前的场景删除
    // this.scene.remove( this.sphere );
    // 相机视角恢复
    this.camera.fov = 90;
    this.camera.updateProjectionMatrix();
  }
  getSides(slices) {
    // 前 左 后 右 底 顶
    return [
					{
						url: slices[0],
						position: [ -512, 0, 0 ],
						rotation: [ 0, Math.PI / 2, 0 ]
					},
          {
						url: slices[1],
						position: [ 0, 0, -512 ],
						rotation: [ 0, 0, 0 ]
					},
					{
						url: slices[2],
						position: [ 512, 0, 0 ],
						rotation: [ 0, -Math.PI / 2, 0 ]
					},
          {
						url: slices[3],
						position: [ 0, 0,  512 ],
						rotation: [ 0, Math.PI, 0 ]
					},
          {
						url: slices[4],
						position: [ 0, -512, 0 ],
						rotation: [ - Math.PI / 2, 0, Math.PI/2 ]
					},
					{
						url: slices[5],
						position: [ 0,  512, 0 ],
						rotation: [ Math.PI / 2, 0, -Math.PI/2 ]
					}
				];
  }
  loadImg(src) {
    return new Promise((resolve, reject) => {
      var img = document.createElement('img');
      // img.setAttribute('crossorigin', 'anonymous');
      img.src = src;
      img.onload = () => {
        resolve();
      };
      img.onerror = () => {
        reject();
      };
    });
  }
  setCubeThumb(url) {
    const sides = this.getSides([url, url, url, url, url, url]);
    for ( var i = 0; i < 6; i ++ ) {
      var side = sides[ i ];
      var element = document.createElement( 'div' );
      element.className = `cube_side_${i}`;
      element.style.width = 1026; // 2 pixels extra to close the gap.
      element.style.height = 1026;
      element.style.backgroundSize = 'cover';
      element.style.backgroundImage = `url(${side.url})`;
      element.style.backgroundPositionX = -i*1026 + 'px';
      element.style.backgroundRepeat = 'no-repeat';
      var object = new THREE.CSS3DObject( element );
      object.position.fromArray( side.position );
      object.rotation.fromArray( side.rotation );
      this.scene.add( object );
    }
  }
  setSlices() {
    for ( let i = 0; i < 6; i ++ ) {
      if(this.sliceMap[i]) {
        continue;
      }
      const url = this.slices[i];
      const face = document.querySelector(`.cube_side_${i}`);
      this.loadImg(url).then(() => {
        this.sliceMap[i] = 1;
        face.style.backgroundImage = `url(${url})`;
        face.style.backgroundPositionX = 0;
      });
    }
  }

  setScene(url, slices, opt) {
    this.resetScene(opt);
    // 加载缩略图
    this.setCubeThumb(url);
    if(this.hasInterval) {
      this.render();
      this.hasInterval = false;
    }else {
      // 这里需要手动调用一次，这样才能先渲染场景，然后再渲染overlay
      // 切换场景的时候会导致先添加overlay，然后才会走到requestAnimationFrame，
      // 这时候使用的相机就是之前的相机，
      // 如果之前相机的初始角度和当前相机的初始角度不一致，就会导致overlay的计算结果不在视线范围内
      if(this.isDeviceing) {
        this.curRenderer.render(this.scene, this.camera, (camera) => {
          this.VRcamera = camera;
        });
      }else {
        this.curRenderer.render(this.scene, this.camera);
      }
    }
    opt && opt.cb && opt.cb();
    if(slices) {
      this.slices = slices;
      this.sliceMap = {};
      this.setSlices();
    }else {
      this.slices = false;
      this.sliceMap = {};
    }
    // });
  }
  render() {
    // const testbtn = document.querySelector('.test-btn');
    // const alpha = this.controls.getPolarAngle();
    // const beta = this.controls.getAzimuthalAngle();

    // testbtn.innerHTML = `${alpha}, ${beta}`;
    stats.update();
    if(this.isDeviceing) {
      this.devices.update();
    }else {
      // this.controls.update();
    }

    // this.sphere.geometry.groupsNeedUpdate = true;
    // this.sphere.geometry.uvsNeedUpdate = true;
    if(this.isDeviceing) {
      this.curRenderer.render(this.scene, this.camera, (camera) => {
        this.VRcamera = camera;
      });
    }else {
      this.curRenderer.render(this.scene, this.camera);
    }
    this.updateOverlayPos();
    requestAnimationFrame(this.render.bind(this));
  }

  setXLock(lock) {
    this.lockX = lock;
  }
  setYLock(lock) {
    this.lockY = lock;
  }
  // correctRotation的旋转角度
  setYawRotation(val) {
    this.correctRotation.setAlphaRotation(val);
    // this.correctRotation = [val, this.correctRotation[1], this.correctRotation[2]];
    this.setRotation();
  }
  setRollRotation(val) {
    this.correctRotation.setGammaRotation(val);
    // this.correctRotation = [this.correctRotation[0], this.correctRotation[1], val];
    this.setRotation();
  }
  setPitchRotation(val) {
    this.correctRotation.setBetaRotation(Math.min(Math.max(val, -90), 90));
    // this.correctRotation = [this.correctRotation[0], val, this.correctRotation[2]];
    this.setRotation();
  }
  setRotation() {
    var quat = new THREE.Quaternion();
    var correction = this.correctRotation.getQuat();
    var manual = this.manulRotation.getQuat();
    quat.multiply(correction);
    quat.multiply(manual);
    this.camera.quaternion.copy(quat);
  }

  // 设置初始朝向
  setInitRotation(opt) {
    if(opt.correction) {
      this.correctRotation.reset(opt.correction);
    }
    if(opt.rotation) {
      this.manulRotation.reset(opt.rotation);
      console.log(this.manulRotation);
    }
    var quat = new THREE.Quaternion();
    var correction = this.correctRotation.getQuat();
    var manual = this.manulRotation.getQuat();
    quat.multiply(correction);
    quat.multiply(manual);
    this.camera.quaternion.copy(quat);
  }
  rotateX(deg) {
    this.manulRotation.setBetaRotation(Math.min(Math.max(deg, -90), 90));
    this.setRotation();
  }
  rotateY(deg) {
    this.manulRotation.setAlphaRotation(deg);
    this.setRotation();
  }
  rotateZ(deg) {
  }
  // 场景绑定事件
  bindEvents() {
    window.addEventListener( 'resize', this.handleWindowResize, false );
    this.container.addEventListener('mousedown', this.handleMouseDown);
    this.container.addEventListener('touchstart', this.handleMouseDown);
    this.container.addEventListener('mousewheel', this.handleMouseWheel);
  }
  handleWindowResize() {
    const width = this.container.clientWidth,
          height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.curRenderer.setSize(width, height);
  }
  // 滚轮控制场景缩放
  handleMouseWheel(e) {
    // e.wheelDelta
    if(e.wheelDelta > 0) { //向下滚，放大
      // this.camera.scale.z = Math.max(0.1, this.camera.scale.z - 0.1);
      this.camera.fov = Math.max(65, this.camera.fov - 5);
      this.camera.updateProjectionMatrix();
    } else { // 向上滚，缩小
      // this.camera.scale.z = Math.min(2.5, this.camera.scale.z + 0.1);
      this.camera.fov = Math.min(150, this.camera.fov + 5);
      this.camera.updateProjectionMatrix();

    }
    this.updateOverlayPos();
  }
  // 拖拽控制场景旋转
  handleMouseDown(e) {
    if(this.isDeviceing) return;
    const _this = this;
    const touch = e.touches ? e.touches[0] : e;
    this.initPos = {
      x: touch.clientX,
      y: touch.clientY
    };
    this.startManulRotation = this.manulRotation.getRotation().slice(0);
    console.log('manul', this.startManulRotation);
    this.startCorrectRotation = this.correctRotation.getRotation().slice(0);
    console.log('correction', this.startCorrectRotation);
    // 添加flag一个标识，防止其他地方的mouseup事件在这里触发
    // moving 用来判断当前场景是否正在被拖动
    // let flag = true, moving = false;
    this.flag = true;
    this.moving = false;
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('touchmove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('touchend', this.handleMouseUp);
  }
  handleMouseMove(e) {
    this.moving = true;
    const touch = e.touches ? e.touches[0] : e;
    const x = touch.clientX,
          y = touch.clientY;
    //这里相当于鼠标移动10px,场景选择1deg,显示更加平滑
    const curX = ((this.initPos.x - x)/10 + this.startManulRotation[0]) %360,
          curY = ((y - this.initPos.y)/10 + this.startManulRotation[1]) %360;
    // 横轴锁定
    if(!this.lockX) {
      this.rotateX(curY);
    }
    if(!this.lockY) {
      this.rotateY(curX);
    }
    this.updateOverlayPos();
  }
  handleMouseUp(e) {
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    if(this.flag) {
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('touchmove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);
      document.removeEventListener('touchend', this.handleMouseUp);
      this.flag = false;
      this.moving = false;
    }
  }

  // 场景切换的时候先清空overlay
  clearOverlay() {
    this.overlays.forEach(overlay => {
      overlay.dispose();
    });
    this.overlays = [];
  }
  // 添加overlay
  addOverlay(overlay, notAppend) {
    this.overlays.push(overlay);

    // 1.将2d坐标转换成3d坐标
    // const [x, y] = [100,100];
    // var raycaster = new THREE.Raycaster();
    // var mouseVector = new THREE.Vector2();
    // // 把鼠标坐标转换成webgl的3d坐标，webgl的原点在中心，鼠标坐标的原点在左上角
    // mouseVector.x = 2 * (x / this.dom.clientWidth) - 1;
    // mouseVector.y = - 2 * (y / this.dom.clientHeight) + 1;
    // raycaster.setFromCamera(mouseVector, this.camera);
    // var intersects = raycaster.intersectObjects([this.sphere]);
    // if(intersects.length > 0) {
    //   console.log(intersects[0].point);
    //   overlay.render(this.dom, intersects[0].point);
    //   overlay.updatePosition(this.camera);
    // }
    overlay.render(this.container);
    if(this.isDeviceing) {
      overlay.updatePosition(this.VRcamera)
    }else {
      overlay.updatePosition(this.camera)
    }
  }
  //旋转场景的时候让overlay跟着旋转
  updateOverlayPos() {
    if(this.traveller.glassesButton) {
      this.traveller.glassesButton.setCurrentOverlay(null);
    }
    this.currentOverlay = null;
    this.overlays.forEach(item => {
      if(this.isDeviceing) {
        item.updatePosition(this.VRcamera);
        var position = item.getPosition();
        var {focuserL, focuserW, focuserT, focuserH} = this.traveller.glassesButton.getFocus();

        // var focuserL = 162, focuserW = 50, focuserT = 141, focuserH = 50;
    		if(
    			position[0] > focuserL && position[0] < focuserL + focuserW
    			&&
    			position[1] > focuserT && position[1] < focuserT + focuserH
    		) {
          console.log(focuserL);
          this.traveller.glassesButton.setCurrentOverlay(item);
          this.traveller.glassesButton.startCountMode();
    		}
      }else {
        item.updatePosition(this.camera)
      }
    });
  }

  getContainer() {
    return this.container;
  }
  getSize() {
    return {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
  }
  // 开启VR模式
  enableVRMode() {
    this.isDeviceing = true;
    this.setVR(true);
  }
  // 关闭VR模式
  disableVRMode() {
    this.isDeviceing = false;
    this.setVR(false);
  }
  // 开启、关闭双屏
  setVR(bool) {
    if (bool) {
        this.curRenderer = this.VRRenderer;
    }
    else {
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.curRenderer = this.renderer;
    }
  }
  getOverlays() {
    return this.overlays;
  }
  // 将traveller对象传递过来
  setTraveller(traveller) {
    this.traveller = traveller;
  }
}
