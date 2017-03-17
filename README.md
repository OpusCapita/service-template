# ocbesbn-service-template
This repository provides a general service template for creating custom services for OpusCapita Business Network. It supplies most of the required file system structure for building and testing newly created services and is equipped with all basic components to build a RESTful and database oriented service. It provides configurations to build a docker environment to run all tests.

To customize this template to create your own service, just follow the instructions in this document.
Have fun!

---

### Get it!

Clone the repository:

```
git clone https://github.com/OpusCapitaBusinessNetwork/service-template.git
- or -
git clone git@github.com:OpusCapitaBusinessNetwork/service-template.git
```

First rename the cloned directory **service-template** to the name of your new service and cd into it.
Now remove the whole **.git** directory and run

```
git init
```

Open the **package.json** file in your editor and change the following properties to your own values:

- name
- version
- description
- author
- repository
- bugs
- homepage

Open the files **Dockerfile.base**, **Dockerfile**, **docker-compose.yml**, **circleci.yml** and **package.js** and replace all the values surrounded by double curly braces (e.g. {{maintainer}}) with your own.

Now open the **.env** file edit the provided values as required.

---

### Docker

This template uses two docker files that will both build images for you. The **Dockerfile.base** creates a base image with all the basic node modules installed. This helps building the default image much faster as it will happen every time you'll push the repository to GitHub. The base image will be configured to be built every night automatically on [CircleCI](https://circleci.com) and pushed to Docker Hub.

As you need the base image before building the default image for your service, you may have to create your base image manually. Just run:

```
docker build -t ocbesbn/{{your-service-name}}-base:latest -f Dockerfile.base .
```

If desired, you might want to publish your new base image to Docker Hub. To do so, follow these steps:

```
docker login
docker push ocbesbn/{{your-service-name}}-base
```

If everything worked to your satisfaction, execute the following command to run your new service.

```
docker-compose up
```

> Sometimes the initial start of the service does not succeed because of timeouts happening when creating and starting containers at the same time. If your service did not start press Ctrl+C and run the **docker-compose up** command again.

Now remember the port you put into the .env file, go to your web browser an open "http://localhost:{{port}}/". If everything worked, the browser should show you a "Hello world!".

---

### Adding to GitHub

