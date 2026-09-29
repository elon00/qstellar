/**
 * QSTELLAR CONWAY AUTOMATON ENGINE
 * 
 * Multi-State Cellular Automaton for Agentic Financial Networks:
 * Maps cellular automata state transitions directly to the autonomous agent workflow:
 * - 0: DEAD / OFFLINE (Inactive agent node)
 * - 1: IDLE (Connected to Stellar RPC, awaiting task)
 * - 2: ACTIVE (LLM reasoning / Raven MCP tool invocation)
 * - 3: PAYING (Initiating x402 micropayment / Soroban authorization)
 * - 4: VERIFYING (CAP-0087 ML-DSA-65 or ZK proof verification)
 * - 5: FAILED / TIMEOUT (Gas exhaustion or signature rejection)
 */

export const AGENT_STATES = {
  DEAD: 0,
  IDLE: 1,
  ACTIVE: 2,
  PAYING: 3,
  VERIFYING: 4,
  FAILED: 5,
};

export const STATE_NAMES = {
  0: 'DEAD',
  1: 'IDLE',
  2: 'ACTIVE',
  3: 'PAYING',
  4: 'VERIFYING',
  5: 'FAILED',
};

export const STATE_COLORS = {
  0: '#1a1f2c', // Dark Charcoal/Navy
  1: '#3b82f6', // Stellar Blue
  2: '#10b981', // Emerald Active
  3: '#f59e0b', // Amber x402 Payment
  4: '#8b5cf6', // Violet PQC Verification
  5: '#ef4444', // Red Alert
};

export class AgentCellularAutomaton {
  constructor(width = 32, height = 32, density = 0.25) {
    this.width = width;
    this.height = height;
    this.generation = 0;
    this.totalTransactionsSettled = 0;
    this.grid = new Uint8Array(width * height);
    this.balanceGrid = new Float32Array(width * height); // Micro-token liquidity per node

    this.initializeRandom(density);
  }

  getIndex(x, y) {
    const wx = (x + this.width) % this.width;
    const wy = (y + this.height) % this.height;
    return wy * this.width + wx;
  }

  initializeRandom(density = 0.25) {
    for (let i = 0; i < this.grid.length; i++) {
      if (Math.random() < density) {
        // Distribute initial states
        const rand = Math.random();
        if (rand < 0.6) this.grid[i] = AGENT_STATES.IDLE;
        else if (rand < 0.85) this.grid[i] = AGENT_STATES.ACTIVE;
        else this.grid[i] = AGENT_STATES.VERIFYING;
        this.balanceGrid[i] = 10 + Math.random() * 50; // Initial QST allowance
      } else {
        this.grid[i] = AGENT_STATES.DEAD;
        this.balanceGrid[i] = 0;
      }
    }
  }

  countNeighbors(x, y) {
    const counts = { [AGENT_STATES.DEAD]: 0, [AGENT_STATES.IDLE]: 0, [AGENT_STATES.ACTIVE]: 0, [AGENT_STATES.PAYING]: 0, [AGENT_STATES.VERIFYING]: 0, [AGENT_STATES.FAILED]: 0, aliveTotal: 0 };

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const state = this.grid[this.getIndex(x + dx, y + dy)];
        counts[state] = (counts[state] || 0) + 1;
        if (state !== AGENT_STATES.DEAD) counts.aliveTotal++;
      }
    }
    return counts;
  }

  /**
   * Advance one simulation tick
   */
  step() {
    const nextGrid = new Uint8Array(this.grid.length);
    const nextBalance = new Float32Array(this.balanceGrid);

    let stepTransactions = 0;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = this.getIndex(x, y);
        const state = this.grid[idx];
        const n = this.countNeighbors(x, y);

        switch (state) {
          case AGENT_STATES.DEAD:
            // Agent Spawning Rule: 3 active or idle neighbors awaken a dormant agent
            if (n.aliveTotal === 3) {
              nextGrid[idx] = AGENT_STATES.IDLE;
              nextBalance[idx] = 15.0; // initial stake
            } else {
              nextGrid[idx] = AGENT_STATES.DEAD;
            }
            break;

          case AGENT_STATES.IDLE:
            // Underpopulation or overpopulation
            if (n.aliveTotal < 2 || n.aliveTotal > 4) {
              nextGrid[idx] = AGENT_STATES.DEAD;
            } else if (n[AGENT_STATES.ACTIVE] >= 2) {
              // Triggered into action by active collaborating agents
              nextGrid[idx] = AGENT_STATES.ACTIVE;
            } else {
              nextGrid[idx] = AGENT_STATES.IDLE;
            }
            break;

          case AGENT_STATES.ACTIVE:
            // Active reasoning transitions to x402 payment execution
            if (nextBalance[idx] >= 1.0) {
              nextGrid[idx] = AGENT_STATES.PAYING;
              nextBalance[idx] -= 0.5; // Micropayment fee
            } else {
              nextGrid[idx] = AGENT_STATES.FAILED; // Insufficient balance
            }
            break;

          case AGENT_STATES.PAYING:
            // x402 payment moves to PQC / Soroban verification
            nextGrid[idx] = AGENT_STATES.VERIFYING;
            stepTransactions++;
            break;

          case AGENT_STATES.VERIFYING:
            // Verification completes: agent receives reward and returns to idle
            nextGrid[idx] = AGENT_STATES.IDLE;
            nextBalance[idx] += 1.2; // Service revenue
            break;

          case AGENT_STATES.FAILED:
            // FAILED node recovers to IDLE if helped by 2+ neighbor nodes
            if (n[AGENT_STATES.IDLE] >= 2) {
              nextGrid[idx] = AGENT_STATES.IDLE;
              nextBalance[idx] = 5.0;
            } else {
              nextGrid[idx] = AGENT_STATES.DEAD;
            }
            break;

          default:
            nextGrid[idx] = AGENT_STATES.DEAD;
        }
      }
    }

    this.grid = nextGrid;
    this.balanceGrid = nextBalance;
    this.generation++;
    this.totalTransactionsSettled += stepTransactions;

    return this.getTelemetry();
  }

  /**
   * Inject transaction pulse into center coordinates
   */
  injectPaymentPulse(cx = Math.floor(this.width / 2), cy = Math.floor(this.height / 2)) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const idx = this.getIndex(cx + dx, cy + dy);
        this.grid[idx] = AGENT_STATES.PAYING;
        this.balanceGrid[idx] += 10.0;
      }
    }
  }

  getTelemetry() {
    const stateCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalLiquidity = 0;

    for (let i = 0; i < this.grid.length; i++) {
      stateCounts[this.grid[i]] = (stateCounts[this.grid[i]] || 0) + 1;
      totalLiquidity += this.balanceGrid[i];
    }

    const totalCells = this.grid.length;
    const activeAgents = totalCells - stateCounts[0];

    return {
      generation: this.generation,
      totalCells,
      activeAgents,
      settledTransactions: this.totalTransactionsSettled,
      totalLiquidity: Math.round(totalLiquidity * 100) / 100,
      breakdown: {
        idle: stateCounts[1],
        active: stateCounts[2],
        paying: stateCounts[3],
        verifying: stateCounts[4],
        failed: stateCounts[5],
        dead: stateCounts[0],
      },
      healthRatio: activeAgents > 0 ? (stateCounts[1] + stateCounts[2] + stateCounts[4]) / activeAgents : 0,
    };
  }
}
