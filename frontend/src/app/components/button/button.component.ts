import { Component, input, Input, OnInit, output, signal } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent implements OnInit {
  cssClasses = signal<string[]>([]);

  label = input<string>('Button');
  type = input<'button' | 'submit'>('button');
  buttonStyle = input<'filled' | 'outlined'>('filled');
  borderRadius = input<
    'br-full' | 'br-light' | 'br-none' | 'br-full-right' | 'br-full-left'
  >('br-full');
  bgColor = input<string>('var(--color-primary)');
  @Input() textColor: string =
    this.buttonStyle() === 'outlined' ? 'var(--color-primary)' : '#fff';
  size = input<'x-small' | 'small' | 'medium' | 'large'>('medium');
  disabled = input<boolean>(false);

  ngOnInit(): void {
    this.cssClasses.set([
      'button',
      this.buttonStyle(),
      this.borderRadius(),
      this.size(),
    ]);
  }

  onClick = output<MouseEvent>();

  handleClick(e: MouseEvent) {
    if (this.disabled()) {
      e.preventDefault();
      return;
    }

    this.onClick.emit(e);
  }
}
