export class AadupuliBoard {
	constructor (
		public board ?: number,
		public player ?: number,
		public aadupuli ?: number[],
		public movesDone ?: number,
		public goatsPlaced ?: number,
		public goatsRemoved ?: number
	) {
		this.board = 0;
		this.player = 0;
		this.aadupuli = [];
		this.movesDone = 0;
		this.goatsPlaced = 0;
		this.goatsRemoved = 0;
	}
}

export class PersistData {
	constructor (
		public player ?: number,
		public inProgress ?: PersistDataAadupuli,
		public aadupuliStats ?: PersistDataStats,
		public aadipuliSettings ?: PersistDataSettings
	) {
		this.player = 0;
		this.inProgress = new PersistDataAadupuli();
		this.aadupuliStats = new PersistDataStats();
		this.aadipuliSettings = new PersistDataSettings();
	}
}

export class PersistDataAadupuli {
	constructor (
		public aadupuli ?: AadupuliBoard
	) {
		this.aadupuli = new AadupuliBoard();
	}
}

export class PersistDataStats {
	constructor (
		public played ?: number[][],
		public won ?: number[][]
	) {
		this.played = [[0, 0, 0], [0, 0, 0]];
		this.won = [[0, 0, 0], [0, 0, 0]];
	}
}

export class PersistDataSettings {
	constructor (
		public board ?: number,
		public player ?: number,
		public playerName ?: string,
		public background ?: boolean
	) {
		this.board = 0;
		this.player = 0;
		this.playerName = "Player";
		this.background = false;
	}
}
