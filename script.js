// Professional MDPI-Style Confusion Matrix (10x10) - Static Road Accident Classification
// Features: Non-editable, row/col totals, diagonal accuracy %, error annotations, paper-blue colormap, metrics

const NUM_CLASSES = 10;
let matrixData = Array(NUM_CLASSES).fill().map(() => Array(NUM_CLASSES).fill(0));
let maxVal = 100;
let rowTotals = Array(NUM_CLASSES).fill(0);
let colTotals = Array(NUM_CLASSES).fill(0);
let classAccuracies = Array(NUM_CLASSES).fill(0);

const classNames = [
    'NoAcc', 'R.Minor', 'R.Major', 'Ped', 'Multi',
    'H.Minor', 'H.Major', 'Side', 'Roll', 'Other'
];

document.addEventListener('DOMContentLoaded', () => {
    initializeSampleData();
    generateMatrix();
    updateMetrics();
});

function initializeSampleData() {
    // Realistic diagonal-dominant data (~85% overall accuracy)
    const baseDiagonal = [92, 88, 85, 82, 87, 84, 81, 86, 83, 89];
    const overallTotal = 1000; // Normalize to total samples

    for (let i = 0; i < NUM_CLASSES; i++) {
        const rowTotal = overallTotal / NUM_CLASSES; // ~100 per class
        matrixData[i][i] = baseDiagonal[i] / 100 * rowTotal; // Diagonal
        let offDiagSum = rowTotal - matrixData[i][i];

        // Distribute errors to nearby classes (realistic confusions)
        const errorTargets = [(i+1)%NUM_CLASSES, (i+NUM_CLASSES-1)%NUM_CLASSES, (i+2)%NUM_CLASSES];
        for (let j = 0; j < 3 && offDiagSum > 0; j++) {
            let error = Math.min(offDiagSum / 3, rowTotal * 0.1);
            matrixData[i][errorTargets[j]] = error;
            offDiagSum -= error;
        }
    }
}

function generateMatrix() {
    const grid = document.getElementById('matrixGrid');
    grid.innerHTML = '';

    // Add SVG overlay for arrows (MDPI style)
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.className = 'arrow-overlay';
    svg.setAttribute('width', '1200');
    svg.setAttribute('height', '800');
    grid.parentNode.appendChild(svg);

    // Generate 11 rows: 10 data + totals row
    for (let row = 0; row <= NUM_CLASSES; row++) {
        const gridRow = document.createElement('div');
        gridRow.className = 'grid-row';
        gridRow.dataset.rowIndex = row;
        
        // Row label
        const rowLabelCell = document.createElement('div');
        rowLabelCell.className = 'cell row-label-cell';
        rowLabelCell.textContent = row === NUM_CLASSES ? 'Total →' : classNames[row];
        gridRow.appendChild(rowLabelCell);
        
        // Data + col total
        for (let col = 0; col <= NUM_CLASSES; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            let value = 0;
            let label = '';
            if (row === NUM_CLASSES) {
                cell.classList.add('total-col');
                value = colTotals[col] || 0;
                label = value.toFixed(0);
            } else if (col === NUM_CLASSES) {
                cell.classList.add('total-row');
                value = rowTotals[row] || 0;
                label = value.toFixed(0);
            } else {
                value = matrixData[row][col] || 0;
                if (row === col) {
                    cell.classList.add('accuracy-diagonal');
                    const acc = classAccuracies[row] || 0;
                    label = `${acc.toFixed(1)}%`;
                    cell.dataset.acc = acc.toFixed(1);
                } else {
                    const pct = (value / Math.max(rowTotals[row], 1) * 100);
                    label = pct > 0.1 ? pct.toFixed(1) + '%' : '';
                    if (pct > 1) { // Arrow for >1% errors
                        cell.dataset.arrowTo = col;
                        cell.dataset.arrowPct = pct.toFixed(1) + '%';
                    }
                }
            }
            
            cell.innerHTML = `<span class="cell-value">${label}</span>`;
            cell.title = `Value: ${value.toFixed(0)}`;
            
            gridRow.appendChild(cell);
        }
        
        grid.appendChild(gridRow);
    }
    
    addErrorArrows(svg);
    updateColors();
}

