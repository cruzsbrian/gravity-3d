function Vector2D(x, y) {
	this.x = x;
	this.y = y;
}

function Vector3D(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}

function transformVector(v) {
	var translatedX, translatedY, translatedZ;
	var rotatedX, rotatedY, rotatedZ;

	translatedX = v.x + panX;
	translatedY = v.y + panY;
	translatedZ = v.z;
	rotatedX = translatedX;
	rotatedY = translatedY;
	rotatedZ = translatedZ;

	rotatedX = translatedX * Math.cos(rotY / 180) + translatedZ * Math.sin(rotY / 180);
	rotatedZ = translatedZ * Math.cos(rotY / 180) - translatedX * Math.sin(rotY / 180);
	translatedZ = rotatedZ;

	rotatedY = translatedY * Math.cos(rotX / 180) + translatedZ * Math.sin(rotX / 180);
	rotatedZ = translatedZ * Math.cos(rotX / 180) - translatedY * Math.sin(rotX / 180);

	return new Vector3D(rotatedX, rotatedY, rotatedZ);
}

function Particle(m, v, p) {
	this.mass = m;
	this.velocity = v;
	this.position = p;
	this.apparentZ = this.z;
	this.absorb = absorbParticle;
	this.adoptChanges = adoptChanges;
	this.paint = paintParticle;
	this.radius = Math.cbrt(this.mass);
}

function absorbParticle(p) {
	this.velocity.x = (this.velocity.x * this.mass + p.velocity.x * p.mass) / (this.mass + p.mass);
	this.velocity.y = (this.velocity.y * this.mass + p.velocity.y * p.mass) / (this.mass + p.mass);
	this.velocity.z = (this.velocity.z * this.mass + p.velocity.z * p.mass) / (this.mass + p.mass);
	this.position.x = (this.position.x * this.mass + p.position.x * p.mass) / (this.mass + p.mass);
	this.position.y = (this.position.y * this.mass + p.position.y * p.mass) / (this.mass + p.mass);
	this.position.z = (this.position.z * this.mass + p.position.z * p.mass) / (this.mass + p.mass);

	this.mass += p.mass;
	this.radius = Math.cbrt(this.mass);
}

function adoptChanges() {
	this.position = transformVector(this.position);

	var rotatedvX = this.velocity.x * Math.cos(rotY / 180) + this.velocity.z * Math.sin(rotY / 180);
	var rotatedvZ = this.velocity.z * Math.cos(rotY / 180) - this.velocity.x * Math.sin(rotY / 180);
	this.velocity.z = rotatedvZ;

	var rotatedvY = this.velocity.y * Math.cos(rotX / 180) + this.velocity.z * Math.sin(rotY / 180);
	rotatedvZ = this.velocity.z * Math.cos(rotX / 180) - this.velocity.y * Math.sin(rotY / 180);

	this.velocity = new Vector3D(rotatedvX, rotatedvY, rotatedvZ);

}

function paintParticle() {
	var pos = transformVector(this.position);
	this.apparentZ = pos.z;

	var dispX = pos.x * (pos.z + 1000) * 0.001;
	var dispY = pos.y * (pos.z + 1000) * 0.001;
	var dispRadius = this.radius * (pos.z + 250) * 0.004 + 1;
	if (dispRadius < 0) {
		dispRadius = 0;
	}

	var lightness = Math.floor(this.radius * 200 / 32) + 50;
	ctx.strokeStyle = "black";
	ctx.fillStyle = "rgb(" + lightness + ", " + lightness + ", " + lightness + ")";
	ctx.beginPath();
	ctx.arc(dispX + centerX, dispY + centerY, dispRadius, 2 * Math.PI, false);
	ctx.stroke();
	ctx.fill();
}

function gravityCalc(p) {
	for (var i = 0; i < p.length; i++) {
		forceSum = new Vector3D(0, 0, 0);
		for (var j = 0; j < p.length; j++) {
			if (j != i) {
				var xDist = p[i].position.x - p[j].position.x;
				var yDist = p[i].position.y - p[j].position.y;
				var zDist = p[i].position.z - p[j].position.z;
				var distance = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2) + Math.pow(zDist, 2));
				if (distance < p[i].radius + p[j].radius) {
					p[i].absorb(p[j]);
					p.splice(j, 1);
				} else {
					var forceMag = p[i].mass * p[j].mass / Math.pow(distance, 2);
					var nextStep = forceMag / p[i].mass + forceMag / p[j].mass;
					if (distance < nextStep) {
						p[i].absorb(p[j]);
						p.splice(j, 1);
					} else {
						forceSum.x -= Math.abs(forceMag * (xDist / distance)) * Math.sign(xDist);
						forceSum.y -= Math.abs(forceMag * (yDist / distance)) * Math.sign(yDist);
						forceSum.z -= Math.abs(forceMag * (zDist / distance)) * Math.sign(zDist);
					}
				}
			}
		}
		p[i].velocity.x += forceSum.x / p[i].mass;
		p[i].velocity.y += forceSum.y / p[i].mass;
		p[i].velocity.z += forceSum.z / p[i].mass;
	}

	for (var i = 0; i < p.length; i++) {
		p[i].position.x += p[i].velocity.x / 10;
		p[i].position.y += p[i].velocity.y / 10;
		p[i].position.z += p[i].velocity.z / 10;
	}
}
