
import VrTraveller from '../src/entries/vrTraveller'

const box = document.querySelector('#container');
const data = getNaviData();
const traveller = new VrTraveller(data, box);
const glassesButton = new VrTraveller.GlassesButton();
traveller.setGlassesButton(glassesButton);

function getSphereSliceUrl(key) {
    const list = [];
    for (let i = 0; i < 8; i++) {
      const a = [];
      for (let j = 0; j < 4; j++) {
        a.push(`../assets/sphereSource/${key}/pano${i}-${j}.jpg`);
      }
      list.push(a);
    }
    return list;
  }

  function getCubeSliceUrl(key) {
    var arr = [];
    for(var i = 1; i < 7; i++) {
      arr.push(`../assets/cubeSource/${key}/pano${i}.jpg`);
    }
    return arr;
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
            "sphereSource": {
                thumb: "../assets/sphereSource/1/thumb.jpg",
                slices: getSphereSliceUrl(1)
            },
            "cubeSource": {
                thumb: "../assets/cubeSource/1/thumb.jpg",
                slices: getCubeSliceUrl(1)
            },
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
            "x": 2.1121851217811,
            "y": -1.0510875120948,
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
            "rotation": [180, 0, 0],
            "latlng":[-9999,-9999],
            "title":"卫生间",
            "sphereSource": {
                thumb: "../assets/sphereSource/2/thumb.jpg",
                slices: getSphereSliceUrl(2)
            },
            "cubeSource": {
                thumb: "../assets/cubeSource/2/thumb.jpg",
                slices: getCubeSliceUrl(2)
            },
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