/**
 * Number Game core functionality
 * Handles game logic, node generation, and interaction
 */

/**
 * Generate a random integer between min (inclusive) and max (exclusive)
 * @param {number} min - The minimum value (inclusive)
 * @param {number} max - The maximum value (exclusive)
 * @returns {number} A random integer
 */
function randint(min, max) {
    let result;
    result = parseInt(Math.random() * 10000000) % (max - min) + min;
    return result;
}

/**
 * Get the current boundary condition mode
 * @returns {boolean} True for periodic boundary, false for fixed boundary
 */
function getPeOrFix() {
    return Boolean(+$('.btn-on').attr('status'));
}

/**
 * Check if all nodes have the same value (win condition)
 * @returns {boolean} True if all nodes have the same value, false otherwise
 */
function check() {
    let nodes = $('.node');
    console.log(nodes.length);
    let first = parseInt($(nodes[0]).val());
    for (let i = 0; i < nodes.length; i++) {
        console.log(parseInt($(nodes[i]).val()));
        if (first != parseInt($(nodes[i]).val())) {
            return false;
        }
    }

    return true;
}

/**
 * Clear all nodes from the game board
 */
function clear() {
    $('.node').remove();
}

/**
 * Get neighboring nodes for a given node in 2D grid
 * @param {number} index - The index of the node
 * @param {number} rows - Number of rows in the grid
 * @param {number} cols - Number of columns in the grid
 * @param {boolean} peOrFix - Boundary condition (true for periodic, false for fixed)
 * @returns {Array<number>} Array of neighbor indices
 */
function getTheNeighbors(index, rows, cols, peOrFix) {
    let neighbors = [];
    let row = Math.floor(index / cols);
    let col = index % cols;

    // Top neighbor
    if (row > 0) {
        neighbors.push((row - 1) * cols + col);
    }
    
    // Bottom neighbor
    if (row < rows - 1) {
        neighbors.push((row + 1) * cols + col);
    }
    
    // Left neighbor
    if (col > 0) {
        neighbors.push(row * cols + (col - 1));
    }
    
    // Right neighbor
    if (col < cols - 1) {
        neighbors.push(row * cols + (col + 1));
    }
    
    // Handle periodic boundary conditions if enabled
    if (peOrFix) {
        // If no top neighbor, add bottom row equivalent
        if (row === 0) {
            neighbors.push((rows - 1) * cols + col);
        }
        
        // If no bottom neighbor, add top row equivalent
        if (row === rows - 1) {
            neighbors.push(col);
        }
        
        // If no left neighbor, add right edge equivalent
        if (col === 0) {
            neighbors.push(row * cols + (cols - 1));
        }
        
        // If no right neighbor, add left edge equivalent
        if (col === cols - 1) {
            neighbors.push(row * cols);
        }
    }
    
    return neighbors;
}

/**
 * Process node click in 1D mode
 * Updates clicked node and its neighbors
 * @param {HTMLElement} _this - The clicked node element
 * @param {number} numberOfNodes - Total number of nodes
 */
function process_1d(_this, numberOfNodes) {
    let inNodeIndex = +$(_this).attr('ptr');
    let maxValue = parseInt(document.getElementById('ns-setting').value);
    $(_this).val(($(_this).val()) % 3 + 1);

    if (getPeOrFix()) {
        // Periodic boundary - always get left and right neighbors
        let na = $('.node')[(inNodeIndex - 1 + numberOfNodes) % numberOfNodes];
        let nb = $('.node')[(inNodeIndex + 1 + numberOfNodes) % numberOfNodes];

        $(na).val(($(na).val()) % maxValue + 1);
        $(nb).val(($(nb).val()) % maxValue + 1);
    } else {
        // Fixed boundary - check edge cases
        if (inNodeIndex == 0) {
            // First node - only has right neighbor
            let nb = $('.node')[inNodeIndex + 1];
            $(nb).val(($(nb).val()) % maxValue + 1);
        } else if (inNodeIndex == numberOfNodes - 1) {
            // Last node - only has left neighbor
            let na = $('.node')[inNodeIndex - 1];
            $(na).val(($(na).val()) % maxValue + 1);
        } else {
            // Middle nodes - have both left and right neighbors
            let na = $('.node')[(inNodeIndex - 1 + numberOfNodes) % numberOfNodes];
            let nb = $('.node')[(inNodeIndex + 1 + numberOfNodes) % numberOfNodes];

            $(na).val(($(na).val()) % maxValue + 1);
            $(nb).val(($(nb).val()) % maxValue + 1);
        }
    }

    // Check for win condition
    if (check()) {
        setTimeout(function() {
            // Victory handling is now managed by the success modal
        }, 100);
    }
}

