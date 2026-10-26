import { toTextureGridY, toTextureVelocityY } from "../lib/displacement-coordinates";

const CARD_SELECTOR = "[data-dom-snapshot-displacement='true']";
const ACTIVE_CLASS = "is-dom-snapshot-displacement-active";
const OUTPUT_CLASS = "project-card__dom-snapshot-displacement-canvas";
const GRID_COLUMNS = 8;
const GRID_RADIUS = 0.34;
const PERIPHERAL_GRID_RADIUS = 0.48;
const FIELD_STRENGTH = 15;
const PERIPHERAL_FIELD_STRENGTH = 24;
const FIELD_RELAXATION = 0.86;
const MAX_FIELD_DISPLACEMENT = 5.5;
const MAX_PIXEL_RATIO = 2;

const VERTEX_SHADER_SOURCE = `#version 300 es
  precision highp float;

  in vec2 aPosition;
  out vec2 vUv;

  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SOURCE = `#version 300 es
  precision highp float;

  in vec2 vUv;
  out vec4 outColor;

  uniform sampler2D uContent;
  uniform sampler2D uField;
  uniform vec2 uResolution;
  uniform float uTime;

  float hash(vec2 point) {
    vec3 value = fract(vec3(point.xyx) * 0.1031);
    value += dot(value, value.yzx + 33.33);
    return fract((value.x + value.y) * value.z);
  }

  vec4 sampleContent(vec2 uv) {
    if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return vec4(0.0);
    return texture(uContent, uv);
  }

  void main() {
    vec2 contentUv = vUv;
    vec2 fieldUv = vUv;
    vec2 offset = texture(uField, fieldUv).rg;
    vec2 push = offset * 0.018;
    vec4 red = sampleContent(contentUv - push * 1.26);
    vec4 green = sampleContent(contentUv - push);
    vec4 blue = sampleContent(contentUv - push * 0.74);
    float alpha = (red.a + green.a + blue.a) / 3.0;
    vec3 colour = vec3(red.r * red.a, green.g * green.a, blue.b * blue.a);
    float pushPx = length(push * uResolution);
    float gate = smoothstep(1.5, 18.0, pushPx);
    vec2 grainCell = floor(gl_FragCoord.xy / 1.5);
    float grain = hash(grainCell + vec2(uTime * 0.37, uTime * 0.113));
    colour += (grain - 0.5) * 0.05 * gate * alpha;
    outColor = vec4(clamp(colour, vec3(0.0), vec3(alpha)), alpha);
  }
