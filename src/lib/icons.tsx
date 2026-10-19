import type { LucideIcon, LucideProps } from 'lucide-react';
import {
  Anchor,
  Award,
  Bird,
  BookOpen,
  Brain,
  Cloud,
  Clover,
  Compass,
  Ear,
  Eye,
  Feather,
  Flower,
  Flower2,
  HandHeart,
  Heart,
  HeartHandshake,
  KeyRound,
  Leaf,
  Lightbulb,
  Lock,
  MessageCircle,
  Moon,
  Mountain,
  PersonStanding,
  Scale,
  Shell,
  ShieldCheck,
  Shrub,
  Smile,
  Sparkles,
  Sprout,
  Sun,
  TreeDeciduous,
  TreePine,
  Trees,
  Users,
  Waves,
} from 'lucide-react';

/** Curated Lucide icons available for card/CTA content. */
export const lucideIcons = {
  Anchor,
  Award,
  Bird,
  BookOpen,
  Brain,
  Cloud,
  Clover,
  Compass,
  Ear,
  Eye,
  Feather,
  Flower,
  Flower2,
  HandHeart,
  Heart,
  HeartHandshake,
  KeyRound,
  Leaf,
  Lightbulb,
  Lock,
  MessageCircle,
  Moon,
  Mountain,
  PersonStanding,
  Scale,
  Shell,
  ShieldCheck,
  Shrub,
  Smile,
  Sparkles,
  Sprout,
  Sun,
  TreeDeciduous,
  TreePine,
  Trees,
  Users,
  Waves,
} as const satisfies Record<string, LucideIcon>;

export type LucideIconName = keyof typeof lucideIcons;

/** Sorted PascalCase names for docs and validation messaging. */
export const lucideIconNames = Object.keys(lucideIcons).sort() as LucideIconName[];

const iconLookup = new Map<string, LucideIconName>(
  lucideIconNames.flatMap((name) => {
    const kebab = name
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .toLowerCase();
    const spaced = kebab.replace(/-/g, ' ');
    return [
      [name.toLowerCase(), name],
      [kebab, name],
      [spaced, name],
    ] as const;
  }),
);

export function normalizeIconKey(input: string): string {
  return input.trim().toLowerCase().replace(/[_]+/g, ' ').replace(/\s+/g, ' ');
}

export type ResolvedCardIcon =
  | { kind: 'lucide'; Icon: LucideIcon; name?: LucideIconName }
  | { kind: 'emoji'; emoji: string };

/**
 * Resolve a content `icon` string to a Lucide component or emoji literal.
 * Accepts PascalCase, kebab-case, or spaced Lucide names; anything else is emoji/text.
 */
export function resolveCardIcon(
  value: string | undefined | null,
  fallback?: LucideIcon | string,
): ResolvedCardIcon {
  const trimmed = value?.trim();
  if (trimmed) {
    const key = normalizeIconKey(trimmed);
    const name = iconLookup.get(key) ?? iconLookup.get(key.replace(/ /g, '-'));
    if (name) {
      return { kind: 'lucide', Icon: lucideIcons[name], name };
    }
    return { kind: 'emoji', emoji: trimmed };
  }

  if (typeof fallback === 'string') {
    return resolveCardIcon(fallback);
  }
  if (fallback) {
    return { kind: 'lucide', Icon: fallback };
  }
  return { kind: 'lucide', Icon: Leaf, name: 'Leaf' };
}

const defaultCardClassName = 'text-primary mb-5 h-9 w-9';

type CardIconProps = {
  icon?: string | null;
  fallback?: LucideIcon | string;
  className?: string;
  /** Extra classes for emoji spans (defaults mirror Lucide size). */
  emojiClassName?: string;
} & Omit<LucideProps, 'ref'>;

export function CardIcon({
  icon,
  fallback,
  className = defaultCardClassName,
  emojiClassName,
  ...lucideProps
}: CardIconProps) {
  const resolved = resolveCardIcon(icon, fallback);

  if (resolved.kind === 'emoji') {
    return (
      <span
        className={emojiClassName ?? `${className} inline-flex items-center justify-center text-[2.25rem] leading-none`}
        aria-hidden="true"
        role="img"
      >
        {resolved.emoji}
      </span>
    );
  }

  const { Icon } = resolved;
  return <Icon className={className} aria-hidden="true" {...lucideProps} />;
}

/** Default icons for cards when `icon` is omitted (cycles by index). */
export const defaultCardIconFallbacks = [HeartHandshake, Leaf, TreeDeciduous] as const;
