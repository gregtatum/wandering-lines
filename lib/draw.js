var TAU = Math.PI * 2

function _drawLines( ctx, config, plot, lines ) {
	ctx.strokeStyle = config.lineColor
	ctx.lineCap = 'round'
	
	lines.forEach(function( line ) {
		ctx.lineWidth = plot.line(
			(10 - line.generation) / 10 * config.lineWidth
		)
		ctx.beginPath()
		ctx.moveTo(
			plot.x(line[0], line[1]),
			plot.y(line[0], line[1])
		)
		ctx.lineTo(
			plot.x(line[2], line[3]),
			plot.y(line[2], line[3])
		)
		ctx.stroke()
		ctx.closePath()
	})
}

function _prepCanvasAndGetCtx(canvas) {
	
	function resize() {
		canvas.width = window.innerWidth * devicePixelRatio
		canvas.height = window.innerHeight * devicePixelRatio
	}
	resize(), window.addEventListener('resize', resize, false)
	
	return canvas.getContext('2d')
}

function _setupPlotting(config, current, canvas) {
	// [-1,1] range to approximately [0,canvas.size]
	function resize() {
		current.ratio = canvas.width / canvas.height
		
		if( current.ratio < 1 ) {
			current.width = canvas.width
			current.height = canvas.height * current.ratio
		} else {
			current.ratio = 1 / current.ratio
			current.width = canvas.width * current.ratio
			current.height = canvas.height
		}
		
		current.offsetX = (canvas.width - current.width) / 2
		current.offsetY = (canvas.height - current.height) / 2
		
		current.size = (
			Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height)
			/ config.baseScreenDiagonal
		)
	}
	resize(), window.addEventListener('resize', resize, false)
	
	var cos = Math.cos(config.rotation)
	var sin = Math.sin(config.rotation)
	
	return {
		x : function (x, y) {
			x -= 0.5; y -= 0.5
			var xp = x*cos - y*sin + 0.5
			return current.offsetX + xp * current.width
		},
		y : function (x, y) {
			x -= 0.5; y -= 0.5
			var yp = x*sin + y*cos + 0.5
			return current.offsetY + yp * current.height
		},
		line : function(n) {
			return n * current.size
		}
	}
}

module.exports = function setupDraw( graph ) {

	var config = {
		baseScreenDiagonal : 1000,
		lineWidth : 2,
		lineColor : "#ddd",
		rotation : Math.PI / 4
	}
	var current = {
		ratio : 1,
		width : 0,
		height : 0,
	}
	
	var canvas = document.querySelector('canvas')
	var ctx = _prepCanvasAndGetCtx(canvas)
	var plot = _setupPlotting(config, current, canvas)
	
	function draw(redrawAll) {
		var lines = redrawAll ? graph.lines : graph.newLines
		_drawLines( ctx, config, plot, lines )
	}
	
	window.addEventListener('resize', draw.bind(null, true), false)
	return draw
}
