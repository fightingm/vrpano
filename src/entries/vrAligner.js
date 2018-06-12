
import VrViewer from './vrView.js';
import Overlay from '../js/overlay.js';

export default class VrAligner {
  constructor(data, container) {
    this.naviData = data;
    this.viewer = new VrViewer(container);
    this.mouse = {
      mouseDownX: 0,
      mouseDownY: 0,
      initX: 0,
      initY: 0
    };
    this.handleOverlayMouseDown = this.handleOverlayMouseDown.bind(this);
    this.handleOverlayMouseMove = this.handleOverlayMouseMove.bind(this);
    this.handleOverlayMouseUp = this.handleOverlayMouseUp.bind(this);
    this.init();
  }
  init() {
    this.getCurScene();
    this.setScene();
  }
  getCurScene() {
    this.curScene = this.naviData.filter((navi, index) => {
      if(navi.scene.is_main === 1) {
        this.curSceneIndex = index;
      }
      return navi.scene.is_main === 1;
    })[0];
  }
  setScene() {
    const { curScene } = this,
          { scene, overlays } = curScene;
    const sourceData = this.makeSourceData();
    this.viewer.setScene(sourceData.thumb, sourceData.slices,{
      rotation: scene.rotation,
      correction: scene.correction,
      cb: () => {
        if(overlays.length > 0) {
          this.renderOverlays(overlays);
        }
      }
    })
  }
  getCorrection() {
    return this.viewer.getCorrectRotation();
  }
  getRotation() {
    return this.viewer.getManulRotation();
  }
  saveRotation() {
    const index = this.curSceneIndex;
    const correction = this.getCorrection();
    const rotation = this.getRotation();
    this.naviData[index].scene.correction = correction;
    this.naviData[index].scene.rotation = rotation;
  }
  resetRotation() {
    const index = this.curSceneIndex;
    const correction = this.naviData[index].scene.correction;
    const rotation = this.naviData[index].scene.rotation;
    this.viewer.setInitRotation({
      correction,
      rotation
    });
  }
  rotateYaw(deg) {
    this.viewer.setYawRotation(deg);
  }
  rotatePitch(deg) {
    this.viewer.setPitchRotation(deg);
  }
  rotateRoll(deg) {
    this.viewer.setRollRotation(deg);
  }
  rotateX(deg) {
    this.viewer.setManulRotationX(deg);
  }
  rotateY(deg) {
    this.viewer.setManulRotationY(deg);
  }
  setMainScene(key) {
    this.naviData = this.naviData.map(navi => {
      navi.scene.is_main = 0;
      if(navi.scene.photo_key === key) {
        navi.scene.is_main = 1;
      }
      return navi;
    });
  }
  renderOverlays(overlays) {
    this.viewer.clearOverlay();
    for (let i = 0; i < overlays.length; i++) {
      const dom = this.createOverlay(overlays[i]);
      const overlay = new Overlay(dom, overlays[i]);
      this.viewer.addOverlay(overlay);
    }
  }
  createOverlay(entity) {
    const dom = document.createElement("div");
    const title = document.createElement('span');
    title.innerHTML = entity.title;
    const btnBox = document.createElement("div");
    const delbtn = document.createElement('span');
    delbtn.innerHTML = '删除';
    delbtn.onclick = (e) => {
      e.cancelBubble = true;
      this.viewer.delOneOverlay(entity.title);
      const index = this.curSceneIndex;
      this.naviData[index].overlays.splice(this.curOverlayIndex, 1);
    };
    btnBox.appendChild(delbtn);
    dom.appendChild(title);
    dom.appendChild(btnBox);
    dom.setAttribute('data-x', entity.x);
    dom.setAttribute('data-y', entity.y);
    dom.setAttribute('data-title', entity.title);
    dom.className="overlay";
    dom.addEventListener('mousedown', this.handleOverlayMouseDown);
    return dom;
  }
  addOverlay(entity) {
    if(!entity.x || !entity.y) {
      const angles = this.viewer.pixelToAngle();
      entity.x = angles.lg;
      entity.y = angles.lt;
    }
    const dom = this.createOverlay(entity);
    const overlay = new Overlay(dom, entity);
    this.viewer.addOverlay(overlay);
    this.naviData[this.curSceneIndex].overlays.push(entity);
  }
  walkTo(key) {
    this.curScene = this.naviData.filter((pano, index) => {
      if(pano.scene.photo_key === key) {
        this.curSceneIndex = index;
      }
      return pano.scene.photo_key === key;
    })[0];
    this.viewer.clearOverlay();
    this.setScene();
  }

  handleOverlayMouseDown(e) {
    e.cancelBubble = true;
    this.mouse.initX = parseFloat(e.currentTarget.dataset.x);
    this.mouse.initY = parseFloat(e.currentTarget.dataset.y);
    this.curOverlay = this.viewer.getOverlays().filter((item, index) => {
      if(item.data.title === e.currentTarget.dataset.title) {
        this.curOverlayIndex = index;
      }
      return item.data.title === e.currentTarget.dataset.title;
    })[0];
    this.mouse.mouseDownX = e.clientX;
    this.mouse.mouseDownY = e.clientY;
    document.addEventListener('mousemove', this.handleOverlayMouseMove);
    document.addEventListener('mouseup', this.handleOverlayMouseUp);
  }
  handleOverlayMouseMove(e) {
    e.cancelBubble = true;
    e.preventDefault();
  
    const diffX = e.clientX - this.mouse.mouseDownX;
    const diffY = e.clientY - this.mouse.mouseDownY;
  
    const x = this.mouse.initX + diffX;
    const y = this.mouse.initY + diffY;
  
    const angles = this.viewer.pixelToAngle(x, y);
    this.curOverlay.setDirAngle(angles.lg, angles.lt);
  }
  handleOverlayMouseUp(e) {
    const index = this.curSceneIndex;
    this.naviData[index].overlays[this.curOverlayIndex] = this.curOverlay.data;
    document.removeEventListener('mousemove', this.handleOverlayMouseMove);
    document.removeEventListener('mouseup', this.handleOverlayMouseUp);
  }
  makeSourceData() {
    const { scene } = this.curScene;
    let data = {
      ...scene.sphereSource
    };
    return data;
  }
}

module.exports = VrAligner;