let canvasSize = 520;

function setup() {
  const wrap = document.getElementById("visualCanvas");
  canvasSize = getCanvasSize(wrap);
  const c = createCanvas(canvasSize, canvasSize);
  c.parent("visualCanvas");
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
  angleMode(RADIANS);
}

function windowResized() {
  const wrap = document.getElementById("visualCanvas");
  canvasSize = getCanvasSize(wrap);
  resizeCanvas(canvasSize, canvasSize);
}

function getCanvasSize(wrap) {
  const widthFromWrap = wrap ? wrap.clientWidth : 520;
  return Math.min(720, Math.max(320, widthFromWrap || 560));
}

function draw() {
  clear();
  background(246, 240, 232);
  drawPaperGrain();

  const s = window.appState;
  if (!s || !s.generated || !s.combined) {
    drawIdleVisual();
    return;
  }

  if (s.visualMode === "orbital") {
    return;
  }

  randomSeed(s.seed);
  noiseSeed(s.seed);
  renderVisualization(s.visualMode || "membrane", s);
}

function getVisualizationLayout(sourceCount) {
  const field = min(width, height);
  const countBoost = map(constrain(sourceCount, 1, 5), 1, 5, 1.12, 0.92);
  return {
    center: createVector(0, -height * 0.02),
    baseRadius: field * 0.28 * countBoost,
    outerRadius: field * 0.38 * countBoost,
    field
  };
}

function drawPaperGrain() {
  push();
  noStroke();
  for (let i = 0; i < 70; i++) {
    fill(80, 70, 60, 5);
    circle(random(width), random(height), random(0.5, 1.5));
  }
  pop();
}

function drawIdleVisual() {
  push();
  translate(width / 2, height / 2);
  noFill();
  stroke(126, 91, 76, 76);
  strokeWeight(1.4);
  for (let i = 0; i < 5; i++) {
    const r = 58 + i * 28;
    const wobble = sin(frameCount * 0.018 + i) * 5;
    beginShape();
    for (let a = -PI * 0.8; a < PI * 1.05; a += 0.08) {
      vertex(cos(a) * (r + wobble), sin(a) * (r * 0.7 - wobble));
    }
    endShape();
  }
  noStroke();
  fill(65, 58, 52, 180);
  textAlign(CENTER, CENTER);
  textSize(15);
  text("Waiting for sources", 0, 0);
  pop();
}

function renderVisualization(mode, s) {
  if (mode === "structural") {
    drawStructuralLineView(s);
    return;
  }
  drawMembraneView(s);
}

function drawMembraneView(s) {
  const combined = s.combined;
  const profiles = normalizeProfiles(combined);
  if (!profiles.length) {
    drawIdleVisual();
    return;
  }

  const dominant = profiles.find((item) => item.source === combined.dominantSource) || profiles[0];
  const outerSources = profiles.filter((item) => item.source !== dominant.source);
  const maxScore = Math.max(...profiles.map((item) => item.score), 1);
  const layout = getVisualizationLayout(profiles.length);
  const center = layout.center;
  const anchors = buildAnchors(outerSources, maxScore, s.seed, layout);

  push();
  translate(width / 2, height / 2);

  drawMapGround(anchors, center);
  anchors.forEach((anchor) => drawConnection(center, anchor));
  anchors.forEach((anchor) => drawPressureCluster(anchor.item, anchor.pos, {
    dominant: false,
    angle: anchor.angle,
    maxScore,
    index: anchor.index
  }));

  drawPressureCluster(dominant, center, {
    dominant: true,
    angle: -0.2,
    maxScore,
    index: 0
  });
  drawDominantLabel(dominant, center);

  pop();
}

function drawStructuralLineView(s) {
  const combined = s.combined;
  const profiles = normalizeProfiles(combined);
  if (!profiles.length) {
    drawIdleVisual();
    return;
  }

  const dominant = profiles.find((item) => item.source === combined.dominantSource) || profiles[0];
  const maxScore = Math.max(...profiles.map((item) => item.score), 1);
  const layout = getVisualizationLayout(profiles.length);
  const center = layout.center;
  const anchors = buildStructuralAnchors(profiles, dominant, maxScore, s.seed, layout);

  push();
  translate(width / 2, height / 2);

  drawStructuralCore(combined, dominant, center);
  anchors.forEach((anchor) => drawStructuralGuide(center, anchor));
  anchors.forEach((anchor) => drawSourceLineBundle(center, anchor));
  drawStructuralDominantRing(dominant, center);
  anchors.forEach((anchor) => drawStructuralSourceLabel(anchor));

  pop();
}

