
import { CSS3DRenderer, CSS3DObject } from '../libs/css3d';

import utils from './utils';

export default class CubePainter {
  constructor(viewer) {
    this.viewer = viewer;
    this.renderer = new CSS3DRenderer();
  }
  // 加载缩略图
  loadThumb(url, cb) {
    this.cssObject = [];
    const sides = this.getSides([url, url, url, url, url, url]);
    for ( let i = 0; i < 6; i ++ ) {
      let side = sides[ i ];
      let element = document.createElement( 'div' );
      element.className = `cube_side_${i}`;
      element.style.width = 1026; // 2 pixels extra to close the gap.
      element.style.height = 1026;
      element.style.backgroundSize = 'cover';
      element.style.backgroundImage = `url(${side.url})`;
      element.style.backgroundPositionX = -i*1026 + 'px';
      element.style.backgroundRepeat = 'no-repeat';
      let object = new CSS3DObject( element );
      object.position.fromArray( side.position );
      object.rotation.fromArray( side.rotation );
      this.viewer.scene.add( object );
      this.cssObject.push(object);
    }
    cb();
  }
  // 加载清晰图
  loadSlices() {
    if(this.complate || !this.slices) return;
    for ( let i = 0; i < 6; i ++ ) {
      if(this.sliceMap[i]) {
        continue;
      }
      const url = this.slices[i];
      const face = document.querySelector(`.cube_side_${i}`);
      utils.loadImg(url).then(() => {
        this.sliceMap[i] = 1;
        face.style.backgroundImage = `url(${url})`;
        face.style.backgroundPositionX = 0;
        this.complate = this.checkComplate();
      });
    }
  }
  // 设置清晰图片资源
  setSlices(slices) {
    this.slices = slices;
    this.sliceMap = {};
    this.complate = false;
    this.loadSlices();
    
  }
  // 判断是否所有的清晰图都加载完成
  checkComplate() {
    return Object.keys(this.sliceMap).length === 6;
  }
  // 重置场景的时候将原来的cssObject移除
  resetScene() {
    if(this.cssObject) {
      this.cssObject.forEach(item => {
        this.viewer.scene.remove( item );
      });
    }
  }
  // 计算6个面的css属性
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

}
