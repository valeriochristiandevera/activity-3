// Medical Diagnosis Confusion Matrix - Hybrid Style
const NUM_CLASSES = 10;
let matrixData = Array(NUM_CLASSES).fill().map(() => Array(NUM_CLASSES).fill(0));

const classNames = ['Normal', 'Fract.Minor', 'Fract.Major', 'TumorBenign', 'TumorMalig', 'Inf.Mild', 'Inf.Severe', 'StrokeMild', 'StrokeSevere', 'HeartAbnorm'];

document.addEventListener('DOMContentLoaded', () => {
    initializeMedicalData();
    generateMatrix();
    updateMetrics();
});

function initializeMedicalData() {
    const baseAcc = [95, 88, 92, 90, 85, 89, 87, 91, 86, 93];
    for (let i = 0; i < NUM_CLASSES; i++) {
        matrixData[i][i] = baseAcc[i];
        let remaining = 100 - matrixData[i][i];
        const targets = [ (i+1)%NUM_CLASSES, (i-1+NUM_CLASSES)%NUM_CLASSES ];
        remaining /= 2;
        matrixData[i][targets[0]] = remaining;
        matrixData[i][targets[1]] = remaining;
    }
}

function generateMatrix() {
    const grid = document.getElementById('matrixGrid');
    grid.innerHTML = '<div class="grid-row"><div class="col-label">Pred ↓</div>' + classNames.map(name => `<div class="col-label">${name.slice(0,4)}</div>`).join('') + '<div class="col-label">Total</div></div>';
    
    let rowTotals = Array(NUM_CLASSES).fill(0);
    
    for (let row = 0; row < NUM_CLASSES; row++) {
        const gridRow = document.createElement('div');
        gridRow.className = 'grid-row';
        
        const rowLabel = document.createElement('div');
        rowLabel.className = 'cell row-label-cell';
        rowLabel.textContent = classNames[row].slice(0,8);
        gridRow.appendChild(rowLabel);
        
        for (let col = 0; col <= NUM_CLASSES; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (col === NUM_CLASSES) {
                cell.classList.add('total-row');
                rowTotals[row] = matrixData[row].reduce((a,b) => a+b, 0);
                cell.textContent = rowTotals[row].toFixed(0);
            } else {
                const pct = rowTotals[row] > 0 ? (matrixData[row][col] / rowTotals[row] * 100).toFixed(1) : 0;
                cell.textContent = pct + '%';
                if (row === col) cell.classList.add('accuracy-diagonal');
            }
            gridRow.appendChild(cell);
        }
        grid.appendChild(gridRow);
    }
    
    // Total row
    const totalRow = document.createElement('div');
    totalRow.className = 'grid-row';
    const totalLabel = document.createElement('div');
    totalLabel.className = 'cell total-col';
    totalLabel.textContent = 'Total';
    totalRow.appendChild(totalLabel);
    
    let colTotals = Array(NUM_CLASSES).fill(0);
    for (let col = 0; col < NUM_CLASSES; col++) {
        for (let row = 0; row < NUM_CLASSES; row++) colTotals[col] += matrixData[row][col];
    }
    colTotals.forEach(total => {
        const cell = document.createElement('div');
        cell.className = 'cell total-row';
        cell.textContent = total.toFixed(0);
        totalRow.appendChild(cell);
    });
    const grandTotal = document.createElement('div');
    grandTotal.className = 'cell total-row total-col';
    grandTotal.textContent = colTotals.reduce((a,b) => a+b, 0).toFixed(0);
    totalRow.appendChild(grandTotal);
    grid.appendChild(totalRow);
    
    updateColors();
}

function updateColors() {
    // Simple intensity coloring
    document.querySelectorAll('.cell').forEach(cell => {
        const text = cell.textContent.trim();
        const num = parseFloat(text);
        if (!isNaN(num) && num > 0) {
            const intensity = Math.min(20, Math.floor(num));
            cell.classList.add(`cell-${intensity}`);
        }
    });
}

function updateMetrics() {
    const correct = matrixData.reduce((sum, row, i) => sum + row[i], 0);
    const total = matrixData.flat().reduce((a,b) => a+b, 0);
    const acc = (correct / total * 100).toFixed(1);
    document.getElementById('totalsInfo').innerHTML = `<h3>Accuracy: ${acc}% | Total Cases: ${total.toFixed(0)}</h3>`;
}

function randomData() {
    matrixData = Array(NUM_CLASSES).fill().map(() => Array(NUM_CLASSES).fill(0).map(() => Math.random()*100));
    generateMatrix();
    updateMetrics();
}

window.generateMatrix = generateMatrix;
window.randomData = randomData;