/**
 * Process node click in 2D mode
 * Updates clicked node and its neighbors
 * @param {HTMLElement} _this - The clicked node element
 * @param {number} rows - Number of rows in the grid
 * @param {number} cols - Number of columns in the grid
 */
function process_2d(_this, rows, cols) {
    let inNodeIndex = +$(_this).attr('ptr');
    const maxValue = parseInt(document.getElementById('ns-setting').value);
    $(_this).val(($(_this).val()) % maxValue + 1);

    // Get and update all neighboring nodes
    let neighbors = getTheNeighbors(inNodeIndex, rows, cols, getPeOrFix());
    for (let i = 0; i < neighbors.length; i++) {
        let neighbor = $('.node')[neighbors[i]];
        $(neighbor).val(($(neighbor).val()) % maxValue + 1);
    }

    // Check for win condition
    if (check()) {
        setTimeout(function() {
            // Victory handling is now managed by the success modal
        });
    }
}

/**
 * Generate game nodes based on current settings
 * Creates either 1D or 2D game board
 */
function generate() {
    const numberOfNodes = parseInt($(".settings-number-input").val()); // nodes
    const dims = parseInt(document.querySelector('.btn-dimension').getAttribute('status')); // dimension
    const rows = parseInt(document.getElementById('rows-setting').value);
    const cols = parseInt(document.getElementById('cols-setting').value);
    const maxValue = parseInt(document.getElementById('ns-setting').value);
    console.log(numberOfNodes, dims, rows, cols, maxValue);

    if (dims == 1) {
        // Generate 1D game board
        for (let i = 0; i < numberOfNodes; i++) {
            $(".display-field-node-box").append('<input type="button" class="node" value="1" ptr = "' + i + '">');
            let inNode = $('.node')[i];
            $(inNode).val(randint(1, maxValue + 1));
        }
    } else if (dims == 2) {
        // Configure grid layout for 2D mode
        $(".display-field-node-box").css({
            'display': 'grid',
            'grid-template-columns': `repeat(${cols}, 1fr)`,
            'grid-template-rows': `repeat(${rows}, 1fr)`,
            'gap': '10px',  // Smaller gap for more compact nodes
            'justify-content': 'center', // Horizontal center
            'align-items': 'center',     // Vertical center
            'justify-items': 'center',   // Center items in cells
            'align-content': 'center',   // Center grid vertically
            'margin': '0 auto',          // Center container horizontally
            'max-width': `${cols * 60}px` // Limit max width to prevent spreading on large screens
        });
        
        // Generate 2D game board
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                // Calculate unique node index
                const index = i * cols + j;
                // Add node with row and column information
                $(".display-field-node-box").append('<input type="button" class="node" value="1" ptr="' + index + '" row="' + i + '" col="' + j + '">');
                // Get the newly added node
                let inNode = $('.node').last();
                $(inNode).val(randint(1, maxValue + 1));
            }
        }
    } else {
        console.error("Error: Invalid dimension setting!");
    }
    console.log($('.node'));
    
    // Add click event handlers to all nodes
    $(".node").click(
        function() {
            if (dims == 1) {
                process_1d(this, numberOfNodes);
            } else if (dims == 2) {
                process_2d(this, rows, cols);
            } else {
                console.error("Error: Invalid dimension setting!");
            }
        }
    );
}

// Set up refresh button click handler
$(".settings-number-refresh").click(
    function() {
        if (false) {
            window.alert("Please enter less number(must less than 20)!");
        } else {
            clear();
            generate();
        }
    }
);

// Initialize game on page load
generate();