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
  