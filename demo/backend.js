
import VrAligner from '../src/entries/vrAligner';

    const naviData = getNaviData();
    const box = document.querySelector('#container');
    const alinger = new VrAligner(naviData, box);

    // 场景切换
      renderList();
      function renderList() {
        const list = document.querySelector('#scene-list');
        const { naviData } = alinger;
        naviData.forEach(val => {
          const dom = createScene(val);
          dom.onclick = () => {
            alinger.walkTo(val.scene.photo_key);
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
          alinger.setMainScene(val.scene.photo_key);
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
      alinger.saveRotation();
    };

    setRotation();
    function setRotation() {
      const correction = alinger.getCorrection(),
      rotation = alinger.getRotation();
      alpha.value = correction[0];
      beta.value = correction[1];
      gamma.value = correction[2];
      xrotate.value = rotation[0];
      yrotate.value = rotation[1];
    }

    alpha.oninput = function(e) {
      alinger.rotateYaw(e.target.value);
    }
    beta.oninput = function(e) {
      alinger.rotateRoll(e.target.value);
    }
    gamma.oninput = function(e) {
      alinger.rotatePitch(e.target.value);
    }
    xrotate.oninput = function(e) {
      alinger.rotateY(e.target.value);
    }
    yrotate.oninput = function(e) {
      alinger.rotateX(e.target.value);
    }

    // overlay
    const addBtn = document.querySelector('#add-overlay');

    addBtn.onclick = function() {
      alinger.addOverlay({title: '哈哈哈'});
    }

    // x: 经度，0 ~ 2π  y: 维度 -2/π ~ 2/π
    // yaw pitch roll
    function getNaviData() {
      return [
        {
          "scene":{
            "id":"3285",
            "project_id":"982",
            "photo_key":"1",
            "correction":[0, 0, 0],
            "rotation": [180, 0, 0],
            "latlng":[39.988056,116.511203],
            "title":"卧室",
            "thumb_url":"http://vr.qunarzz.com/hotel-test_only2_4-406/1/micro_thumb.jpg?t=1518082619",
            "is_main":0
          },
          "overlays":[
            {
              "id":"3452",
              "scene_id":"3285",
              "project_id":"982",
              "title":"洗手间",
              "summary":"",
              "rotation":[320.96834857345,-48.980607560998,0],
              "type":"NAVI",
              "x": 4.6720072719141,
              "y": -0.52291666726088,
              "next_project_id":"982",
              "next_photo_key":"2",
              "change_rotation":[111.55444105619,-1.3053507741785,0],
              "change_effect":"切换效果1"
            },
            {
                "id": "7726",
                "scene_id": "3285",
                "project_id": "982",
                "title": "厨房",
                "summary": "",
                "rotation": [180,0,0],
                "type": "NAVI",
                "x": 4.6720072719141,
                "y": 0.52291666726088,
                "next_project_id": "982",
                "next_photo_key": "2",
                "change_rotation": null,
                "change_effect": "切换效果1"
            }
          ]
        },{
          "scene":{
            "id":"3286",
            "project_id":"982",
            "photo_key":"2",
            "correction":[0,0,0],
            "rotation": [30, 40, 0],
            "latlng":[-9999,-9999],
            "title":"卫生间",
            "thumb_url":"http://vr.qunarzz.com/hotel-test_only2_4-406/2/micro_thumb.jpg?t=1518082874",
            "is_main":1
          },
          "overlays":[
            {
              "id":"3453",
              "scene_id":"3286",
              "project_id":"982",
              "title":"卧室",
              "summary":"",
              "rotation":[0,0,0],
              "type":"NAVI",
              "x": 3.4483749837697,
              "y": -0.7169249148447,
              "next_project_id":"982",
              "next_photo_key":"1",
              "change_rotation":null,
              "change_effect":"切换效果3"
            }
          ]
        }
      ];
    }