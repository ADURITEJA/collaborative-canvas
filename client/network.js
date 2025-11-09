class Network {
    constructor() {
        console.log('Initializing WebSocket connection...');
        
        // Configure socket with explicit WebSocket transport
        this.socket = io({
            path: '/socket.io',
            transports: ['websocket'],
            upgrade: false,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            forceNew: true
        });
        
        // Log all socket events for debugging
        const events = ['connect', 'connect_error', 'connect_timeout', 'reconnect', 'reconnect_attempt', 'reconnecting', 'reconnect_error', 'reconnect_failed', 'disconnect', 'error'];
        events.forEach(event => {
            this.socket.on(event, (data) => {
                console.log(`Socket event: ${event}`, data || '');
            });
        });
        
        // Log when we receive data from server
        this.socket.on('UPDATE_CANVAS', (data) => {
            console.log('Received UPDATE_CANVAS:', data);
        });
        
        this.socket.on('SET_STATE', (data) => {
            console.log('Received SET_STATE:', data ? `Data length: ${data.length}` : 'No data');
        });
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