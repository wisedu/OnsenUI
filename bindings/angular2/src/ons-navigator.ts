import {
  Component,
  DynamicComponentLoader,
  Injector,
  Directive,
  ElementRef,
  Type,
  Compiler,
  provide,
  NgZone,
  AppViewManager,
  Renderer,
  ResolvedProvider,
  Input
} from 'angular2/core';

declare class NavigatorElement {
  public pushPage(page: string);
};

@Directive({
  selector: 'ons-navigator > ons-page'
})
export class OnsNavigator {
  private _navigator: NavigatorElement;
  private _providers: ResolvedProvider[];

  constructor(private _elementRef: ElementRef, private _compiler: Compiler, private _viewManager: AppViewManager) {
    this._navigator = _elementRef.nativeElement;
    this._providers = Injector.resolve([
      provide(OnsNavigator, {useValue: this})
    ]);
  }

  /**
   * @method pushComponent
   * @signature pushComponent(type: Type, params: Object = {})
   * @param {Type} type
   * @param {Object} params
   */
  pushComponent(type: Type, params: Object = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loadPageComponent(type, params, result => {
        resolve(result);
      });
    });
  }

  private loadPageComponent(type: Type, params: Object, done: Function): void {
    this._compiler.compileInHost(type).then(hostProtoViewRef => {
      const location = this._elementRef;
      const viewContainer = this._viewManager.getViewContainer(location);
      const hostViewRef = viewContainer.createHostView(hostProtoViewRef, viewContainer.length, this._providers);
      const elementRef = this._viewManager.getHostElement(hostViewRef);
      const component = this._viewManager.getComponent(elementRef);

      const dispose = () => {
        const index = viewContainer.indexOf(hostViewRef);
        if (!hostViewRef.destroyed && index !== -1) {
          viewContainer.remove(index);
        }
      };

      done({elementRef, component, type, dispose, params});
    });
  }

  popComponent(): Promise<any> {
    // TODO: implement
    return Promise.reject(null);
  }
}
