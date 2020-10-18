---
title: The S in SOLID Software Architecture - Single Responsibility Principle
date: "2020-05-18T18:00:00Z"
description: "S stands for „Single Responsibility“, which means to do only one thing, but do it well."
image: "./eagle.jpg"
category: tech
---

In software development the concept of building complex structures out of basic blocks is omnipresent, be it in the form of classes, components or modules.

According to the SOLID principles, each of these basic blocks should only have one job and defer additional jobs to other modules.

![What shows up on Unsplash if you search „Focus“ (by Kyran Aldworth).](./eagle.jpg)

For example, let’s say one wants to react to an event that is thrown within an application. The event should be persisted to the database and a notification email should be sent to users. This could look something like the following (written in Typescript but easy to read - it’s about the principles, not the language):

```ts
function onAccountCreated(event: Event) {
  // Persist event in database.
  database.table("events").create({
    name: event.getName(),
    data: event.getPayload(),
    createdAt: time.getISO(event.getTimestamp())
  })
  // Send new account email notification.
  http.post(
    "api.my-email-service.com/send-email",
    {
      to: "me@example.com",
      subject: "New event",
      body: `The event ${event.getName()} has occured!`
    },
    {
      Authorization: config.environment.get("EMAIL_API_KEY")
    }
  )
}
```

So, what’s the problem with this? There are three:

#### 1. Readability

Code is read much more often than it is written, especially when projects grow larger. Robert C. Martin estimates the ratio at 10:1¹. This means that both from the development and business perspective it makes sense to optimize for reading time.
In the example above the multiple levels of indentation, the length of the method, as well as comments make the code hard to scan.

#### 2. Testability

The presence of tests is usually assumed in every serious software project. Especially when unit testing the ability to mock other services is important to make sure we only test a specific module.
In the example we need to mock four different modules: database, time, http and config. Every mock introduces more complexity — means more room for mistakes and code that is harder to read and understand.

#### 3. Separation of Concerns

Parts of software that have similar responsibilities should be grouped while parts with different responsibilities (concerns) should be separated. Or, as [Uncle Bob puts it](https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html):

> „Gather together the things that change for the same reasons. Separate those things that change for different reasons.“

This is based on the fact that software is ultimately built to serve people. Because of that, it should not only be structured around a specific flowchart of a process but around the people it serves. If a designer requests a change in the layout of the app, one should not need to change code that is concerned about persisting data from this layout to the database. Separation of concerns.

In the example, there are multiple reasons for the code to change, all with different motivations. The backend developer could make a change to the database schema, requiring the DB call to adapt. The design team could make a change to the email styling, requiring the email service request to adapt. The operations team could change the deployment, requiring the configuration to adapt. All of these motivations requiring changing the same piece of code is a recipe for headaches.

So what would be a more suitable solution? Let me suggest this:

```ts
function onAccountCreated(event: Event) {
  eventRepository.persist(event)
  notifications.broadcast(event)
}
```

The repository can take full responsibility on how to persist events:

```ts
class EventRepository {
  persist(event: Event) {
    database.table("events").create({
      name: event.getName(),
      data: event.getPayload(),
      createdAt: time.getISO(event.getTimestamp())
    })
  }
}
```

The notifications module can take care of notifying users by utilizing the mailer:

```ts
class Notifications {
  …
  broadcast(event: Event) {
    this.mailer.send(
      "me@example.com",
      "New event",
      `The event ${event.getName()} has occured!`
    );
  }
}

class Mailer {
  …
  send(to: string, subject: string, body: string) {
    this.http.post(
      "api.my-email-service.com/send-email",
      { to, subject, body },
      {
        Authorization: config.environment.get("EMAIL_API_KEY")
      }
    )
  }
}
```

Even if this creates more lines of code, the overall quality of it is improved:

- One can quickly understand what the onAccountCreated method is doing (no comments necessary).
- One can investigate only the code that is relevant to one's problem.
- Testability is improved by reducing the dependencies of each module.
- Code that changes for the same reason is grouped — the EventRepository changes only when the DB schema changes, the Notifications module changes only when the design team wants to make adjustments to the email body and the Mailer only changes when the operations team decides to use a different configuration setup.

By now the benefits and necessity of structuring code this way should be clear.

However, as with most things, one should not just apply the methods promoted by the Single Responsibility Principle blindfolded. Just splitting all your code into own classes until each has only a one-line-method will lead to over-engineered code which is inefficient to work with.

One should understand that the principle is about balancing division with aggregation — based on the reason for certain parts of code to change.

With this understanding, it should be much easier to apply the Single Responsibility Principle in day-to-day development with confidence. Let me know if you found this article helpful or have any feedback — I appreciate all of it!

¹ Robert C. Martin, Clean Code: A Handbook of Agile Software Craftsmanship
