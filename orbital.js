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
    academic: { base: [116, 142, 160], deep: [59, 82, 98] },
    career: { base: [94, 121, 142], deep: [48, 70, 88] },
    social: { base: [190, 132, 142], deep: [125, 75, 86] },
    relationship: { base: [155, 139, 174], deep: [92, 77, 115] },
    family: { base: [139, 157, 118], deep: [82, 102, 72] },
    identity: { base: [142, 134, 164], deep: [84, 78, 108] },
    physical: { base: [111, 154, 145], deep: [58, 98, 91] }
  };

  let orbitalState = null;

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

    const planetGradient = makeSvg("radialGradient", { id: "orbitalPlanetSoft", cx: "36%", cy: "32%", r: "72%" });
    planetGradient.append(
      makeSvg("stop", { offset: "0%", "stop-color": "rgba(255, 255, 255, 0.85)" }),
      makeSvg("stop", { offset: "100%", "stop-color": "rgba(116, 104, 92, 0.72)" })
    );

    const softBlur = makeSvg("filter", { id: "orbitalSoftBlur", x: "-70%", y: "-70%", width: "240%", height: "240%" });
    softBlur.append(makeSvg("feGaussianBlur", { stdDeviation: "16" }));

    const paperBlur = makeSvg("filter", { id: "orbitalPaperBlur", x: "-20%", y: "-20%", width: "140%", height: "140%" });
    paperBlur.append(makeSvg("feGaussianBlur", { stdDeviation: "32" }));

    defs.append(starGradient, planetGradient, softBlur, paperBlur);
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
    const maxScore = Math.max(...normalizeProfiles(combinedData).map((item) => item.score), 1);
    const count = orbitingSources.length;
    const baseAngles = count === 1
      ? [Math.PI * 0.1]
      : orbitingSources.map((_, index) => -Math.PI * 0.12 + (Math.PI * 2 * index) / count);

    return orbitingSources.map((item, index) => {
      const profile = item.profile;
      const layer = index % 4;
      const scoreRatio = item.score / maxScore;
      const radiusScale = count <= 2 ? 1.12 : 1;
      const gapOffset = mapValue(profile.gap, 1, 10, -6, 24);
      const rx = (235 + layer * 48 + index * 12 + gapOffset) * radiusScale;
      const ry = (142 + layer * 34 + index * 10 - gapOffset * 0.34) * radiusScale;
      const speed = (Math.PI * 2) / (mapValue(layer, 0, 3, 18, 42) * 1000 + index * 2400);
      const initialAngle = baseAngles[index] + seededNoise(seed, index) * 0.18;
      const planetRadius = mapValue(profile.intensity, 1, 10, 13, 28) * mapValue(scoreRatio, 0, 1, 0.92, 1.16);
      const opacity = mapValue(profile.expression, 1, 10, 0.96, 0.68);
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
    const size = mapValue(profile.intensity, 1, 10, 58, 88);
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
    const color = getPlanetColor(source, profile.intensity);
    const group = makeSvg("g", {
      class: "orbital-planet-node orbital-source-target",
      "data-source": source,
      role: "button",
      tabindex: "0",
      "aria-label": `Select ${getSourceLabel(source, sourceOptions)}`
    });
    const halo = makeSvg("circle", { class: "orbital-planet-halo", r: config.planetRadius + mapValue(profile.intensity, 1, 10, 7, 18) });
    const body = makeSvg("circle", { class: "orbital-planet-body", r: config.planetRadius });
    const inner = makeSvg("circle", { class: "orbital-planet-inner", cx: -config.planetRadius * 0.25, cy: -config.planetRadius * 0.24, r: config.planetRadius * 0.36 });
    const connector = makeSvg("line", { class: "orbital-label-line" });
    const label = renderPlanetLabel(source, config, sourceOptions);

    group.style.setProperty("--planet-base", rgb(color.base));
    group.style.setProperty("--planet-deep", rgb(color.deep));
    group.style.setProperty("--planet-opacity", config.opacity);
    group.style.setProperty("--planet-pulse", `${mapValue(profile.body, 1, 10, 6.4, 4.6)}s`);
    group.append(halo, body, inner);

    return {
      source,
      profile,
      config,
      node: group,
      halo,
      body,
      inner,
      connector,
      label,
      orbit: config.orbit,
      echo: config.echo,
      labelSide: config.index % 2 === 0 ? 1 : -1
    };
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
      const labelX = clamp(x + side * (52 + config.planetRadius), 84, 916);
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
      planet.body.setAttribute("r", config.planetRadius.toFixed(2));
      planet.halo.setAttribute("r", (config.planetRadius + mapValue(planet.profile.intensity, 1, 10, 7, 18)).toFixed(2));
      planet.inner.setAttribute("cx", (-config.planetRadius * 0.25).toFixed(2));
      planet.inner.setAttribute("cy", (-config.planetRadius * 0.24).toFixed(2));
      planet.inner.setAttribute("r", (config.planetRadius * 0.36).toFixed(2));
      planet.node.style.opacity = config.opacity.toFixed(3);
      planet.halo.style.opacity = (0.18 * config.haloScale).toFixed(3);
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

    config.targetRx = config.baseRx + distanceOffset;
    config.targetRy = config.baseRy + distanceOffset * 0.55;
    config.targetSpeed = config.baseSpeed * speedScale;
    config.targetPlanetRadius = config.basePlanetRadius * sizeScale;
    config.targetOpacity = config.baseOpacity * opacityScale;
    config.targetHaloScale = haloScale;
    config.targetOrbitOpacity = config.baseOrbitOpacity * (adjusted ? 0.55 : 1);
    config.adjusted = adjusted;

    if (immediate) {
      config.rx = config.targetRx;
      config.ry = config.targetRy;
      config.speed = config.targetSpeed;
      config.planetRadius = config.targetPlanetRadius;
      config.opacity = config.targetOpacity;
      config.haloScale = config.targetHaloScale;
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

    sceneState.star.node.classList.toggle("is-selected", sceneState.star.source === selectedSource);
    sceneState.star.node.classList.toggle("is-muted", hasMultiple && sceneState.star.source !== selectedSource);
    sceneState.star.orbit.classList.toggle("is-selected", sceneState.star.source === selectedSource);
    sceneState.star.orbit.classList.toggle("is-muted", hasMultiple && sceneState.star.source !== selectedSource);

    allPlanets.forEach((planet) => {
      const selected = planet.source === selectedSource;
      const muted = hasMultiple && !selected;
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
      score: item.score || pressureScore(item.profile)
    })).sort((a, b) => b.score - a.score);
  }

  function pressureScore(profile) {
    return (
      profile.intensity * 0.30 +
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

  function getPlanetColor(source, intensity) {
    const palette = ORBITAL_COLORS[source] || ORBITAL_COLORS.physical;
    const t = mapValue(intensity, 1, 10, 0.18, 0.72);
    return {
      base: mix(palette.base, palette.deep, t * 0.36),
      deep: mix(palette.base, palette.deep, t)
    };
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

  window.renderOrbitalView = renderOrbitalView;
  window.stopOrbitalView = stopOrbitalView;
  window.updateOrbitalSelection = updateOrbitalSelection;
  window.updateOrbitalAdjustment = updateOrbitalAdjustment;
})();
