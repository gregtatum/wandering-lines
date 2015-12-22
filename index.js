var Rbrush       = require('rbush')
var OnTap        = require('@tatumcreative/on-tap')
var Random       = require('@tatumcreative/random')
var Intersection = require('./intersection')
var Draw         = require('./draw')
var Simplex      = require('simplex-noise')
var TAU          = Math.PI * 2
var Lerp         = require('lerp')

function _cutOutIntersections( neighbors, bounds, points ) {
	
	var lineEnd
	var lastDistance = Infinity
	
	
	var a = bounds.line
	
	neighbors.forEach(function(neighbor) {
		
		var b = neighbor.line
		
		var intersection = Intersection(
			a[0], a[1], a[2], a[3],
			b[0], b[1], b[2], b[3]
		)
		if( intersection ) {
			var intersectionDistance = (
				( intersection[0] - a[0] ) * ( intersection[0] - a[0] )  +
				( intersection[1] - a[1] ) * ( intersection[1] - a[1] ) 
			)
			if( intersectionDistance < lastDistance ) {
				lastDistance = intersectionDistance
				lineEnd = intersection
			}
		}
	})
	
	if( lineEnd ) {
		// points.push( lineEnd )
		return _lineToBounds([ a[0], a[1], lineEnd[0], lineEnd[1] ])
	}
	
	return false
}

function _lineToBounds( line ) {
	
	var bounds = [
		Math.min(line[0],line[2]),
		Math.min(line[1],line[3]),
		Math.max(line[0],line[2]),
		Math.max(line[1],line[3]),
	]
	
	bounds.line = line
	bounds.theta = Math.atan2( line[3] - line[1], line[2] - line[0] )
	return bounds
}

function _newLine( current, config, x, y, generation, now ) {
	
	var noise = config.simplex3(
		x * config.simplexScale,
		y * config.simplexScale,
		now * config.simplexDepthScale
	)
	
	var theta = noise * TAU
	
	var newX = x + Math.cos( theta ) * config.lineLength
	var newY = y + Math.sin( theta ) * config.lineLength

	var newBounds = _lineToBounds([ x, y, newX, newY ])
	var neighbors = current.tree.search( newBounds )
			
	var cutBounds = _cutOutIntersections( neighbors, newBounds, current.points )
	
	if( cutBounds ) {
		newBounds = cutBounds
	}
	newBounds.line.generation = generation
	current.tree.insert( newBounds )
	current.lines.push( newBounds.line )
	
	if( !cutBounds ) {
		return newBounds
	}
}

function _createMargin( config, current ) {
	
	var w = window.innerWidth * config.margin * devicePixelRatio
	var h = window.innerHeight * config.margin * devicePixelRatio
	
	var centerX = window.innerWidth * 0.5 * devicePixelRatio
	var centerY = window.innerHeight * 0.5 * devicePixelRatio
	
	var size = Math.min( w, h ) * 0.5
	
	var x1 = centerX - size
	var x2 = centerX + size
	var y1 = centerY - size
	var y2 = centerY + size
	
	console.table([[x1,y1,x2,y2]])
	console.table([[x1/2,y1/2,x2/2,y2/2]])
	current.tree.insert( _lineToBounds([x1,y1,x2,y1]) )
	current.tree.insert( _lineToBounds([x2,y1,x2,y2]) )
	current.tree.insert( _lineToBounds([x2,y2,x1,y2]) )
	current.tree.insert( _lineToBounds([x1,y2,x1,y2]) )
	
	current.bounds = [
		Lerp( centerX, x1, 0.5 ),
		Lerp( centerY, y1, 0.5 ),
		Lerp( centerX, x2, 0.5 ),
		Lerp( centerY, y2, 0.5 ),
	]
}

function _updateSmooth( current, config ) {
	
	var now = Date.now()
	
	for( var i=0; i < config.activeLines; i++ ) {
		
		var bounds = current.active[i]
		var x, y, generation
		
		if( bounds ) {
			x = bounds.line[2]
			y = bounds.line[3]
			generation = bounds.generation
		} else {
			x = config.random( current.bounds[0], current.bounds[2] )
			y = config.random( current.bounds[1], current.bounds[3] )
			generation = Math.log(current.generation++)
		}
		
		current.active[i] = _newLine( current, config, x, y, generation, now )
	}
}

function originX() {
	window.innerWidth
}

function init() {
	
	var seed = window.location.hash || String(Math.random())
	var random = Random( seed )
	var simplex = new Simplex( random )
	var simplex3 = simplex.noise3D.bind(simplex)
	
	var config = {
		margin: 0.9,
		activeLines : 10,
		random : random,
		simplex3 : simplex3,
		initialCount : 100,
		maxAngle : Math.PI * 0.2,
		lineLength : 5,
		simplexScale : 0.001,
		simplexDepthScale : 0.0001,
	}
	
	var current = {
		tree : Rbrush(9),
		active : [],
		points : [],
		lines : [],
		bounds : null,
		generation : 0,
	}
	
	_createMargin( config, current )
	
	var draw = Draw( current )
	
	function loop() {
		_updateSmooth( current, config )
		draw()
		requestAnimationFrame( loop )
	}
	loop()
	
}

init()