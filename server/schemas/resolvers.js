const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('Please log in')
        }
    },

    Mutation: {
        addUser: async (parent, args) => {
            const newUser = await User.create(args);
            const token = signToken(newUser)
            return { token, newUser }
        },

        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('No user with this email found!');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect password!');
            }

            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const saveUserBook = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: bookData } },
                    { new: true }
                );

                return saveUserBook;
            }

            throw new AuthenticationError('Please log in');
        },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const removeUserBook = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );

                return removeUserBook;
            }

            throw new AuthenticationError('Please log in');
        },
    }
}

module.exports = resolvers;