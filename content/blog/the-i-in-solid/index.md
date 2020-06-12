---
title: The I in SOLID Software Architecture — Interface Segregation Principle
date: 2020-06-12T18:00:00Z
description: I stands for Interface Segregation Principle and encourages only the implementation of behaviour that is actually required.
image: ./tools.jpg
---

„I“ stands for Interface Segregation Principle and encourages only the implementation of behaviour that is actually required.

In software architecture interfaces are contracts that define no behaviour themself but that other modules must adhere to. They allow the consumer of a module to know how to talk to the module without having to know about details of it.

![Use many small tools instead of one that claims to can do anything. (Photo by Todd Quackenbush)](./tools.jpg)

### A metaphor about interfaces
Interfaces are like an image you have in mind of the cashiers at a cinema. You know that you can tell them what movie you want to see and where you want to sit. You know that they are going to ask you for money and that you can give them money. Also, you expect them to hand you your ticket in the end. However, you don't care how they actually get you the ticket (what they type into the computer) or if they go and get the money from a different register. Now if you actually go to the cinema, you can expect that the cashier you meet fulfills all the expectations in your mind, plus some things that each cashier offers on top (for example a little small talk). 

The image of the cashier in your mind is the interface. The actual cashier is an implemented class — most probably a subclass of „Human“.

To „segregate“ something means to split it up, separate or isolate it. In connection with the Interface Segregation Principle, the goal is to keep interfaces as specific and oriented towards a single responsibility as possible. If necessary by splitting them up.

Or, as Robert C. Martin states:

> „Clients should not be forced to depend upon interfaces that they do not use.“

### The problem
Let's check out the following example to see how not honouring this principle might hurt us. The following event broadcasters for email and push notifications both implement a `CanBroadcast` interface so other services know that they can send notifications with them:

```ts
interface CanBroadcast {
  send(event: Event, user: User)
  trackReads(track: boolean)
}

class EmailBroadcaster implements CanBroadcast {
  send(event: Event, user: User) {
    emailService.send({ to: user.email, subject: event.name })
  }
  trackReads(track: boolean) {
    emailService.setConfig({ trackOpens: track ? "always" : "never" })
  }
}

class PushBroadcaster implements CanBroadcast {
  send(event: Event, user: User) {
    const description = `New event ${event.name} occured!`
    pushService.push({ token: user.pushKey, body: description })
  }
  trackReads(track: boolean) {
    throw new Error("PushBroadcaster does not support tracking reads.");
  }
}
```

As you can see the common `CanBroadcast` interface makes sure they implement a `send` and a `trackReads` method. There is only one catch: The `PushBroadcaster` has no use for this method, because push notifications do not support read status in our case.

This leads to two issues:
- There is an overhead in code. One needs to read the implemented method to understand that it's not relevant for the class.
- If one wants to change how notification tracking is handled, one needs to touch code that actually does not care about notification tracking. I described the reason why this is an issue in the [Open Closed Principle](/the-o-in-solid) post.

### A solution
We could improve on the two pain points like this:

```ts
interface CanBroadcast {
  send(event: Event, user: User)
}

interface CanTrackReads {
  trackReads(track: boolean)
}

class EmailBroadcaster implements CanBroadcast, CanTrackReads {
  send(event: Event, user: User) {
    emailService.send({ to: user.email, subject: event.name })
  }
  trackReads(track: boolean) {
    emailService.setConfig({ trackOpens: track ? "always" : "never" })
  }
}

class PushBroadcaster implements CanBroadcast {
  send(event: Event, user: User) {
    const description = `New event ${event.name} occured!`
    pushService.push({ token: user.pushKey, body: description })
  }
}
```

Now the email and push notification classes both implement the `CanBroadcast` interface, however only the email broadcaster implements the `CanTrackReads` interface.

This way there is **no need for throwing exceptions** at run time in unnecessary methods. This means classes are easier to read and hence to maintain.

Also **changes can be made with higher confidence** because one only needs to touch classes that are actually affected by the change.

Last but not least consumers can use the new structure to make sure that they **only deal with relevant types** — eg. broadcasters that allow for tracking reads.

### How to spot violations

Detecting violations of the Interface Segregation Principle is usually easy. One should watch out if
- classes implement one-line methods that just return null or throw an exception
- the architecture utilizes many layers of inheritance — in this case violations of the principle are often inevitable because one [bases subtyping on modifying behaviour instead of only extending it](/the-l-in-solid) (Barbara Liskov is watching you 👀)

---

The principle is pretty straight forward and thinking of it while implementing new features will certainly enhance the maintainability of your code. It also plays nicely into the hands of the [Solid Responsibility Principle](/the-s-in-solid).
