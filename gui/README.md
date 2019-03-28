# grove-vue-template

Project template for Grove stack including:

- grove-ml-gradle (folder marklogic)
- grove-node (folder middle-tier)
- grove-vue-ui (folder ui)

## Create a Project Based on this Vue Template

Follow [the instructions in the Grove Developer Starters Guide](https://wiki.marklogic.com/display/SAL/Grove+Developer+Starters+Guide) in order to create a new Grove project.

When asked which UI you prefer, select "Vue". Follow the in-console instructions to configure and run your application.

## Developing your project

To install dependencies:

    npm install

To create shared configuration between the three tiers (`marklogic`, `middle-tier`, and `ui`):

    grove config

To run the tests:

    npm test

To start a development server at `localhost:3000`:

    npm start

## NOT PREFERRED: Fetching and running this template manually

### Manual fetching

**Note that preferred way to install this template is using the grove-cli. 
Follow [the instructions in the Grove Developer Starters Guide](https://wiki.marklogic.com/display/SAL/Grove+Developer+Starters+Guide) in order to create a new Grove project.**

These are instructions for manually installing this template.

This template currently uses git submodules. You can clone it recursively using:

- `git clone --recurse-submodules https://project.marklogic.com/repo/scm/\~gjosten/grove-vue-template.git {your-app-name}`
- `cd {your-app-name}`

This gives you the `master` branch of the template, and its submodules. Use this to get the `development` branch instead:

- `git clone -b development --recurse-submodules https://project.marklogic.com/repo/scm/\~gjosten/grove-vue-template.git {your-app-name}`
- `cd {your-app-name}`

Consider running the following once if you suspect there are newer commits to the branches, that you'd like to pull in:

- `git submodule update --remote --rebase`

It is recommended that you 'eject' from the Grove code repos after cloning this template, meaning you remove the git tracking from your local copy. You can do that with:

- `rm -rf .git .gitmodules */.git`

You can then move the contents to a directory that is tracked by a different git project already, or initialize the newly created directory with a new local git repository:

- `git init`
- `git add .`
- `git commit -m "initial commit"`

In case you don't eject, you might want to occasionally check for updates, and merge them with your local setup. You can do so for all submodules using:

- `git submodule update --remote --rebase`

It will warn for conflicts with local changes. Append the name of a submodule in case you'd like to run it for just one of them.

### Getting the ui started manually

You should use the grove-cli to configure the application by running `grove config`. Further customization can be done manually in `marklogic/gradle{-local}.properties` and `middle-tier/.env{.local|development|production}`.

Run `npm install` in this directory, which will also run it within the `ui` and `middle-tier` directories.

Load sample data:

- `cd marklogic`
- `./gradlew mlDeploy loadSampleData`

Run `npm start` in this directory, which will start the `middle-tier` and the `ui`. A browser window should open automatically (at localhost:8080)

Look inside the subfolder READMEs for more detailed instructions.

## Further reading

For more background on git submodules, see:

https://git-scm.com/book/en/v2/Git-Tools-Submodules
