import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFieldComponent),
      multi: true,
    },
  ],
  template: `
    <div class="form-field">
      @if (label) {
        <label class="field-label" [for]="inputId">{{ label }}</label>
      }
      @if (type === 'textarea') {
        <textarea
          [id]="inputId"
          class="field-input"
          [placeholder]="placeholder"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          [rows]="rows"
          [disabled]="disabled"
        ></textarea>
      } @else {
        <input
          [id]="inputId"
          [type]="type"
          class="field-input"
          [placeholder]="placeholder"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          [disabled]="disabled"
        />
      }
      @if (error) {
        <span class="field-error">{{ error }}</span>
      }
    </div>
  `,
  styles: [`
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .field-label {
      font-size: var(--text-label);
      font-weight: 600;
      color: var(--color-ink);
    }
    .field-input {
      font-family: var(--font-primary);
      font-size: var(--text-body);
      padding: 10px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-bg);
      color: var(--color-ink);
      outline: none;
      transition: border-color 150ms, box-shadow 150ms;
      width: 100%;
    }
    .field-input:focus {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px var(--color-accent-muted);
    }
    .field-input::placeholder {
      color: var(--color-ink-tertiary);
    }
    textarea.field-input {
      resize: vertical;
      min-height: 80px;
    }
    .field-error {
      font-size: var(--text-caption);
      color: var(--color-danger);
    }
  `],
})
export class FormFieldComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'textarea' | 'number' = 'text';
  @Input() error = '';
  @Input() rows = 3;
  @Input() inputId = '';

  protected value = '';
  protected disabled = false;

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string): void {
    this.value = val ?? '';
  }
  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  protected onInput(event: Event): void {
    const el = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value = el.value;
    this.onChange(this.value);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
