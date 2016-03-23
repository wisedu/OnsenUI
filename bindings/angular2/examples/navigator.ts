import {
  bootstrap,
  Component,
  ViewChild,
  OnsNavigator
} from '../src/angular2-onsenui';

@Component({
  selector: 'child-component',
  template: 'This is child component'
})
class ChildComponent {
  constructor(navi: OnsNavigator) {
    console.log('this is child', navi);
  }
}

@Component({
  selector: 'ons-page',
  template: `
    <ons-toolbar>
      <div class="center">Page2</div>
    </ons-toolbar>
    <div class="page__background"></div>
    <div class="page__content" no-status-bar-fill>
      <div style="text-align: center; margin: 10px">
        <ons-button (click)="push()">push</ons-button>
        <p>page2</p>
      </div>
    </div>
  `
})
export class PageComponent {
  constructor(private _navigator: OnsNavigator) {
  }

  push() {
    this._navigator.pushComponent(PageComponent);
  }
}

@Component({
  selector: 'my-app',
  directives: [OnsNavigator, ChildComponent],
  template: `
  <ons-navigator>
    <ons-page _compiled class="page hoge" #aaa>
      <ons-toolbar>
        <div class="center">Page</div>
      </ons-toolbar>
      <div class="page__background"></div>
      <div class="page__content" no-status-bar-fill>
        <div style="text-align: center; margin: 10px">
          <ons-button (click)="push()">push</ons-button>
        </div>
      </div>
    </ons-page>
  </ons-navigator>
  `
})
export class AppComponent {
  @ViewChild(OnsNavigator) navigator: OnsNavigator

  constructor() {

  }

  push() {
    this.navigator.pushComponent(PageComponent);
  }
}

bootstrap(AppComponent);