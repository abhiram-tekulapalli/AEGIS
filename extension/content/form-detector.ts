import { DetectedFormField } from '../../shared/types';

/**
 * Form Detector Module
 * Scans document forms for editable controls (input, textarea, select, file)
 * and extracts associated labels, placeholders, aria properties, and CSS selectors.
 */

export class FormDetector {
  public detectFormFields(): DetectedFormField[] {
    const fields: DetectedFormField[] = [];
    const elements = document.querySelectorAll<HTMLElement>(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'
    );

    elements.forEach((el, index) => {
      // Ignore hidden or non-visible elements
      if (el.offsetWidth === 0 && el.offsetHeight === 0) return;

      const id = el.id || `field-${index}`;
      const selector = this.getUniqueSelector(el);
      const name = el.getAttribute('name') || id;
      const label = this.getAssociatedLabel(el);
      const placeholder = el.getAttribute('placeholder') || '';
      const ariaLabel = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || '';
      const type = this.normalizeFieldType(el);
      const required = el.hasAttribute('required') || el.getAttribute('aria-required') === 'true';

      let options: string[] | undefined = undefined;
      if (el.tagName === 'SELECT') {
        const selectEl = el as HTMLSelectElement;
        options = Array.from(selectEl.options)
          .map(opt => opt.text.trim())
          .filter(t => t.length > 0 && !t.toLowerCase().includes('select'));
      }

      fields.push({
        id,
        selector,
        name,
        label: label || name || `Field ${index + 1}`,
        placeholder,
        type,
        required,
        options,
        currentValue: (el as HTMLInputElement).value || '',
        ariaLabel,
      });
    });

    return fields;
  }

  private normalizeFieldType(el: HTMLElement): DetectedFormField['type'] {
    const tag = el.tagName.toUpperCase();
    if (tag === 'TEXTAREA') return 'textarea';
    if (tag === 'SELECT') return 'select';
    
    if (tag === 'INPUT') {
      const type = (el.getAttribute('type') || 'text').toLowerCase();
      if (['text', 'email', 'tel', 'file', 'radio', 'checkbox'].includes(type)) {
        return type as DetectedFormField['type'];
      }
    }
    return 'text';
  }

  private getAssociatedLabel(el: HTMLElement): string {
    // 1. Check for explicit <label for="id">
    if (el.id) {
      const labelEl = document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(el.id)}"]`);
      if (labelEl && labelEl.textContent?.trim()) {
        return labelEl.textContent.trim();
      }
    }

    // 2. Check enclosing <label>
    const parentLabel = el.closest('label');
    if (parentLabel && parentLabel.textContent?.trim()) {
      // Strip out child element values
      const text = parentLabel.innerText.replace(el.innerText || '', '').trim();
      if (text) return text;
    }

    // 3. Check preceding element label
    const prev = el.previousElementSibling;
    if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || prev.tagName === 'DIV')) {
      if (prev.textContent?.trim() && prev.textContent.trim().length < 80) {
        return prev.textContent.trim();
      }
    }

    // 4. Check aria-label / placeholder
    return el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.getAttribute('name') || '';
  }

  private getUniqueSelector(el: HTMLElement): string {
    if (el.id) return `#${CSS.escape(el.id)}`;
    if (el.getAttribute('name')) return `[name="${CSS.escape(el.getAttribute('name')!)}"]`;
    
    const tag = el.tagName.toLowerCase();
    const parent = el.parentElement;
    if (!parent) return tag;
    
    const children = Array.from(parent.children);
    const index = children.indexOf(el);
    return `${tag}:nth-child(${index + 1})`;
  }
}

export const formDetector = new FormDetector();
