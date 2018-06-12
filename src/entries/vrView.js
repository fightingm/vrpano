// import StatsView from '../js/stats';
// import {Scene, AmbientLight, PerspectiveCamera, Quaternion, Raycaster, Vector2} from 'three';
import { Vector2 } from 'three/src/math/Vector2';
import { Quaternion } from 'three/src/math/Quaternion';

import { Scene } from 'three/src/scenes/Scene';

import { AmbientLight } from 'three/src/lights/AmbientLight';

import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';

import { Raycaster } from 'three/src/core/Raycaster';

import { DeviceOrientationControls } from '../libs/DeviceOrientationControls';
import { StereoEffect } from '../libs/StereoEffect';


import utils from '../js/utils';
import CorrectRotation from '../js/correctRotation';
import ManulRotation from '../js/manulRotation';
import MouseController from '../js/mouseControl';
import GlPainter from '../js/glPainter';
import CubePainter from '../js/cubePainter';

// const stats = new StatsView();

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

    this.init();
  }
  init() {
    // 添加场景
    this.scene = new Scene();

    // 添加光源
    const light = new AmbientLight( 0xffffff );
    this.scene.add( light );

    // 设置相机
    const width = this.container.clientWidth,
          height = this.container.clientHeight,
          fov = 90;
    // 创建相机
    let camera = new PerspectiveCamera( fov, width / height, 1, 1000 );
    // camera.position.z = 3;
    // console.log(camera.lookAt);
    // camera.lookAt(1, 1, 1);
    // camera.position.set(0, 1, 0);
    this.camera = camera;

    // 创建渲染器
    let renderer;
    if(this.webglSupported()) {
      this.painter = new GlPainter(this);
      renderer = this.painter.renderer;
      renderer.setClearColor(0xEEEEEE, 1.0);
    }else {
      this.painter = new CubePainter(this);
      renderer = this.painter.renderer;
    }
    // renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, height );
    this.renderer = renderer;

    // 渲染
    this.container.appendChild(renderer.domElement);

    // 初始化陀螺仪
    this.devices = new DeviceOrientationControls(this.camera);

    // 鼠标事件处理
    this.mouseControl = new MouseController(this);

    // 双屏效果
    this.VRRenderer = new StereoEffect(this.renderer);

    this.curRenderer = renderer;

  }
  // 每次切换场景的时候要执行的操作
  resetScene(opt) {
    // 先设置相机角度，然后再贴图
    this.setInitRotation(opt);
    // 先把之前的场景删除
    // this.scene.remove( this.sphere );
    this.painter.resetScene();
    // 相机视角恢复
    this.camera.fov = 90;
    this.camera.updateProjectionMatrix();
  }
  setScene(url, slices, opt) {
    this.resetScene(opt);
    // 实例化一个加载器
    this.painter.loadThumb(url, () => {
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
      this.painter.setSlices(slices);
    });
  }
  render() {
    // stats.update();
    if(this.isDeviceing) {
      this.devices.update();
    }
    if(this.painter.sphere) {
      this.painter.sphere.geometry.groupsNeedUpdate = true;
      this.painter.sphere.geometry.uvsNeedUpdate = true;
    }
    
    if(this.isDeviceing) {
      this.curRenderer.render(this.scene, this.camera, (camera) => {
        this.VRcamera = camera;
      });
    }else {
      this.curRenderer.render(this.scene, this.camera);
    }
    this.updateOverlayPos();
    // this.painter.loadSlices();
    requestAnimationFrame(this.render.bind(this));
  }

  // correctRotation的旋转角度
  setYawRotation(val) {
    this.correctRotation.setAlphaRotation(val);
    this.setRotation();
  }
  setRollRotation(val) {
    this.correctRotation.setGammaRotation(val);
    this.setRotation();
  }
  setPitchRotation(val) {
    this.correctRotation.setBetaRotation(Math.min(Math.max(val, -90), 90));
    this.setRotation();
  }
  // manulRotation的旋转角度
  setManulRotationX(val) {
    this.manulRotation.setBetaRotation(Math.min(Math.max(val, -90), 90));
    this.setRotation();
  }
  setManulRotationY(val) {
    this.manulRotation.setAlphaRotation(val);
    this.setRotation();
  }
  setRotation() {
    var quat = new Quaternion();
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
    }
    this.setRotation();
  }

  // 场景切换的时候先清空overlay
  clearOverlay() {
    this.overlays.forEach(overlay => {
      overlay.dispose();
    });
    this.overlays = [];
  }
  /**
   * @description 删除指定名称的overlay
   * @param {any} name 要删除的overlay名称
   * @memberof VrViewer
   */
  delOneOverlay(name) {
    this.overlays = this.overlays.filter(item => {
      if(item.data.title === name){
        item.dispose();
      }
      return item.data.title !== name;
    });
  }
  /**
   * @description 将平面左边转换成经纬度
   * @param {any} x 鼠标x坐标
   * @param {any} y 鼠标y坐标
   * @returns {lg: 经度, lt: 纬度}
   * @memberof VrViewer
   */
  pixelToAngle(x, y) {
    // 1.将2d坐标转换成3d坐标
    const raycaster = new Raycaster();
    const mouseVector = new Vector2();
    // 把鼠标坐标转换成webgl的3d坐标，webgl的原点在中心，鼠标坐标的原点在左上角
    if(x!== undefined && y !== undefined) {
      mouseVector.x = 2 * (x / this.container.clientWidth) - 1;
      mouseVector.y = - 2 * (y / this.container.clientHeight) + 1;
    }else {
      // 如果没有传x,y默认渲染在页面中心位置
      mouseVector.x = 0;
      mouseVector.y = 0;
    }
    raycaster.setFromCamera(mouseVector, this.camera);
    const intersects = raycaster.intersectObjects([this.painter.sphere]);
    if(intersects.length > 0) {
      const { point } = intersects[0];
      const theta = Math.atan2(point.x, -1.0 * point.z);
      const phi = Math.atan2(point.y, Math.sqrt(point.x * point.x + point.z * point.z)); 
      // 这里的3pi/2,是通过测试log推测出来的
      return {lg: (theta + 3*Math.PI/2) % (Math.PI * 2), lt: phi};
    }
    return {lg: 0, lt: 0};
  }
  // 添加overlay
  addOverlay(overlay, notAppend) {
    this.overlays.push(overlay);
    overlay.render(this.container);
    if(this.isDeviceing) {
      overlay.updatePosition(this.VRcamera)
    }else {
      overlay.updatePosition(this.camera)
    }
  }
  // 旋转场景的时候让overlay跟着旋转
  // 如果是vr模式，当转到某一个导航上，需要聚焦，然后跳转到对应的场景上
  updateOverlayPos() {
    if(this.traveller && this.traveller.glassesButton) {
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

  webglSupported() {
    try {
			var canvas = document.createElement( 'canvas' ); return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );
		} catch ( e ) {
			return false;
		}
  }

  setScale() {
    const { fov } = this.mouseControl;
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
    this.painter.loadSlices();
    this.updateOverlayPos();
  }
  getManulRotation() {
    return this.manulRotation.getRotation().slice(0);
  }
  getCorrectRotation() {
    return this.correctRotation.getRotation().slice(0);
  }
  // 设置水平方向被锁定
  setXLock(lock) {
    this.lockX = lock;
  }
  // 设置竖直方向被锁定
  setYLock(lock) {
    this.lockY = lock;
  }
  handleMouseMove(curX, curY) {
    if(!this.lockY) {
      this.setManulRotationX(curY);
    }
    if(!this.lockX) {
      this.setManulRotationY(curX);
    }
    this.updateOverlayPos();
  }
  handleMouseUp() {
    // this.setSlices();
    this.painter.loadSlices();
  }
  handleWindowResize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.curRenderer.setSize(width, height);
  }
}