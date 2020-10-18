---
title: How to build an event logging system with Firebase and Google Cloud Firestore
date: 2020-08-07T18:00:00Z
description: Asynchronous systems need to be able to notify their users about changes — which can be persisted as events and distributed through webhooks.
image: ./fishing.jpeg
category: tech
---

Firebase and Google Cloud Platform offer an excellent way to build apps and systems that can rapidly scale while providing a fantastic developer experience. At [EstateSync](https://estatesync.io), we use GCP services as the backend for our API to allow the fast distribution of real estate data to multiple vendors. Given the requirement to be able to scale to large amounts of data, we built our architecture on the premise of asynchronicity.

Because of this, there is an obvious need to keep users informed about what is going on within the system.

![Don't just wait until the events bite. (Photo by James Wheeler)](./fishing.jpeg)

## The Problem

Naturally in an asynchronous system, we can only provide the user with direct feedback for direct requests (e.g. when a request resource is invalid). To check if some event has occurred in the background, the user would need to query the API every time.

This can be solved by webhooks — instead of having the user query our service for changes, we can notify the user. In Firebase, asynchronous work usually happens in Cloud Functions. Easily enough, at the end of whatever we do in a Cloud Function, we can just fire the user's webhook by making a request to an URL he provided with a relevant payload (e.g. the entity that has been created in the background).

This does not scale, though. If the webhook response takes long (even with a reasonable timeout) this setup will prolong the processing time of the Cloud Function. It also means that we would be tying two systems (the asynchronous work and the webhook) together that should be independent. Also, this setup provides no option to deal with retries for failed webhook calls — no state is persisted, which means there is no easy way to retry failed requests or log errors.

Also, there is a different kind of information that can be produced asynchronously: Errors. These are the kind of events that developers receive email notifications about and that need to be addressed by the developer (e.g. by changing a configuration). For these there is usually no webhook implemented because they are supposed to not occur again after the initial cause is fixed. They too come with some form of payload to help with debugging. The user often wants access to these kinds of errors through a UI to check past issues and have a single source of truth and not just email notifications.

So here we are, asynchronously generating both recurring system information and occasional errors. How can we build a robust architecture that takes both of them into account?

## A Solution

We can come up with a solution by looking at the commonalities of the two types of information we generate. By abstracting the underlying system it becomes obvious that both are „events“ — something that has occurred in our system, be it an error or some finished task. Let's model the architecture around the concept of events.

### Step 1: Plan how to structure the data

Create a collection `events` within Firestore. Each of the future documents should have the following fields:
- `name`: a string used for identification purposes, e.g. „user.processed“
- `payload`: a map used to store arbitrary data of the event
- `isCritical`: a boolean to indicate that this is an event that is not supposed to happen (also called „Error“)
- `createdAt`: a timestamp used for sorting and display

> The `isCritical` field could alternatively be named „level“ and store an integer according to the widely used [syslog severity levels](https://tools.ietf.org/html/rfc5424#section-6.2.1) („debug“, „informational“, „warning“, „error“, …). This way we could allow the user to request events with certain levels, e.g. utilising the „in“ query operator. In our case we did not expect a future need for levels so we settled with a simple `isCritical` flag.

### Step 2: Store the events

Whenever an asynchronous action in a Cloud Function finishes, let the Function create an event in the `events` collection.

I would recommend creating a separate module that takes care of persisting events. Each event can be represented by a class that knows about the details of the event type (e.g. how to format its payload). This is to follow the [Single Responsibility Principle](/the-s-in-solid).

Let's say our system can host multiple accounts. Upon creation of a user within the account we do some processing. When done, we want to store the event of finishing this processing. An example Cloud Function could look like this:

```ts
const processUser = functions.firestore
  .document("accounts/{accountId}/users/{userId}")
  .onCreate(async (snapshot, context) => {
    await processTheUser(snapshot);
    const event = new UserProcessed(snapshot);
    await new Account(context.params.accountId).addEvent(event);
  })
```

The `UserProcessed` class (and its interface) might look like this:

```ts
interface Event {
  public isCritical(): boolean;
  public getName(): string;
  public getPayload(): object;
}

class UserProcessed implements Event {
  constructor(protected user: firestore.DocumentSnapshot) {}

  public isCritical() {
    return true;
  }

  public getName() {
    return "user.processed";
  }

  public getPayload() {
    return {
      id: this.user.id,
      name: this.user.data().name,
      email: this.user.data().email
    };
  }
}
```

The Account class that is used to store the event might look like this:

```ts
class Account {
  constructor(protected accountId: string) {}

  public async addEvent(event: Event) {
    return firestore()
      .collection("accounts")
      .doc(this.accountId)
      .collection("events")
      .add({
        name: event.getName(),
        payload: event.getPayload(),
        isCritical: event.isCritical(),
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
  }
}
```

The naming convention we used in this case follows the syntax `{entity}.{action}`. It is worth spending time on finding a clean syntax in order to avoid cluttering your database and to help future developers and users to understand how the system works. Segment has an [excellent guide on naming events](https://segment.com/academy/collecting-data/naming-conventions-for-clean-data/).

The example above deals with the sort of information a user would create a webhook for — a recurring system event. What would the Cloud Function look like if we want to store an error event? Like this:

```ts
const processUser = functions.firestore
  .document("accounts/{accountId}/users/{userId}")
  .onCreate(async (snapshot, context) => {
    try {
      await processTheUser(snapshot);
      const event = new UserProcessed(snapshot);
      await new Account(context.params.accountId).addEvent(event);
    } catch (error) {
      const event = new UserProcessingFailed(snapshot, error);
      await new Account(context.params.accountId).addEvent(event);
    }
  })
```

Notice how we pass the error into the event. This way the event class can check if it recognizes the error and put a helpful message into the payload.

Storing events like this will often lead to duplicate data that is stored not only in its original place but also in the event document. In the example, the data of the created user is now sitting both in the user and the event doc. This is alright since the event represents a snapshot of the data at this time and Firestore as a non-relational database is fine with duplicate data (Fireship has [a great video about that](https://youtu.be/35RlydUf6xo?t=53)).

> However, be aware to consider this when thinking about privacy: in case you handle personal data, you might need a system that keeps track of where you store a user's data and be able to retrieve, anonymize or delete it. By storing duplicate data in the event, you need to keep track of an additional data location. The firebase team provides a [„Delete User Data“ extension](https://firebase.google.com/products/extensions/delete-user-data) just for dealing with that.

### Step 3: Display the events

In your UI you can display and access the `events` collection like usual. You might want to include a switch to filter for only critical events (based on the `isCritical` flag). If you are using the Firebase libraries this will also give you realtime updates when new events are created. This can greatly enhance the developer experience because it allows to „watch“ how your app is working in the background.

When you first filter based on `isCritical` and sort on `createdAt`, Firestore will ask you to create a composite index for that. Just follow the instructions on the link they provide with that and you are good to go.

### Step 4: Fire webhooks for new events

Thanks to the fact that you have a concrete list of event types now, you can just pipe them through a webhook system. This way the user can decide for which events he wants to set up a webhook and if he wants to listen for error events.

I assume that you already have a way to store webhooks with their URL and the event name they are supposed to be fired on. In order to fire the correct webhooks, create a Cloud Function that is invoked upon the creation of new event documents. In the Function, query for all webhooks that are supposed to be fired for the newly created event (based on its name). The request to the webhook URL can be made with the event data as request body, giving the developer a consistent format to work with for all events.

You should also think about retrying failed webhook request, ideally giving the user time to fix the problem until the webhook is fired again ([Exponential Backoff](https://en.wikipedia.org/wiki/Exponential_backoff)). Building such a system is outside the scope of this article, but in general, one could go about this by storing a request attempt in a subcollection on the webhook, making it available for retry later if it fails.

### Step 5: Notify the user of critical events

In the same Cloud Function that fires the webhook, you can check if the event has the `isCritical` flag set. If it does, you might want to notify the consumer of the issue by email or even push notification. Through the API of a service like Sendgrid or Mailgun, one can send an email template filled with the relevant event details.

And that's it. By abstracting the initial problem one is able to build a robust system that plays on the strengths of the Firebase ecosystem. We are now able to persist different types of events and notify the user about them through webhooks or the UI. Let me know if you have any questions or feedback about the proposed solution.