function addErrorArrows(svg) {
    svg.innerHTML = '';
    document.querySelectorAll('.cell[data-arrowTo]').forEach((fromCell, index) => {
        if (index >= 6) return; // Top 6 errors like image
        
        const fromRow = parseInt(fromCell.dataset.row);
        const fromCol = parseInt(fromCell.dataset.col);
        const toCol = parseInt(fromCell.dataset.arrowTo);
        const pct = fromCell.dataset.arrowPct;
        
        const fromX = (fromCol + 0.5) * 110 + 150; // Offset for labels
        const fromY = (fromRow + 0.5) * 65 + 150;
        const toX = (toCol + 0.5) * 110 + 150;
        const toY = (fromRow + 0.5) * 65 + 150;
        
        // Curved arrow path (MDPI style)
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const curve = `M ${fromX},${fromY} Q ${fromX + 80},${fromY - 40} ${toX},${toY}`;
        path.setAttribute('d', curve);
        path.setAttribute('stroke', '#dc2626');
        path.setAttribute('stroke-width', '2.5');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', 'url(#arrowhead)');
        svg.appendChild(path);
        
        // % label on arrow
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (fromX + toX)/2);
        text.setAttribute('y', fromY - 60);
        text.textContent = pct;
        text.setAttribute('fill', '#dc2626');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('font-size', '12');
        text.setAttribute('text-anchor', 'middle');
        svg.appendChild(text);
    });
    
    // Arrowhead def
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.id = 'arrowhead';
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polyline.setAttribute('points', '0 0, 10 3.5, 0 7');
    polyline.setAttribute('fill', '#dc2626');
    marker.appendChild(polyline);
    defs.appendChild(marker);
    svg.appendChild(defs);
}

function computeTotals() {
    rowTotals = matrixData.map(row => row.reduce((sum, v) => sum + v, 0));
    colTotals.fill(0);
    classAccuracies.fill(0);
    
    for (let i = 0; i < NUM_CLASSES; i++) {
        colTotals[i] = matrixData.reduce((sum, row) => sum + row[i], 0);
        if (rowTotals[i] > 0) {
            classAccuracies[i] = (matrixData[i][i] / rowTotals[i]) * 100;
        }
    }
    
    // Grand total for colTotals[NUM_CLASSES]
    colTotals[NUM_CLASSES] = rowTotals.reduce((a, b) => a + b, 0);
}

function updateColors() {
    computeTotals();
    
    let globalMax = Math.max(...rowTotals, ...colTotals);
    
    document.querySelectorAll('.cell:not(.row-label-cell)').forEach(cell => {
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        
        let val = 0;
        if (r === NUM_CLASSES) val = colTotals[c];
        else if (c === NUM_CLASSES) val = rowTotals[r];
        else val = matrixData[r][c];
        
        const intensity = Math.floor((val / globalMax) * 20); // 0-20 classes
        cell.className = `cell cell-${intensity} ${r === NUM_CLASSES ? 'total-col' : ''} ${c === NUM_CLASSES ? 'total-row' : ''} ${r === c && r < NUM_CLASSES ? 'accuracy-diagonal' : ''}`;
    });
}

function updateMetrics() {
    computeTotals();
    const totalSamples = rowTotals.reduce((a, b) => a + b, 0);
    const correct = matrixData.reduce((sum, row, i) => sum + (row[i] || 0), 0);
    const overallAcc = totalSamples > 0 ? (correct / totalSamples * 100) : 0;
    const macroF1 = computeMacroF1();
    
    const info = document.getElementById('totalsInfo');
    info.innerHTML = `
        <h3>Model Performance Metrics</h3>
        <div class="metric-grid">
            <div class="metric-item"><strong>Overall Accuracy:</strong> ${overallAcc.toFixed(1)}%</div>
            <div class="metric-item"><strong>Macro F1-Score:</strong> ${macroF1.toFixed(3)}</div>
            <div class="metric-item"><strong>Total Samples:</strong> ${totalSamples.toFixed(0)}</div>
            <div class="metric-item"><strong>Mean Class Acc:</strong> ${classAccuracies.reduce((a,b)=>a+b,0)/NUM_CLASSES.toFixed(1)}%</div>
        </div>
        <div class="per-class-acc">
            ${classNames.map((name, i) => `<span>Class ${i}: ${classAccuracies[i].toFixed(1)}%</span>`).join(' | ')}
        </div>
    `;
}

function computeMacroF1() {
    let f1Sum = 0;
    for (let i = 0; i < NUM_CLASSES; i++) {
        const tp = matrixData[i][i];
        const fp = colTotals[i] - tp;
        const fn = rowTotals[i] - tp;
        const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
        const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
        const f1 = (precision + recall) > 0 ? 2 * precision * recall / (precision + recall) : 0;
        f1Sum += f1;
    }
    return f1Sum / NUM_CLASSES;
}

// Controls (limited for static view)
document.getElementById('maxVal')?.addEventListener('input', updateColors);
function generateMatrix() { updateColors(); generateMatrix(); }
function randomData() { initializeSampleData(); updateColors(); generateMatrix(); updateMetrics(); }

// Auto-refresh on load
setTimeout(() => {
    generateMatrix();
    updateMetrics();
}, 100);

