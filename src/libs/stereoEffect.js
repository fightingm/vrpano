/**
 * @author alteredq / http://alteredqualia.com/
 * @authod mrdoob / http://mrdoob.com/
 * @authod arodic / http://aleksandarrodic.com/
 * @authod fonserbc / http://fonserbc.github.io/
*/

import { StereoCamera } from 'three/src/cameras/StereoCamera';

function StereoEffect( renderer ) {

	var _stereo = new StereoCamera();
	_stereo.aspect = 0.5;

	this.setEyeSeparation = function ( eyeSep ) {

		_stereo.eyeSep = eyeSep;

	};

	this.setSize = function ( width, height ) {

		renderer.setSize( width, height );

	};

	this.render = function ( scene, camera, cb ) {
    var size = renderer.getSize();
    if (size.width >= size.height) {
        _stereo.aspect = 0.5;

        scene.updateMatrixWorld();

        if (camera.parent === null) camera.updateMatrixWorld();

        _stereo.update(camera);

        if (renderer.autoClear) renderer.clear();
        renderer.setScissorTest(true); //启用或禁用裁剪测试。当被激活时，只有裁剪区域内的像素会被进一步的渲染行为所影响。

        //注：以下两种方法中点（x,y）是该区域的左下角。 该区域被定义从左到右的宽度，以及从底部到顶部的高度。该垂直方向的定义和HTML canvas元素的填充方向相反。
        renderer.setScissor(0, 0, size.width / 2, size.height); //设置裁剪区域，从 (x, y) 到 (x + width, y + height).
        renderer.setViewport(0, 0, size.width / 2, size.height); //设置视口，从 (x, y) 到 (x + width, y + height)。
        renderer.render(scene, _stereo.cameraL);

        renderer.setScissor(size.width / 2, 0, size.width / 2, size.height);
        renderer.setViewport(size.width / 2, 0, size.width / 2, size.height);
        renderer.render(scene, _stereo.cameraR);

				cb(_stereo);
    }
    else {
        _stereo.aspect = 2;

        scene.updateMatrixWorld();

        if (camera.parent === null) camera.updateMatrixWorld();

        _stereo.update(camera);

        if (renderer.autoClear) renderer.clear();
        renderer.setScissorTest(true);

        renderer.setScissor(0, 0, size.width, size.height / 2);
        renderer.setViewport(0, 0, size.width, size.height / 2);
        renderer.render(scene, _stereo.cameraL);

        renderer.setScissor(0, size.height / 2, size.width, size.height / 2);
        renderer.setViewport(0, size.height / 2, size.width, size.height / 2);
        renderer.render(scene, _stereo.cameraR);
				cb(_stereo);
    }

		renderer.setScissorTest( false );

	};

};

export { StereoEffect };
