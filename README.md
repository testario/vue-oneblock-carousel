# vue-oneblock-carousel

## Project setup
```
npm install
```

### Starts the Vite dev server
```
npm run dev
```

### Builds for production
```
npm run build
```

### Runs unit tests
```
npm run test
```

### Runs lint
```
npm run lint
```

## Animation types

```
oneway - classic left\right carousel
```

## Props

`slides` - required array of slides

```ts
type Slide = {
  id?: string | number
  cover: string
  title: string
  text: string
} & Record<string, unknown>
```

`animationType` - optional animation mode

`autoplay` - enables automatic slide switching, default `false`

`autoplayInterval` - delay between automatic switches in milliseconds, default `5000`

When autoplay is enabled, it pauses while the cursor is over the carousel and resumes after `mouseleave`.

## Slots

`slide` - fully replaces the slide layout and allows reordering parts

`image`, `content`, `title`, `text`, `dots`, `dot` - replace separate parts of the default layout

`not-found` - renders when `slides` is an empty array
