const { Class } = require("meteor/jagi:astronomy");

// var user = new User();
// user.save({
//   simulation: false // Insert only on the server.
// });

// server.js
// Meteor.publish('posts', function() {
//   Post.find({}, {fields: {title: 1}});
// });

// bad_client.js
// Meteor.subscribe('posts');
// const post = Post.findOne();
// post.name = 'New name';
// post.getModifier(); // {$set: {name: 'New name', tags: []}} - it will override tags
// post.save();

// good_client.js
// Meteor.subscribe('posts');
// const post = Post.findOne({}, {defaults: false});
// post.name = 'New name';
// post.getModifier(); // {$set: {name: 'New name'}} - it will not override tags
// post.save();

const UserProfile = Class.create({
  name: "UserProfile",
  fields: {
    username: String,
    /* Any other fields you want to be published to the client */
  },
});

const User = Class.create({
  name: "User",
  collection: Meteor.users,
  fields: {
    createdAt: Date,
    emails: {
      type: [Object],
      default: (): string[] => {
        return [];
      },
    },
    profile: {
      type: UserProfile,
      default: () => {
        return {};
      },
    },
  },
});

if (Meteor.isServer) {
  User.extend({
    fields: {
      services: Object,
    },
  });
}