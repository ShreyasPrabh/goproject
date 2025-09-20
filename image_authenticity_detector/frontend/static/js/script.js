// Global variables
let currentFile = null;
let analysisHistory = [];

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const analyzeBtn = document.getElementById('analyzeBtn');
const loading = document.getElementById('loading');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const historyList = document.getElementById('historyList');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadAnalysisHistory();
    checkAPIHealth();
});

// Setup event listeners
function setupEventListeners() {
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
}

// Prevent default drag behaviors
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Handle drag over
function handleDragOver(e) {
    uploadArea.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(e) {
    uploadArea.classList.remove('dragover');
}

// Handle drop
function handleDrop(e) {
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// Handle file selection
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// Handle file processing
function handleFile(file) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showError('Please select a valid image file (JPG, PNG, WEBP).');
        return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB.');
        return;
    }
    
    currentFile = file;
    displayImagePreview(file);
    analyzeBtn.disabled = false;
    hideError();
    hideResults();
}

// Display image preview
function displayImagePreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImg.src = e.target.result;
        fileName.textContent = `File: ${file.name}`;
        fileSize.textContent = `Size: ${formatFileSize(file.size)}`;
        
        uploadArea.style.display = 'none';
        imagePreview.style.display = 'block';
        imagePreview.classList.add('fade-in');
    };
    reader.readAsDataURL(file);
}

// Remove image
function removeImage() {
    currentFile = null;
    imagePreview.style.display = 'none';
    uploadArea.style.display = 'block';
    analyzeBtn.disabled = true;
    fileInput.value = '';
    hideResults();
    hideError();
}

// Clear all results and reset form
function clearResults() {
    removeImage();
    hideResults();
    hideError();
    hideLoading();
}

// Analyze image
async function analyzeImage() {
    if (!currentFile) {
        showError('Please select an image first.');
        return;
    }
    
    showLoading();
    hideResults();
    hideError();
    
    try {
        const formData = new FormData();
        formData.append('image', currentFile);
        
        const response = await fetch(`${API_BASE_URL}/analyze/`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            displayResults(data);
            loadAnalysisHistory(); // Refresh history
        } else {
            throw new Error(data.error_message || 'Analysis failed');
        }
        
    } catch (error) {
        console.error('Analysis error:', error);
        showError(`Analysis failed: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Display analysis results
function displayResults(data) {
    const results = data.results;
    
    // Update authenticity result
    const authenticityResult = document.getElementById('authenticityResult');
    const authenticityConfidence = document.getElementById('authenticityConfidence');
    const authenticityText = document.getElementById('authenticityText');
    
    authenticityResult.textContent = results.is_real ? 'REAL IMAGE' : 'AI-GENERATED/FAKE';
    authenticityResult.className = `result-value ${results.is_real ? 'real' : 'fake'}`;
    
    const realConfidence = (results.real_confidence * 100).toFixed(1);
    authenticityConfidence.style.width = `${realConfidence}%`;
    authenticityText.textContent = results.authenticity_label;
    
    // Update edit detection result
    const editResult = document.getElementById('editResult');
    const editConfidence = document.getElementById('editConfidence');
    const editText = document.getElementById('editText');
    
    if (results.is_real) {
        editResult.textContent = results.is_edited ? 'EDITED' : 'UNEDITED';
        editResult.className = `result-value ${results.is_edited ? 'edited' : 'unedited'}`;
        
        const editConf = (results.edited_confidence * 100).toFixed(1);
        editConfidence.style.width = `${editConf}%`;
        editText.textContent = results.edit_label;
    } else {
        editResult.textContent = 'N/A';
        editResult.className = 'result-value';
        editConfidence.style.width = '0%';
        editText.textContent = 'Only applicable to real images';
    }
    
    // Update detailed information
    const detailsContent = document.getElementById('detailsContent');
    detailsContent.innerHTML = `
        <div class="detail-item">
            <strong>Analysis ID:</strong> ${data.id}
        </div>
        <div class="detail-item">
            <strong>Upload Time:</strong> ${new Date(data.upload_time).toLocaleString()}
        </div>
        <div class="detail-item">
            <strong>File Name:</strong> ${data.filename}
        </div>
        <div class="detail-item">
            <strong>Real Confidence Score:</strong> ${(results.real_confidence * 100).toFixed(2)}%
        </div>
        ${results.is_real ? `
        <div class="detail-item">
            <strong>Edit Confidence Score:</strong> ${(results.edited_confidence * 100).toFixed(2)}%
        </div>
        ` : ''}
        <div class="detail-item">
            <strong>Analysis Status:</strong> ${data.status}
        </div>
    `;
    
    resultsSection.style.display = 'block';
    resultsSection.classList.add('fade-in');
}

// Load analysis history
async function loadAnalysisHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/history/`);
        if (response.ok) {
            const history = await response.json();
            displayHistory(history.slice(0, 5)); // Show last 5 analyses
        }
    } catch (error) {
        console.error('Failed to load history:', error);
    }
}