function buildStructuralAnchors(profiles, dominant, maxScore, seed, layout) {
  const count = profiles.length;
  const startAngle = -PI * 0.66 + (seed % 23) * 0.008;
  const spread = count === 1 ? 0 : min(TWO_PI * 0.82, PI * (0.8 + count * 0.18));
  const field = layout ? layout.field : min(width, height);

  return profiles.map((item, index) => {
    const dominantItem = item.source === dominant.source;
    const step = count === 1 ? 0 : spread / (count - 1);
    const directionalBias = dominantItem ? -0.16 : sin(index * 1.9 + seed * 0.01) * 0.16;
    const angle = startAngle + step * index + directionalBias;
    const scoreRatio = item.score / maxScore;
    const profile = item.profile;
    const reach = (layout ? layout.outerRadius : field * 0.38) * map(scoreRatio, 0, 1, dominantItem ? 0.86 : 0.78, dominantItem ? 1.14 : 1.02);
    const expressionPull = map(profile.expression, 1, 10, 1.1, 0.68);
    const endpoint = createVector(cos(angle) * reach * expressionPull, sin(angle) * reach * map(profile.expression, 1, 10, 1.04, 0.72));
    const laneOffset = createVector(cos(angle + HALF_PI), sin(angle + HALF_PI));
    return { item, index, angle, endpoint, laneOffset, dominant: dominantItem, scoreRatio };
  });
}

function drawStructuralCore(combined, dominant, center) {
  const avg = combined.averages || {};
  const coreSize = map(avg.intensity || 5, 1, 10, 18, 34);
  const pulse = sin(frameCount * map(avg.body || 5, 1, 10, 0.015, 0.065)) * map(avg.body || 5, 1, 10, 1, 6);
  const c = sourceColor(dominant.source, dominant.profile.intensity, true);
  const deep = sourceDeepColor(dominant.source, dominant.profile.intensity, true);
  const outerPoints = [];
  const innerPoints = [];

  push();
  translate(center.x, center.y);
  noStroke();
  for (let i = 0; i < 13; i++) {
    const a = (TWO_PI * i) / 13;
    const n = noise(cos(a) * 0.6 + 8.2, sin(a) * 0.6 + 3.1, frameCount * 0.004);
    const wave = sin(a * 2.1 + frameCount * 0.012) * map(avg.control || 5, 1, 10, 0.8, 3.6);
    const r = coreSize + pulse * 0.25 + (n - 0.5) * 4 + wave;
    outerPoints.push(createVector(cos(a) * r * 1.28, sin(a) * r * 0.82));
    innerPoints.push(createVector(cos(a) * r * 0.52, sin(a) * r * 0.38));
  }

  fill(red(c), green(c), blue(c), 44);
  drawSmoothClosedShape(outerPoints);
  fill(red(deep), green(deep), blue(deep), 82);
  drawSmoothClosedShape(innerPoints);
  noFill();
  stroke(red(deep), green(deep), blue(deep), 68);
  strokeWeight(1);
  drawSmoothClosedShape(outerPoints);
  pop();
}

function drawStructuralGuide(center, anchor) {
  const profile = anchor.item.profile;
  const c = sourceColor(anchor.item.source, profile.intensity, anchor.dominant);
  const mid = p5.Vector.lerp(center, anchor.endpoint, 0.48).add(anchor.laneOffset.copy().mult(anchor.dominant ? 10 : 18));

  push();
  noFill();
  stroke(red(c), green(c), blue(c), anchor.dominant ? 38 : 24);
  strokeWeight(anchor.dominant ? 1.2 : 0.8);
  beginShape();
  vertex(center.x, center.y);
  quadraticVertex(mid.x, mid.y, anchor.endpoint.x, anchor.endpoint.y);
  endShape();
  pop();
}

