var lesson02 = function() {

	var gl;
	var shaderProgram;

	// Vertex buffers
	// Changed names from triangle to pyramid and square to cube.
	var pyramidVertexPositionBuffer;
	var pyramidVertexColorBuffer;
	var cubeVertexPositionBuffer;
	var cubeVertexColorBuffer;
	var cubeVertexIndexBuffer;

	// Model view and perspective matrices.
	var mvMatrix = mat4.create();
	var pMatrix = mat4.create();
	var mvMatrixStack = [];

	// Rotations
	// Changed names from triangle to pyramid and square to cube.
	var rPyramid = 0;
	var rCube = 0;

	// Animate
	var lastTime = 0;

	function initGL(canvas) {
		try {
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
		pyramidVertexPositionBuffer = gl.createBuffer();
		// Need to set which (current) buffer to use.
		gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
		var vertices = [
			// Front face
	         0.0,  1.0,  0.0,
	        -1.0, -1.0,  1.0,
	         1.0, -1.0,  1.0,
	        // Right face
	         0.0,  1.0,  0.0,
	         1.0, -1.0,  1.0,
	         1.0, -1.0, -1.0,
	        // Back face
	         0.0,  1.0,  0.0,
	         1.0, -1.0, -1.0,
	        -1.0, -1.0, -1.0,
	        // Left face
	         0.0,  1.0,  0.0,
	        -1.0, -1.0, -1.0,
	        -1.0, -1.0,  1.0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		pyramidVertexPositionBuffer.itemSize = 3;
		pyramidVertexPositionBuffer.numItems = 12;

		pyramidVertexColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
		var colors = [
	        // Front face
	        1.0, 0.0, 0.0, 1.0,
	        0.0, 1.0, 0.0, 1.0,
	        0.0, 0.0, 1.0, 1.0,
	        // Right face
	        1.0, 0.0, 0.0, 1.0,
	        0.0, 0.0, 1.0, 1.0,
	        0.0, 1.0, 0.0, 1.0,
	        // Back face
	        1.0, 0.0, 0.0, 1.0,
	        0.0, 1.0, 0.0, 1.0,
	        0.0, 0.0, 1.0, 1.0,
	        // Left face
	        1.0, 0.0, 0.0, 1.0,
	        0.0, 0.0, 1.0, 1.0,
	        0.0, 1.0, 0.0, 1.0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
		pyramidVertexColorBuffer.itemSize = 4;
		pyramidVertexColorBuffer.numItems = 12;

		cubeVertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
		vertices = [
			// Front face
	      	-1.0, -1.0,  1.0,
       		1.0, -1.0,  1.0,
       		1.0,  1.0,  1.0,
      		-1.0,  1.0,  1.0,

	      	// Back face
	      	-1.0, -1.0, -1.0,
	      	-1.0,  1.0, -1.0,
	      	1.0,  1.0, -1.0,
	      	1.0, -1.0, -1.0,

	      	// Top face
	      	-1.0,  1.0, -1.0,
	      	-1.0,  1.0,  1.0,
	       	1.0,  1.0,  1.0,
	       	1.0,  1.0, -1.0,

	      	// Bottom face
	      	-1.0, -1.0, -1.0,
	       	1.0, -1.0, -1.0,
	       	1.0, -1.0,  1.0,
	      	-1.0, -1.0,  1.0,

	      	// Right face
	       	1.0, -1.0, -1.0,
	       	1.0,  1.0, -1.0,
	       	1.0,  1.0,  1.0,
	       	1.0, -1.0,  1.0,

	      	// Left face
	      	-1.0, -1.0, -1.0,
	      	-1.0, -1.0,  1.0,
	      	-1.0,  1.0,  1.0,
	      	-1.0,  1.0, -1.0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		cubeVertexPositionBuffer.itemSize = 3;
		cubeVertexPositionBuffer.numItems = 24;

		cubeVertexColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
		colors = [
			[1.0, 0.0, 0.0, 1.0],     // Front face
	      	[1.0, 1.0, 0.0, 1.0],     // Back face
	      	[0.0, 1.0, 0.0, 1.0],     // Top face
	      	[1.0, 0.5, 0.5, 1.0],     // Bottom face
	      	[1.0, 0.0, 1.0, 1.0],     // Right face
	      	[0.0, 0.0, 1.0, 1.0],     // Left face
		];
		var unpackedColors = [];
	    for (var i in colors) {
	      	var color = colors[i];
	      	for (var j=0; j < 4; j++) {
	        	unpackedColors = unpackedColors.concat(color);
	      	}
	    }
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
		cubeVertexColorBuffer.itemSize = 4;
		cubeVertexColorBuffer.numItems = 24;

		cubeVertexIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
		var cubeVertexIndices = [
	      	0, 1, 2,      0, 2, 3,    // Front face
      		4, 5, 6,      4, 6, 7,    // Back face
      		8, 9, 10,     8, 10, 11,  // Top face
      		12, 13, 14,   12, 14, 15, // Bottom face
      		16, 17, 18,   16, 18, 19, // Right face
      		20, 21, 22,   20, 22, 23  // Left face
		];
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
		cubeVertexIndexBuffer.itemSize = 1;
		cubeVertexIndexBuffer.numItems = 36;
	}

	function drawScene() {
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100, pMatrix);
		mat4.identity(mvMatrix);
		
		mat4.translate(mvMatrix, [-1.5, 0, -7.0]);

		mvPushMatrix();
		mat4.rotate(mvMatrix, degToRad(rPyramid), [0, 1, 0]);

		gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
		gl.vertexAttribPointer(
			shaderProgram.vertexPositionAttribute, 
			pyramidVertexPositionBuffer.itemSize,
			gl.FLOAT,
			false,
			0,
			0
		);
		gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
		gl.vertexAttribPointer(
			shaderProgram.vertexColorAttribute,
			pyramidVertexColorBuffer.itemSize,
			gl.FLOAT,
			false,
			0,
			0
		);
		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems);

		mvPopMatrix();

		// We want each cube side to have a different color.
		// There are 3 ways to draw this.
		// 1. Use a single 'triangle strip'. Use vertex we have now then add 2 vertices
		// to make a face, then 2 more, and so on. Efficient but every face wants a 
		// different color and each vertex is shared between 3 corners. We have to specify
		// each vertex 3 times.
		// 2. Draw cube in 6 separate squares. Not a good practice and requires many draw calls.
		// We should just use 1 drawArrays call.
		// 3. Specify the cube as six squares, each made up of two triangles but send it
		// to WebGL in one call. Specify triangles in their entirety each time
		// rather than simply defining each triangle by adding a single point to the previous one.
		mat4.translate(mvMatrix, [3, 0, 0]);

		mvPushMatrix();
		mat4.rotate(mvMatrix, degToRad(rCube), [1, 1, 1]);

		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
		gl.vertexAttribPointer(
			shaderProgram.vertexPositionAttribute,
			cubeVertexPositionBuffer.itemSize,
			gl.FLOAT,
			false,
			0,
			0
		);
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
		gl.vertexAttribPointer(
			shaderProgram.vertexColorAttribute,
			cubeVertexColorBuffer.itemSize,
			gl.FLOAT,
			false,
			0,
			0
		);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
		setMatrixUniforms();
		gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

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

			rPyramid += (90 * elapsedTime) / 1000;
			rCube -= (75 * elapsedTime) / 1000;
		}
		lastTime = timeNow;
	}

	function tick() {
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
