# ClipperJS
[Clipper](https://sourceforge.net/projects/jsclipper/) abstraction layer (simplified API)

Target of this library is to remove complexity and create an overall cleaner API for Clipper.

When using this API one class, Shape, is used. Shape is a collection of paths that are all collectively closed or open. Shapes with holes are defined as multiple closed paths where the outlines are clockwise and the holes are counter-clockwise. Shapes has multiple functions that can be used to for instance compute complex boolean operations from one just call.

The next two code examples show a simple Boolean operation in clipper and in ClipperJS. Both use two predefined paths

```javascript
const subjectPaths = [[{ X: 30, Y: 30 }, { X: 10, Y: 30 }, { X: 10, Y: 10 }, { X: 30, Y: 10 }]];
const clipPaths = [[{ X: 20, Y: 20 }, { X: 0, Y: 20 }, { X: 0, Y:0 }, { X: 20, Y: 0 }]];
```

A boolean intersect operation in clipper looks like this
```javascript
const result = new ClipperLib.Paths();
const clipper = new ClipperLib.Clipper();
clipper.AddPaths(subjectPaths, ClipperLib.PolyType.ptSubject, true);
clipper.AddPaths(clipPaths, ClipperLib.PolyType.ptClip, true);
clipper.Execute(ClipperLib.ClipType.ctIntersection, result);

// result = [[{ X: 20, Y: 20 }, { X: 10, Y: 20 }, { X: 10, Y: 10 }, { X: 20, Y: 10 }]]
```

In ClipperJS
```javascript
const subject = new Shape(subjectPaths, true);
const clip = new Shape(subjectPaths, true);

const result = subject.intersect(clip);

// result = { closed: true, paths: [[{ X: 20, Y: 20 }, { X: 10, Y: 20 }, { X: 10, Y: 10 }, { X: 20, Y: 10 }]] }
```

# Usage
Include the library.

Using JSPM
```javascript
import Shape from 'Doodle3D/ClipperJS';
```

Using NPM
```javascript
const Shape from 'clipper-js';
```

# API

**Shape**

Shape accepts 3 optional arguments, `paths`, `closed` and `capitalConversion`. `paths` can be be devined with both upper case and lower case. Clipper only uses uppercase properties, when input is given with lower case `captalConversion` needs to be set to `true`.
```javascript
new Shape([ paths = [], closed = true, capitalConversion = false ])

paths = [...[...{ X: Number, Y: Number }] || [...[...{ x: Number, y: Number }]
paths = Array
closed = Bool
capitalConversion = Bool
```
  - paths: the paths that make up the shape
  - closed: Shape is a polygon or line
  - capitalConversion: converts lower case x and y to uppercase X and Y

`Note: due to the nature of Clipper, some functions are destructive and some are non-destructive.`


**[Boolean operation: Union](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperexecute)**
```javascript
Shape = Shape.union( clipShape: Shape )
```
  - clipShape: clip of the boolean operation


**[Boolean operation: Difference](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperexecute)**
```javascript
Shape = Shape.difference( clipShape: Shape )
```
  - clipShape: clip of the boolean operation


**[Boolean operation: Intersect](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperexecute)**
```javascript
Shape = Shape.intersect( clipShape: Shape )
```
  - clipShape: clip of the boolean operation


**[Boolean operation: Xor](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperexecute)**
```javascript
Shape = Shape.xor( clipShape: Shape )
```
  - clipShape: clip of the boolean operation


**[Offset](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperoffset)**
```javascript
Shape = Shape.offset( offset: Number, options: {
  jointType = 'jtSquare',
  endType = 'etClosedPolygon',
  miterLimit = 2.0,
  roundPrecision = 0.25
} )
```
  - offset: clip off the boolean operation
  - options: optional arguments with default values
    - [jointType](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibjointype): join type of the offset
    - [endType](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibendtype): end type of the offset
    - [mitterLimit](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperoffsetmiterlimit): mitter limit
    - [roundPrecision](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperoffsetarctolerance): arc tolerance

offsets the shape along its normal.


**[Scale Up](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibjsscaleuppaths)**
```javascript
Shape.scaleUp( factor: Number )
```
scale up with factor.

`Note: destructive`


**[Scale Down](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibjsscaledownpaths)**
```javascript
Shape.scaleDown( factor: Number )
```
scale up with factor.

`Note: destructive`


**Last Point**
```javascript
{X: Number, Y: Number} = Shape.lastPoint()
```
returns position of the last point.


**Total Area**
```javascript
Number = Shape.totalArea()
```
returns total area of the shape.


**[Area](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperarea)**
```javascript
Number = Shape.area( index: Int )
```
  - index: index of the sub shape

returns area of the sub shape (negative if counter-clock wise).


**Areas**
```javascript
[...Number] = Shape.areas()
```
returns array of areas of all sub shapes.


**[Reverse](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperreversepaths)**
```javascript
Shape.reverse()
```
reverses the order of all sub shapes.


**Treshold Area**
```javascript
tresholdArea( minArea: Number )
```
  - minArea: minimal size of area

removes all sub shapes from shape which are smaller then min area.


**Join**
```javascript
join( shape )
```
joins shape with given shape.

`Note: destructive`


**[Clone](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibjsclone)**
```javascript
Shape = clone()
```
returns copy of shape.


**[Shape Bounds](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibjsboundsofpaths)**
```javascript
{
  left: Int,
  right: Int,
  top: Int,
  bottom: Int,
  width: Int,
  height: Int,
  size: Int
} = shapeBounds()
```
returns bounding box of shape.


**[Path Bounds](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibjsboundsofpath)**
```javascript
{
  left: Int,
  right: Int,
  top: Int,
  bottom: Int,
  width: Int,
  height: Int,
  size: Int
} = pathBounds( index: Int )
```
returns bounding box of sub shape.


**[Clean](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclippercleanpolygons)**
```javascript
Shape = clean( cleanDelta: Number )
```

**[Orientation](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperorientation)**
```javascript
Bool = orientation( index: Int )
```
returns orientation of the sub shape. True if clockwise, false if counter clock wise.


**Point In Shape**
```javascript
Bool = pointInShape( { X: Number, Y: Number } )
```
  - point: position used for hit detection

returns if point is in shape.


**[Point In Path](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperpointinpolygon)**
```javascript
Bool = pointInPath( index: Int, { X: Number, Y: Number } )
```
  - point: position used for hit detection
  - index: index of sub shape

returns if point is in sub shape.


**Fix Orientation**
```javascript
fixOrientation()
```
when given path with holes, outline must be clockwise and holes must be counter-clockwise. Tries to fix the orientation.


**[Remove Overlap](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclippersimplifypolygons)**
```javascript
removeOverlap()
```
unions all self intersecting shapes. Only works with closed shapes.


**Sperate Shapes**
```javascript
[...Shape] = seperateShapes()
```
when using union operations multiple shapes can be created. Sperate Shapes splits these shapes into seperate instances. All shapes keep their holes.


**Map To Lower**
```javascript
[...[...{ x: Number, y: Number }]] = mapToLower()
```
returns paths array with lower case x and y.