function drawSourceLineBundle(center, anchor) {
  const item = anchor.item;
  const profile = item.profile;
  const dominant = anchor.dominant;
  const baseColor = sourceColor(item.source, profile.intensity, dominant);
  const deepColor = sourceDeepColor(item.source, profile.intensity, dominant);
  const scoreDensity = map(anchor.scoreRatio, 0, 1, 0.84, 1.16);
  const lineCount = floor(map(profile.duration, 1, 10, dominant ? 9 : 5, dominant ? 26 : 17) * scoreDensity);
  const bundleWidth = map(profile.expression, 1, 10, dominant ? 58 : 46, dominant ? 22 : 17);
  const startSpread = map(profile.expression, 1, 10, dominant ? 16 : 13, dominant ? 6 : 5);
  const startPull = dominant ? 0.035 : 0.12;
  const lengthScale = map(profile.duration, 1, 10, 0.76, 1.13) * map(profile.expression, 1, 10, 1.12, 0.66) * (dominant ? 1.02 : 0.96);
  const instability = map(profile.control, 1, 10, 2.5, dominant ? 30 : 23);
  const motion = frameCount * map(profile.body, 1, 10, 0.004, 0.032);
  const forward = createVector(cos(anchor.angle), sin(anchor.angle));

  for (let i = 0; i < lineCount; i++) {
    const lane = lineCount === 1 ? 0 : map(i, 0, lineCount - 1, -1, 1);
    const phase = i * 1.37 + anchor.index * 2.13;
    const start = p5.Vector.lerp(center, anchor.endpoint, startPull)
      .add(anchor.laneOffset.copy().mult(lane * startSpread + sin(phase) * 1.8));
    const end = p5.Vector.lerp(center, anchor.endpoint, lengthScale)
      .add(anchor.laneOffset.copy().mult(lane * bundleWidth + sin(phase + motion * 2.1) * map(profile.body, 1, 10, 0.4, 3.8)));
    const controlA = p5.Vector.lerp(start, end, 0.34)
      .add(anchor.laneOffset.copy().mult(sin(phase) * instability * 0.72))
      .add(forward.copy().mult(cos(phase + motion) * map(profile.body, 1, 10, 0.4, 4.6)));
    const controlB = p5.Vector.lerp(start, end, 0.68)
      .add(anchor.laneOffset.copy().mult(cos(phase * 0.8 + motion * 2.4) * instability * 0.62))
      .sub(forward.copy().mult(sin(phase * 0.5 + motion) * map(profile.control, 1, 10, 0.2, 5)));
    const c = lerpColor(baseColor, deepColor, i / max(lineCount - 1, 1) * 0.55);
    const points = [];
    const alpha = map(profile.expression, 1, 10, dominant ? 130 : 92, dominant ? 62 : 45) * map(profile.intensity, 1, 10, 0.82, 1.08);
    const weight = map(profile.intensity, 1, 10, dominant ? 0.9 : 0.45, dominant ? 2.85 : 1.55) * map(anchor.scoreRatio, 0, 1, 0.86, 1.15);

    for (let t = 0; t <= 1.001; t += 0.045) {
      const point = cubicPoint(start, controlA, controlB, end, t);
      const envelope = sin(t * PI);
      const wobble = sin(t * PI * (2.2 + profile.control * 0.18) + phase + motion * 5) * instability * 0.16 * envelope;
      const n = noise(t * 1.35 + i * 0.12, anchor.index * 0.57, frameCount * 0.005) - 0.5;
      const bodyPulse = sin(frameCount * map(profile.body, 1, 10, 0.01, 0.04) + t * PI + phase) * map(profile.body, 1, 10, 0.2, 3.8) * envelope;
      const offset = anchor.laneOffset.copy().mult(wobble + n * instability * map(profile.control, 1, 10, 0.18, 0.74) * envelope + bodyPulse);
      const along = forward.copy().mult(bodyPulse * 0.25);
      points.push(createVector(point.x + offset.x + along.x, point.y + offset.y + along.y));
    }

    drawSegmentedStructuralCurve(points, c, alpha, weight, profile.gap, i, anchor);
  }
}

function drawSegmentedStructuralCurve(points, c, alpha, weight, gap, lineIndex, anchor) {
  const breakEvery = floor(map(gap, 6, 10, 5, 2));
  const shouldBreak = gap >= 7 && lineIndex % max(2, breakEvery) === 0;

  stroke(red(c), green(c), blue(c), alpha);
  strokeWeight(weight);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  noFill();

  if (!shouldBreak) {
    drawStructuralCurveSegment(points, 0, points.length - 1);
    return;
  }

  const breakCenter = constrain(0.44 + sin(lineIndex * 1.9 + anchor.index) * 0.16, 0.26, 0.72);
  const breakWidth = map(gap, 7, 10, 0.07, 0.18);
  const firstEnd = floor(points.length * max(0.12, breakCenter - breakWidth));
  const secondStart = ceil(points.length * min(0.88, breakCenter + breakWidth));

  drawStructuralCurveSegment(points, 0, firstEnd);
  drawStructuralCurveSegment(points, secondStart, points.length - 1);

  if (gap >= 8) {
    drawOffsetFractureFragment(points, firstEnd, secondStart, c, alpha, weight, gap, lineIndex, anchor.laneOffset);
  }
}

