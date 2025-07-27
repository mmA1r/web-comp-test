/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/components/app.js":
/*!*******************************!*\
  !*** ./src/components/app.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _bufferZone_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bufferZone.js */ "./src/components/bufferZone.js");
/* harmony import */ var _workZone_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./workZone.js */ "./src/components/workZone.js");
/* harmony import */ var _utils_storage_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/storage.js */ "./src/utils/storage.js");
/* harmony import */ var _styles_app_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles/app.css */ "./src/styles/app.css");






class App extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>${_styles_app_css__WEBPACK_IMPORTED_MODULE_3__["default"]}</style>
            <div class="app">
                <div class="controls">
                    <button id="create-btn">Создать</button>
                    <button id="save-btn">Сохранить</button>
                    <button id="reset-btn">Сбросить</button>
                </div>
                <div class="zones">
                    <buffer-zone></buffer-zone>
                    <work-zone></work-zone>
                </div>
            </div>
        `;

        this.shadowRoot.getElementById('create-btn')
            .addEventListener('click', () => this.onCreate())
        ;

        this.shadowRoot.getElementById('save-btn')
            .addEventListener('click', () => this.onSave())
        ;

        this.shadowRoot.getElementById('reset-btn')
            .addEventListener('click', () => this.onReset())
        ;

        const stored = (0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_2__.loadPolygons)();

        if (stored) {
            this.restoreZones(stored);
        }
  }

    onCreate() {
        this.shadowRoot.querySelector('buffer-zone').createRandom();
    }

    onSave() {
        const bufferPolygons = Array.from(
            this.shadowRoot.querySelector('buffer-zone').shadowRoot.querySelectorAll('polygon-item')
        ).map(polygon => ({
            data: polygon.data,
            x: polygon.position.x,
            y: polygon.position.y,
            zoom: polygon.zoom
        }));
      
        const workZone = this.shadowRoot.querySelector('work-zone');
        const workCamera = workZone.getCamera();

        const workItems  = Array.from(
            workZone.shadowRoot.querySelectorAll('polygon-item')
        ).map(polygon => ({
            data: polygon.data,
            x: polygon.position.x,
            y: polygon.position.y,
            zoom: polygon.zoom
        }));

        (0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_2__.savePolygons)({
            buffer: bufferPolygons,
            work: {
                camera: workCamera,
                items:  workItems
            }
        });
    }
      
    restoreZones(saved) {
        const { buffer, work } = saved;
      
        const buferContainer = this.shadowRoot.querySelector('buffer-zone').shadowRoot.getElementById('buffer');
        buferContainer.innerHTML = '';

        buffer.forEach(({ data, x, y, zoom }) => {
            const polygon = document.createElement('polygon-item');

            polygon.data = data;
            polygon.position = { x, y };
            polygon.zoom = zoom;
            buferContainer.appendChild(polygon);
        });
      
        const workZone = this.shadowRoot.querySelector('work-zone');
        workZone.setCamera(work.camera);
      
        const workZoneContainer = workZone.shadowRoot.querySelector('.polygons');
        workZoneContainer.innerHTML = '';

        work.items.forEach(({ data, x, y, zoom }) => {
            const polygon = document.createElement('polygon-item');
            
            polygon.data = data;
            polygon.position = { x, y };
            polygon.zoom = zoom;
            workZoneContainer.appendChild(polygon);
        });
    }

    onReset() {
        (0,_utils_storage_js__WEBPACK_IMPORTED_MODULE_2__.clearPolygons)();
        window.location.reload();
    }
}

customElements.define('app-root', App);


/***/ }),

/***/ "./src/components/bufferZone.js":
/*!**************************************!*\
  !*** ./src/components/bufferZone.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_random_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/random.js */ "./src/utils/random.js");
/* harmony import */ var _polygon_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./polygon.js */ "./src/components/polygon.js");
/* harmony import */ var _polygon_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_polygon_js__WEBPACK_IMPORTED_MODULE_1__);



class BufferZone extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._onDragOver = this._onDragOver.bind(this);
        this._onDrop = this._onDrop.bind(this);

        this._polySize = 120;
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <div id="buffer"></div>
        `;
        this._buffer = this.shadowRoot.getElementById('buffer');
        this.addEventListener('dragover', this._onDragOver);
        this.addEventListener('drop', this._onDrop);
    }

    disconnectedCallback() {
        this.removeEventListener('dragover', this._onDragOver);
        this.removeEventListener('drop', this._onDrop);
    }

    createRandom() {
        const count = 5 + Math.floor(Math.random() * 16);
        this._buffer.innerHTML = '';
        window._draggedItem = null;

        let nextX = 0;
        let nextY = 0;

        const maxWidth = this._buffer.clientWidth;

        for (let i = 0; i < count; i++) {
            const data = (0,_utils_random_js__WEBPACK_IMPORTED_MODULE_0__.generateRandomPolygon)();
            const polygon = document.createElement('polygon-item');
            polygon.data = data;

            polygon.position = { x: nextX, y: nextY };
            this._buffer.appendChild(polygon);

            nextX += this._polySize;
            if (nextX + this._polySize > maxWidth) {
                nextX = 0;
                nextY += this._polySize;
            }
        }

        this._buffer.style.minHeight = `${nextY + this._polySize}px`;
    }

    _onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    _onDrop(e) {
        e.preventDefault();
    
        let polygon = window._draggedItem;
        if (!polygon) {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            polygon = document.createElement('polygon-item');
            
            polygon.data = data;
        }
    
        const rect = this._buffer.getBoundingClientRect();
        const x = e.clientX - rect.left - this._polySize / 2;
        const y = e.clientY - rect.top  - this._polySize / 2;
        polygon.position = { x, y };

        this._buffer.appendChild(polygon);
    
        window._draggedItem = null;
    }
}

customElements.define('buffer-zone', BufferZone);


/***/ }),

/***/ "./src/components/polygon.js":
/*!***********************************!*\
  !*** ./src/components/polygon.js ***!
  \***********************************/
/***/ (() => {

class Polygon extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this._data = [];
        this._position = { x: 0, y: 0 };
        this._zoom = 1;
        this._onDragStart = this._onDragStart.bind(this);
    }
  
    set data(points) {
        if (!Array.isArray(points)) return;

        this._data = points;
        this._render();
        this._applyTransform();
    }
    get data() { return this._data; }
  
    set position({ x, y }) {
        this._position = { x, y };
        this._applyTransform();
    }
    get position() { return this._position; }
  
    set zoom(z) {
        this._zoom = z;
        this._applyTransform();
    }
    get zoom() { return this._zoom; }
  
    connectedCallback() {
        this.style.position = 'absolute';
        this.style.top = '0';
        this.style.left = '0';

        this.setAttribute('draggable', 'true');
        this.addEventListener('dragstart', this._onDragStart);
    }
    
    disconnectedCallback() {
        this.removeEventListener('dragstart', this._onDragStart);
    }
  
    _onDragStart(e) {
        window._draggedItem = this;

        e.dataTransfer.setData('application/json', JSON.stringify(this._data));
        e.dataTransfer.effectAllowed = 'move';
    }
  
    _applyTransform() {
        const { x, y } = this._position;
        const s = this._zoom;
        this.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    }
  
    _render() {
        const points = this._data.map(p=>`${p.x},${p.y}`).join(' ');

        this.shadowRoot.innerHTML = `
            <style>
                svg {
                    width: 120px; height: 120px;
                    display: block;
                }
                polygon {
                    fill: rgba(100,150,240,0.5);
                    stroke: #3366cc;
                    stroke-width: 2;
                }
            </style>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
                <polygon points="${points}" />
            </svg>
        `;
    }
}
  
