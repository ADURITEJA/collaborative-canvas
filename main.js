window.addEventListener('DOMContentLoaded', () => {
    // Get all the UI elements
    const canvasEl = document.getElementById('drawing-canvas');
    const colorPicker = document.getElementById('colorPicker');
    const strokeWidthSlider = document.getElementById('strokeWidth');
    const undoButton = document.getElementById('undoButton');
    const redoButton = document.getElementById('redoButton');
    const network = new Network();

    // Initialize the canvas
    const canvas = new DrawingCanvas(canvasEl, network);
    canvas.init();

    // Set up tool listeners
    colorPicker.addEventListener('change', (e) => {
        canvas.setColor(e.target.value);
    });

    strokeWidthSlider.addEventListener('input', (e) => {
        canvas.setStrokeWidth(e.target.value);
    });

    undoButton.addEventListener('click', () => {
        network.emitUndo();
    });

    redoButton.addEventListener('click', () => {
        network.emitRedo();
    });

    network.onSetState((history) => {
        console.log('Setting state from history');
        canvas.setState(history);
    });

    // NEW: When the server sends a new stroke, just draw it
    network.onUpdateCanvas((stroke) => {
        console.log('Drawing new stroke');
        canvas.drawStroke(stroke);
    });
});