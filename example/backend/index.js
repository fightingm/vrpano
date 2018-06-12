
// import VrPano from '../../src/entries/vrPano';

// const { VrAligner } = VrPano;
// import VrPano from '../../dist/VrPano.js';
// const { VrAligner } = VrPano;
import VrAligner from '../../src/entries/vrAligner.js';


function getSphereSliceUrl(key) {
  const list = [];
  for (let i = 0; i < 8; i++) {
    const a = [];
    for (let j = 0; j < 4; j++) {
      a.push(`../../assets/sphereSource/${key}/pano${i}-${j}.jpg`);
    }
    list.push(a);
  }
  return list;
}

function getCubeSliceUrl(key) {
  var arr = [];
  for(var i = 1; i < 7; i++) {
    arr.push(`../../assets/cubeSource/${key}/pano${i}.jpg`);
  }
  return arr;
}

    const naviData = getNaviData();
    const box = document.querySelector('#container');
    const aligner = new VrAligner(naviData, box);

    // 场景切换
      renderList();
      function renderList() {
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
      }
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
    const saveRotationBtn = document.querySelector('#save-rotation');
    saveRotationBtn.onclick = function() {
      aligner.saveRotation();
      setRotation();
    };
    const resetRotationBtn = document.querySelector('#reset-rotation');
    resetRotationBtn.onclick = function() {
      aligner.resetRotation();
      setRotation();
    };

    setRotation();
    function setRotation() {
      const correction = aligner.getCorrection(),
      rotation = aligner.getRotation();
      alpha.value = correction[0];
      beta.value = correction[2];
      gamma.value = correction[1];
      xrotate.value = rotation[0];
      yrotate.value = rotation[1];
    }

    alpha.oninput = function(e) {
      aligner.rotateYaw(e.target.value);
    }
    beta.oninput = function(e) {
      aligner.rotateRoll(e.target.value);
    }
    gamma.oninput = function(e) {
      aligner.rotatePitch(e.target.value);
    }
    xrotate.oninput = function(e) {
      aligner.rotateY(e.target.value);
    }
    yrotate.oninput = function(e) {
      aligner.rotateX(e.target.value);
    }

    // overlay
    const addBtn = document.querySelector('#add-overlay');
    // title 不能重复且必须是string类型
    let i = 0;
    addBtn.onclick = function() {
      aligner.addOverlay({
        title: `overlay${i++}`, 
        next_photo_key: "3"
      });
      console.log(aligner.naviData);
    }

    // x: 经度，0 ~ 2π  y: 维度 -2/π ~ 2/π
    // yaw pitch roll
    function getNaviData() {
      return [
        {
          "scene":{
            "photo_key":"1",
            "correction":[0, 0, 0],
            "rotation": [180, 0, 0],
            "title":"卧室",
            "thumb_url":"http://vr.qunarzz.com/hotel-test_only2_4-406/1/micro_thumb.jpg?t=1518082619",
            "sphereSource": {
                thumb: "../../assets/sphereSource/1/thumb.jpg",
                slices: getSphereSliceUrl(1)
            },
            "cubeSource": {
                thumb: "../../assets/cubeSource/1/thumb.jpg",
                slices: getCubeSliceUrl(1)
            },
            "is_main":0
          },
          "overlays":[
            {
              "title":"洗手间",
              "x": 4.6720072719141,
              "y": -0.52291666726088,
              "next_photo_key":"2"
            },
            {
                "title": "厨房",
                "x": 4.6720072719141,
                "y": 0.52291666726088,
                "next_photo_key": "2"
            }
          ]
        },{
          "scene":{
            "photo_key":"2",
            "correction":[0, 0, 0],
            "rotation": [30, 40, 0],
            "title":"卫生间",
            "thumb_url":"http://vr.qunarzz.com/hotel-test_only2_4-406/2/micro_thumb.jpg?t=1518082874",
            "sphereSource": {
                thumb: "../../assets/sphereSource/2/thumb.jpg",
                slices: getSphereSliceUrl(2)
            },
            "cubeSource": {
                thumb: "../../assets/cubeSource/2/thumb.jpg",
                slices: getCubeSliceUrl(2)
            },
            "is_main":1
          },
          "overlays":[
            {
              "title":"卧室",
              "x": 3.4483749837697,
              "y": -0.7169249148447,
              "next_photo_key":"1"
            }
          ]
        }
      ];
    }