export function stringToColor(string, saturation = 100, lightness = 75, alpha = 1) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    return `hsla(${(hash * 100 % 360)}, ${saturation}%, ${lightness}%, ${alpha})`;
}