var Rbrush       = require('rbush')
var OnTap        = require('@tatumcreative/on-tap')
var Intersection = require('./intersection')
var Draw         = require('./draw')

function _clickToCreatePoints( current, draw, tree ) {
	
	var prevX = null
	var prevY = null
	
	OnTap( document.querySelector('canvas'), function(e) {
		
		var x = e.x * devicePixelRatio
		var y = e.y * devicePixelRatio
		
		if( prevX === null ) {
			current.points.push([x,y])
			prevX = x
			prevY = y
		} else {
			
			var bounds = _lineToBounds([prevX,prevY,x,y])
			var neighbors = tree.search( bounds )
			
			bounds = _cutOutIntersections( neighbors, bounds, current.points )
			
			current.points.push([bounds.line[2],bounds.line[3]])
			
			current.lines.push( bounds.line )
			tree.insert( bounds )
			prevX = null
			prevY = null
		}
		
		draw()
	})
}

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
		points.push( lineEnd )
		return _lineToBounds([ a[0], a[1], lineEnd[0], lineEnd[1] ])
	}
	
	return bounds
}

function _lineToBounds( line ) {
	
	var bounds = [
		Math.min(line[0],line[2]),
		Math.min(line[1],line[3]),
		Math.max(line[0],line[2]),
		Math.max(line[1],line[3]),
	]
	
	bounds.line = line
	
	return bounds
}

function init() {
	
	var tree = Rbrush(9)
	
	var config = {
		pointSize : 2,
		pointColor : "#fff",
		lineWidth : 1,
		lineColor : "#208FF3",
		boundingBoxWidth : 1,
		boundingBoxColor : "rgba(255,0,0,0.15)",
	}
	
	var current = {
		points : [],
		lines : []
	}
	
	var draw = Draw( config, current )
	
	_clickToCreatePoints( current, draw, tree )
}

init()