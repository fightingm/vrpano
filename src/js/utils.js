// import { Frustum, Matrix4, Vector3, Geometry, Face3, Mesh } from 'three';
import { Matrix4 } from 'three/src/math/Matrix4';
import { Vector3 } from 'three/src/math/Vector3';
import { Frustum } from 'three/src/math/Frustum';
import { Mesh } from 'three/src/objects/Mesh';
import { Face3 } from 'three/src/core/Face3';
import { Geometry } from 'three/src/core/Geometry';

export default {
  /**
   * @description 判断一个物体是否与相机视锥体相交
   * @param {any} obj 要判断的物体
   * @param {any} camera 相机
   * @returns boolean
   */
  isOffScreen (obj, camera){
      let frustum = new Frustum(); //Frustum用来确定相机的可视区域
      let cameraViewProjectionMatrix = new Matrix4();
      cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); //获取相机的法线
      frustum.setFromMatrix(cameraViewProjectionMatrix); //设置frustum沿着相机法线方向

      return !frustum.intersectsObject(obj);
  },
  /**
   * @description 用来将球面座标转换成屏幕坐标
   * @param {any} obj 一个tagMesh 它的position是球面坐标
   * @param {any} camera 当前场景的相机
   * @param {any} container webgl容器
   * @param {any} opt_eye 如果是vr模式，传入'left'或者'right'
   * @returns x坐标和y坐标
   */
  toScreenPosition (obj, camera, container, opt_eye){
      let vector = new Vector3();
      let size ={
        width: container.clientWidth,
        height: container.clientHeight
      };
      let w = size.width / 2;
      let h = size.height / 2;
      let wfactor = w;
    	let hfactor = h;
      if(opt_eye) {
        if(size.width < size.height) {
    			hfactor = h/2;
    			switch(opt_eye) {
    				case 'left':
    					h = h/2;
    					break;
    				case 'right':
    					h = h + h/2;
    					break;
    			}
        }else {
          wfactor = w/2;
    			switch(opt_eye) {
    				case 'left':
              w = w/2;
    					break;
    				case 'right':
              w = w + w/2;
    					break;
    			}
        }
  		}

      obj.updateMatrixWorld();
      vector.setFromMatrixPosition(obj.matrixWorld);
      vector.project(camera);

      let target = {
        x: (vector.x * wfactor) + w,
        y: -(vector.y * hfactor) + h
      };
      if(opt_eye && size.width < size.height) {
        if(opt_eye == 'left' && target.y > size.height/2) {
    				target.y = -10000;
    			}

    			if(opt_eye == 'right' && target.y < size.height/2) {
    				target.y = -10000;
    			}
      }else if(opt_eye && size.width >= size.height) {
        if(opt_eye == 'left' && target.x > size.width/2) {
  				target.x = -10000;
  			}

  			if(opt_eye == 'right' && target.x < size.width/2) {
  				target.x = -10000;
  			}
      }


      vector.x = target.x;
      vector.y = target.y;


      return [vector.x, vector.y];
  },
  /*
  经度 0-2π
  维度 0-π
  半径
  */
  /**
   * @description 将经纬度转换成球面坐标
   * @param {any} lg 经度
   * @param {any} lt 纬度
   * @param {any} r 球体半径
   * @returns 对应球面坐标
   */
  lglt2xyz (lg,lt,r){
    let x = r * Math.sin(lt)* Math.cos(lg);
    let y = r * Math.cos(lt);
    let z = r * Math.sin(lg) * Math.sin(lt);
    return new Vector3(x, y, z);
  },

 /**
  * @description 这个函数用来计算球体每个三角面对应使用哪一张图片作为纹理
  * 全景图被分成 4*8 张图片 也就是4行8列
  * 球体的三角面数量为 横向分割数*2 + (纵向分割数-2)*横向分割数*2
  * 如果球体的纵向分割和横向分割正好是4和8，那么顶部和底部的每个三角面对应一张图片，中间每两个相邻的三角面共用一张图片
  * 球体的纵向分割和横向分割大于4和8，那么必须是4和8的整数倍，这样每个三角面和他左右的三角面和上下的三角面共用一张图片
  * @param {any} i 三角面的索引（第几个三角面）
  * @param {any} widthSegments 球体横向切割数
  * @param {any} heightSegments 球体纵向切割数
  * @param {any} widthScale 球体横向切割数/全景图的横向切割数
  * @param {any} heightScale 球体纵向切割数/全景图的纵向切割数
  * @returns imgIndex 图片索引
  */
 transIndex(i, widthSegments, heightSegments, widthScale, heightScale) {
    // console.log(i);
    let row, col, imgIndex;
    // 第一行
    if(i < widthSegments) {
      row = 1;
      col = i+1;
    }else if(i < 3*widthSegments) {
      // 第二行
      row = parseInt((i+widthSegments)/(2*widthSegments)) + 1;
      col = parseInt((i - (row-1)*widthSegments)/2) + 1;
    }else if(i < widthSegments+2*widthSegments*(heightSegments-2)) {
      row = parseInt((i-widthSegments)/(2*widthSegments)) + 2;
      col = parseInt((i - (row-2) * 2 * widthSegments -widthSegments )/2) + 1;
    }else {
      // 最后一行
      row = parseInt((i-widthSegments)/(2*widthSegments)) + 2;
      col = parseInt( i - (row-2) * 2*widthSegments -widthSegments ) + 1;
    }
    row = Math.ceil(row/heightScale);
    col = Math.ceil(col/widthScale);
    imgIndex = (col-1) * 4 + row;
    return imgIndex;
  },
 /**
  * @description 这个函数用来计算当前三角面和他下一个三角面的uv映射坐标（两个相邻的三角面拼成一个矩形）
  * 当前全景图是4*8 4行8列，但是球体被分割成8*16
  * 所以某一张分割图要被当前行4个三角面使用上半部分，被下一行的4个三角面使用下半部分(第一行和最后一行除外)
  * 第一行的话就是2个三角面使用上半部分，下一行的4个三角面使用下半部分
  * 最后一行的话就是上一行的4个三角面使用上半部分，当前行的2个三角面使用下半部分
  * 所以第一行和最后一行会有缺失
  * @param {any} index 第几个使用当前图形作为纹理的三角面
  * @param {any} widthScale 球体横向分割/全景图横向切割
  * @param {any} heightScale 球体纵向切割/全景图纵向切割
  * @returns 两个三角面的uv映射坐标
  */
 getVertexUvs(index, widthScale, heightScale) {
    // 两个三角面组成的矩形的四个顶点坐标
    const vectors = [
      [((index-1)%widthScale + 1)/widthScale, 1- (parseInt((index-1)/widthScale)%heightScale)/heightScale],
      [((index-1)%widthScale)/widthScale, 1- (parseInt((index-1)/widthScale)%heightScale)/heightScale],
      [((index-1)%widthScale)/widthScale, 1- (parseInt((index-1)/widthScale)%heightScale + 1)/heightScale],
      [((index-1)%widthScale + 1)/widthScale, 1- (parseInt((index-1)/widthScale)%heightScale + 1)/heightScale]
    ];
    return [
      {
        a: vectors[0],
        b: vectors[1],
        c: vectors[3]
      },
      {
        a: vectors[1],
        b: vectors[2],
        c: vectors[3]
      }
    ];
  },

 /**
  * @description 这个函数用来判断一张切图是不是在当前视线中
  * 球体顶点计算公式 x: r*sinθ*cosφ y: r*cosθ z: r*sinθ*sinφ θ纬度 φ经度
  * 行 => 纬度  列 => 经度
  * 全景图一共4行8列 那么某一张图片对应到球面上的顶点坐标就可以求出来
  * 然后根据这4个顶点创建一个几何图形，判断这个几何图形的包围球是否与相机的视锥体相交
  * @param {any} row 当前切图的行
  * @param {any} col 当前切图的列
  * @param {any} camera 判断相交的相机
  * @returns 是否在当前视线
  */
 isInSight(row, col, camera) {
    // 球体半径
    const Radius = 10;
    // 经度 2π 分成8份， 每份是4/π
    // 维度 π 分成4份， 每份也是4/π
    const ltPoint = {
      x: Radius*Math.sin(col * Math.PI / 4) * Math.cos(row * Math.PI / 4),
      y: Radius*Math.cos(col * Math.PI / 4),
      z: Radius*Math.sin(col * Math.PI / 4) * Math.sin(row * Math.PI / 4)
    };
    const rtPoint = {
      x: Radius*Math.sin(col * Math.PI / 4) * Math.cos((row+1) * Math.PI / 4),
      y: Radius*Math.cos(col * Math.PI / 4),
      z: Radius*Math.sin(col * Math.PI / 4) * Math.sin((row+1) * Math.PI / 4)
    };
    const lbPoint = {
      x: Radius*Math.sin((col+1) * Math.PI / 4) * Math.cos(row * Math.PI / 4),
      y: Radius*Math.cos((col+1) * Math.PI / 4),
      z: Radius*Math.sin((col+1) * Math.PI / 4) * Math.sin(row * Math.PI / 4)
    };
    const rbPoint = {
      x: Radius*Math.sin((col+1) * Math.PI / 4) * Math.cos((row+1) * Math.PI / 4),
      y: Radius*Math.cos((col+1) * Math.PI / 4),
      z: Radius*Math.sin((col+1) * Math.PI / 4) * Math.sin((row+1) * Math.PI / 4)
    };

    // 创建一个几何图形，四个顶点分别为贴图的四个顶点坐标、
    const geometry = new Geometry();
    geometry.vertices.push(
    	new Vector3( ltPoint.x, ltPoint.y, ltPoint.z ),
    	new Vector3( rtPoint.x, rtPoint.y, rtPoint.z ),
    	new Vector3( lbPoint.x, lbPoint.y, lbPoint.z ),
      new Vector3( rbPoint.x, rbPoint.y, rbPoint.z ),
    );
    geometry.faces.push( new Face3( 0, 1, 2 ), new Face3( 1, 2, 3 ) );

    // 然后判断包围球是否与视锥体相交
    const tagMesh = new Mesh(geometry);
    const off = this.isOffScreen(tagMesh, camera);
    return !off;
  },
  /**
   * @description 加载图片
   * @param {any} src 要加载的图片地址
   * @returns promise
   */
  loadImg(src) {
    return new Promise((resolve, reject) => {
      let img = document.createElement('img');
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
}
