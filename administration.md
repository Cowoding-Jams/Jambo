# Working Area
## General Stuff
Language, core idea:
- Javascript, Discord.js
- tendency towards using slash commands
  Wilson:
  - it would be a pain to support both slash and text commands
  - discord no longer likes text commands and want to remove message content for just text commands

Database ideas:
- enmap
- josh
- sql database?

Base ideas:
- Guidebot https://github.com/AnIdiotsGuide/guidebot (and guidebot class)
  - Simple to use, and modify. Has the basics for what you would want, args. flags and perms for commands, Has the base event handler, command handler and slash command handler (but slash commands are a bit weird.) Also by default includes a db for misc stuff so no setup needed.
- Sapphire https://www.sapphirejs.dev/
  - A well developed framework. A bit more on the complex side of things but has some nicer features, such as better args parsing (read quotes as one arg, arg types, read between x and y args), really nice to use flags (use anywhere, provide data options, have multiple of the same name, disable or enable on a per command basis), custimizable perm system. Handles events and slash (next branch only rn) and chat commands. Code can get a bit complex and might have to install a bunch of modules
- iislander https://github.com/iiow/iislander
  - the event handling is a bit funky, but nothing crazy, Command handling is mediocre (arg parsing only) and no slash command support at all (need to write it yourself).

Name ideas:
- Steve
- Ted
- KVN

Hosting ideas:
- Lucys magical thingies

## Functionality
### Basics 
- Input system
- Output system (Embeds)
- File structure

### Poll system 
- handling Input (commands, new proposals for the polls)
- creating polls, timing polls, limiting the number of votes
- publishing polls and evaluating them 

### Roles
- color roles (roles from reactions)
- branding roles (roles for programming language, systems etc. - also by reactions)

### Channels 
- creating result channels 
- moving them to the results archive

### Command examples/ideas (slash command)
- /template
  sub commands
  - 1 <value(s)> --> <reply>
  - 2 <value(s)> --> <reply>
- /proposal 
  sub commands
  - add <title> <description> <sources> 
  - remove <title>
  - list --> returns a list of all proposals
