
# MetaSRA website front-end

This website is written in Angular 2.  If you're not familiar, you should definitely read through the Angular tutorial and everything here will make a lot more sense.  https://angular.io/tutorial



## Setup
1. Install node.js <= 6.9 and npm <= 3.0.
2. Clone this repository and CD to the root directory.
3. To install Javascript dependencies, run `npm install`.
4. Patch ngbootstrap - run `npm run prepare`.  See /patches/README for more info.


## Compile Typescript
Most of the app is written in Typescript, which is a superset of Javascript with some handy extra syntax.  To run it in a browser, you need to compile it to Javascript.

From a terminal in the project directory, run `npm run build` to compile.

Many IDE's have a plugin to compile typescript whenever you save a file.  In the MetaSRA back-end script, there are a couple lines of code you can un-comment that will automatically compile typescript when the back-end server is running.

There are some compile-time optimizations to speed up loading of Angular apps that I didn't have time to implement, but would help the application load faster in the browser.


## Update front-end on the web server
It's a good idea to make sure `npm run build` completes on your development machine before trying it on the web server.

SSH into the web server, and then:
```bash
cd /var/www/metasra-frontend
git pull
npm run build
```


## Overview of files and structure
Familiarize yourself with Angular 2 for this to make sense.   https://angular.io/tutorial

#### Component tree
+  app.conponent : just includes the router (app.routing.ts) which only has one-route, to main-container.component
  + main-container.component
    + search-controls.component : renders everything in the search box.  It doesn't keep the user's query in its own internal state, but rather stores the state in sample-query.service
      + term-input.component : autocompelete box, term-tag list, and term-removal.  Uses term-lookup.service for autocomplete.
    + result-container.component : renders result-studys, as well as the pager widget, download button, and common terms list.  Also responsible for error messages and search examples.
      + result-study.component : renders one study in the results
        + result-sample-group.component : renders one row in the sample-groups table for each study
          + term-tag.component - the button for an ontology term, as well as the term info popover.  The term-tag component is also used several other parent components.

#### Services
+ sample-query-service : Keeps track of the query entered by the user and query results, and communicates with the back-end to keep the results up-to-date every time the query changes.  Also keeps the page URL up to date with the current query, and generates download links.  This is the biggest ugliest file in the whole project.
+ term-lookup.service : Accesses the "terms" resource for the back-end, used for autocomplete and term popups.
+ close-popover.service : This is a dumb and over-complicated way to close popovers when the user clicks somewhere else on the page.  Every component that opens popovers uses this service and registers popovers when they're opened.  Maybe ngbootstrap will get an update someday that makes this unnecessary.  

#### Other
+ CONFIG.ts : some constants you can change, and URL's for accessing the back-end.
+ sample-query.ts : class representing a user-entered query
