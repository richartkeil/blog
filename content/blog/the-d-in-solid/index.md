---
title: The D in SOLID Software Architecture — Dependency Inversion Principle
date: 2020-07-15T18:00:00Z
description: D stands for Dependency Inversion and promotes depending on abstractions rather than concrete implementations.
image: ./chains.jpg
category: tech
---

„D“ stands for Dependency Inversion and promotes depending on abstractions rather than concrete implementations.

When developing new systems it's usually easy to pay attention to creating modular structures and adhering to the [Single Responsibility Principle](/the-s-in-solid). As a consequence, one often builds modules that take care of a specific task first and then uses them later in the business logic.

However, this often comes with a downside: These systems are usually tightly coupled because the business logic depends directly on the low-level module.

![Don't build gordian knot systems. (Photo by Douglas Bagg)](./chains.jpg)

Dependency Inversion suggests changing („inverting“) this relationship. Instead of directly referencing the low-level module, one ought to reference its abstraction. 

Let's have a look at an example similar to the one of the [Open-Closed Principle](/the-o-in-solid). Actually, this similarity is no surprise because the two principles benefit from each other by removing tight couplings in your code.

```ts
class EmailBroadcaster {
  send(event: Event, user: User) {
    const description = `New event ${event.name} occured at ${event.getTimestamp()}`
    emailService.send({ to: user.email, subject: event.name, body: description })
  }
}

class NotificationHandler {
  private mailer: EmailBroadcaster

  constructor() {
    this.mailer = new EmailBroadcaster()
  }

  public broadcast(event: Event, user: User) {
    this.mailer.send(event, user)
  }
}

function onAccountCreated(event: Event, user: User) {
  const notifications = new NotificationHandler()
  notifications.broadcast(event, user)
}
```

The `NotificationHandler` instantiates the `EmailBroadcaster` (hence makes it a direct dependency) and calls it later. This leads to the following problems:

- the Handler is not easy to test because one cannot mock the actual `EmailBroadcaster` — one would need to test both at the same time
- the Handler depends on a low-level module which means that it is subject to effects of changes in this low-level module

A potential solution might look like this:

```ts
interface Broadcaster {
  send(event: Event, user: User)
}

class EmailBroadcaster implements Broadcaster {
  send(event: Event, user: User) {
    const description = `New event ${event.name} occured at ${event.getTimestamp()}`
    emailService.send({ to: user.email, subject: event.name, body: description })
  }
}

class NotificationHandler {
  constructor(private broadcaster: Broadcaster) {}

  broadcast(event: Event, user: User) {
    this.broadcaster.send(event, user)
  }
}

function onAccountCreated(event: Event, user: User) {
  const notifications = new NotificationHandler(new EmailBroadcaster())
  notifications.broadcast(event, user)
}
```

In this case, the `NotificationHandler` requires no knowledge at all about the implementation of the `EmailBroadcaster`. All it needs to know is that given a „Broadcaster“ it can send notifications.

By putting the `Broadcaster` interface between the two classes and inverting the relationship, we removed the tight coupling and can now enjoy **easy testing** and a system that is **less prone to ripple-effects of low-level changes**.

As you might have noticed, the „new“ keyword did not completely disappear. It merely moved one level up, into the `onAccountCreated` function. There it would lead to similar problems as in the `NotificationHandler` in theory.

This is where „Inversion of Control Containers“ (short IoC Containers) come into play. They allow one more level of abstraction by taking care of managing all the dependencies between modules, for example through injecting them automatically into the constructor of a class.

Most modern frameworks come with this ability to „autowire“ out of the box. In our example, it would be likely that the `onAccountCreated` function is part of a module that can be hooked up through our own or a framework IoC container. Then the `NotificationHandler` would be instantiated through the container and directly provisioned with a Broadcaster that we could globally configure.

Dependency Inversion is a powerful concept that allows building systems that are more modular and can adapt faster to changing requirements. The principle is the last one of the five SOLID principles.