// Display analysis history
function displayHistory(history) {
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="text-center">No previous analyses found.</p>';
        return;
    }
    
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${item.filename}</strong>
                    <br>
                    <small>${new Date(item.upload_time).toLocaleString()}</small>
                </div>
                <div style="text-align: right;">
                    <span class="badge ${item.is_real ? 'real' : 'fake'}">
                        ${item.is_real ? 'Real' : 'Fake'}
                    </span>
                    ${item.is_real ? `
                    <br>
                    <span class="badge ${item.is_edited ? 'edited' : 'unedited'}">
                        ${item.is_edited ? 'Edited' : 'Unedited'}
                    </span>
                    ` : ''}
                </div>
            </div>
        `;
        historyItem.onclick = () => viewAnalysisDetails(item.id);
        historyList.appendChild(historyItem);
    });
}

// View analysis details
async function viewAnalysisDetails(analysisId) {
    try {
        const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}/`);
        if (response.ok) {
            const data = await response.json();
            alert(`Analysis Details:\n\nFile: ${data.filename}\nReal: ${data.is_real ? 'Yes' : 'No'}\nConfidence: ${(data.real_confidence * 100).toFixed(1)}%\n${data.is_real ? `Edited: ${data.is_edited ? 'Yes' : 'No'}\nEdit Confidence: ${(data.edited_confidence * 100).toFixed(1)}%` : ''}`);
        }
    } catch (error) {
        console.error('Failed to load analysis details:', error);
    }
}

// Load more history (placeholder)
function loadMoreHistory() {
    alert('Load more functionality would be implemented here.');
}

// Retry analysis
function retryAnalysis() {
    if (currentFile) {
        analyzeImage();
    } else {
        showError('No image to retry analysis.');
    }
}

// Check API health
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health/`);
        if (response.ok) {
            const data = await response.json();
            console.log('API Health:', data);
            if (data.model_status !== 'loaded') {
                showError('Warning: AI model is not loaded. Analysis may not work properly.');
            }
        }
    } catch (error) {
        console.error('API health check failed:', error);
        showError('Warning: Cannot connect to the analysis server. Please ensure the backend is running.');
    }
}

// Show loading state
function showLoading() {
    loading.style.display = 'block';
    analyzeBtn.disabled = true;
}

// Hide loading state
function hideLoading() {
    loading.style.display = 'none';
    analyzeBtn.disabled = false;
}

// Show results
function showResults() {
    resultsSection.style.display = 'block';
}

// Hide results
function hideResults() {
    resultsSection.style.display = 'none';
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
    errorSection.classList.add('fade-in');
}

// Hide error
function hideError() {
    errorSection.style.display = 'none';
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Add CSS for badges
const style = document.createElement('style');
style.textContent = `
    .badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        color: white;
    }
    .badge.real {
        background: linear-gradient(135deg, #28a745, #20c997);
    }
    .badge.fake {
        background: linear-gradient(135deg, #dc3545, #e74c3c);
    }
    .badge.edited {
        background: linear-gradient(135deg, #fd7e14, #f39c12);
    }
    .badge.unedited {
        background: linear-gradient(135deg, #17a2b8, #20c997);
    }
    .detail-item {
        margin-bottom: 10px;
        padding: 8px 0;
        border-bottom: 1px solid #e9ecef;
    }
    .detail-item:last-child {
        border-bottom: none;
    }
`;
document.head.appendChild(style);