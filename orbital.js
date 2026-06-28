(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const DEFAULT_SOURCE_OPTIONS = {
    academic: { short: "Academic" },
    career: { short: "Career" },
    social: { short: "Compare" },
    relationship: { short: "Relationship" },
    family: { short: "Family" },
    identity: { short: "Identity" },
    physical: { short: "Physical" }
  };

  const ORBITAL_COLORS = {
    academic: {
      light: [255, 241, 207],
      base: [242, 193, 118],
      mid: [228, 163, 93],
      deep: [155, 96, 68],
      glow: [239, 174, 91]
    },
    career: {
      light: [234, 241, 255],
      base: [176, 200, 220],
      mid: [141, 168, 196],
      deep: [83, 105, 128],
      glow: [130, 165, 200]
    },
    social: {
      light: [244, 237, 255],
      base: [202, 180, 232],
      mid: [169, 138, 216],
      deep: [105, 83, 143],
      glow: [174, 137, 222]
    },
    relationship: {
      light: [255, 240, 244],
      base: [234, 176, 190],
      mid: [217, 141, 162],
      deep: [142, 82, 103],
      glow: [224, 132, 158]
    },
    family: {
      light: [255, 241, 223],
      base: [221, 184, 142],
      mid: [200, 157, 117],
      deep: [119, 88, 63],
      glow: [202, 156, 112]
    },
    identity: {
      light: [239, 248, 238],
      base: [181, 207, 176],
      mid: [150, 184, 149],
      deep: [93, 118, 92],
      glow: [142, 184, 140]
    },
    physical: {
      light: [234, 248, 247],
      base: [179, 214, 215],
      mid: [143, 190, 192],
      deep: [89, 121, 125],
      glow: [133, 190, 193]
    }
  };

  const SURFACE_TEXTURES = {
    academic: [
      { type: "path", tone: "light", points: [[-0.66, -0.28], [-0.22, -0.36], [0.38, -0.24]] },
      { type: "path", tone: "dark", points: [[-0.52, 0.18], [-0.04, 0.08], [0.54, 0.2]] },
      { type: "circle", tone: "speck", x: -0.36, y: -0.06, r: 0.055 },
      { type: "circle", tone: "speck", x: 0.18, y: 0.34, r: 0.045 },
      { type: "circle", tone: "light", x: 0.42, y: -0.06, r: 0.035 }
    ],
    career: [
      { type: "ellipse", tone: "light", x: -0.18, y: -0.28, rx: 0.58, ry: 0.13, rotate: -12 },
      { type: "ellipse", tone: "dark", x: 0.2, y: 0.1, rx: 0.66, ry: 0.16, rotate: 10 },
      { type: "ellipse", tone: "light", x: -0.04, y: 0.36, rx: 0.46, ry: 0.1, rotate: -4 },
      { type: "circle", tone: "mist", x: 0.38, y: -0.34, r: 0.11 }
    ],
    social: [
      { type: "path", tone: "light", points: [[-0.58, -0.16], [-0.1, -0.3], [0.5, -0.12]] },
      { type: "path", tone: "light", points: [[-0.28, 0.4], [0.18, 0.28], [0.58, 0.38]] },
      { type: "circle", tone: "speck", x: -0.46, y: 0.1, r: 0.038 },
      { type: "circle", tone: "speck", x: 0.08, y: -0.48, r: 0.028 },
      { type: "circle", tone: "speck", x: 0.42, y: 0.12, r: 0.036 },
      { type: "ellipse", tone: "light", x: 0.18, y: -0.08, rx: 0.25, ry: 0.06, rotate: -22 }
    ],
    relationship: [
      { type: "ellipse", tone: "light", x: -0.28, y: -0.18, rx: 0.34, ry: 0.2, rotate: -18 },
      { type: "ellipse", tone: "dark", x: 0.3, y: 0.16, rx: 0.36, ry: 0.22, rotate: 15 },
      { type: "circle", tone: "mist", x: -0.08, y: 0.34, r: 0.14 },
      { type: "ellipse", tone: "light", x: 0.22, y: -0.38, rx: 0.24, ry: 0.12, rotate: 7 }
    ],
    family: [
      { type: "path", tone: "dark", points: [[-0.62, -0.38], [-0.16, -0.24], [0.54, -0.32]] },
      { type: "path", tone: "light", points: [[-0.68, 0.0], [-0.12, -0.08], [0.58, 0.02]] },
      { type: "path", tone: "dark", points: [[-0.48, 0.34], [0.08, 0.24], [0.54, 0.36]] },
      { type: "circle", tone: "speck", x: -0.34, y: 0.18, r: 0.052 },
      { type: "circle", tone: "speck", x: 0.36, y: -0.04, r: 0.044 }
    ],
    identity: [
      { type: "ellipse", tone: "light", x: -0.22, y: -0.26, rx: 0.56, ry: 0.12, rotate: -18 },
      { type: "ellipse", tone: "dark", x: 0.18, y: 0.02, rx: 0.58, ry: 0.12, rotate: -3 },
      { type: "ellipse", tone: "light", x: -0.1, y: 0.32, rx: 0.5, ry: 0.1, rotate: 13 },
      { type: "path", tone: "mist", points: [[-0.5, -0.02], [0.0, 0.12], [0.5, -0.02]] }
    ],
    physical: [
      { type: "ellipse", tone: "light", x: -0.16, y: -0.24, rx: 0.5, ry: 0.14, rotate: -10 },
      { type: "ellipse", tone: "mist", x: 0.06, y: 0.08, rx: 0.62, ry: 0.18, rotate: 8 },
      { type: "ellipse", tone: "light", x: -0.08, y: 0.36, rx: 0.44, ry: 0.1, rotate: -8 },
      { type: "circle", tone: "mist", x: 0.36, y: -0.28, r: 0.09 }
    ]
  };

  let orbitalState = null;
  let planetUid = 0;
  const MIN_PLANET_SIZE = 28;
  const MAX_PLANET_SIZE = 58;
  const MIN_STAR_SIZE = 88;
  const MAX_STAR_SIZE = 124;

  function getIntensityPercent(profile) {
    const value = Number(profile?.intensity) || 0;
    return value > 10
      ? clamp(value, 0, 100)
      : mapValue(value, 1, 10, 0, 100);
  }

  function getIntensity10(profile) {
    const value = Number(profile?.intensity) || 0;
    return value > 10
      ? clamp(value / 10, 0, 10)
      : clamp(value, 0, 10);
  }

  function getPressureGravityPercent(pressureGravity) {
    const value = Number(pressureGravity) || 0;
    return value > 10
      ? clamp(value, 0, 100)
      : mapValue(value, 0, 10, 0, 100);
  }

  function calculatePressureSize(profile, pressureGravity, minSize, maxSize) {
    const intensityNormalized = getIntensityPercent(profile) / 100;
    const gravityNormalized = getPressureGravityPercent(pressureGravity) / 100;
    const normalized = clamp(intensityNormalized * 0.86 + gravityNormalized * 0.14, 0, 1);
    return minSize + normalized * (maxSize - minSize);
  }

  function calculatePlanetSize(profile, pressureGravity) {
    return calculatePressureSize(profile, pressureGravity, MIN_PLANET_SIZE, MAX_PLANET_SIZE);
  }

  function calculateStarSize(profile, pressureGravity) {
    return calculatePressureSize(profile, pressureGravity, MIN_STAR_SIZE, MAX_STAR_SIZE);
  }

  function renderOrbitalView(container, combinedData, options = {}) {
    if (!container || !combinedData) return;
    stopOrbitalView();
    container.replaceChildren();

    const scene = createOrbitalScene(combinedData, options);
    container.appendChild(scene.svg);
    orbitalState = {
      frame: null,
      planets: scene.planets,
      star: scene.star,
      selectedSource: options.selectedSource || combinedData.dominantSource,
      onSourceSelect: options.onSourceSelect,
      startedAt: performance.now(),
      lastTime: performance.now()
    };
    bindSourceInteractions(orbitalState);
    applyOrbitalSelection(orbitalState, orbitalState.selectedSource);
    startOrbitalAnimation(orbitalState);
  }

  function stopOrbitalView() {
    if (orbitalState && orbitalState.frame) {
      cancelAnimationFrame(orbitalState.frame);
    }
    orbitalState = null;
  }

  function createOrbitalScene(combinedData, options = {}) {
    const sourceOptions = options.sourceOptions || DEFAULT_SOURCE_OPTIONS;
    const dominant = computeDominantSource(combinedData);
    const orbiting = normalizeProfiles(combinedData).filter((item) => item.source !== dominant.source);
    const svg = makeSvg("svg", {
      class: "orbital-svg",
      viewBox: "0 0 1000 720",
      role: "img",
      "aria-label": "Orbital solar pressure visualization"
    });

    const defs = createDefs(dominant.source);
    const stage = makeSvg("g", { class: "orbital-stage" });
    const center = { x: 500, y: 350 };
    const planets = [];
    const orbitAdjustments = options.orbitAdjustments || options.adjustedSources || {};

    svg.append(defs, createPaperMist(), stage);
    drawQuietStars(stage);

    const orbitLayout = computeOrbitLayout(orbiting, combinedData, options.seed || 1, center);
    orbitLayout.forEach((config) => {
      applyAdjustmentTargets(config, orbitAdjustments[config.item.source], true);
      config.orbit = createOrbitElement(config);
      stage.appendChild(config.orbit);
      if (config.profile.duration >= 7) {
        config.echo = createOrbitEcho(config);
        stage.appendChild(config.echo);
      }
    });

    const star = createDominantStar(dominant, center, sourceOptions);
    applyDominantAdjustmentTargets(star, orbitAdjustments[dominant.source], true);
    stage.append(star.orbit, star.node);

    orbitLayout.forEach((config) => {
      const planet = createPlanetElement(config.item.source, config.profile, config, sourceOptions);
      stage.append(planet.connector, planet.label, planet.node);
      planets.push(planet);
    });

    if (!orbitLayout.length) {
      stage.appendChild(createSingleSourceNote(center));
    }

    return { svg, planets, star };
  }

  function createDefs(source) {
    const defs = makeSvg("defs");
    const starColor = ORBITAL_COLORS[source] || ORBITAL_COLORS.physical;

    const starGradient = makeSvg("radialGradient", { id: "orbitalStarGradient", cx: "42%", cy: "36%", r: "68%" });
    starGradient.append(
      makeSvg("stop", { offset: "0%", "stop-color": "rgb(255, 247, 219)" }),
      makeSvg("stop", { offset: "46%", "stop-color": rgb(mix(starColor.base, [246, 221, 160], 0.52)) }),
      makeSvg("stop", { offset: "100%", "stop-color": rgb(starColor.deep) })
    );

    const planetShade = makeSvg("radialGradient", { id: "orbitalPlanetShade", cx: "72%", cy: "74%", r: "74%" });
    planetShade.append(
      makeSvg("stop", { offset: "0%", "stop-color": "rgba(39, 31, 27, 0)" }),
      makeSvg("stop", { offset: "54%", "stop-color": "rgba(39, 31, 27, 0.02)" }),
      makeSvg("stop", { offset: "100%", "stop-color": "rgba(39, 31, 27, 0.28)" })
    );

    const planetHighlight = makeSvg("radialGradient", { id: "orbitalPlanetHighlight", cx: "28%", cy: "22%", r: "48%" });
    planetHighlight.append(
      makeSvg("stop", { offset: "0%", "stop-color": "rgba(255, 255, 248, 0.9)" }),
      makeSvg("stop", { offset: "34%", "stop-color": "rgba(255, 252, 240, 0.26)" }),
      makeSvg("stop", { offset: "100%", "stop-color": "rgba(255, 252, 240, 0)" })
    );

    const softBlur = makeSvg("filter", { id: "orbitalSoftBlur", x: "-70%", y: "-70%", width: "240%", height: "240%" });
    softBlur.append(makeSvg("feGaussianBlur", { stdDeviation: "16" }));

    const paperBlur = makeSvg("filter", { id: "orbitalPaperBlur", x: "-20%", y: "-20%", width: "140%", height: "140%" });
    paperBlur.append(makeSvg("feGaussianBlur", { stdDeviation: "32" }));

    const planetNoise = makeSvg("filter", { id: "orbitalPlanetNoise", x: "-20%", y: "-20%", width: "140%", height: "140%" });
    planetNoise.append(
      makeSvg("feTurbulence", { type: "fractalNoise", baseFrequency: "0.82", numOctaves: "3", seed: "11" }),
      makeSvg("feColorMatrix", { type: "saturate", values: "0" })
    );

    const planetVeil = makeSvg("filter", { id: "orbitalPlanetVeil", x: "-30%", y: "-30%", width: "160%", height: "160%" });
    planetVeil.append(makeSvg("feGaussianBlur", { stdDeviation: "1.15" }));

    const planetRelief = makeSvg("filter", { id: "orbitalPlanetRelief", x: "-24%", y: "-24%", width: "148%", height: "148%" });
    planetRelief.append(makeSvg("feDropShadow", {
      dx: "0.7",
      dy: "1.1",
      stdDeviation: "1.05",
      "flood-color": "rgba(66, 49, 38, 0.18)"
    }));

    defs.append(starGradient, planetShade, planetHighlight, softBlur, paperBlur, planetNoise, planetVeil, planetRelief);
    return defs;
  }

  function createPaperMist() {
    const mist = makeSvg("g", { class: "orbital-mist", filter: "url(#orbitalPaperBlur)" });
    mist.append(
      makeSvg("ellipse", { cx: "365", cy: "300", rx: "210", ry: "94" }),
      makeSvg("ellipse", { cx: "650", cy: "410", rx: "240", ry: "108" })
    );
    return mist;
  }

  function drawQuietStars(stage) {
    const points = [
      [180, 150, 1.5], [235, 510, 1.1], [740, 144, 1.3], [818, 484, 1.7],
      [120, 350, 1], [885, 300, 1.2], [330, 115, 0.9], [670, 585, 1.1]
    ];
    const group = makeSvg("g", { class: "orbital-dust" });
    points.forEach(([cx, cy, r]) => group.appendChild(makeSvg("circle", { cx, cy, r })));
    stage.appendChild(group);
  }

  function computeDominantSource(combinedData) {
    const profiles = normalizeProfiles(combinedData);
    return profiles.find((item) => item.source === combinedData.dominantSource) || profiles[0];
  }

  function computeOrbitLayout(orbitingSources, combinedData, seed, center) {
    const count = orbitingSources.length;
    const baseAngles = count === 1
      ? [Math.PI * 0.1]
      : orbitingSources.map((_, index) => -Math.PI * 0.12 + (Math.PI * 2 * index) / count);

    return orbitingSources.map((item, index) => {
      const profile = item.profile;
      const layer = index % 4;
      const radiusScale = count <= 2 ? 1.12 : 1;
      const gapOffset = mapValue(profile.gap, 1, 10, -6, 24);
      const rx = (235 + layer * 48 + index * 12 + gapOffset) * radiusScale;
      const ry = (142 + layer * 34 + index * 10 - gapOffset * 0.34) * radiusScale;
      const speed = (Math.PI * 2) / (mapValue(layer, 0, 3, 18, 42) * 1000 + index * 2400);
      const initialAngle = baseAngles[index] + seededNoise(seed, index) * 0.18;
      const planetRadius = calculatePlanetSize(profile, item.pressureGravity || item.score);
      const opacity = mapValue(profile.expression, 1, 10, 0.98, 0.82);
      const orbitOpacity = mapValue(profile.duration, 1, 10, 0.34, 0.72);

      return {
        item,
        profile,
        index,
        center,
        baseRx: rx,
        baseRy: ry,
        baseSpeed: speed,
        basePlanetRadius: planetRadius,
        baseOpacity: opacity,
        baseOrbitOpacity: orbitOpacity,
        rx,
        ry,
        speed,
        targetRx: rx,
        targetRy: ry,
        targetSpeed: speed,
        angle: initialAngle,
        phase: initialAngle,
        planetRadius,
        targetPlanetRadius: planetRadius,
        opacity,
        targetOpacity: opacity,
        haloScale: 1,
        targetHaloScale: 1,
        shineScale: 1,
        targetShineScale: 1,
        textureScale: 1,
        targetTextureScale: 1,
        visualSoftening: 0,
        targetVisualSoftening: 0,
        orbitOpacity,
        targetOrbitOpacity: orbitOpacity,
        adjusted: false,
        orbitClass: getOrbitClass(profile, index)
      };
    });
  }

  function createOrbitElement(config) {
    const orbit = makeSvg("ellipse", {
      class: `orbital-ring ${config.orbitClass}`,
      "data-source": config.item.source,
      cx: config.center.x,
      cy: config.center.y,
      rx: config.rx,
      ry: config.ry,
      transform: `rotate(${orbitTilt(config.index)} ${config.center.x} ${config.center.y})`
    });
    orbit.style.opacity = String(config.orbitOpacity);
    return orbit;
  }

  function createOrbitEcho(config) {
    const echo = makeSvg("ellipse", {
      class: "orbital-ring orbital-ring-echo",
      "data-source": config.item.source,
      cx: config.center.x,
      cy: config.center.y,
      rx: config.rx + 8,
      ry: config.ry + 4,
      transform: `rotate(${orbitTilt(config.index)} ${config.center.x} ${config.center.y})`
    });
    echo.style.opacity = String(mapValue(config.profile.duration, 7, 10, 0.14, 0.28));
    return echo;
  }

  function createDominantStar(dominant, center, sourceOptions) {
    const profile = dominant.profile;
    const group = makeSvg("g", {
      class: "orbital-star orbital-source-target",
      transform: `translate(${center.x} ${center.y})`,
      "data-source": dominant.source,
      role: "button",
      tabindex: "0",
      "aria-label": `Select ${getSourceLabel(dominant.source, sourceOptions)}`
    });
    const size = calculateStarSize(profile, dominant.pressureGravity || dominant.score);
    const pulseSize = size + mapValue(profile.body, 1, 10, 16, 34);
    const pulseDuration = mapValue(profile.body, 1, 10, 5.8, 4.2);
    const label = getSourceLabel(dominant.source, sourceOptions);
    const wideGlow = makeSvg("circle", { class: "orbital-star-glow wide", r: pulseSize + 54, filter: "url(#orbitalSoftBlur)" });
    const glow = makeSvg("circle", { class: "orbital-star-glow", r: pulseSize + 22 });
    const outerRing = makeSvg("circle", { class: "orbital-star-ring", r: size + 20 });
    const thinRing = makeSvg("circle", { class: "orbital-star-ring thin", r: size + 38 });
    const reorbitRing = makeSvg("circle", { class: "orbital-star-reorbit-ring", r: size + 58 });
    const orbit = makeSvg("ellipse", {
      class: "orbital-ring orbital-dominant-shift-orbit",
      "data-source": dominant.source,
      cx: center.x,
      cy: center.y,
      rx: size + 58,
      ry: (size + 58) * 0.55
    });
    orbit.style.opacity = "0";
    const core = makeSvg("circle", { class: "orbital-star-core", r: size });
    const kernel = makeSvg("circle", { class: "orbital-star-kernel", r: size * 0.46 });

    group.style.setProperty("--star-pulse", `${pulseDuration}s`);
    group.style.setProperty("--star-opacity", "1");
    group.append(
      wideGlow,
      glow,
      outerRing,
      thinRing,
      reorbitRing,
      core,
      kernel
    );

    const text = makeSvg("text", { class: "orbital-star-label", x: "0", y: "-4", "text-anchor": "middle" });
    const main = makeSvg("tspan", { x: "0", dy: "0" });
    main.textContent = label;
    const sub = makeSvg("tspan", { x: "0", dy: "18", class: "orbital-star-sub" });
    sub.textContent = "dominant source";
    text.append(main, sub);
    group.appendChild(text);

    return {
      source: dominant.source,
      node: group,
      orbit,
      center,
      wideGlow,
      glow,
      outerRing,
      thinRing,
      reorbitRing,
      core,
      kernel,
      baseSize: size,
      basePulseSize: pulseSize,
      basePulseDuration: pulseDuration,
      size,
      targetSize: size,
      pulseRadius: pulseSize,
      targetPulseRadius: pulseSize,
      reorbitRadius: size + 58,
      targetReorbitRadius: size + 58,
      x: center.x,
      y: center.y,
      targetX: center.x,
      targetY: center.y,
      opacity: 1,
      targetOpacity: 1,
      haloScale: 1,
      targetHaloScale: 1,
      orbitOpacity: 0,
      targetOrbitOpacity: 0
    };
  }

  function createPlanetElement(source, profile, config, sourceOptions) {
    const uid = `orbitalPlanet${planetUid++}`;
    const visual = getPlanetVisual(source, profile, config.visualSoftening);
    const planetDefs = createPlanetDefs(uid, visual);
    const group = makeSvg("g", {
      class: `orbital-planet-node orbital-source-target orbital-planet-${source}`,
      "data-source": source,
      role: "button",
      tabindex: "0",
      "aria-label": `Select ${getSourceLabel(source, sourceOptions)}`
    });
    const visualIntensity = getIntensity10(profile);
    const halo = makeSvg("circle", { class: "orbital-planet-halo", r: config.planetRadius + mapValue(visualIntensity, 1, 10, 7, 18) });
    const body = makeSvg("circle", {
      class: "orbital-planet-body",
      r: config.planetRadius,
      fill: `url(#${uid}-gradient)`
    });
    const texture = createPlanetTexture(source, profile, uid);
    const clouds = createPlanetClouds(source, uid);
    const shade = makeSvg("circle", { class: "orbital-planet-shade", r: config.planetRadius, fill: "url(#orbitalPlanetShade)" });
    const inner = makeSvg("circle", {
      class: "orbital-planet-inner",
      cx: -config.planetRadius * 0.27,
      cy: -config.planetRadius * 0.28,
      r: config.planetRadius * 0.42,
      fill: "url(#orbitalPlanetHighlight)"
    });
    const shine = makeSvg("ellipse", { class: "orbital-planet-shine" });
    const rim = makeSvg("circle", { class: "orbital-planet-rim", r: config.planetRadius });
    const connector = makeSvg("line", { class: "orbital-label-line" });
    const label = renderPlanetLabel(source, config, sourceOptions);

    applyPlanetVisualVariables(group, visual);
    group.style.setProperty("--planet-opacity", config.opacity);
    group.style.setProperty("--planet-pulse", `${mapValue(profile.body, 1, 10, 6.4, 4.6)}s`);
    group.append(planetDefs.defs, halo, body, texture.group, clouds.group, shade, inner, shine, rim);

    const planet = {
      source,
      profile,
      config,
      uid,
      node: group,
      halo,
      body,
      texture,
      clouds,
      shade,
      inner,
      shine,
      rim,
      gradientStops: planetDefs.stops,
      clipCircle: planetDefs.clipCircle,
      connector,
      label,
      orbit: config.orbit,
      echo: config.echo,
      labelSide: config.index % 2 === 0 ? 1 : -1
    };

    updatePlanetGeometry(planet);
    updatePlanetVisuals(planet);

    return planet;
  }

  function createPlanetDefs(uid, visual) {
    const defs = makeSvg("defs");
    const gradient = makeSvg("radialGradient", { id: `${uid}-gradient`, cx: "31%", cy: "26%", r: "78%" });
    const stops = {
      light: makeSvg("stop", { offset: "0%" }),
      base: makeSvg("stop", { offset: "34%" }),
      mid: makeSvg("stop", { offset: "68%" }),
      dark: makeSvg("stop", { offset: "100%" })
    };
    gradient.append(stops.light, stops.base, stops.mid, stops.dark);

    const clipPath = makeSvg("clipPath", { id: `${uid}-clip` });
    const clipCircle = makeSvg("circle", { r: "1" });
    clipPath.appendChild(clipCircle);
    defs.append(gradient, clipPath);

    updatePlanetGradient(stops, visual);
    return { defs, stops, clipCircle };
  }

  function createPlanetTexture(source, profile, uid) {
    const group = makeSvg("g", {
      class: `orbital-planet-texture orbital-planet-texture-${source}`,
      "clip-path": `url(#${uid}-clip)`
    });
    const grain = makeSvg("rect", { class: "orbital-planet-grain", filter: "url(#orbitalPlanetNoise)" });
    const marks = createSurfaceMarks(source);
    const speckles = createSpeckles(source);
    const faults = createFaults(source);

    group.append(grain, marks.group, speckles.group, faults.group);
    return { group, grain, marks, speckles, faults, profile };
  }

  function createPlanetClouds(source, uid) {
    const group = makeSvg("g", {
      class: `orbital-planet-clouds orbital-planet-clouds-${source}`,
      "clip-path": `url(#${uid}-clip)`
    });
    const seed = sourceSeed(source) + 73;
    const items = [0, 1, 2].map((index) => {
      const element = makeSvg("ellipse", { class: "orbital-planet-cloud-band" });
      group.appendChild(element);
      return {
        element,
        x: mapValue(seededNoise(seed, index), 0, 1, -0.18, 0.18),
        y: mapValue(seededNoise(seed + 3, index), 0, 1, -0.34, 0.36),
        rx: mapValue(seededNoise(seed + 7, index), 0, 1, 0.46, 0.72),
        ry: mapValue(seededNoise(seed + 13, index), 0, 1, 0.07, 0.15),
        rotate: mapValue(seededNoise(seed + 19, index), 0, 1, -18, 18)
      };
    });
    return { group, items };
  }

  function createSurfaceMarks(source) {
    const specs = SURFACE_TEXTURES[source] || SURFACE_TEXTURES.physical;
    const group = makeSvg("g", { class: "orbital-planet-marks" });
    const items = specs.map((spec) => {
      const element = makeSvg(spec.type === "path" ? "path" : spec.type, {
        class: `orbital-planet-mark orbital-planet-mark-${spec.tone || "light"}`
      });
      if (spec.type === "path") {
        element.setAttribute("fill", "none");
      }
      group.appendChild(element);
      return { element, spec };
    });
    return { group, items };
  }

  function createSpeckles(source) {
    const group = makeSvg("g", { class: "orbital-planet-speckles" });
    const seed = sourceSeed(source) + 17;
    const items = Array.from({ length: 14 }, (_, index) => {
      const angle = seededNoise(seed, index) * Math.PI * 2;
      const distance = Math.sqrt(seededNoise(seed + 9, index)) * 0.72;
      const element = makeSvg("circle", { class: "orbital-planet-speckle" });
      group.appendChild(element);
      return {
        element,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        r: mapValue(seededNoise(seed + 21, index), 0, 1, 0.012, 0.032)
      };
    });
    return { group, items };
  }

  function createFaults(source) {
    const group = makeSvg("g", { class: "orbital-planet-faults" });
    const seed = sourceSeed(source) + 31;
    const items = [0, 1].map((index) => {
      const element = makeSvg("path", { class: "orbital-planet-fault", fill: "none" });
      group.appendChild(element);
      return {
        element,
        y: mapValue(seededNoise(seed, index), 0, 1, -0.34, 0.36),
        bend: mapValue(seededNoise(seed + 5, index), 0, 1, -0.18, 0.18),
        rotate: mapValue(seededNoise(seed + 11, index), 0, 1, -19, 19)
      };
    });
    return { group, items };
  }

  function updatePlanetGeometry(planet) {
    const radius = planet.config.planetRadius;
    const haloPadding = mapValue(getIntensity10(planet.profile), 1, 10, 8, 20) * mapValue(planet.config.visualSoftening, 0, 1, 1, 0.74);

    planet.body.setAttribute("r", radius.toFixed(2));
    planet.shade.setAttribute("r", radius.toFixed(2));
    planet.inner.setAttribute("cx", (-radius * 0.27).toFixed(2));
    planet.inner.setAttribute("cy", (-radius * 0.28).toFixed(2));
    planet.inner.setAttribute("r", (radius * mapValue(planet.config.visualSoftening, 0, 1, 0.42, 0.5)).toFixed(2));
    planet.rim.setAttribute("r", radius.toFixed(2));
    planet.halo.setAttribute("r", (radius + haloPadding).toFixed(2));
    planet.clipCircle.setAttribute("r", radius.toFixed(2));

    planet.texture.grain.setAttribute("x", (-radius).toFixed(2));
    planet.texture.grain.setAttribute("y", (-radius).toFixed(2));
    planet.texture.grain.setAttribute("width", (radius * 2).toFixed(2));
    planet.texture.grain.setAttribute("height", (radius * 2).toFixed(2));
    updateCloudBands(planet, radius);
    updateSurfaceMarks(planet, radius);
    updateSpeckles(planet, radius);
    updateFaults(planet, radius);

    planet.shine.setAttribute("cx", (-radius * 0.23).toFixed(2));
    planet.shine.setAttribute("cy", (-radius * 0.29).toFixed(2));
    planet.shine.setAttribute("rx", (radius * 0.34).toFixed(2));
    planet.shine.setAttribute("ry", (radius * 0.18).toFixed(2));
    planet.shine.setAttribute("transform", "rotate(-24)");
  }

  function updatePlanetVisuals(planet) {
    const visual = getPlanetVisual(planet.source, planet.profile, planet.config.visualSoftening);
    visual.textureOpacity *= planet.config.textureScale;
    visual.grainOpacity *= planet.config.textureScale;
    visual.markOpacity *= planet.config.textureScale;
    visual.speckleOpacity *= planet.config.textureScale;
    visual.faultOpacity *= planet.config.textureScale;
    visual.cloudOpacity *= planet.config.textureScale;
    visual.highlightOpacity *= planet.config.shineScale;
    visual.shineOpacity *= planet.config.shineScale;
    visual.rimOpacity *= mapValue(planet.config.shineScale, 0.6, 1, 0.92, 1.08);
    updatePlanetGradient(planet.gradientStops, visual);
    applyPlanetVisualVariables(planet.node, visual);
    planet.texture.group.style.opacity = visual.textureOpacity.toFixed(3);
    planet.texture.grain.style.opacity = visual.grainOpacity.toFixed(3);
    planet.texture.marks.group.style.opacity = visual.markOpacity.toFixed(3);
    planet.texture.speckles.group.style.opacity = visual.speckleOpacity.toFixed(3);
    planet.texture.faults.group.style.opacity = visual.faultOpacity.toFixed(3);
    planet.clouds.group.style.opacity = visual.cloudOpacity.toFixed(3);
    planet.shade.style.opacity = visual.shadowOpacity.toFixed(3);
    planet.inner.style.opacity = visual.highlightOpacity.toFixed(3);
    planet.shine.style.opacity = visual.shineOpacity.toFixed(3);
    planet.rim.style.opacity = visual.rimOpacity.toFixed(3);
    planet.halo.style.opacity = (visual.haloOpacity * planet.config.haloScale).toFixed(3);
    planet.node.style.setProperty("--halo-opacity", (visual.haloOpacity * planet.config.haloScale).toFixed(3));
    planet.node.style.setProperty("--shine-opacity", visual.shineOpacity.toFixed(3));
    planet.node.style.setProperty("--texture-opacity", visual.textureOpacity.toFixed(3));
    planet.node.style.setProperty("--cloud-opacity", visual.cloudOpacity.toFixed(3));
    planet.node.classList.toggle("is-adjusted", planet.config.adjusted);
  }

  function updatePlanetGradient(stops, visual) {
    stops.light.setAttribute("stop-color", rgb(visual.light));
    stops.light.setAttribute("stop-opacity", visual.lightOpacity.toFixed(3));
    stops.base.setAttribute("stop-color", rgb(visual.base));
    stops.mid.setAttribute("stop-color", rgb(visual.mid));
    stops.dark.setAttribute("stop-color", rgb(visual.dark));
  }

  function applyPlanetVisualVariables(group, visual) {
    group.style.setProperty("--planet-light", rgb(visual.light));
    group.style.setProperty("--planet-base", rgb(visual.base));
    group.style.setProperty("--planet-mid", rgb(visual.mid));
    group.style.setProperty("--planet-dark", rgb(visual.dark));
    group.style.setProperty("--planet-glow", rgba(visual.glow, visual.glowAlpha));
    group.style.setProperty("--planet-glow-strong", rgba(visual.glow, visual.glowStrongAlpha));
    group.style.setProperty("--planet-glow-soft", rgba(visual.glow, visual.glowSoftAlpha));
    group.style.setProperty("--planet-speck", rgba(visual.dark, 0.46));
    group.style.setProperty("--halo-opacity", visual.haloOpacity.toFixed(3));
    group.style.setProperty("--shine-opacity", visual.shineOpacity.toFixed(3));
    group.style.setProperty("--texture-opacity", visual.textureOpacity.toFixed(3));
    group.style.setProperty("--cloud-opacity", visual.cloudOpacity.toFixed(3));
  }

  function updateCloudBands(planet, radius) {
    const softScale = mapValue(planet.config.visualSoftening, 0, 1, 1, 0.92);
    planet.clouds.items.forEach((item) => {
      const cx = item.x * radius;
      const cy = item.y * radius;
      item.element.setAttribute("cx", cx.toFixed(2));
      item.element.setAttribute("cy", cy.toFixed(2));
      item.element.setAttribute("rx", (item.rx * radius * softScale).toFixed(2));
      item.element.setAttribute("ry", (item.ry * radius * softScale).toFixed(2));
      item.element.setAttribute("transform", `rotate(${item.rotate.toFixed(2)} ${cx.toFixed(2)} ${cy.toFixed(2)})`);
    });
  }

  function updateSurfaceMarks(planet, radius) {
    const control = mapValue(planet.profile.control, 1, 10, 0, 1);
    const expressionScale = mapValue(planet.profile.expression, 1, 10, 1, 0.82);
    const softScale = mapValue(planet.config.visualSoftening, 0, 1, 1, 0.9);
    const seed = sourceSeed(planet.source);

    planet.texture.marks.group.setAttribute(
      "transform",
      `scale(${(expressionScale * softScale).toFixed(3)}) rotate(${(control * 7 - 2).toFixed(2)})`
    );

    planet.texture.marks.items.forEach((item, index) => {
      const { element, spec } = item;
      const wobbleX = (seededNoise(seed + 41, index) - 0.5) * 0.12 * control;
      const wobbleY = (seededNoise(seed + 53, index) - 0.5) * 0.12 * control;

      if (spec.type === "circle") {
        element.setAttribute("cx", ((spec.x + wobbleX) * radius).toFixed(2));
        element.setAttribute("cy", ((spec.y + wobbleY) * radius).toFixed(2));
        element.setAttribute("r", (spec.r * radius).toFixed(2));
      } else if (spec.type === "ellipse") {
        element.setAttribute("cx", ((spec.x + wobbleX) * radius).toFixed(2));
        element.setAttribute("cy", ((spec.y + wobbleY) * radius).toFixed(2));
        element.setAttribute("rx", (spec.rx * radius).toFixed(2));
        element.setAttribute("ry", (spec.ry * radius).toFixed(2));
        element.setAttribute(
          "transform",
          `rotate(${(Number(spec.rotate || 0) + control * 4).toFixed(2)} ${((spec.x + wobbleX) * radius).toFixed(2)} ${((spec.y + wobbleY) * radius).toFixed(2)})`
        );
      } else if (spec.type === "path") {
        const points = spec.points.map(([x, y]) => [
          (x + wobbleX) * radius,
          (y + wobbleY) * radius
        ]);
        element.setAttribute("d", pathFromPoints(points));
        element.setAttribute("stroke-width", (Math.max(0.8, radius * 0.04)).toFixed(2));
      }
    });
  }

  function updateSpeckles(planet, radius) {
    planet.texture.speckles.items.forEach((item) => {
      item.element.setAttribute("cx", (item.x * radius).toFixed(2));
      item.element.setAttribute("cy", (item.y * radius).toFixed(2));
      item.element.setAttribute("r", (item.r * radius).toFixed(2));
    });
  }

  function updateFaults(planet, radius) {
    const gap = mapValue(planet.profile.gap, 1, 10, 0, 1);
    planet.texture.faults.items.forEach((item) => {
      const y = item.y * radius;
      const bend = item.bend * radius * gap;
      const start = [-0.58 * radius, y];
      const mid = [0, y + bend];
      const end = [0.56 * radius, y - bend * 0.42];
      item.element.setAttribute("d", `M ${start[0].toFixed(2)} ${start[1].toFixed(2)} Q ${mid[0].toFixed(2)} ${mid[1].toFixed(2)} ${end[0].toFixed(2)} ${end[1].toFixed(2)}`);
      item.element.setAttribute("stroke-width", (Math.max(0.7, radius * 0.035)).toFixed(2));
      item.element.setAttribute("transform", `rotate(${item.rotate.toFixed(2)})`);
    });
  }

  function pathFromPoints(points) {
    if (points.length < 3) {
      return `M ${points.map((point) => point.map((value) => value.toFixed(2)).join(" ")).join(" L ")}`;
    }
    return [
      `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`,
      `Q ${points[1][0].toFixed(2)} ${points[1][1].toFixed(2)} ${points[2][0].toFixed(2)} ${points[2][1].toFixed(2)}`
    ].join(" ");
  }

  function renderPlanetLabel(source, config, sourceOptions) {
    const group = makeSvg("g", { class: "orbital-label" });
    const label = getSourceLabel(source, sourceOptions);
    const main = makeSvg("text", { class: "orbital-label-main" });
    main.textContent = label;
    const sub = makeSvg("text", { class: "orbital-label-sub", y: "16" });
    sub.textContent = "secondary source";
    group.append(main, sub);
    return group;
  }

  function createSingleSourceNote(center) {
    const note = makeSvg("text", {
      class: "orbital-single-note",
      x: center.x,
      y: center.y + 142,
      "text-anchor": "middle"
    });
    note.textContent = "No orbiting secondary source selected";
    return note;
  }

  function startOrbitalAnimation(sceneState) {
    const tick = (time) => {
      const delta = Math.min(time - sceneState.lastTime, 64);
      sceneState.lastTime = time;
      updatePlanetPositions(sceneState.planets, delta, time - sceneState.startedAt);
      updateDominantStar(sceneState.star, delta);
      sceneState.frame = requestAnimationFrame(tick);
    };
    sceneState.frame = requestAnimationFrame(tick);
  }

  function updatePlanetPositions(planets, delta, elapsed) {
    planets.forEach((planet) => {
      const config = planet.config;
      const ease = 1 - Math.exp(-delta / 420);
      config.rx = lerp(config.rx, config.targetRx, ease);
      config.ry = lerp(config.ry, config.targetRy, ease);
      config.speed = lerp(config.speed, config.targetSpeed, ease);
      config.planetRadius = lerp(config.planetRadius, config.targetPlanetRadius, ease);
      config.opacity = lerp(config.opacity, config.targetOpacity, ease);
      config.haloScale = lerp(config.haloScale, config.targetHaloScale, ease);
      config.shineScale = lerp(config.shineScale, config.targetShineScale, ease);
      config.textureScale = lerp(config.textureScale, config.targetTextureScale, ease);
      config.visualSoftening = lerp(config.visualSoftening, config.targetVisualSoftening, ease);
      config.orbitOpacity = lerp(config.orbitOpacity, config.targetOrbitOpacity, ease);
      config.angle += delta * config.speed;

      const wobble = Math.sin(elapsed * 0.00035 + config.index * 1.7) * mapValue(planet.profile.control, 1, 10, 0, 9);
      const angle = config.angle;
      const tilt = orbitTilt(config.index) * Math.PI / 180;
      const rawX = config.rx * Math.cos(angle);
      const rawY = (config.ry + wobble) * Math.sin(angle);
      const x = config.center.x + rawX * Math.cos(tilt) - rawY * Math.sin(tilt);
      const y = config.center.y + rawX * Math.sin(tilt) + rawY * Math.cos(tilt);
      const side = x >= config.center.x ? 1 : -1;
      const labelX = clamp(
        x + side * (52 + config.planetRadius),
        side > 0 ? 84 : 154,
        side > 0 ? 846 : 916
      );
      const labelY = clamp(y + (config.index % 2 === 0 ? -30 : 34), 72, 650);
      const textAnchor = side > 0 ? "start" : "end";

      config.orbit.setAttribute("rx", config.rx.toFixed(2));
      config.orbit.setAttribute("ry", config.ry.toFixed(2));
      config.orbit.style.opacity = String(config.orbitOpacity);
      if (config.echo) {
        config.echo.setAttribute("rx", (config.rx + 8).toFixed(2));
        config.echo.setAttribute("ry", (config.ry + 4).toFixed(2));
        config.echo.style.opacity = String(config.orbitOpacity * 0.38);
      }
      updatePlanetGeometry(planet);
      updatePlanetVisuals(planet);
      planet.node.style.opacity = config.opacity.toFixed(3);
      planet.node.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      planet.connector.setAttribute("x1", x.toFixed(2));
      planet.connector.setAttribute("y1", y.toFixed(2));
      planet.connector.setAttribute("x2", (labelX - side * 8).toFixed(2));
      planet.connector.setAttribute("y2", labelY.toFixed(2));
      planet.label.setAttribute("transform", `translate(${labelX.toFixed(2)} ${labelY.toFixed(2)})`);
      planet.label.querySelectorAll("text").forEach((text) => text.setAttribute("text-anchor", textAnchor));
    });
  }

  function applyAdjustmentTargets(config, adjustment, immediate = false) {
    const current = adjustment || {};
    const adjusted = Boolean(adjustment);
    const distanceOffset = adjusted ? Number(current.distanceOffset || 0) : 0;
    const sizeScale = adjusted ? Number(current.sizeScale || current.sizeFactor || 1) : 1;
    const speedScale = adjusted ? Number(current.speedScale || current.speedFactor || 1) : 1;
    const opacityScale = adjusted ? Number(current.opacityScale || current.opacityFactor || 1) : 1;
    const haloScale = adjusted ? Number(current.haloScale || 1) : 1;
    const shineScale = adjusted ? Number(current.shineScale || 0.82) : 1;
    const textureScale = adjusted ? Number(current.textureScale || 0.78) : 1;

    config.targetRx = config.baseRx + distanceOffset;
    config.targetRy = config.baseRy + distanceOffset * 0.55;
    config.targetSpeed = config.baseSpeed * speedScale;
    config.targetPlanetRadius = config.basePlanetRadius * sizeScale;
    config.targetOpacity = Math.max(0.78, config.baseOpacity * opacityScale);
    config.targetHaloScale = haloScale;
    config.targetShineScale = shineScale;
    config.targetTextureScale = textureScale;
    config.targetVisualSoftening = adjusted ? 1 : 0;
    config.targetOrbitOpacity = config.baseOrbitOpacity * (adjusted ? 0.55 : 1);
    config.adjusted = adjusted;

    if (immediate) {
      config.rx = config.targetRx;
      config.ry = config.targetRy;
      config.speed = config.targetSpeed;
      config.planetRadius = config.targetPlanetRadius;
      config.opacity = config.targetOpacity;
      config.haloScale = config.targetHaloScale;
      config.shineScale = config.targetShineScale;
      config.textureScale = config.targetTextureScale;
      config.visualSoftening = config.targetVisualSoftening;
      config.orbitOpacity = config.targetOrbitOpacity;
    }
  }

  function applyDominantAdjustmentTargets(star, adjustment, immediate = false) {
    const current = adjustment || {};
    const adjusted = Boolean(adjustment);
    const distanceOffset = adjusted ? Number(current.distanceOffset || 0) : 0;
    const sizeScale = adjusted ? Number(current.sizeScale || current.sizeFactor || 1) : 1;
    const speedScale = adjusted ? Number(current.speedScale || current.speedFactor || 1) : 1;
    const opacityScale = adjusted ? Number(current.opacityScale || current.opacityFactor || 1) : 1;
    const haloScale = adjusted ? Number(current.haloScale || 1) : 1;

    star.targetSize = star.baseSize * sizeScale;
    star.targetPulseRadius = star.basePulseSize * sizeScale;
    star.targetReorbitRadius = star.baseSize + 58 + distanceOffset;
    star.targetX = star.center.x + distanceOffset * 0.82;
    star.targetY = star.center.y - distanceOffset * 0.35;
    star.targetOpacity = opacityScale;
    star.targetHaloScale = haloScale;
    star.targetOrbitOpacity = adjusted ? 0.28 : 0;
    star.node.style.setProperty("--star-pulse", `${star.basePulseDuration / speedScale}s`);
    star.node.classList.toggle("is-adjusted", adjusted);

    if (immediate) {
      star.size = star.targetSize;
      star.pulseRadius = star.targetPulseRadius;
      star.reorbitRadius = star.targetReorbitRadius;
      star.x = star.targetX;
      star.y = star.targetY;
      star.opacity = star.targetOpacity;
      star.haloScale = star.targetHaloScale;
      star.orbitOpacity = star.targetOrbitOpacity;
      updateDominantStarElements(star);
    }
  }

  function updateDominantStar(star, delta) {
    if (!star) return;
    const ease = 1 - Math.exp(-delta / 420);
    star.size = lerp(star.size, star.targetSize, ease);
    star.pulseRadius = lerp(star.pulseRadius, star.targetPulseRadius, ease);
    star.reorbitRadius = lerp(star.reorbitRadius, star.targetReorbitRadius, ease);
    star.x = lerp(star.x, star.targetX, ease);
    star.y = lerp(star.y, star.targetY, ease);
    star.opacity = lerp(star.opacity, star.targetOpacity, ease);
    star.haloScale = lerp(star.haloScale, star.targetHaloScale, ease);
    star.orbitOpacity = lerp(star.orbitOpacity, star.targetOrbitOpacity, ease);
    updateDominantStarElements(star);
  }

  function updateDominantStarElements(star) {
    star.wideGlow.setAttribute("r", (star.pulseRadius + 54).toFixed(2));
    star.glow.setAttribute("r", (star.pulseRadius + 22).toFixed(2));
    star.outerRing.setAttribute("r", (star.size + 20).toFixed(2));
    star.thinRing.setAttribute("r", (star.size + 38).toFixed(2));
    star.reorbitRing.setAttribute("r", star.reorbitRadius.toFixed(2));
    star.core.setAttribute("r", star.size.toFixed(2));
    star.kernel.setAttribute("r", (star.size * 0.46).toFixed(2));
    star.node.setAttribute("transform", `translate(${star.x.toFixed(2)} ${star.y.toFixed(2)})`);
    star.node.style.opacity = star.opacity.toFixed(3);
    star.wideGlow.style.opacity = (0.1 * star.haloScale).toFixed(3);
    star.glow.style.opacity = (0.17 * star.haloScale).toFixed(3);
    star.orbit.setAttribute("rx", star.reorbitRadius.toFixed(2));
    star.orbit.setAttribute("ry", (star.reorbitRadius * 0.55).toFixed(2));
    star.orbit.style.opacity = star.orbitOpacity.toFixed(3);
  }

  function bindSourceInteractions(sceneState) {
    const targets = [sceneState.star, ...sceneState.planets];
    targets.forEach((target) => {
      const activate = () => {
        if (typeof sceneState.onSourceSelect === "function") {
          sceneState.onSourceSelect(target.source);
        } else {
          applyOrbitalSelection(sceneState, target.source);
        }
      };
      target.node.addEventListener("click", activate);
      target.node.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      });
    });
  }

  function applyOrbitalSelection(sceneState, selectedSource) {
    if (!sceneState) return;
    sceneState.selectedSource = selectedSource;
    const allPlanets = sceneState.planets;
    const hasMultiple = Boolean(selectedSource);
    const selectedIsStar = sceneState.star.source === selectedSource;
    const shouldMuteOrbitingSources = hasMultiple && !selectedIsStar;

    sceneState.star.node.classList.toggle("is-selected", sceneState.star.source === selectedSource);
    sceneState.star.node.classList.toggle("is-muted", hasMultiple && sceneState.star.source !== selectedSource);
    sceneState.star.orbit.classList.toggle("is-selected", sceneState.star.source === selectedSource);
    sceneState.star.orbit.classList.toggle("is-muted", hasMultiple && sceneState.star.source !== selectedSource);

    allPlanets.forEach((planet) => {
      const selected = planet.source === selectedSource;
      const muted = shouldMuteOrbitingSources && !selected;
      [planet.node, planet.label, planet.connector, planet.orbit, planet.echo].filter(Boolean).forEach((element) => {
        element.classList.toggle("is-selected", selected);
        element.classList.toggle("is-muted", muted);
        element.classList.toggle("is-adjusted", planet.config.adjusted);
      });
    });
  }

  function updateOrbitalSelection(selectedSource) {
    applyOrbitalSelection(orbitalState, selectedSource);
  }

  function updateOrbitalAdjustment(source, adjustment, selectedSource) {
    if (!orbitalState) return;
    const planet = orbitalState.planets.find((item) => item.source === source);
    if (planet) {
      applyAdjustmentTargets(planet.config, adjustment, false);
    } else if (orbitalState.star.source === source) {
      applyDominantAdjustmentTargets(orbitalState.star, adjustment, false);
    }
    applyOrbitalSelection(orbitalState, selectedSource || source);
  }

  function normalizeProfiles(combinedData) {
    return (combinedData.profiles || []).map((item) => ({
      source: item.source,
      profile: item.profile,
      score: item.score || pressureScore(item.profile),
      pressureGravity: item.pressureGravity || item.score || pressureScore(item.profile)
    })).sort((a, b) => b.score - a.score);
  }

  function pressureScore(profile) {
    const intensity = getIntensity10(profile);
    return (
      intensity * 0.30 +
      profile.duration * 0.20 +
      profile.control * 0.20 +
      profile.body * 0.10 +
      profile.expression * 0.10 +
      profile.gap * 0.10
    );
  }

  function getOrbitClass(profile, index) {
    if (profile.gap >= 8) return "is-dotted";
    if (profile.gap >= 6 || index % 3 === 1) return "is-dashed";
    return "is-solid";
  }

  function getPlanetVisual(source, profile, softening = 0) {
    const palette = ORBITAL_COLORS[source] || ORBITAL_COLORS.physical;
    const intensity = mapValue(getIntensity10(profile), 1, 10, 0, 1);
    const duration = mapValue(profile.duration, 1, 10, 0, 1);
    const body = mapValue(profile.body, 1, 10, 0, 1);
    const expression = mapValue(profile.expression, 1, 10, 0, 1);
    const gap = mapValue(profile.gap, 1, 10, 0, 1);
    const quietPaper = [245, 237, 224];

    let light = mix([255, 255, 250], palette.light, 0.72 + intensity * 0.12);
    let base = mix(palette.base, palette.mid, intensity * 0.14);
    let mid = mix(palette.mid, palette.deep, intensity * 0.16);
    let dark = mix(palette.deep, [64, 51, 45], intensity * 0.08);
    const glow = mix(palette.glow, palette.light, softening * 0.18);

    light = mix(light, quietPaper, softening * 0.08);
    base = mix(base, palette.light, softening * 0.22);
    mid = mix(mid, palette.base, softening * 0.22);
    dark = mix(dark, palette.mid, softening * 0.16);

    return {
      light,
      base,
      mid,
      dark,
      glow,
      lightOpacity: mapValue(softening, 0, 1, 1, 0.92),
      glowAlpha: mapValue(intensity, 0, 1, 0.36, 0.58) * mapValue(softening, 0, 1, 1, 0.82),
      glowStrongAlpha: mapValue(intensity, 0, 1, 0.34, 0.52) * mapValue(softening, 0, 1, 1, 0.8),
      glowSoftAlpha: mapValue(intensity, 0, 1, 0.16, 0.24) * mapValue(softening, 0, 1, 1, 0.78),
      haloOpacity: mapValue(intensity, 0, 1, 0.42, 0.78) * mapValue(body, 0, 1, 0.86, 1.18) * mapValue(softening, 0, 1, 1, 0.72),
      textureOpacity: mapValue(duration, 0, 1, 0.36, 0.78) * mapValue(expression, 0, 1, 1, 0.84) * mapValue(softening, 0, 1, 1, 0.78),
      grainOpacity: mapValue(duration, 0, 1, 0.06, 0.16) * mapValue(softening, 0, 1, 1, 0.72),
      markOpacity: mapValue(duration, 0, 1, 0.5, 0.86) * mapValue(expression, 0, 1, 1, 0.84) * mapValue(softening, 0, 1, 1, 0.76),
      speckleOpacity: mapValue(duration, 0, 1, 0.08, 0.22) * mapValue(softening, 0, 1, 1, 0.68),
      cloudOpacity: mapValue(duration, 0, 1, 0.22, 0.5) * mapValue(softening, 0, 1, 1, 0.82),
      faultOpacity: mapValue(gap, 0, 1, 0, 0.36) * mapValue(softening, 0, 1, 1, 0.58),
      shadowOpacity: mapValue(intensity, 0, 1, 0.16, 0.32) * mapValue(softening, 0, 1, 1, 0.72),
      highlightOpacity: mapValue(intensity, 0, 1, 0.48, 0.78) * mapValue(expression, 0, 1, 1, 0.88) * mapValue(softening, 0, 1, 1, 0.92),
      shineOpacity: mapValue(intensity, 0, 1, 0.52, 0.86) * mapValue(expression, 0, 1, 1, 0.9) * mapValue(softening, 0, 1, 1, 0.9),
      rimOpacity: mapValue(intensity, 0, 1, 0.54, 0.82) * mapValue(expression, 0, 1, 1, 0.88) * mapValue(softening, 0, 1, 1, 0.82)
    };
  }

  function sourceSeed(source) {
    return String(source).split("").reduce((sum, character, index) => (
      sum + character.charCodeAt(0) * (index + 1)
    ), 0);
  }

  function getSourceLabel(source, sourceOptions) {
    return (sourceOptions[source] && sourceOptions[source].short) || DEFAULT_SOURCE_OPTIONS[source]?.short || source;
  }

  function makeSvg(tag, attrs = {}) {
    const element = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) element.setAttribute(key, value);
    });
    return element;
  }

  function orbitTilt(index) {
    return [-8, 7, -14, 12][index % 4];
  }

  function seededNoise(seed, index) {
    const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
    return value - Math.floor(value);
  }

  function mapValue(value, inMin, inMax, outMin, outMax) {
    const amount = (clamp(value, inMin, inMax) - inMin) / (inMax - inMin || 1);
    return outMin + (outMax - outMin) * amount;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  function mix(a, b, t) {
    return a.map((value, index) => Math.round(value + (b[index] - value) * t));
  }

  function rgb(color) {
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  }

  function rgba(color, alpha) {
    return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
  }

  window.renderOrbitalView = renderOrbitalView;
  window.stopOrbitalView = stopOrbitalView;
  window.updateOrbitalSelection = updateOrbitalSelection;
  window.updateOrbitalAdjustment = updateOrbitalAdjustment;
})();
