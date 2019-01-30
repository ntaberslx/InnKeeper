import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import {Hotkey, HotkeysService} from 'angular2-hotkeys';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

class Actor {
  name: string;
  roll: number;
  hp: number;
  size: number;
  entente: string;

  constructor(name: string, roll: number, hp: number, size: number, entente: string) {
    this.name = name;
    this.roll = roll;
    this.hp = hp;
    this.size = size;
    this.entente = entente;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  title = 'Your Friendly Local Inn(itiative) Keeper';
  constructor(private _hotkeysService: HotkeysService, private modalService: NgbModal) {

    this._hotkeysService.add(new Hotkey('?', (event: KeyboardEvent): boolean => {
      console.log('dunno');
      return false;
    }));
    this._hotkeysService.add(new Hotkey(['shift+right', 'n'], (event: KeyboardEvent): boolean => {
      console.log('next init');
      return false;
    }));
    this._hotkeysService.add(new Hotkey(['shift+left', 'p'], (event: KeyboardEvent): boolean => {
      console.log('previous init');
      return false;
    }));
    this._hotkeysService.add(new Hotkey(['shift+up', 'space'], (event: KeyboardEvent): boolean => {
      console.log('new init');
      this.addActorModal(this.modalTemplate);
      return false;
    }));
    this._hotkeysService.add(new Hotkey(['shift+down', 'd'], (event: KeyboardEvent): boolean => {
      console.log('dealing damage');
      return false;
    }));
  }

  @ViewChild('newInit') modalTemplate: ElementRef;
  private colorScheme = [
    'FF6542', '564154', '88498F', '779FA1', 'E0CBA8'
  ];
  public actorArray;
  // public actorEntenteArray;
  public trashBin;

  buildActor(name: string, rollOrMod: string, hp: string, size: string, entente: string): void {
    this.actorArray.push(new Actor(
      name,
      this.getRoll(rollOrMod),
      hp === '' ? 0 : +hp,
      size === '' ? 1 : +size,
      entente
    ));
    this.actorArray.sort(this.sortByInit);
  }

  addActorModal(content): void {
    this.modalService.open(content, { centered: true });
  }

  editActorModal(actor) {
    console.log(actor);
  }

  getRoll(rollOrMod: string): number {
    if (rollOrMod === '') {
      return this.d20();
    } else if (rollOrMod.indexOf('+') !== -1 || rollOrMod.indexOf('-') !== -1) {
      return this.d20plus(+rollOrMod.substr(1, rollOrMod.length));
    } else {
      return +rollOrMod;
    }
  }

  sortByInit(actorA, actorB) {
    return actorB.roll - actorA.roll;
  }

  d20plus(modifier: number): number {
    return this.d20() + modifier;
  }

  d20(): number {
    return this.getRngInteger(1, 20);
  }

  getRngInteger(min, max): number {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }

  ngOnInit(): void {
    this.actorArray = [];
    this.trashBin = [];
  }

  getColor(i) {
    if (i >= this.colorScheme.length) {
      return {
        'background-color' : '#' + this.colorScheme[this.colorScheme.length - 1]
      };
    } else {
      return {
        'background-color': '#' + this.colorScheme[i]
      };
    }
  }
}
