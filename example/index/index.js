
// import VrPano from '../../src/entries/vrPano';

// const { VrTraveller } = VrPano;

// import VrTraveller from '../../dist/Vr.Traveller.js';
import VrTraveller from '../../src/entries/VrTraveller.js';


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
            "correction":[0,0,0],
            "rotation": [30, 40, 0],
            "title":"卫生间",
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

