import { IContext } from '../parse/faces';
import { createDisabled } from '../astUtils';

/**
 * <div x-disabled>
 */
export default function processDisabled({ directives }: IContext): void {
  directives.disabled = createDisabled();
}
