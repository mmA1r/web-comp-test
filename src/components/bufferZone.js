import { generateRandomPolygon } from '../utils/random.js';
import './polygon.js';

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
            const data = generateRandomPolygon();
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
