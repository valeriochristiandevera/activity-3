// Simple ResearchGate Style Confusion Matrix - 10x10 Accident
// Plain table fill with counts/%, totals

const NUM_CLASSES = 10;
const classLabels = ['NoAcc', 'R.Minor', 'R.Major', 'Ped', 'Multi', 'H.Minor', 'H.Major', 'Side', 'Roll', 'Other'];

let matrixData = Array(NUM_CLASSES).fill().map(() => Array(NUM_CLASSES).fill(0));

document.addEventListener('DOMContentLoaded', () => {
    generateMatrix();
});

function generateMatrix() {
    // Sample realistic data
    initializeData();
    fillTable();
}

function initializeData() {
    matrixData = Array(NUM_CLASSES).fill().map(() => Array(NUM_CLASSES).fill(0));
    const totalSamples = 10000; // Total predictions
    const samplesPerClass = totalSamples / NUM_CLASSES;
    
    for (let i = 0; i < NUM_CLASSES; i++) {
        const rowSum = samplesPerClass;
        matrixData[i][i] = Math.round(rowSum * 0.88); // 88% accuracy diagonal
        let remaining = rowSum - matrixData[i][i];
        
        // Distribute errors
        let targets = [];
        if (i < 5) targets = [0,1,2,3,4]; else if (i < 8) targets = [5,6,7]; else targets = [8,9,0,1];
        for (let j = 0; j < 4 && remaining > 0; j++) {
            const target = targets[j % targets.length];
            if (target !== i) {
                const error = Math.round(remaining / 4);
                matrixData[i][target] = error;
                remaining -= error;
            }
        }
    }
}

function fillTable() {
    let grandTotal = 0;
    
    // Fill data cells with %
    for (let i = 0; i < NUM_CLASSES; i++) {
        let rowTotal = 0;
        for (let j = 0; j < NUM_CLASSES; j++) {
            rowTotal += matrixData[i][j];
            const pct = rowTotal > 0 ? (matrixData[i][j] / rowTotal * 100).toFixed(1) : 0;
            document.getElementById(`${i}-${j}`).textContent = pct + '%';
        }
        document.getElementById(`rowtotal-${i}`).textContent = rowTotal.toFixed(0);
        grandTotal += rowTotal;
    }
    
    // Col totals
    for (let j = 0; j < NUM_CLASSES; j++) {
        let colTotal = 0;
        for (let i = 0; i < NUM_CLASSES; i++) {
            colTotal += matrixData[i][j];
        }
        document.getElementById(`total-${j}`).textContent = colTotal.toFixed(0);
    }
    
    document.getElementById('grandtotal').textContent = grandTotal.toFixed(0);
}

function randomData() {
    // Random variation
    for (let i = 0; i < NUM_CLASSES; i++) {
        for (let j = 0; j < NUM_CLASSES; j++) {
            matrixData[i][j] = Math.random() * 100;
        }
    }
    fillTable();
}

// Global functions for buttons
window.generateMatrix = generateMatrix;
window.randomData = randomData;