function drawStructuralCurveSegment(points, startIndex, endIndex) {
  if (endIndex - startIndex < 2) return;

  beginShape();
  curveVertex(points[startIndex].x, points[startIndex].y);
  for (let i = startIndex; i <= endIndex; i++) {
    curveVertex(points[i].x, points[i].y);
  }
  curveVertex(points[endIndex].x, points[endIndex].y);
  endShape();
}

function drawOffsetFractureFragment(points, firstEnd, secondStart, c, alpha, weight, gap, lineIndex, laneOffset) {
  const fragmentStart = constrain(firstEnd + 1, 0, points.length - 1);
  const fragmentEnd = constrain(secondStart - 1, 0, points.length - 1);
  if (fragmentEnd - fragmentStart < 2) return;

  const direction = lineIndex % 2 === 0 ? 1 : -1;
  const shift = laneOffset.copy().mult(direction * map(gap, 8, 10, 5, 13));

  stroke(red(c), green(c), blue(c), alpha * 0.68);
  strokeWeight(weight * 0.72);
  noFill();
  beginShape();
  for (let i = fragmentStart; i <= fragmentEnd; i++) {
    curveVertex(points[i].x + shift.x, points[i].y + shift.y);
  }
  endShape();

  const mark = points[floor((fragmentStart + fragmentEnd) / 2)];
  drawLineCut(mark, laneOffset, c, gap);
}

function drawLineCut(origin, laneOffset, deepColor, gap) {
  push();
  stroke(red(deepColor), green(deepColor), blue(deepColor), map(gap, 8, 10, 60, 122));
  strokeWeight(map(gap, 8, 10, 0.8, 1.8));
  const tangent = createVector(-laneOffset.y, laneOffset.x).mult(8);
  const normal = laneOffset.copy().mult(8);
  line(origin.x - tangent.x - normal.x, origin.y - tangent.y - normal.y, origin.x + tangent.x + normal.x, origin.y + tangent.y + normal.y);
  pop();
}

function cubicPoint(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const x = u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x;
  const y = u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y;
  return createVector(x, y);
}

function drawStructuralDominantRing(dominant, center) {
  const profile = dominant.profile;
  const c = sourceDeepColor(dominant.source, profile.intensity, true);
  const radius = map(profile.intensity, 1, 10, 42, 66) * map(profile.expression, 1, 10, 1, 0.78);

  push();
  translate(center.x, center.y);
  noFill();
  stroke(red(c), green(c), blue(c), 70);
  strokeWeight(map(profile.intensity, 1, 10, 1, 2.2));
  beginShape();
  for (let a = -PI * 0.15; a <= TWO_PI * 0.82; a += 0.08) {
    const r = radius + sin(a * 2 + frameCount * 0.01) * map(profile.control, 1, 10, 1, 6);
    vertex(cos(a) * r, sin(a) * r * 0.72);
  }
  endShape();
  pop();
}

function drawStructuralSourceLabel(anchor) {
  const item = anchor.item;
  const profile = item.profile;
  const label = getSourceShortLabel(item.source) + (anchor.dominant ? " / dominant" : "");
  const c = sourceDeepColor(item.source, profile.intensity, anchor.dominant);
  const direction = createVector(cos(anchor.angle), sin(anchor.angle));
  const labelPoint = anchor.endpoint.copy()
    .add(direction.copy().mult(anchor.dominant ? 38 : 30))
    .add(anchor.laneOffset.copy().mult(anchor.index % 2 === 0 ? 8 : -8));
  const xLimit = width / 2 - 48;
  const yLimit = height / 2 - 26;

  labelPoint.x = constrain(labelPoint.x, -xLimit, xLimit);
  labelPoint.y = constrain(labelPoint.y, -yLimit, yLimit);

  push();
  stroke(red(c), green(c), blue(c), anchor.dominant ? 48 : 30);
  strokeWeight(anchor.dominant ? 1 : 0.75);
  line(anchor.endpoint.x, anchor.endpoint.y, labelPoint.x - direction.x * 8, labelPoint.y - direction.y * 8);
  noStroke();
  fill(47, 42, 37, anchor.dominant ? 116 : 88);
  textSize(anchor.dominant ? 10.5 : 10);
  textAlign(direction.x > 0.25 ? LEFT : direction.x < -0.25 ? RIGHT : CENTER, CENTER);
  text(label, labelPoint.x, labelPoint.y);
  pop();
}

