---
title: How to build a team-based user management system with Firebase
date: 2020-10-01T18:00:00Z
description: A guide that explains general ideas and patterns behind a multi-tenant system using Firestore, Security Rules and Cloud Functions.
image: ./beach.jpg
writeTime: 5.97h
category: tech
canonical: https://medium.com/firebase-developers/how-to-build-a-team-based-user-management-system-with-firebase-6a9a6e5c740d
---

The Firebase ecosystem offers quite a lot of advice on how to structure your data within Firestore — don't normalize, use subcollections and so on. However, most of these tutorials only cover cases for scenarios where there are many independent users that create or change data. There is little advice on how to build a team-based system, where users are grouped into accounts or tenants.

In this article, I'm going to share the setup I thought of while building such a system. I will focus mainly on the general architecture and don't go into too much detail of the implementation. Feel free to reach out if you have questions concerning that.

![Teams. (Original photo by Margarida CSilva)](./beach.jpg)

# The challenge: Multiple teams with many users

The pattern is usually similar across different use-cases: a subject should be able to be a member of multiple groups. The subject can be a user or player, while the group is usually an account, tenant, team or room. To keep things simple I'm going to stick with "user" and "team" — just know that the principle can be applied to all of the mentioned.

A system where users are members of teams usually comes with the following requirements:
- one user can be a member of many teams
- a user can have different roles (permissions) in different teams
- users can switch their currently active team

# The solution: Teams, Memberships and Users

## Firestore architecture

When structuring data in Firestore we want to optimize for reads. So all the data we plan to retrieve in the future should be reachable through a single query. Let's list what queries should be possible:

- Get all users of a given team.
- Get all the teams a specified user is a member of.
- Get the current team of a given user.

Based on that I propose the following structure. Setup a `users` collection where every document represents one user. This is basically a mirror of the Firebase Authentication Database, so when a new user signs up you should create an entry in this collection. This way you can later attach additional data that you wouldn't be able to store in the Auth database (this approach is even [recommended by the official docs](https://firebase.google.com/docs/auth/users#user_properties)).

Setup a `teams` collection where every document represents one team. It can contain all data that is scoped to that team — e.g. the name of the team, creation date or subcollections of other data.

One of these subcollections of a `teams` document will be a collection called `memberships`. Every document in this collection represents a user as a member of the team. It will contain data specific for this membership (e.g. role or permission), but also a reference field to the user and duplicated data from the user and the team (more on that later).

The membership document should always have the same ID as the user it represents — this will prevent the same user from joining a team twice and come in handy when we set up security rules.

In summary, the architecture should look like this:

- `teams` collection, one doc contains:
  - ... team data ...
  - `memberships` collection, one doc contains:
    - role or permission field
    - reference field `user` to the correct document in the `users` collection
    - ... duplicated team data ...
    - ... duplicated user data ...
- `users` collection, one doc contains:
  - reference field `currentTeam` to the active team of the user
  - ... user data ...

Given this structure, we can already fulfill the **first planned query: "Get all users of a team"**. If we have a team, we can just query the memberships collection to get a reference to each user.
In most cases, we probably want to display a list of all team members with their names, emails and roles. So in order to not make a second query to the `users` collection for each retrieved membership, we also store the user details we need (eg. name and email) on the membership. Later more on how to keep this data in sync with the original user.

The **second planned query "Get all teams a user is a member of"** is a little trickier. How can we access the membership subcollections if we don't know their parent team document (or don't have access to it)? The answer is "Collection Group Queries".

