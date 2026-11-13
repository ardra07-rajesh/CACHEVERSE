# CACHEVERSE
## Intelligent Memory Architecture Studio

CACHEVERSE is a browser-based Computer Organization and Architecture project for exploring cache memory, mapping techniques, replacement policies, address decomposition, memory hierarchy and performance.

### Run the website

**Option 1: Open directly**
1. Extract `CACHEVERSE.zip`.
2. Open the `CACHEVERSE` folder.
3. Double-click `index.html`.
4. Use the left navigation to explore the modules.

**Option 2: Run with VS Code Live Server**
1. Open the extracted folder in Visual Studio Code.
2. Install the Live Server extension if you do not already have it.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

No backend, API key, database server or npm installation is required. The simulation engine runs locally in JavaScript. Google Fonts are loaded from the internet; the application uses fallback fonts if offline.

### Modules
- Overview dashboard with live session metrics
- Cache simulator: direct, fully associative and set associative mapping
- FIFO, LRU and Random replacement
- Address mapping and binary decomposition
- Memory hierarchy explorer
- AMAT calculator
- Workload generator, locality profile and CSV import
- Cache capacity benchmark and CSV export
- Local experiment history using browser localStorage
- COA learning centre

### Simulation assumptions
- Addresses are byte addresses.
- Cache capacity and block size determine the number of cache lines.
- Direct mapping uses one way per set.
- Fully associative mapping uses one set containing all cache lines.
- Set associative mapping uses the selected number of ways.
- The cache starts empty for each run.
- The simulator uses write-allocate-like block loading for read references; write policies are outside this project's current scope.
- AMAT in the benchmark is an illustrative simplified model: `1 ns + miss rate × 80 ns`.
- The standalone AMAT calculator uses the formula: `Hit time + (Miss rate × Miss penalty)`.
- Random replacement is intentionally nondeterministic.

### Project structure
```text
CACHEVERSE/
├── index.html
├── README.md
├── assets/
│   └── cacheverse-reference.png
├── css/
│   └── styles.css
└── js/
    ├── engine.js
    └── app.js
```

### Data and privacy
Experiments are stored in the current browser's localStorage. Clearing browser site data may remove saved experiments. No user data is sent to a server.

### Academic note
This is an educational cache model, not a cycle-accurate CPU simulator. Typical memory capacities and latency descriptions in the hierarchy explorer are illustrative ranges and vary by processor and system.
