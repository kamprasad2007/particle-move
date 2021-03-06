var canvas = document.getElementById('canvas');
var c = canvas.getContext('2d');
var time = null;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var mouse = {
    x: window.innerWidth/2,
    y: window.innerHeight/2
}

var mouseposition = {
    x: innerWidth/2,
    y: innerHeight/2
}

var mousedown = false;

window.addEventListener('mousedown', function(e){
    mouseposition.x = e.clientX;
    mouseposition.y = e.clientY;
    mousedown = true;
    time = new Date().getTime();
});

window.addEventListener('mouseup', function(e){
   mousedown = false;
});

window.addEventListener('mousemove', function(e){
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('resize', function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    init();
});

var colors = [
    {r: 255, g: 71, b: 71},
    {r: 0, g: 206, b: 237},
    {r: 255, g: 255, b: 255}
  ];

function Particle(x, y, dx, dy, radius){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.randomColor =  Math.floor(Math.random() * colors.length);;
    this.mass = 1;
    this.opacity = 1;
    this.deleted = false;
    this.timeToLive = 8;
    this.type = dx && dy? 'T1' : 'T2';
    this.velocity = {
        x:  dx || (Math.random() - 0.5) * 4,
        y:  dy || (Math.random() - 0.5) * 4
    };
}

Particle.prototype.remove = function(){
    return this.timeToLive <= 0;
}

Particle.prototype.update = function(particles) {

    this.draw();

    if(this.type === "T2"){
        if(mousedown){
            let xd = mouseposition.x - this.x;
            let yd = mouseposition.y - this.y;
            let distance = Math.sqrt(Math.pow(xd, 2) + Math.pow(yd, 2));
    
            if(distance > 90){
                this.x += xd * 0.05;
                this.y += yd * 0.05;
            }
        }
    
        for(let i = 0; i < particles.length; i++){
            if(this === particles[i]) continue;
            if(distance(this.x, this.y, particles[i].x, particles[i].y) - this.radius * 2 <= 0){
                resolveCollision(this, particles[i]);
            }
        }
    
        if(this.x - this.radius <= 0 || this.x + this.radius >= window.innerWidth){
            this.velocity.x = -this.velocity.x;
        }
    
        if(this.y - this.radius <= 0 || this.y + this.radius >= window.innerHeight){
            this.velocity.y = -this.velocity.y;
        }
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;
    
    if(mousedown && new Date().getTime() - time > 3000){
        this.deleted = true;
    }

    if(this.type === "T1"){

        if (this.x + this.radius >= canvas.width || this.x - this.radius <= 0)
        this.dx = -this.dx

        if (this.y + this.radius >= canvas.height || this.y - this.radius <= 0)
            this.dy = -this.dy

        this.x = Math.min(Math.max(this.x, 0 + this.radius), canvas.width - this.radius)
        this.y = Math.min(Math.max(this.y, 0 + this.radius), canvas.height - this.radius)

        this.opacity -= 1 / (this.timeToLive / 0.01)
        this.radius -= this.radius/ (this.timeToLive / 0.01)
    
        if (this.radius < 0) this.radius = 0 
    
        this.timeToLive -= 0.01
    }
}

Particle.prototype.draw = function() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.strokeStyle = 'rgba(' +colors[this.randomColor].r +',' +
                            colors[this.randomColor].g +',' +
                            colors[this.randomColor].b +',' +
                            this.opacity +')';
    c.stroke();
    c.closePath();
}

function randomIntFromRange(min, max){
   return Math.floor( Math.random() * (max - min + 1) + min );
}

function distance(x1, y1, x2, y2){
    return Math.sqrt( Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}

var particles;
function init(){
    particles = [];
    let radius = 30;

    for(let i = 0; i < 70; i++){
        let x = randomIntFromRange(radius, window.innerWidth - radius);
        let y = randomIntFromRange(radius, window.innerHeight - radius);

        for(let j = 0; j < particles.length; j++){

            if(distance(x, y , particles[j].x, particles[j].y) - radius * 2 < 1){
                x = randomIntFromRange(radius, window.innerWidth - radius);
                y = randomIntFromRange(radius, window.innerHeight - radius);

                j = -1;
            }
        }

        particles.push(new Particle(x, y, null, null, radius));
    }
}

function animate(){

    if(particles.length == 0) return;

    requestAnimationFrame(animate);

    c.fillStyle = 'rgba(0, 0, 0, 0.05)';
    c.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.update(particles);
    });

    particles = particles.filter(a => !a.deleted)
    if(particles.length === 0){
        c.fillStyle = 'rgba(0, 0, 0)';
        c.fillRect(0, 0, canvas.width, canvas.height);
        time = null;
        animateExplosions();
    }
}

function Explosion(x, y) {
    this.particles = [];	
  
    this.init = function() {
      for (var i = 1; i <= 1; i++) {
        var randomVelocity = {
          x: (Math.random() - 0.5) * 3.5,
          y: (Math.random() - 0.5) * 3.5,
        }
        this.particles.push(new Particle(x, y, randomVelocity.x, randomVelocity.y, 30));				
      }
    }
  
    this.init();
  
    this.draw = function() {
      for (var i = 0; i < this.particles.length; i++) {
        this.particles[i].update();	
  
        if (this.particles[i].remove() == true) {
          this.particles.splice(i, 1);	
        };
      }	
    }
  }

var explosions = [];
function animateExplosions() {
    window.requestAnimationFrame(animateExplosions);

    c.fillStyle = "#1e1e1e";
    c.fillRect(0, 0, canvas.width, canvas.height);

    explosions.push(new Explosion(mouse.x, mouse.y));

    for (var i = 0; i < explosions.length; i++) {
        explosions[i].draw();
    }
}

init();
animate();