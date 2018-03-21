var canvas = document.querySelector("canvas")
var c = canvas.getContext("2d")
canvas.width = window.innerWidth
canvas.height = window.innerHeight

var mouse = {x: undefined,
			 y: undefined}

window.addEventListener("mousemove", function(event) {
	mouse.x = event.x
	mouse.y = event.y
	Circle.x = mouse.x
	Circle.y = mouse.y
})

window.addEventListener("resize", function(event) {
	canvas.width  = innerWidth
	canvas.height = innerHeight
})

window.addEventListener("click", function(event) {
	Circle.dir_left = !Circle.dir_left
})

function randint(a, b){
    var c = b - a
    return Math.floor(Math.random() * c) + a
}

function randitem(list){
	return list[randint(0, list.length)]
}

function distance(x1, y1, x2, y2){
    const xDist = x2 - x1
    const yDist = y2 - y1
    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
}

function line(x, y, x2, y2, width, color){
	c.beginPath();
	c.moveTo(x, y);
	c.lineTo(x2, y2);
	c.lineWidth = width;
	c.strokeStyle = color;
	c.stroke();
	c.closePath();
}

function rect(x, y, width, height, color){
	c.fillRect(x, y, width, height)
    c.fillStyle = color
}

function Color(r, g, b){
	this.r = r
	this.g = g
	this.b = b
	this.a = 1

	this.to_string = function(){
		return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")"
	}

	this.update_string = function(){
		this.string = this.to_string()
	}

	this.string = this.to_string()
}


function Particle(x, y, dx=0, dy=0, color=new Color(0, 0, 0), size=5, lifespan=5){
    this.x = x
    this.y = y
    this.x2 = x - dx
    this.y2 = y - dy
    this.x3 = this.x2 - dx
    this.y3 = this.y3 - dy
    this.dx = dx
    this.dy = dy

    this.color = Object.assign({}, color)
    this.size = size
    this.lifespan = lifespan

    this.move_x = function(dx){
        this.x += dx
    }

    this.move_y = function(dy){
        this.y += dy
    }

    this.move = function(dx, dy){
        this.move_x(dx)
        this.move_y(dy)
    }

    this.update_in_box = function(x1, y1, x2, y2){
        if (this.x <= x1){
            this.dx *= -1
            this.x = x1
        } else if (this.x + this.size >= x2){
            this.dx *= -1
            this.x = x2 - this.size
        }

        if (this.y <= y1){
            this.dy *= -1
            this.y = y1
        } else if (this.y + this.y >= y2){
            this.dy *= -1
            this.y = y2 - this.size
        }
    }

    this.update_in_ground = function(y){
        if (this.y + this.size >= y){
            this.dy *= -1
            this.y = y - this.size
        }
    }

    this.update_move = function(){
    	this.x3 = this.x2
    	this.y3 = this.y2
    	this.x2 = this.x
    	this.y2 = this.y
        this.dx *= 0.99
        this.dy *= 0.99
        this.move(this.dx, this.dy)
    }

    this.dead = function(){
        return (this.size <= 0 || this.lifespan <= 0 || this.color.a <= 0)
    }

    this.display = function(){
    	line(this.x, this.y, this.x3, this.y3, this.size, this.color.string)
    	rect(this.x, this.y, this.size, this.size, this.color.string)
    }

    this.update_lifespan = function(){
    	if (this.lifespan - 0.05 >= 0){
    		this.lifespan -= 0.05
    	} else{
    		this.lifespan = 0
    	}
    }

    this.update_color = function(){
        if (this.lifespan > 1){
        	this.color.a -= 0.005
        } else{
        	this.color.a -= 0.008
        }
        this.color.update_string()
    }

    this.update_size = function(){
    	if (this.lifespan > 1){
    		if (this.size - 0.01 >= 0){
    			this.size -= 0.01
    		} else{
    			this.size = 0
    		}
    	} else{
    		if (this.size - 0.1 >= 0){
    			this.size -= 0.1
    		} else{
    			this.size = 0
    		}
    	}
    }

    this.update_appearance = function(){
    	this.update_color()
    	this.update_size()
    }

    this.update_life = function(){
    	this.update_lifespan()
    	this.update_appearance()
    }

    this.functions = function(){
    	this.update_move()
    	this.display()
    	this.update_appearance()
    }
}

function ParticleCircle(amount, x, y, radius, colors, speed, dir_left=true){
	this.amount = amount
	this.x = x
	this.y = y
	this.radius = radius
	this.colors = colors
	this.points = []
	this.speed = speed
	this.dir_left = dir_left

	this.new = function(){
		for (let i = 0; i < this.amount; i++){
			radius = randint(this.radius * 0.95, this.radius * 1.05)
			degrees = randint(0, 360)
			radian = degrees * (Math.PI / 180)
			x = this.x + radius * Math.cos(radian)
			y = this.y + radius * Math.sin(radian)

			if (this.dir_left){
				right_angle = 180 - degrees
			} else{
				right_angle = 360 - degrees
			}
			dir = randint(right_angle * 0.9, right_angle * 1.05) * (Math.PI / 180)
			dxy = randint(this.speed * 0.9 * 5, this.speed * 1.1 * 5) / 5
			dx = dxy * Math.sin(dir)
			dy = dxy * Math.cos(dir)

			color = randitem(this.colors)
			size = randint(2, 4)
			lifespan = randint(5, 20) / 10
			this.points.push(new Particle(x, y, dx, dy, color, size, lifespan))
		}
	}

	this.update_move = function(){
		for (let i = 0; i < this.points.length; i++){
			this.points[i].update_move()
		}
	}

	this.display = function(){
		for (let i = 0; i < this.points.length; i++){
			this.points[i].distance()
		}
	}

	this.functions =function(){
		for (let i = 0; i < this.points.length; i++){
			particle = this.points[i]
			particle.functions()
			if (particle.dead()){
				this.points.splice(i, 1)
			}
		}
	}
}

var colors = [new Color(255, 255, 0), new Color(255, 255, 200), new Color(200, 200, 0), new Color(255, 150, 0),
			  new Color(250, 240, 10), new Color(210, 205, 0), new Color(250, 215, 0), new Color(240, 160, 10)]
var Circle = new ParticleCircle(20, innerWidth / 2, innerHeight / 2, 300, colors, 4, false)

function animate(){
    requestAnimationFrame(animate)
    c.fillStyle = "rgba(0, 0, 0, 0.6)"
	c.fillRect(0, 0, canvas.width, canvas.height)

    Circle.new()
    Circle.functions()
}

animate()