If all the above test commands succeeded, go to [GitHub](https://github.com) and create a new repository for your service. Now add all your files and push them to GitHub.

```
git add .
git commit -m "Initial commit."
git remote add origin https://github.com/OpusCapitaBusinessNetwork/{{your-service-name}}
git push -u origin master
```

After that, you can configure the build server for automated building and testing.

---

### Build server (CircleCI)

To configure a project to be built automatically on [CircleCI](https://circleci.com) after pushing it to GitHub, please follow these steps:

- Login to CircleCI using your web browser.
- Go to https://circleci.com/add-projects.
- Select "OpusCapitaBusinessNetwork" on the left.
- Search your repository on the right.
- Click "Build project" on the right.

##### Docker Hub

Your **circleci.yml** uses environment variables to automatically deploy modules and docker images. In order to use this feature, you have to set these variables up by editing the settings of your newly created build project. By default, this template requires the following variables to be defined in the "Environment Variables" section of CircleCI:

- DOCKER_USER (User on Docker Hub)
- DOCKER_PASS
- DOCKER_EMAIL

This settings are used to build docker images from your repository and push them to Docker Hub. A nightly-build config creates daily builds of your base image.

Now your service gets built automatically every time you push your repository to GitHub.

##### NPM

If your project consists of a module which should be published to NPM, go to your **circleci.yml** file and uncomment all sections prefixed with **NPM_**. Additionally you will have to add the following environment variables to CircleCI:

- NPM_USER (User on NPM)
- NPM_PASS
- NPM_EMAIL

---

### Introduction to code
This service template provides general structures and modules that should be used as provided to maintain a system environment, where all services follow the same conventions. Shard modules like [ocbesbn-config](https://github.com/OpusCapitaBusinessNetwork/config), [ocbesbn-web-init](https://github.com/OpusCapitaBusinessNetwork/web-init) and [ocbesbn-db-init](https://github.com/OpusCapitaBusinessNetwork/db-init) are meant to setup and maintain all services in a much easier way.

The web server module will allow you to easily publish a service API in a RESTful manner.

The database module allows abstracted access to an underlying database. Additionally, this module provides automated data migration, test data population and database model registration. The required database configuration is automatically fetched using Consul.

In addition, this template module is already prepared for documenting the JavaScript API of a service. The documentation process is tailored to fit into the GitHub wiki of a service's repository. For more information take a look at [How to create documentation](#how-to-create-documentation).


### Service structure
The most important structural file system elements are:

- [config](#config-directory)
- [rest-doc](#service-api-documentation)
- [src](#src-directory)
    - [client](#src-directory)
    - [server](#src-directory)
        - [db](#src-directory)
            - [migrations](#src-directory)
            - [models](#src-directory)
        - [routes](#src-directory)
        - static
- [test](#test-directory)
    - [client](#test-directory)
    - [server](#test-directory)

There are additional files for docker, npm and node to quickly get a runnable service environment.

##### config directory
All required configuration data should go here. At this time, there is no further structure inside that directory. It is up to the developer do decide, where and how to put server, client and/or service configuration data there.

##### src directory
The src directory will contain all the source code required to run the service. It contains two subdirectories for **client** code and for **server** code. The inner structure of the **client** directory is currently not specified.

The **server** directory contains two subfolders for database related code (**db**) and REST **routes** related code. For further information see [How to create routes](#how-to-create-migrations).

The **db** directory contains two subfolders for data migration (**migrations**) and database **models**. The contents of this subdirectories has to follow different rules which will be explained later in this document. See [How to create migrations](#how-to-create-migrations) and [How to create models](#how-to-create-models) for further information.

##### test directory
The test directory should contain all unit tests for **client** and **server** code. For further information see [How to write tests](#how-to-write-tests)

---

### How to create migrations
In this service template, database migration is split in two different kinds of actions. The first one deals with structural and existing data migration, the other one deals with populating test data for development and test purposes.

Migrations have to follow some rules in order to get executed.

All migration files have to be located at **./src/server/db/migrations**. The files in this directory are executed in ascending alphanumeric and alphabetical order. This means, that every new migration needs to take place after all earlier migrations by naming it with a higher number in front or the next letter from the alphabet. Files that have already been processed successfully in the past will be noticed but not executed again.

##### Files
Structure/data migrations and test data files are split in order to decide whenever to automatically populate test data e.g. into a development system and when not.

All Structure and data migration files have to be suffixed with **.main.js** while test data files have to be suffixed with **.test.js**. The basic inner structure of both file types looks like this:

```JS
// Executed when a migration should be applied.
module.exports.up = function(db, config)
{
    // Code goes here.
    // Always return a promise.
    return Promise.resolve();
}

// Executed if an applied migration should get reverted.
module.exports.down = function(db, config)
{
    // Code goes here.
    // Always return a promise.
    return Promise.resolve();
}
```

For more details take a look at the example files inside the **./src/server/db/migrations** directory of this service template.

---

### How to create models
Database models are located inside the **./src/server/db/models** directory. The database component [ocbesbn-db-init](https://github.com/OpusCapitaBusinessNetwork/db-init) will treat the whole **models** directory as a single module. It is up to the developer of a service to structure the rest of this directory. In order to get executed, the module has to provide an **index.js** file defining the following structure:

```JS
module.exports.init = function(db, config)
{
    // Code goes here.
    // Always return a promise.
    return Promise.resolve();
}
```

For more details take a look at the example file inside the **./src/server/db/models** directory of this service template.

---

### How to create routes
The REST route configuration is located inside the **./src/server/routes** directory. The web server component [ocbesbn-web-init](https://github.com/OpusCapitaBusinessNetwork/web-init) will treat the whole directory as a single module. It is up to the developer of a service to structure the rest of this directory. In order to get executed, the module has to provide an **index.js** file defining the following structure:

```JS
module.exports.init = function(app, db, config)
{
    // Code goes here.
    // Always return a promise.
    return Promise.resolve();
}
```
For more details take a look at the example file inside the **./src/server/routes** directory of this service template.

---

### How to write tests
Tests are actually executed using nyc and mocha so files inside the **test** directory have to follow the rules of mocha testing. All files have to be suffixed with **.spec.js** in order to get executed.

Just run
```
docker-compose run main npm run test
```
to execute all tests inside the **client** and **server** subdirectories. Take a look at the **scripts** section inside the main **package.json** to see how the testing is configured.

---

### How to create documentation
Depending on the purpose of your module, there are four different kinds of documentation types available:

* Service API documentation (endpoints)
* Domain documentation (database models)
* Code API documentation
* README documentation

All documentation processes provided with this service template are tailored to meet the requirements of GitHub.

#### Preparing documentation

Before you can create actual output, please follow this instructions:

- Go to your service repository page on GitHub and create the first wiki page.

- Go to the service code on your local host and clone https://github.com/OpusCapitaBusinessNetwork/{{your-service-name}}.wiki.git or git@github.com:OpusCapitaBusinessNetwork/{{your-service-name}}.wiki.git into the directory.

- Rename the directory from {{your-service-name}}.wiki to wiki.

All the scripts already provided by this template should now be able to write their output to the wiki directory. To send all contents to GitHub, just commit and push the wiki directory.

#### Service API documentation
The purpose of the service API documentation is helping others on how to communicate with your service. It has to provide all public endpoints and the data structures used for in- and output including HTTP headers, URL- and query parameters.

The service API documentation is to be written using the [RAML modeling language](http://raml.org). The finished RAML definition will then get transformed into a Markdown documentation using the [raml-to-markdown](http://npmjs.com/package/raml-to-markdown) tool. If you are using Atom as your editor, you should have a closer look at the [API Workbench](http://apiworkbench.com) extension.

This service template already contains an example RAML project structure inside the **rest-doc** directory.

To finally generate the documentation run:

```
docker-compose run main npm run rest-doc
```

> Search for output inside the **wiki/rest-doc** directory.


#### Domain documentation
The domain documentation is used to document the database entities used by a service. By using the [sequelize-to-markdown](https://www.npmjs.com/package/sequelize-to-markdown) tool, you can easily generate a Markdown documentation out of your sequelize models.

Before starting to document your code, please read the [Requirements](https://www.npmjs.com/package/sequelize-to-markdown#requirements) section of sequelize-to-markdown carefully.

If your code is finally ready for Markdown rendering, run the following command:

```
docker-compose run main npm run domain-doc
```

> Search for output inside the **wiki/domain-doc** directory.

#### Code API documentation
As it is always a good idea to document your source code in a lightweight way, creating a parsed documentation output is only needed if you use this service template for creating shared modules that provide public APIs for others.

To document your JavaScript API please follow the rules of [JSDoc](http://usejsdoc.org).

If your code is finally ready for Markdown rendering, run the following command:

```
docker-compose run main npm run api-doc
```

> Search for output inside the **wiki/api-doc** directory.

#### README
The README.md file in the main directory of your service should always contain a hand written Markdown documentation with facts important for users of your service.

If you are using this service template for creating shared modules, it is always a good idea to place a simple tutorial inside the README file as this is the first page on GitHub and npmjs.
