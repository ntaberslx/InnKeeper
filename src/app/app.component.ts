import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import {Hotkey, HotkeysService} from 'angular2-hotkeys';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {toInteger} from '@ng-bootstrap/ng-bootstrap/util/util';

class Actor {
  public id: number;
  public name: string;
  public roll: number;
  public hp: number;
  public maxHP: number;
  public entente: string;
  public mod: string;

  constructor(name: string, roll: number, hp: number, maxHP: number, entente: string, mod: string) {
    this.name = name;
    this.roll = roll;
    this.hp = hp;
    this.maxHP = maxHP;
    this.entente = entente;
    this.mod = mod;

    this.id = new Date().getTime() + Math.floor(Math.random() * Math.floor(999999999));
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
      return AppComponent.d20plus(+rollOrMod);
    } else {
      return +rollOrMod;
    }
  }

  buildActor(name: string, rollOrMod: string, hp: string, maxHP: string, entente: string, id: number): void {
    let a;
    a = this.actorMap.get(id);
    if (entente === 'f' || entente === 'F') {
      entente = 'Friendly';
    } else if (entente === 'e' || entente === 'E') {
      entente = 'Enemy';
    } else if (entente === '') {
      entente = 'Unaligned';
    }
    if (a) {
      a.name = name;
      if (a.mod !== (rollOrMod.indexOf('+') === 0 || rollOrMod.indexOf('-') === 0 ? rollOrMod : null)) {
        a.roll = AppComponent.getRoll(rollOrMod);
      }
      a.hp = hp;
      a.maxHP = maxHP;
      a.entente = entente === '' ? 'Unaligned' : entente;
      if (a.mod !== (rollOrMod.indexOf('+') === 0 || rollOrMod.indexOf('-') === 0 ? rollOrMod : null)) {
        a.mod = rollOrMod.indexOf('+') === 0 || rollOrMod.indexOf('-') === 0 ? rollOrMod : null;
      }
      this.sortIntoInit(a);
    } else {
      let multiplier = +name.substr(name.indexOf(' x ') + 3);
      if (!multiplier) {
        multiplier = 1;
      }
      for (let i = 0; i < multiplier; i++) {
        a = new Actor(
          name.indexOf(' x ') !== -1 ? name.substr(0, name.indexOf(' x ')) + (' ' + (i + 1)) : name,
          AppComponent.getRoll(rollOrMod),
          hp === '' ? 0 : +hp,
          maxHP === '' ? 1 : +maxHP,
          entente,
          rollOrMod.indexOf('+') === 0 || rollOrMod.indexOf('-') === 0 ? rollOrMod : null
        );
        this.sortIntoInit(a);
      }
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
    for (const actor of this.actorArray) {
      if (actor.mod) {
        actor.roll = AppComponent.d20plus(+actor.mod);
      }
    }
    this.round = 1;
    this.actorMap.get(-1).name = 'Round 1 Ends';
  }

  modHP(actor: Actor, mod: number) {
    actor.hp = (+actor.hp) + mod;
    this.save();
  }

  sortIntoInit(a: Actor) {
    for (let i = this.actorArray.length - 1; i >= 0; i--) {
      const check = this.actorArray[i];
      const prev = this.actorArray[i + 1 === this.actorArray.length ? 0 : i + 1];
      if (i === 0) {
        if (check.roll <= a.roll) {
          this.actorArray.unshift(a);
          return;
        } else {
          this.actorArray.splice( i + 1, 0, a );
          return;
        }
      } else if (check.roll >= a.roll && prev.roll < a.roll) {
        this.actorArray.splice( i + 1, 0, a );
        return;
      }
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
    this.ententes.sort();
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
