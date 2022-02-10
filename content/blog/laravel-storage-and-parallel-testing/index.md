---
title: Laravel Storage and Parallel Testing
date: "2018-11-19T18:00:00Z"
date_updated: "2020-05-31T16:00:00Z"
description: "Laravel provides neat testing helpers for working with the filesystem — however if you run your tests in parallel, issues are inevitable."
image: "./storage.jpg"
category: tech
canonical: https://medium.com/@richartkeil/laravel-storage-and-parallel-testing-5b8eac44a296
---

Laravel provides neat testing helpers for working with the filesystem — however if you run your tests in parallel, issues are inevitable.

![File Storage in real life (by Samuel Zeller)](./storage.jpg)

## Problem

At [Exposify](https://exposify.de) we use the [Storage Facade of Laravel](https://laravel.com/docs/7.x/filesystem) to fluently access files and store data. It also makes writing feature tests much easier because it automatically swaps directories and cleans them up before running other tests with `Storage::fake('my-disk')`.

We also use [Paratest](https://github.com/paratestphp/paratest) to let our PhpUnit Tests run much quicker by using multiple processes.

The thing is: As soon as you have multiple processes running, some tests will be executed before others are finished. This means that **Laravel will clean up old directories for the upcoming test even when the other test still needs the files in those directories**.

This results in all sorts of exceptions related to the file system. Not cool.

## Solution

The default implementation of `Storage::fake()` as of 7.0 looks like this:

`gist:richartkeil/ea3e257df176fabda8cda31d88bfadb0`

As you can see every time we call `Storage::fake('foo')` Laravel will empty the directory for the disk `foo` in the place where the temporary filesystem lives. Then it’s gonna initiate the system with the new path for the disk.

**What we want however is a truly unique storage location** every time the storage is faked — so our tests cannot interfere with each other.

We can achieve this by initiating the system on our own with a unique root path. After the test is done, we’ll remove this unique directory to not clutter our environment.

In this case I created a trait `CreatesFakeStorage`:

`gist:richartkeil/761c926d807a695d540363ccba815ad4`

This trait can now be used in the base `Tests\TestCase.php` or in special Test Case classes. One just needs to replace the old `Storage::fake('foo')` with `$this->fakeStorage('foo')`.

The method performs similar actions as the original one, except that it assigns a unique time stamped path to each directory and then removes this folder and its content when the test is about to be torn down. Easy as that.

I admit the discussed scenario is a special case that not many will encounter. However if you found this article helpful, let me know! If not, keep it to you. Or tell me so I can work on it.