Collection Group Queries allow retrieving documents from collections that might be nested within other documents, which is exactly what we want for our memberships. In order to use them you need to create a specific index for the `memberships` collection — just [follow the docs](https://firebase.google.com/docs/firestore/query-data/queries#collection-group-query) to do that. The actual query will be based on the `user` field of the membership where we store a reference to the user. It is going to look like `firestore().collectionGroup("memberships").where("user", "==", currentUserRef).get()`.

Similar to the first case, we want to display specific data when showing a list of memberships of a given user. Usually, this means the name of the teams, which is why we store the team name not only on the team doc itself but also on each of its memberships. This way we can avoid additional queries for each membership of a user.

The **last planned query is "Get the current team of a given user"**. This one is easy as we store a reference to the currently active team in the reference field "currentTeam" on each document of the `users` collection. So we can just access the team through that.

## Keeping things in sync

As mentioned above we store some user and team details not only on their respective documents but also on the membership doc that links them. In order to keep this data up-to-date, we can leverage [Cloud Functions](https://firebase.google.com/docs/functions).

In my setup, I used two functions: one that is triggered on an update of a user document and the other on an update of a team document. The user function will query all memberships of the specific user as described above and update data as necessary (e.g. a changed name or email). The team function will query all memberships in its subcollection and also update corresponding fields (e.g. the team name).

## Security first

When dealing with users and teams we certainly want to make sure that only members of a team have access to its data. We are going to setup up Security Rules in the default "Locked Mode" where access is generally denied and then add exceptions step by step. Also notice that we use [version 2](https://firebase.google.com/docs/firestore/security/get-started#security_rules_version_2) of Security Rules in order to allow Collection Group Queries later on.

```
rules_version = '2'
service cloud.firestore {
  match /databases/{database}/documents {
    match /teams/{teamId} {}
  }
}
```

First, we want to **allow authenticated users access to a team (read, update, create) only if they are a member**. For that, we can write a function that checks if the current user is a member given the ID of the team. It will make an `exists` query to check if there is a membership with the ID of the currently authenticated user. Remember that memberships should have the same ID as the user they represent.

```
rules_version = '2'
service cloud.firestore {
  match /databases/{database}/documents {
    function hasAccessToTeam(teamId) {
      return exists(/databases/$(database)/documents/teams/$(teamId)/memberships/$(request.auth.uid))
    }

    match /teams/{teamId} {
      // Allow authenticated users to create new teams.
      allow create: if
        request.auth != null

      // Allow access to the team doc.
      allow get, update: if
        request.auth != null &&
        hasAccessToTeam(teamId)

      // Allow read access to all subcollections of the team doc.
      match /{subcollection}/{document=**} {
        allow read: if
          request.auth != null &&
          hasAccessToTeam(teamId)
      }
    }
  }
}
```

This function can now be used in all the places where we want to restrict access to team members. With this setup it is also easy to **support access to certain documents based on the user's role** that we store on the membership. In this case, the function definition would look like this:

```
function hasAccessToTeam(teamId, role) {
  return get(/databases/$(database)/documents/teams/$(teamId)/memberships/$(request.auth.uid)).data.role == role
}
```

Now, we also want **authenticated users to be able to query all their memberships**. For that, we need to allow access to our Collection Group:

```
rules_version = '2'
service cloud.firestore {
  match /databases/{database}/documents {
    ... previous rules ...

    function isReferenceTo(field, path) {
      return path('/databases/(default)/documents' + path) == field
    }

    // Allow access to memberships.
    match /{document=**}/memberships/{userId} {
      allow read: if
        request.auth != null &&
        isReferenceTo(resource.data.user, "/users/" + request.auth.uid)
    }
  }
}
```

Here we use a helper function `isReferenceTo` which checks if the document we try to access has a reference to the currently authenticated user. This makes sure that no access will be granted to "list all existing memberships" kind of queries.

Now, last but not least, **a newly signed up user should be able to create his own team**. This is supported by our current rules, however, after creating the account the user would have no access because he is not yet a member of it. So what we want is to allow users to create memberships, but only if
- they create the membership for themselves (the membership ID is the user ID and the reference points to their own user doc) and
- they are the creator of the team (giving them kind of an "owner" role).

We can achieve this by inserting the following at the end of the match team block:

```
match /memberships/{membershipId} {
  function hasCreatedTeam(teamId) {
    return isReferenceTo(
      get(/databases/$(database)/documents/teams/$(teamId)).data.createdBy,
      "/users/" + request.auth.uid
    )
  }

  allow create: if
    request.auth != null &&
    membershipId == request.auth.uid &&
    isReferenceTo(request.resource.data.user, "/users/" + request.auth.uid) &&
    hasCreatedTeam(teamId)
}
```

## Summary

In order to build a robust team-based user management system in Firebase, you should store all memberships of a team within a subcollection of this team.

Each membership document contains duplicated data from the team (eg. name) and its user (eg. name, email). This data is kept in sync by two Cloud Functions that monitor the team and user documents for updates.

A membership document also contains a reference to its user document and a role identifier if necessary.

All memberships are made accessible through a Collection Group Index so that one can retrieve the memberships of a user with a simple where-query.

To restrict access to documents based on team membership you should check for the presence of a membership document within the concerned team.

# Other questions

## What about invitations?

Often a requirement for a multi-team system is to have some way to invite and onboard new members. I won't go into details about this here, but generally speaking, invitations can be modelled through an `invations` collection on the team, representing the "right" for a yet unknown user to join. So the existence of an invitation can be used as a way to determine that a user with a specific email can create a membership for himself on a team.

## Shouldn't the `membership` collection be on the same level as the `users` and `teams` collection?

If you were to go this way, the security rules to allow querying all memberships of a team would get complex. In order to allow such a query you need to ensure two things: That the user making the request is allowed to do so (means he should be a member of the team) and that the query only returns memberships of that team. This is only possible by comparing the `team` reference field on the membership doc with the `currentTeam` reference field on the current user (for which a doc retrieval with `get()` is necessary). Doing this however would allow a user who managed to change his `currentTeam` field illegally access to the team it references because we moved the "source of truth" for team membership from the `memberships` collection partly to the `user` document. Hence I do not recommend this approach.

## Can't I use the JWT functionality to apply roles to users?

You can, and [there are tutorials for that](https://www.youtube.com/watch?v=3hj_r_N0qMs). However, most of them do not touch the topic of multi-tenant systems. In such a scenario it's often required to have a nice interface for the user so he can manage permissions, members and so on. Because of that, modelling the authorization and team memberships through the database is often more convenient.

## Is there a way to avoid additional security rules for users creating new teams?

Yes! Adding the creator of a team as the first member could also be done through a Cloud Function — there would be no Security Rule required in this case. However, this would introduce an asynchronous part where a user might have to wait for the Cloud Function to add him as a member before he can start accessing the team. If this is not an issue, using a Cloud Function is probably the easier way to do this.

---

I hope that sharing my setup of a multiple-team system helped you understand the core ideas and concepts. Let me know if you have any questions!
