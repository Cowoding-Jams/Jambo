# Contributing

## Suggestions & Issues

To suggest features for the bot use the GitHub issue tracker.

If you believe to have found a bug in the code and think it's harmless, report it through the GitHub issue tracker.  
If you think that this bug might be harmful or exploitable, follow the instructions of the security file.

## Pull requests

Contributors are welcome. Feel free to fork and submit a pull request for review.

1. Fork & clone
1. Create a new branch
1. Code away
1. Test your changes
1. Commit & push
1. Submit the pull request
1. Act according to reviews

## Guidelines

To make sure that your pull request gets accepted you need to follow some guidelines.  
This is not everything but a list of basic things. Think before you do.

- Follow to modular style of the project
- Follow "best practices" for typescript which are enforced by eslint
- Write understandable code
- Make features easy to use
- Make bugfixes simple and effective

## Running the bot

Fill in all available environmental variables listed in the [`.env_sample`](.env_sample) file in project root to your
own [.env](.env) file. To run the bot, either do `npm run start` in the console.

### Development

1. Install [Node.JS](https://nodejs.org/en/download/) and [Yarn](https://classic.yarnpkg.com/en/docs/install) if don't
   have them already
1. Create an application at [Discord Developer Portal](https://discord.com/developers/applications)
1. Create a bot for the application
1. Copy the bot's token and enable the server members intent
1. Fill in `.env` with the help of `.env.example` or use a file provided by another contributor
1. Install dependencies with `yarn`
1. Run with `yarn start`
