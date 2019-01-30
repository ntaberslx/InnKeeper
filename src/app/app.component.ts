import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import {Hotkey, HotkeysService} from 'angular2-hotkeys';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

class Stat {
  name: string;
  value: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }

  setValue (value: number) {
    this.value = value;
  }
}

class Actor {
  name: string;

  constructor(name: string) {
    this.name = name;
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
      this.addActor(this.modalTemplate);
      return false;
    }));
    this._hotkeysService.add(new Hotkey(['shift+down', 'd'], (event: KeyboardEvent): boolean => {
      console.log('dealing damage');
      return false;
    }));
  }

  @ViewChild('content') modalTemplate: ElementRef;
  public actorArray;
  public friendlyArray;
  public enemyArray;
  public trashBin;

  addActor(content): void {
    this.modalService.open(content, { centered: true });
  }

  d20plus(modifier: number): number {
    return this.getRngInteger(1, 20) + modifier;
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
}