function normalizeProfiles(combined) {
  return (combined.profiles || []).map((item) => ({
    source: item.source,
    profile: item.profile,
    score: item.score || pressureScore(item.profile)
  })).sort((a, b) => b.score - a.score);
}

function buildAnchors(outerSources, maxScore, seed, layout) {
  const count = outerSources.length;
  const anchors = [];
  if (!count) return anchors;

  const startAngle = -PI * 0.72 + (seed % 17) * 0.012;
  const spread = count === 1 ? 0 : TWO_PI * 0.82;

  outerSources.forEach((item, index) => {
    const profile = item.profile;
    const scoreRatio = item.score / maxScore;
    const step = count === 1 ? 0 : spread / (count - 1);
    const asymmetry = sin((index + 1) * 1.73 + seed * 0.01) * 0.22;
    const angle = startAngle + step * index + asymmetry;
    const radius = (layout ? layout.outerRadius : min(width, height) * 0.38) * map(scoreRatio, 0, 1, 1.08, 0.82) + sin(index * 2.1 + seed) * 14;
    const xScale = map(index % 3, 0, 2, 1.08, 0.88);
    const yScale = map((index + 1) % 3, 0, 2, 0.86, 1.1);
    const pos = createVector(cos(angle) * radius * xScale, sin(angle) * radius * yScale);

    anchors.push({ item, angle, pos, index });
  });

  return anchors;
}

function drawMapGround(anchors, center) {
  push();
  noFill();
  stroke(72, 64, 58, 18);
  strokeWeight(1);
  anchors.forEach((anchor) => {
    beginShape();
    vertex(center.x, center.y);
    quadraticVertex(
      anchor.pos.x * 0.42 + sin(anchor.index) * 24,
      anchor.pos.y * 0.42 - cos(anchor.index) * 18,
      anchor.pos.x,
      anchor.pos.y
    );
    endShape();
  });
  pop();
}

function drawConnection(center, anchor) {
  const profile = anchor.item.profile;
  const c = sourceColor(anchor.item.source, profile.intensity, false);
  const alpha = map(anchor.item.score, 10, 50, 22, 82);
  const midX = lerp(center.x, anchor.pos.x, 0.52) + sin(anchor.angle * 2) * 24;
  const midY = lerp(center.y, anchor.pos.y, 0.52) - cos(anchor.angle * 1.7) * 20;

  push();
  noFill();
  stroke(red(c), green(c), blue(c), alpha);
  strokeWeight(map(profile.intensity, 1, 10, 0.7, 1.8));
  if (profile.control >= 8 || profile.gap >= 8) {
    drawingContext.setLineDash([8, 10]);
  }
  beginShape();
  vertex(center.x, center.y);
  quadraticVertex(midX, midY, anchor.pos.x, anchor.pos.y);
  endShape();
  drawingContext.setLineDash([]);
  pop();
}

function drawPressureCluster(item, position, options) {
  const profile = item.profile;
  const dominant = options.dominant;
  const scoreRatio = item.score / max(options.maxScore, 1);
  const tIntensity = normalized(profile.intensity);
  const tDuration = normalized(profile.duration);
  const tControl = normalized(profile.control);
  const tBody = normalized(profile.body);
  const tExpression = normalized(profile.expression);
  const tGap = normalized(profile.gap);
  const baseColor = sourceColor(item.source, profile.intensity, dominant);
  const deepColor = sourceDeepColor(item.source, profile.intensity, dominant);
  const pulse = sin(frameCount * map(profile.body, 1, 10, 0.018, 0.088) + options.index) * map(profile.body, 1, 10, 1.5, dominant ? 13 : 8);
  const radius = map(profile.intensity, 1, 10, dominant ? 46 : 30, dominant ? 78 : 58) * map(tExpression, 0, 1, 1.0, 0.72) + pulse + scoreRatio * (dominant ? 12 : 10);
  const compression = map(tExpression, 0, 1, 1.0, 0.68);
  const jitter = map(profile.control, 1, 10, dominant ? 3 : 4, dominant ? 16 : 24);

  push();
  translate(position.x, position.y);
  rotate(options.angle * 0.18);

  drawDurationTraces(profile, radius, baseColor, deepColor, dominant, options.index);
  if (dominant) {
    drawDominantMembraneCluster(profile, radius, compression, jitter, baseColor, deepColor, options.index);
  } else {
    drawBlobBody(profile, radius, compression, jitter, baseColor, deepColor, false, options.index);
  }
  drawUnstableEdges(profile, radius, compression, deepColor, dominant, options.index);
  drawLocalFractures(profile, radius, compression, deepColor, options.index);
  drawSourceLabel(item.source, radius, dominant);

  pop();
}

