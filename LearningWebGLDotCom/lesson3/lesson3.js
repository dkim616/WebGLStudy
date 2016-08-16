var lesson02 = function() {

	var gl;
	var shaderProgram;

	// Vertex buffers
	var triangleVertexPositionBuffer;
	var triangleVertexColorBuffer;
	var squareVertexPositionBuffer;
	var squareVertexColorBuffer;

	// Model view and perspective matrices.
	var mvMatrix = mat4.create();
	var pMatrix = mat4.create();
	var mvMatrixStack = [];

	// Rotations
	var rTri = 0;
	var rSquare = 0;

	// Animate
	var lastTime = 0;

	function initGL(canvas) {
		try {
			// Could use gl = WebGLUtils.setupWebGL(canvas); by Google. No try/catch.
			gl = canvas.getContext("experimental-webgl");

			// Custom variables.
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
		} catch (e) {
		}

		if (!gl) {
			alert("Could not initialize WebGL");
		}
	}

	function initShaders() {
		var vertexShader = getShader(gl, "shader-vs");
		var fragmentShader = getShader(gl, "shader-fs");

		shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			alert("Could not initialize shaders");
		}

		gl.useProgram(shaderProgram);

		// Custom variables on shaderProgram.
		// Addresses of shader attributes obtained by WebGL.
		shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
		gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

		shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
		gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

		// Uniform variable addresses obtained from shader.
		shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	}

	function getShader(gl, id) {
		var shaderScript = document.getElementById(id);
		if (!shaderScript) {
			return null;
		}

		var str = "";
		var k = shaderScript.firstChild;
		while (k) {
			if (k.nodeType === 3) {
				str += k.textContent;
			}
			k = k.nextSibling;
		}

		var shader;
		if (shaderScript.type === "x-shader/x-fragment") {
			shader = gl.createShader(gl.FRAGMENT_SHADER);
		} else if (shaderScript.type === "x-shader/x-vertex") {
			shader = gl.createShader(gl.VERTEX_SHADER);
		} else {
			return null;
		}

		gl.shaderSource(shader, str);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(shader));
			return null;
		}

		return shader;
	}

	function initBuffers() {
		// Triangle vertex position buffer.
		triangleVertexPositionBuffer = gl.createBuffer();
		// Need to set which (current) buffer to use.
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
		var vertices = [
			0, 1, 0,
			-1, -1, 0,
			1, -1, 0
		];
		// Create new Float32Array based on our buffer and use it to fill (current) buffer.
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		triangleVertexPositionBuffer.itemSize = 3;
		triangleVertexPositionBuffer.numItems = 3;

		// Triangle vertex color buffer.
		triangleVertexColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
		var colors = [
			1, 0, 0, 1,
			0, 1, 0, 1,
			0, 0, 1, 1
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
		triangleVertexColorBuffer.itemSize = 4;
		triangleVertexColorBuffer.numItems = 3;

		// Square vertex position buffer.
		squareVertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
		vertices = [
			1, 1, 0,
			-1, 1, 0,
			1, -1, 0,
			-1, -1, 0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		squareVertexPositionBuffer.itemSize = 3;
		squareVertexPositionBuffer.numItems = 4;

		// Square vertex color buffer.
		squareVertexColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
		colors = [];
		for (var i = 0; i < 4; i++) {
			colors = colors.concat([0.5, 0.5, 1, 1]);
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
		squareVertexColorBuffer.itemSize = 4;
		squareVertexColorBuffer.numItems = 4;
	}

	function drawScene() {
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Set up perspective and model-view matrix.
		// 
		// WebGL by default is set to orthographic projection.
		// Vertical FOV is 45 degrees. Width/Height ratio. Render from 0.1 to 100 units from viewpoint.
		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100, pMatrix);
		// Current state stored in model-view matrix.
		// Set model-view matrix to the identity matrix.
		// Holds current position and rotation in matrix.
		// Moves to an origin point to start drawing the 3D world. Moves to center.
		mat4.identity(mvMatrix);
		
		// Triangle - translate and set shader variables.
		// Negative z is further away.
		mat4.translate(mvMatrix, [-1.5, 0, -7.0]);

		// Push copy of mvMatrix onto stack then restore after changes so that only the triangle
		// is affected by rotate.
		mvPushMatrix();
		// Change current rotation state stored in mvMatrix by rotating rTri degrees
		// around y axis.
		mat4.rotate(mvMatrix, degToRad(rTri), [0, 1, 0]);

		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
		gl.vertexAttribPointer(
			shaderProgram.vertexPositionAttribute, 
			triangleVertexPositionBuffer.itemSize,
			gl.FLOAT,
			false,
			0,
			0
		);
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
		gl.vertexAttribPointer(
			shaderProgram.vertexColorAttribute,
			triangleVertexColorBuffer.itemSize,
			gl.FLOAT,
			false,
			0,
			0
		);
		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

		mvPopMatrix();

		// Square - translate and set shader variables.
		mat4.translate(mvMatrix, [3, 0, 0]);

		mvPushMatrix();
		mat4.rotate(mvMatrix, degToRad(rSquare), [1, 0, 0]);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
		gl.vertexAttribPointer(
			shaderProgram.vertexPositionAttribute,
			squareVertexPositionBuffer.itemSize,
			gl.FLOAT,
			false,
			0,
			0
		);
		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
		gl.vertexAttribPointer(
			shaderProgram.vertexColorAttribute,
			squareVertexColorBuffer.itemSize,
			gl.FLOAT,
			false,
			0,
			0
		);
		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);

		mvPopMatrix();
	}

	function mvPushMatrix() {
		var copy = mat4.create();
		mat4.set(mvMatrix, copy);
		mvMatrixStack.push(copy);
	}

	function mvPopMatrix() {
		if (mvMatrixStack === 0) {
			throw "Invalid popMatrix!";
		}
		mvMatrix = mvMatrixStack.pop();
	}

	function degToRad(degrees) {
		return degrees * Math.PI / 180;
	}

	function setMatrixUniforms() {
		// Set shader uniform variables.
		gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	}

	function animate() {
		var timeNow = new Date().getTime();
		if (lastTime != 0) {
			var elapsedTime = timeNow - lastTime;

			rTri += (90 * elapsedTime) / 1000;
			rSquare += (75 * elapsedTime) / 1000;
		}
		lastTime = timeNow;
	}

	function tick() {
		// Provided by Google.
		// Request animation frame from browser instead of setInterval.
		// setInterval runs every open WebGL tab whether hidden or not.
		// Calls only when tab is visible.
		requestAnimFrame(tick);
		drawScene();
		animate();
	}

	function webGLStart() {
		var canvas = document.getElementById("lesson-canvas");
		initGL(canvas);
		initShaders();
		initBuffers();

		gl.clearColor(0, 0, 0, 1);
		gl.enable(gl.DEPTH_TEST);

		tick();
	}

	addLoadEvent(webGLStart);
}();
