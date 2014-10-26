Circle Flock
============

A dynamic [Meteor](https://www.meteor.com/main) based project that helps users find other users to follow.

Currently only supports Twitter.


Currently live thanks to Meteor's hosting on [http://circleflock.meteor.com/](http://circleflock.meteor.com/).

# About Meteor

Meteor is an open-source platform for building top-quality web apps in a fraction of the time, whether you're an expert developer or just getting started.

# About Circle Flock

The goal of Circle Flock is to allow people to keep up to date about the topics they care about without having to wade through the immense data available to them.  We plan to aggregate social data to show users what they want to see.

# Dependencies

Disable the autopublish dependency.  Leaving it on will cause your web browser to lag or crash due to the amount of data being pulled in from Twitter.

```cmd
meteor remove autopublish
```