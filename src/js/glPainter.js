
// import { WebGLRenderer, TextureLoader, SphereGeometry, MeshBasicMaterial, Mesh, LinearFilter, RGBFormat } from 'three';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { SphereGeometry } from 'three/src/geometries/SphereGeometry';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { Mesh } from 'three/src/objects/Mesh';
import { LinearFilter, RGBFormat } from 'three/src/constants';

import utils from './utils';

let testI = 0;

export default class GlPainter {
  constructor(viewer) {
    this.viewer = viewer;
    this.renderer = new WebGLRenderer();
  }

  // 加载缩略图
  loadThumb(url, cb) {
    let loader = new TextureLoader();
    loader.crossOrigin = '*';
    loader.load(url, (texture) => {
      texture.minFilter=LinearFilter;
      texture.magFilter=LinearFilter;
      const widthSegments = 64,
            heightSegments = 64;

      const geometry = new SphereGeometry( 10, widthSegments, heightSegments ),
            materials = [new MeshBasicMaterial({map: texture})];

      geometry.scale(-1,1,1);
      const sphere = new Mesh( geometry, materials );
      
      this.sphere = sphere;
      this.widthSegments = widthSegments;
      this.widthScale = widthSegments/8;
      this.heightSegments = heightSegments;
      this.heightScale = heightSegments/4;
      this.viewer.scene.add( this.sphere );
      cb();
    });
  }
  // 加载清晰图
  loadSlices() {
    if(this.complate) return;
    const urls = this.slices;
    const camera = this.viewer.camera;
    if(!urls) return;
    const row = urls.length;
    const col = urls[0].length;
    // 渲染
    for(let i = 0; i < row; i++) {
      for(let j = 0; j < col; j++) {
        const index = i * col + j + 1;
          if(!this.sliceMap[`${i}-${j}`]) {
            const isInSight = utils.isInSight(i, j, camera);
            if(isInSight) {
              this.drawSlice(index, urls[i][j]);
              this.sliceMap[`${i}-${j}`] = 1;
              this.complate = this.checkComplate();
            }
          }
      }
    }
  }
  // 设置清晰图资源
  setSlices(slices) {
    this.slices = slices;
    this.sliceMap = {};
    this.complate = false;
    this.loadSlices();
  }
  // 判断是否所有的清晰图都加载完成
  checkComplate() {
    return Object.keys(this.sliceMap).length === 32;
  }
  // 重置场景的时候将原来的cssObject移除
  resetScene() {
    if(this.sphere) {
      this.viewer.scene.remove( this.sphere );
    }
  }
  // 设置材料数组
  drawSlice(index, url) {
    let loader = new TextureLoader();
    loader.format = RGBFormat;
    loader.crossOrigin = '*';
    // 使用全景图片生成纹理
    loader.load(url, (texture) => {
      // 这里可以让纹理之间的过渡更加自然，不会出现明显的棱角
      texture.minFilter=LinearFilter;
      texture.magFilter=LinearFilter;
      this.sphere.material[index] = new MeshBasicMaterial({
        map: texture
      });
      this.updateSliceView(index);
    });
  }
  // 更新三角面uv映射
  updateSliceView(index) {
    let sliceIndex = 0;
    const {widthSegments, heightSegments, widthScale, heightScale} = this;
    for (let i = 0, l = this.sphere.geometry.faces.length; i < l; i++) {
      // 每一个三角面对应的图片索引
      const imgIndex = utils.transIndex(i, widthSegments, heightSegments, widthScale, heightScale);
      if(imgIndex === index) {
        sliceIndex++;
        const uvs = utils.getVertexUvs(sliceIndex, widthScale, heightScale);
        if(i >= widthSegments*2*heightSegments - 3*widthSegments || i < widthSegments) {
          this.sphere.geometry.faces[i].materialIndex = index;
          this.sphere.geometry.faceVertexUvs[0][i][0].set(...uvs[0].a);
          this.sphere.geometry.faceVertexUvs[0][i][1].set(...uvs[0].b);
          this.sphere.geometry.faceVertexUvs[0][i][2].set(...uvs[0].c);
        }else {
          this.sphere.geometry.faces[i].materialIndex = index;
          this.sphere.geometry.faces[i+1].materialIndex = index;
          this.sphere.geometry.faceVertexUvs[0][i][0].set(...uvs[0].a);
          this.sphere.geometry.faceVertexUvs[0][i][1].set(...uvs[0].b);
          this.sphere.geometry.faceVertexUvs[0][i][2].set(...uvs[0].c);
          this.sphere.geometry.faceVertexUvs[0][i+1][0].set(...uvs[1].a);
          this.sphere.geometry.faceVertexUvs[0][i+1][1].set(...uvs[1].b);
          this.sphere.geometry.faceVertexUvs[0][i+1][2].set(...uvs[1].c);
          i++;
        }
      }
    }
  }
}
