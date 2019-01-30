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
    'FF6542', '88498F', '4281A4', '62B6CB', '779FA1', 'E0CBA8'
  ];
  public actorArray;
  public actorMap;
  // public actorEntenteArray;

  buildActor(name: string, rollOrMod: string, hp: string, size: string, entente: string, id: string): void {
    console.log(this.actorMap);
    let a;
    if (id === '') {
      a = new Actor(
        name,
        this.getRoll(rollOrMod),
        hp === '' ? 0 : +hp,
        size === '' ? 1 : +size,
        entente
      );
    } else {
      a = this.actorMap.get(id);
      a.name = name;
      a.roll = this.getRoll(rollOrMod);
      a.hp = hp;
      a.size = size;
      a.entente = entente;
    }

    this.actorMap.set(a.id, a);
    this.actorArray.push(a);
    this.actorArray.sort(this.sortByInit);
    this.save();
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

  removeInit(id: number) {
    for (const actor of this.actorArray) {
      if (id === actor.id) {
        this.actorArray = this.actorArray.filter(function(ele) {
          return ele.id !== id;
        });
      }
    }
    this.save();
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

  save() {
    const data = JSON.stringify({
      'actorArray' : JSON.stringify(this.actorArray)
    });
    console.log('data' + data);
    localStorage.setItem('InnKeepersBrew', data);
  }

  ngOnInit(): void {
    this.actorMap = new Map();
    this.actorArray = [];
    const storage = JSON.parse(localStorage.getItem('InnKeepersBrew'));
    if (storage !== '' && storage) {
      this.actorArray = <[]> JSON.parse(storage.actorArray);
      if (this.actorArray) {
        for (const actor of this.actorArray) {
          this.actorMap.set(actor.id, actor);
        }
      }
    }
  }
}
