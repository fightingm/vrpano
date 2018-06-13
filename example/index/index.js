
import VrTraveller from '../../src/entries/VrTraveller.js';

const sourceRoot = '../../assets';

// 用来展示vr的容器
const box = document.querySelector('#container');
// 渲染vr所需要的数据
const data = getNaviData();
// VrTraveller实例
const traveller = new VrTraveller(data, box);
// vr眼镜，可选
const glassesButton = new VrTraveller.GlassesButton();
traveller.setGlassesButton(glassesButton);

// 获取球面贴图资源，缩略图+碎片图，4行8列
function getSphereSliceUrl(key) {
  const list = [];
  for (let i = 0; i < 8; i++) {
    const a = [];
    for (let j = 0; j < 4; j++) {
      a.push(`${sourceRoot}/sphereSource/${key}/pano${i}-${j}.jpg`);
    }
      list.push(a);
  }
  return list;
}

// 获取立方体贴图资源，缩略图+6个面的碎片图
function getCubeSliceUrl(key) {
  var arr = [];
  for(var i = 1; i < 7; i++) {
    arr.push(`${sourceRoot}/cubeSource/${key}/pano${i}.jpg`);
  }
  return arr;
}


// x: 经度，0~2πy: 维度 - 2 / π~2 / π
// yaw pitch roll
function getNaviData() {
  // 返回一个数组，每一项保存一个场景
  return [{
    // 场景的角度及资源
    "scene": {
      // 场景的唯一标识
      "photo_key": "1",
      // 场景的校正角度
      "correction": [0, 0, 0],
      // 场景的旋转角度 水平，数值，第三项固定为0
      "rotation": [180, 0, 0],
      "title": "卧室",
      // 球面贴图的资源
      "sphereSource": {
        thumb: `${sourceRoot}/sphereSource/1/thumb.jpg`,
        slices: getSphereSliceUrl(1)
      },
      // 立方体贴图的资源
      "cubeSource": {
        thumb: `${sourceRoot}/cubeSource/1/thumb.jpg`,
        slices: getCubeSliceUrl(1)
      },
      // 是否默认展示该场景
      "is_main": 1
    },
    // 场景的导航
    "overlays": [{
      "title": "洗手间",
      // 导航的位置，x:经度，y:纬度
      "x": 4.6720072719141,
      "y": -0.52291666726088,
      // 导航的跳转场景标识
      "next_photo_key": "2"
    },
    {
      "title": "厨房",
      "x": 4.6720072719141,
      "y": 0.52291666726088,
      "next_photo_key": "2"
    }]
  },
  {
    "scene": {
      "photo_key": "2",
      "correction": [0, 0, 0],
      "rotation": [180, 0, 0],
      "title": "卫生间",
      "sphereSource": {
        thumb: `${sourceRoot}/sphereSource/2/thumb.jpg`,
        slices: getSphereSliceUrl(2)
      },
      "cubeSource": {
        thumb: `${sourceRoot}/cubeSource/2/thumb.jpg`,
        slices: getCubeSliceUrl(2)
      },
      "is_main": 0
    },
    "overlays": [{
      "title": "卧室",
      "x": 3.4483749837697,
      "y": -0.7169249148447,
      "next_photo_key": "1"
    }]
  }];
}