export function generateRandomPolygon() {
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
