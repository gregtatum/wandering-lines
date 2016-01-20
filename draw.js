var TAU = Math.PI * 2

function _drawBoundingBoxes( ctx, config, lines ) {

	ctx.lineWidth = config.boundingBoxWidth * devicePixelRatio
	ctx.strokeStyle = config.boundingBoxColor
	
	lines.forEach(function( line ) {
		
		var x = line[0] < line[2] ? line[0] : line[2]
		var y = line[1] < line[3] ? line[1] : line[3]
		var w = Math.abs( line[0] - line[2] )
		var h = Math.abs( line[1] - line[3] )
		ctx.strokeRect( x, y, w, h )
	})
}

function _drawPoints( ctx, config, points ) {
	var size = config.pointSize * devicePixelRatio
	var halfSize = config.pointSize / 2 * devicePixelRatio
	
	ctx.fillStyle = config.pointColor
	points.forEach(function( pt ) {
		
		ctx.beginPath()
		ctx.arc( pt[0],	pt[1], config.pointSize, 0, TAU )
		ctx.fill()
	})
}

function _drawLines( ctx, config, lines ) {
	
	ctx.strokeStyle = config.lineColor
	
	lines.forEach(function( line ) {
		
		ctx.lineWidth = (10 - line.generation) / 10 * config.lineWidth * devicePixelRatio
		ctx.beginPath()
		ctx.moveTo( line[0], line[1] )
		ctx.lineTo( line[2], line[3] )
		ctx.stroke()
		ctx.closePath()
	})
	
}

function _prepCanvasAndGetCtx() {
	
	var canvas = document.querySelector('canvas')
	
	function resize() {
		canvas.width = window.innerWidth * devicePixelRatio
		canvas.height = window.innerHeight * devicePixelRatio
	}
	
	window.addEventListener('resize', resize, false)
	resize()
	
	return canvas.getContext('2d')
}

module.exports = function setupDraw( current ) {

	var config = {
		pointSize : 2,
		pointColor : "#fff",
		lineWidth : 4,
		lineColor : "#ddd",
		boundingBoxWidth : 1,
		boundingBoxColor : "rgba(255,0,0,0.15)",
	}
	
	var ctx = _prepCanvasAndGetCtx()
	
	function draw(redrawAll) {
		
		// ctx.clearRect(
		// 	0, 0,
		// 	window.innerWidth * devicePixelRatio,
		// 	window.innerHeight * devicePixelRatio
		// )
		// _drawBoundingBoxes( ctx, config, current.lines )
		// _drawPoints( ctx, config, current.points )
	
		var lines = redrawAll ? current.lines : current.newLines
		_drawLines( ctx, config, lines )
	}
	
	window.addEventListener('resize', draw.bind(null, true), false)
	return draw
}