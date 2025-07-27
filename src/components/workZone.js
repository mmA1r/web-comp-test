import './polygon.js';

import styles from '../styles/workZone.css';

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
            <style> ${styles}</style>
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
