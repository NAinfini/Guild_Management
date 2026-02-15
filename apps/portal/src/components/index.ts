export * from './button';
export * from './input';
export * from './feedback';
export * from './layout';
export * from './navigation';
export * from './data-display';
export * from './primitives/themed-controls';

/**
 * Rework component access from the root barrel.
 * Keep legacy exports untouched while exposing new primitive components behind explicit aliases.
 */
export * as Primitives from './primitives';
export {
  Avatar as PrimitiveAvatar,
  Badge as PrimitiveBadge,
  Button as PrimitiveButton,
  Card as PrimitiveCard,
  CardContent as PrimitiveCardContent,
  CardFooter as PrimitiveCardFooter,
  CardHeader as PrimitiveCardHeader,
  Checkbox as PrimitiveCheckbox,
  Code as PrimitiveCode,
  Dialog as PrimitiveDialog,
  DialogContent as PrimitiveDialogContent,
  DialogDescription as PrimitiveDialogDescription,
  DialogFooter as PrimitiveDialogFooter,
  DialogHeader as PrimitiveDialogHeader,
  DialogTitle as PrimitiveDialogTitle,
  DialogTrigger as PrimitiveDialogTrigger,
  Heading as PrimitiveHeading,
  Input as PrimitiveInput,
  Label as PrimitiveLabel,
  Select as PrimitiveSelect,
  SelectContent as PrimitiveSelectContent,
  SelectItem as PrimitiveSelectItem,
  SelectSearch as PrimitiveSelectSearch,
  SelectTrigger as PrimitiveSelectTrigger,
  SelectValue as PrimitiveSelectValue,
  Skeleton as PrimitiveSkeleton,
  Switch as PrimitiveSwitch,
  Text as PrimitiveText,
} from './primitives';
