import ClipperLib from 'clipper-lib';

let errorCallback;
export const setErrorCallback = (callback) => {
  errorCallback = callback;
}
ClipperLib.Error = (message) => {
  if (errorCallback) errorCallback(message);
}

const CLIPPER = new ClipperLib.Clipper();
const CLIPPER_OFFSET = new ClipperLib.ClipperOffset();

export default class Shape {
  constructor(paths = [], closed = true, capitalConversion = false, integerConversion = false, removeDuplicates = false) {
    this.paths = paths;
    if (capitalConversion) this.paths = this.paths.map(mapLowerToCapital);
    if (integerConversion) this.paths = this.paths.map(mapToRound);
    if (removeDuplicates) this.paths = this.paths.map(filterPathsDuplicates);
    this.closed = closed;
  }

  _clip(type, ...clipShapes) {
    const solution = new ClipperLib.PolyTree();

    CLIPPER.Clear();
    CLIPPER.AddPaths(this.paths, ClipperLib.PolyType.ptSubject, this.closed);
    for (let i = 0; i < clipShapes.length; i ++) {
      const clipShape = clipShapes[i];
      CLIPPER.AddPaths(clipShape.paths, ClipperLib.PolyType.ptClip, clipShape.closed);
    }
    CLIPPER.Execute(type, solution);

    const newShape = ClipperLib.Clipper.PolyTreeToPaths(solution);
    return new Shape(newShape, this.closed);
  }

  union(...clipShapes) {
    return this._clip(ClipperLib.ClipType.ctUnion, ...clipShapes);
  }

  difference(...clipShapes) {
    return this._clip(ClipperLib.ClipType.ctDifference, ...clipShapes);
  }

  intersect(...clipShapes) {
    return this._clip(ClipperLib.ClipType.ctIntersection, ...clipShapes);
  }

  xor(...clipShapes) {
    return this._clip(ClipperLib.ClipType.ctXor, ...clipShapes);
  }

  offset(offset, options = {}) {
    const {
      jointType = 'jtSquare',
      endType = 'etClosedPolygon',
      miterLimit = 2.0,
      roundPrecision = 0.25
    } = options;

    CLIPPER_OFFSET.Clear();
    CLIPPER_OFFSET.ArcTolerance = roundPrecision;
    CLIPPER_OFFSET.MiterLimit = miterLimit;

    const offsetPaths = new ClipperLib.Paths();
    CLIPPER_OFFSET.AddPaths(this.paths, ClipperLib.JoinType[jointType], ClipperLib.EndType[endType]);
    CLIPPER_OFFSET.Execute(offsetPaths, offset);

    return new Shape(offsetPaths, true);
  }

  scaleUp(factor) {
    ClipperLib.JS.ScaleUpPaths(this.paths, factor);

    return this;
  }

  scaleDown(factor) {
    ClipperLib.JS.ScaleDownPaths(this.paths, factor);

    return this;
  }

  firstPoint(toLower = false) {
    if (this.paths.length === 0) {
      return;
    }

    const firstPath = this.paths[0];
    const firstPoint = firstPath[0];
    if (toLower) {
      return vectorToLower(firstPoint);
    } else {
      return firstPoint;
    }
  }

  lastPoint(toLower = false) {
    if (this.paths.length === 0) {
      return;
    }

    const lastPath = this.paths[this.paths.length - 1];
    const lastPoint = this.closed ? lastPath[0] : lastPath[lastPath.length - 1];
    if (toLower) {
      return vectorToLower(lastPoint);
    } else {
      return lastPoint;
    }
  }

  areas() {
    const areas = this.paths.map((path, i) => this.area(i));
    return areas;
  }

  area(index) {
    const path = this.paths[index];
    const area = ClipperLib.Clipper.Area(path);
    return area;
  }

  totalArea() {
    return this.areas().reduce((totalArea, area) => totalArea + area, 0);
  }

  perimeter(index) {
    const path = this.paths[index];
    const perimeter = ClipperLib.JS.PerimeterOfPath(path, this.closed, 1);
    return perimeter;
  }

  perimeters() {
    return this.paths.map(path => ClipperLib.JS.PerimeterOfPath(path, this.closed, 1));
  }

  totalPerimeter() {
    const perimeter = ClipperLib.JS.PerimeterOfPaths(this.paths, this.closed);
    return perimeter;
  }

  reverse() {
    ClipperLib.Clipper.ReversePaths(this.paths);

    return this;
  }

