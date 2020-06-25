import { ITypeArg, IType, TypeKinds } from '../../ast';
import assertNever from '../../utils/assertNever';

export default function compactTypeArgs(args: ITypeArg[]): unknown[] {
  return args.map((arg) => ({ ...arg, type: compactType(arg.type) }));
}

function compactType(type: IType): unknown {
  switch (type.kind) {
    case TypeKinds.BOOLEAN:
    case TypeKinds.NUMBER:
    case TypeKinds.STRING:
      return type.defaults === undefined ? type.kind : type;
    case TypeKinds.DATE:
      if (type.defaults === undefined) { return TypeKinds.DATE; }
      return { kind: type.kind, defaults: type.defaults.getTime() };
    case TypeKinds.NULL: return TypeKinds.NULL;
    case TypeKinds.ARRAY: return { ...type, type: compactType(type.type) };
    case TypeKinds.RECORD:
      return {
        ...type,
        props: type.props.map((x) => ({ ...x, type: compactType(x.type) })),
      };
    default: return assertNever('IType', type);
  }
}