function drawBlobBody(profile, radius, compression, jitter, baseColor, deepColor, dominant, index) {
  const alpha = map(profile.expression, 1, 10, dominant ? 142 : 104, dominant ? 86 : 56);
  const steps = dominant ? 96 : 72;

  noStroke();
  fill(red(baseColor), green(baseColor), blue(baseColor), alpha);
  beginShape();
  for (let i = 0; i < steps; i++) {
    const a = (TWO_PI * i) / steps;
    const n = noise(cos(a) * 0.92 + index * 1.7, sin(a) * 0.92 + 8, frameCount * 0.006);
    const folded = sin(a * 2.7 + index) * jitter * 0.34;
    const r = radius + (n - 0.5) * jitter + folded;
    vertex(cos(a) * r * map(profile.expression, 1, 10, 1.04, 0.82), sin(a) * r * compression);
  }
  endShape(CLOSE);

  fill(red(deepColor), green(deepColor), blue(deepColor), map(profile.intensity, 1, 10, dominant ? 34 : 20, dominant ? 84 : 52));
  beginShape();
  for (let i = 0; i < steps; i++) {
    const a = (TWO_PI * i) / steps;
    const n = noise(cos(a) * 1.15 + 12 + index, sin(a) * 1.15 + 1, frameCount * 0.006);
    const r = radius * map(profile.expression, 1, 10, 0.58, 0.42) + (n - 0.5) * jitter * 0.45;
    vertex(cos(a) * r, sin(a) * r * compression);
  }
  endShape(CLOSE);
}

function drawDominantMembraneCluster(profile, radius, compression, jitter, baseColor, deepColor, index) {
  const membraneRadius = radius * 0.88;
  const layerConfigs = [
    { scale: 1.06, alpha: 54, strokeAlpha: 62, offset: createVector(-7, 4), colorMix: 0.08, phase: 0.0 },
    { scale: 0.84, alpha: 68, strokeAlpha: 76, offset: createVector(6, -5), colorMix: 0.28, phase: 0.42 },
    { scale: 0.58, alpha: 74, strokeAlpha: 82, offset: createVector(-3, -8), colorMix: 0.52, phase: 0.86 }
  ];

  layerConfigs.forEach((layer, layerIndex) => {
    const layerColor = lerpColor(baseColor, deepColor, layer.colorMix);
    const points = buildMembranePoints(profile, membraneRadius * layer.scale, compression, jitter, index, layerIndex + layer.phase);
    drawMembraneLayer(points, layer.offset, layerColor, layer.alpha, layer.strokeAlpha, profile, layerIndex);
  });

  drawMembraneCore(profile, membraneRadius, compression, baseColor, deepColor, index);
}

function buildMembranePoints(profile, radius, compression, jitter, index, phase) {
  const count = 12;
  const points = [];
  const expressionScale = map(profile.expression, 1, 10, 1.02, 0.82);
  const lowFreqJitter = map(profile.control, 1, 10, 2.5, jitter);
  const breath = sin(frameCount * map(profile.body, 1, 10, 0.014, 0.06) + phase) * map(profile.body, 1, 10, 0.4, 4.8);

  for (let i = 0; i < count; i++) {
    const a = (TWO_PI * i) / count;
    const n = noise(cos(a) * 0.42 + index * 1.9 + phase, sin(a) * 0.42 + 4.5, frameCount * 0.003);
    const broadWave = sin(a * 2 + phase * 1.7) * lowFreqJitter * 0.44;
    const r = radius + (n - 0.5) * lowFreqJitter + broadWave + breath;
    points.push(createVector(cos(a) * r * expressionScale, sin(a) * r * compression));
  }

  return points;
}