  thresholdArea(minArea) {
    for (const path of [...this.paths]) {
      const area = Math.abs(ClipperLib.Clipper.Area(path));

      if (area < minArea) {
        const index = this.paths.indexOf(path);
        this.splice(index, 1);
      }
    }
    return this;
  }

  join(shape) {
    this.paths.splice(this.paths.length, 0, ...shape.paths);

    return this;
  }

  clone() {
    return new Shape(ClipperLib.JS.Clone(this.paths), this.closed);
  }

  shapeBounds() {
    return ClipperLib.JS.BoundsOfPaths(this.paths);
  }

  pathBounds(index) {
    const path = this.paths[index];

    return ClipperLib.JS.BoundsOfPath(path);
  }

  clean(cleanDelta) {
    return new Shape(ClipperLib.Clipper.CleanPolygons(this.paths, cleanDelta), this.closed);
  }

  orientation(index) {
    const path = this.paths[index];
    return ClipperLib.Clipper.Orientation(path);
  }

  pointInShape(point, capitalConversion = false, integerConversion = false) {
    if (capitalConversion) point = vectorToCapital(point);
    if (integerConversion) point = roundVector(point);
    for (let i = 0; i < this.paths.length; i ++) {
      const pointInPath = this.pointInPath(i, point);
      const orientation = this.orientation(i);

      if ((!pointInPath && orientation) || (pointInPath && !orientation)) {
        return false;
      }
    }

    return true;
  }

  pointInPath(index, point, capitalConversion = false, integerConversion = false) {
    if (capitalConversion) point = vectorToCapital(point);
    if (integerConversion) point = roundVector(point);
    const path = this.paths[index];
    const intPoint = { X: Math.round(point.X), Y: Math.round(point.Y) };

    return ClipperLib.Clipper.PointInPolygon(intPoint, path) > 0;
  }

  fixOrientation() {
    if (!this.closed) {
      return this;
    }

    if (this.totalArea() < 0) {
      this.reverse();
    }

    return this;
  }

  simplify(fillType) {
    if (this.closed) {
      const shape = ClipperLib.Clipper.SimplifyPolygons(this.paths, ClipperLib.PolyFillType[fillType]);
      return new Shape(shape, true);
    } else {
      return this;
    }
  }

  seperateShapes() {
    const shapes = [];

    if (!this.closed) {
      for (const path of this.paths) {
        shapes.push(new Shape([path], false));
      }
    } else {
      const areas = new WeakMap();
      const outlines = [];
      const holes = [];

      for (let i = 0; i < this.paths.length; i ++) {
        const path = this.paths[i];
        const orientation = this.orientation(i);

        if (orientation) {
          const area = this.area(i);
          areas.set(path, area);
          outlines.push(path);
        } else {
          holes.push(path);
        }
      }

      outlines.sort((a, b) => areas.get(a) - areas.get(b));

      for (const outline of outlines) {
        const shape = [outline];

        const index = this.paths.indexOf(outline);

        for (const hole of [...holes]) {
          const pointInHole = this.pointInPath(index, hole[0]);
          if (pointInHole) {
            shape.push(hole);

            const index = holes.indexOf(hole);
            holes.splice(index, 1);
          }
        }

        shapes.push(new Shape(shape, true));
      }
    }

    return shapes;
  }

  round() {
    return new Shape(this.paths.map(mapToRound), this.closed);
  }

  removeDuplicates() {
    return new Shape(this.paths.map(filterPathsDuplicates), this.closed);
  }

  mapToLower() {
    return this.paths.map(mapCapitalToLower);
  }
}

function mapCapitalToLower(path) {
  return path.map(vectorToLower);
}

function vectorToLower({ X, Y }) {
  return { x: X, y: Y };
}

function mapLowerToCapital(path) {
  return path.map(vectorToCapital);
}

function vectorToCapital({ x, y }) {
  return { X: x, Y: y };
}

function mapToRound(path) {
  return path.map(roundVector);
}

function roundVector({ X, Y }) {
  return { X: Math.round(X), Y: Math.round(Y) };
}

function filterPathsDuplicates(path) {
  return path.filter(filterPathDuplicates);
}

function filterPathDuplicates(point, i, array) {
  if (i === 0) return true;

  const prevPoint = array[i - 1];
  return !(point.X === prevPoint.X && point.Y === prevPoint.Y);
}
