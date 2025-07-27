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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("* {\r\n    box-sizing: border-box;\r\n}\r\n\r\n.app {\r\n    position: relative;\r\n    width: 100%;\r\n    height: 100vh;\r\n    padding: 20px;\r\n\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n    flex-direction: column;\r\n}\r\n\r\n.controls {\r\n    position: relative;\r\n    width: 100%;\r\n    height: 60px;\r\n\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n}\r\n\r\n.controls>button {\r\n    position: relative;\r\n\r\n    margin: 0 8px;\r\n\r\n    height: 40px;\r\n    width: 120px;\r\n\r\n    cursor: pointer;\r\n}\r\n\r\n.zones {\r\n    position: relative;\r\n\r\n    width: 100%;\r\n    flex: 1;\r\n\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n    flex-direction: column;\r\n}\r\n\r\n.zones>* {\r\n    position: relative;\r\n\r\n    width: 100%;\r\n    flex: 1;\r\n\r\n    margin: 8px 0;\r\n\r\n    border: 1px solid black;\r\n\r\n    background-color: rgb(211, 211, 211);\r\n}\r\n");

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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (":host { display: block; }\r\n\r\n#container {\r\n    position: relative;\r\n    width: 100%;\r\n    height: 400px;\r\n    overflow: hidden;\r\n    cursor: grab;\r\n}\r\n\r\n#viewport {\r\n    position: absolute;\r\n    top: 0;\r\n    left: 0;\r\n    transform-origin: 0 0;\r\n}\r\n\r\n.labels {\r\n    position: absolute;\r\n    top: 0; left: 0;\r\n    pointer-events: none;\r\n    font-size: 12px;\r\n    color: #333;\r\n    user-select: none;\r\n}\r\n\r\n.labelX, .labelY {\r\n    position: absolute;\r\n}\r\n\r\n.polygons {\r\n    position: absolute;\r\n    top: 0;\r\n    left: 0;\r\n}\r\n");

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEEsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdELEU7Ozs7Ozs7Ozs7Ozs7QUNONkIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWJjb21wLXRlc3QvLi9zcmMvY29tcG9uZW50cy9hcHAuanMiLCJ3ZWJwYWNrOi8vd2ViY29tcC10ZXN0Ly4vc3JjL2NvbXBvbmVudHMvYnVmZmVyWm9uZS5qcyIsIndlYnBhY2s6Ly93ZWJjb21wLXRlc3QvLi9zcmMvY29tcG9uZW50cy9wb2x5Z29uLmpzIiwid2VicGFjazovL3dlYmNvbXAtdGVzdC8uL3NyYy9jb21wb25lbnRzL3dvcmtab25lLmpzIiwid2VicGFjazovL3dlYmNvbXAtdGVzdC8uL3NyYy9zdHlsZXMvYXBwLmNzcyIsIndlYnBhY2s6Ly93ZWJjb21wLXRlc3QvLi9zcmMvc3R5bGVzL3dvcmtab25lLmNzcyIsIndlYnBhY2s6Ly93ZWJjb21wLXRlc3QvLi9zcmMvdXRpbHMvcmFuZG9tLmpzIiwid2VicGFjazovL3dlYmNvbXAtdGVzdC8uL3NyYy91dGlscy9zdG9yYWdlLmpzIiwid2VicGFjazovL3dlYmNvbXAtdGVzdC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWJjb21wLXRlc3Qvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vd2ViY29tcC10ZXN0L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly93ZWJjb21wLXRlc3Qvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly93ZWJjb21wLXRlc3Qvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly93ZWJjb21wLXRlc3QvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuL2J1ZmZlclpvbmUuanMnO1xyXG5pbXBvcnQgJy4vd29ya1pvbmUuanMnO1xyXG5pbXBvcnQgeyBzYXZlUG9seWdvbnMsIGxvYWRQb2x5Z29ucywgY2xlYXJQb2x5Z29ucyB9IGZyb20gJy4uL3V0aWxzL3N0b3JhZ2UuanMnO1xyXG5cclxuaW1wb3J0IGFwcFN0eWxlIGZyb20gJy4uL3N0eWxlcy9hcHAuY3NzJztcclxuXHJcbmNsYXNzIEFwcCBleHRlbmRzIEhUTUxFbGVtZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5hdHRhY2hTaGFkb3coeyBtb2RlOiAnb3BlbicgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgPHN0eWxlPiR7YXBwU3R5bGV9PC9zdHlsZT5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFwcFwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRyb2xzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cImNyZWF0ZS1idG5cIj7QodC+0LfQtNCw0YLRjDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJzYXZlLWJ0blwiPtCh0L7RhdGA0LDQvdC40YLRjDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJyZXNldC1idG5cIj7QodCx0YDQvtGB0LjRgtGMPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ6b25lc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxidWZmZXItem9uZT48L2J1ZmZlci16b25lPlxyXG4gICAgICAgICAgICAgICAgICAgIDx3b3JrLXpvbmU+PC93b3JrLXpvbmU+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LmdldEVsZW1lbnRCeUlkKCdjcmVhdGUtYnRuJylcclxuICAgICAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5vbkNyZWF0ZSgpKVxyXG4gICAgICAgIDtcclxuXHJcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LmdldEVsZW1lbnRCeUlkKCdzYXZlLWJ0bicpXHJcbiAgICAgICAgICAgIC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMub25TYXZlKCkpXHJcbiAgICAgICAgO1xyXG5cclxuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0LWJ0bicpXHJcbiAgICAgICAgICAgIC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMub25SZXNldCgpKVxyXG4gICAgICAgIDtcclxuXHJcbiAgICAgICAgY29uc3Qgc3RvcmVkID0gbG9hZFBvbHlnb25zKCk7XHJcblxyXG4gICAgICAgIGlmIChzdG9yZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5yZXN0b3JlWm9uZXMoc3RvcmVkKTtcclxuICAgICAgICB9XHJcbiAgfVxyXG5cclxuICAgIG9uQ3JlYXRlKCkge1xyXG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdidWZmZXItem9uZScpLmNyZWF0ZVJhbmRvbSgpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uU2F2ZSgpIHtcclxuICAgICAgICBjb25zdCBidWZmZXJQb2x5Z29ucyA9IEFycmF5LmZyb20oXHJcbiAgICAgICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdidWZmZXItem9uZScpLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvckFsbCgncG9seWdvbi1pdGVtJylcclxuICAgICAgICApLm1hcChwb2x5Z29uID0+ICh7XHJcbiAgICAgICAgICAgIGRhdGE6IHBvbHlnb24uZGF0YSxcclxuICAgICAgICAgICAgeDogcG9seWdvbi5wb3NpdGlvbi54LFxyXG4gICAgICAgICAgICB5OiBwb2x5Z29uLnBvc2l0aW9uLnksXHJcbiAgICAgICAgICAgIHpvb206IHBvbHlnb24uem9vbVxyXG4gICAgICAgIH0pKTtcclxuICAgICAgXHJcbiAgICAgICAgY29uc3Qgd29ya1pvbmUgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3Rvcignd29yay16b25lJyk7XHJcbiAgICAgICAgY29uc3Qgd29ya0NhbWVyYSA9IHdvcmtab25lLmdldENhbWVyYSgpO1xyXG5cclxuICAgICAgICBjb25zdCB3b3JrSXRlbXMgID0gQXJyYXkuZnJvbShcclxuICAgICAgICAgICAgd29ya1pvbmUuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yQWxsKCdwb2x5Z29uLWl0ZW0nKVxyXG4gICAgICAgICkubWFwKHBvbHlnb24gPT4gKHtcclxuICAgICAgICAgICAgZGF0YTogcG9seWdvbi5kYXRhLFxyXG4gICAgICAgICAgICB4OiBwb2x5Z29uLnBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgIHk6IHBvbHlnb24ucG9zaXRpb24ueSxcclxuICAgICAgICAgICAgem9vbTogcG9seWdvbi56b29tXHJcbiAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICBzYXZlUG9seWdvbnMoe1xyXG4gICAgICAgICAgICBidWZmZXI6IGJ1ZmZlclBvbHlnb25zLFxyXG4gICAgICAgICAgICB3b3JrOiB7XHJcbiAgICAgICAgICAgICAgICBjYW1lcmE6IHdvcmtDYW1lcmEsXHJcbiAgICAgICAgICAgICAgICBpdGVtczogIHdvcmtJdGVtc1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAgIFxyXG4gICAgcmVzdG9yZVpvbmVzKHNhdmVkKSB7XHJcbiAgICAgICAgY29uc3QgeyBidWZmZXIsIHdvcmsgfSA9IHNhdmVkO1xyXG4gICAgICBcclxuICAgICAgICBjb25zdCBidWZlckNvbnRhaW5lciA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdidWZmZXItem9uZScpLnNoYWRvd1Jvb3QuZ2V0RWxlbWVudEJ5SWQoJ2J1ZmZlcicpO1xyXG4gICAgICAgIGJ1ZmVyQ29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xyXG5cclxuICAgICAgICBidWZmZXIuZm9yRWFjaCgoeyBkYXRhLCB4LCB5LCB6b29tIH0pID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcG9seWdvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3BvbHlnb24taXRlbScpO1xyXG5cclxuICAgICAgICAgICAgcG9seWdvbi5kYXRhID0gZGF0YTtcclxuICAgICAgICAgICAgcG9seWdvbi5wb3NpdGlvbiA9IHsgeCwgeSB9O1xyXG4gICAgICAgICAgICBwb2x5Z29uLnpvb20gPSB6b29tO1xyXG4gICAgICAgICAgICBidWZlckNvbnRhaW5lci5hcHBlbmRDaGlsZChwb2x5Z29uKTtcclxuICAgICAgICB9KTtcclxuICAgICAgXHJcbiAgICAgICAgY29uc3Qgd29ya1pvbmUgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3Rvcignd29yay16b25lJyk7XHJcbiAgICAgICAgd29ya1pvbmUuc2V0Q2FtZXJhKHdvcmsuY2FtZXJhKTtcclxuICAgICAgXHJcbiAgICAgICAgY29uc3Qgd29ya1pvbmVDb250YWluZXIgPSB3b3JrWm9uZS5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5wb2x5Z29ucycpO1xyXG4gICAgICAgIHdvcmtab25lQ29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xyXG5cclxuICAgICAgICB3b3JrLml0ZW1zLmZvckVhY2goKHsgZGF0YSwgeCwgeSwgem9vbSB9KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvbHlnb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwb2x5Z29uLWl0ZW0nKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHBvbHlnb24uZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgICAgIHBvbHlnb24ucG9zaXRpb24gPSB7IHgsIHkgfTtcclxuICAgICAgICAgICAgcG9seWdvbi56b29tID0gem9vbTtcclxuICAgICAgICAgICAgd29ya1pvbmVDb250YWluZXIuYXBwZW5kQ2hpbGQocG9seWdvbik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgb25SZXNldCgpIHtcclxuICAgICAgICBjbGVhclBvbHlnb25zKCk7XHJcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2FwcC1yb290JywgQXBwKTtcclxuIiwiaW1wb3J0IHsgZ2VuZXJhdGVSYW5kb21Qb2x5Z29uIH0gZnJvbSAnLi4vdXRpbHMvcmFuZG9tLmpzJztcclxuaW1wb3J0ICcuL3BvbHlnb24uanMnO1xyXG5cclxuY2xhc3MgQnVmZmVyWm9uZSBleHRlbmRzIEhUTUxFbGVtZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5hdHRhY2hTaGFkb3coeyBtb2RlOiAnb3BlbicgfSk7XHJcbiAgICAgICAgdGhpcy5fb25EcmFnT3ZlciA9IHRoaXMuX29uRHJhZ092ZXIuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9vbkRyb3AgPSB0aGlzLl9vbkRyb3AuYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcG9seVNpemUgPSAxMjA7XHJcbiAgICB9XHJcblxyXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgPGRpdiBpZD1cImJ1ZmZlclwiPjwvZGl2PlxyXG4gICAgICAgIGA7XHJcbiAgICAgICAgdGhpcy5fYnVmZmVyID0gdGhpcy5zaGFkb3dSb290LmdldEVsZW1lbnRCeUlkKCdidWZmZXInKTtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5fb25EcmFnT3Zlcik7XHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5fb25Ecm9wKTtcclxuICAgIH1cclxuXHJcbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5fb25EcmFnT3Zlcik7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5fb25Ecm9wKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVSYW5kb20oKSB7XHJcbiAgICAgICAgY29uc3QgY291bnQgPSA1ICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTYpO1xyXG4gICAgICAgIHRoaXMuX2J1ZmZlci5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICB3aW5kb3cuX2RyYWdnZWRJdGVtID0gbnVsbDtcclxuXHJcbiAgICAgICAgbGV0IG5leHRYID0gMDtcclxuICAgICAgICBsZXQgbmV4dFkgPSAwO1xyXG5cclxuICAgICAgICBjb25zdCBtYXhXaWR0aCA9IHRoaXMuX2J1ZmZlci5jbGllbnRXaWR0aDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBnZW5lcmF0ZVJhbmRvbVBvbHlnb24oKTtcclxuICAgICAgICAgICAgY29uc3QgcG9seWdvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3BvbHlnb24taXRlbScpO1xyXG4gICAgICAgICAgICBwb2x5Z29uLmRhdGEgPSBkYXRhO1xyXG5cclxuICAgICAgICAgICAgcG9seWdvbi5wb3NpdGlvbiA9IHsgeDogbmV4dFgsIHk6IG5leHRZIH07XHJcbiAgICAgICAgICAgIHRoaXMuX2J1ZmZlci5hcHBlbmRDaGlsZChwb2x5Z29uKTtcclxuXHJcbiAgICAgICAgICAgIG5leHRYICs9IHRoaXMuX3BvbHlTaXplO1xyXG4gICAgICAgICAgICBpZiAobmV4dFggKyB0aGlzLl9wb2x5U2l6ZSA+IG1heFdpZHRoKSB7XHJcbiAgICAgICAgICAgICAgICBuZXh0WCA9IDA7XHJcbiAgICAgICAgICAgICAgICBuZXh0WSArPSB0aGlzLl9wb2x5U2l6ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fYnVmZmVyLnN0eWxlLm1pbkhlaWdodCA9IGAke25leHRZICsgdGhpcy5fcG9seVNpemV9cHhgO1xyXG4gICAgfVxyXG5cclxuICAgIF9vbkRyYWdPdmVyKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJztcclxuICAgIH1cclxuXHJcbiAgICBfb25Ecm9wKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBcclxuICAgICAgICBsZXQgcG9seWdvbiA9IHdpbmRvdy5fZHJhZ2dlZEl0ZW07XHJcbiAgICAgICAgaWYgKCFwb2x5Z29uKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGUuZGF0YVRyYW5zZmVyLmdldERhdGEoJ2FwcGxpY2F0aW9uL2pzb24nKSk7XHJcbiAgICAgICAgICAgIHBvbHlnb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwb2x5Z29uLWl0ZW0nKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHBvbHlnb24uZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgY29uc3QgcmVjdCA9IHRoaXMuX2J1ZmZlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICBjb25zdCB4ID0gZS5jbGllbnRYIC0gcmVjdC5sZWZ0IC0gdGhpcy5fcG9seVNpemUgLyAyO1xyXG4gICAgICAgIGNvbnN0IHkgPSBlLmNsaWVudFkgLSByZWN0LnRvcCAgLSB0aGlzLl9wb2x5U2l6ZSAvIDI7XHJcbiAgICAgICAgcG9seWdvbi5wb3NpdGlvbiA9IHsgeCwgeSB9O1xyXG5cclxuICAgICAgICB0aGlzLl9idWZmZXIuYXBwZW5kQ2hpbGQocG9seWdvbik7XHJcbiAgICBcclxuICAgICAgICB3aW5kb3cuX2RyYWdnZWRJdGVtID0gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdidWZmZXItem9uZScsIEJ1ZmZlclpvbmUpO1xyXG4iLCJjbGFzcyBQb2x5Z29uIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdvcGVuJyB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fZGF0YSA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uID0geyB4OiAwLCB5OiAwIH07XHJcbiAgICAgICAgdGhpcy5fem9vbSA9IDE7XHJcbiAgICAgICAgdGhpcy5fb25EcmFnU3RhcnQgPSB0aGlzLl9vbkRyYWdTdGFydC5iaW5kKHRoaXMpO1xyXG4gICAgfVxyXG4gIFxyXG4gICAgc2V0IGRhdGEocG9pbnRzKSB7XHJcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHBvaW50cykpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fZGF0YSA9IHBvaW50cztcclxuICAgICAgICB0aGlzLl9yZW5kZXIoKTtcclxuICAgICAgICB0aGlzLl9hcHBseVRyYW5zZm9ybSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IGRhdGEoKSB7IHJldHVybiB0aGlzLl9kYXRhOyB9XHJcbiAgXHJcbiAgICBzZXQgcG9zaXRpb24oeyB4LCB5IH0pIHtcclxuICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IHsgeCwgeSB9O1xyXG4gICAgICAgIHRoaXMuX2FwcGx5VHJhbnNmb3JtKCk7XHJcbiAgICB9XHJcbiAgICBnZXQgcG9zaXRpb24oKSB7IHJldHVybiB0aGlzLl9wb3NpdGlvbjsgfVxyXG4gIFxyXG4gICAgc2V0IHpvb20oeikge1xyXG4gICAgICAgIHRoaXMuX3pvb20gPSB6O1xyXG4gICAgICAgIHRoaXMuX2FwcGx5VHJhbnNmb3JtKCk7XHJcbiAgICB9XHJcbiAgICBnZXQgem9vbSgpIHsgcmV0dXJuIHRoaXMuX3pvb207IH1cclxuICBcclxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xyXG4gICAgICAgIHRoaXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgICAgIHRoaXMuc3R5bGUudG9wID0gJzAnO1xyXG4gICAgICAgIHRoaXMuc3R5bGUubGVmdCA9ICcwJztcclxuXHJcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsICd0cnVlJyk7XHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLCB0aGlzLl9vbkRyYWdTdGFydCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgdGhpcy5fb25EcmFnU3RhcnQpO1xyXG4gICAgfVxyXG4gIFxyXG4gICAgX29uRHJhZ1N0YXJ0KGUpIHtcclxuICAgICAgICB3aW5kb3cuX2RyYWdnZWRJdGVtID0gdGhpcztcclxuXHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSgnYXBwbGljYXRpb24vanNvbicsIEpTT04uc3RyaW5naWZ5KHRoaXMuX2RhdGEpKTtcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkID0gJ21vdmUnO1xyXG4gICAgfVxyXG4gIFxyXG4gICAgX2FwcGx5VHJhbnNmb3JtKCkge1xyXG4gICAgICAgIGNvbnN0IHsgeCwgeSB9ID0gdGhpcy5fcG9zaXRpb247XHJcbiAgICAgICAgY29uc3QgcyA9IHRoaXMuX3pvb207XHJcbiAgICAgICAgdGhpcy5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7eH1weCwgJHt5fXB4KSBzY2FsZSgke3N9KWA7XHJcbiAgICB9XHJcbiAgXHJcbiAgICBfcmVuZGVyKCkge1xyXG4gICAgICAgIGNvbnN0IHBvaW50cyA9IHRoaXMuX2RhdGEubWFwKHA9PmAke3AueH0sJHtwLnl9YCkuam9pbignICcpO1xyXG5cclxuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICA8c3R5bGU+XHJcbiAgICAgICAgICAgICAgICBzdmcge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxMjBweDsgaGVpZ2h0OiAxMjBweDtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHBvbHlnb24ge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IHJnYmEoMTAwLDE1MCwyNDAsMC41KTtcclxuICAgICAgICAgICAgICAgICAgICBzdHJva2U6ICMzMzY2Y2M7XHJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlLXdpZHRoOiAyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICA8L3N0eWxlPlxyXG4gICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDEyMCAxMjBcIj5cclxuICAgICAgICAgICAgICAgIDxwb2x5Z29uIHBvaW50cz1cIiR7cG9pbnRzfVwiIC8+XHJcbiAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgIGA7XHJcbiAgICB9XHJcbn1cclxuICBcclxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdwb2x5Z29uLWl0ZW0nLCBQb2x5Z29uKTtcclxuICAiLCJpbXBvcnQgJy4vcG9seWdvbi5qcyc7XHJcblxyXG5pbXBvcnQgc3R5bGVzIGZyb20gJy4uL3N0eWxlcy93b3JrWm9uZS5jc3MnO1xyXG5cclxuY2xhc3MgV29ya1pvbmUgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9wYW5YID0gMDtcclxuICAgICAgICB0aGlzLl9wYW5ZID0gMDtcclxuICAgICAgICB0aGlzLl9zY2FsZSA9IDE7XHJcbiAgICAgICAgdGhpcy5fZ3JpZFNpemUgPSA1MDtcclxuXHJcbiAgICAgICAgdGhpcy5faXNQYW5uaW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fc3RhcnRYID0gMDtcclxuICAgICAgICB0aGlzLl9zdGFydFkgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLl9vbldoZWVsID0gdGhpcy5fb25XaGVlbC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX29uTW91c2VEb3duID0gdGhpcy5fb25Nb3VzZURvd24uYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9vbk1vdXNlTW92ZSA9IHRoaXMuX29uTW91c2VNb3ZlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fb25Nb3VzZVVwID0gdGhpcy5fb25Nb3VzZVVwLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fb25EcmFnT3ZlciA9IHRoaXMuX29uRHJhZ092ZXIuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9vbkRyb3AgPSB0aGlzLl9vbkRyb3AuYmluZCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcclxuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICA8c3R5bGU+ICR7c3R5bGVzfTwvc3R5bGU+XHJcbiAgICAgICAgICAgIDxkaXYgaWQ9XCJjb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9XCJ2aWV3cG9ydFwiPjxkaXYgY2xhc3M9XCJwb2x5Z29uc1wiPjwvZGl2PjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxhYmVsc1wiIGlkPVwibGFiZWxzXCI+PC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIGA7XHJcblxyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lciA9IHRoaXMuc2hhZG93Um9vdC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XHJcbiAgICAgICAgdGhpcy5fdmlld3BvcnQgPSB0aGlzLnNoYWRvd1Jvb3QuZ2V0RWxlbWVudEJ5SWQoJ3ZpZXdwb3J0Jyk7XHJcbiAgICAgICAgdGhpcy5fbGFiZWxzID0gdGhpcy5zaGFkb3dSb290LmdldEVsZW1lbnRCeUlkKCdsYWJlbHMnKTtcclxuICAgICAgICB0aGlzLl9wb2x5Z29uc0MgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLnBvbHlnb25zJyk7XHJcbiAgICAgICAgdGhpcy5fcGF0dGVybkNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgICAgIHRoaXMuX3BhdHRlcm5DdHggPSB0aGlzLl9wYXR0ZXJuQ2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bik7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgdGhpcy5fb25XaGVlbCwgeyBwYXNzaXZlOiBmYWxzZSB9KTtcclxuICAgICAgICB0aGlzLl9jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLl9vbkRyYWdPdmVyKTtcclxuICAgICAgICB0aGlzLl9jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuX29uRHJvcCk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9vbk1vdXNlVXApO1xyXG5cclxuICAgICAgICB0aGlzLl91cGRhdGVHcmlkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duKTtcclxuICAgICAgICB0aGlzLl9jb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCB0aGlzLl9vbldoZWVsKTtcclxuICAgICAgICB0aGlzLl9jb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLl9vbkRyYWdPdmVyKTtcclxuICAgICAgICB0aGlzLl9jb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuX29uRHJvcCk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSk7XHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9vbk1vdXNlVXApO1xyXG4gICAgfVxyXG5cclxuICAgIF91cGRhdGVHcmlkKCkge1xyXG4gICAgICAgIHRoaXMuX3BhblggPSBNYXRoLm1pbih0aGlzLl9wYW5YLCAwKTtcclxuICAgICAgICB0aGlzLl9wYW5ZID0gTWF0aC5taW4odGhpcy5fcGFuWSwgMCk7XHJcbiAgICBcclxuICAgICAgICB0aGlzLl92aWV3cG9ydC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7dGhpcy5fcGFuWH1weCwgJHstdGhpcy5fcGFuWX1weClgO1xyXG4gICAgXHJcbiAgICAgICAgdGhpcy5fdXBkYXRlQmFja2dyb3VuZFBhdHRlcm4oKTtcclxuICAgIFxyXG4gICAgICAgIGNvbnN0IGN3ID0gdGhpcy5fY29udGFpbmVyLmNsaWVudFdpZHRoO1xyXG4gICAgICAgIGNvbnN0IGNoID0gdGhpcy5fY29udGFpbmVyLmNsaWVudEhlaWdodDtcclxuICAgICAgICBjb25zdCBuZXdXID0gY3cgLSB0aGlzLl9wYW5YO1xyXG4gICAgICAgIGNvbnN0IG5ld0ggPSBjaCAtIHRoaXMuX3Bhblk7XHJcbiAgICAgICAgdGhpcy5fdmlld3BvcnQuc3R5bGUud2lkdGggPSBgJHtuZXdXfXB4YDtcclxuICAgICAgICB0aGlzLl92aWV3cG9ydC5zdHlsZS5oZWlnaHQgPSBgJHtuZXdIfXB4YDtcclxuICAgIFxyXG4gICAgICAgIHRoaXMuX3JlbmRlckxhYmVscygpO1xyXG4gICAgfVxyXG5cclxuICAgIF9yZW5kZXJMYWJlbHMoKSB7XHJcbiAgICAgICAgY29uc3QgY3cgPSB0aGlzLl9jb250YWluZXIuY2xpZW50V2lkdGg7XHJcbiAgICAgICAgY29uc3QgY2ggPSB0aGlzLl9jb250YWluZXIuY2xpZW50SGVpZ2h0O1xyXG5cclxuICAgICAgICBjb25zdCBzY2FsZSA9IHRoaXMuX3NjYWxlO1xyXG4gICAgICAgIGNvbnN0IGdyaWRTaXplID0gdGhpcy5fZ3JpZFNpemU7XHJcbiAgICAgICAgY29uc3Qgc2l6ZSA9IGdyaWRTaXplICogc2NhbGU7XHJcbiAgICBcclxuICAgICAgICB0aGlzLl9sYWJlbHMuaW5uZXJIVE1MID0gJyc7XHJcbiAgICBcclxuICAgICAgICBjb25zdCBvcmlnaW5YID0gdGhpcy5fcGFuWDtcclxuICAgICAgICBjb25zdCBuTWluID0gTWF0aC5jZWlsKC1vcmlnaW5YIC8gc2l6ZSk7XHJcbiAgICAgICAgY29uc3Qgbk1heCA9IE1hdGguZmxvb3IoKGN3IC0gb3JpZ2luWCkgLyBzaXplKTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBuID0gbk1pbjsgbiA8PSBuTWF4OyBuKyspIHtcclxuICAgICAgICAgICAgY29uc3Qgc2NyZWVuWCA9IG9yaWdpblggKyBuICogc2l6ZTtcclxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBuICogZ3JpZFNpemU7XHJcblxyXG4gICAgICAgICAgICBpZiAodmFsdWUgPCAwKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxhYmVsQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgIGxhYmVsQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdsYWJlbFgnO1xyXG4gICAgICAgICAgICBsYWJlbENvbnRhaW5lci50ZXh0Q29udGVudCA9IHZhbHVlO1xyXG4gICAgICAgICAgICBsYWJlbENvbnRhaW5lci5zdHlsZS5sZWZ0ID0gYCR7c2NyZWVuWH1weGA7XHJcbiAgICAgICAgICAgIGxhYmVsQ29udGFpbmVyLnN0eWxlLnRvcCA9IGAke2NoIC0gMTV9cHhgO1xyXG4gICAgICAgICAgICB0aGlzLl9sYWJlbHMuYXBwZW5kQ2hpbGQobGFiZWxDb250YWluZXIpO1xyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIGNvbnN0IG9yaWdpblkgPSBjaCAtIHRoaXMuX3Bhblk7XHJcbiAgICAgICAgY29uc3QgbU1pbiA9IE1hdGguY2VpbCgoY2ggLSBvcmlnaW5ZKSAvIHNpemUpO1xyXG4gICAgICAgIGNvbnN0IG1NYXggPSBNYXRoLmZsb29yKG9yaWdpblkgLyBzaXplKTtcclxuICAgIFxyXG4gICAgICAgIGZvciAobGV0IG0gPSBtTWluOyBtIDw9IG1NYXg7IG0rKykge1xyXG4gICAgICAgICAgICBjb25zdCBzY3JlZW5ZID0gb3JpZ2luWSAtIG0gKiBzaXplO1xyXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG0gKiBncmlkU2l6ZTtcclxuXHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA8IDApIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbGFiZWxDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgbGFiZWxDb250YWluZXIuY2xhc3NOYW1lID0gJ2xhYmVsWSc7XHJcbiAgICAgICAgICAgIGxhYmVsQ29udGFpbmVyLnRleHRDb250ZW50ID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGxhYmVsQ29udGFpbmVyLnN0eWxlLmxlZnQgPSBgMHB4YDtcclxuICAgICAgICAgICAgbGFiZWxDb250YWluZXIuc3R5bGUudG9wICA9IGAke3NjcmVlbll9cHhgO1xyXG4gICAgICAgICAgICB0aGlzLl9sYWJlbHMuYXBwZW5kQ2hpbGQobGFiZWxDb250YWluZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICBcclxuICAgIF91cGRhdGVCYWNrZ3JvdW5kUGF0dGVybigpIHtcclxuICAgICAgICBjb25zdCBzaXplID0gdGhpcy5fZ3JpZFNpemUgKiB0aGlzLl9zY2FsZTtcclxuICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9wYXR0ZXJuQ3R4O1xyXG5cclxuICAgICAgICB0aGlzLl9wYXR0ZXJuQ2FudmFzLndpZHRoICA9IHNpemU7XHJcbiAgICAgICAgdGhpcy5fcGF0dGVybkNhbnZhcy5oZWlnaHQgPSBzaXplO1xyXG5cclxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsMCxzaXplLHNpemUpO1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjMDAwJztcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gMTtcclxuXHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5tb3ZlVG8oMCwgMCk7XHJcbiAgICAgICAgY3R4LmxpbmVUbygwLCBzaXplKTtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHgubW92ZVRvKDAsIHNpemUtMC41KTtcclxuICAgICAgICBjdHgubGluZVRvKHNpemUsIHNpemUtMC41KTtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGFVUkwgPSB0aGlzLl9wYXR0ZXJuQ2FudmFzLnRvRGF0YVVSTCgpO1xyXG5cclxuICAgICAgICBjb25zdCBveCA9IHRoaXMuX3BhblggJSBzaXplO1xyXG4gICAgICAgIGNvbnN0IG95ID0gKC10aGlzLl9wYW5ZKSAlIHNpemU7XHJcblxyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBgdXJsKCR7ZGF0YVVSTH0pYDtcclxuICAgICAgICB0aGlzLl9jb250YWluZXIuc3R5bGUuYmFja2dyb3VuZFJlcGVhdCA9ICdyZXBlYXQnO1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9IGAke3NpemV9cHggJHtzaXplfXB4YDtcclxuICAgICAgICB0aGlzLl9jb250YWluZXIuc3R5bGUuYmFja2dyb3VuZFBvc2l0aW9uID0gYCR7b3h9cHggJHtveX1weGA7XHJcbiAgICB9XHJcblxyXG4gICAgX29uTW91c2VEb3duKGUpIHtcclxuICAgICAgICBpZiAoZS50YXJnZXQuY2xvc2VzdCgncG9seWdvbi1pdGVtJykpIHJldHVybjtcclxuICAgICAgICBpZiAoZS5idXR0b24gIT09IDApIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5faXNQYW5uaW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9zdGFydFggPSBlLmNsaWVudFggLSB0aGlzLl9wYW5YO1xyXG4gICAgICAgIHRoaXMuX3N0YXJ0WSA9IGUuY2xpZW50WSArIHRoaXMuX3Bhblk7XHJcblxyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS5jdXJzb3IgPSAnZ3JhYmJpbmcnO1xyXG4gICAgfVxyXG5cclxuICAgIF9vbk1vdXNlTW92ZShlKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc1Bhbm5pbmcpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fcGFuWCA9IGUuY2xpZW50WCAtIHRoaXMuX3N0YXJ0WDtcclxuICAgICAgICB0aGlzLl9wYW5ZID0gdGhpcy5fc3RhcnRZIC0gZS5jbGllbnRZO1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZUdyaWQoKTtcclxuICAgIH1cclxuXHJcbiAgICBfb25Nb3VzZVVwKCkge1xyXG4gICAgICAgIHRoaXMuX2lzUGFubmluZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS5jdXJzb3IgPSAnZ3JhYic7XHJcbiAgICB9XHJcblxyXG4gICAgX29uV2hlZWwoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgY29uc3QgZGVsdGEgPSBlLmRlbHRhWSA8IDAgPyAxLjEgOiAwLjk7XHJcbiAgICAgICAgdGhpcy5fc2NhbGUgKj0gZGVsdGE7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fcG9seWdvbnNDLnF1ZXJ5U2VsZWN0b3JBbGwoJ3BvbHlnb24taXRlbScpXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKHBvbHlnb24gPT4gcG9seWdvbi56b29tID0gdGhpcy5fc2NhbGUpXHJcbiAgICAgICAgO1xyXG5cclxuICAgICAgICBjb25zdCByZWN0ID0gdGhpcy5fdmlld3BvcnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgY29uc3QgbXggPSBlLmNsaWVudFggLSByZWN0LmxlZnQ7XHJcbiAgICAgICAgY29uc3QgbXkgPSBlLmNsaWVudFkgLSByZWN0LnRvcDtcclxuXHJcbiAgICAgICAgdGhpcy5fcGFuWCAtPSBteCAqIChkZWx0YSAtIDEpO1xyXG4gICAgICAgIHRoaXMuX3BhblkgKz0gbXkgKiAoZGVsdGEgLSAxKTtcclxuXHJcbiAgICAgICAgdGhpcy5fdXBkYXRlR3JpZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIF9vbkRyYWdPdmVyKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJztcclxuICAgIH1cclxuXHJcbiAgICBfb25Ecm9wKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBcclxuICAgICAgICBsZXQgcG9seWdvbiA9IHdpbmRvdy5fZHJhZ2dlZEl0ZW07XHJcbiAgICAgICAgaWYgKCFwb2x5Z29uKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGQgPSBKU09OLnBhcnNlKGUuZGF0YVRyYW5zZmVyLmdldERhdGEoJ2FwcGxpY2F0aW9uL2pzb24nKSk7XHJcbiAgICAgICAgICAgIHBvbHlnb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwb2x5Z29uLWl0ZW0nKTtcclxuICAgICAgICAgICAgcG9seWdvbi5kYXRhID0gZDtcclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICBjb25zdCByZWN0ID0gdGhpcy5fdmlld3BvcnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgY29uc3QgY29udGFpbmVySGVpZ2h0ID0gdGhpcy5fY29udGFpbmVyLmNsaWVudEhlaWdodDtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBseCA9IGUuY2xpZW50WCAtIHJlY3QubGVmdDtcclxuICAgICAgICBjb25zdCBseSA9IGUuY2xpZW50WSAtIHJlY3QudG9wO1xyXG4gICAgXHJcbiAgICAgICAgY29uc3QgZ3ggPSAobHggLSB0aGlzLl9wYW5YKSAvIHRoaXMuX3NjYWxlO1xyXG4gICAgICAgIGNvbnN0IGd5ID0gKChjb250YWluZXJIZWlnaHQgLSBseSkgLSB0aGlzLl9wYW5ZKSAvIHRoaXMuX3NjYWxlO1xyXG4gICAgXHJcbiAgICAgICAgY29uc3QgcHggPSBneCAqIHRoaXMuX3NjYWxlICsgdGhpcy5fcGFuWDtcclxuICAgICAgICBjb25zdCBweSA9IChjb250YWluZXJIZWlnaHQgLSBneSAqIHRoaXMuX3NjYWxlKSAtIHRoaXMuX3Bhblk7XHJcbiAgICBcclxuICAgICAgICBwb2x5Z29uLnBvc2l0aW9uID0geyB4OiBweCwgeTogcHkgfTtcclxuICAgICAgICBwb2x5Z29uLnpvb20gPSB0aGlzLl9zY2FsZTtcclxuXHJcbiAgICAgICAgdGhpcy5fcG9seWdvbnNDLmFwcGVuZENoaWxkKHBvbHlnb24pO1xyXG5cclxuICAgICAgICB3aW5kb3cuX2RyYWdnZWRJdGVtID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDYW1lcmEoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcGFuWDogdGhpcy5fcGFuWCxcclxuICAgICAgICAgICAgcGFuWTogdGhpcy5fcGFuWSxcclxuICAgICAgICAgICAgc2NhbGU6IHRoaXMuX3NjYWxlLFxyXG4gICAgICAgICAgICB3aWR0aDogdGhpcy5fdmlld3BvcnQuY2xpZW50V2lkdGgsXHJcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5fdmlld3BvcnQuY2xpZW50SGVpZ2h0XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDYW1lcmEoeyBwYW5YLCBwYW5ZLCBzY2FsZSwgd2lkdGgsIGhlaWdodCB9KSB7XHJcbiAgICAgICAgdGhpcy5fcGFuWCA9IHBhblg7XHJcbiAgICAgICAgdGhpcy5fcGFuWSA9IHBhblk7XHJcbiAgICAgICAgdGhpcy5fc2NhbGUgPSBzY2FsZTtcclxuICAgICAgICB0aGlzLl92aWV3cG9ydC5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcclxuICAgICAgICB0aGlzLl92aWV3cG9ydC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xyXG5cclxuICAgICAgICB0aGlzLl9wb2x5Z29uc0MucXVlcnlTZWxlY3RvckFsbCgncG9seWdvbi1pdGVtJylcclxuICAgICAgICAgICAgLmZvckVhY2gocG9seWdvbiA9PiBwb2x5Z29uLnpvb20gPSBzY2FsZSlcclxuICAgICAgICA7XHJcblxyXG4gICAgICAgIHRoaXMuX3VwZGF0ZUdyaWQoKTtcclxuICAgIH1cclxufVxyXG5cclxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCd3b3JrLXpvbmUnLCBXb3JrWm9uZSk7XHJcbiIsImV4cG9ydCBkZWZhdWx0IFwiKiB7XFxyXFxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxyXFxufVxcclxcblxcclxcbi5hcHAge1xcclxcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxyXFxuICAgIHdpZHRoOiAxMDAlO1xcclxcbiAgICBoZWlnaHQ6IDEwMHZoO1xcclxcbiAgICBwYWRkaW5nOiAyMHB4O1xcclxcblxcclxcbiAgICBkaXNwbGF5OiBmbGV4O1xcclxcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcclxcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXHJcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXHJcXG59XFxyXFxuXFxyXFxuLmNvbnRyb2xzIHtcXHJcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcclxcbiAgICB3aWR0aDogMTAwJTtcXHJcXG4gICAgaGVpZ2h0OiA2MHB4O1xcclxcblxcclxcbiAgICBkaXNwbGF5OiBmbGV4O1xcclxcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcclxcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXHJcXG59XFxyXFxuXFxyXFxuLmNvbnRyb2xzPmJ1dHRvbiB7XFxyXFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXHJcXG5cXHJcXG4gICAgbWFyZ2luOiAwIDhweDtcXHJcXG5cXHJcXG4gICAgaGVpZ2h0OiA0MHB4O1xcclxcbiAgICB3aWR0aDogMTIwcHg7XFxyXFxuXFxyXFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXHJcXG59XFxyXFxuXFxyXFxuLnpvbmVzIHtcXHJcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcclxcblxcclxcbiAgICB3aWR0aDogMTAwJTtcXHJcXG4gICAgZmxleDogMTtcXHJcXG5cXHJcXG4gICAgZGlzcGxheTogZmxleDtcXHJcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXHJcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxyXFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxyXFxufVxcclxcblxcclxcbi56b25lcz4qIHtcXHJcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcclxcblxcclxcbiAgICB3aWR0aDogMTAwJTtcXHJcXG4gICAgZmxleDogMTtcXHJcXG5cXHJcXG4gICAgbWFyZ2luOiA4cHggMDtcXHJcXG5cXHJcXG4gICAgYm9yZGVyOiAxcHggc29saWQgYmxhY2s7XFxyXFxuXFxyXFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYigyMTEsIDIxMSwgMjExKTtcXHJcXG59XFxyXFxuXCI7IiwiZXhwb3J0IGRlZmF1bHQgXCI6aG9zdCB7IGRpc3BsYXk6IGJsb2NrOyB9XFxyXFxuXFxyXFxuI2NvbnRhaW5lciB7XFxyXFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXHJcXG4gICAgd2lkdGg6IDEwMCU7XFxyXFxuICAgIGhlaWdodDogNDAwcHg7XFxyXFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxyXFxuICAgIGN1cnNvcjogZ3JhYjtcXHJcXG59XFxyXFxuXFxyXFxuI3ZpZXdwb3J0IHtcXHJcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgICB0b3A6IDA7XFxyXFxuICAgIGxlZnQ6IDA7XFxyXFxuICAgIHRyYW5zZm9ybS1vcmlnaW46IDAgMDtcXHJcXG59XFxyXFxuXFxyXFxuLmxhYmVscyB7XFxyXFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXHJcXG4gICAgdG9wOiAwOyBsZWZ0OiAwO1xcclxcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcXHJcXG4gICAgZm9udC1zaXplOiAxMnB4O1xcclxcbiAgICBjb2xvcjogIzMzMztcXHJcXG4gICAgdXNlci1zZWxlY3Q6IG5vbmU7XFxyXFxufVxcclxcblxcclxcbi5sYWJlbFgsIC5sYWJlbFkge1xcclxcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxyXFxufVxcclxcblxcclxcbi5wb2x5Z29ucyB7XFxyXFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXHJcXG4gICAgdG9wOiAwO1xcclxcbiAgICBsZWZ0OiAwO1xcclxcbn1cXHJcXG5cIjsiLCJleHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVSYW5kb21Qb2x5Z29uKCkge1xyXG4gICAgY29uc3QgdmVydGV4ID0gMyArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUpO1xyXG4gICAgY29uc3QgYW5nbGVTdGVwID0gKDIgKiBNYXRoLlBJKSAvIHZlcnRleDtcclxuICAgIGNvbnN0IHJhZGl1cyA9IDMwICogKDAuOCArIE1hdGgucmFuZG9tKCkgKiAwLjQpO1xyXG4gICAgY29uc3QgY2VudGVyID0geyB4OiA1MCwgeTogNTAgfTtcclxuXHJcbiAgICBjb25zdCBwb2ludHMgPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRleDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgYW5nbGUgPSBpICogYW5nbGVTdGVwICsgKE1hdGgucmFuZG9tKCkgLSAwLjUpICogYW5nbGVTdGVwICogMC4zO1xyXG4gICAgICAgIGNvbnN0IHIgPSByYWRpdXMgKiAoMC45ICsgTWF0aC5yYW5kb20oKSAqIDAuMik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcG9pbnRzLnB1c2goe1xyXG4gICAgICAgICAgICB4OiBNYXRoLmZsb29yKGNlbnRlci54ICsgciAqIE1hdGguY29zKGFuZ2xlKSksXHJcbiAgICAgICAgICAgIHk6IE1hdGguZmxvb3IoY2VudGVyLnkgKyByICogTWF0aC5zaW4oYW5nbGUpKSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcG9pbnRzO1xyXG59XHJcbiIsImV4cG9ydCBmdW5jdGlvbiBzYXZlUG9seWdvbnMoc3RhdGUpIHtcclxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzdGF0ZScsIEpTT04uc3RyaW5naWZ5KHN0YXRlKSk7XHJcbn1cclxuICBcclxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRQb2x5Z29ucygpIHtcclxuICAgIGNvbnN0IHN0YXRlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3N0YXRlJyk7XHJcbiAgICByZXR1cm4gc3RhdGUgPyBKU09OLnBhcnNlKHN0YXRlKSA6IG51bGw7XHJcbn1cclxuICBcclxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyUG9seWdvbnMoKSB7XHJcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnc3RhdGUnKTtcclxufVxyXG4gICIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgJy4vY29tcG9uZW50cy9hcHAuanMnO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=