function drawMembraneLayer(points, offset, layerColor, alpha, strokeAlpha, profile, layerIndex) {
  push();
  translate(offset.x, offset.y);
  noStroke();
  fill(red(layerColor), green(layerColor), blue(layerColor), map(profile.expression, 1, 10, alpha, alpha * 0.72));
  drawSmoothClosedShape(points);

  noFill();
  stroke(red(layerColor), green(layerColor), blue(layerColor), strokeAlpha);
  strokeWeight(map(profile.intensity, 1, 10, 0.8, 1.8));
  drawSmoothClosedShape(points);

  drawBreathingOpening(points, profile, layerIndex);
  pop();
}

function drawSmoothClosedShape(points) {
  beginShape();
  curveVertex(points[points.length - 2].x, points[points.length - 2].y);
  curveVertex(points[points.length - 1].x, points[points.length - 1].y);
  points.forEach((point) => curveVertex(point.x, point.y));
  curveVertex(points[0].x, points[0].y);
  curveVertex(points[1].x, points[1].y);
  endShape(CLOSE);
}

function drawBreathingOpening(points, profile, layerIndex) {
  const openStrength = map(profile.expression, 1, 10, 1, 0.08);
  if (openStrength < 0.18 || layerIndex === 2) return;

  const seamIndex = floor(points.length * 0.15 + layerIndex * 1.4) % points.length;
  const seamSpan = floor(map(profile.expression, 1, 10, 4, 1));
  stroke(246, 240, 232, map(openStrength, 0, 1, 26, 92));
  strokeWeight(map(openStrength, 0, 1, 5, 15));
  strokeCap(ROUND);
  noFill();
  beginShape();
  for (let i = -2; i <= seamSpan + 2; i++) {
    const point = points[(seamIndex + i + points.length) % points.length];
    curveVertex(point.x, point.y);
  }
  endShape();
}

function drawMembraneCore(profile, radius, compression, baseColor, deepColor, index) {
  const coreRadius = radius * map(profile.expression, 1, 10, 0.26, 0.18);
  const points = buildMembranePoints(profile, coreRadius, compression * 0.92, map(profile.control, 1, 10, 1.2, 4.5), index + 5, 1.2);
  const coreColor = lerpColor(baseColor, deepColor, 0.68);

  noStroke();
  fill(red(coreColor), green(coreColor), blue(coreColor), map(profile.expression, 1, 10, 82, 56));
  drawSmoothClosedShape(points);

  noFill();
  stroke(red(deepColor), green(deepColor), blue(deepColor), 72);
  strokeWeight(1);
  drawSmoothClosedShape(points);
}

function drawDurationTraces(profile, radius, baseColor, deepColor, dominant, index) {
  const traceCount = floor(map(profile.duration, 1, 10, dominant ? 2 : 2, dominant ? 4 : 9));
  const tailLength = map(profile.duration, 1, 10, dominant ? PI * 0.42 : PI * 0.55, dominant ? PI * 1.05 : PI * 1.75);
  const traceOffset = map(profile.expression, 1, 10, 1.32, 0.94);
  const bodyWave = map(profile.body, 1, 10, dominant ? 0.25 : 0.4, dominant ? 2.8 : 5.5);

  noFill();
  for (let t = 0; t < traceCount; t++) {
    const start = -PI * 0.84 + t * 0.21 + index * 0.37;
    const end = start + tailLength + sin(index + t) * 0.28;
    const traceRadius = radius * traceOffset + t * map(profile.duration, 1, 10, 1.8, 4.8);
    const c = lerpColor(baseColor, deepColor, t / max(traceCount - 1, 1) * 0.55);

    stroke(red(c), green(c), blue(c), map(profile.expression, 1, 10, dominant ? 52 : 64, dominant ? 20 : 24));
    strokeWeight(map(profile.intensity, 1, 10, dominant ? 0.55 : 0.55, dominant ? 1.35 : 1.5));
    beginShape();
    for (let a = start; a <= end; a += 0.055) {
      const n = noise(cos(a) + index, sin(a) + t, frameCount * 0.01);
      const r = traceRadius + (n - 0.5) * map(profile.control, 1, 10, 1, 14) + sin(a * 2.4 + frameCount * 0.02) * bodyWave;
      vertex(cos(a) * r, sin(a) * r * map(profile.expression, 1, 10, 1.0, 0.78));
    }
    endShape();
  }
}