customElements.define('polygon-item', Polygon);
  

/***/ }),

/***/ "./src/components/workZone.js":
/*!************************************!*\
  !*** ./src/components/workZone.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _polygon_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./polygon.js */ "./src/components/polygon.js");
/* harmony import */ var _polygon_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_polygon_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _styles_workZone_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/workZone.css */ "./src/styles/workZone.css");




class WorkZone extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this._panX = 0;
        this._panY = 0;
        this._scale = 1;
        this._gridSize = 50;

        this._isPanning = false;
        this._startX = 0;
        this._startY = 0;

        this._onWheel = this._onWheel.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onDragOver = this._onDragOver.bind(this);
        this._onDrop = this._onDrop.bind(this);
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style> ${_styles_workZone_css__WEBPACK_IMPORTED_MODULE_1__["default"]}</style>
            <div id="container">
                <div id="viewport"><div class="polygons"></div></div>
                <div class="labels" id="labels"></div>
            </div>
        `;

        this._container = this.shadowRoot.getElementById('container');
        this._viewport = this.shadowRoot.getElementById('viewport');
        this._labels = this.shadowRoot.getElementById('labels');
        this._polygonsC = this.shadowRoot.querySelector('.polygons');
        this._patternCanvas = document.createElement('canvas');
        this._patternCtx = this._patternCanvas.getContext('2d');

        this._container.addEventListener('mousedown', this._onMouseDown);
        this._container.addEventListener('wheel', this._onWheel, { passive: false });
        this._container.addEventListener('dragover', this._onDragOver);
        this._container.addEventListener('drop', this._onDrop);

        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mouseup', this._onMouseUp);

        this._updateGrid();
    }

    disconnectedCallback() {
        this._container.removeEventListener('mousedown', this._onMouseDown);
        this._container.removeEventListener('wheel', this._onWheel);
        this._container.removeEventListener('dragover', this._onDragOver);
        this._container.removeEventListener('drop', this._onDrop);

        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('mouseup', this._onMouseUp);
    }

    _updateGrid() {
        this._panX = Math.min(this._panX, 0);
        this._panY = Math.min(this._panY, 0);
    
        this._viewport.style.transform = `translate(${this._panX}px, ${-this._panY}px)`;
    
        this._updateBackgroundPattern();
    
        const cw = this._container.clientWidth;
        const ch = this._container.clientHeight;
        const newW = cw - this._panX;
        const newH = ch - this._panY;
        this._viewport.style.width = `${newW}px`;
        this._viewport.style.height = `${newH}px`;
    
        this._renderLabels();
    }

    _renderLabels() {
        const cw = this._container.clientWidth;
        const ch = this._container.clientHeight;

        const scale = this._scale;
        const gridSize = this._gridSize;
        const size = gridSize * scale;
    
        this._labels.innerHTML = '';
    
        const originX = this._panX;
        const nMin = Math.ceil(-originX / size);
        const nMax = Math.floor((cw - originX) / size);
        
        for (let n = nMin; n <= nMax; n++) {
            const screenX = originX + n * size;
            const value = n * gridSize;

            if (value < 0) continue;

            const labelContainer = document.createElement('div');
            labelContainer.className = 'labelX';
            labelContainer.textContent = value;
            labelContainer.style.left = `${screenX}px`;
            labelContainer.style.top = `${ch - 15}px`;
            this._labels.appendChild(labelContainer);
        }
    
        const originY = ch - this._panY;
        const mMin = Math.ceil((ch - originY) / size);
        const mMax = Math.floor(originY / size);
    
        for (let m = mMin; m <= mMax; m++) {
            const screenY = originY - m * size;
            const value = m * gridSize;

            if (value < 0) continue;

            const labelContainer = document.createElement('div');
            labelContainer.className = 'labelY';
            labelContainer.textContent = value;
            labelContainer.style.left = `0px`;
            labelContainer.style.top  = `${screenY}px`;
            this._labels.appendChild(labelContainer);
        }
    }
  
    _updateBackgroundPattern() {
        const size = this._gridSize * this._scale;
        const ctx = this._patternCtx;

        this._patternCanvas.width  = size;
        this._patternCanvas.height = size;

        ctx.clearRect(0,0,size,size);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, size);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, size-0.5);
        ctx.lineTo(size, size-0.5);
        ctx.stroke();

        const dataURL = this._patternCanvas.toDataURL();

        const ox = this._panX % size;
        const oy = (-this._panY) % size;

        this._container.style.backgroundImage = `url(${dataURL})`;
        this._container.style.backgroundRepeat = 'repeat';
        this._container.style.backgroundSize = `${size}px ${size}px`;
        this._container.style.backgroundPosition = `${ox}px ${oy}px`;
    }

    _onMouseDown(e) {
        if (e.target.closest('polygon-item')) return;
        if (e.button !== 0) return;

        this._isPanning = true;
        this._startX = e.clientX - this._panX;
        this._startY = e.clientY + this._panY;

        this._container.style.cursor = 'grabbing';
    }

    _onMouseMove(e) {
        if (!this._isPanning) return;

        this._panX = e.clientX - this._startX;
        this._panY = this._startY - e.clientY;
        this._updateGrid();
    }

    _onMouseUp() {
        this._isPanning = false;
        this._container.style.cursor = 'grab';
    }

    _onWheel(e) {
        e.preventDefault();

        const delta = e.deltaY < 0 ? 1.1 : 0.9;
        this._scale *= delta;
        
        this._polygonsC.querySelectorAll('polygon-item')
            .forEach(polygon => polygon.zoom = this._scale)
        ;

        const rect = this._viewport.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        this._panX -= mx * (delta - 1);
        this._panY += my * (delta - 1);

        this._updateGrid();
    }

    _onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    _onDrop(e) {
        e.preventDefault();
    
        let polygon = window._draggedItem;
        if (!polygon) {
            const d = JSON.parse(e.dataTransfer.getData('application/json'));
            polygon = document.createElement('polygon-item');
            polygon.data = d;
        }
    
        const rect = this._viewport.getBoundingClientRect();
        const containerHeight = this._container.clientHeight;
        
        const lx = e.clientX - rect.left;
        const ly = e.clientY - rect.top;
    
        const gx = (lx - this._panX) / this._scale;
        const gy = ((containerHeight - ly) - this._panY) / this._scale;
    
        const px = gx * this._scale + this._panX;
        const py = (containerHeight - gy * this._scale) - this._panY;
    
        polygon.position = { x: px, y: py };
        polygon.zoom = this._scale;

        this._polygonsC.appendChild(polygon);

        window._draggedItem = null;
    }

    getCamera() {
        return {
            panX: this._panX,
            panY: this._panY,
            scale: this._scale,
            width: this._viewport.clientWidth,
            height: this._viewport.clientHeight
        };
    }

    setCamera({ panX, panY, scale, width, height }) {
        this._panX = panX;
        this._panY = panY;
        this._scale = scale;
        this._viewport.style.width = `${width}px`;
        this._viewport.style.height = `${height}px`;

        this._polygonsC.querySelectorAll('polygon-item')
            .forEach(polygon => polygon.zoom = scale)
        ;

        this._updateGrid();
    }
}

customElements.define('work-zone', WorkZone);


/***/ }),

/***/ "./src/styles/app.css":
/*!****************************!*\
  !*** ./src/styles/app.css ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("* {\n    box-sizing: border-box;\n}\n\n.app {\n    position: relative;\n    width: 100%;\n    height: 100vh;\n    padding: 20px;\n\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    flex-direction: column;\n}\n\n.controls {\n    position: relative;\n    width: 100%;\n    height: 60px;\n\n    display: flex;\n    align-items: center;\n    justify-content: center;\n}\n\n.controls>button {\n    position: relative;\n\n    margin: 0 8px;\n\n    height: 40px;\n    width: 120px;\n\n    cursor: pointer;\n}\n\n.zones {\n    position: relative;\n\n    width: 100%;\n    flex: 1;\n\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    flex-direction: column;\n}\n\n.zones>* {\n    position: relative;\n\n    width: 100%;\n    flex: 1;\n\n    margin: 8px 0;\n\n    border: 1px solid black;\n\n    background-color: rgb(211, 211, 211);\n}\n");

/***/ }),

/***/ "./src/styles/workZone.css":
/*!*********************************!*\
  !*** ./src/styles/workZone.css ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (":host { display: block; }\n\n#container {\n    position: relative;\n    width: 100%;\n    height: 400px;\n    overflow: hidden;\n    cursor: grab;\n}\n\n#viewport {\n    position: absolute;\n    top: 0;\n    left: 0;\n    transform-origin: 0 0;\n}\n\n.labels {\n    position: absolute;\n    top: 0; left: 0;\n    pointer-events: none;\n    font-size: 12px;\n    color: #333;\n    user-select: none;\n}\n\n.labelX, .labelY {\n    position: absolute;\n}\n\n.polygons {\n    position: absolute;\n    top: 0;\n    left: 0;\n}\n");

/***/ }),

/***/ "./src/utils/random.js":
/*!*****************************!*\
  !*** ./src/utils/random.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generateRandomPolygon: () => (/* binding */ generateRandomPolygon)
/* harmony export */ });
function generateRandomPolygon() {
    const vertex = 3 + Math.floor(Math.random() * 5);
    const angleStep = (2 * Math.PI) / vertex;
    const radius = 30 * (0.8 + Math.random() * 0.4);
    const center = { x: 50, y: 50 };

    const points = [];

    for (let i = 0; i < vertex; i++) {
        const angle = i * angleStep + (Math.random() - 0.5) * angleStep * 0.3;
        const r = radius * (0.9 + Math.random() * 0.2);
        
        points.push({
            x: Math.floor(center.x + r * Math.cos(angle)),
            y: Math.floor(center.y + r * Math.sin(angle)),
        });
    }

    return points;
}


/***/ }),

/***/ "./src/utils/storage.js":
/*!******************************!*\
  !*** ./src/utils/storage.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearPolygons: () => (/* binding */ clearPolygons),
/* harmony export */   loadPolygons: () => (/* binding */ loadPolygons),
/* harmony export */   savePolygons: () => (/* binding */ savePolygons)
/* harmony export */ });
function savePolygons(state) {
    localStorage.setItem('state', JSON.stringify(state));
}
  
function loadPolygons() {
    const state = localStorage.getItem('state');
    return state ? JSON.parse(state) : null;
}
  
function clearPolygons() {
    localStorage.removeItem('state');
}
  

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _components_app_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/app.js */ "./src/components/app.js");


})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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YUFBYSxjQUFjLDRCQUE0QixHQUFHLGFBQWEseUJBQXlCLGNBQWMsUUFBUSwyQkFBMkIsc0JBQXNCLGtCQUFrQix3QkFBd0IsR0FBRyxzQkFBc0IseUJBQXlCLEdBQUcsZUFBZSx5QkFBeUIsYUFBYSxjQUFjLEdBQUcsR0FBRyxFOzs7Ozs7Ozs7Ozs7Ozs7QUNBcmhCO0FBQ1A7QUFDQTtBQUNBO0FBQ0EscUJBQXFCOztBQUVyQjs7QUFFQSxvQkFBb0IsWUFBWTtBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbkJPO0FBQ1A7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBLEU7Ozs7OztVQ1pBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBLEU7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQSxFOzs7OztXQ1BBLHdGOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RCxFOzs7Ozs7Ozs7Ozs7O0FDTjZCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViY29tcC10ZXN0Ly4vc3JjL2NvbXBvbmVudHMvYXBwLmpzIiwid2VicGFjazovL3dlYmNvbXAtdGVzdC8uL3NyYy9jb21wb25lbnRzL2J1ZmZlclpvbmUuanMiLCJ3ZWJwYWNrOi8vd2ViY29tcC10ZXN0Ly4vc3JjL2NvbXBvbmVudHMvcG9seWdvbi5qcyIsIndlYnBhY2s6Ly93ZWJjb21wLXRlc3QvLi9zcmMvY29tcG9uZW50cy93b3JrWm9uZS5qcyIsIndlYnBhY2s6Ly93ZWJjb21wLXRlc3QvLi9zcmMvc3R5bGVzL2FwcC5jc3MiLCJ3ZWJwYWNrOi8vd2ViY29tcC10ZXN0Ly4vc3JjL3N0eWxlcy93b3JrWm9uZS5jc3MiLCJ3ZWJwYWNrOi8vd2ViY29tcC10ZXN0Ly4vc3JjL3V0aWxzL3JhbmRvbS5qcyIsIndlYnBhY2s6Ly93ZWJjb21wLXRlc3QvLi9zcmMvdXRpbHMvc3RvcmFnZS5qcyIsIndlYnBhY2s6Ly93ZWJjb21wLXRlc3Qvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vd2ViY29tcC10ZXN0L3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL3dlYmNvbXAtdGVzdC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vd2ViY29tcC10ZXN0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vd2ViY29tcC10ZXN0L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vd2ViY29tcC10ZXN0Ly4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi9idWZmZXJab25lLmpzJztcbmltcG9ydCAnLi93b3JrWm9uZS5qcyc7XG5pbXBvcnQgeyBzYXZlUG9seWdvbnMsIGxvYWRQb2x5Z29ucywgY2xlYXJQb2x5Z29ucyB9IGZyb20gJy4uL3V0aWxzL3N0b3JhZ2UuanMnO1xuXG5pbXBvcnQgYXBwU3R5bGUgZnJvbSAnLi4vc3R5bGVzL2FwcC5jc3MnO1xuXG5jbGFzcyBBcHAgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nIH0pO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QuaW5uZXJIVE1MID0gYFxuICAgICAgICAgICAgPHN0eWxlPiR7YXBwU3R5bGV9PC9zdHlsZT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhcHBcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udHJvbHNcIj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cImNyZWF0ZS1idG5cIj7QodC+0LfQtNCw0YLRjDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwic2F2ZS1idG5cIj7QodC+0YXRgNCw0L3QuNGC0Yw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cInJlc2V0LWJ0blwiPtCh0LHRgNC+0YHQuNGC0Yw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiem9uZXNcIj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1ZmZlci16b25lPjwvYnVmZmVyLXpvbmU+XG4gICAgICAgICAgICAgICAgICAgIDx3b3JrLXpvbmU+PC93b3JrLXpvbmU+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgYDtcblxuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QuZ2V0RWxlbWVudEJ5SWQoJ2NyZWF0ZS1idG4nKVxuICAgICAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5vbkNyZWF0ZSgpKVxuICAgICAgICA7XG5cbiAgICAgICAgdGhpcy5zaGFkb3dSb290LmdldEVsZW1lbnRCeUlkKCdzYXZlLWJ0bicpXG4gICAgICAgICAgICAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLm9uU2F2ZSgpKVxuICAgICAgICA7XG5cbiAgICAgICAgdGhpcy5zaGFkb3dSb290LmdldEVsZW1lbnRCeUlkKCdyZXNldC1idG4nKVxuICAgICAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5vblJlc2V0KCkpXG4gICAgICAgIDtcblxuICAgICAgICBjb25zdCBzdG9yZWQgPSBsb2FkUG9seWdvbnMoKTtcblxuICAgICAgICBpZiAoc3RvcmVkKSB7XG4gICAgICAgICAgICB0aGlzLnJlc3RvcmVab25lcyhzdG9yZWQpO1xuICAgICAgICB9XG4gIH1cblxuICAgIG9uQ3JlYXRlKCkge1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignYnVmZmVyLXpvbmUnKS5jcmVhdGVSYW5kb20oKTtcbiAgICB9XG5cbiAgICBvblNhdmUoKSB7XG4gICAgICAgIGNvbnN0IGJ1ZmZlclBvbHlnb25zID0gQXJyYXkuZnJvbShcbiAgICAgICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdidWZmZXItem9uZScpLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvckFsbCgncG9seWdvbi1pdGVtJylcbiAgICAgICAgKS5tYXAocG9seWdvbiA9PiAoe1xuICAgICAgICAgICAgZGF0YTogcG9seWdvbi5kYXRhLFxuICAgICAgICAgICAgeDogcG9seWdvbi5wb3NpdGlvbi54LFxuICAgICAgICAgICAgeTogcG9seWdvbi5wb3NpdGlvbi55LFxuICAgICAgICAgICAgem9vbTogcG9seWdvbi56b29tXG4gICAgICAgIH0pKTtcbiAgICAgIFxuICAgICAgICBjb25zdCB3b3JrWm9uZSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCd3b3JrLXpvbmUnKTtcbiAgICAgICAgY29uc3Qgd29ya0NhbWVyYSA9IHdvcmtab25lLmdldENhbWVyYSgpO1xuXG4gICAgICAgIGNvbnN0IHdvcmtJdGVtcyAgPSBBcnJheS5mcm9tKFxuICAgICAgICAgICAgd29ya1pvbmUuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yQWxsKCdwb2x5Z29uLWl0ZW0nKVxuICAgICAgICApLm1hcChwb2x5Z29uID0+ICh7XG4gICAgICAgICAgICBkYXRhOiBwb2x5Z29uLmRhdGEsXG4gICAgICAgICAgICB4OiBwb2x5Z29uLnBvc2l0aW9uLngsXG4gICAgICAgICAgICB5OiBwb2x5Z29uLnBvc2l0aW9uLnksXG4gICAgICAgICAgICB6b29tOiBwb2x5Z29uLnpvb21cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHNhdmVQb2x5Z29ucyh7XG4gICAgICAgICAgICBidWZmZXI6IGJ1ZmZlclBvbHlnb25zLFxuICAgICAgICAgICAgd29yazoge1xuICAgICAgICAgICAgICAgIGNhbWVyYTogd29ya0NhbWVyYSxcbiAgICAgICAgICAgICAgICBpdGVtczogIHdvcmtJdGVtc1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgICBcbiAgICByZXN0b3JlWm9uZXMoc2F2ZWQpIHtcbiAgICAgICAgY29uc3QgeyBidWZmZXIsIHdvcmsgfSA9IHNhdmVkO1xuICAgICAgXG4gICAgICAgIGNvbnN0IGJ1ZmVyQ29udGFpbmVyID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2J1ZmZlci16b25lJykuc2hhZG93Um9vdC5nZXRFbGVtZW50QnlJZCgnYnVmZmVyJyk7XG4gICAgICAgIGJ1ZmVyQ29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuXG4gICAgICAgIGJ1ZmZlci5mb3JFYWNoKCh7IGRhdGEsIHgsIHksIHpvb20gfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9seWdvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3BvbHlnb24taXRlbScpO1xuXG4gICAgICAgICAgICBwb2x5Z29uLmRhdGEgPSBkYXRhO1xuICAgICAgICAgICAgcG9seWdvbi5wb3NpdGlvbiA9IHsgeCwgeSB9O1xuICAgICAgICAgICAgcG9seWdvbi56b29tID0gem9vbTtcbiAgICAgICAgICAgIGJ1ZmVyQ29udGFpbmVyLmFwcGVuZENoaWxkKHBvbHlnb24pO1xuICAgICAgICB9KTtcbiAgICAgIFxuICAgICAgICBjb25zdCB3b3JrWm9uZSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCd3b3JrLXpvbmUnKTtcbiAgICAgICAgd29ya1pvbmUuc2V0Q2FtZXJhKHdvcmsuY2FtZXJhKTtcbiAgICAgIFxuICAgICAgICBjb25zdCB3b3JrWm9uZUNvbnRhaW5lciA9IHdvcmtab25lLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLnBvbHlnb25zJyk7XG4gICAgICAgIHdvcmtab25lQ29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuXG4gICAgICAgIHdvcmsuaXRlbXMuZm9yRWFjaCgoeyBkYXRhLCB4LCB5LCB6b29tIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvbHlnb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwb2x5Z29uLWl0ZW0nKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcG9seWdvbi5kYXRhID0gZGF0YTtcbiAgICAgICAgICAgIHBvbHlnb24ucG9zaXRpb24gPSB7IHgsIHkgfTtcbiAgICAgICAgICAgIHBvbHlnb24uem9vbSA9IHpvb207XG4gICAgICAgICAgICB3b3JrWm9uZUNvbnRhaW5lci5hcHBlbmRDaGlsZChwb2x5Z29uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25SZXNldCgpIHtcbiAgICAgICAgY2xlYXJQb2x5Z29ucygpO1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2FwcC1yb290JywgQXBwKTtcbiIsImltcG9ydCB7IGdlbmVyYXRlUmFuZG9tUG9seWdvbiB9IGZyb20gJy4uL3V0aWxzL3JhbmRvbS5qcyc7XG5pbXBvcnQgJy4vcG9seWdvbi5qcyc7XG5cbmNsYXNzIEJ1ZmZlclpvbmUgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nIH0pO1xuICAgICAgICB0aGlzLl9vbkRyYWdPdmVyID0gdGhpcy5fb25EcmFnT3Zlci5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9vbkRyb3AgPSB0aGlzLl9vbkRyb3AuYmluZCh0aGlzKTtcblxuICAgICAgICB0aGlzLl9wb2x5U2l6ZSA9IDEyMDtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LmlubmVySFRNTCA9IGBcbiAgICAgICAgICAgIDxkaXYgaWQ9XCJidWZmZXJcIj48L2Rpdj5cbiAgICAgICAgYDtcbiAgICAgICAgdGhpcy5fYnVmZmVyID0gdGhpcy5zaGFkb3dSb290LmdldEVsZW1lbnRCeUlkKCdidWZmZXInKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuX29uRHJhZ092ZXIpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLl9vbkRyb3ApO1xuICAgIH1cblxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5fb25EcmFnT3Zlcik7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuX29uRHJvcCk7XG4gICAgfVxuXG4gICAgY3JlYXRlUmFuZG9tKCkge1xuICAgICAgICBjb25zdCBjb3VudCA9IDUgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNik7XG4gICAgICAgIHRoaXMuX2J1ZmZlci5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgd2luZG93Ll9kcmFnZ2VkSXRlbSA9IG51bGw7XG5cbiAgICAgICAgbGV0IG5leHRYID0gMDtcbiAgICAgICAgbGV0IG5leHRZID0gMDtcblxuICAgICAgICBjb25zdCBtYXhXaWR0aCA9IHRoaXMuX2J1ZmZlci5jbGllbnRXaWR0aDtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBnZW5lcmF0ZVJhbmRvbVBvbHlnb24oKTtcbiAgICAgICAgICAgIGNvbnN0IHBvbHlnb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwb2x5Z29uLWl0ZW0nKTtcbiAgICAgICAgICAgIHBvbHlnb24uZGF0YSA9IGRhdGE7XG5cbiAgICAgICAgICAgIHBvbHlnb24ucG9zaXRpb24gPSB7IHg6IG5leHRYLCB5OiBuZXh0WSB9O1xuICAgICAgICAgICAgdGhpcy5fYnVmZmVyLmFwcGVuZENoaWxkKHBvbHlnb24pO1xuXG4gICAgICAgICAgICBuZXh0WCArPSB0aGlzLl9wb2x5U2l6ZTtcbiAgICAgICAgICAgIGlmIChuZXh0WCArIHRoaXMuX3BvbHlTaXplID4gbWF4V2lkdGgpIHtcbiAgICAgICAgICAgICAgICBuZXh0WCA9IDA7XG4gICAgICAgICAgICAgICAgbmV4dFkgKz0gdGhpcy5fcG9seVNpemU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9idWZmZXIuc3R5bGUubWluSGVpZ2h0ID0gYCR7bmV4dFkgKyB0aGlzLl9wb2x5U2l6ZX1weGA7XG4gICAgfVxuXG4gICAgX29uRHJhZ092ZXIoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbW92ZSc7XG4gICAgfVxuXG4gICAgX29uRHJvcChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBcbiAgICAgICAgbGV0IHBvbHlnb24gPSB3aW5kb3cuX2RyYWdnZWRJdGVtO1xuICAgICAgICBpZiAoIXBvbHlnb24pIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGUuZGF0YVRyYW5zZmVyLmdldERhdGEoJ2FwcGxpY2F0aW9uL2pzb24nKSk7XG4gICAgICAgICAgICBwb2x5Z29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncG9seWdvbi1pdGVtJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHBvbHlnb24uZGF0YSA9IGRhdGE7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgY29uc3QgcmVjdCA9IHRoaXMuX2J1ZmZlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgeCA9IGUuY2xpZW50WCAtIHJlY3QubGVmdCAtIHRoaXMuX3BvbHlTaXplIC8gMjtcbiAgICAgICAgY29uc3QgeSA9IGUuY2xpZW50WSAtIHJlY3QudG9wICAtIHRoaXMuX3BvbHlTaXplIC8gMjtcbiAgICAgICAgcG9seWdvbi5wb3NpdGlvbiA9IHsgeCwgeSB9O1xuXG4gICAgICAgIHRoaXMuX2J1ZmZlci5hcHBlbmRDaGlsZChwb2x5Z29uKTtcbiAgICBcbiAgICAgICAgd2luZG93Ll9kcmFnZ2VkSXRlbSA9IG51bGw7XG4gICAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2J1ZmZlci16b25lJywgQnVmZmVyWm9uZSk7XG4iLCJjbGFzcyBQb2x5Z29uIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdvcGVuJyB9KTtcblxuICAgICAgICB0aGlzLl9kYXRhID0gW107XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uID0geyB4OiAwLCB5OiAwIH07XG4gICAgICAgIHRoaXMuX3pvb20gPSAxO1xuICAgICAgICB0aGlzLl9vbkRyYWdTdGFydCA9IHRoaXMuX29uRHJhZ1N0YXJ0LmJpbmQodGhpcyk7XG4gICAgfVxuICBcbiAgICBzZXQgZGF0YShwb2ludHMpIHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHBvaW50cykpIHJldHVybjtcblxuICAgICAgICB0aGlzLl9kYXRhID0gcG9pbnRzO1xuICAgICAgICB0aGlzLl9yZW5kZXIoKTtcbiAgICAgICAgdGhpcy5fYXBwbHlUcmFuc2Zvcm0oKTtcbiAgICB9XG4gICAgZ2V0IGRhdGEoKSB7IHJldHVybiB0aGlzLl9kYXRhOyB9XG4gIFxuICAgIHNldCBwb3NpdGlvbih7IHgsIHkgfSkge1xuICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IHsgeCwgeSB9O1xuICAgICAgICB0aGlzLl9hcHBseVRyYW5zZm9ybSgpO1xuICAgIH1cbiAgICBnZXQgcG9zaXRpb24oKSB7IHJldHVybiB0aGlzLl9wb3NpdGlvbjsgfVxuICBcbiAgICBzZXQgem9vbSh6KSB7XG4gICAgICAgIHRoaXMuX3pvb20gPSB6O1xuICAgICAgICB0aGlzLl9hcHBseVRyYW5zZm9ybSgpO1xuICAgIH1cbiAgICBnZXQgem9vbSgpIHsgcmV0dXJuIHRoaXMuX3pvb207IH1cbiAgXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHRoaXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICB0aGlzLnN0eWxlLnRvcCA9ICcwJztcbiAgICAgICAgdGhpcy5zdHlsZS5sZWZ0ID0gJzAnO1xuXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCAndHJ1ZScpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIHRoaXMuX29uRHJhZ1N0YXJ0KTtcbiAgICB9XG4gICAgXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgdGhpcy5fb25EcmFnU3RhcnQpO1xuICAgIH1cbiAgXG4gICAgX29uRHJhZ1N0YXJ0KGUpIHtcbiAgICAgICAgd2luZG93Ll9kcmFnZ2VkSXRlbSA9IHRoaXM7XG5cbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSgnYXBwbGljYXRpb24vanNvbicsIEpTT04uc3RyaW5naWZ5KHRoaXMuX2RhdGEpKTtcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9ICdtb3ZlJztcbiAgICB9XG4gIFxuICAgIF9hcHBseVRyYW5zZm9ybSgpIHtcbiAgICAgICAgY29uc3QgeyB4LCB5IH0gPSB0aGlzLl9wb3NpdGlvbjtcbiAgICAgICAgY29uc3QgcyA9IHRoaXMuX3pvb207XG4gICAgICAgIHRoaXMuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3h9cHgsICR7eX1weCkgc2NhbGUoJHtzfSlgO1xuICAgIH1cbiAgXG4gICAgX3JlbmRlcigpIHtcbiAgICAgICAgY29uc3QgcG9pbnRzID0gdGhpcy5fZGF0YS5tYXAocD0+YCR7cC54fSwke3AueX1gKS5qb2luKCcgJyk7XG5cbiAgICAgICAgdGhpcy5zaGFkb3dSb290LmlubmVySFRNTCA9IGBcbiAgICAgICAgICAgIDxzdHlsZT5cbiAgICAgICAgICAgICAgICBzdmcge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMTIwcHg7IGhlaWdodDogMTIwcHg7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwb2x5Z29uIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsbDogcmdiYSgxMDAsMTUwLDI0MCwwLjUpO1xuICAgICAgICAgICAgICAgICAgICBzdHJva2U6ICMzMzY2Y2M7XG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZS13aWR0aDogMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L3N0eWxlPlxuICAgICAgICAgICAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAxMjAgMTIwXCI+XG4gICAgICAgICAgICAgICAgPHBvbHlnb24gcG9pbnRzPVwiJHtwb2ludHN9XCIgLz5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICBgO1xuICAgIH1cbn1cbiAgXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ3BvbHlnb24taXRlbScsIFBvbHlnb24pO1xuICAiLCJpbXBvcnQgJy4vcG9seWdvbi5qcyc7XG5cbmltcG9ydCBzdHlsZXMgZnJvbSAnLi4vc3R5bGVzL3dvcmtab25lLmNzcyc7XG5cbmNsYXNzIFdvcmtab25lIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdvcGVuJyB9KTtcblxuICAgICAgICB0aGlzLl9wYW5YID0gMDtcbiAgICAgICAgdGhpcy5fcGFuWSA9IDA7XG4gICAgICAgIHRoaXMuX3NjYWxlID0gMTtcbiAgICAgICAgdGhpcy5fZ3JpZFNpemUgPSA1MDtcblxuICAgICAgICB0aGlzLl9pc1Bhbm5pbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fc3RhcnRYID0gMDtcbiAgICAgICAgdGhpcy5fc3RhcnRZID0gMDtcblxuICAgICAgICB0aGlzLl9vbldoZWVsID0gdGhpcy5fb25XaGVlbC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9vbk1vdXNlRG93biA9IHRoaXMuX29uTW91c2VEb3duLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX29uTW91c2VNb3ZlID0gdGhpcy5fb25Nb3VzZU1vdmUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fb25Nb3VzZVVwID0gdGhpcy5fb25Nb3VzZVVwLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX29uRHJhZ092ZXIgPSB0aGlzLl9vbkRyYWdPdmVyLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX29uRHJvcCA9IHRoaXMuX29uRHJvcC5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QuaW5uZXJIVE1MID0gYFxuICAgICAgICAgICAgPHN0eWxlPiAke3N0eWxlc308L3N0eWxlPlxuICAgICAgICAgICAgPGRpdiBpZD1cImNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9XCJ2aWV3cG9ydFwiPjxkaXYgY2xhc3M9XCJwb2x5Z29uc1wiPjwvZGl2PjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsYWJlbHNcIiBpZD1cImxhYmVsc1wiPjwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIGA7XG5cbiAgICAgICAgdGhpcy5fY29udGFpbmVyID0gdGhpcy5zaGFkb3dSb290LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKTtcbiAgICAgICAgdGhpcy5fdmlld3BvcnQgPSB0aGlzLnNoYWRvd1Jvb3QuZ2V0RWxlbWVudEJ5SWQoJ3ZpZXdwb3J0Jyk7XG4gICAgICAgIHRoaXMuX2xhYmVscyA9IHRoaXMuc2hhZG93Um9vdC5nZXRFbGVtZW50QnlJZCgnbGFiZWxzJyk7XG4gICAgICAgIHRoaXMuX3BvbHlnb25zQyA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcucG9seWdvbnMnKTtcbiAgICAgICAgdGhpcy5fcGF0dGVybkNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLl9wYXR0ZXJuQ3R4ID0gdGhpcy5fcGF0dGVybkNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bik7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIHRoaXMuX29uV2hlZWwsIHsgcGFzc2l2ZTogZmFsc2UgfSk7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuX29uRHJhZ092ZXIpO1xuICAgICAgICB0aGlzLl9jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuX29uRHJvcCk7XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9vbk1vdXNlVXApO1xuXG4gICAgICAgIHRoaXMuX3VwZGF0ZUdyaWQoKTtcbiAgICB9XG5cbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duKTtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3doZWVsJywgdGhpcy5fb25XaGVlbCk7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuX29uRHJhZ092ZXIpO1xuICAgICAgICB0aGlzLl9jb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuX29uRHJvcCk7XG5cbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9vbk1vdXNlVXApO1xuICAgIH1cblxuICAgIF91cGRhdGVHcmlkKCkge1xuICAgICAgICB0aGlzLl9wYW5YID0gTWF0aC5taW4odGhpcy5fcGFuWCwgMCk7XG4gICAgICAgIHRoaXMuX3BhblkgPSBNYXRoLm1pbih0aGlzLl9wYW5ZLCAwKTtcbiAgICBcbiAgICAgICAgdGhpcy5fdmlld3BvcnQuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3RoaXMuX3Bhblh9cHgsICR7LXRoaXMuX3Bhbll9cHgpYDtcbiAgICBcbiAgICAgICAgdGhpcy5fdXBkYXRlQmFja2dyb3VuZFBhdHRlcm4oKTtcbiAgICBcbiAgICAgICAgY29uc3QgY3cgPSB0aGlzLl9jb250YWluZXIuY2xpZW50V2lkdGg7XG4gICAgICAgIGNvbnN0IGNoID0gdGhpcy5fY29udGFpbmVyLmNsaWVudEhlaWdodDtcbiAgICAgICAgY29uc3QgbmV3VyA9IGN3IC0gdGhpcy5fcGFuWDtcbiAgICAgICAgY29uc3QgbmV3SCA9IGNoIC0gdGhpcy5fcGFuWTtcbiAgICAgICAgdGhpcy5fdmlld3BvcnQuc3R5bGUud2lkdGggPSBgJHtuZXdXfXB4YDtcbiAgICAgICAgdGhpcy5fdmlld3BvcnQuc3R5bGUuaGVpZ2h0ID0gYCR7bmV3SH1weGA7XG4gICAgXG4gICAgICAgIHRoaXMuX3JlbmRlckxhYmVscygpO1xuICAgIH1cblxuICAgIF9yZW5kZXJMYWJlbHMoKSB7XG4gICAgICAgIGNvbnN0IGN3ID0gdGhpcy5fY29udGFpbmVyLmNsaWVudFdpZHRoO1xuICAgICAgICBjb25zdCBjaCA9IHRoaXMuX2NvbnRhaW5lci5jbGllbnRIZWlnaHQ7XG5cbiAgICAgICAgY29uc3Qgc2NhbGUgPSB0aGlzLl9zY2FsZTtcbiAgICAgICAgY29uc3QgZ3JpZFNpemUgPSB0aGlzLl9ncmlkU2l6ZTtcbiAgICAgICAgY29uc3Qgc2l6ZSA9IGdyaWRTaXplICogc2NhbGU7XG4gICAgXG4gICAgICAgIHRoaXMuX2xhYmVscy5pbm5lckhUTUwgPSAnJztcbiAgICBcbiAgICAgICAgY29uc3Qgb3JpZ2luWCA9IHRoaXMuX3Bhblg7XG4gICAgICAgIGNvbnN0IG5NaW4gPSBNYXRoLmNlaWwoLW9yaWdpblggLyBzaXplKTtcbiAgICAgICAgY29uc3Qgbk1heCA9IE1hdGguZmxvb3IoKGN3IC0gb3JpZ2luWCkgLyBzaXplKTtcbiAgICAgICAgXG4gICAgICAgIGZvciAobGV0IG4gPSBuTWluOyBuIDw9IG5NYXg7IG4rKykge1xuICAgICAgICAgICAgY29uc3Qgc2NyZWVuWCA9IG9yaWdpblggKyBuICogc2l6ZTtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gbiAqIGdyaWRTaXplO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgPCAwKSBjb250aW51ZTtcblxuICAgICAgICAgICAgY29uc3QgbGFiZWxDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGxhYmVsQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdsYWJlbFgnO1xuICAgICAgICAgICAgbGFiZWxDb250YWluZXIudGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgICAgICAgICAgIGxhYmVsQ29udGFpbmVyLnN0eWxlLmxlZnQgPSBgJHtzY3JlZW5YfXB4YDtcbiAgICAgICAgICAgIGxhYmVsQ29udGFpbmVyLnN0eWxlLnRvcCA9IGAke2NoIC0gMTV9cHhgO1xuICAgICAgICAgICAgdGhpcy5fbGFiZWxzLmFwcGVuZENoaWxkKGxhYmVsQ29udGFpbmVyKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBjb25zdCBvcmlnaW5ZID0gY2ggLSB0aGlzLl9wYW5ZO1xuICAgICAgICBjb25zdCBtTWluID0gTWF0aC5jZWlsKChjaCAtIG9yaWdpblkpIC8gc2l6ZSk7XG4gICAgICAgIGNvbnN0IG1NYXggPSBNYXRoLmZsb29yKG9yaWdpblkgLyBzaXplKTtcbiAgICBcbiAgICAgICAgZm9yIChsZXQgbSA9IG1NaW47IG0gPD0gbU1heDsgbSsrKSB7XG4gICAgICAgICAgICBjb25zdCBzY3JlZW5ZID0gb3JpZ2luWSAtIG0gKiBzaXplO1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBtICogZ3JpZFNpemU7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA8IDApIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBjb25zdCBsYWJlbENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgbGFiZWxDb250YWluZXIuY2xhc3NOYW1lID0gJ2xhYmVsWSc7XG4gICAgICAgICAgICBsYWJlbENvbnRhaW5lci50ZXh0Q29udGVudCA9IHZhbHVlO1xuICAgICAgICAgICAgbGFiZWxDb250YWluZXIuc3R5bGUubGVmdCA9IGAwcHhgO1xuICAgICAgICAgICAgbGFiZWxDb250YWluZXIuc3R5bGUudG9wICA9IGAke3NjcmVlbll9cHhgO1xuICAgICAgICAgICAgdGhpcy5fbGFiZWxzLmFwcGVuZENoaWxkKGxhYmVsQ29udGFpbmVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgXG4gICAgX3VwZGF0ZUJhY2tncm91bmRQYXR0ZXJuKCkge1xuICAgICAgICBjb25zdCBzaXplID0gdGhpcy5fZ3JpZFNpemUgKiB0aGlzLl9zY2FsZTtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fcGF0dGVybkN0eDtcblxuICAgICAgICB0aGlzLl9wYXR0ZXJuQ2FudmFzLndpZHRoICA9IHNpemU7XG4gICAgICAgIHRoaXMuX3BhdHRlcm5DYW52YXMuaGVpZ2h0ID0gc2l6ZTtcblxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsMCxzaXplLHNpemUpO1xuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnIzAwMCc7XG4gICAgICAgIGN0eC5saW5lV2lkdGggPSAxO1xuXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4Lm1vdmVUbygwLCAwKTtcbiAgICAgICAgY3R4LmxpbmVUbygwLCBzaXplKTtcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4Lm1vdmVUbygwLCBzaXplLTAuNSk7XG4gICAgICAgIGN0eC5saW5lVG8oc2l6ZSwgc2l6ZS0wLjUpO1xuICAgICAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICAgICAgY29uc3QgZGF0YVVSTCA9IHRoaXMuX3BhdHRlcm5DYW52YXMudG9EYXRhVVJMKCk7XG5cbiAgICAgICAgY29uc3Qgb3ggPSB0aGlzLl9wYW5YICUgc2l6ZTtcbiAgICAgICAgY29uc3Qgb3kgPSAoLXRoaXMuX3BhblkpICUgc2l6ZTtcblxuICAgICAgICB0aGlzLl9jb250YWluZXIuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gYHVybCgke2RhdGFVUkx9KWA7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS5iYWNrZ3JvdW5kUmVwZWF0ID0gJ3JlcGVhdCc7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9IGAke3NpemV9cHggJHtzaXplfXB4YDtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyLnN0eWxlLmJhY2tncm91bmRQb3NpdGlvbiA9IGAke294fXB4ICR7b3l9cHhgO1xuICAgIH1cblxuICAgIF9vbk1vdXNlRG93bihlKSB7XG4gICAgICAgIGlmIChlLnRhcmdldC5jbG9zZXN0KCdwb2x5Z29uLWl0ZW0nKSkgcmV0dXJuO1xuICAgICAgICBpZiAoZS5idXR0b24gIT09IDApIHJldHVybjtcblxuICAgICAgICB0aGlzLl9pc1Bhbm5pbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLl9zdGFydFggPSBlLmNsaWVudFggLSB0aGlzLl9wYW5YO1xuICAgICAgICB0aGlzLl9zdGFydFkgPSBlLmNsaWVudFkgKyB0aGlzLl9wYW5ZO1xuXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS5jdXJzb3IgPSAnZ3JhYmJpbmcnO1xuICAgIH1cblxuICAgIF9vbk1vdXNlTW92ZShlKSB7XG4gICAgICAgIGlmICghdGhpcy5faXNQYW5uaW5nKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5fcGFuWCA9IGUuY2xpZW50WCAtIHRoaXMuX3N0YXJ0WDtcbiAgICAgICAgdGhpcy5fcGFuWSA9IHRoaXMuX3N0YXJ0WSAtIGUuY2xpZW50WTtcbiAgICAgICAgdGhpcy5fdXBkYXRlR3JpZCgpO1xuICAgIH1cblxuICAgIF9vbk1vdXNlVXAoKSB7XG4gICAgICAgIHRoaXMuX2lzUGFubmluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9jb250YWluZXIuc3R5bGUuY3Vyc29yID0gJ2dyYWInO1xuICAgIH1cblxuICAgIF9vbldoZWVsKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGNvbnN0IGRlbHRhID0gZS5kZWx0YVkgPCAwID8gMS4xIDogMC45O1xuICAgICAgICB0aGlzLl9zY2FsZSAqPSBkZWx0YTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuX3BvbHlnb25zQy5xdWVyeVNlbGVjdG9yQWxsKCdwb2x5Z29uLWl0ZW0nKVxuICAgICAgICAgICAgLmZvckVhY2gocG9seWdvbiA9PiBwb2x5Z29uLnpvb20gPSB0aGlzLl9zY2FsZSlcbiAgICAgICAgO1xuXG4gICAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLl92aWV3cG9ydC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgbXggPSBlLmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgIGNvbnN0IG15ID0gZS5jbGllbnRZIC0gcmVjdC50b3A7XG5cbiAgICAgICAgdGhpcy5fcGFuWCAtPSBteCAqIChkZWx0YSAtIDEpO1xuICAgICAgICB0aGlzLl9wYW5ZICs9IG15ICogKGRlbHRhIC0gMSk7XG5cbiAgICAgICAgdGhpcy5fdXBkYXRlR3JpZCgpO1xuICAgIH1cblxuICAgIF9vbkRyYWdPdmVyKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ21vdmUnO1xuICAgIH1cblxuICAgIF9vbkRyb3AoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgXG4gICAgICAgIGxldCBwb2x5Z29uID0gd2luZG93Ll9kcmFnZ2VkSXRlbTtcbiAgICAgICAgaWYgKCFwb2x5Z29uKSB7XG4gICAgICAgICAgICBjb25zdCBkID0gSlNPTi5wYXJzZShlLmRhdGFUcmFuc2Zlci5nZXREYXRhKCdhcHBsaWNhdGlvbi9qc29uJykpO1xuICAgICAgICAgICAgcG9seWdvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3BvbHlnb24taXRlbScpO1xuICAgICAgICAgICAgcG9seWdvbi5kYXRhID0gZDtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBjb25zdCByZWN0ID0gdGhpcy5fdmlld3BvcnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lckhlaWdodCA9IHRoaXMuX2NvbnRhaW5lci5jbGllbnRIZWlnaHQ7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBseCA9IGUuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgY29uc3QgbHkgPSBlLmNsaWVudFkgLSByZWN0LnRvcDtcbiAgICBcbiAgICAgICAgY29uc3QgZ3ggPSAobHggLSB0aGlzLl9wYW5YKSAvIHRoaXMuX3NjYWxlO1xuICAgICAgICBjb25zdCBneSA9ICgoY29udGFpbmVySGVpZ2h0IC0gbHkpIC0gdGhpcy5fcGFuWSkgLyB0aGlzLl9zY2FsZTtcbiAgICBcbiAgICAgICAgY29uc3QgcHggPSBneCAqIHRoaXMuX3NjYWxlICsgdGhpcy5fcGFuWDtcbiAgICAgICAgY29uc3QgcHkgPSAoY29udGFpbmVySGVpZ2h0IC0gZ3kgKiB0aGlzLl9zY2FsZSkgLSB0aGlzLl9wYW5ZO1xuICAgIFxuICAgICAgICBwb2x5Z29uLnBvc2l0aW9uID0geyB4OiBweCwgeTogcHkgfTtcbiAgICAgICAgcG9seWdvbi56b29tID0gdGhpcy5fc2NhbGU7XG5cbiAgICAgICAgdGhpcy5fcG9seWdvbnNDLmFwcGVuZENoaWxkKHBvbHlnb24pO1xuXG4gICAgICAgIHdpbmRvdy5fZHJhZ2dlZEl0ZW0gPSBudWxsO1xuICAgIH1cblxuICAgIGdldENhbWVyYSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBhblg6IHRoaXMuX3BhblgsXG4gICAgICAgICAgICBwYW5ZOiB0aGlzLl9wYW5ZLFxuICAgICAgICAgICAgc2NhbGU6IHRoaXMuX3NjYWxlLFxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuX3ZpZXdwb3J0LmNsaWVudFdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLl92aWV3cG9ydC5jbGllbnRIZWlnaHRcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzZXRDYW1lcmEoeyBwYW5YLCBwYW5ZLCBzY2FsZSwgd2lkdGgsIGhlaWdodCB9KSB7XG4gICAgICAgIHRoaXMuX3BhblggPSBwYW5YO1xuICAgICAgICB0aGlzLl9wYW5ZID0gcGFuWTtcbiAgICAgICAgdGhpcy5fc2NhbGUgPSBzY2FsZTtcbiAgICAgICAgdGhpcy5fdmlld3BvcnQuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XG4gICAgICAgIHRoaXMuX3ZpZXdwb3J0LnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG5cbiAgICAgICAgdGhpcy5fcG9seWdvbnNDLnF1ZXJ5U2VsZWN0b3JBbGwoJ3BvbHlnb24taXRlbScpXG4gICAgICAgICAgICAuZm9yRWFjaChwb2x5Z29uID0+IHBvbHlnb24uem9vbSA9IHNjYWxlKVxuICAgICAgICA7XG5cbiAgICAgICAgdGhpcy5fdXBkYXRlR3JpZCgpO1xuICAgIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCd3b3JrLXpvbmUnLCBXb3JrWm9uZSk7XG4iLCJleHBvcnQgZGVmYXVsdCBcIioge1xcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbn1cXG5cXG4uYXBwIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDB2aDtcXG4gICAgcGFkZGluZzogMjBweDtcXG5cXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxufVxcblxcbi5jb250cm9scyB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogNjBweDtcXG5cXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxufVxcblxcbi5jb250cm9scz5idXR0b24ge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuXFxuICAgIG1hcmdpbjogMCA4cHg7XFxuXFxuICAgIGhlaWdodDogNDBweDtcXG4gICAgd2lkdGg6IDEyMHB4O1xcblxcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcblxcbi56b25lcyB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG5cXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGZsZXg6IDE7XFxuXFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbn1cXG5cXG4uem9uZXM+KiB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG5cXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGZsZXg6IDE7XFxuXFxuICAgIG1hcmdpbjogOHB4IDA7XFxuXFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIGJsYWNrO1xcblxcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjExLCAyMTEsIDIxMSk7XFxufVxcblwiOyIsImV4cG9ydCBkZWZhdWx0IFwiOmhvc3QgeyBkaXNwbGF5OiBibG9jazsgfVxcblxcbiNjb250YWluZXIge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDQwMHB4O1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICBjdXJzb3I6IGdyYWI7XFxufVxcblxcbiN2aWV3cG9ydCB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICB0cmFuc2Zvcm0tb3JpZ2luOiAwIDA7XFxufVxcblxcbi5sYWJlbHMge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMDsgbGVmdDogMDtcXG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxuICAgIGZvbnQtc2l6ZTogMTJweDtcXG4gICAgY29sb3I6ICMzMzM7XFxuICAgIHVzZXItc2VsZWN0OiBub25lO1xcbn1cXG5cXG4ubGFiZWxYLCAubGFiZWxZIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbn1cXG5cXG4ucG9seWdvbnMge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMDtcXG4gICAgbGVmdDogMDtcXG59XFxuXCI7IiwiZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlUmFuZG9tUG9seWdvbigpIHtcbiAgICBjb25zdCB2ZXJ0ZXggPSAzICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNSk7XG4gICAgY29uc3QgYW5nbGVTdGVwID0gKDIgKiBNYXRoLlBJKSAvIHZlcnRleDtcbiAgICBjb25zdCByYWRpdXMgPSAzMCAqICgwLjggKyBNYXRoLnJhbmRvbSgpICogMC40KTtcbiAgICBjb25zdCBjZW50ZXIgPSB7IHg6IDUwLCB5OiA1MCB9O1xuXG4gICAgY29uc3QgcG9pbnRzID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRleDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGFuZ2xlID0gaSAqIGFuZ2xlU3RlcCArIChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIGFuZ2xlU3RlcCAqIDAuMztcbiAgICAgICAgY29uc3QgciA9IHJhZGl1cyAqICgwLjkgKyBNYXRoLnJhbmRvbSgpICogMC4yKTtcbiAgICAgICAgXG4gICAgICAgIHBvaW50cy5wdXNoKHtcbiAgICAgICAgICAgIHg6IE1hdGguZmxvb3IoY2VudGVyLnggKyByICogTWF0aC5jb3MoYW5nbGUpKSxcbiAgICAgICAgICAgIHk6IE1hdGguZmxvb3IoY2VudGVyLnkgKyByICogTWF0aC5zaW4oYW5nbGUpKSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvaW50cztcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBzYXZlUG9seWdvbnMoc3RhdGUpIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc3RhdGUnLCBKU09OLnN0cmluZ2lmeShzdGF0ZSkpO1xufVxuICBcbmV4cG9ydCBmdW5jdGlvbiBsb2FkUG9seWdvbnMoKSB7XG4gICAgY29uc3Qgc3RhdGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc3RhdGUnKTtcbiAgICByZXR1cm4gc3RhdGUgPyBKU09OLnBhcnNlKHN0YXRlKSA6IG51bGw7XG59XG4gIFxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyUG9seWdvbnMoKSB7XG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3N0YXRlJyk7XG59XG4gICIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgJy4vY29tcG9uZW50cy9hcHAuanMnO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9