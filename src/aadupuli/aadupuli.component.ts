import { Component, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { AadupuliBoard, PersistData, PersistDataAadupuli, PersistDataStats, PersistDataSettings } from './aadupuli.model';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbActiveModal, NgbModal, NgbModalRef, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { WindowRef } from './windowref.service';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { isBoolean } from 'util';

@Component({
  selector: 'aadupuli-root',
  templateUrl: './aadupuli.component.html',
  styleUrls: ['./aadupuli.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class AadupuliComponent {

  constructor( private modalService: NgbModal, private _sanitizer: DomSanitizer, private winRef: WindowRef, private http: Http ) { }

  @ViewChild('popupConfirm') private popupConfirm;
  @ViewChild('popupSettings') private popupSettings;
  @ViewChild('popupHighscore') private popupHighscore;
  @ViewChild('popupHelp') private popupHelp;
  @ViewChild('popupTutorial') private popupTutorial;
  @ViewChild('aadupuliBoardImage') private aadupuliBoardImage:ElementRef;

  private createArray(arrLength){
    let arrTemp = new Array(arrLength || 0);
    for(var i = 0; i < arrLength; i++){
      arrTemp[i] = new Array(arrLength || 0);
    }
    return arrTemp;
  }

  private getRandom(min, max){
    return Math.floor(Math.random()*(max-min+1))+min;
  }

	private lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    let ua:number;
    let ub:number;
    let denom:number = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
		if (denom == 0) {
			return null;
		}
		ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
		ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
		return {
			x: Math.round(x1 + ua * (x2 - x1)),
			y: Math.round(y1 + ua * (y2 - y1)),
			seg1: ua >= 0 && ua <= 1,
			seg2: ub >= 0 && ub <= 1
		};
  }

	private dynamicSort(property) {
		let sortOrder:number = 1;
		if(property[0] === "-") {
			sortOrder = -1;
			property = property.substr(1);
		}
		return function (a,b) {
			let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
			return result * sortOrder;
		}
	}

	private dynamicSortMultiple(...args:any[]) {
    let props = args;
		return (obj1, obj2) => {
      let i:number = 0;
      let result:number = 0;
      let numberOfProperties:number = props.length;
			while(result === 0 && i < numberOfProperties) {
				result = this.dynamicSort(props[i])(obj1, obj2);
				i++;
			}
			return result;
		}
  }
  
  EMPTY:number = 0;
  SHEEP:number = 1;
  TIGER:number = 2;
  KILL_WEIGHTAGE_PRIMARY:number = 2;
  MOVE_WEIGHTAGE_PRIMARY:number = 1;
  KILL_WEIGHTAGE_SECONDARY:number = 0.5;
  MOVE_WEIGHTAGE_SECONDARY:number = 0.5;
  SHEEP_LOST:string = "SHEEP_LOST";
  TIGER_LOST:string = "TIGER_LOST";
	
  appTitle:string = "Aadupuli";
  appVersion:string = "1.0";

  persistData:PersistData = null;
  
  aadupuliOriginalWidth:number = 450;
  jumpPointOriginalSize:number = 25;
  aadupuliBoardWidth:number;
  aadupuliBoardRatio:number;
  intersectPoints:any[];
  aadupuliMarkPoints:any[];
  aadupuliJumpPoints:any[];

  aadupuliBoardNames = ["Aadupuli", "Bhag Chal"];
  aadupuliBoardSize:number[] = [23, 25];
  aadupuliSheepCount:number[] = [15, 20];
  aadupuliTigerCount:number[] = [3, 4];
  aadupuliTigerPositions:number[][] = [[0, 3, 4], [0, 4, 20, 24]];
  aadupuliBoardLines = 
	[
		[
      {
        x1: 65, y1: 405, x2: 385, y2: 405
      }, {
        x1: 65, y1: 405, x2: 225, y2: 45
      }, {
        x1: 225, y1: 45, x2: 385, y2: 405
      }, {
        x1: 225, y1: 45, x2: 165, y2: 405
      }, {
        x1: 225, y1: 45, x2: 285, y2: 405
      }, {
        x1: 55, y1: 285, x2: 395, y2: 285
      }, {
        x1: 115, y1: 165, x2: 335, y2: 165
      }, {
        x1: 85, y1: 225, x2: 365, y2: 225
      }, {
        x1: 335, y1: 165, x2: 395, y2: 285
      }, {
        x1: 115, y1: 165, x2: 55, y2: 285
      }
    ],
		[
      {
        x1:325, y1:25, x2:325, y2:425
      }, {
        x1:25, y1:225, x2:425, y2:225
      }, {
        x1:225, y1:25, x2:225, y2:425
      }, {
        x1:25, y1:425, x2:425, y2:25
      }, {
        x1:25, y1:25, x2:425, y2:425
      }, {
        x1:25, y1:325, x2:425, y2:325
      }, {
        x1:25, y1:125, x2:425, y2:125
      }, {
        x1:225, y1:25, x2:25, y2:225
      }, {
        x1:225, y1:25, x2:425, y2:225
      }, {
        x1:25, y1:225, x2:225, y2:425
      }, {
        x1:225, y1:425, x2:425, y2:225
      }, {
        x1:25, y1:25, x2:425, y2:25
      }, {
        x1:125, y1:25, x2:125, y2:425
      }, {
        x1:25, y1:25, x2:25, y2:425
      }, {
        x1:25, y1:425, x2:425, y2:425
      }, {
        x1:425, y1:25, x2:425, y2:425
      }
    ]
  ];
  aadupuliValidMoves =
	[
		[
			[2, 3, 4, 5],
			[2, 7],
			[0, 1, 3, 8],
			[0, 2, 4, 9],
			[0, 3, 5, 10],
			[0, 4, 6, 11],
			[5, 12],
			[1, 8, 13],
			[2, 7, 9, 14],
			[3, 8, 10, 15],
			[4, 9, 11, 16],
			[5, 10, 12, 17],
			[6, 11, 18],
			[7, 14],
			[8, 13, 15, 19],
			[9, 14, 16, 20],
			[10, 15, 17, 21],
			[11, 16, 18, 22],
			[12, 17],
			[14, 20],
			[15, 19, 21],
			[16, 20, 22],
			[17, 21]
		],
		[
			[]
		]
  ];
  aadupuliKillMoves =
	[
		[
      [[2, 8], [3, 9], [4, 10], [5, 11]],
      [[2, 3], [7, 13]],
      [[3, 4], [8, 14]],
      [[2, 1], [4, 5], [9, 15]],
      [[3, 2], [5, 6], [10, 16]],
      [[4, 3], [11, 17]],
      [[5, 4], [12, 18]],
      [[8, 9]],
      [[2, 0], [14, 19], [9, 10]],
      [[3, 0], [8, 7], [10, 11], [15, 20]],
      [[4, 0], [9, 8], [11, 12], [16, 21]],
      [[5, 0], [10, 9], [17, 22]],
      [11, 10],
      [[7, 1], [14, 15]],
      [[8, 2], [15, 16]],
      [[9, 3], [14, 13], [16, 17]],
      [[10, 4], [15, 14], [17, 18]],
      [[11, 5], [16, 15]],
      [[12, 6], [17, 16]],
      [[14, 8], [20, 21]],
      [[15, 9], [21, 22]],
      [[16, 10], [20, 19]],
      [[17, 11], [21, 20]]
		],
		[
			[]
		]
	];
  aadupuliBoard:AadupuliBoard = new AadupuliBoard();
  aadupuliSelectedPoint:number = null;
  aadupuliTargetPoint:number = null;
  aadupuliSize:number;

  aadupuliCanControl:number;
  aadupuliStarted:boolean = false;
  aadupuliComplete:boolean = false;
  aadupuliLost:boolean = false;
  isTigerThinking:boolean = false;
  isTigerLost:boolean = false;
  sheepKillPosition:number = null;
  flashCurrentLocation:boolean = false;
  aadupuliMessage:string = "";
  aadupuliPopupMessage:string = "";
  aadupuliTigerJump:any = {};

  settings:PersistDataSettings = new PersistDataSettings();
  showDifficulty:boolean = false;
  newHighscore:boolean = false;
  openPopup:NgbModalRef = null;

  ngOnInit() {
    this.aadupuliBoardWidth = this.aadupuliBoardImage.nativeElement.clientWidth;
    this.aadupuliBoardRatio = this.aadupuliBoardWidth / this.aadupuliOriginalWidth;
    this.loadPersistData();
    this.initAadupuli();
  }

  loadPersistData() {
    if (this.winRef.nativeWindow.AppInventor) {
      this.persistData = JSON.parse(this.winRef.nativeWindow.AppInventor.getWebViewString());
    } else {
      this.persistData = JSON.parse(localStorage.getItem("aadupuliPersist"));
    }
    if(this.persistData === null)
      this.persistData = new PersistData();

    if(this.persistData !== null) {
      if(this.persistData.inProgress.aadupuli !== null) {
        this.aadupuliBoard = this.persistData.inProgress.aadupuli;
      }
    }
  }

  savePersistData(saveGrid:boolean = true) {
    if(saveGrid) {
      if(this.persistData.inProgress.aadupuli === null)
        this.persistData.inProgress.aadupuli = new AadupuliBoard();
      this.persistData.inProgress.aadupuli = this.aadupuliBoard;
    }
    if (this.winRef.nativeWindow.AppInventor) {
      this.winRef.nativeWindow.AppInventor.setWebViewString(JSON.stringify(this.persistData));
    } else {
      localStorage.setItem("aadupuliPersist", JSON.stringify(this.persistData));
    }
    // this.loadPersistData();
  }

  initAadupuli() {
    if(this.persistData !== null && this.persistData.inProgress.aadupuli !== null) {
      this.aadupuliBoard = this.persistData.inProgress.aadupuli;
    } else {
      this.aadupuliBoard = new AadupuliBoard();
      this.aadupuliStarted = false;
      this.aadupuliLost = false;
      this.flashCurrentLocation = false;
    }
    this.aadupuliComplete = false;
    this.aadupuliMessage = "";
    this.aadupuliPopupMessage = "";
    this.settings.player === 0 ? this.aadupuliCanControl = this.SHEEP : this.aadupuliCanControl = this.TIGER;

    this.resizeViewport();

    if(this.persistData !== null) {
      this.aadupuliStarted = false;
      let isNewGame = true;
      if(this.persistData.inProgress.aadupuli.goatsPlaced > 0) {
        this.aadupuliStarted = true;
        isNewGame = false;
      }
      if(!isNewGame) {
        let moveWeightage = this.computeTigerMovePrimary();
        let checkResult = this.checkAadupuli(moveWeightage);
        if (!isBoolean(checkResult)) {
          this.aadupuliComplete = true;
          this.aadupuliStarted = false;
          this.newHighscore = true;
          if(checkResult === this.TIGER_LOST) {
            this.isTigerLost = true
          }
          this.showHurrah();
        }
      }
    }
    
    if(this.persistData.inProgress.aadupuli.aadupuli.length === 0) {
      this.startNewAadupuli();
    } else {
      this.findIntersectPoints();
    }
  }

  startNewAadupuli() {
    if(this.aadupuliStarted) {
      this.aadupuliPopupMessage = "Start new Aadupuli ?";
      this.modalService.open(this.popupConfirm, {}).result.then (
        (result) => {
          this.persistData.aadupuliStats.played[this.settings.board][0]++;
          this.persistData.inProgress = new PersistDataAadupuli();
          this.initBoard();
          this.aadupuliStarted = false;
          this.isTigerLost = false;
          this.savePersistData(true);
        },
        (reason) => {
        }
      )
    } else {
      this.persistData.inProgress = new PersistDataAadupuli();
      this.initBoard();
      this.aadupuliStarted = false;
      this.savePersistData(false);
    }
  }

  initBoard(setupBoard:boolean = true) {
    this.aadupuliMarkPoints = [];
    this.aadupuliJumpPoints = [];
    this.aadupuliTigerJump = {};
    this.sheepKillPosition = null;
    this.isTigerLost = false;
    this.sheepKillPosition = null;
    this.flashCurrentLocation = false;
    this.aadupuliMessage = "";
    this.aadupuliPopupMessage = "";
    this.aadupuliTigerJump = {};
    this.aadupuliComplete = false;
    this.aadupuliBoard = new AadupuliBoard();
    for(let i = 0; i < this.aadupuliBoardSize[this.settings.board]; i++) {
      this.aadupuliBoard.aadupuli[i] = this.EMPTY;
    }
    for(let i = 0; i < this.aadupuliTigerPositions[this.settings.board].length; i++) {
      this.aadupuliBoard.aadupuli[this.aadupuliTigerPositions[this.settings.board][i]] = this.TIGER;
    }
    this.persistData.inProgress.aadupuli = this.aadupuliBoard;

    if (setupBoard)
      this.findIntersectPoints();
  }

  findIntersectPoints() {
    this.intersectPoints = [];
    for(var i = 0; i <= this.aadupuliBoardLines[this.settings.board].length; i++) {
			for(var j = i + 1; j < this.aadupuliBoardLines[this.settings.board].length; j++) {
				var intersect = this.lineIntersect(this.aadupuliBoardLines[this.settings.board][i].x1, this.aadupuliBoardLines[this.settings.board][i].y1, this.aadupuliBoardLines[this.settings.board][i].x2, this.aadupuliBoardLines[this.settings.board][i].y2,
												this.aadupuliBoardLines[this.settings.board][j].x1, this.aadupuliBoardLines[this.settings.board][j].y1, this.aadupuliBoardLines[this.settings.board][j].x2, this.aadupuliBoardLines[this.settings.board][j].y2);

				if(intersect && (intersect.x >= 0 && intersect.x * this.aadupuliBoardRatio <= this.aadupuliBoardWidth && intersect.y >= 0 && intersect.y * this.aadupuliBoardRatio <= this.aadupuliBoardWidth)) {
					if(this.intersectPoints.filter((e) => { return e.x === intersect.x && e.y === intersect.y }).length === 0)
            this.intersectPoints.push(intersect);
				}
			}
		}
    this.intersectPoints.sort(this.dynamicSortMultiple('y', 'x'));
    this.generateIntersectPoints();
  }

  generateIntersectPoints() {
    this.aadupuliMarkPoints = [];
    this.aadupuliJumpPoints = [];

		for(let i = 0; i < this.intersectPoints.length; i++) {
      let intersect = this.intersectPoints[i];
      let markPoint = {};
      let jumpPoint = {};
      markPoint["id"] = `markPoint-${i}`;
      markPoint["class"] = this.settings.background ? 'circle-bg' : 'circle-color';
      markPoint["left"] = Math.round(intersect.x) * this.aadupuliBoardRatio;
      markPoint["top"] = Math.round(intersect.y) * this.aadupuliBoardRatio;
      markPoint["width"] = this.jumpPointOriginalSize * this.aadupuliBoardRatio;
      markPoint["height"] = this.jumpPointOriginalSize * this.aadupuliBoardRatio;
      markPoint["marginLeft"] = -1 * (this.jumpPointOriginalSize * this.aadupuliBoardRatio / 2);
      markPoint["marginTop"] = -1 * (this.jumpPointOriginalSize * this.aadupuliBoardRatio / 2);

      jumpPoint["id"] = `jumpPoint-${i}`;
      jumpPoint["class"] = 'aadupuli-token';
      jumpPoint["left"] = Math.round(intersect.x) * this.aadupuliBoardRatio + 3;
      jumpPoint["top"] = Math.round(intersect.y) * this.aadupuliBoardRatio + 3;
      jumpPoint["width"] = this.jumpPointOriginalSize * this.aadupuliBoardRatio + 5;
      jumpPoint["height"] = this.jumpPointOriginalSize * this.aadupuliBoardRatio + 5;
      jumpPoint["marginLeft"] = -1 * ((this.jumpPointOriginalSize  * this.aadupuliBoardRatio + 5) / 2) - 3;
      jumpPoint["marginTop"] = -1 * ((this.jumpPointOriginalSize * this.aadupuliBoardRatio + 5) / 2) - 3;

      this.aadupuliMarkPoints.push(markPoint);
      this.aadupuliJumpPoints.push(jumpPoint);
    }
  }

  handleJumpPointSelect(selectedPoint) {
    if(this.aadupuliComplete) {
      return;
    }
    if(this.aadupuliSelectedPoint === selectedPoint) { // Unselect already selected position
      this.aadupuliSelectedPoint = null;
    } else if(this.aadupuliSelectedPoint === null) { // Handle sheep place
      if(this.aadupuliBoard.aadupuli[selectedPoint] === 0 && this.aadupuliBoard.goatsPlaced < this.aadupuliSheepCount[this.aadupuliBoard.board]) { // Place new sheep
        this.aadupuliBoard.goatsPlaced++;
        this.aadupuliSelectedPoint = selectedPoint;
        this.handleJumpPointTargetSheep(this.aadupuliSelectedPoint);
      } else if(this.aadupuliBoard.aadupuli[selectedPoint] === this.aadupuliCanControl
          && this.aadupuliBoard.goatsPlaced === this.aadupuliSheepCount[this.aadupuliBoard.board]) { // Select existing sheep
        this.aadupuliSelectedPoint = selectedPoint;
      }
    }  else if(this.aadupuliBoard.aadupuli[selectedPoint] === this.aadupuliCanControl && this.aadupuliSelectedPoint !== null) { // Change selected sheep
      this.aadupuliSelectedPoint = selectedPoint;
    }  else if(this.aadupuliBoard.aadupuli[selectedPoint] === this.EMPTY && this.aadupuliSelectedPoint !== null) { // Handle jump target
      this.handleJumpPointTargetSheep(selectedPoint);
    }
    this.savePersistData();
  }

  handleJumpPointTargetSheep(targetPoint) {
    let validMoves = this.aadupuliValidMoves[this.aadupuliBoard.board][this.aadupuliSelectedPoint];
    if(validMoves.includes(targetPoint) || this.aadupuliSelectedPoint == targetPoint) {
      this.aadupuliTigerJump = {};
      this.aadupuliBoard.aadupuli[this.aadupuliSelectedPoint] = this.EMPTY;
      this.aadupuliBoard.aadupuli[targetPoint] = this.SHEEP;
      this.aadupuliSelectedPoint = null;
      this.aadupuliStarted = true;
      this.savePersistData();

      let moveWeightage = this.computeTigerMovePrimary();
      let checkResult = this.checkAadupuli(moveWeightage);
      if (!isBoolean(checkResult)) {
        this.aadupuliComplete = true;
        this.aadupuliStarted = false;
        this.newHighscore = true;
        this.persistData.aadupuliStats.played[this.settings.board][0]++;
        if(checkResult === this.TIGER_LOST) {
          this.isTigerLost = true
          this.persistData.aadupuliStats.won[this.settings.board][0]++;
        }
        this.showHurrah();
      } else {
        this.handleTigerMove();
      }
    }
  }

  handleTigerMove() {
    let moveWeightage;
    let selectedJumpPoint = null;
    let tigerPositions = this.getTigerPositions();
    moveWeightage = this.computeTigerMovePrimary()
    let checkResult = this.checkAadupuli(moveWeightage);
    if (isBoolean(checkResult) && checkResult) {
      moveWeightage = this.computeTigerMoveSecondary(moveWeightage);
      moveWeightage = this.sortMoveWeightage(moveWeightage);
      selectedJumpPoint = this.computeMaxWeightage(moveWeightage);
      selectedJumpPoint.tigerPosition = tigerPositions[selectedJumpPoint.tigerPosition];
      this.handleJumpPointTargetTiger(selectedJumpPoint);
    } else {
      this.aadupuliComplete = true;
      this.aadupuliStarted = false;
      if(checkResult === this.TIGER_LOST) {
        this.isTigerLost = true
      }
    }
  }

  handleJumpPointTargetTiger(targetPoint) {
    this.sheepKillPosition = null;
    if(targetPoint.jumpPoint[1] === null) { // Normal move
      this.aadupuliBoard.aadupuli[targetPoint.jumpPoint[0]] = this.TIGER;
      this.aadupuliBoard.aadupuli[targetPoint.tigerPosition] = this.EMPTY;
    } else { // Kill move
      this.aadupuliTigerJump = {
        x1: this.intersectPoints[targetPoint.tigerPosition].x * this.aadupuliBoardRatio,
        y1: this.intersectPoints[targetPoint.tigerPosition].y * this.aadupuliBoardRatio,
        x2: this.intersectPoints[targetPoint.jumpPoint[1]].x * this.aadupuliBoardRatio,
        y2: this.intersectPoints[targetPoint.jumpPoint[1]].y * this.aadupuliBoardRatio
      };
      this.aadupuliBoard.aadupuli[targetPoint.jumpPoint[1]] = this.TIGER;
      this.aadupuliBoard.aadupuli[targetPoint.jumpPoint[0]] = this.EMPTY;
      this.aadupuliBoard.aadupuli[targetPoint.tigerPosition] = this.EMPTY;
      this.aadupuliBoard.goatsRemoved++;
      this.sheepKillPosition = targetPoint.jumpPoint[0];
    }
    this.savePersistData();
    let moveWeightage = this.computeTigerMovePrimary()
    let checkResult = this.checkAadupuli(moveWeightage);
    if (!isBoolean(checkResult)) {
      this.aadupuliComplete = true;
      this.aadupuliStarted = false;
      this.newHighscore = true;
      this.persistData.aadupuliStats.played[this.settings.board][0]++;
      if(checkResult === this.TIGER_LOST) {
        this.isTigerLost = true
        this.persistData.aadupuliStats.won[this.settings.board][0]++;
      }
      this.showHurrah();
    }
  }

  getTargetPosition() {

  }

  sortMoveWeightage(moveWeightage) {
    for(let i = 0; i < moveWeightage.length; i++) {
      let movePositions = moveWeightage[i];
      movePositions.sort((a, b) => {
        return a.weightage < b.weightage ? 1 : a.weightage > b.weightage ? -1 : a.weightage === b.weightage ? 0 : null;
      });
    }
    return moveWeightage;
  }

  computeMaxWeightage(moveWeightage) {
    let maxWeightage = 0;
    let selectedTigerIndex = null;
    let selectedJumpPoint = null;
    for(let tigerPosition = 0; tigerPosition < moveWeightage.length; tigerPosition++) {
      if(moveWeightage[tigerPosition].length > 0 && moveWeightage[tigerPosition][0].weightage > maxWeightage) {
        maxWeightage = moveWeightage[tigerPosition][0].weightage
        selectedTigerIndex = tigerPosition;
        selectedJumpPoint = moveWeightage[tigerPosition][0].move;
      }
    }
    return {
      tigerPosition: selectedTigerIndex,
      jumpPoint: selectedJumpPoint
    };
  }

  getTigerPositions() {
    let tigerPositions:number[] = [];
    for(let i = 0; i < this.aadupuliBoard.aadupuli.length; i++) {
      if(this.aadupuliBoard.aadupuli[i] === this.TIGER)
        tigerPositions.push(i);
    }
    return tigerPositions;
  }

  computeTigerMovePrimary() {
    let tigerPositions = this.getTigerPositions();
    let moveWeightage:any[] = [];
    let selectedJumpPoint = null;
    this.isTigerThinking = true;
    for(let tigerPosition = 0; tigerPosition < tigerPositions.length; tigerPosition++) {
      moveWeightage[tigerPosition] = [];
      let killMoves:any = this.aadupuliKillMoves[this.aadupuliBoard.board][tigerPositions[tigerPosition]];
      let validMoves:any = this.aadupuliValidMoves[this.aadupuliBoard.board][tigerPositions[tigerPosition]];

      for(let killMove of killMoves) {
        if(this.aadupuliBoard.aadupuli[killMove[0]] === this.SHEEP && this.aadupuliBoard.aadupuli[killMove[1]] === this.EMPTY) {
          moveWeightage[tigerPosition].push({
            weightage: this.KILL_WEIGHTAGE_PRIMARY,
            move: killMove
          });
        }
      }

      for(let validMove of validMoves) {
        if(this.aadupuliBoard.aadupuli[validMove] === this.EMPTY) {
          moveWeightage[tigerPosition].push({
            weightage: this.MOVE_WEIGHTAGE_PRIMARY,
            move: [validMove, null]
          });
        }
      }
    }
    this.isTigerThinking = false;
    return moveWeightage;
  }

  computeTigerMoveSecondary(moveWeightage) {
    for(let tigerPosition = 0; tigerPosition < moveWeightage.length; tigerPosition++) {
      for(let avalableMove of moveWeightage[tigerPosition]) {
        let killMoves = this.aadupuliKillMoves[this.aadupuliBoard.board][avalableMove.move[0]];
        // let validMoves:any = this.aadupuliValidMoves[this.aadupuliBoard.board][avalableMove.move[0]];
        for(let killMove of killMoves) {
          if(this.aadupuliBoard.aadupuli[killMove[0]] === this.SHEEP && this.aadupuliBoard.aadupuli[killMove[1]] === this.EMPTY) {
            avalableMove.weightage+=this.KILL_WEIGHTAGE_SECONDARY;
          }
        }
        // for(let validMove of validMoves) {
        //   if(this.aadupuliBoard.aadupuli[validMove] === this.EMPTY) {
        //     avalableMove.weightage+=this.MOVE_WEIGHTAGE_SECONDARY;
        //   }
        // }
      }
    }
    return moveWeightage;
  }

  resizeViewport() {
  }

  resetStats() {
    this.persistData.aadupuliStats = new PersistDataStats();
    this.savePersistData(true);
  }

  showSettings() {
    this.openPopup = this.modalService.open(this.popupSettings, {});
  }

  showHighscore() {
    this.openPopup = this.modalService.open(this.popupHighscore, {});
  }

  showHelp() {
    this.openPopup = this.modalService.open(this.popupHelp, {});
  }

  checkAadupuli(moveWeightage:any = []) {
    // if(moveWeightage.length === 0) {
    if(this.aadupuliBoard.goatsRemoved === this.aadupuliSheepCount[this.aadupuliBoard.board]) {
      return this.SHEEP_LOST;
    } else {
      let tigerLost = moveWeightage.reduce((cumulativeValue, currentValue) => {
        return cumulativeValue && currentValue.length === 0
      }, true);
      if (tigerLost) {
        return this.TIGER_LOST;
      }
    }
    // } else {
    //   let tigerLost = moveWeightage.reduce((cumulativeValue, currentValue) => {
    //     return cumulativeValue && currentValue.length === 0
    //   }, true);
    //   if (tigerLost) {
    //     return this.TIGER_LOST;
    //   }
    // }
    return true;
  }

  getClue() {
  }

  VW2PX(VW){
    let w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0];
    let x = w.innerWidth || e.clientWidth || g.clientWidth;
    let result = (x * VW ) / 100;
    return result;
  }

  showHurrah() {
    this.newHighscore = true;
    setTimeout(() => {
      this.newHighscore = false;
    }, 5000);
  }

}
