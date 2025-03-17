# Responsive Design Framework

This project uses a desktop-first responsive design framework to support a wide range of devices from wide monitors to mobile phones.

## Breakpoints

The following breakpoints are defined in `variables/_media.scss`:

| Breakpoint | Width | Device Type |
|------------|-------|-------------|
| $breakpoint-wide | 1920px | Wide Monitors |
| $breakpoint-desktop | 1440px | Standard Desktop Monitors |
| $breakpoint-laptop | 1200px | Laptops |
| $breakpoint-tablet | 992px | Tablets (Landscape) |
| $breakpoint-tablet-sm | 768px | Tablets (Portrait) |
| $breakpoint-mobile | 576px | Mobile (Landscape) |
| $breakpoint-mobile-sm | 375px | Mobile (Portrait) |

## Responsive Mixins

Use these mixins in your SCSS to create responsive designs:

```scss
// Example usage
.my-element {
  width: 100%;
  
  @include respond-tablet {
    width: 80%;
  }
  
  @include respond-mobile {
    width: 100%;
  }
}
```

Available mixins:

- `respond-wide`
- `respond-desktop`
- `respond-laptop`
- `respond-tablet`
- `respond-tablet-sm`
- `respond-mobile`
- `respond-mobile-sm`
- `respond-to($breakpoint)` - Custom breakpoint

## Utility Classes

The framework includes utility classes for responsive layouts:

### Containers

- `.container` - Responsive container with max-width
- `.container-fluid` - Full-width container
- `.container-wide` - Wide container
- `.container-narrow` - Narrow container

### Responsive Display

- `.hide-on-[breakpoint]` - Hide element at specific breakpoint
- `.show-on-[breakpoint]` - Show element at specific breakpoint

### Responsive Flexbox

- `.flex-responsive` - Flex container that switches to column on tablet-small
- `.flex-responsive-reverse` - Flex container that switches to column-reverse on tablet-small

### Responsive Spacing

- `.gap-responsive` - Responsive gap that decreases on smaller screens
- `.m-responsive-[1-5]` - Responsive margin that decreases on smaller screens
- `.p-responsive-[1-5]` - Responsive padding that decreases on smaller screens

### Responsive Text Alignment

- `.text-center-mobile` - Center text on mobile devices
- `.text-left-mobile` - Left align text on mobile devices
- `.text-right-mobile` - Right align text on mobile devices 