function drawUnstableEdges(profile, radius, compression, deepColor, dominant, index) {
  if (profile.control < 6) return;

  const segments = floor(map(profile.control, 6, 10, dominant ? 3 : 5, dominant ? 9 : 12));
  stroke(red(deepColor), green(deepColor), blue(deepColor), map(profile.control, 6, 10, dominant ? 34 : 50, dominant ? 92 : 132));
  strokeWeight(map(profile.control, 6, 10, 0.7, dominant ? 1.7 : 1.8));

  for (let i = 0; i < segments; i++) {
    const a = random(TWO_PI);
    const len = random(0.08, 0.2);
    noFill();
    beginShape();
    for (let t = 0; t < 4; t++) {
      const aa = a + len * t;
      const r = radius + random(-4, map(profile.control, 6, 10, 8, 20));
      vertex(cos(aa) * r, sin(aa) * r * compression);
    }
    endShape();
  }
}

function drawLocalFractures(profile, radius, compression, deepColor, index) {
  if (profile.gap < 7) return;

  const cracks = floor(map(profile.gap, 7, 10, 3, 11));
  stroke(red(deepColor), green(deepColor), blue(deepColor), map(profile.gap, 7, 10, 70, 150));
  strokeWeight(map(profile.gap, 7, 10, 1, 2.6));

  for (let i = 0; i < cracks; i++) {
    const a = random(TWO_PI);
    const start = radius * random(0.2, 0.62);
    const end = min(radius * random(0.64, 1.08), radius + 20);
    const bend = random(-0.36, 0.36);
    noFill();
    beginShape();
    vertex(cos(a) * start, sin(a) * start * compression);
    vertex(cos(a + bend) * lerp(start, end, 0.55), sin(a + bend) * lerp(start, end, 0.55) * compression);
    vertex(cos(a + bend * 0.4) * end, sin(a + bend * 0.4) * end * compression);
    endShape();
  }
}

function drawSourceLabel(source, radius, dominant) {
  const label = getSourceShortLabel(source);

  push();
  noStroke();
  fill(55, 49, 44, dominant ? 102 : 108);
  textAlign(CENTER, CENTER);
  textSize(dominant ? 10 : 10);
  text(label, dominant ? radius * 0.72 : 0, radius + (dominant ? 26 : 16));
  pop();
}

function getSourceShortLabel(source) {
  return {
    academic: "Academic",
    career: "Career",
    comparison: "Compare",
    relationship: "Relation",
    family: "Family",
    identity: "Identity",
    mixed: "Mixed"
  }[source] || source;
}

function drawDominantLabel(item, center) {
  push();
  translate(center.x + 98, center.y - 82);
  noStroke();
  fill(50, 44, 39, 82);
  textAlign(LEFT, CENTER);
  textSize(10);
  text("dominant source", 0, 0);
  stroke(50, 44, 39, 36);
  strokeWeight(1);
  line(-12, 4, -42, 26);
  pop();
}

function pressureScore(profile) {
  return profile.intensity + profile.duration + profile.control + profile.gap + profile.body * 0.5 + profile.expression * 0.5;
}

function sourceColor(source, intensity, dominant) {
  const palette = getSourcePalette(source);
  const t = normalized(intensity);
  const c = lerpColor(color(...palette.base), color(...palette.deep), dominant ? 0.24 + t * 0.42 : 0.08 + t * 0.26);
  return dominant ? c : lerpColor(c, color(246, 240, 232), 0.22);
}

function sourceDeepColor(source, intensity, dominant) {
  const palette = getSourcePalette(source);
  const t = normalized(intensity);
  const c = lerpColor(color(...palette.base), color(...palette.deep), 0.5 + t * 0.42);
  return dominant ? c : lerpColor(c, color(246, 240, 232), 0.12);
}

function getSourcePalette(source) {
  const palettes = {
    academic: { base: [184, 102, 72], deep: [112, 57, 43] },
    career: { base: [105, 128, 144], deep: [56, 76, 92] },
    comparison: { base: [174, 118, 126], deep: [113, 68, 78] },
    relationship: { base: [137, 121, 158], deep: [86, 73, 106] },
    family: { base: [126, 146, 103], deep: [74, 92, 64] },
    identity: { base: [131, 124, 151], deep: [79, 74, 98] },
    mixed: { base: [145, 129, 109], deep: [91, 79, 68] }
  };
  return palettes[source] || palettes.mixed;
}

function normalized(value) {
  return constrain((value - 1) / 9, 0, 1);
}