`;

type Renderer = {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
  contentTexture: WebGLTexture;
  fieldTexture: WebGLTexture;
  position: number;
  contentUniform: WebGLUniformLocation;
  fieldUniform: WebGLUniformLocation;
  resolutionUniform: WebGLUniformLocation;
  timeUniform: WebGLUniformLocation;
};

const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), maximum);

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);

  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createRenderer(canvas: HTMLCanvasElement): Renderer | null {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    stencil: false
  });

  if (!gl || gl.isContextLost()) return null;

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

  if (!vertexShader || !fragmentShader) {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    return null;
  }

  const program = gl.createProgram();

  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  const position = gl.getAttribLocation(program, "aPosition");
  const contentUniform = gl.getUniformLocation(program, "uContent");
  const fieldUniform = gl.getUniformLocation(program, "uField");
  const resolutionUniform = gl.getUniformLocation(program, "uResolution");
  const timeUniform = gl.getUniformLocation(program, "uTime");
  const buffer = gl.createBuffer();
  const contentTexture = gl.createTexture();
  const fieldTexture = gl.createTexture();

  if (
    position < 0 ||
    !contentUniform ||
    !fieldUniform ||
    !resolutionUniform ||
    !timeUniform ||
    !buffer ||
    !contentTexture ||
    !fieldTexture
  ) {
    if (buffer) gl.deleteBuffer(buffer);
    if (contentTexture) gl.deleteTexture(contentTexture);
    if (fieldTexture) gl.deleteTexture(fieldTexture);
    gl.deleteProgram(program);
    return null;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  gl.bindTexture(gl.TEXTURE_2D, contentTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.bindTexture(gl.TEXTURE_2D, fieldTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.BLEND);

  return {
    gl,
    program,
    buffer,
    contentTexture,
    fieldTexture,
    position,
    contentUniform,
    fieldUniform,
    resolutionUniform,
    timeUniform
  };
}

function destroyRenderer(renderer: Renderer) {
  const { gl, program, buffer, contentTexture, fieldTexture } = renderer;

  gl.deleteTexture(contentTexture);
  gl.deleteTexture(fieldTexture);
  gl.deleteBuffer(buffer);
  gl.deleteProgram(program);
}

class DomSnapshotDisplacement {
  private readonly canvas = document.createElement("canvas");
  private readonly sourceCanvas = document.createElement("canvas");
  private readonly reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  private readonly finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  private readonly resizeObserver: ResizeObserver;
  private renderer: Renderer | null = null;
  private animationFrame = 0;
  private columns = 0;
  private rows = 0;
  private rowScale = 1;
  private field = new Float32Array(0);
  private fieldDirty = false;
  private textureReady = false;
  private preparePending = false;
  private wantsEffect = false;
  private tracking = false;
  private pointerX = 0.5;
  private pointerY = 0.5;
  private previousMotionX = 0.5;
  private previousMotionY = 0.5;
  private pointerVelocityX = 0;
  private pointerVelocityY = 0;
  private peripheralInfluence = 0;
  private lastPointerTime = 0;
  private lastFrame = 0;
  private time = 0;
  private destroyed = false;

  constructor(
    private readonly card: HTMLElement,
    private readonly surface: HTMLImageElement,
    private readonly surfaceHost: HTMLElement
  ) {
    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.canvas.className = OUTPUT_CLASS;
    this.canvas.setAttribute("aria-hidden", "true");
    this.canvas.style.pointerEvents = "none";
    this.surfaceHost.append(this.canvas);

    this.resizeObserver.observe(this.surface);
    this.resizeObserver.observe(this.surfaceHost);
    this.card.addEventListener("pointerenter", this.handlePointerEnter);
    this.card.addEventListener("pointermove", this.handlePointerMove);
    this.card.addEventListener("pointerleave", this.handlePointerLeave);
    this.card.addEventListener("focus", this.activate);
    this.card.addEventListener("blur", this.deactivate);
    this.reducedMotion.addEventListener("change", this.handleMotionPreference);
    document.addEventListener("visibilitychange", this.handleVisibility);
    this.canvas.addEventListener("webglcontextlost", this.handleContextLost);

    if (this.reducedMotion.matches) this.destroy();
  }

  destroy() {
    if (this.destroyed) return;

    this.destroyed = true;
    this.resizeObserver.disconnect();
    this.card.removeEventListener("pointerenter", this.handlePointerEnter);
    this.card.removeEventListener("pointermove", this.handlePointerMove);
    this.card.removeEventListener("pointerleave", this.handlePointerLeave);
    this.card.removeEventListener("focus", this.activate);
    this.card.removeEventListener("blur", this.deactivate);
    this.reducedMotion.removeEventListener("change", this.handleMotionPreference);
    document.removeEventListener("visibilitychange", this.handleVisibility);
    this.canvas.removeEventListener("webglcontextlost", this.handleContextLost);
    cancelAnimationFrame(this.animationFrame);
    this.card.classList.remove(ACTIVE_CLASS);

    if (this.renderer) destroyRenderer(this.renderer);
    this.renderer = null;
    this.canvas.remove();
  }

  private readonly handlePointerEnter = (event: PointerEvent) => {
    if (event.pointerType === "touch" || !this.finePointer.matches) return;

    this.updatePointer(event, true);
  };

  private readonly handlePointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch" || !this.finePointer.matches) return;

    this.updatePointer(event, false);
    if (!this.isHoverReady()) return;

    this.activate();
    this.requestFrame();
  };

  private readonly handlePointerLeave = () => {
    this.tracking = false;
    this.pointerVelocityX = 0;
    this.pointerVelocityY = 0;
    this.peripheralInfluence = 0;

    if (!this.card.matches(":focus-visible")) this.deactivate();
  };

  private readonly handleMotionPreference = () => {
    if (this.reducedMotion.matches) this.destroy();
  };

  private readonly handleVisibility = () => {
    if (document.visibilityState !== "visible") this.deactivate();
  };

  private readonly handleContextLost = (event: Event) => {
    event.preventDefault();
    this.renderer = null;
    this.textureReady = false;
    this.card.classList.remove(ACTIVE_CLASS);
  };

  private readonly handleResize = () => {
    if (!this.renderer) return;

    this.resizeCanvas();
    this.syncGrid();

    if (this.textureReady && this.paintSource()) {
      this.uploadImage();
      this.draw();
    }
  };

  private readonly activate = () => {
    if (this.destroyed || this.reducedMotion.matches || document.visibilityState !== "visible") return;

    this.wantsEffect = true;
    void this.prepare();
  };

  private readonly deactivate = () => {
    this.wantsEffect = false;
    this.requestFrame();
  };

  private isHoverReady() {
    return this.card.dataset.motionReveal !== "home-card" || this.card.dataset.motionHoverReady === "true";
  }

  private updatePointer(event: PointerEvent, entering: boolean) {
    const bounds = this.surfaceHost.getBoundingClientRect();
    const motionBounds = this.card.getBoundingClientRect();
    const imageBounds = this.surface.getBoundingClientRect();

    if (!bounds.width || !bounds.height || !motionBounds.width || !motionBounds.height || !imageBounds.width || !imageBounds.height) return;

    const projectedClientX = clamp(event.clientX, imageBounds.left, imageBounds.right);
    const projectedClientY = clamp(event.clientY, imageBounds.top, imageBounds.bottom);
    const nextPointerX = clamp((projectedClientX - bounds.left) / bounds.width, 0, 1);
    const nextPointerY = clamp((projectedClientY - bounds.top) / bounds.height, 0, 1);
    const nextMotionX = clamp((event.clientX - motionBounds.left) / motionBounds.width, 0, 1);
    const nextMotionY = clamp((event.clientY - motionBounds.top) / motionBounds.height, 0, 1);
    const outsideX = Math.max(imageBounds.left - event.clientX, 0, event.clientX - imageBounds.right);
    const outsideY = Math.max(imageBounds.top - event.clientY, 0, event.clientY - imageBounds.bottom);
    const peripheralDistance = Math.hypot(outsideX, outsideY);
    const peripheralRange = Math.max(Math.min(motionBounds.width, motionBounds.height) * 0.22, 1);
    const nextPeripheralInfluence = clamp(peripheralDistance / peripheralRange, 0, 1);
    const now = performance.now();

    if (entering || !this.tracking) {
      this.tracking = true;
      this.pointerX = nextPointerX;
      this.pointerY = nextPointerY;
      this.previousMotionX = nextMotionX;
      this.previousMotionY = nextMotionY;
      this.pointerVelocityX = 0;
      this.pointerVelocityY = 0;
      this.peripheralInfluence = nextPeripheralInfluence;
      this.lastPointerTime = now;
      return;
    }

    const elapsed = Math.max((now - this.lastPointerTime) / 1000, 0.001);
    const deltaX = clamp(((nextMotionX - this.previousMotionX) * motionBounds.width) / bounds.width, -0.18, 0.18);
    const deltaY = clamp(((nextMotionY - this.previousMotionY) * motionBounds.height) / bounds.height, -0.18, 0.18);
    const distance = Math.hypot(deltaX * bounds.width, deltaY * bounds.height);
    const speed = distance / elapsed;
    const speedGate = clamp((speed - 80) / 620, 0, 1);

    this.pointerVelocityX = deltaX * speedGate;
    this.pointerVelocityY = toTextureVelocityY(deltaY * speedGate);
    this.pointerX = nextPointerX;
    this.pointerY = nextPointerY;
    this.previousMotionX = nextMotionX;
    this.previousMotionY = nextMotionY;
    this.peripheralInfluence = nextPeripheralInfluence;
    this.lastPointerTime = now;
  }

  private async prepare() {
    if (this.preparePending || this.destroyed) return;

    if (!this.renderer) this.renderer = createRenderer(this.canvas);
    if (!this.renderer) return;

    this.resizeCanvas();
    this.syncGrid();

    if (this.textureReady) {
      if (!this.paintSource()) return;

      this.uploadImage();

      if (this.wantsEffect) {
        this.card.classList.add(ACTIVE_CLASS);
        this.requestFrame();
      }
      return;
    }

    this.preparePending = true;

    try {
      await this.surface.decode().catch(() => undefined);

      if (this.destroyed || !this.renderer || !this.surface.naturalWidth || !this.surface.naturalHeight) return;

      if (!this.paintSource()) return;

      this.uploadImage();
      this.textureReady = true;
      this.field.fill(0);
      this.fieldDirty = true;
      this.draw();

      if (this.wantsEffect) {
        this.card.classList.add(ACTIVE_CLASS);
        this.requestFrame();
      }
    } catch {
      this.textureReady = false;
      this.card.classList.remove(ACTIVE_CLASS);
    } finally {
      this.preparePending = false;
    }
  }

  private resizeCanvas() {
    const renderer = this.renderer;

    if (!renderer) return;

    const hostBounds = this.surfaceHost.getBoundingClientRect();
    const ratio = clamp(window.devicePixelRatio || 1, 1, MAX_PIXEL_RATIO);
    const width = Math.max(1, Math.round(hostBounds.width * ratio));
    const height = Math.max(1, Math.round(hostBounds.height * ratio));

    this.canvas.style.left = "0px";
    this.canvas.style.top = "0px";
    this.canvas.style.width = `${hostBounds.width}px`;
    this.canvas.style.height = `${hostBounds.height}px`;

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    if (this.sourceCanvas.width !== width || this.sourceCanvas.height !== height) {
      this.sourceCanvas.width = width;
      this.sourceCanvas.height = height;
    }

    renderer.gl.viewport(0, 0, width, height);
  }

  private syncGrid() {
    const renderer = this.renderer;

    if (!renderer) return;

    const bounds = this.surfaceHost.getBoundingClientRect();
    const nextRows = Math.max(2, Math.round((GRID_COLUMNS * Math.max(bounds.height, 1)) / Math.max(bounds.width, 1)));

    this.rowScale = (Math.max(bounds.height, 1) * GRID_COLUMNS) / (Math.max(bounds.width, 1) * nextRows);

    if (this.columns === GRID_COLUMNS && this.rows === nextRows) return;

    this.columns = GRID_COLUMNS;
    this.rows = nextRows;
    this.field = new Float32Array(this.columns * this.rows * 2);
    this.fieldDirty = false;

    const { gl, fieldTexture } = renderer;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, this.columns, this.rows, 0, gl.RG, gl.FLOAT, this.field);
  }

  private uploadImage() {
    const renderer = this.renderer;

    if (!renderer) return;

    const { gl, contentTexture } = renderer;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, contentTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.sourceCanvas);
  }

  private paintSource() {
    const sourceContext = this.sourceCanvas.getContext("2d");

    if (!sourceContext) return false;

    const imageBounds = this.surface.getBoundingClientRect();
    const hostBounds = this.surfaceHost.getBoundingClientRect();

    if (!imageBounds.width || !imageBounds.height || !hostBounds.width || !hostBounds.height) return false;

    const ratio = clamp(window.devicePixelRatio || 1, 1, MAX_PIXEL_RATIO);
    const imageLeft = (imageBounds.left - hostBounds.left) * ratio;
    const imageTop = (imageBounds.top - hostBounds.top) * ratio;
    const imageWidth = imageBounds.width * ratio;
    const imageHeight = imageBounds.height * ratio;

    sourceContext.clearRect(0, 0, this.sourceCanvas.width, this.sourceCanvas.height);
    sourceContext.drawImage(this.surface, imageLeft, imageTop, imageWidth, imageHeight);

    return true;
  }

  private uploadField() {
    const renderer = this.renderer;

    if (!renderer || !this.fieldDirty) return;

    const { gl, fieldTexture } = renderer;
    this.fieldDirty = false;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.columns, this.rows, gl.RG, gl.FLOAT, this.field);
  }

  private stepField(delta: number) {
    const decay = Math.pow(FIELD_RELAXATION, delta * 60);
    let maximum = 0;

    for (let index = 0; index < this.field.length; index += 1) {
      const value = this.field[index] * decay;
      this.field[index] = value;
      maximum = Math.max(maximum, Math.abs(value));
    }

    const hasVelocity = Math.abs(this.pointerVelocityX) > 0.00001 || Math.abs(this.pointerVelocityY) > 0.00001;

    if (this.tracking && hasVelocity) {
      const gridX = this.pointerX * this.columns;
      const gridY = toTextureGridY(this.pointerY, this.rows);
      const radius = GRID_RADIUS + (PERIPHERAL_GRID_RADIUS - GRID_RADIUS) * this.peripheralInfluence;
      const fieldStrength = FIELD_STRENGTH + (PERIPHERAL_FIELD_STRENGTH - FIELD_STRENGTH) * this.peripheralInfluence;
      const maxDistance = this.columns * radius;
      const maxDistanceSquared = maxDistance * maxDistance;

      for (let row = 0; row < this.rows; row += 1) {
        const deltaY = (gridY - row) * this.rowScale;

        for (let column = 0; column < this.columns; column += 1) {
          const deltaX = gridX - column;
          const distanceSquared = deltaX * deltaX + deltaY * deltaY;

          if (distanceSquared >= maxDistanceSquared) continue;

          const distance = Math.sqrt(Math.max(distanceSquared, 0.001));
          const power = 1 - distance / maxDistance;
          const index = 2 * (column + this.columns * row);
          this.field[index] = clamp(this.field[index] + fieldStrength * this.pointerVelocityX * power, -MAX_FIELD_DISPLACEMENT, MAX_FIELD_DISPLACEMENT);
          this.field[index + 1] = clamp(this.field[index + 1] + fieldStrength * this.pointerVelocityY * power, -MAX_FIELD_DISPLACEMENT, MAX_FIELD_DISPLACEMENT);
          maximum = Math.max(maximum, Math.abs(this.field[index]), Math.abs(this.field[index + 1]));
        }
      }
    }

    this.pointerVelocityX *= Math.pow(0.9, delta * 60);
    this.pointerVelocityY *= Math.pow(0.9, delta * 60);

    if (Math.abs(this.pointerVelocityX) < 0.00001) this.pointerVelocityX = 0;
    if (Math.abs(this.pointerVelocityY) < 0.00001) this.pointerVelocityY = 0;

    this.fieldDirty = true;
    return maximum > 0.02 || hasVelocity;
  }

  private requestFrame() {
    if (this.animationFrame || this.destroyed || !this.renderer || !this.textureReady) return;

    this.animationFrame = requestAnimationFrame(this.render);
  }

  private readonly render = (now: number) => {
    this.animationFrame = 0;

    if (this.destroyed || !this.renderer || !this.textureReady) return;

    const delta = this.lastFrame ? Math.min((now - this.lastFrame) / 1000, 1 / 30) : 1 / 60;
    this.lastFrame = now;
    this.time += delta;
    const alive = this.stepField(delta);

    this.draw();

    if (alive) {
      this.requestFrame();
      return;
    }

    if (!this.wantsEffect) this.card.classList.remove(ACTIVE_CLASS);
    this.lastFrame = 0;
  };

  private draw() {
    const renderer = this.renderer;

    if (!renderer || !this.textureReady && !this.preparePending) return;

    const { gl, program, buffer, contentTexture, fieldTexture, position, contentUniform, fieldUniform, resolutionUniform, timeUniform } = renderer;

    this.uploadField();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, contentTexture);
    gl.uniform1i(contentUniform, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);
    gl.uniform1i(fieldUniform, 1);
    gl.uniform2f(resolutionUniform, this.canvas.width, this.canvas.height);
    gl.uniform1f(timeUniform, this.time);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

export function mountDomSnapshotDisplacement(): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const effects = [...document.querySelectorAll<HTMLElement>(CARD_SELECTOR)].flatMap((card) => {
    const surface = card.querySelector<HTMLImageElement>(".project-card__media img");
    const surfaceHost = card.querySelector<HTMLElement>(".project-card__media");

    return surface && surfaceHost ? [new DomSnapshotDisplacement(card, surface, surfaceHost)] : [];
  });

  return () => effects.forEach((effect) => effect.destroy());
}
