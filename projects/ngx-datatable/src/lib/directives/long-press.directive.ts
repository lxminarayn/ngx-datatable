import {
  booleanAttribute,
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  numberAttribute,
  OnDestroy,
  Output
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TableColumn } from '../types/table-column.type';

@Directive({
  selector: '[long-press]',
  standalone: true
})
export class LongPressDirective implements OnDestroy {
  @Input({ transform: booleanAttribute }) pressEnabled = true;
  @Input() pressModel: TableColumn;
  @Input({ transform: numberAttribute }) duration = 500;

  @Output() longPressStart = new EventEmitter<{ event: MouseEvent; model: TableColumn }>();
  @Output() longPressing = new EventEmitter<{ event: MouseEvent; model: TableColumn }>();
  @Output() longPressEnd = new EventEmitter<{ model: TableColumn }>();

  pressing: boolean;
  isLongPressing: boolean;
  timeout: any;
  mouseX = 0;
  mouseY = 0;

  subscription: Subscription;

  @HostBinding('class.press')
  get press(): boolean {
    return this.pressing;
  }

  @HostBinding('class.longpress')
  get isLongPress(): boolean {
    return this.isLongPressing;
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    // don't do right/middle clicks
    if (event.which !== 1 || !this.pressEnabled) {
      return;
    }

    // don't start drag if its on resize handle
    const target = event.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      return;
    }

    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    this.pressing = true;
    this.isLongPressing = false;

    const mouseup = fromEvent(document, 'mouseup');
    this.subscription = mouseup.subscribe(() => this.onMouseup());

    this.timeout = setTimeout(() => {
      this.isLongPressing = true;
      this.longPressStart.emit({
        event,
        model: this.pressModel
      });

      this.subscription.add(
        fromEvent<MouseEvent>(document, 'mousemove')
          .pipe(takeUntil(mouseup))
          .subscribe(mouseEvent => this.onMouseMove(mouseEvent))
      );

      this.loop(event);
    }, this.duration);

    this.loop(event);
  }

  onMouseMove(event: MouseEvent): void {
    if (this.pressing && !this.isLongPressing) {
      const xThres = Math.abs(event.clientX - this.mouseX) > 10;
      const yThres = Math.abs(event.clientY - this.mouseY) > 10;

      if (xThres || yThres) {
        this.endPress();
      }
    }
  }

  loop(event: MouseEvent): void {
    if (this.isLongPressing) {
      this.timeout = setTimeout(() => {
        this.longPressing.emit({
          event,
          model: this.pressModel
        });
        this.loop(event);
      }, 50);
    }
  }

  endPress(): void {
    clearTimeout(this.timeout);
    this.isLongPressing = false;
    this.pressing = false;
    this._destroySubscription();

    this.longPressEnd.emit({
      model: this.pressModel
    });
  }

  onMouseup(): void {
    this.endPress();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeout);
    this._destroySubscription();
  }

  private _destroySubscription(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
  }
}
