export function savePolygons(state) {
    localStorage.setItem('state', JSON.stringify(state));
}
  
export function loadPolygons() {
    const state = localStorage.getItem('state');
    return state ? JSON.parse(state) : null;
}
  
export function clearPolygons() {
    localStorage.removeItem('state');
}
  