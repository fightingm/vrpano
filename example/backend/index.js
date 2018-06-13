
import VrAligner from '../../src/entries/vrAligner.js';

const sourceRoot = '../../assets';
// 用来展示vr的容器
const box = document.querySelector('#container');
// 渲染vr所需要的数据
const data = getNaviData();
// VrAligner实例
const aligner = new VrAligner(data, box);

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

// 渲染场景列表，使用者可以自行创建dom
// sdk只提供walkTo方法来跳转场景
(function renderList() {
  const list = document.querySelector('#scene-list');
  const { naviData } = aligner;
  naviData.forEach(val => {
    const dom = createScene(val);
    dom.onclick = () => {
      aligner.walkTo(val.scene.photo_key);
      setRotation();
    };
    list.appendChild(dom);
  });
})();
function  createScene(val) {
  const dom = document.createElement('div');
  const img = document.createElement('img');
  const title = document.createElement('div');
  const mainbtn = document.createElement('span');

  dom.className = "scene-item";
  dom.setAttribute('data-key', val.scene.photo_key);
  title.className = "title";
  img.src = val.scene.thumb_url;
  title.innerHTML = val.scene.title;
  mainbtn.innerHTML = '设为主场景';
  mainbtn.onclick = function(e) {
    e.cancelBubble = true;
    aligner.setMainScene(val.scene.photo_key);
  };
  mainbtn.className="btn"
  dom.appendChild(mainbtn);
  dom.appendChild(img);
  dom.appendChild(title);
  return dom;
}

// 设置旋转
const alpha = document.querySelector('#alpha'),
      beta = document.querySelector('#beta'),
      gamma = document.querySelector('#gamma'),
      xrotate = document.querySelector('#xrotate'),
      yrotate = document.querySelector('#yrotate');

// sdk提供saveRotation方法，保存当前视角为初始角
const saveRotationBtn = document.querySelector('#save-rotation');
saveRotationBtn.onclick = function() {
  aligner.saveRotation();
  setRotation();
};
// sdk提供resetRotation方法，重置当前视角为初始角
const resetRotationBtn = document.querySelector('#reset-rotation');
resetRotationBtn.onclick = function() {
  aligner.resetRotation();
  setRotation();
};

setRotation();
// sdk提供getCorrection和getRotation来获取当前的校正角度和旋转角度
function setRotation() {
  const correction = aligner.getCorrection(),
  rotation = aligner.getRotation();
  alpha.value = correction[0];
  beta.value = correction[2];
  gamma.value = correction[1];
  xrotate.value = rotation[0];
  yrotate.value = rotation[1];
}

// rotateYaw,设置yaw校正角度
alpha.oninput = function(e) {
  aligner.rotateYaw(e.target.value);
}
// rotateRoll,设置roll校正角度
beta.oninput = function(e) {
  aligner.rotateRoll(e.target.value);
}
// rotatePitch,设置pitch校正角度
gamma.oninput = function(e) {
  aligner.rotatePitch(e.target.value);
}
// rotateY,设置沿着Y轴旋转角度
xrotate.oninput = function(e) {
  aligner.rotateY(e.target.value);
}
// rotateX,设置沿着X轴旋转角度
yrotate.oninput = function(e) {
  aligner.rotateX(e.target.value);
}

// 添加导航
const addBtn = document.querySelector('#add-overlay');
let i = 0;
// sdk提供addOverlay方法
// title: 导航名称，不能重复且必须是string类型
// next_photo_key: 导航的跳转场景标识
addBtn.onclick = function() {
  aligner.addOverlay({
    title: `overlay${i++}`, 
    next_photo_key: "3"
  });
}

// 任何时候想要获取当前的编辑数据，可以直接从实例的naviData中得到
console.log(aligner.naviData);

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
      "thumb_url": `${sourceRoot}/sphereSource/1/thumb.jpg`,
      // 球面贴图的资源
      "sphereSource": {
        thumb: `${sourceRoot}/sphereSource/1/thumb.jpg`,
        slices: getSphereSliceUrl(1)
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
      "thumb_url": `${sourceRoot}/sphereSource/2/thumb.jpg`,
      "sphereSource": {
        thumb: `${sourceRoot}/sphereSource/2/thumb.jpg`,
        slices: getSphereSliceUrl(2)
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