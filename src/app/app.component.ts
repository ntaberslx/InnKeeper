import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import {Hotkey, HotkeysService} from 'angular2-hotkeys';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

class Actor {
  public id: number;
  public name: string;
  public roll: number;
  public hp: number;
  public size: number;
  public entente: string;

  constructor(name: string, roll: number, hp: number, size: number, entente: string) {
    this.name = name;
    this.roll = roll;
    this.hp = hp;
    this.size = size;
    this.entente = entente;

    this.id = new Date().getTime();
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  constructor(private _hotkeysService: HotkeysService, private modalService: NgbModal) {
    this._hotkeysService.add(new Hotkey('?', (/*event: KeyboardEvent*/): boolean => {
      console.log('dunno');
      return false;
    }));
    this._hotkeysService.add(new Hotkey(['right', 'd'], (/*event: KeyboardEvent*/): boolean => {
      this.next();
      console.log('next');
      return false;
    }));
    this._hotkeysService.add(new Hotkey(['left', 'a'], (/*event: KeyboardEvent*/): boolean => {
      this.previous();
      console.log('previous');
      return false;
    }));
    this._hotkeysService.add(new Hotkey(['up', 'space', 'w'], (/*event: KeyboardEvent*/): boolean => {
      console.log('new');
      this.addActorModal(this.modalTemplate);
      return false;
    }));
    this._hotkeysService.add(new Hotkey(['down', 's'], (/*event: KeyboardEvent*/): boolean => {
      console.log('damage');
      return false;
    }));
  }
  title = 'Your Friendly Local Inn(itiative) Keeper';

  @ViewChild('initModal') modalTemplate: ElementRef;
  private colorScheme = [
    '#FF6542', '#88498F', '#4281A4', '#62B6CB', '#779FA1', '#E0CBA8'
  ];
  public actorArray;
  public actorMap;
  public round: number;
  public modalContent: Actor;
  public ententes: string[];

  static sortNewEncounter(actorA, actorB) {
    return actorB.roll - actorA.roll;
  }

  static getRngInteger(min, max): number {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }

  static d20(): number {
    return AppComponent.getRngInteger(1, 20);
  }

  static d20plus(modifier: number): number {
    return AppComponent.d20() + modifier;
  }

  static getRoll(rollOrMod: string): number {
    if (rollOrMod === '') {
      return AppComponent.d20();
    } else if (rollOrMod.indexOf('+') !== -1 || rollOrMod.indexOf('-') !== -1) {
      return AppComponent.d20plus(+rollOrMod.substr(1, rollOrMod.length));
    } else {
      return +rollOrMod;
    }
  }

  buildActor(name: string, rollOrMod: string, hp: string, size: string, entente: string, id: number): void {
    let a;
    a = this.actorMap.get(id);
    if (a) {
      a.name = name;
      a.roll = AppComponent.getRoll(rollOrMod);
      a.hp = hp;
      a.size = size;
      a.entente = entente === '' ? 'Unaligned' : entente;
    } else {
      a = new Actor(
        name,
        AppComponent.getRoll(rollOrMod),
        hp === '' ? 0 : +hp,
        size === '' ? 1 : +size,
        entente === '' ? 'Unaligned' : entente
      );
      this.sortIntoInit(a);
    }
    this.makeEntentes();
    this.actorMap.set(a.id, a);
    this.save();
  }

  addActorModal(content): void {
    this.modalContent = new Actor(
      null,
      null,
      null,
      null,
      null);
    this.modalService.open(content, { centered: true });
  }

  editActorModal(content, actor) {
    this.modalContent = actor;
    this.modalService.open(content, { centered: true });
  }

  resetEncounter() {
    this.actorArray.sort(AppComponent.sortNewEncounter);
    this.round = 1;
    this.actorArray[this.actorArray.length - 1].name = 'Round 1 Ends';
  }

  sortIntoInit(a: Actor) {
    let index = -1;
    for (let i = 0; i < this.actorArray.length; i++) {
      if (index === -1) {
        if (i === 0) {
          if (a.roll > this.actorArray[i].roll) {
            index = i;
          }
        } else if (i === this.actorArray.length) {
          index = i;
        } else if (this.actorArray[i - 1].roll >= a.roll && a.roll >= this.actorArray[i].roll) {
          index = i - 1;
        }
      }
    }
    if (index === -1) {
      this.actorArray.unshift(a);
    } else if (index === this.actorArray.length) {
      this.actorArray.push(a);
    } else {
      this.actorArray.splice( index, 0, a );
    }
  }

  previous(): void {
    const a = this.actorArray.pop();
    this.actorArray.unshift(a);
  }

  next(): void {
    const a = this.actorArray.shift();
    if (a.id === -1) {
      this.round ++;
      a.name = 'Round ' + this.round + ' Ends';
    }
    this.actorArray.push(a);
  }

  removeInit(id: number) {
    for (const actor of this.actorArray) {
      if (id === actor.id) {
        this.actorArray = this.actorArray.filter(function (ele) {
          return ele.id !== id;
        });
      }
    }
    this.makeEntentes();
    this.save();
  }

  makeEntentes() {
    this.ententes.length = 0;
    for (const actor of this.actorArray) {
      if (actor.id !== -1 && !this.ententes.includes(actor.entente)) {
        this.ententes.push(actor.entente);
      }
    }
  }

  getColor(i) {
    if (i >= this.colorScheme.length) {
      return {
        'background-color' : this.colorScheme[this.colorScheme.length - 1]
      };
    } else {
      return {
        'background-color': this.colorScheme[i]
      };
    }
  }

  getRoundEnd() {
    const a = new Actor(
      'Round ' + this.round + ' Ends',
      0,
      null,
      null,
      null
    );
    a.id = -1;
    return a;
  }

  save() {
    const data = JSON.stringify({
      actorArray : JSON.stringify(this.actorArray),
      ententes: JSON.stringify(this.ententes)
    });
    localStorage.setItem('InnKeepersBrew', data);
  }

  ngOnInit(): void {
    this.actorMap = new Map();
    this.actorArray = [];
    this.ententes = [];
    const storage = JSON.parse(localStorage.getItem('InnKeepersBrew'));
    if (storage !== '' && storage) {
      this.actorArray = <[]> JSON.parse(storage.actorArray);
      if (this.actorArray) {
        for (const actor of this.actorArray) {
          this.actorMap.set(actor.id, actor);
        }
      }
      this.ententes = <string[]> JSON.parse(storage.ententes);
    }
    if (this.actorArray.length === 0) {
      this.round = 1;
      this.actorArray.push(this.getRoundEnd());
      console.log(this.actorArray);
    } else {
      for (const actor of this.actorArray) {
        if (actor.id === -1) {
          this.round = <number> actor.name.substr(6, 1);
        }
      }
    }
  }
}
