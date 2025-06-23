// Visualization Components for NLP Project
// Creates interactive charts and plots for the project demonstrations

// Emotion Distribution Pie Chart (1.1 requirement)
function createEmotionPieChart() {
    const data = [
        { emotion: 'Positive', percentage: 40, color: '#4CAF50' },
        { emotion: 'Negative', percentage: 40, color: '#F44336' },
        { emotion: 'Neutral', percentage: 20, color: '#9E9E9E' }
    ];

    const container = document.getElementById('emotion-pie-chart');
    if (!container) return;

    // Simple CSS-based pie chart
    container.innerHTML = `
        <div class="pie-chart-container">
            <div class="pie-chart">
                <div class="slice positive" style="--percentage: 40; --color: #4CAF50"></div>
                <div class="slice negative" style="--percentage: 40; --color: #F44336"></div>
                <div class="slice neutral" style="--percentage: 20; --color: #9E9E9E"></div>
            </div>
            <div class="pie-legend">
                <div class="legend-item">
                    <span class="legend-color" style="background: #4CAF50"></span>
                    Positive (40%)
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #F44336"></span>
                    Negative (40%)
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #9E9E9E"></span>
                    Neutral (20%)
                </div>
            </div>
        </div>
    `;
}

// Article vs Highlights Length Histogram (2.2 requirement)
function createLengthHistogram() {
    const container = document.getElementById('length-histogram');
    if (!container) return;

    const articleData = [87, 92, 101]; // Article lengths
    const highlightData = [17, 20, 22]; // Highlight lengths

    container.innerHTML = `
        <div class="histogram-container">
            <div class="histogram-section">
                <h4>Article Lengths (words)</h4>
                <div class="bars">
                    ${articleData.map(length => 
                        `<div class="bar article-bar" style="height: ${(length/101)*100}%; --value: '${length}'"></div>`
                    ).join('')}
                </div>
                <div class="axis-labels">
                    <span>Doc 1</span>
                    <span>Doc 2</span>
                    <span>Doc 3</span>
                </div>
            </div>
            <div class="histogram-section">
                <h4>Highlight Lengths (words)</h4>
                <div class="bars">
                    ${highlightData.map(length => 
                        `<div class="bar highlight-bar" style="height: ${(length/22)*100}%; --value: '${length}'"></div>`
                    ).join('')}
                </div>
                <div class="axis-labels">
                    <span>Doc 1</span>
                    <span>Doc 2</span>
                    <span>Doc 3</span>
                </div>
            </div>
        </div>
        <div class="histogram-analysis">
            <p><strong>Analysis:</strong> Articles average 92 words while highlights average 20 words, 
            showing a compression ratio of approximately 4.6:1. This demonstrates effective summarization.</p>
        </div>
    `;
}

// ROUGE Scores Visualization
function createROUGEScores() {
    const container = document.getElementById('rouge-scores');
    if (!container) return;

    const rougeData = [
        { doc: 'Article 1', rouge1: 0.789, rouge2: 0.389 },
        { doc: 'Article 2', rouge1: 0.867, rouge2: 0.357 },
        { doc: 'Article 3', rouge1: 0.867, rouge2: 0.500 }
    ];

    container.innerHTML = `
        <div class="rouge-visualization">
            <h4>ROUGE Score Comparison</h4>
            <div class="rouge-bars">
                ${rougeData.map(item => `
                    <div class="rouge-group">
                        <div class="doc-label">${item.doc}</div>
                        <div class="rouge-bar rouge1" style="width: ${item.rouge1 * 100}%">
                            ROUGE-1: ${item.rouge1.toFixed(3)}
                        </div>
                        <div class="rouge-bar rouge2" style="width: ${item.rouge2 * 100}%">
                            ROUGE-2: ${item.rouge2.toFixed(3)}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="rouge-analysis">
                <p><strong>Highest ROUGE-2:</strong> Article 3 (0.500) - Climate summit article</p>
                <p><strong>Lowest ROUGE-2:</strong> Article 2 (0.357) - More abstractive summarization</p>
            </div>
        </div>
    `;
}

// Information Retrieval Performance Matrix
function createIRPerformance() {
    const container = document.getElementById('ir-performance');
    if (!container) return;

    const queries = [
        { query: 'Leonardo DiCaprio', similarity: 0.421, relevance: 'Entertainment' },
        { query: 'France', similarity: 0.389, relevance: 'Politics' },
        { query: 'Python', similarity: 0.556, relevance: 'Programming' },
        { query: 'Deep Learning', similarity: 0.627, relevance: 'AI/ML' }
    ];

    container.innerHTML = `
        <div class="ir-performance">
            <h4>Query Performance Results</h4>
            <div class="performance-grid">
                ${queries.map(item => `
                    <div class="query-result">
                        <div class="query-text">"${item.query}"</div>
                        <div class="similarity-score">
                            <div class="score-bar" style="width: ${item.similarity * 100}%"></div>
                            <span class="score-value">${item.similarity.toFixed(3)}</span>
                        </div>
                        <div class="relevance-domain">${item.relevance}</div>
                    </div>
                `).join('')}
            </div>
            <div class="performance-summary">
                <p><strong>System Performance:</strong> Precision: 55.6%, Recall: 83.3%, F1-Score: 66.7%</p>
                <p><strong>Best Performance:</strong> Technical queries (Python, Deep Learning) show highest similarity</p>
            </div>
        </div>
    `;
}

// Confusion Matrix Visualization
function createConfusionMatrix() {
    const container = document.getElementById('confusion-matrix');
    if (!container) return;

    const matrix = [
        [2, 1, 0], // Predicted Positive
        [1, 1, 1], // Predicted Negative  
        [0, 0, 0]  // Predicted Neutral
    ];

    const labels = ['Positive', 'Negative', 'Neutral'];

    container.innerHTML = `
        <div class="confusion-matrix">
            <h4>Classification Confusion Matrix</h4>
            <table class="matrix-table">
                <thead>
                    <tr>
                        <th></th>
                        <th colspan="3">Predicted</th>
                    </tr>
                    <tr>
                        <th>Actual</th>
                        ${labels.map(label => `<th>${label}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${matrix.map((row, i) => `
                        <tr>
                            <th>${labels[i]}</th>
                            ${row.map((cell, j) => `
                                <td class="matrix-cell ${cell > 0 ? 'has-value' : ''}" 
                                    style="background-color: rgba(76, 175, 80, ${cell * 0.3})">
                                    ${cell}
                                </td>
                            `).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="matrix-analysis">
                <p><strong>Accuracy:</strong> 40% (2/5 correct predictions)</p>
                <p><strong>Challenge:</strong> Distinguishing positive vs negative emotions</p>
            </div>
        </div>
    `;
}

// Initialize all visualizations when page loads
document.addEventListener('DOMContentLoaded', function() {
    createEmotionPieChart();
    createLengthHistogram();
    createROUGEScores();
    createIRPerformance();
    createConfusionMatrix();
});

// Export functions for use in other scripts
window.NLPVisualizations = {
    createEmotionPieChart,
    createLengthHistogram,
    createROUGEScores,
    createIRPerformance,
    createConfusionMatrix
};
