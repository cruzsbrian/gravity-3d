var ctx;

var particles = new Array();
var centerX;
var centerY;
var panX = 0;
var panY = 0;
var panZ = 0;
var initPanX = 0;
var initPanY = 0;
var initPanZ = 0;
var rotX = 0;
var rotY = 0;
var initRotX = 0;
var initRotY = 0;
var mouseInitX;
var mouseInitY;
var scroll = 0;
var dragging = false;
var rotating = false;

function newParticle(m, v, p) {
	var p = new Particle(m, v, p);
	particles[particles.length] = p;
}

function cloud() {
	for (var i = 0; i < 1000; i++) {
		var angle1 = Math.random() * 2 * Math.PI;
		var angle2 = Math.random() * 2 * Math.PI;
		var dist = Math.pow(Math.random(), 2) * 255;
		
		var x = dist * Math.cos(angle1) * Math.cos(angle2);
		var y = dist * Math.sin(angle1) / 2;
		var z = dist * Math.cos(angle1) * Math.sin(angle2);

		var vx = Math.sqrt(dist) * Math.cos(angle1) * Math.sin(angle2);
		var vz = -Math.sqrt(dist) * Math.cos(angle1) * Math.cos(angle2);

		newParticle(2, new Vector3D(vx, 0, vz), new Vector3D(x, y, z));
	}
}

$(document).ready(function() {
	centerX = $(window).width() / 2;
	centerY = $(window).height() / 2;
	ctx = $("#canvas")[0].getContext("2d");
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;

	$("#canvas").mousedown(function(e) {
		mouseInitX = e.clientX;
		mouseInitY = e.clientY;

		initRotX = rotX;
		initRotY = rotY;
		initPanX = panX;
		initPanY = panY;

		dragging = true;
	});

	$("#canvas").mousemove(function(e) {
		if (dragging) {
			if (rotating) {
				// rotating around x axis from y movement and vice versa
				rotX = initRotX + e.clientY - mouseInitY;
				rotY = initRotY + e.clientX - mouseInitX;
			} else {
				var panVector = new Vector3D(e.clientX - mouseInitX, e.clientY - mouseInitY, 0);
				panVector = rotateVector(panVector, -rotX, -rotY);
				panX = initPanX + panVector.x;
				panY = initPanY + panVector.y;
				panZ = initPanZ + panVector.z;
			}
		}
	});

	$("#canvas").mouseup(function() {
		dragging = false;
	});

	$(window).bind("mousewheel", function(e) {
		var panVector = new Vector3D(0, 0, e.originalEvent.wheelDelta);
		panVector = rotateVector(panVector, -rotX, -rotY);
		panX = initPanX + panVector.x;
		panY = initPanY + panVector.y;
		panZ = initPanZ + panVector.z;

		initPanZ = panZ;
	});

	$("body").keydown(function(e) {
		if (e.which == 16) {
			rotating = true;
		}
	});

	$("body").keyup(function(e) {
		if (e.which == 32) {
			cloud();
		}
		if (e.which == 16) {
			rotating = false;
		}
	});

	var t = setInterval(function() {
		gravityCalc(particles);

		var paintParticles = particles.slice(0);
		paintParticles.sort(function(a, b) {
			return a.apparentZ - b.apparentZ;
		});

		ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

		for (var i = 0; i < paintParticles.length; i++) {
			paintParticles[i].paint();
		}

		console.log(scroll);
	}, 15);
});
