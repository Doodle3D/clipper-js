# ClipperJS
[Clipper](https://sourceforge.net/projects/jsclipper/) abstraction layer (simplified API)

Target of this library is to remove complexity and create an overal cleaner API then Clipper.

When using this API one class, Shape, is used. Shape is a collection of paths that are all collectivly closed or open. Shapes with holes are devined as multiple closed paths where the outlines are clockwise and the holes are counter-clockwise. Shapes has multiple functions that can be used to for instance compute complex boolean operations from one just call.

A boolean intersect operation in clipper looks like this
```javascript
const subject = [[{ X: 30, Y: 30 }, { X: 10, Y: 30 }, { X: 10, Y: 10 }, { X: 30, Y: 10 }]];
const clip = [[{ X: 20, Y: 20 }, { X: 0, Y: 20 }, { X: 0, Y:0 }, { X: 20, Y: 0 }]];

const result = new ClipperLib.Paths();
const clipper = new ClipperLib.Clipper();
clipper.AddPaths(subject, ClipperLib.PolyType.ptSubject, true);
clipper.AddPaths(clip, ClipperLib.PolyType.ptClip, true);
clipper.Execute(ClipperLib.ClipType.ctIntersection, result);

// result = [[{ X: 20, Y: 20 }, { X: 10, Y: 20 }, { X: 10, Y: 10 }, { X: 20, Y: 10 }]]
```

In ClipperJS
```javascript
const subject = new Shape([[{ X: 30, Y: 30 }, { X: 10, Y: 30 }, { X: 10, Y: 10 }, { X: 30, Y: 10 }]], true);
const clip = new Shape([[{ X: 30, Y: 30 }, { X: 10, Y: 30 }, { X: 10, Y: 10 }, { X: 30, Y: 10 }]], true);

const result = subject.intersect(clip);

// result = { closed: true, paths: [[{ X: 20, Y: 20 }, { X: 10, Y: 20 }, { X: 10, Y: 10 }, { X: 20, Y: 10 }]] }
```

# Usage
Include the library.

Using JSPM
```javascript
import Shape from 'Doodle3D/ClipperJS';
```

Using NPM (not published yet)
```javascript
const Shape from 'clipper-js'; // not yet published on npm
```

# API

**Shape**

Shape accepts 3 optional arguments, `paths`, `closed` and `capitalConversion`. `paths` can be be devined with both upper case and lower case. Clipper only uses uppercase properties, when input is given with lower case `captalConversion` needs to be set to `true`.
```javascript
new Shape([ paths = [], closed = true, capitalConversion = false ]);

paths = [...[...{ X: Number, Y: Number }]
paths = [...[...{ x: Number, y: Number }]
paths = []
closed = Bool
capitalConversion = Bool
```
  - paths: the paths that make up the shape
  - closed: Shape is a polygon or line
  - capitalConversion: converts lower case x and y to uppercase X and Y

`Note: due to the nature of Clipper, some functions are destructive and some are non-destructive.`


[**Boolean operation: Union**](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperexecute)
```javascript
Shape = Shape.union( clipShape: Shape )
```
  - clipShape: clip off the boolean operation


[**Boolean operation: Difference**](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperexecute)
```javascript
Shape = Shape.difference( clipShape: Shape )
```
  - clipShape: clip off the boolean operation


[**Boolean operation: Intersect**](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperexecute)
```javascript
Shape = Shape.intersect( clipShape: Shape )
```
  - clipShape: clip off the boolean operation


[**Boolean operation: Xor**](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperexecute)
```javascript
Shape = Shape.xor( clipShape: Shape )
```
  - clipShape: clip off the boolean operation


[**Offset the shape (scale along normal)**](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperoffset)
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


**Scale Up**
```javascript
Shape.scaleUp( factor: Number )
```
Scale up with factor
`Note: non-destructive`


**Scale Down**
```javascript
Shape.scaleDown( factor: Number )
```
Scale up with factor
`Note: non-destructive`


**Last Point**
```javascript
{X: Number, Y: Number} = Shape.lastPoint()
```
Returns position of the last point


**Total Area**
```javascript
Number = Shape.totalArea()
```
Returns total area of the shape


**Area**
```javascript
Number = Shape.area( index: Int )
```
  - index: index of the subshape

returns area of the subshape (negative if counter-clock wise)


**Areas**
```javascript
[...Number] = Shape.areas()
```
returns array of areas of the subshape

**Reverse**
```javascript
Shape.reverse()
```
reverses all paths in shape


**Treshold Area**
```javascript
tresholdArea( minArea: Number )
```
  - minArea: minimal size of area

removes all shapes smaller then min area


**Join**
```javascript
join( shape )
```
joins shape with given shape

`Note: non-destructive`


**Clone**
```javascript
Shape = clone()
```
returns copy of shape


**Shape Bounds**
```javascript
{
  left: Number,
  right: Number,
  top: Number,
  bottom: Number,
  width: Number,
  height: Number,
  size: Number
} = shapeBounds()
```
returns bounding box of shape


**Path Bounds**
```javascript
{
  left: Number,
  right: Number,
  top: Number,
  bottom: Number,
  width: Number,
  height: Number,
  size: Number
} = pathBounds( index: Int )
```
returns bounding box of sub shape


**Clean**
```javascript
Shape = clean( cleanDelta: Number )
```

**Orientation**
```javascript
Bool = orientation( index: Int )
```
returns orientation of the sub shape. True if clockwise, false if counter clock wise.


**Point In Shape**
```javascript
Bool = pointInShape( { X: Number, Y: Number } )
```
  - point: position used for hit detection

returns if point is in shape


**Point In Path**
```javascript
Bool = pointInPath( index: Int, { X: Number, Y: Number } )
```
  - point: position used for hit detection
  - index: index of subshape

returns if point is in sub shape


**Fix Orientation**
```javascript
fixOrientation()
```
When given path with holes, outline must be clockwise and holes must be counter-clockwise. Tries to fix the orientation.


**Remove Overlap**
```javascript
removeOverlap()
```
Unions all self intersecting shapes. Only works with closed shapes.


**Sperate Shapes**
```javascript
[...Shape] = seperateShapes()
```
When using union operations multiple shapes can be created. Sperate Shapes splits these shapes into seperate instances. All shapes keep their holes.


**Map To Lower**
```javascript
[...[...{ x: Number, y: Number }]] = mapToLower()
```
returns paths array with lower case x and y
