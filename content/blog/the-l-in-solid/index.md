---
title: The L in SOLID Software Architecture — Liskov Substitution Principle
date: 2020-06-04T18:00:00Z
description: L stands for Liskov Substitution Principle and encourages architectures that allow exchanging base classes for their subclasses without breaking things.
image: ./russian-doll.jpg
---

„L“ stands for Liskov Substitution Principle and encourages architectures that allow exchanging base classes for their subclasses without breaking things.

Inheritance is a powerful feature in software architecture, especially given the ability to override the behaviour of a base class. If you want to, you can extend a basic class and change its behaviour completely.

![Inheritance is kind of like a Russian doll (Photo by Iza Gawrych)](./russian-doll.jpg)

This leads to the question of when inheritance should actually be used. Why not use composition instead? How do you know if you should implement a new feature by extending something that already exists and just modify its behaviour or by choosing a completely different pattern?

Barbara Liskov answered this question in [a 1987 keynote](https://dl.acm.org/doi/10.1145/62139.62141) and later formalized it in [another paper in 1994](https://dl.acm.org/doi/10.1145/197320.197383):

> *Subtype Requirement*: Let **ϕ(x)** be a property provable about objects **x** of type **T**. Then **ϕ(y)** should be true for objects **y** of type **S** where **S** is a subtype of **T**.

This statement is now known as the „Liskov Substitution Principle” and can be put into words slightly less formal:

When using a base class **T**, one should be able to exchange this base class **T** with any subclass **S** (that inherits from **T**) and expect the same behaviour **ϕ**.

Let's consider a simple example in which we want to send a notification email for a given event. We want to be able to either send a normal email or an email for subscribed users which contains additional information about the subscription. For now, we always send a normal email:

`gist:richartkeil/bc283330fc364abcf81a7dfa3713e940`

As you can see, we have an `EmailBroadcaster` as well as a `SubscriptionEmailBroadcaster` who inherits from the former — he does basically the same thing, but a little bit more, so that calls for inheritance, right?

Well, suppose now we want to switch from using our basic `EmailBroadcaster` to our new `SubscriptionEmailBroadcaster`. Following the logic from above, we should be able to just exchange the old `EmailBroadcaster` with the `SubscriptionEmailBroadcaster`, because it inherits from it. It worked with the parent class, so it should just work™ with the child class as well. After all „it does the same thing, but a little bit more”, right?

If you would try to change it, you would find that it actually does not work because compilation fails. In `onAccountCreated` we pass either a `User` or a `SubscribedUser` (latter could be a subclass of the former) to the broadcast method. However, the new `SubscriptionEmailBroadcaster` only takes a `SubscribedUser`.

By modelling our architecture this way, we broke the Liskov Substitution Principle, more specifically the first of the following requirements that should be fulfilled to avoid issues like this:

### 1. Do no strengthen pre-conditions in subclasses.

**The parameter types of sub-class methods should match or be more abstract than the parameter types of base-class methods.** In our case, `SubscribedUser` is a subtype of `User` — because we require a more specific (instead of abstract) type, we strengthen the pre-conditions.

For example in a simpler case, this rule would be broken by expecting only positive numbers in a subclass method, while the overridden base class method accepts both positive and negative numbers.

The subclass should always be more liberal in what it accepts, not stricter.

### 2. Do not weaken post-conditions in subclasses.

**The return type of subclass methods should match or be a subtype of the return type of base class methods.** This also applies to exceptions: Thrown exceptions of subclass methods should match or be a subtype of thrown exception of base class methods. This is to avoid introducing exceptions that would not be caught by code that relies on the base class.

The subclass should always be more strict in what it returns or throws, not more liberal.

So, how could we fix our example? There are basically two ways: Reversing our inheritance structure or using composition.

The first option would mean that the `SubscriptionEmailBroadcaster` becomes the base class and `EmailBroadcaster` inherits from it. One could rename the `SubscriptionEmailBroadcaster` to `EmailBroadcaster` and the former `EmailBroadcaster` to `AnonymousEmailBroadcaster` to reflect that it does not require a subscription:

`gist:richartkeil/c590e519ba2efac148a0a68b2cb7ac5b`

When starting out with the `EmailBroadcaster` we could now exchange it for the `AnonymousEmailBroadcaster` without issues, because it actually reflects inherited behaviour — the subclass can do anything that its base class can do (in terms of its contract).

Following the second option of using composition instead of inheritance could be implemented by using one interface that independent broadcasters adhere to:

`gist:richartkeil/3e20c422bb804b8fb832f1e5bab4805b`

In this case, the compiler would also complain if we just exchange `AnonymousEmailBroadcaster` with `SubscriptionEmailBroadcaster` (because of the different constructors). However, it is much less of a problem because we have no expectation that the new class should just work-after all, it has no relationship to the other class except implementing the same interface.

The Liskov Substitution Principle is in theory very easy to understand: Just make sure you can exchange your base classes for their subclasses without running into issues.

However, I personally find it much harder to spot in practice. My guess is that this is due to intuitively interpreting the word „inheritance” as „use of common behaviour with modification”.

To make it easier to spot violations I propose to interpret „inheritance” as „use of common behaviour with extension”.

This way we always keep in mind that a subclass builds on top of the behaviour of a base class and does not try to change the initial behaviour.

---

This article was especially interesting to write because it required some time to come up with a fitting example along the lines of the Event-Notification example of the [Single Responsibility](/the-s-in-solid) and [Open Closed Principle](/the-o-in-solid) post.
