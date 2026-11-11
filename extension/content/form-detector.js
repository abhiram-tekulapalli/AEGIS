/**
 * Form Detector Module
 * Scans document forms for editable controls (input, textarea, select, file)
 * and extracts associated labels, placeholders, aria properties, and CSS selectors.
 */

export class FormDetector {
  detectFormFields() {
    const fields = [];
    const elements = document.querySelectorAll(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'
    );

    elements.forEach((el, index) => {
      // Don't skip hidden inputs if they have a name/id or are file inputs
      if (el.getAttribute('type') === 'hidden' && !el.id && !el.getAttribute('name')) return;

      const id = el.id || `field-${index}`;
      const selector = this.getUniqueSelector(el);
      const name = el.getAttribute('name') || id;
      const label = this.getAssociatedLabel(el);
      const placeholder = el.getAttribute('placeholder') || '';
      const ariaLabel = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || '';
      const type = this.normalizeFieldType(el);
      const required = el.hasAttribute('required') || el.getAttribute('aria-required') === 'true';

      let options = undefined;
      if (el.tagName === 'SELECT') {
        options = Array.from(el.options)
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
        currentValue: el.value || '',
        ariaLabel,
      });
    });

    return fields;
  }

  normalizeFieldType(el) {
    const tag = el.tagName.toUpperCase();
    if (tag === 'TEXTAREA') return 'textarea';
    if (tag === 'SELECT') return 'select';
    
    if (tag === 'INPUT') {
      const type = (el.getAttribute('type') || 'text').toLowerCase();
      if (['text', 'email', 'tel', 'file', 'radio', 'checkbox'].includes(type)) {
        return type;
      }
    }
    return 'text';
  }

  getAssociatedLabel(el) {
    if (el.id) {
      const labelEl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (labelEl && labelEl.textContent && labelEl.textContent.trim()) {
        return labelEl.textContent.trim();
      }
    }

    const parentLabel = el.closest('label');
    if (parentLabel && parentLabel.textContent && parentLabel.textContent.trim()) {
      const text = parentLabel.innerText.replace(el.innerText || '', '').trim();
      if (text) return text;
    }

    const prev = el.previousElementSibling;
    if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || prev.tagName === 'DIV')) {
      if (prev.textContent && prev.textContent.trim() && prev.textContent.trim().length < 80) {
        return prev.textContent.trim();
      }
    }

    return el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.getAttribute('name') || '';
  }

  getUniqueSelector(el) {
    if (el.id) return `#${CSS.escape(el.id)}`;
    if (el.getAttribute('name')) return `[name="${CSS.escape(el.getAttribute('name'))}"]`;
    
    const tag = el.tagName.toLowerCase();
    const parent = el.parentElement;
    if (!parent) return tag;
    
    const children = Array.from(parent.children);
    const index = children.indexOf(el);
    return `${tag}:nth-child(${index + 1})`;
  }
}

export const formDetector = new FormDetector();
