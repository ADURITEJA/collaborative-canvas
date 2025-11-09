// This will store our canvas history
// operationStack = the list of all strokes
// redoStack = for strokes that have been undone
const state = {
    operationStack: [],
    redoStack: []
};

function addStroke(stroke) {
    state.operationStack.push(stroke);
    // Any new stroke clears the "redo" history
    state.redoStack = [];
    console.log(`Stroke added. History size: ${state.operationStack.length}`);
}

function getHistory() {
    return state.operationStack;
}

// NEW: Undo function
function undo() {
    if (state.operationStack.length > 0) {
        const undoneStroke = state.operationStack.pop();
        state.redoStack.push(undoneStroke);
        console.log(`Undo. History size: ${state.operationStack.length}`);
    }
    // Always return the new (possibly shorter) history
    return state.operationStack;
}

// NEW: Redo function
function redo() {
    if (state.redoStack.length > 0) {
        const redoneStroke = state.redoStack.pop();
        state.operationStack.push(redoneStroke);
        console.log(`Redo. History size: ${state.operationStack.length}`);
    }
    // Always return the new (possibly longer) history
    return state.operationStack;
}

// We will add undo/redo functions here later
module.exports = {
    addStroke,
    getHistory,
    undo,
    redo
};