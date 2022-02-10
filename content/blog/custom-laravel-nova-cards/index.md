---
title: How to write custom Laravel Nova Cards without making them a package
date: "2018-10-12T18:00:00Z"
description: "Nova allows to extend most of its parts through custom composer packages. This is great for easy sharing with the community, however this is not so great if you need a truly custom extension."
image: "./nova.jpg"
category: tech
canonical: https://medium.com/@richartkeil/how-to-write-custom-laravel-nova-cards-without-making-them-a-package-f377f39c4071
---

[Laravel Nova](https://nova.laravel.com/) has been released in August 2018 and we implemented it in our backend administration for [Exposify](https://www.exposify.de/). It’s a breeze to set up and looks fantastic in our eyes — however since it’s still in its early versions I think there is [lots to work](https://github.com/laravel/nova-issues/issues) on for the team behind it. This leads straight to…

![Galaxy with Code](./nova.jpg)

## The problem

Nova allows to extend most of its parts through custom composer packages. This is great for easy sharing with the community, eg. through [novapackages.com](novapackages.com). However this is not so great if you need a truly custom extension.

I wanted to implement a [Nova card](https://nova.laravel.com/docs/3.0/customization/cards.html) that allows to easily switch between different teams in our app and suggest recently active teams to choose from.

If you go ahead with `php artisan nova:card company/my-card` Nova will create an extra directory with its own `package.json`, `composer.json`, compiled asset folder etc.

In our case this default approach was problematic:
- **added complexity** in app structure and **file maintenance**
- **separate asset compilation** (when we develop we have the Webpack watcher running to compile our assets into our main asset directory — for this one card we would need to run separate NPM scripts or even commit compiled assets)
- **it’s so custom it will never be released** and the logic is so tightly coupled to our app that it doesn’t make sense to split it from e.g. defined metric cards in the `app\Nova` directory

## The solution

Remove all the „packaging“ (get it?) and bring the custom components into the regular Nova scaffolding. I proceeded with the following 8 steps:

#### Step 1

Create a regular card with `php artisan nova:card company/custom-card` and follow the setup as [described in the docs](https://nova.laravel.com/docs/3.0/customization/cards.html). See that a package is created in `/nova-components`.

#### Step 2

Move the `src/CustomCard.php` into a directory `/app/Nova/Cards`. Now it has the same visual status as defined filters, actions or metric. Adjust its namespace.

#### Step 3

The `src/CardServiceProvider.php` needs to get merged into the `app/Providers/NovaServiceProvider.php`. So inform Nova about the assets of our components by modifying the `boot()` method in `app/Providers/NovaServiceProvider.php` like this:

`gist:richartkeil/b61bcc2b70235a7a13141b3d0d572e7c`

#### Step 4

Inform Nova about routes of the card (and potentially other components) by modifying the `routes()` method in `app/Providers/NovaServiceProvider.php` like this:

`gist:richartkeil/9d6f2f82371658e18de7e647cf026d53`

#### Step 5

Import the CustomCard class in the Service Provider and add an instance of it to the returned array in the `cards()` method so it looks like this:

`gist:richartkeil/3eea97976fa24832bdb8505ebc44e136`

#### Step 6

Store the frontend component. Copy the content of `/nova-components/CustomCard/resources/js` and paste it in your project asset folder (eg. `/resources/assets/js/Nova/CustomCard`).

Add a general `/resources/assets/js/nova.js` and import the card component (`import CustomCard from 'Nova/CustomCard/card.js'`). Configure Webpack to compile this file — in this case to `/public/assets/js/nova.js` (remember Step 3?). If you are using Vue Single-File-Components you don’t need an extra CSS file.

If you are using Laravel Mix you can compile your components super easy with `mix.js('resources/assets/js/nova.js', 'public/assets/js/nova.js')`.

#### Step 7

Add the route file for custom components. Create `/routes/nova.php` and add routes as usual — they’ll be discovered because of our preparation from step 4.

#### Step 8

Clean up. Nova will have added custom scripts to `package.json`, so remove them. It will also have required the package in `composer.json` and added a repository entry there, so remove these ones as well.

Delete the `/nova-components` directory.

And that’s it. Now you can run `npm run watch` and continue developing your app. Custom Nova components will be compiled and you can easily edit and use them like filters, actions or metric cards.

Let me know what you think about Laravel Nova and whether you see a different solution for the described problem!
