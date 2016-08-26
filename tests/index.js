import test from 'tape';
import Shape from '../src/index.js';

test('boolean operation: union', (assert) => {
  const shapeA = new Shape([rect(0, 0, 20, 20)], true, true);
  const shapeB = new Shape([rect(10, 10, 20, 20)], true, true);

  const actual = shapeA.union(shapeB);
  const expected = { closed: true, paths: [[{ X: 20, Y: 10 }, { X: 30, Y: 10 }, { X: 30, Y: 30 }, { X: 10, Y: 30 }, { X: 10, Y: 20 }, { X: 0, Y: 20 }, { X: 0, Y: 0 }, { X: 20, Y: 0 }]] };

  assert.ok(actual.paths.length === 1, 'should generate one path');
  assert.deepEqual(actual, expected, 'should generate one merged path');

  assert.end();
});

test('boolean operation: intersect', (assert) => {
  const shapeA = new Shape([rect(0, 0, 20, 20)], true, true);
  const shapeB = new Shape([rect(10, 10, 20, 20)], true, true);

  const actual = shapeA.intersect(shapeB);
  const expected = { closed: true, paths: [[{ X: 20, Y: 20 }, { X: 10, Y: 20 }, { X: 10, Y: 10 }, { X: 20, Y: 10 }]] };

  assert.ok(actual.paths.length === 1, 'should generate one path');
  assert.deepEqual(actual, expected, 'should generate one path with only overlapping');

  assert.end();
});

test('boolean operation: xor', (assert) => {
  const shapeA = new Shape([rect(0, 0, 20, 20)], true, true);
  const shapeB = new Shape([rect(10, 10, 20, 20)], true, true);

  const actual = shapeA.xor(shapeB);
  const expected = { closed: true, paths: [[{ X: 30, Y: 30 }, { X: 10, Y: 30 }, { X: 10, Y: 20 }, { X: 20, Y: 20 }, { X: 20, Y: 10 }, { X: 30, Y: 10 } ], [ { X: 20, Y: 10 }, { X: 10, Y: 10 }, { X: 10, Y: 20 }, { X: 0, Y: 20 }, { X: 0, Y: 0 }, { X: 20, Y: 0 }]] };

  assert.ok(actual.paths.length === 2, 'should generate two paths');
  assert.deepEqual(actual, expected, 'should generate two paths with overlapping removed');

  assert.end();
});

test('boolean operation: difference', (assert) => {
  const shapeA = new Shape([rect(0, 0, 20, 20)], true, true);
  const shapeB = new Shape([rect(10, 10, 20, 20)], true, true);

  const actual = shapeA.difference(shapeB);
  const expected = { closed: true, paths: [[{ X: 20, Y: 10 }, { X: 10, Y: 10 }, { X: 10, Y: 20 }, { X: 0, Y: 20 }, { X: 0, Y: 0 }, { X: 20, Y: 0 }]] };

  assert.ok(actual.paths.length === 1, 'should generate one path');
  assert.deepEqual(actual, expected, 'should generate one paths where shapeB is removed');

  assert.end();
});

test('convert from and to uppercase', (assert) => {
  const paths = [rect()];
  const shape = new Shape(paths, true, true);
  const actualUpper = shape;
  const expectedUpper = { closed: true, paths: [[{ X: 0, Y: 0 }, { X: 10, Y: 0 }, { X: 10, Y: 10 }, { X: 0, Y: 10 }, { X: 0, Y: 0 }]]};
  assert.deepEqual(actualUpper, expectedUpper, 'should generate uppercase path');

  const actualLower = shape.mapToLower();
  const expectedLower = [[{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 0, y: 0 }]];
  assert.deepEqual(actualLower, expectedLower, 'should generate uppercase path');

  assert.end();
});

test('remove overlap', (assert) => {
  const paths = [rect(10, 0, 10, 30), rect(0, 10, 30, 10)];
  const shape = new Shape(paths, true, true);
  const actual = shape.removeOverlap();

  const expected = { closed: true, paths: [[{ X: 20, Y: 10 }, { X: 30, Y: 10 }, { X: 30, Y: 20 }, { X: 20, Y: 20 }, { X: 20, Y: 30 }, { X: 10, Y: 30 }, { X: 10, Y: 20 }, { X: 0, Y: 20 }, { X: 0, Y: 10 }, { X: 10, Y: 10 }, { X: 10, Y: 0 }, { X: 20, Y: 0 }]] };

  assert.ok(actual.paths.length === 1, 'should generate one path')
  assert.deepEqual(actual, expected, 'should generate merged path');

  assert.end();
});

test('seperate shapes', (assert) => {
  const holeA = rect(10, 10, 10, 10).reverse();
  const outlineA = rect(0, 0, 30, 30);
  const outlineB = rect(40, 0, 30, 30);
  const paths = [holeA, outlineA, outlineB];

  const shape = new Shape(paths, true, true);
  const actual = shape.seperateShapes();

  const expected = [
    { closed: true, paths: [[{ X: 0, Y: 0 }, { X: 30, Y: 0 }, { X: 30, Y: 30 }, { X: 0, Y: 30 }, { X: 0, Y: 0 }], [{ X: 10, Y: 10 }, { X: 10, Y: 20 }, { X: 20, Y: 20 }, { X: 20, Y: 10 }, { X: 10, Y: 10 }]] },
    { closed: true, paths: [[{ X: 40, Y: 0 }, { X: 70, Y: 0 }, { X: 70, Y: 30 }, { X: 40, Y: 30 }, { X: 40, Y: 0 }]] }
  ];

  assert.ok(actual.length === 2, 'should generate two shapes')
  assert.deepEqual(actual, expected, 'should generate two shapes');

  assert.end();
});

test('orientation', (assert) => {
  const paths = [rect(), rect().reverse()];
  const shape = new Shape(paths, true, true);

  const actualA = shape.orientation(0);
  const actualB = shape.orientation(1);

  assert.ok(actualA === true, 'orientation A should be clockwise');
  assert.ok(actualB === false, 'orientation A should be counter-clockwise');

  assert.end();
});

test('perimeter', (assert) => {
  const paths = [rect(), rect().reverse()];
  const shape = new Shape(paths, true, true);

  const actualA = shape.perimeter(0);
  const expectedA = 40; // 4 * 10
  const actualB = shape.perimeters();
  const expectedB = [40, 40];
  const actualC = shape.totalPerimeter();
  const expectedC = 80;

  assert.ok(actualA, 'single perimeter should produce the correct value');
  assert.deepEqual(actualB, expectedB, 'perimeters should produce array of perimeters');
  assert.ok(actualC === expectedC, 'totalPerimeter should produce the correct value');

  assert.end();
});

function rect(x = 0, y = 0, w = 10, h = 10) {
  return [
    { x, y },
    { x: w + x, y },
    { x: w + x, y: h + y },
    { x, y: h + y },
    { x, y }
  ];
}
