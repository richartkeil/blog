---
title: The O in SOLID Software Architecture — Open Closed Principle
date: "2020-05-27T18:00:00Z"
description: "O stands for Open Closed Principle and promotes extension over modification."
image: "./lenses.jpg"
---

Bertrand Meyer first brings up the “Open Closed Principle” in 1988 by writing the famous words

> Software entities (classes, modules, functions, etc.) should be open for extension, but closed for modification.

![We don’t need to screw open our camera if we can just extend it with a new lens. (by Lucas Favre)](./lenses.jpg)

What that means is that there should be little need to modify existing code if we want to implement a new feature. At first, this seems a little contradictory because software changes all the time and so does its code, right? What about refactoring or even fixing bugs?

Let’s look at a concrete example to understand what the principle is trying to promote. The following example is written in Typescript but it’s easy to read– it’s about the underlying thoughts, not the exact code. Suppose we want to react to an event from our application by sending it to a specific channel, in this case, either *email*, *text* or *push notification*.

```ts
class NotificationHandler {
  broadcast(event: Event, user: User, broadcastTo: string) {
    const title = event.name
    const description = `New event ${title} occured at ${event.getTimestamp()}`
    if (broadcastTo === "email") {
      return emailService.send({ to: user.email, subject: title, body: description })
    }
    if (broadcastTo === "push") {
      return pushService.push({ token: user.pushKey, content: description })
    }
    if (!user.phone) {
      return;
    }
    if (broadcastTo === "text") {
      return textService.sendText({ to: user.phone, body: description })
    }
  }
}

function onAccountCreated(event: Event, user: User) {
  notifications.broadcast(event, user, "email")
}
```

This code is hard to extend because every time a new way of sending notifications should be implemented one needs to go into the `broadcast()` method and add another if-block. This is what one calls „modification“.

When multiple people work on different ways of broadcasting at the same time this will probably result in merge conflicts. Also when a project „grows up“ usually more abstractions are added on top of basic modules.

In our example, that means that other modules could rely on the NotificationHandler broadcasting a given event to the correct channel. So when one makes a little mistake while changing this basic module the mistake will potentially affect all the code that is based on the module. In the example, such a mistake could be to add a new if-block at the end of the method. Whoops. We might have overlooked the `if(!user.phone) return` that will prevent our new addition to be executed when a phone number is missing. Maybe we did not write a test to cover missing phone numbers for our new feature.

So, how could we stay open for „extending“ our module instead of having to modify it? Consider this:

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

class PushBroadcaster implements Broadcaster {
  send(event: Event, user: User) {
    const description = `New event ${event.name} occured!`
    pushService.push({ token: user.pushKey, body: description })
  }
}

class TextBroadcaster implements Broadcaster {
  send(event: Event, user: User) {
    if (!user.phone) return
    const description = `New event ${event.name} occured!`
    textService.sendText({ to: user.phone, body: description })
  }
}

class NotificationHandler {
  broadcast(event: Event, user: User, broadcaster: Broadcaster) {
    broadcaster.send(event, user)
  }
}

function onAccountCreated(event: Event, user: User) {
  notifications.broadcast(event, user, new EmailBroadcaster)
}
```

We implemented the [strategy pattern](https://sourcemaking.com/design_patterns/strategy) here. Instead of deciding within the `NotificationHandler` how our event should be brought to the user, we pass the „how“ as a strategy, in this case as a class that implements the `Broadcaster` interface. The handler can then just send the message through the broadcaster and take care of the common things between all notifications (eg. error handling).

These changes in structure allow us to

- add a new way of sending notifications without modifying existing code — we only need to add a new class that implements `Broadcaster`
- develop multiple ways of sending notifications at the same time without conflicts (means higher development speed and hence greater flexibility)
- develop new `Broadcaster`s without having to worry about breaking any existing functionality — also we can easily test them in isolation
- follow the [Single Responsibility Principle](/the-s-in-solid) by making sure each of our modules has only one reason to change

In general, the Open Closed Principle should be considered when implementing a new feature that is of the same kind as an already existing one. Like in our example a new way of sending notifications.

One can then improve the quality of the code by extracting the different features into their own modules and keeping only the similarities in the base module. Through passing in the feature module, the base module does not need to know what or how many features actually exist — it only relies on their interface.

As Robert C. Martin [points out](https://blog.cleancoder.com/uncle-bob/2014/05/12/TheOpenClosedPrinciple.html) this approach is already heavily adopted by apps that allow for custom plugins:

> „I’ve heard it said that the OCP is […] not for real programmers with real work to do. The rise of plugin architectures makes it plain that these views are utter nonsense. […] A strong plugin architecture is likely to be the most important aspect of future software systems.“

When building software according to the Open Closed Principle one should keep its original intention in mind: To simplify adding new features without breaking existing code. There is no use of blindly extracting a one-line statement into its own module.

The Open Closed Principle is often considered to be one of the most important design patterns of software architecture. In my experience, its implementation often shows a direct and positive effect on how quickly new features can be implemented.

Let me know if you found this article helpful or have any feedback — I appreciate all of it!
