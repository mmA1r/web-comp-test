import './bufferZone.js';
import './workZone.js';
import { savePolygons, loadPolygons, clearPolygons } from '../utils/storage.js';

import appStyle from '../styles/app.css';

class App extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>${appStyle}</style>
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

        const stored = loadPolygons();

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

        savePolygons({
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
        clearPolygons();
        window.location.reload();
    }
}

customElements.define('app-root', App);
