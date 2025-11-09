class Network {
    constructor() {
        // Connect to the current host for WebSocket
        this.socket = io(window.location.origin, {
            path: '/socket.io/',
            transports: ['websocket'],
            upgrade: false
        });
        
        console.log('Connecting to WebSocket at:', window.location.origin);
    }

    // --- Emitters (Client -> Server) ---

    // Send a single drawing point
    emitStroke(stroke) {
        this.socket.emit('DRAW_END', stroke);
    }

    // --- Listeners (Server -> Client) ---

    // Listen for broadcasts from other users
    onUpdateCanvas(callback) {
        this.socket.on('UPDATE_CANVAS', (stroke) => {
            callback(stroke);
        });
    }

    onSetState(callback) {
        this.socket.on('SET_STATE', (history) => {
            callback(history);
        });
    }
    emitUndo() {
    this.socket.emit('UNDO_REQUEST');
}

    emitRedo() {
    this.socket.emit('REDO_REQUEST');
}
}