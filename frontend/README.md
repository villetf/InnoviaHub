# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.15.

## Development server

To start a local development server, run:

```bash
ng serve
```

or

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

To generate a new component, run:

```bash
ng generate component file-directory(eg. components)/component-name
```

Example:

```bash
ng generate component components/component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Folder Structure Example

```bash
/public
├── assets
│ │
│ ├── icons
│ └── images
/src
├── app
│ │
│ ├── components
│ │ ├── header
│ │ │ ├── header.component.css
│ │ │ ├── header.component.html
│ │ │ └── header.component.ts
│ │ ├── footer
│ │ │ ├── footer.component.css
│ │ │ ├── footer.component.html
│ │ │ └── footer.component.ts
│ │ └── button
│ │   ├── button.component.css
│ │   ├── button.component.html
│ │   └── button.component.ts
│ │
│ ├── models (type declarations)
│ │ ├── booking.model.ts
│ │ └── user.model.ts
│ │
│ ├── pages (page components)
│ │ ├── dashboard-page
│ │ │ ├── dashboard-page.component.css
│ │ │ ├── dashboard-page.component.html
│ │ │ └── dashboard-page.component.ts
│ │ └── booking-page
│ │   ├── booking-page.component.css
│ │   ├── booking-page.component.html
│ │   └── booking-page.component.ts
│ │
│ ├── services (api calls)
│ │ ├── booking.service.ts
│ │ └── user.service.ts
│ │
│ ├── app.component.ts
│ ├── app.module.ts
│ └── app-routing.module.ts
├── assets
├── environments
├── main.ts
├── index.html
└── styles.css
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
