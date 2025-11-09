class DrawingCanvas {
    constructor(canvasEl, network) {
        this.canvas = canvasEl;
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;

        this.network = network;
        this.currentStroke = null;
        // Set canvas dimensions
        this.canvas.width = 800;
        this.canvas.height = 600;

        // Tool settings
        this.color = '#000000';
        this.strokeWidth = 5;
    }

    // Initialize event listeners
    init() {
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());
    }

    // Helper to get mouse coordinates
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const { x, y } = this.getMousePos(e);

        this.currentStroke = {
            id: `${Date.now()}-${Math.random()}`, // Simple unique ID
            color: this.color,
            width: this.strokeWidth,
            points: [{ x, y }]
        };
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.strokeWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    draw(e) {
        if (!this.isDrawing) return;
        const { x, y } = this.getMousePos(e);
        
        this.currentStroke.points.push({ x, y });
        
        this.ctx.lineTo(x, y);
        this.ctx.stroke();

        
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.ctx.closePath();

            if (this.currentStroke.points.length > 1) {
                this.network.emitStroke(this.currentStroke);
            }

            this.isDrawing = false;
            this.currentStroke = null;
        }
    }
    
    /*drawRemote(data) {
        // We need to set up the context for this remote stroke
        this.ctx.beginPath();
        this.ctx.moveTo(data.x, data.y); // This is not quite right, but works for points
        this.ctx.lineTo(data.x, data.y); // We'll just draw a tiny segment
        this.ctx.strokeStyle = data.color;
        this.ctx.lineWidth = data.width;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
        this.ctx.closePath();
    } 
*/

    drawStroke(stroke) {
        if (!stroke || stroke.points.length < 2) return;

        this.ctx.beginPath();
        this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        
        this.ctx.strokeStyle = stroke.color;
        this.ctx.lineWidth = stroke.width;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        for (let i = 1; i < stroke.points.length; i++) {
            this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        this.ctx.stroke();
        this.ctx.closePath();
    }

    // NEW: Clears and redraws the entire canvas from a history
    setState(history) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Redraw all strokes
        history.forEach(stroke => {
            this.drawStroke(stroke);
        });
    }
    
    // Methods to update tools
    setColor(color) {
        this.color = color;
    }

    setStrokeWidth(width) {
        this.strokeWidth = width;
    }
}