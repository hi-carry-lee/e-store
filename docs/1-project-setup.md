# section 2

## create project using Nextjs

use the command `npx create-next-app@latest` to create a new project, for the options appears in the terminal, here is what I used:

```bash
✔ What is your project named? … prostore
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … No
✔ Would you like to use App Router? (recommended) … Yes
✔ Would you like to customize the default import alias? … No
```

## Tailwind CSS

Currently the version of Nextjs is `15.2.3`, and version of Tailwind is V4, so there is something different in the `globals.css` file, so we uninstall tailwind and install a V3 version;

## shadcn UI

Currently, Shadcn UI is not completely compatible with React 19, so when install every Shadcn UI component, we will choose `--legacy-peer-deps` instead of `--force`, many believe that this is a safer way.

## Basic layout

1. create a `(root)` folder for the root layout,
2. create a `layout.tsx`, make it as a layout component, add some basic style;
3. move the `page.tsx` in the app folder to the root folder, since we want to use the layout in the root fold to wrap the home page component.

## create constant file

In the lib folder create a `constants` folder, and create a `index.ts` file, here we will store all the constant variables.
Here we first create `APP_NAME` and `APP_DESCRIPTION`, then use it in layout.tsx in the `app/layout.tsx`

## build header and footer component

1. create a header folder in the components folder, since Header component is a reusable component;
2. create a footer file directly in the components folder, since we don't reuse the Footer component;
3. render the Header and Footer component in the RootLayout component.
