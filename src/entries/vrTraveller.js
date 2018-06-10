
import VrViewer from './vrView';
import Overlay from '../js/overlay';
import GlassesButton from '../js/glassesButton';

class VrTraveller {
  constructor(data, container) {
    this.naviData = data;
    this.viewer = new VrViewer(container);
    this.viewer.setTraveller(this);
    this.handleOverlayClick = this.handleOverlayClick.bind(this);
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
    const sourceData = this.makeSourceData(scene.project_id, scene.photo_key);
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

  renderOverlays(overlays) {
    this.viewer.clearOverlay();
    for (let i = 0; i < overlays.length; i++) {
      const dom = this.createOverlay(overlays[i]);
      const overlay = new Overlay(dom, overlays[i]);
      overlay.setTraveller(this);
      this.viewer.addOverlay(overlay);
    }
  }
  createOverlay(entity) {
    let dom;
    if(this.isGlassesMode()) {
      dom = document.createElement('div');
      dom.appendChild(this.makeOverlayDom(entity, 'left'));
      dom.appendChild(this.makeOverlayDom(entity, 'right'));
    }else {
      dom = this.makeOverlayDom(entity);
    }
    return dom;
  }
  makeOverlayDom(entity, opt_eye) {
    let element = document.createElement("div");
    element.className = "overlay";
    if(opt_eye) {
  		element.setAttribute('eye', opt_eye);
  	}
    let text = document.createElement("label");
    text.className = "overlay-label";
    text.innerHTML = entity.title;
    element.appendChild(text);
    var arrow = document.createElement("img");
    arrow.className = "overlay-arrow";
    arrow.src = "//s.qunarzz.com/piao_tts/vr_navi_arrow.png";
    element.appendChild(arrow);

    element.addEventListener('touchend', () => {
      this.walkTo(entity.next_photo_key);
    });
    element.addEventListener('click', () => {
      this.walkTo(entity.next_photo_key);
    });
    return element;
  }
  // 跳转到其他场景
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
  // 获取缩略图及分割图url
  makeSourceData(id, key) {
    const data = {};
    // 支持webgl
    if(this.viewer.webglSupported()) {
      data.thumb = this.getSphereThumb(id, key);
      data.slices = this.getSphereSliceUrl(id, key);
    }else {
      data.thumb = this.getCubeThumb(id, key);
      data.slices = this.getCubeUrl(id, key);
    }
    return data;
  }
  getSphereThumb(id, key) {
    return this.getSliceUrl(id, key, '', '', 'yes');
  }
  getSliceUrl(projectId, sceneKey, sliceRow, sliceCol, sceneThumb) {
    const loadsphereUrl = '/entry/cpanel/service/loadsphere.php';
    return `${loadsphereUrl}?projectId=${projectId}&sceneKey=${sceneKey}&sliceRow=${sliceRow}&sliceCol=${sliceCol}&sceneThumb=${sceneThumb}`;
  }
  getSphereSliceUrl(id, key) {
    const list = [];
    for (let i = 0; i < 8; i++) {
      const a = [];
      for (let j = 0; j < 4; j++) {
        a.push(this.getSliceUrl(id, key, i, j, ''));
      }
      list.push(a);
    }
    return list;
  }
  getCubeThumb(id, key) {
    return `http://vr.qunarzz.com/hotel-test_only2_4-406/${key}/face_thumb.jpg`
  }
  getCubeUrl(id, key) {
    var arr = [];
    for(var i = 1; i < 7; i++) {
      arr.push(`/entry/cpanel/service/loadcube.php?projectKey=hotel-test_only2_4-406&sceneKey=${key}&faceIndex=${i}&sceneThumb=`);
    }
    return arr;
  }
  handleOverlayClick(key) {
    this.walkTo(key);
  }
  setGlassesButton(glassesButton) {
    if(!this.viewer || !this.viewer.webglSupported()) {
      return;
    }
    this.glassesButton = glassesButton;
    this.glassesButton.setTraveller(this);
    this.glassesButton.setViewer(this.viewer);
    this.glassesButton.render();
  }
  isGlassesMode() {
  	if(!this.glassesButton) {
  		return false;
  	}
  	return !!this.glassesButton.glassesMode;
  }
}
VrTraveller.GlassesButton = GlassesButton;

window.VrTraveller = VrTraveller;