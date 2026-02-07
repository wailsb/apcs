import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const itemVariants = cva(
  "flex items-center gap-4 px-5 py-4 transition-all duration-200 glass-list-item rounded-xl mx-2 my-1 list-item-animate",
  {
    variants: {
      variant: {
        default: "",
        outline: "border border-border/50 rounded-xl mb-2 last:mb-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof itemVariants> {
  selected?: boolean;
}

const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ className, variant, selected, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        itemVariants({ variant }),
        selected && "border-l-2 border-l-accent bg-accent/5",
        className
      )}
      {...props}
    />
  )
);
Item.displayName = "Item";

const ItemMedia = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "avatar" | "square";
  }
>(({ className, variant = "avatar", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex-shrink-0 flex items-center justify-center bg-secondary text-foreground font-medium text-sm",
      variant === "avatar" ? "w-10 h-10 rounded-full" : "w-10 h-10 rounded-md",
      className
    )}
    {...props}
  />
));
ItemMedia.displayName = "ItemMedia";

const ItemContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 min-w-0", className)} {...props} />
));
ItemContent.displayName = "ItemContent";

const ItemTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn("font-medium text-foreground truncate", className)}
    {...props}
  />
));
ItemTitle.displayName = "ItemTitle";

const ItemDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground truncate", className)}
    {...props}
  />
));
ItemDescription.displayName = "ItemDescription";

const ItemActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3 flex-shrink-0", className)}
    {...props}
  />
));
ItemActions.displayName = "ItemActions";

export { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions };
